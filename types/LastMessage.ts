export interface LastMessage {
    _id: string;
    text: string;
    senderId: string;  
    createdAt: string;
    status: 'sent' | 'delivered' | 'read';  
}
