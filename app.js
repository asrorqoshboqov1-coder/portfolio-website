/* ============================================
   ANTIGRAVITY PORTFOLIO — INTERACTIVE FEATURES
   ============================================ */

// ==================== PARTICLE SYSTEM ====================
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.particleCount = 120;
    this.connectionDistance = 100;
    this.mouseInfluence = 80;

    this.resize();
    this.init();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
    this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.width = this.canvas.offsetWidth;
    this.height = this.canvas.offsetHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
  }

  drawGlowArc() {
    const cx = this.width / 2;
    const cy = this.height * 0.25;
    const arcWidth = Math.min(this.width * 0.35, 280);
    const arcHeight = 160;

    // Main glowing arc
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy + arcHeight * 0.6, arcWidth, arcHeight, 0, Math.PI, 0);

    const gradient = this.ctx.createLinearGradient(cx - arcWidth, cy, cx + arcWidth, cy);
    gradient.addColorStop(0, 'rgba(0, 100, 255, 0)');
    gradient.addColorStop(0.3, 'rgba(77, 166, 255, 0.4)');
    gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.7)');
    gradient.addColorStop(0.7, 'rgba(77, 166, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 100, 255, 0)');

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowColor = 'rgba(77, 166, 255, 0.6)';
    this.ctx.shadowBlur = 30;
    this.ctx.stroke();
    this.ctx.restore();

    // Soft glow underneath
    this.ctx.save();
    const glowGrad = this.ctx.createRadialGradient(cx, cy + arcHeight * 0.3, 0, cx, cy + arcHeight * 0.3, arcWidth * 0.8);
    glowGrad.addColorStop(0, 'rgba(77, 166, 255, 0.06)');
    glowGrad.addColorStop(0.5, 'rgba(77, 166, 255, 0.02)');
    glowGrad.addColorStop(1, 'rgba(77, 166, 255, 0)');
    this.ctx.fillStyle = glowGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw the glowing arc
    this.drawGlowArc();

    const time = Date.now() * 0.001;

    // Update and draw particles
    this.particles.forEach((p, i) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.height + 10;
      if (p.y > this.height + 10) p.y = -10;

      // Mouse influence
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.mouseInfluence) {
        const force = (this.mouseInfluence - dist) / this.mouseInfluence * 0.015;
        p.vx -= dx * force;
        p.vy -= dy * force;
      }

      // Damping
      p.vx *= 0.995;
      p.vy *= 0.995;

      // Pulsing opacity
      const pulse = Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.3 + 0.7;
      const opacity = p.opacity * pulse;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(150, 200, 255, ${opacity})`;
      this.ctx.fill();

      // Draw connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const cdx = p.x - p2.x;
        const cdy = p.y - p2.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

        if (cdist < this.connectionDistance) {
          const lineOpacity = (1 - cdist / this.connectionDistance) * 0.12;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(77, 166, 255, ${lineOpacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ==================== TYPING ANIMATION ====================
class TypingEffect {
  constructor(element, words) {
    this.element = element;
    this.words = words;
    this.wordIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.typeSpeed = 80;
    this.deleteSpeed = 40;
    this.pauseTime = 2000;
    this.type();
  }

  type() {
    const currentWord = this.words[this.wordIndex];

    if (this.isDeleting) {
      this.charIndex--;
    } else {
      this.charIndex++;
    }

    this.element.textContent = currentWord.substring(0, this.charIndex);

    let delay = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

    if (!this.isDeleting && this.charIndex === currentWord.length) {
      delay = this.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % this.words.length;
      delay = 400;
    }

    setTimeout(() => this.type(), delay);
  }
}

// ==================== SCROLL REVEALS ====================
function initScrollReveals() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

// ==================== NAVBAR SCROLL ====================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

// ==================== MOBILE MENU ====================
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');

  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });
}

// ==================== COUNTER ANIMATION ====================
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el, target) {
  let current = 0;
  const duration = 1500;
  const start = performance.now();

  function step(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.round(eased * target);

    el.textContent = current + '+';

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// ==================== SMOOTH SCROLL ====================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ==================== CONTACT FORM ====================
function handleSubmit(e) {
  e.preventDefault();

  const btn = e.target.querySelector('.btn-submit');
  const originalText = btn.innerHTML;

  // Show loading state
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    Yuborilmoqda...
  `;
  btn.style.pointerEvents = 'none';

  // Simulate send (replace with actual backend)
  setTimeout(() => {
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Yuborildi!
    `;
    btn.style.background = '#10b981';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      btn.style.pointerEvents = '';
      e.target.reset();
    }, 2500);
  }, 1500);
}

// ==================== ACTIVE NAV LINK ====================
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === '#' + current) {
        link.style.color = '#4da6ff';
      }
    });
  });
}

// ==================== ADD CSS FOR SPINNER ====================
function addDynamicStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
  // Particle canvas
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    new ParticleSystem(canvas);
  }

  // Typing effect
  const typingEl = document.getElementById('typingText');
  if (typingEl) {
    new TypingEffect(typingEl, [
      'Full-Stack Dasturchiman',
      'UI/UX Dizayneriman',
      'Mobil Dasturchiman',
      'Problem Solveriman',
      'Kreativ Koderman'
    ]);
  }

  // Init all modules
  initScrollReveals();
  initNavbar();
  initCounters();
  initSmoothScroll();
  initActiveNavLink();
  addDynamicStyles();
});
