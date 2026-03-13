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
    <div class="mesh-background"></div>
    <div class="vignette"></div>
    
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
        <div class="glitch-text punk-meta" data-text="SPRING ARCHIVE 2024">SPRING ARCHIVE 2024</div>
      </div>

      <div class="cta-container">
        <div class="auth-box">
          <input 
            type="password" 
            v-model="password" 
            placeholder="ENTER ACCESS CODE"
            @keyup.enter="handleEnter"
            class="auth-input"
            :class="{ 'error-shake': authStore.error }"
          />
          <button class="enter-btn" @click="handleEnter">
            <span class="btn-content">ACCESS ARCHIVE</span>
            <span class="btn-glare"></span>
          </button>
          <div v-if="authStore.error" class="auth-error">
            {{ authStore.error }}
          </div>
        </div>
        <p class="tagline">Premium curation of high-end collectibles and street apparel.</p>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="status-indicator">
        <span class="dot"></span>
        SYSTEM READY
      </div>
      <div class="scroll-hint">SCROLL TO DISCOVER</div>
    </div>
  </section>
</template>

<style scoped>
.landing-page {
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.mesh-background {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(at 0% 0%, rgba(157, 0, 255, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(0, 242, 255, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(195, 255, 0, 0.05) 0px, transparent 40%);
  filter: blur(80px);
  animation: backgroundPulse 10s infinite alternate ease-in-out;
}

@keyframes backgroundPulse {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.1); opacity: 1; }
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%);
  pointer-events: none;
}

.content-wrapper {
  z-index: 10;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 60px;
}

/* Spider-Punk Comic Styles */
.brand-container {
  perspective: 1000px;
}

.spiderpunk {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.letter-row {
  display: flex;
  gap: 4px;
}

.letter {
  display: inline-block;
  font-family: var(--font-brand);
  font-size: clamp(3rem, 12vw, 8rem);
  font-weight: 900;
  padding: 10px 20px;
  background: #fff;
  color: #000;
  text-transform: uppercase;
  position: relative;
  transition: all 0.2s ease;
  user-select: none;
  border: 4px solid #000;
  box-shadow: 8px 8px 0 #000;
}

/* Halftone Dot Overlay */
.letter::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#000 1px, transparent 0);
  background-size: 3px 3px;
  opacity: 0.1;
  pointer-events: none;
}

/* Asymmetric Cutouts & Jagged Rotations */
.cutout-1 { transform: rotate(-3deg) translateY(5px); background: #fff; }
.cutout-2 { transform: rotate(2deg); background: var(--color-vibrant-1); color: #fff; border-radius: 0 15px 0 5px; }
.cutout-3 { transform: rotate(-5deg) translateX(-5px); background: #fff; }
.cutout-4 { transform: rotate(4deg) translateY(-8px); background: var(--color-accent); border-radius: 30% 5% 20% 0; }
.cutout-5 { transform: rotate(-2deg); background: #fff; }
.cutout-6 { transform: rotate(6deg) translateX(10px); background: var(--color-vibrant-2); color: #000; }

.cutout-7 { transform: rotate(-4deg) translateY(10px); background: #000; color: var(--color-accent); border: 4px solid var(--color-accent); }
.cutout-8 { transform: rotate(3deg); background: #fff; }
.cutout-9 { transform: rotate(-2deg) translateY(-5px); background: var(--color-vibrant-1); color: #fff; clip-path: polygon(0% 0%, 100% 0%, 100% 80%, 0% 100%); }

.letter:hover {
  transform: scale(1.1) rotate(0deg) !important;
  z-index: 10;
  background: #fff;
  color: #000;
  box-shadow: 15px 15px 0 var(--color-accent);
}

.punk-meta {
  background: #000;
  color: #fff;
  padding: 5px 20px;
  margin-top: 30px;
  font-weight: 900;
  transform: skewX(-15deg);
  border: 2px solid var(--color-vibrant-1);
}

.cta-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.enter-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.2);
  padding: 20px 60px;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: bold;
  letter-spacing: 0.2em;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(255,255,255,0.02);
}

.enter-btn:hover {
  background: #fff;
  color: #000;
  border-color: #fff;
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(255,255,255,0.1);
}

.auth-box {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 400px;
}

.auth-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  color: #fff;
  font-family: var(--font-mono);
  text-align: center;
  font-size: 0.9rem;
  letter-spacing: 0.3em;
  transition: all 0.3s ease;
  outline: none;
}

.auth-input:focus {
  border-color: var(--color-accent);
  background: rgba(255, 255, 255, 0.1);
}

.auth-error {
  color: #ff4444;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  margin-top: 5px;
  animation: fadeIn 0.3s ease;
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.btn-glare {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: 0.6s;
}

.enter-btn:hover .btn-glare {
  left: 150%;
}

.tagline {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  max-width: 300px;
  line-height: 1.6;
}

.bottom-bar {
  position: absolute;
  bottom: 40px;
  width: 100%;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--color-accent);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--color-accent);
}

/* Base styles cleanup for this view */
:global(body) {
  overflow: hidden;
}

@media (max-width: 768px) {
  .brand-name {
    font-size: 5rem;
  }
  
  .enter-btn {
    padding: 15px 40px;
    width: 80vw;
  }
}
</style>
