import mongoose, { Document } from 'mongoose';
export interface IRawMaterial extends Document {
    name: string;
    reference: string;
    category: string;
    unit: string;
    currentStock: number;
    minStockAlert: number;
    unitCost: number;
    supplier: mongoose.Types.ObjectId | string;
    lastRestocked: Date;
    description?: string;
    location: string;
    status: 'active' | 'discontinued' | 'out_of_stock';
}
export declare const RawMaterial: mongoose.Model<IRawMaterial, {}, {}, {}, mongoose.Document<unknown, {}, IRawMaterial, {}, {}> & IRawMaterial & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=RawMaterial.d.ts.map