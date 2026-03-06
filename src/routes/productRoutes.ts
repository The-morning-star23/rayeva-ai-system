import { Router, Request, Response } from 'express';
import { generateProductMetadata } from '../services/aiService';
import Product from '../models/Product';

const router = Router();

router.post('/auto-categorize', async (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: "Name and description are required" });
  }

  try {
    // 1. Get AI Suggestions
    const metadata = await generateProductMetadata(name, description);

    // 2. Save to Database
    const newProduct = new Product({
      name,
      description,
      ...metadata
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product categorized and saved successfully",
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;