import { Schema, model, Document } from 'mongoose';

export interface ISupplier extends Document {
    name: string;
    contactName: string;
    phone: string;
    email: string;
    address: string;
}

const SupplierSchema = new Schema<ISupplier>({
    name: { type: String, required: true, unique: true, trim: true },
    contactName: { type: String, required: true },
    phone: { type: String },
    email: { type: String, lowercase: true },
    address: { type: String },
}, { timestamps: true });

export default model<ISupplier>('Supplier', SupplierSchema);