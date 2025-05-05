import { User } from './User';
import { Product } from './Product';

export interface Chat {
    _id: string;
    participant1Id: User;
    participant2Id: User;
    productId: Product;  
    createdAt: string;
    updatedAt: string;
}