import { User } from './User';

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
    createdAt?: string;
    updatedAt?: string;
    boostedUntil?: string;
}
