import { Timestamp } from "firebase/firestore/lite";

export interface Influencer {
    id: string;
    name: string;
    instagram?: string;
    userId: string;
}

export interface Partner {
    id: string;
    name: string;
    userId: string;
}

export interface Post {
    id: string;
    title: string;
    description?: string;
    link?: string;
    influencerId: string;
    partnerId: string;
    investment?: number;
    revenue?: number;
    clicks?: number;
    sales?: number;
    createdAt: Date | Timestamp;
    userId: string;
}
