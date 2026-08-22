// Always pin to the very top on load / reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  
  // ==========================================
  // 1. Synthesized Sound Effects (Web Audio API)
  // ==========================================
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playChime(freq = 587.33, duration = 0.25) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (!audioCtx) return;
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, audioCtx.currentTime + duration);
      
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) {
      console.warn("Audio error:", e);
    }
  }

  // ==========================================
  // 2. Canvas Magical Sparkles Effect
  // ==========================================
  const canvas = document.getElementById('magic-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const PARTICLE_COUNT = Math.min(50, Math.floor(window.innerWidth / 26));

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.0 + 0.8;
        this.speedX = (Math.random() - 0.5) * 0.35;
        this.speedY = -Math.random() * 0.5 - 0.2;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.twinkleSpeed = Math.random() * 0.03 + 0.01;
        this.hue = Math.random() > 0.4 ? 290 : 50; // Purple / Gold sparkles
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity += Math.sin(Date.now() * this.twinkleSpeed) * 0.02;
        
        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset();
          this.y = height + 5;
        }
      }
      draw() {
        const alpha = Math.max(0.1, Math.min(1, this.opacity));
        // Soft outer glow (GPU-friendly, zero shadowBlur lag)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 75%, ${alpha * 0.25})`;
        ctx.fill();

        // Sharp bright core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 88%, ${alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    let isIntroPhase = true;
    let animId = null;
    let lastDraw = 0;

    // After intro finishes (2.2s), throttle particle loop to 25fps to conserve 75% GPU/CPU
    setTimeout(() => {
      isIntroPhase = false;
    }, 2200);

    function animateParticles(time) {
      if (!isIntroPhase) {
        // Throttled post-intro loop (25-30fps)
        if (time - lastDraw < 38) {
          animId = requestAnimationFrame(animateParticles);
          return;
        }
      }
      lastDraw = time;

      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animId = requestAnimationFrame(animateParticles);
    }
    
    animId = requestAnimationFrame(animateParticles);
  }

  // ==========================================
  // 3. Register Button Interaction
  // ==========================================
  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('mouseenter', () => {
      playChime(783.99, 0.18); // Play crisp magic chime on hover
    });
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      playChime(1046.50, 0.3); // High chime on click
      const titleTarget = document.getElementById('section2-title');
      if (titleTarget) {
        const topPos = titleTarget.getBoundingClientRect().top + window.pageYOffset - 30;
        window.scrollTo({
          top: topPos,
          behavior: 'smooth'
        });
      }
    });
  }

  // ==========================================
  // 4. Badge 3D Magnetic Tilt & Audio Hover (RAF Throttled, Zero Style Conflict)
  // ==========================================
  const badgeCards = document.querySelectorAll('.badge-card, .club-badge-item');

  badgeCards.forEach(card => {
    let rafId = null;

    // Magnetic 3D tilt effect on hover managed exclusively by JS
    card.addEventListener('mousemove', (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const tiltX = (y / (rect.height / 2)) * -7;
        const tiltY = (x / (rect.width / 2)) * 7;
        card.style.transform = `perspective(600px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-8px) scale(1.06)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = '';
    });

    card.addEventListener('mouseenter', () => {
      playChime(659.25, 0.15); // E5 note on hover
    });

    card.addEventListener('click', () => {
      playChime(880, 0.25); // A5 note on click
    });
  });

  // ==========================================
  // 5. Sequential Intro Lifecycle (Preload Hero -> Start Intro -> Hero Reveal -> Purge Mask)
  // ==========================================
  const introOverlay = document.getElementById('intro-mask-overlay');
  const heroWitch = document.getElementById('hero-character-img');
  const titleBanner = document.getElementById('title-banner-img');

  function startIntroLifecycle() {
    if (introOverlay) {
      // Play an enchanted chord when aperture expands
      setTimeout(() => {
        playChime(523.25, 0.35); // C5
        setTimeout(() => playChime(659.25, 0.35), 110); // E5
        setTimeout(() => playChime(783.99, 0.45), 220); // G5
        setTimeout(() => playChime(1046.50, 0.55), 330); // C6
      }, 250);

      const closeIntro = () => {
        introOverlay.classList.add('is-opened');
        setTimeout(() => {
          introOverlay.remove(); // Completely remove SVG mask from DOM to free all GPU memory
        }, 500);
      };

      // Click to fast-forward / skip intro
      introOverlay.addEventListener('click', closeIntro);

      // Auto cleanup after animation ends
      setTimeout(closeIntro, 1900);
    }
  }

  // Pre-decode Hero images before starting animations
  const decodePromises = [];
  if (heroWitch && heroWitch.decode) decodePromises.push(heroWitch.decode().catch(() => {}));
  if (titleBanner && titleBanner.decode) decodePromises.push(titleBanner.decode().catch(() => {}));

  Promise.race([
    Promise.all(decodePromises),
    new Promise(resolve => setTimeout(resolve, 200)) // Max wait 200ms fallback
  ]).then(startIntroLifecycle);

  console.log("Ban Văn Nghệ Thể Thao - Landing page ready!");
});
