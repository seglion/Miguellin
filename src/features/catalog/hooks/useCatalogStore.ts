import { defineStore } from 'pinia';
import { catalogService } from '../api/catalogApi';
import type { Album, CategoryItem } from '../../../types/catalog';

export const useCatalogStore = defineStore('catalog', {
    state: () => ({
        categories: [] as string[], // Legacy flat list for breadcrumbs/compatibility
        categoryItems: [] as CategoryItem[], // hierarchical menu
        selectedCategory: null as string | null,
        albums: [] as Album[],
        selectedAlbum: null as Album | null,
        isViewerOpen: false,
        isLoading: false,
    }),

    actions: {
        async init() {
            this.isLoading = true;
            this.categoryItems = await catalogService.fetchCategories();

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

        async selectCategory(category: string) {
            this.selectedCategory = category;
            await this.loadAlbums();
        },

        async loadAlbums() {
            if (!this.selectedCategory) return;
            this.albums = await catalogService.getAlbumsByCategory(this.selectedCategory);
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
