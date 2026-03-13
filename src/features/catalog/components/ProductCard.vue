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
    <div class="img-wrapper">
      <img v-if="getCoverImage(album)" :src="getCoverImage(album)" :alt="album.title" loading="lazy" />
      <div v-else class="placeholder-img"></div>
      <div class="photo-count">{{ album.photo_count_metadata }} PHOTOS</div>
      <div v-if="album.batch" class="batch-tag">{{ album.batch }}</div>
      <div v-if="album.price" class="price-tag">€{{ album.price }}</div>
    </div>
    <div class="info">
      <span class="brand">{{ album.category }}</span>
      <h3 class="name">{{ album.title }}</h3>
      <div class="meta-row">
        <div class="id-tag">ID: {{ album.id }}</div>
        <div v-if="album.yuanPrice" class="yuan-tag">{{ album.yuanPrice }}Y</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  border: 1px solid var(--color-border);
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  cursor: pointer;
  transition: all 0.4s var(--transition-main);
  background: var(--color-bg);
}

.product-card:hover {
  border-color: var(--color-accent);
  transform: translateY(-8px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.img-wrapper {
  aspect-ratio: 1;
  background: var(--color-surface);
  overflow: hidden;
  position: relative;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--transition-main);
}

.product-card:hover img {
  transform: scale(1.05);
}

.photo-count {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  padding: 4px 8px;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  color: var(--color-accent);
}

.batch-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #000;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  z-index: 2;
  box-shadow: 0 0 10px rgba(195, 255, 0, 0.2);
}

.price-tag {
  position: absolute;
  bottom: 0px;
  left: 0px;
  background: var(--color-accent);
  color: #000;
  padding: 8px 15px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.4rem;
  z-index: 2;
}

.info .brand {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.info h3 {
  font-size: 1.1rem;
  margin-top: 5px;
  color: var(--color-text-primary);
  /* Truncate long titles */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 3.2rem; /* Consistent height */
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}

.id-tag, .yuan-tag {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.yuan-tag {
  opacity: 0.8;
  color: var(--color-accent);
}

/* Responsive */
@media (max-width: 768px) {
  .product-card {
    padding: 10px;
    gap: 10px;
  }

  .price-tag {
    padding: 6px 12px;
    font-size: 1.1rem;
  }

  .info .brand {
    font-size: 0.6rem;
  }

  .info h3 {
    font-size: 0.95rem;
    height: 2.8rem;
  }
}
</style>
