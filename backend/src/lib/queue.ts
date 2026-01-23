
import { Queue, QueueOptions, Worker, WorkerOptions, Processor } from 'bullmq';
import * as Prisma from '@prisma/client';

// Bypass TS error when client is not generated
const { PrismaClient } = Prisma as any;
const prisma = new PrismaClient();

const IS_SIMULATION = process.env.SIMULATION_MODE === 'true';
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const QUEUE_NAMES = {
  POST_PUBLISH: 'postPublishQueue',
  ENGAGEMENT: 'engagementQueue',
  GROWTH: 'growthQueue',
  FINDER: 'finderQueue',
};

// --- In-Memory Simulation Shim ---
class SimulationQueue {
  private name: string;
  private processor?: Processor;

  constructor(name: string) {
    this.name = name;
  }

  async add(name: string, data: any, opts?: any) {
    console.log(`[SIMULATION] Job added to ${this.name}: ${name}`);
    
    // Log to DB for visibility
    await prisma.jobQueue.create({
      data: {
        queueName: this.name,
        status: 'DELAYED',
        scheduledFor: opts?.delay ? new Date(Date.now() + opts.delay) : new Date(),
        payload: data,
        postId: data.postId
      }
    });

    // Determine execution time
    const delay = opts?.delay || 0;
    
    setTimeout(async () => {
      console.log(`[SIMULATION] Executing job ${name} on ${this.name}`);
      if (this.processor) {
        try {
          await this.processor({ name, data } as any);
          console.log(`[SIMULATION] Job ${name} completed`);
        } catch (e) {
          console.error(`[SIMULATION] Job ${name} failed`, e);
        }
      }
    }, delay);

    return { id: `sim-${Date.now()}`, name, data };
  }
}

class SimulationWorker {
  constructor(name: string, processor: Processor) {
    // Find the queue instance and attach the processor
    // In a real implementation, we'd use a global registry. 
    // For this mock, we assume the queue is instantiated in the same process (Backend in Sim mode).
    // Note: This shim mainly works if Backend and Worker logic are in same process or if we just execute immediately.
    
    // Actually, in Sim mode, the "Backend" does the scheduling via setTimeout. 
    // The "Worker" service might be idle or disabled in docker-compose, 
    // but here we allow defining processors that can be called by the shim.
    (globalThis as any)[`SIM_PROC_${name}`] = processor;
  }
}

// --- Factory ---

export const createQueue = (name: string): any => {
  if (IS_SIMULATION) {
    const q = new SimulationQueue(name);
    // Hook up processor if it exists (simulating shared memory for simplicity in this demo structure)
    q['processor'] = (globalThis as any)[`SIM_PROC_${name}`];
    return q;
  }
  return new Queue(name, { connection: REDIS_CONFIG });
};

export const createWorker = (name: string, processor: Processor): any => {
  if (IS_SIMULATION) {
    return new SimulationWorker(name, processor);
  }
  return new Worker(name, processor, { connection: REDIS_CONFIG });
};
