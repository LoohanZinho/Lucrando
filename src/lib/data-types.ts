
import { Timestamp } from "firebase/firestore/lite";

export interface User {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
    password?: string; // Should be handled securely
    paidAt?: Timestamp;
    subscriptionExpiresAt?: Timestamp;
}

export interface Influencer {
    id: string;
    name: string;
    instagram?: string;
    followers?: number;
    storyViews?: number;
    userId: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    userId: string;
}

export interface Post {
    id: string;
    title: string;
    description?: string;
    influencerId: string;
    productId: string;
    investment?: number;
    revenue?: number;
    views?: number;
    clicks?: number;
    sales?: number;
    postDate: Date | Timestamp;
    userId: string;
}
