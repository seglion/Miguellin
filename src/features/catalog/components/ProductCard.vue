<script setup lang="ts">
import type { Album } from '../../../types/catalog';

defineProps<{
  album: Album;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
}>();

const getCoverImage = (album: Album) => {
  if (album.photos && album.photos.length > 0) {
    const photo = album.photos[0];
    return photo.url || '/' + photo.local_path;
  }
  return '';
};
</script>

<template>
  <div class="product-card" @click="emit('select', album.id)">
    <div class="img-wrapper jagged-edge">
      <img v-if="getCoverImage(album)" :src="getCoverImage(album)" :alt="album.title" loading="lazy" />
      <div v-else class="placeholder-img halftone"></div>
      
      <div class="photo-count sticker">POPS: {{ album.photos?.length || 0 }}</div>
      <div v-if="album.batch" class="batch-tag">{{ album.batch }}</div>
      <div v-if="album.price" class="price-tag">€{{ album.price }}</div>
    </div>
    
    <div class="info">
      <div class="brand-badge">{{ album.brand || album.category }}</div>
      <h3 class="name">{{ album.title }}</h3>
      <div class="meta-row">
        <div class="id-tag">REF_{{ album.id }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: #fff;
  border: 4px solid #000;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  cursor: pointer;
  transition: all 0.2s steps(2);
  position: relative;
  box-shadow: 6px 6px 0 #000;
}

.product-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 12px 12px 0 var(--color-accent);
}

.img-wrapper {
  aspect-ratio: 1;
  background: #eee;
  overflow: hidden;
  position: relative;
  border: 3px solid #000;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s steps(4);
}

.product-card:hover img {
  transform: scale(1.08) rotate(1deg);
}

.photo-count {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--color-vibrant-1);
  color: #000;
  font-size: 0.6rem;
  padding: 2px 8px;
  z-index: 5;
}

.batch-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #000;
  color: #fff;
  padding: 4px 10px;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 900;
  transform: rotate(-3deg);
  border: 2px solid #000;
  z-index: 5;
}

.price-tag {
  position: absolute;
  bottom: 10px;
  right: -5px;
  background: var(--color-accent);
  color: #fff;
  padding: 5px 15px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.8rem;
  z-index: 10;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #000;
  transform: rotate(2deg);
}

.brand-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 900;
  background: #f0f0f0;
  color: #000;
  padding: 2px 8px;
  border: 2px solid #000;
  margin-bottom: 5px;
}

.info h3 {
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 800;
  margin: 5px 0;
  color: #000;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.6rem;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  padding-top: 10px;
  border-top: 1px dashed #ccc;
}

.id-tag, .yuan-tag {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  color: #666;
}

.yuan-tag {
  background: var(--color-vibrant-2);
  color: #000;
  padding: 1px 5px;
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  .product-card {
    padding: 10px;
    box-shadow: 4px 4px 0 #000;
  }
  
  .price-tag {
    font-size: 1.4rem;
    padding: 4px 10px;
  }
  
  .info h3 {
    font-size: 0.95rem;
  }
}
</style>
