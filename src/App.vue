<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useCatalogStore } from './features/catalog/hooks/useCatalogStore';
import CatalogGrid from './features/catalog/components/CatalogGrid.vue';
import AlbumViewer from './features/catalog/components/AlbumViewer.vue';
import LandingPage from './features/catalog/components/LandingPage.vue';
import { useAuthStore } from './features/catalog/hooks/useAuthStore';

const catalogStore = useCatalogStore();
const authStore = useAuthStore();
const expandedParents = ref<Set<string>>(new Set());
const isSidebarOpen = ref(false);

const showCatalog = computed(() => authStore.isLoggedIn);

onMounted(() => {
  catalogStore.init();
});

const enterArchive = () => {
  // authStore handles the login
};

const handleLogout = () => {
    authStore.logout();
    isSidebarOpen.value = false;
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const toggleParent = (name: string) => {
  if (expandedParents.value.has(name)) {
    expandedParents.value.delete(name);
  } else {
    expandedParents.value.add(name);
  }
};

const handleCategoryClick = (cat: string, parentName?: string) => {
  catalogStore.selectCategory(cat);
  if (parentName) {
    expandedParents.value.add(parentName);
  }
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false;
  }
};

watch(() => catalogStore.selectedCategory, (newCat) => {
  if (!newCat) return;
  
  // 1. Check if it's a parent category itself
  const isParent = catalogStore.categoryItems.some(p => p.name === newCat);
  if (isParent) {
    expandedParents.value.add(newCat);
    return;
  }

  // 2. If it's a child, check if any already expanded parent contains it
  const alreadyVisible = Array.from(expandedParents.value).some(pName => {
    const parent = catalogStore.categoryItems.find(p => p.name === pName);
    return parent?.children?.some(c => c.name === newCat);
  });

  if (alreadyVisible) return;

  // 3. Otherwise, find the FIRST matching parent and expand it
  const parentToExpand = catalogStore.categoryItems.find(parent => 
    parent.children?.some(c => c.name === newCat)
  );
  
  if (parentToExpand) {
    expandedParents.value.add(parentToExpand.name);
  }
}, { immediate: true });

watch([() => authStore.isLoggedIn, () => catalogStore.isViewerOpen], ([shown, viewerOpen]) => {
  if (!shown || viewerOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}, { immediate: true });
</script>

<template>
  <div class="app-root">
    <Transition name="fade" mode="out-in">
      <LandingPage v-if="!showCatalog" @enter="enterArchive" />
      
      <div v-else class="layout" :class="{ 'sidebar-open': isSidebarOpen }">
        <header class="mobile-header">
          <div class="logo-small">MIGUEL LIN</div>
          <button class="menu-toggle" @click="toggleSidebar">
             <span class="burger-icon" :class="{ 'is-active': isSidebarOpen }"></span>
          </button>
        </header>

        <div class="sidebar-overlay" @click="toggleSidebar"></div>

        <aside class="sidebar">
          <div class="sidebar-inner">
            <div class="logo-container desktop-only">
              <h1 class="logo-main">MIGUEL LIN</h1>
              <div class="logo-accent">ARCHIVE // V.24</div>
            </div>
            
            <div class="search-box">
              <input 
                v-model="catalogStore.searchQuery" 
                type="text" 
                placeholder="SEARCH ARCHIVE..."
                class="search-input"
              />
              <button 
                v-if="catalogStore.searchQuery" 
                @click="catalogStore.searchQuery = ''" 
                class="clear-search"
              >✕</button>
            </div>

            <nav class="categories">
              <div v-for="parent in catalogStore.categoryItems" :key="parent.name" class="cat-group">
                <div 
                  class="cat-item parent" 
                  :class="{ 
                    active: catalogStore.selectedCategory === parent.name,
                    expanded: expandedParents.has(parent.name) 
                  }"
                  @click="toggleParent(parent.name); handleCategoryClick(parent.name)"
                >
                  <span class="marker">{{ expandedParents.has(parent.name) ? '●' : '○' }}</span>
                  <span class="label">{{ parent.name.toUpperCase() }}</span>
                </div>
                
                <div v-if="parent.children && parent.children.length > 0 && expandedParents.has(parent.name)" class="sub-categories">
                  <div 
                    v-for="child in parent.children" 
                    :key="child.name"
                    class="cat-item child" 
                    :class="{ active: catalogStore.selectedCategory === child.name }"
                    @click="handleCategoryClick(child.name, parent.name)"
                  >
                    {{ child.name }}
                  </div>
                </div>
              </div>
            </nav>

            <div class="sidebar-footer">
              <button class="logout-btn" @click="handleLogout">EXIT ARCHIVE</button>
              <div class="footer-meta">ML©2024_PUNK_EDITION</div>
            </div>
          </div>
        </aside>

        <main class="content">
          <div class="newsprint-texture"></div>
          <header class="section-header">
            <h1 class="page-title">{{ catalogStore.selectedCategory || 'THE FEED' }}</h1>
            <div class="page-meta">CURATED HIGH-END SNEAKERS & STREETWEAR</div>
          </header>

          <CatalogGrid />
        </main>

        <AlbumViewer />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  width: 100%;
  background: var(--color-bg);
}

