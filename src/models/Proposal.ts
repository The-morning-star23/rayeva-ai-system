import mongoose, { Schema, Document } from 'mongoose';

export interface IProductItem {
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface IProposal extends Document {
  clientName: string;
  totalBudget: number;
  allocatedBudget: number;
  productMix: IProductItem[];
  impactSummary: string;
  createdAt: Date;
}

const ProductItemSchema = new Schema<IProductItem>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  totalCost: { type: Number, required: true }
});

const ProposalSchema: Schema = new Schema({
  clientName: { type: String, required: true },
  totalBudget: { type: Number, required: true },
  allocatedBudget: { type: Number, required: true },
  productMix: [ProductItemSchema],
  impactSummary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProposal>('Proposal', ProposalSchema);