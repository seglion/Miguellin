export interface Photo {
    id: string;
    url: string;
    local_path: string;
}

export interface Album {
    id: string;
    title: string;
    originalTitle?: string;
    url: string;
    category: string;
    brand?: string;
    model?: string;
    parent_category?: string | null;
    sub_category?: string | null;
    batch?: string;
    photo_count_metadata: number;
    description: string;
    photos: Photo[];
    price?: number;
}

export interface CategoryItem {
    name: string;
    url: string;
    children: CategoryItem[];
}

export type Catalog = Record<string, Album>;
