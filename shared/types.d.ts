export interface BaseEntity {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ProductionOrder extends BaseEntity {
    orderNumber: string;
    product: {
        name: string;
        sku: string;
        description?: string;
    };
    quantity: number;
    unitOfMeasure: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    stages: ProductionStage[];
    assignedWorkers: string[];
    estimatedCompletionDate?: Date;
    actualCompletionDate?: Date;
    notes?: string;
}
export interface ProductionStage {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    estimatedDuration: number;
    actualDuration?: number;
    startedAt?: Date;
    completedAt?: Date;
    assignedWorker?: string;
    notes?: string;
}
export interface Transaction extends BaseEntity {
    type: 'income' | 'expense';
    category: 'materials' | 'labor' | 'overhead' | 'sales' | 'other';
    amount: number;
    currency: string;
    description: string;
    date: Date;
    reference?: string;
    supplierId?: string;
    productionOrderId?: string;
    paymentMethod?: 'cash' | 'bank_transfer' | 'credit_card' | 'check';
    status: 'pending' | 'completed' | 'cancelled';
    attachments?: string[];
}
export interface FinancialSummary {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    period: {
        start: Date;
        end: Date;
    };
    breakdown: {
        materials: number;
        labor: number;
        overhead: number;
        sales: number;
        other: number;
    };
}
export interface Supplier extends BaseEntity {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    taxId?: string;
    paymentTerms: string;
    categories: string[];
    status: 'active' | 'inactive' | 'blacklisted';
    rating: number;
    notes?: string;
}
export interface SupplierOrder extends BaseEntity {
    orderNumber: string;
    supplierId: string;
    items: SupplierOrderItem[];
    totalAmount: number;
    currency: string;
    orderDate: Date;
    expectedDeliveryDate: Date;
    actualDeliveryDate?: Date;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
    trackingNumber?: string;
    notes?: string;
}
export interface SupplierOrderItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specifications?: string;
}
export interface SupplierPayment extends BaseEntity {
    supplierId: string;
    orderId?: string;
    amount: number;
    currency: string;
    paymentDate: Date;
    paymentMethod: 'bank_transfer' | 'check' | 'cash';
    reference?: string;
    status: 'pending' | 'completed' | 'cancelled';
    notes?: string;
}
export interface Worker extends BaseEntity {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    hireDate: Date;
    status: 'active' | 'inactive' | 'terminated';
    skills: string[];
    hourlyRate: number;
    currency: string;
    paymentType: 'hourly' | 'piece_rate' | 'salary';
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
    notes?: string;
}
export interface WorkAssignment extends BaseEntity {
    workerId: string;
    productionOrderId: string;
    stageId: string;
    task: string;
    assignedDate: Date;
    dueDate?: Date;
    completedDate?: Date;
    status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    quantityProduced?: number;
    pieceRate?: number;
    totalPayment?: number;
    notes?: string;
}
export interface WorkerPayment extends BaseEntity {
    workerId: string;
    period: {
        start: Date;
        end: Date;
    };
    baseSalary?: number;
    overtimeHours?: number;
    overtimeRate?: number;
    pieceWorkPayments: PieceWorkPayment[];
    deductions: {
        type: string;
        amount: number;
        description: string;
    }[];
    totalEarnings: number;
    totalDeductions: number;
    netPayment: number;
    currency: string;
    paymentDate: Date;
    paymentMethod: 'bank_transfer' | 'check' | 'cash';
    status: 'pending' | 'processed' | 'paid';
    notes?: string;
}
export interface PieceWorkPayment {
    assignmentId: string;
    task: string;
    quantity: number;
    rate: number;
    totalAmount: number;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface DashboardStats {
    production: {
        totalOrders: number;
        activeOrders: number;
        completedOrders: number;
        completionRate: number;
    };
    financial: {
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
        profitMargin: number;
    };
    suppliers: {
        totalSuppliers: number;
        activeSuppliers: number;
        pendingOrders: number;
        overduePayments: number;
    };
    workers: {
        totalWorkers: number;
        activeWorkers: number;
        currentAssignments: number;
        averageProductivity: number;
    };
}
export interface DateRange {
    start: Date;
    end: Date;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface ProductionFilters extends PaginationParams {
    status?: ProductionOrder['status'];
    priority?: ProductionOrder['priority'];
    assignedWorker?: string;
    dateRange?: DateRange;
}
export interface FinancialFilters extends PaginationParams {
    type?: Transaction['type'];
    category?: Transaction['category'];
    dateRange?: DateRange;
    supplierId?: string;
}
export interface SupplierFilters extends PaginationParams {
    status?: Supplier['status'];
    category?: string;
    rating?: number;
}
export interface WorkerFilters extends PaginationParams {
    status?: Worker['status'];
    department?: string;
    skill?: string;
}
//# sourceMappingURL=types.d.ts.map