import { GoogleGenerativeAI } from "@google/generative-ai";
import AILog from "../models/AILog";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Predefined categories as per requirements
const CATEGORIES = ["Packaging", "Stationery", "Cleaning Supplies", "Kitchenware", "Apparel"];

export const generateProductMetadata = async (productName: string, description: string) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" } // Force JSON output
  });

  const prompt = `
    Analyze the following product for a sustainable B2B e-commerce platform:
    Product Name: ${productName}
    Description: ${description}

    Return a JSON object with the following structure:
    {
      "category": "Pick one from: ${CATEGORIES.join(", ")}",
      "subCategory": "A relevant sub-category",
      "tags": ["5 to 10 SEO optimized tags"],
      "sustainabilityFilters": ["e.g., plastic-free, compostable, vegan, recycled, etc."]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Log the AI interaction as required by the assignment
    await AILog.create({
      module: "Auto-Category Generator",
      prompt: prompt,
      response: responseText
    });

    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate product metadata");
  }
};

export const generateB2BProposal = async (clientName: string, budget: number, industry: string) => {
  // Use the exact same model string that worked for you in Module 1
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    generationConfig: { responseMimeType: "application/json" } 
  });

  const prompt = `
    You are an AI sales assistant for a sustainable B2B e-commerce platform.
    Generate a product proposal for a client.
    
    Client Name: ${clientName}
    Industry: ${industry}
    Maximum Budget: $${budget}

    Create a sustainable product mix. The total cost of all products MUST be less than or equal to the maximum budget.
    
    Return STRICTLY a JSON object with this structure:
    {
      "allocatedBudget": <number representing the total sum of all product costs>,
      "productMix": [
        {
          "name": "<Sustainable product name>",
          "quantity": <number>,
          "unitCost": <number>,
          "totalCost": <number, which is quantity * unitCost>
        }
      ],
      "impactSummary": "<A 2-sentence summary of the environmental impact of choosing these specific sustainable products>"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Log the AI interaction for the assignment requirements
    await AILog.create({
      module: "B2B Proposal Generator",
      prompt: prompt,
      response: responseText
    });

    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate B2B proposal");
  }
};