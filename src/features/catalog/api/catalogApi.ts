import type { Catalog, Album, CategoryItem } from '../../../types/catalog';

class CatalogService {
    private catalog: Catalog | null = null;
    private cleanName(name: string | null | undefined): string {
        if (!name) return '';

        // 1. Remove Chinese characters and weird symbols
        let cleaned = name.replace(/[^\x00-\x7F]+/g, ' ');

        // 2. Aggressive Price removal: e.g. 200Y, 190Y, ¥300, 300Yuan
        cleaned = cleaned
            .replace(/\b\d{2,4}\s*[Yy](?:uan|an)?\b/gi, ' ')
            .replace(/[¥￥]\s*\d{2,4}\b/g, ' ');

        // 3. Aggressive Batch removal: "RS BATCH", "LJR BATCH", "VT BATCH", etc.
        cleaned = cleaned.replace(/\b[A-Z0-9.]{1,10}\s+BATCH\b/gi, ' ');

        // 4. Bracketed content (usually batch)
        cleaned = cleaned.replace(/【|】|\[|\]/g, ' ');

        // 5. Loop to strip any number of leading batch/slash prefixes (e.g., "MAX/ Batch/batch/ ")
        let prev;
        do {
            prev = cleaned;
            cleaned = cleaned
                .replace(/^[A-Z0-9a-z.+/\s-]{1,15}\/\s*(?=.+)/i, '')
                .replace(/^[\/\s-]+/, '');
        } while (cleaned !== prev);

        // 6. General cleaning and capitalization
        cleaned = cleaned
            .replace(/[\/|-]\s*$/, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toUpperCase();

        return cleaned;
    } private extractYuanPrice(title: string | null | undefined): number | undefined {
        if (!title) return undefined;
        // Robust patterns based on audit of 5900+ items
        const patterns = [
            /\b(\d{2,4})\s*CNY\b/i,
            /(\d{2,4})\s*Y(?![a-z0-9])/i,
            /(\d{2,4})\s*Y[A-Z0-9]{1,10}/i,
            /\bY\s*(\d{2,4})/i,
            /(?<![a-zA-Z])P\s*(\d{2,4})/i,
            /(\d{2,4})\s*P(?![a-z0-9])/i,
            /(\d{2,4})\s*P[A-Z0-9]{1,10}/i,
            /\b(\d{2,4})\s*yuan\b/i,
            /[¥￥]\s*(\d{2,4})/i,
            /(\d{2,4})\s*[¥￥]/i,
            // Batch keywords: 180  E batch, 260 TG Batch, etc.
            /\b(\d{2,4})\s*(?:[A-Z0-9]{1,5}\s+)?(?:Batch|版)/i,
            // Direct Batch codes: 120R, 150VT, etc.
            /\b(\d{2,4})\s*(?:TG|LJR|TOP|M|GX|OWF|VT|PK|LW|FK|S2|G5|Batch|版|XC|KZ|KZ2\.0|SS|E|GT|MW|WM|HP|LW|XP|OG|DG|XDT|H12|LJ|KW|R|C|G|D|Z|X|B|F|K|Q)/i,
            // Folder start pattern: /190 SS ... or /260 TG ...
            /(?:^|\/)\s*(\d{3})\s+[A-Z]/i
        ];

        for (const pattern of patterns) {
            const match = title.match(pattern);
            if (match && match[1]) {
                const rawValue = match[1];
                let value = parseInt(rawValue, 10);

                // Heuristic filtering for noisy patterns
                const isExplicit = pattern.source.includes('Y') || pattern.source.includes('P') || pattern.source.includes('CNY') || pattern.source.includes('[¥￥]');

                if (isExplicit) {
                    if (value >= 10 && value <= 5000) return value;
                } else {
                    // Blacklist common model numbers, years, and large numbers that aren't prices
                    // Avoid numbers like 2024, 2025, 1906, 2002, 990, etc.
                    const blacklist = [
                        2024, 2025, 2023, 2022, 2021, 2010, 
                        2002, 1906, 990, 991, 992, 993, 327, 550, 530, 
                        2000, 1990,
                        // Yeezy models:
                        350, 380, 450, 500, 700, 750
                    ];
                    if (blacklist.includes(value)) continue;
                    
                    // Also blacklist any 4-digit number starting with 20 (likely a year)
                    if (value >= 2000 && value <= 2030) continue;

                    // Less explicit patterns (Batch/Folder) need tighter range
                    if (value >= 80 && value <= 1500) return value;
                }
            }
        }
        return undefined;
    }

    private calculateEuroPrice(yuan: number): number {
        // Calculation: ((Yuan + 10 shipping) * 0.15 rate * 1.10 margin) + 8 profit
        const basePrice = (yuan + 10) * 0.145 * 1.095;
        return Math.ceil(basePrice + 8);
    }

    private extractBatch(title: string): string | undefined {
        const match = title.match(/【(.*?)】/);
        return match ? match[1].trim() : undefined;
    }

    async fetchCatalog(): Promise<Catalog> {
        if (this.catalog) return this.catalog;

        try {
            // Add cache busting to ensure we get the latest manual edits
            const response = await fetch(`/data/catalog.json?t=${Date.now()}`);
            if (!response.ok) throw new Error('Failed to fetch catalog');
            const data = await response.json();

            const cleanedCatalog: Catalog = {};
            for (const id in data) {
                const album = data[id];
                const originalTitle = album.title;
                const description = album.description || '';
                const photoPath = album.photos && album.photos.length > 0 ? album.photos[0].local_path : '';

                // Priority for Price Extraction:
                // 1. Photo Path (contains vendor/batch folders which are very reliable)
                // 2. Original Title
                // 3. Description
                let yuanPrice = this.extractYuanPrice(photoPath);
                if (yuanPrice === undefined) yuanPrice = this.extractYuanPrice(originalTitle);
                if (yuanPrice === undefined) yuanPrice = this.extractYuanPrice(description);

                // Batch prioritization: JSON field first, then dynamic extraction
                let batch = album.batch !== "Standard" ? album.batch : this.extractBatch(originalTitle);
                if (!batch) {
                    batch = this.extractBatch(description);
                }

                let finalPrice = undefined;
                if (yuanPrice !== undefined) {
                    finalPrice = this.calculateEuroPrice(yuanPrice);
                }

                // Prepare clean title: Use pre-processed title from JSON if available
                let displayTitle = album.title || originalTitle;

                // If it's the original title (not pre-processed), apply fallback cleaning
                if (!album.title) {
                    displayTitle = displayTitle
                        .replace(/\d+\s*CNY/i, '')
                        .replace(/\d+\s*Y/i, '')
                        .replace(/P\s*\d+/i, '')
                        .replace(/\d+\s*yuan/i, '')
                        .replace(/[¥￥]\s*\d+/g, '')
                        .replace(/【.*?】/g, '')
                        .trim();
                }

                const cleanSubCat = this.cleanName(album.sub_category);
                const cleanCat = this.cleanName(album.category);
                
                // Excluir SOLAMENTE si es la categoría 'GENERAL' o un 'OTHERS' literal sin marca.
                // Queremos que 'OTRAS ADIDAS' SÍ pase el filtro.
                if (cleanSubCat && (cleanSubCat.toUpperCase() === 'GENERAL' || cleanSubCat.toUpperCase() === 'OTHERS')) {
                    continue;
                }

                cleanedCatalog[id] = {
                    ...album,
                    originalTitle: originalTitle,
                    title: this.cleanName(displayTitle) || originalTitle,
                    category: cleanCat,
                    parent_category: this.cleanName(album.parent_category),
                    sub_category: cleanSubCat,
                    batch: batch,
                    price: finalPrice
                };

                // Specific override for SALOMON XT-6 requested by user
                if (cleanedCatalog[id].category === 'SALOMON' && cleanedCatalog[id].sub_category === 'XT-6') {
                    cleanedCatalog[id].price = 45;
                }
            }

            this.catalog = cleanedCatalog;
            return this.catalog;
        } catch (error) {
            console.error('Error loading catalog:', error);
            return {};
        }
    }

    async getAlbumsByCategory(categoryName: string, brandName?: string): Promise<Album[]> {
        const catalog = await this.fetchCatalog();
        const targetCategory = categoryName.toUpperCase().trim();
        const targetBrand = brandName?.toUpperCase().trim();

        return Object.values(catalog).filter((album: Album) => {
            // Case 1: Filter by both Brand and SubCategory (Specific child click)
            if (targetBrand && targetBrand !== targetCategory) {
                return (album.brand === targetBrand || album.category === targetBrand) && 
                       (album.sub_category === targetCategory || album.category === targetCategory);
            }

            // Case 2: Filter by Parent Category (Parent click or Brand click)
            return album.sub_category === targetCategory ||
                album.category === targetCategory ||
                album.parent_category === targetCategory;
        });
    }

    async fetchCategories(): Promise<CategoryItem[]> {
        try {
            const catalog = await this.fetchCatalog();
            const merged = new Map<string, CategoryItem>();

            Object.values(catalog).forEach(album => {
                const catName = album.category;
                const subCatName = album.sub_category;

                if (!catName) return;

                if (!merged.has(catName)) {
                    merged.set(catName, { name: catName, url: '', children: [] });
                }

                if (subCatName) {
                    const parent = merged.get(catName)!;
                    if (!parent.children) parent.children = [];
                    if (!parent.children.find(c => c.name === subCatName)) {
                        parent.children.push({ name: subCatName, url: '', children: [] });
                    }
                }
            });

            const result = Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
            result.forEach(cat => {
                if (cat.children) {
                    cat.children.sort((a, b) => a.name.localeCompare(b.name));
                }
            });

            return result;
        } catch (e) {
            console.error('Error generating categories hierarchy:', e);
            return [];
        }
    }

    async getCategories(): Promise<string[]> {
        const catalog = await this.fetchCatalog();
        const categories = new Set(Object.values(catalog).map((album: Album) => album.category));
        return Array.from(categories).sort();
    }
}

export const catalogService = new CatalogService();
