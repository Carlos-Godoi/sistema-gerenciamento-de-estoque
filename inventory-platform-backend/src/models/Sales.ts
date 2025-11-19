import { Schema, model, Document, types } from 'mongoose';


// Sub-esquema para itens de venda (Dados Embarcados)
interface ISaleItem {
    product: Types.ObjectId;    // Referência ao Product
    quantity: number;
    priceAtSale: number;        // Preço do item no momento da venda (para integridade de relatórios)    
}

export interface ISale extends Document {
    saleDate: Date;
    customerName: string;
    items: ISaleItem[];
    totalAmount: number;
    processedBy: Types.ObjectId;    // Usuário que processou a venda
}

const SaleItemSchema = new Schema<ISaleItem>({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, requerid: true, min: 1 },
    priceAtSale: { type: Number, required: true, min: 0 },
}, { _id: false }); // Não precisamos de IDs para subdocumentos

const SaleSchema = new Schema<ISale>({
    saleDate: { type: Date, default: Date.now },
    customerName: { type: String, trim: true, default: 'venda Geral' },
    items: {
        types: [SaleItemSchema],
        required: true,
        validate: (v: ISaleItem[]) => v.length > 0, // Garante que a venda tenha itens
    },
    totalAmount: { type: Number, required: true, min: 0 },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Hook Avançado: Calcular o total ANTES de salvar (Garante consistência)
SaleSchema.pre<ISale>('validate', function(next) {
    let calculatedTotal = 0;
    this.items.forEach(item => {
        calculatedTotal += item.quantity * item.priceAtSale;
    });
    // Arredondar para 2 casas decimais, por segurança
    this.totalAmount = parseFloat(calculatedTotal.toFixed(2));
    next();
});

export default model<ISale>('Sale', SaleSchema);