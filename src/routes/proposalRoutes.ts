import { Router, Request, Response } from 'express';
import { generateB2BProposal } from '../services/aiService';
import Proposal from '../models/Proposal';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  const { clientName, budget, industry } = req.body;

  if (!clientName || !budget || !industry) {
    return res.status(400).json({ error: "clientName, budget, and industry are required" });
  }

  try {
    // 1. Get AI Structured Proposal
    const proposalData = await generateB2BProposal(clientName, budget, industry);

    // 2. Save to Database
    const newProposal = new Proposal({
      clientName,
      totalBudget: budget,
      allocatedBudget: proposalData.allocatedBudget,
      productMix: proposalData.productMix,
      impactSummary: proposalData.impactSummary
    });

    await newProposal.save();

    res.status(201).json({
      message: "B2B Proposal generated successfully",
      proposal: newProposal
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;