.mobile-header {
  display: none;
  height: 70px;
  background: #fff;
  border-bottom: 3px solid #000;
  padding: 0 25px;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1100;
}

.logo-small {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  color: #000;
  letter-spacing: -1px;
}

.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.burger-icon {
  width: 24px;
  height: 3px;
  background: #000;
  position: relative;
  transition: all 0.3s ease;
}

.burger-icon::before, .burger-icon::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 3px;
  background: #000;
  left: 0;
  transition: all 0.3s ease;
}

.burger-icon::before { top: -8px; }
.burger-icon::after { bottom: -8px; }

.burger-icon.is-active {
  background: transparent;
}

.burger-icon.is-active::before {
  top: 0;
  transform: rotate(45deg);
}

.burger-icon.is-active::after {
  bottom: 0;
  transform: rotate(-45deg);
}

.sidebar {
  width: 320px;
  height: 100vh;
  position: sticky;
  top: 0;
  background: #fff;
  border-right: 4px solid #000;
  padding: 50px 40px;
  z-index: 1000;
  overflow-y: auto;
}

.sidebar-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo-container {
  margin-bottom: 50px;
}

.logo-main {
  font-family: var(--font-display);
  font-size: 2.8rem;
  line-height: 0.9;
  color: #000;
  margin: 0;
}

.logo-accent {
  background: var(--color-accent);
  color: #fff;
  display: inline-block;
  padding: 2px 10px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 900;
  margin-top: 5px;
  transform: rotate(-1deg);
}

.search-box {
  margin-bottom: 40px;
  position: relative;
}

.search-input {
  width: 100%;
  background: #f5f5f5;
  border: 3px solid #000;
  padding: 15px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: bold;
  outline: none;
  box-shadow: 4px 4px 0 #000;
  transition: all 0.2s steps(2);
}

.search-input:focus {
  background: #fff;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--color-accent);
}

.categories {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.cat-item {
  cursor: pointer;
  transition: all 0.2s steps(2);
}

.cat-item.parent {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: #000;
}

.cat-item.parent.active .label {
  background: var(--color-vibrant-2);
  padding: 2px 8px;
}

.cat-item.parent .marker {
  font-size: 0.8rem;
}

.sub-categories {
  margin-top: 10px;
  margin-left: 20px;
  padding-left: 15px;
  border-left: 2px dashed #000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cat-item.child {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  color: #555;
  padding: 2px 0;
}

.cat-item.child.active {
  color: #000;
  font-weight: 800;
  text-decoration: underline wavy var(--color-accent);
}

.cat-item.child:hover {
  color: var(--color-accent);
  padding-left: 5px;
}

.sidebar-footer {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #000;
}

.logout-btn {
  width: 100%;
  background: #000;
  color: #fff;
  border: none;
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 15px;
}

.logout-btn:hover {
  background: #ff4444;
}

.footer-meta {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  color: #999;
}

.content {
  flex: 1;
  padding: 80px 60px;
  min-height: 100vh;
  position: relative;
}

.newsprint-texture {
  position: fixed;
  inset: 0;
  background-image: url('https://www.transparenttextures.com/patterns/asfalt-dark.png');
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
}

.section-header {
  position: relative;
  z-index: 10;
  margin-bottom: 60px;
}

.page-title {
  font-size: 6rem;
  line-height: 0.8;
  color: #000;
  text-transform: uppercase;
  margin: 0;
}

.page-meta {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 800;
  color: #000;
  margin-top: 15px;
  letter-spacing: 2px;
}

/* Sidebar Responsive Overlay */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(2px);
  z-index: 900;
}

/* Tablet / Mobile */
@media (max-width: 1024px) {
  .page-title {
    font-size: 4.5rem;
  }
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }
  
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: none;
    padding: 100px 30px 40px;
  }
  
  .sidebar-open .sidebar {
    transform: translateX(0);
    box-shadow: 10px 0 0 #000;
  }
  
  .sidebar-open .sidebar-overlay {
    display: block;
  }
  
  .content {
    padding: 100px 25px 40px;
    margin-left: 0;
  }
  
  .page-title {
    font-size: 3rem;
  }
  
  .desktop-only {
    display: none;
  }
}
</style>
