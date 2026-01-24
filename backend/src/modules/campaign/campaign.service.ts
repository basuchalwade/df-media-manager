
import { PrismaClient, Campaign, CampaignStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class CampaignService {
  
  /**
   * List all campaigns for a specific tenant.
   * STRICTLY FILTERED by organizationId.
   */
  async findAll(organizationId: string) {
    return prisma.campaign.findMany({
      where: { organizationId },
      include: {
        bots: true, // Include linked bots
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async create(organizationId: string, data: any) {
    // 1. Validate Organization Quotas (Optional Phase 2)
    
    // 2. Create Campaign
    return prisma.campaign.create({
      data: {
        name: data.name,
        objective: data.objective,
        status: CampaignStatus.Draft,
        startDate: new Date(data.startDate),
        budgetConfig: data.budget, // JSONB
        organizationId: organizationId,
        // Connect existing bots if provided
        bots: data.botIds ? {
          connect: data.botIds.map((id: string) => ({ id }))
        } : undefined
      }
    });
  }

  async getMetrics(organizationId: string, campaignId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, organizationId }
    });

    if (!campaign) throw new Error('Campaign not found');

    // In a real scenario, this aggregates from a 'CampaignMetric' table
    // For P1-B, we return the stored JSON snapshots or empty defaults
    return campaign.metricsJson || { impressions: 0, clicks: 0, spent: 0 };
  }
}
