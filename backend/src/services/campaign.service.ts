
import { PrismaClient, Campaign, CampaignStatus } from '@prisma/client';
import { botSchedulerQueue } from '../queues';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class CampaignService {
  
  async findAll(organizationId: string) {
    return prisma.campaign.findMany({
      where: { organizationId },
      include: {
        bots: true,
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async create(organizationId: string, data: any) {
    // 1. Validation
    if (!data.name || !data.objective) {
      throw new Error("Missing required campaign fields");
    }

    // 2. Create DB Record
    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        objective: data.objective,
        status: CampaignStatus.Draft,
        startDate: new Date(data.startDate),
        budgetConfig: data.budget,
        organizationId: organizationId,
        bots: data.botIds ? {
          connect: data.botIds.map((id: string) => ({ id }))
        } : undefined
      }
    });

    // 3. Trigger Initial Scheduler Job if Active (or set to active immediately)
    // Note: Usually campaigns start via a separate 'Start' action, but for MVP we might auto-trigger
    if (campaign.status === CampaignStatus.Active) {
      await this.triggerCampaignCycle(organizationId, campaign.id);
    }

    return campaign;
  }

  async triggerCampaignCycle(organizationId: string, campaignId: string) {
    // Dispatch Job
    await botSchedulerQueue.add(
      'manual-trigger',
      {
        tenantId: organizationId,
        campaignId,
        triggerSource: 'MANUAL',
        traceId: uuidv4()
      }
    );
  }

  async getIntelligence(organizationId: string, campaignId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, organizationId }
    });

    if (!campaign) throw new Error('Campaign not found');

    return {
      pacing: this.calculatePacing(campaign),
      metrics: campaign.metricsJson || { impressions: 0, clicks: 0, spent: 0 }
    };
  }

  private calculatePacing(campaign: any) {
    return {
      status: 'OPTIMAL',
      burnRate: 0.85,
      remainingDays: 12
    };
  }
}
