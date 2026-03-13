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
  // authStore handles the login, the computed showCatalog will react
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
  // Close sidebar on mobile after selection
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false;
  }
};

// Auto-expand parent if active child found
watch(() => catalogStore.selectedCategory, (newCat) => {
  if (!newCat) return;
  catalogStore.categoryItems.forEach(parent => {
    if (parent.children && parent.children.some(c => c.name === newCat)) {
      expandedParents.value.add(parent.name);
    }
  });
}, { immediate: true });

// Manage body scroll based on view and viewer state
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
    <Transition name="slide-up" mode="out-in">
      <LandingPage v-if="!showCatalog" @enter="enterArchive" />
      
      <div v-else class="layout" :class="{ 'sidebar-open': isSidebarOpen }">
        <!-- Mobile Header -->
        <header class="mobile-header">
          <div class="logo">MIGUEL LIN</div>
          <button class="menu-toggle" @click="toggleSidebar">
            <span class="icon">{{ isSidebarOpen ? '✕' : '☰' }}</span>
          </button>
        </header>

        <!-- Overlay -->
        <div class="sidebar-overlay" @click="toggleSidebar"></div>

        <!-- Vertical Sidebar Anchor -->
        <aside class="sidebar">
          <div class="logo desktop-only">MIGUEL LIN</div>
          
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
                <span class="chevron" v-if="parent.children && parent.children.length > 0">
                  {{ expandedParents.has(parent.name) ? '▾' : '▸' }}
                </span>
                {{ parent.name.toUpperCase() }}
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
            <button class="logout-btn" @click="handleLogout">LOGOUT / SALIR</button>
            <div class="footer-meta">MIGUEL LIN © 2024</div>
          </div>
        </aside>

        <main class="content">
          <header class="section-header">
            <h1>{{ catalogStore.selectedCategory || 'Drops.' }}</h1>
            <p class="subtitle">Archive of quality apparel and collectibles.</p>
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
  display: block;
  width: 100%;
}

.mobile-header {
  display: none;
  height: 60px;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding: 0 20px;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.menu-toggle {
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
}

.sidebar {
  width: 280px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 40px;
  justify-content: space-between;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
  background: var(--color-bg);
  z-index: 1000;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 900;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.logo {
  font-family: var(--font-display);
  font-size: 2rem;
  letter-spacing: -2px;
  color: var(--color-accent);
  margin-bottom: 40px;
}

.desktop-only {
  display: block;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.cat-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cat-item {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s var(--transition-main);
  line-height: 1.4;
}

.cat-item.parent {
  color: var(--color-text-primary);
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chevron {
  font-size: 0.6rem;
  color: var(--color-text-secondary);
  width: 12px;
  transition: transform 0.3s ease;
}

.cat-item.parent.expanded .chevron {
  color: var(--color-accent);
}

.cat-item.child {
  font-size: 0.75rem;
  letter-spacing: 1px;
  padding-left: 20px;
  font-weight: 400;
  color: var(--color-text-secondary);
}

.cat-item:hover, .cat-item.active {
  color: var(--color-accent);
  transform: translateX(5px);
}

.cat-item.parent.active::before {
  content: "— ";
  color: var(--color-accent);
}

.cat-item.child.active {
  color: var(--color-accent);
  font-weight: 600;
}

.sub-categories {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-left: 1px solid var(--color-border);
  margin-left: 5px;
}

.content {
  margin-left: 280px;
  padding: 80px;
  flex: 1;
  min-width: 0;
}

.section-header {
  margin-bottom: 60px;
}

.section-header h1 {
  font-size: 5rem;
  line-height: .9;
  margin-bottom: 10px;
  word-break: break-word;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.footer-meta {
  font-size: 0.6rem;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
  margin-top: 40px;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 40px;
}

.logout-btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  padding: 8px 15px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  letter-spacing: 1px;
}

.logout-btn:hover {
  border-color: #ff4444;
  color: #ff4444;
}

/* Responsive */
@media (max-width: 1024px) {
  .section-header h1 {
    font-size: 4rem;
  }
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }

  .desktop-only {
    display: none;
  }

  .sidebar {
    transform: translateX(-100%);
    box-shadow: 20px 0 50px rgba(0,0,0,0.5);
  }

  .sidebar-open .sidebar {
    transform: translateX(0);
  }

  .sidebar-open .sidebar-overlay {
    display: block;
    opacity: 1;
  }

  .content {
    margin-left: 0;
    padding: 30px 20px;
  }

  .section-header {
    margin-bottom: 30px;
  }

  .section-header h1 {
    font-size: 3rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }
}

.app-root {
  width: 100%;
  min-height: 100vh;
}

/* Transition: Slide Up */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-50px) scale(1.05);
}
</style>
