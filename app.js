// Always pin to the very top on load / reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  
  // ==========================================
  // 1. Canvas Magical Sparkles Effect (Optimized Zero-Syscall Engine)
  // ==========================================
  const canvas = document.getElementById('magic-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 150);
    }, { passive: true });

    const particles = [];
    const PARTICLE_COUNT = Math.min(45, Math.floor(window.innerWidth / 28));

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
        this.twinkleSpeed = Math.random() * 0.003 + 0.001;
        this.hue = Math.random() > 0.4 ? 290 : 50; // Purple / Gold sparkles
      }
      update(time) {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity += Math.sin((time || 0) * this.twinkleSpeed) * 0.02;
        
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
        particles[i].update(time);
        particles[i].draw();
      }
      animId = requestAnimationFrame(animateParticles);
    }
    
    animId = requestAnimationFrame(animateParticles);

    // Page Visibility API: Auto-pause canvas when user switches tab to save 100% background GPU/CPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      } else {
        if (!animId) {
          lastDraw = performance.now();
          animId = requestAnimationFrame(animateParticles);
        }
      }
    }, { passive: true });
  }

  // ==========================================
  // 2. Register Button Smooth Scroll Interaction (Direct to Clubs Grid)
  // ==========================================
  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const clubsGrid = document.getElementById('clubs-grid');
      if (clubsGrid) {
        const topPos = clubsGrid.getBoundingClientRect().top + window.pageYOffset - 35;
        window.scrollTo({
          top: topPos,
          behavior: 'smooth'
        });
      }
    });
  }

  // ==========================================
  // 3. Badge 3D Magnetic Tilt (RAF Throttled, Zero Style Conflict)
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
  });

  // ==========================================
  // 4. Sequential Intro Lifecycle (Preload Hero -> Start Intro -> Hero Reveal -> Purge Mask)
  // ==========================================
  const introOverlay = document.getElementById('intro-mask-overlay');
  const heroWitch = document.getElementById('hero-character-img');
  const titleBanner = document.getElementById('title-banner-img');

  function startIntroLifecycle() {
    if (introOverlay) {
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
