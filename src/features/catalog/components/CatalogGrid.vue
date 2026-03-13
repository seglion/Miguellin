<script setup lang="ts">
import { onMounted } from 'vue';
import { useCatalogStore } from '../hooks/useCatalogStore';
import ProductCard from './ProductCard.vue';

const catalogStore = useCatalogStore();
</script>

<template>
  <div class="catalog-container">
    <div v-if="catalogStore.isLoading" class="loading-overlay">
      <div class="loader">SCANNING DATABASE...</div>
    </div>

    <div v-else class="catalog-grid">
      <ProductCard 
        v-for="album in catalogStore.albums" 
        :key="album.id" 
        :album="album"
        :class="{ 'tall': Math.random() > 0.8 }"
        @select="catalogStore.openAlbum(album)"
      />
    </div>

    <div v-if="!catalogStore.isLoading && catalogStore.albums.length === 0" class="empty-state">
      <div class="msg">No items found in this section.</div>
    </div>
  </div>
</template>

<style scoped>
.catalog-container {
  min-height: 400px;
  position: relative;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

@media (max-width: 640px) {
  .catalog-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* Make some cards tall for editorial feel - only on desktop */
@media (min-width: 1024px) {
  .product-card.tall {
    grid-row: span 1.5;
  }
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.loader {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 4px;
  color: var(--color-accent);
  animation: pulse 1.5s infinite;
}

.empty-state {
  text-align: center;
  padding: 100px 0;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
