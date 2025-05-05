import {User} from "./User";
import {Product} from "./Product";

export interface Favorite {
    _id: string;
    productId: Product;
    userId: User;
    createdAt: string;
    updatedAt: string;
}