import { User } from './User';
import { Product } from './Product';

import { LastMessage } from './LastMessage';

export interface Chat {
    _id: string;
    participant1Id: User;
    participant2Id: User;
    productId: Product;  
    createdAt: string;
    updatedAt: string;
    lastMessage: LastMessage | null; 
}