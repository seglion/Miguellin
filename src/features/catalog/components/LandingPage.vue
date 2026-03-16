<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../hooks/useAuthStore';

const emit = defineEmits<{
  (e: 'enter'): void;
}>();

const authStore = useAuthStore();
const password = ref('');

const handleEnter = () => {
    if (authStore.login(password.value)) {
        emit('enter');
    }
};
</script>

<template>
  <section class="landing-page">
    <div class="newsprint-texture"></div>
    <div class="halftone-overlay"></div>
    
    <div class="content-wrapper">
      <div class="brand-container">
        <h1 class="brand-name spiderpunk">
          <div class="letter-row miguel-row">
            <span class="letter cutout-1">M</span>
            <span class="letter cutout-2">I</span>
            <span class="letter cutout-3">G</span>
            <span class="letter cutout-4">U</span>
            <span class="letter cutout-5">E</span>
            <span class="letter cutout-6">L</span>
          </div>
          <div class="letter-row lin-row">
            <span class="letter cutout-7">L</span>
            <span class="letter cutout-8">I</span>
            <span class="letter cutout-9">N</span>
          </div>
        </h1>
        <div class="sticker-tag punk-meta">SPRING ARCHIVE 2024</div>
      </div>

      <div class="cta-container">
        <div class="auth-box jagged-box">
          <input 
            type="password" 
            v-model="password" 
            placeholder="ACCESS CODE / CLAVE"
            @keyup.enter="handleEnter"
            class="auth-input"
            :class="{ 'error-shake': authStore.error }"
          />
          <button class="enter-btn" @click="handleEnter">
            <span class="btn-content">ENTER ARCHIVE</span>
          </button>
          <div v-if="authStore.error" class="auth-error">
            {{ authStore.error }}
          </div>
        </div>
        <p class="tagline">PREMIUM CURATION OF HIGH-END COLLECTIBLES AND STREET APPAREL.</p>
      </div>
    </div>

    <div class="decoration hand-drawn-arrow"></div>
  </section>
</template>

<style scoped>
.landing-page {
  width: 100vw;
  height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.newsprint-texture {
  position: absolute;
  inset: 0;
  background-image: url('https://www.transparenttextures.com/patterns/asfalt-dark.png');
  opacity: 0.05;
  pointer-events: none;
}

.halftone-overlay {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px);
  background-size: 8px 8px;
  pointer-events: none;
}

.content-wrapper {
  z-index: 10;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 50px;
  width: 100%;
  max-width: 500px;
  padding: 20px;
}

/* Spider-Punk Comic Styles */
.brand-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spiderpunk {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.letter-row {
  display: flex;
  gap: 4px;
}

.letter {
  display: inline-block;
  font-family: var(--font-display);
  font-size: clamp(3rem, 15vw, 7rem);
  padding: 5px 15px;
  background: #fff;
  color: #000;
  text-transform: uppercase;
  position: relative;
  transition: all 0.15s steps(3);
  user-select: none;
  border: 4px solid #000;
  box-shadow: 6px 6px 0 #000;
}

/* Specific offsets for DIY look */
.cutout-1 { transform: rotate(-3deg); background: var(--color-accent); color: #fff; }
.cutout-2 { transform: rotate(2deg); background: #000; color: #fff; }
.cutout-3 { transform: rotate(-5deg); }
.cutout-4 { transform: rotate(4deg); background: var(--color-vibrant-2); }
.cutout-5 { transform: rotate(-2deg); }
.cutout-6 { transform: rotate(6deg); background: var(--color-vibrant-1); }

.cutout-7 { transform: rotate(-4deg); background: #000; color: #fff; }
.cutout-8 { transform: rotate(3deg); background: var(--color-accent); color: #fff; }
.cutout-9 { transform: rotate(-2deg); }

.letter:hover {
  transform: scale(1.1) rotate(0deg) !important;
  z-index: 10;
  box-shadow: 10px 10px 0 #000;
}

.sticker-tag {
  background: var(--color-vibrant-2);
  color: #000;
  padding: 8px 25px;
  margin-top: 20px;
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 0.8rem;
  transform: rotate(-3deg);
  border: 2px solid #000;
  box-shadow: 4px 4px 0 #000;
}

.cta-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.jagged-box {
  background: #fff;
  border: 3px solid #000;
  padding: 30px;
  box-shadow: var(--shadow-long);
  width: 100%;
  clip-path: polygon(1% 1%, 100% 0%, 99% 99%, 0% 100%);
}

.auth-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-input {
  background: #eee;
  border: 2px solid #000;
  padding: 15px;
  color: #000;
  font-family: var(--font-mono);
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
  outline: none;
  width: 100%;
}

.auth-input:focus {
  background: #fff;
  border-color: var(--color-accent);
}

.enter-btn {
  background: #000;
  color: #fff;
  border: none;
  padding: 18px 40px;
  font-family: var(--font-display);
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s steps(2);
  width: 100%;
  position: relative;
}

.enter-btn:hover {
  background: var(--color-accent);
  color: #fff;
  transform: translate(-3px, -3px);
  box-shadow: 6px 6px 0 #000;
}

.auth-error {
  color: #fff;
  background: #ff4444;
  padding: 5px 10px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  border: 2px solid #000;
}

.tagline {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: bold;
  color: #000;
  max-width: 250px;
  line-height: 1.2;
  text-align: center;
}

.error-shake {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

@media (max-width: 768px) {
  .letter {
    font-size: clamp(2rem, 12vw, 4rem);
    padding: 4px 10px;
    border-width: 3px;
    box-shadow: 4px 4px 0 #000;
  }
  
  .jagged-box {
    padding: 20px;
  }

  .enter-btn {
    padding: 15px 30px;
    font-size: 1.2rem;
  }
}
</style>
