export enum UserRole {
    ADMIN = 'admin',
    MODERATOR = 'moderator',
    USER = 'user',
    BLOCKED = 'blocked',
}


export interface User {
    _id?: string;
    id: string; 
    name: string; 
    email?: string;
    profilePhoto: string;
    phoneNumber?: string;
    gender?: string | null;
    createdAt?: string; 
    role: UserRole;
}