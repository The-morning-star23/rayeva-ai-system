# Rayeva – AI Systems Assignment

**Role:** Full Stack / AI Intern Applicant  
**Focus:** Applied AI for Sustainable B2B Commerce  

---

## 📑 Table of Contents
1. Project Overview
2. Tech Stack
3. Architecture & Separation of Concerns
4. Implemented Modules
5. AI Prompt Design Explanation
6. Future Modules (Roadmap)
7. Local Setup & Installation
8. Testing the APIs

---

## 🎯 Project Overview

This project implements a production-ready, AI-powered backend system designed to streamline B2B sustainable commerce workflows. Built with a robust Node.js, Express, and TypeScript architecture, it leverages Google's Gemini 2.5 Flash AI to automate catalog management and proposal generation while strictly enforcing structured JSON outputs and logging all AI interactions.

---

## ⚙️ Tech Stack

* **Backend Framework:** Node.js with Express.js
* **Language:** TypeScript
* **Database:** MongoDB (via Mongoose)
* **AI Provider:** Google Gemini API (`@google/generative-ai`)
* **Core Model:** `gemini-2.5-flash`

---

## 📐 Architecture & Separation of Concerns

The project follows a clean, modular architecture separating standard business routing from complex AI generation logic:

* **`/routes`**: Defines API endpoints and handles HTTP request/response cycles.
* **`/models`**: Contains Mongoose schemas (`Product`, `Proposal`, `AILog`) ensuring data integrity before database insertion.
* **`/services/aiService.ts`**: The dedicated AI engine. It isolates the `@google/generative-ai` SDK, securely manages the API key, constructs the prompts, and parses the LLM responses. This ensures standard business controllers remain lightweight and agnostic to the underlying AI implementation.

---

## 🚀 Implemented Modules

### Module 1: AI Auto-Category & Tag Generator

**Endpoint:** `POST /api/products/auto-categorize`

**Functionality:** Takes a raw product name and description and automatically categorizes it.

**Features:**
* Assigns a primary category strictly from a predefined business list.
* Generates optimized SEO tags and relevant sustainability filters (e.g., vegan, compostable).
* Returns structured JSON and saves the newly categorized product to the MongoDB `Product` collection.

---

### Module 2: AI B2B Proposal Generator

**Endpoint:** `POST /api/proposals/generate`

**Functionality:** Generates a tailored, sustainable product mix based on a client's specific budget and industry.

**Features:**
* LLM enforces mathematical constraints to ensure the `allocatedBudget` is less than or equal to the `totalBudget`.
* Calculates a cost breakdown (`quantity` * `unitCost` = `totalCost`).
* Generates a human-readable impact positioning summary.
* Returns structured JSON and saves to the MongoDB `Proposal` collection.

---

### 🛡️ Core Requirement: Mandatory AI Logging

To ensure transparency and traceability, every single prompt sent to the LLM and the raw response received are automatically saved to an `AILog` collection in MongoDB before the data is returned to the user.

---

## 🧠 AI Prompt Design Explanation

### Structured JSON Enforcement

Instead of relying purely on prompt instructions to format the output, this system utilizes the native API configuration `generationConfig: { responseMimeType: "application/json" }`. This forces the Gemini model to return parseable JSON, drastically reducing the risk of application crashes due to malformed string responses.

---

### Prompt Strategies

**Module 1 (Categorization):** Utilizes **Context Injection**  
The prompt injects a predefined array of allowed categories directly into the prompt string, forcing the LLM to select from actual business logic parameters rather than hallucinating new categories.

**Module 2 (Proposals):** Utilizes **Constraint-Based Prompting**  
The prompt establishes strict boundaries (*"total cost MUST be less than or equal to the maximum budget"*) and provides a rigid JSON template for the LLM to fill in, ensuring the mathematical output aligns with the schema requirements.

---

## 🔮 Architecture Outlines (Remaining Modules)

### Module 3: AI Impact Reporting Generator
* **Trigger:** An internal webhook or event listener triggered when an order is marked as "Shipped/Completed".
* **Data Flow:** The backend queries the order details. `aiService.ts` receives the product list, materials, and quantities.
* **Prompt Strategy (Few-Shot):** The prompt will contain baseline conversion metrics (e.g., *“1 standard plastic item = 0.5kg carbon. 1 bamboo item = 0.05kg carbon”*). The LLM calculates the deltas and generates the impact statement.
* **Storage:** The resulting JSON is embedded directly into the order record in the database.

### Module 4: AI WhatsApp Support Bot
* **Trigger:** Meta WhatsApp Business API webhook `POST` endpoint.
* **Data Flow (RAG):** When a message arrives, the backend extracts the user's phone number, queries MongoDB for active orders, and retrieves the standard return policy. 
* **Prompt Strategy (Roleplay & Guardrails):** The LLM is given a strict persona and injected with the user's live database context. It is instructed to output a specific trigger word (e.g., `ESCALATE_TO_HUMAN`) if the intent matches "refund" or "complaint".
* **Business Logic Routing:** If the Express controller detects `ESCALATE_TO_HUMAN` in the LLM response, it bypasses the automated reply, updates a `SupportTicket` status in MongoDB, and notifies an agent. All conversations are stored in a `WhatsAppLog` schema.

---

## 💻 Local Setup & Installation

### 1. Clone the Repository and Install Dependencies

```bash
git clone https://github.com/The-morning-star23/rayeva-ai-system.git
cd rayeva-ai-system
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and add:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Run the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000`.

---

## 🧪 Testing the APIs

You can test the endpoints using Postman, cURL, or Thunder Client.

### Test Module 1: AI Auto-Category & Tag Generator

**Request:**

```http
POST /api/products/auto-categorize
Content-Type: application/json

{
  "name": "Bamboo Coffee Cup",
  "description": "A reusable coffee cup made from organic bamboo fiber. It is dishwasher safe and biodegradable."
}
```

### Test Module 2: AI B2B Proposal Generator

**Request:**

```http
POST /api/proposals/generate
Content-Type: application/json

{
  "clientName": "GreenTech Solutions",
  "budget": 1500,
  "industry": "Corporate Office"
}
```