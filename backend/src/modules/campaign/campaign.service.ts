
import { mockDb } from '../../db/mockDb';
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
      bots: [] 
    };
    mockDb.campaigns.unshift(newCampaign);
    return newCampaign;
  }
}
