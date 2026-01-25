
import { CampaignService } from '../../modules/campaign/campaign.service';
const service = new CampaignService();

export const getCampaigns = async (req: any, res: any) => {
  try {
    const campaigns = await service.findAll(req.organizationId!);
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCampaign = async (req: any, res: any) => {
  try {
    const campaign = await service.create(req.organizationId!, req.body);
    res.status(201).json(campaign);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
