export interface Partner {
    id: string;
    name: string;
    userId: string;
}

export interface Influencer {
    id: string;
    name: string;
    userId: string;
}

export interface Post {
    id: string;
    userId: string;
    title: string;
    description: string;
    link: string;
    influencerId: string;
    partnerId: string;
    clicks: number;
    sales: number;
    revenue: number;
    createdAt: string; // ISO 8601 date string
}
