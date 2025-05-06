import { User } from "./User";

export interface Message {
    _id: string;
    chatId: string;
    senderId: User;
    text: string;
    status: 'sent' | 'delivered' | 'read';
    createdAt: string;
    updatedAt?: string;
}
