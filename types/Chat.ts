import { User } from './User';

export interface Chat {
    _id: string;
    participant1Id: User;
    participant2Id: User;
    productId: string;  
    createdAt: string;
    updatedAt: string;
}