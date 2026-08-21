/**
 * TUYỂN THÀNH VIÊN 7 CLB - INTERACTIVE LOGIC
 * Includes canvas particle system, Web Audio synthesizer, and 3D badge tilt
 */

document.addEventListener('DOMContentLoaded', () => {
  
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
    const PARTICLE_COUNT = Math.min(60, Math.floor(window.innerWidth / 22));

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.2 + 0.8;
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
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 75%, ${Math.max(0.1, Math.min(1, this.opacity))})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${this.hue}, 100%, 75%, 0.8)`;
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ==========================================
  // 3. Badge 3D Tilt & Audio Hover Interactions
  // ==========================================
  const badgeCards = document.querySelectorAll('.badge-card');

  badgeCards.forEach(card => {
    // Magnetic 3D tilt effect on hover
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const tiltX = (y / (rect.height / 2)) * -10;
      const tiltY = (x / (rect.width / 2)) * 10;
      card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px) scale(1.08)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });

    card.addEventListener('mouseenter', () => {
      playChime(659.25, 0.15); // E5 note on hover
    });

    card.addEventListener('click', () => {
      playChime(880, 0.25); // A5 note on click
    });
  });

  console.log("Ban Văn Nghệ Thể Thao - Landing page ready!");
});
