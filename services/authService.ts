import axios from 'axios';

const API_URL = 'https://olx-server.makkenzo.com';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    token: string;
    user: any; // Можно заменить на конкретный тип User
}

export const authService = {
    async login(data: LoginData): Promise<AuthResponse> {
        const response = await axios.post(`${API_URL}/users/login`, data);
        return response.data;
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await axios.post(`${API_URL}/users/register`, data);
        return response.data;
    },
};
