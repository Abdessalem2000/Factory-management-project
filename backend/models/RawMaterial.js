"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawMaterial = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const RawMaterialSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    reference: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    category: {
        type: String,
        required: true,
        enum: ['fabric', 'thread', 'buttons', 'zippers', 'labels', 'packaging', 'other']
    },
    unit: {
        type: String,
        required: true,
        enum: ['meters', 'kilograms', 'pieces', 'boxes', 'rolls']
    },
    currentStock: {
        type: Number,
        required: true,
        min: 0
    },
    minStockAlert: {
        type: Number,
        required: true,
        min: 0
    },
    unitCost: {
        type: Number,
        required: true,
        min: 0
    },
    supplier: {
        type: mongoose_1.Schema.Types.Mixed,
        required: false
    },
    lastRestocked: {
        type: Date,
        default: Date.now
    },
    description: String,
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'discontinued', 'out_of_stock'],
        default: 'active'
    }
}, {
    timestamps: true
});
RawMaterialSchema.index({ currentStock: 1 });
RawMaterialSchema.index({ category: 1 });
RawMaterialSchema.index({ supplier: 1 });
exports.RawMaterial = mongoose_1.default.model('RawMaterial', RawMaterialSchema);
//# sourceMappingURL=RawMaterial.js.map