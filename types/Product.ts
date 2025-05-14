import { User } from './User';


export enum ProductStatus {
    PENDING_REVIEW = 'pending_review',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    OUTDATED = 'outdated',
}

export interface Product {
    _id: string;
    photo?: string[];
    title: string;
    category: string;
    description?: string;
    dealType: string;
    price: number;
    isNegotiable: boolean;
    condition: string;
    address: string;
    sellerName: string;
    email?: string;
    phone?: string;
    creatorId: User;
    status: ProductStatus; 
    createdAt?: string;
    updatedAt?: string;
    boostedUntil?: string;
}
