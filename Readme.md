# Rayeva – AI Systems Assignment

**Role:** Full Stack / AI Intern Applicant  
**Focus:** Applied AI for Sustainable B2B Commerce  

---

## 📑 Table of Contents
1. Project Overview
2. Tech Stack
3. Architecture Overview
4. AI Prompt Design Explanation
5. Implemented Modules
6. Future Modules (Roadmap)
7. Local Setup & Installation
8. Testing the APIs

---

## 🎯 Project Overview

Build a production-ready, AI-powered backend system to streamline B2B sustainable commerce workflows. This project integrates Google's Gemini 2.5 Flash AI to automate catalog management and proposal generation, strictly enforcing structured JSON outputs and logging all AI interactions within a Node.js/Express and MongoDB environment.

---

## ⚙️ Tech Stack

* **Backend Framework:** Node.js with Express.js
* **Language:** TypeScript
* **Database:** MongoDB (via Mongoose)
* **AI Provider:** Google Gemini API (`@google/generative-ai`)
* **Core Model:** `gemini-2.5-flash`

---

## 📐 Architecture Overview

The application follows a clean, modular backend architecture to ensure a strict separation of concerns between standard API routing, database operations, and AI generation logic.

* **`/routes` (The Entry Point):** Handles incoming HTTP POST requests, validates the presence of required body parameters (like `clientName` or `budget`), and routes the data to the appropriate service.
* **`/services/aiService.ts` (The AI Engine):** This isolated file manages the Google Gemini SDK. By keeping AI logic here, the rest of the application remains completely agnostic to the specific LLM being used. It handles prompt construction, API key security, and JSON parsing.
* **`/models` (Data Integrity):** Mongoose schemas (`Product`, `Proposal`, and `AILog`) enforce strict TypeScript interfaces before anything is written to the MongoDB database.
* **Mandatory AI Auditing:** A core architectural decision was implementing an interception layer in `aiService.ts`. Before any AI data is returned to the client, the raw prompt and the LLM's response are automatically written to an `AILog` MongoDB collection to maintain a system-wide audit trail.

---

## 🧠 AI Prompt Design Explanation

Getting an LLM to reliably return data that a database can ingest requires strict guardrails. This project uses three specific prompt engineering techniques:

1. **System-Level JSON Enforcement:** Instead of just asking the AI to "return JSON," the system utilizes Gemini's `generationConfig: { responseMimeType: "application/json" }`. This forces the model's output layer to physically constrain its response to valid JSON syntax.

2. **Constraint-Based Prompting:** For mathematical operations (Module 2), the prompt establishes rigid, non-negotiable boundaries (e.g., *"The total cost of all products MUST be less than or equal to the maximum budget"*).

3. **Few-Shot Concrete Examples:** To prevent the AI from generating syntax errors (like missing quotes or adding markdown blockticks), the prompt provides a perfectly formatted, hard-coded JSON example for the LLM to mirror.

---

## 🚀 Implemented Modules (Code Provided)

### Module 1: AI Auto-Category & Tag Generator

* **Flow:** `POST /api/products/auto-categorize` -> `aiService.generateProductMetadata` -> Saves to `Product` DB.
* **Prompt Strategy (Context Injection):** The prompt injects a predefined array of allowed business categories natively into the string. This zero-shot approach forces the LLM to categorize the product using actual business parameters rather than hallucinating new, unsupported categories.

### Module 2: AI B2B Proposal Generator

* **Flow:** `POST /api/proposals/generate` -> `aiService.generateB2BProposal` -> Saves to `Proposal` DB.
* **Prompt Strategy (Few-Shot & Schema Mapping):** The LLM acts as a sales assistant. It is provided with a strict JSON template containing calculated fields (`unitCost` * `quantity` = `totalCost`) and a predefined impact summary field, ensuring the output maps perfectly to the `IProposal` TypeScript interface.

---

## 🔮 Architecture Outlines (Remaining Modules)

### Module 3: AI Impact Reporting Generator

* **Architecture:** Operates via an asynchronous event listener. When an order's status changes to "Completed" in the database, a webhook triggers the backend. The system fetches the order's product mix and passes the material breakdown to the AI service. The generated impact JSON is stored directly inside the `Order` document.
* **Prompt Design (Rule-Based):** The prompt injects baseline conversion metrics (e.g., *"Assume 1 standard plastic item = 0.5kg of carbon"*). The LLM is tasked purely with calculating the deltas based on these injected rules and returning `{ "plasticSavedKg": Number, "carbonAvoidedKg": Number, "impactStatement": String }`.

### Module 4: AI WhatsApp Support Bot

* **Architecture (RAG):** Uses the Meta WhatsApp Business API. Incoming webhooks hit an Express controller. The backend extracts the user's phone number, queries MongoDB for their active orders, and retrieves the standard return policy.
* **Prompt Design (Roleplay & Escalation Guardrails):** The LLM acts as a support bot, injected with the user's live database context. It is strictly bounded: *"Answer politely using ONLY the provided order data. If the user mentions 'refund' or 'angry', do not answer. Output exactly: `ESCALATE_TO_HUMAN`."* The backend listens for this exact string to bypass the bot and route the ticket to a human queue.

---

## 💻 Local Setup & Installation

### 1. Clone the Repository and Install Dependencies

```bash
git clone https://github.com/The-morning-star23/rayeva-ai-system.git
cd rayeva-ai-system
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Start the Server

```bash
npm run dev
```

---

## 🧪 Testing the APIs

Send POST requests via Postman or Thunder Client to the following endpoints with valid JSON body payloads:

* `http://localhost:5000/api/products/auto-categorize`
* `http://localhost:5000/api/proposals/generate`