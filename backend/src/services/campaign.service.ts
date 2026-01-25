
import { mockDb } from '../db/mockDb';
import { v4 as uuidv4 } from 'uuid';

export class CampaignService {
  
  async findAll(organizationId: string) {
    return mockDb.campaigns;
  }

  async create(organizationId: string, data: any) {
    const newCampaign = {
      id: uuidv4(),
      name: data.name,
      objective: data.objective,
      status: 'Active',
      startDate: new Date(data.startDate),
      budgetConfig: data.budget,
      bots: [] // Simplified for mock
    };
    mockDb.campaigns.unshift(newCampaign);
    return newCampaign;
  }

  async getIntelligence(organizationId: string, campaignId: string) {
    return {
      pacing: {
        status: 'OPTIMAL',
        burnRate: 0.85,
        remainingDays: 12
      },
      metrics: { impressions: 1500, clicks: 45, spent: 120 }
    };
  }
}
