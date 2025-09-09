
import { Timestamp } from "firebase/firestore/lite";

export interface Influencer {
    id: string;
    name: string;
    instagram?: string;
    followers?: number;
    storyViews?: number;
    userId: string;
}

export interface Partner {
    id: string;
    name: string;
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
    link?: string;
    influencerId: string;
    productId: string;
    partnerId?: string;
    partnerShareType?: 'percentage' | 'fixed';
    partnerShareValue?: number;
    investment?: number;
    revenue?: number;
    views?: number;
    clicks?: number;
    pageVisits?: number;
    sales?: number;
    postDate: Date | Timestamp;
    userId: string;
}

    
