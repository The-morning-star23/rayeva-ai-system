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
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    generationConfig: { responseMimeType: "application/json" } 
  });

  // Updated prompt with a strict, concrete example to prevent syntax errors
  const prompt = `
    You are an AI sales assistant for a sustainable B2B e-commerce platform.
    Generate a product proposal for a client.
    
    Client Name: ${clientName}
    Industry: ${industry}
    Maximum Budget: $${budget}

    Create a sustainable product mix. The total cost of all products MUST be less than or equal to the maximum budget.
    
    Return STRICTLY valid JSON. Do not include markdown formatting, comments, or trailing commas. 
    Use this EXACT structure as your template:
    {
      "allocatedBudget": 450,
      "productMix": [
        {
          "name": "Recycled Aluminum Pen",
          "quantity": 100,
          "unitCost": 2.50,
          "totalCost": 250
        },
        {
          "name": "Bamboo Desk Organizer",
          "quantity": 10,
          "unitCost": 20,
          "totalCost": 200
        }
      ],
      "impactSummary": "By choosing these sustainable alternatives, you saved an estimated 10kg of plastic."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // Clean up any rogue markdown just in case
    responseText = responseText.replace(/```json/gi, "").replace(/```/gi, "").trim();

    // Log the AI interaction
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