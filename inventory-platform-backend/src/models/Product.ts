import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    sku: string; // Stock Keeping Unit (Código único)
    description: string;
    price: number;
    stockQuantity: number; 
    minStockLevel: number; // Nível para alerta de estoque baixo
    supplier: Types.ObjectId; // Referência ao fornecedor
    createdBy: Types.ObjectId; //Referência ao usuário que criou
    isActive: boolean;    
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    minStockLevel: { type: Number, default: 10, min: 0 },

    // Relação N:1 com Supplier
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true 
    },

    // Relação N:1 com User (para auditoria)
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

