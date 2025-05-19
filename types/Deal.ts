import { User } from './User';
import { Product } from './Product';

export enum DealStatus {
    PENDING = 'pending',
    RECEIVED = 'received',
    REFUND_REQUESTED = 'refund_requested',
    REFUNDED = 'refunded',
    CANCELLED = 'cancelled',
}

export enum DeliveryMethod {
    PICKUP = 'pickup',
    DELIVERY = 'delivery',
}

export interface DeliveryInfo {
    method: DeliveryMethod;
    address?: string;
    note?: string;
}

export interface Deal {
    _id: string;
    product: {
        title: string;
        images: string[];
        price: number;
    };
    productId: Product;
    seller: User;
    buyer: User;
    amount: number;
    delivery: DeliveryInfo;
    status: DealStatus;
    createdAt: string;
    updatedAt?: string;
}
