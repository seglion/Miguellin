<script setup lang="ts">
import { useCatalogStore } from '../hooks/useCatalogStore';
import ProductCard from './ProductCard.vue';

const catalogStore = useCatalogStore();
</script>

<template>
  <div class="catalog-container">
    <div v-if="catalogStore.isLoading" class="loading-overlay">
      <div class="loader-box jagged-edge">
        <div class="loader-text">SCANNING_ARCHIVE...</div>
        <div class="loader-bar"></div>
      </div>
    </div>

    <div v-else class="catalog-grid">
      <ProductCard 
        v-for="album in catalogStore.displayAlbums" 
        :key="album.id" 
        :album="album"
        @select="catalogStore.openAlbum(album)"
      />
    </div>

    <div v-if="!catalogStore.isLoading && catalogStore.displayAlbums.length === 0" class="empty-state">
      <div class="msg sticker">NO_RECORDS_FOUND_IN_THIS_DROP</div>
    </div>
  </div>
</template>

<style scoped>
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 40px;
  position: relative;
  z-index: 10;
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.loader-box {
  background: #000;
  color: #fff;
  padding: 30px 60px;
  border: 4px solid var(--color-accent);
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 10px 10px 0 #000;
}

.loader-text {
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: 2px;
}

.loader-bar {
  height: 4px;
  background: var(--color-accent);
  width: 100%;
  animation: loading 1.5s infinite ease-in-out;
  transform-origin: left;
}

@keyframes loading {
  0% { transform: scaleX(0); }
  50% { transform: scaleX(1); }
  100% { transform: scaleX(0); transform-origin: right; }
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: 100px 0;
}

.msg {
  font-family: var(--font-display);
  font-size: 1.2rem;
}

@media (max-width: 640px) {
  .catalog-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>
