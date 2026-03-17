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
            <div class="category-tag sticker">{{ catalogStore.selectedAlbum.brand || catalogStore.selectedAlbum.category }}</div>
            <h2 class="title">{{ catalogStore.selectedAlbum.title }}</h2>
            
            <div v-if="catalogStore.selectedAlbum.price" class="price-box jagged-edge">
              <span class="label">FINAL_PRICE</span>
              <span class="value">€{{ catalogStore.selectedAlbum.price }}</span>
            </div>
            
            <div v-if="catalogStore.selectedAlbum.batch" class="batch-detail">
              <span class="label">BATCH / LOTE</span>
              <span class="value">{{ catalogStore.selectedAlbum.batch }}</span>
            </div>
            
            <div class="id-info">
                <span class="marker">REF_</span>
                <span>{{ catalogStore.selectedAlbum.id }}</span>
            </div>
          </div>
          
          <div class="description-box" v-if="filteredDescription">
            <div class="desc-label">DESCRIPTION //</div>
            <p class="desc-text">{{ filteredDescription }}</p>
          </div>

          <div class="sidebar-decoration halftone"></div>
        </aside>

        <div class="photo-gallery">
          <div v-for="(photo, index) in catalogStore.selectedAlbum.photos" :key="photo.id" class="photo-item">
            <img :src="getImageUrl(photo)" :alt="`${catalogStore.selectedAlbum.title} image ${Number(index) + 1}`" loading="lazy" />
            <div class="image-label">ML_ARCHIVE_IMG_{{ index + 1 }}</div>
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
  background: rgba(240, 240, 240, 0.95);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
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
  top: 30px;
  right: 30px;
  background: #000;
  border: none;
  color: #fff;
  padding: 10px 20px;
  font-family: var(--font-display);
  font-size: 1rem;
  cursor: pointer;
  z-index: 50;
  box-shadow: 4px 4px 0 var(--color-accent);
}

.close-btn:hover {
  background: var(--color-accent);
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

.album-sidebar {
  width: 450px;
  height: 100%;
  padding: 80px 50px;
  border-right: 6px solid #000;
  display: flex;
  flex-direction: column;
  gap: 40px;
  background: #fff;
  position: relative;
  z-index: 20;
  overflow-y: auto;
  flex-shrink: 0;
}

.category-tag {
  margin-bottom: 20px;
  display: inline-block;
}

.meta .title {
  font-family: var(--font-display);
  font-size: 3.5rem;
  line-height: 0.9;
  margin-bottom: 30px;
  color: #000;
  text-transform: uppercase;
  word-break: break-word;
}

.price-box {
  background: #000;
  color: #fff;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: fit-content;
  margin-bottom: 30px;
  box-shadow: 8px 8px 0 var(--color-vibrant-1);
}

.price-box .label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-vibrant-2);
  font-weight: 900;
}

.price-box .value {
  font-family: var(--font-display);
  font-size: 3rem;
}

.batch-detail {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.batch-detail .label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 900;
  color: #666;
}

.batch-detail .value {
  font-family: var(--font-display);
  font-size: 1.8rem;
  background: var(--color-accent);
  color: #fff;
  padding: 5px 15px;
  width: fit-content;
  border: 3px solid #000;
  transform: rotate(-1deg);
}

.id-info {
  margin-top: 30px;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 900;
  color: #999;
}

.yuan-val {
  color: var(--color-accent);
  margin-left: 10px;
}

.description-box {
  background: #f9f9f9;
  border: 3px solid #000;
  padding: 20px;
  position: relative;
  clip-path: polygon(0% 0%, 100% 2%, 98% 100%, 2% 98%);
}

.desc-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 900;
  color: #000;
  margin-bottom: 10px;
}

.desc-text {
  font-family: var(--font-body);
  font-size: 0.95rem;
  line-height: 1.5;
  color: #333;
}

.sidebar-decoration {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 150px;
  height: 150px;
  z-index: -1;
}

.photo-gallery {
  flex-grow: 1;
  height: 100%;
  overflow-y: auto;
  padding: 80px;
  display: flex;
  flex-direction: column;
  gap: 100px;
  align-items: center;
  background-image: 
    linear-gradient(rgba(200,200,200,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200,200,200,0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}

.photo-item {
  width: 100%;
  max-width: 900px;
  position: relative;
}

.photo-item img {
  width: 100%;
  height: auto;
  display: block;
  border: 5px solid #000;
  box-shadow: 15px 15px 0 rgba(0,0,0,0.1);
  background: #fff;
}

.image-label {
  position: absolute;
  bottom: -30px;
  right: 0;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 900;
  color: #999;
}

/* Responsive Structural Fix */
@media (max-width: 900px) {
  .viewer-content {
    flex-direction: column !important;
    overflow-y: auto !important;
  }

  .album-sidebar {
    width: 100% !important;
    height: auto !important;
    padding: 100px 30px 40px !important;
    border-right: none !important;
    border-bottom: 6px solid #000 !important;
    flex-shrink: 0 !important;
  }

  .meta .title {
    font-size: 2.5rem !important;
    margin-bottom: 20px !important;
  }

  .price-box .value {
    font-size: 2.2rem !important;
  }

  .photo-gallery {
    padding: 60px 20px !important;
    gap: 60px !important;
    height: auto !important;
    overflow-y: visible !important;
    flex-grow: 0 !important;
    flex-shrink: 0 !important;
  }

  .close-btn {
    top: 20px !important;
    right: 20px !important;
    padding: 8px 15px !important;
    font-size: 0.8rem !important;
  }
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Scrollbar */
.photo-gallery::-webkit-scrollbar, .album-sidebar::-webkit-scrollbar, .viewer-content::-webkit-scrollbar {
  width: 8px;
}
.photo-gallery::-webkit-scrollbar-thumb, .album-sidebar::-webkit-scrollbar-thumb, .viewer-content::-webkit-scrollbar-thumb {
  background: #000;
}
</style>
