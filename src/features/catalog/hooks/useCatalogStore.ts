import { defineStore } from 'pinia';
import { catalogService } from '../api/catalogApi';
import type { Album, CategoryItem } from '../../../types/catalog';

export const useCatalogStore = defineStore('catalog', {
    state: () => ({
        categories: [] as string[], // Legacy flat list for breadcrumbs/compatibility
        categoryItems: [] as CategoryItem[], // hierarchical menu
        selectedCategory: null as string | null,
        selectedBrand: null as string | null,
        searchQuery: '',
        albums: [] as Album[],
        allAlbums: [] as Album[],
        selectedAlbum: null as Album | null,
        isViewerOpen: false,
        isLoading: false,
    }),

    getters: {
        displayAlbums(state): Album[] {
            let filtered = [] as Album[];
            
            if (state.searchQuery.trim().length >= 2) {
                // Global search across all albums
                const query = state.searchQuery.toLowerCase().trim();
                filtered = state.allAlbums.filter(album => 
                    album.title.toLowerCase().includes(query) || 
                    (album.originalTitle && album.originalTitle.toLowerCase().includes(query)) ||
                    (album.description && album.description.toLowerCase().includes(query)) ||
                    album.id.toString().includes(query)
                );
            } else {
                // View specific category
                filtered = state.albums;
            }

            // Always sort by price descending (most expensive first)
            return [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
        }
    },

    actions: {
        async init() {
            this.isLoading = true;
            this.categoryItems = await catalogService.fetchCategories();
            
            // Load full catalog for search cache
            const fullCatalog = await catalogService.fetchCatalog();
            this.allAlbums = Object.values(fullCatalog);

            // Derive a flat list for simple usage if needed
            const flatten = (items: CategoryItem[]): string[] => {
                return items.reduce((acc, item) => {
                    acc.push(item.name);
                    if (item.children) acc.push(...flatten(item.children));
                    return acc;
                }, [] as string[]);
            };
            this.categories = flatten(this.categoryItems);

            if (this.categoryItems.length > 0 && !this.selectedCategory) {
                this.selectedCategory = this.categoryItems[0].name;
            }
            await this.loadAlbums();
            this.isLoading = false;
        },

        async selectCategory(category: string, brand?: string) {
            this.selectedCategory = category;
            this.selectedBrand = brand || null;
            this.searchQuery = ''; // Reset search on navigation
            await this.loadAlbums();
        },

        async loadAlbums() {
            if (!this.selectedCategory) return;
            this.albums = await catalogService.getAlbumsByCategory(this.selectedCategory, this.selectedBrand || undefined);
        },

        openAlbum(album: Album) {
            this.selectedAlbum = album;
            this.isViewerOpen = true;
        },

        closeAlbum() {
            this.isViewerOpen = false;
            this.selectedAlbum = null;
        }
    }
});
