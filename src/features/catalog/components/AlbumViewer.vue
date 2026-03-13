<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useCatalogStore } from '../hooks/useCatalogStore';
import { useAuthStore } from '../hooks/useAuthStore';

const catalogStore = useCatalogStore();
const authStore = useAuthStore();

const filteredDescription = computed(() => {
    const desc = catalogStore.selectedAlbum?.description || '';
    if (authStore.userRole === 'admin') return desc;
    
    return desc
        .split('\n')
        .filter(line => {
            const l = line.toLowerCase();
            return !l.includes('w2c') && 
                   !l.includes('weidian.com') && 
                   !l.includes('itemid=') &&
                   !l.includes('http');
        })
        .join('\n')
        .trim();
});

const close = () => {
    catalogStore.closeAlbum();
};

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
};

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});

const getImageUrl = (photo: any) => {
    return photo.url || '/' + photo.local_path;
};
</script>

<template>
  <Transition name="fade">
    <div v-if="catalogStore.isViewerOpen && catalogStore.selectedAlbum" class="viewer-overlay" @click.self="close">
      <div class="viewer-content">
        <button class="close-btn" @click="close">CLOSE [ESC]</button>
        
        <aside class="album-sidebar">
          <div class="meta">
            <span class="category">{{ catalogStore.selectedAlbum.category }}</span>
            <h2 class="title">{{ catalogStore.selectedAlbum.title }}</h2>
            <div v-if="catalogStore.selectedAlbum.price" class="price">
              <span class="label">PRICE</span>
              <span class="value">€{{ catalogStore.selectedAlbum.price }}</span>
            </div>
            <div v-if="catalogStore.selectedAlbum.batch" class="batch-detail">
              <span class="label">BATCH / LOTE</span>
              <span class="value">{{ catalogStore.selectedAlbum.batch }}</span>
            </div>
            <div class="id-info">
                <span>REF: {{ catalogStore.selectedAlbum.id }}</span>
                <span v-if="catalogStore.selectedAlbum.yuanPrice">ORIG: {{ catalogStore.selectedAlbum.yuanPrice }}Y</span>
            </div>
          </div>
          
          <div class="description" v-if="filteredDescription">
            <p>{{ filteredDescription }}</p>
          </div>
        </aside>

        <div class="photo-gallery">
          <div v-for="(photo, index) in catalogStore.selectedAlbum.photos" :key="photo.id" class="photo-item">
            <img :src="getImageUrl(photo)" :alt="`${catalogStore.selectedAlbum.title} image ${Number(index) + 1}`" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.98);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}

.viewer-content {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 40px;
  right: 40px;
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 10px 20px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s var(--transition-main);
}

.close-btn:hover {
  background: var(--color-accent);
  color: #000;
  border-color: var(--color-accent);
}

.album-sidebar {
  width: 400px;
  height: 100%;
  padding: 80px 60px;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 40px;
  background: var(--color-bg);
}

.meta .category {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-accent);
  letter-spacing: 2px;
  display: block;
  margin-bottom: 10px;
}

.meta .title {
  font-size: 3rem;
  line-height: 1;
  margin-bottom: 30px;
}

.price {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
}

.price .label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.price .value {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--color-text-primary);
}

.batch-detail {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
}

.batch-detail .label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-accent);
  letter-spacing: 1px;
}

.batch-detail .value {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 800;
  color: #000;
  text-transform: uppercase;
  background: var(--color-accent);
  padding: 8px 15px;
  display: inline-block;
  width: fit-content;
  margin-top: 5px;
  box-shadow: 0 0 20px rgba(195, 255, 0, 0.2);
}

.id-info {
    margin-top: 20px;
    display: flex;
    gap: 20px;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--color-text-secondary);
    opacity: 0.6;
}

.description {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

.photo-gallery {
  flex-grow: 1;
  height: 100%;
  overflow-y: auto;
  padding: 80px;
  display: flex;
  flex-direction: column;
  gap: 80px;
  align-items: center;
}

.photo-item {
  width: 100%;
  max-width: 800px;
}

.photo-item img {
  width: 100%;
  height: auto;
  display: block;
  border: 1px solid var(--color-border);
}

/* Responsive */
@media (max-width: 900px) {
  .viewer-content {
    flex-direction: column;
    overflow-y: auto;
  }

  .album-sidebar {
    width: 100%;
    height: auto;
    padding: 60px 30px 40px;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .meta .title {
    font-size: 2.2rem;
    margin-bottom: 20px;
  }

  .price .value {
    font-size: 2rem;
  }

  .photo-gallery {
    padding: 40px 20px;
    gap: 40px;
    height: auto;
    overflow-y: visible;
  }

  .close-btn {
    top: 20px;
    right: 20px;
    padding: 8px 15px;
    font-size: 0.6rem;
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar for gallery */
.photo-gallery::-webkit-scrollbar {
  width: 4px;
}
.photo-gallery::-webkit-scrollbar-thumb {
  background: var(--color-border);
}
</style>
