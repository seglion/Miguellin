import type { Catalog, Album, CategoryItem } from '../../../types/catalog';

class CatalogService {
    private catalog: Catalog | null = null;
    private cleanName(name: string | null | undefined): string {
        if (!name) return '';

        // 1. Remove Chinese characters first
        let cleaned = name.replace(/[\u4e00-\u9fff]/g, '');

        // 2. Loop to strip any number of leading batch/slash prefixes (e.g., "MAX/ Batch/batch/ ")
        // We look for patterns of 1-15 chars followed by a slash at the start
        let prev;
        do {
            prev = cleaned;
            cleaned = cleaned
                .replace(/^[A-Z0-9a-z.+/\s-]{1,15}\/\s*(?=.+)/i, '')
                .replace(/^[\/\s-]+/, '');
        } while (cleaned !== prev);

        // 3. General cleaning and capitalization
        cleaned = cleaned
            .replace(/[\/|-]\s*$/, '')
            .replace(/【|】/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toUpperCase();

        // Literal "BATCH" keyword cleanup if it's still there as a separate word at start
        cleaned = cleaned.replace(/^BATCH\s+/i, '');

        // 4. High-priority Model Normalization (Canonical Names)
        if (cleaned.includes('AIR FORCE') || cleaned.match(/\bAF\s*1\b/i)) {
            return 'AIR FORCE 1';
        }

        if (cleaned.includes('VOMERO')) return 'VOMERO 5';
        if (cleaned.includes('DUNK')) return 'DUNK';
        if (cleaned.includes('KOBE')) return 'KOBE';
        if (cleaned.includes('AIR MAX')) return 'AIR MAX';
        if (cleaned.includes('SAMBA')) return 'SAMBA';
        if (cleaned.includes('CAMPUS')) return 'CAMPUS';
        if (cleaned.includes('GAZELLE')) return 'GAZELLE';
        if (cleaned.includes('JORDAN 1') || cleaned.includes('AJ1')) return 'JORDAN 1';
        if (cleaned.includes('JORDAN 4') || cleaned.includes('AJ4')) return 'JORDAN 4';

        return cleaned;
    }

    private extractYuanPrice(title: string): number | undefined {
        // Extract price like "250Y", "Y250", "P250", "250P", "250 yuan", "¥250", "￥250", "250CNY"
        const patterns = [
            /\b(\d+)\s*CNY\b/i,
            /(\d+)\s*Y\b/i,           // 250Y
            /\bY\s*(\d+)/i,           // Y250
            /(?<![a-zA-Z])P\s*(\d+)/i, // P250
            /\b(\d+)\s*P\b/i,          // 250P (often used in some stores)
            /\b(\d+)\s*yuan\b/i,
            /[¥￥]\s*(\d+)/
        ];
        
        for (const pattern of patterns) {
            const match = title.match(pattern);
            if (match && match[1]) {
                const rawValue = match[1];
                let value = parseInt(rawValue, 10);
                
                // Heuristic: If prefixed price (P/¥/￥/Y) is followed by a long string of numbers
                // (suspected concatenated ID), take only the first 3-4 digits.
                const source = pattern.source;
                const isPrefixed = source.includes('P') || source.includes('[¥￥]') || (source.startsWith('\\bY') && !source.includes('match[1].length'));
                
                if (isPrefixed) {
                    if (value > 5000 || rawValue.length >= 6) {
                        value = parseInt(rawValue.substring(0, 3), 10);
                    }
                }
                
                // Final validation: Prices are usually between 10 and 5000 Yuan
                if (value >= 10 && value <= 5000) {
                    return value;
                }
            }
        }
        return undefined;
    }

    private calculateEuroPrice(yuan: number): number {
        // Calculation: ((Yuan + 10 shipping) * 0.14 rate * 1.09 margin) + 7 profit
        // Adjusted to +7 based on user feedback to balance competitiveness and profit.
        const basePrice = (yuan + 10) * 0.14 * 1.09;
        return Math.ceil(basePrice + 7);
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
                
                // Try to extract from title first, then description, then photo paths
                let yuanPrice = this.extractYuanPrice(originalTitle);
                if (yuanPrice === undefined) {
                    yuanPrice = this.extractYuanPrice(description);
                }
                
                // Fallback: Check first photo local path if still missing (useful for batch folder prices)
                if (yuanPrice === undefined && album.photos && album.photos.length > 0) {
                    yuanPrice = this.extractYuanPrice(album.photos[0].local_path);
                }

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

                cleanedCatalog[id] = {
                    ...album,
                    originalTitle: originalTitle,
                    title: this.cleanName(displayTitle) || originalTitle,
                    category: this.cleanName(album.category),
                    parent_category: this.cleanName(album.parent_category),
                    sub_category: this.cleanName(album.sub_category),
                    batch: batch,
                    price: finalPrice,
                    yuanPrice: yuanPrice
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

    async getAlbumsByCategory(categoryName: string): Promise<Album[]> {
        const catalog = await this.fetchCatalog();
        const targetCategory = categoryName.toUpperCase().trim();

        return Object.values(catalog).filter((album: Album) => {
            // Priority 1: Direct link via sub_category or parent_category
            if (album.sub_category === targetCategory ||
                album.category === targetCategory ||
                album.parent_category === targetCategory) {
                return true;
            }

            // Priority 2: Title matching as fallback for models with missing subcategory links
            const modelNames = ['AIR FORCE 1', 'AIR MAX', 'DUNK', 'JORDAN 1', 'JORDAN 4', 'VOMERO 5', 'KOBE'];
            if (modelNames.includes(targetCategory)) {
                return album.title.toUpperCase().includes(targetCategory);
            }

            return false;
        });
    }

    async fetchCategories(): Promise<CategoryItem[]> {
        try {
            const response = await fetch(`/data/categories.json?t=${Date.now()}`);
            if (!response.ok) return [];
            const data = await response.json();

            const cleanAndMerge = (items: any[]): CategoryItem[] => {
                const merged = new Map<string, CategoryItem>();

                items.forEach(item => {
                    const name = this.cleanName(item.name);
                    if (!name) return;

                    if (merged.has(name)) {
                        const existing = merged.get(name)!;
                        if (item.children && Array.isArray(item.children)) {
                            existing.children = cleanAndMerge([...(existing.children || []), ...item.children]);
                        }
                    } else {
                        merged.set(name, {
                            ...item,
                            name: name,
                            children: item.children && Array.isArray(item.children) ? cleanAndMerge(item.children) : []
                        });
                    }
                });

                return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
            };

            return cleanAndMerge(data);
        } catch (e) {
            console.error('Error loading categories hierarchy:', e);
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
