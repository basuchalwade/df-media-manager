
type Task = () => Promise<void>;

export class MockQueue {
  private intervalId: any = null;
  private tasks: Task[] = [];

  constructor(private intervalMs: number = 5000) {}

  register(task: Task) {
    this.tasks.push(task);
  }

  start() {
    console.log(`[Queue] Starting queue processor (${this.intervalMs}ms interval)...`);
    this.intervalId = setInterval(async () => {
      console.log('[Queue] Processing cycle...');
      for (const task of this.tasks) {
        try {
          await task();
        } catch (error) {
          console.error('[Queue] Task failed:', error);
        }
      }
    }, this.intervalMs);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
