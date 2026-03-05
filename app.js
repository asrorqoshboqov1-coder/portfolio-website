/* ============================================
   ANTIGRAVITY — ADVANCED INTERACTIVE ENGINE
   ============================================ */

"use strict";

// ==================== PARTICLE SYSTEM (HIGH FIDELITY) ====================
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -100, y: -100, active: false };
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Configuration
    this.config = {
      count: 140,
      connectionDist: 120,
      mouseRadius: 180,
      nodeColor: 'rgba(150, 200, 255, ',
      lineColor: 'rgba(77, 166, 255, '
    };

    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    this.w = this.canvas.offsetWidth;
    this.h = this.canvas.offsetHeight;
    this.canvas.width = this.w * this.pixelRatio;
    this.canvas.height = this.h * this.pixelRatio;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    this.particles = [];
    for (let i = 0; i < this.config.count; i++) {
      this.particles.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.init());
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;
    });
    window.addEventListener('mouseleave', () => this.mouse.active = false);
  }

  drawConnections(p1, i) {
    for (let j = i + 1; j < this.particles.length; j++) {
      const p2 = this.particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.config.connectionDist) {
        const alpha = (1 - dist / this.config.connectionDist) * 0.15;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.strokeStyle = this.config.lineColor + alpha + ')';
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.w, this.h);
    const time = Date.now() * 0.001;

    this.particles.forEach((p, i) => {
      // Update Position
      p.x += p.vx;
      p.y += p.vy;

      // Bounce/Wrap
      if (p.x < 0 || p.x > this.w) p.vx *= -1;
      if (p.y < 0 || p.y > this.h) p.vy *= -1;

      // Mouse Interaction
      if (this.mouse.active) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.config.mouseRadius) {
          const force = (this.config.mouseRadius - dist) / this.config.mouseRadius;
          p.x -= dx * force * 0.02;
          p.y -= dy * force * 0.02;
        }
      }

      // Draw Node
      const pulse = Math.sin(time * 2 + p.phase) * 0.3 + 0.7;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.config.nodeColor + (p.opacity * pulse) + ')';
      this.ctx.fill();

      this.drawConnections(p, i);
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ==================== TYPING EFFECT (SMOOTH) ====================
class TypingEffect {
  constructor(el, phrases) {
    this.el = el;
    this.phrases = phrases;
    this.index = 0;
    this.char = 0;
    this.isDeleting = false;
    this.tick();
  }

  tick() {
    const fullTxt = this.phrases[this.index % this.phrases.length];
    const displayTxt = this.isDeleting ? fullTxt.substring(0, this.char--) : fullTxt.substring(0, this.char++);

    this.el.textContent = displayTxt;

    let delta = 150 - Math.random() * 100;
    if (this.isDeleting) delta /= 2;

    if (!this.isDeleting && displayTxt === fullTxt) {
      delta = 2500; // Pause at end
      this.isDeleting = true;
    } else if (this.isDeleting && displayTxt === '') {
      this.isDeleting = false;
      this.index++;
      delta = 500;
    }

    setTimeout(() => this.tick(), delta);
  }
}

// ==================== MAGNETIC BUTTONS ====================
function initMagneticButtons() {
  const btns = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta, .nav-logo');

  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
      const inner = btn.querySelector('svg');
      if (inner) inner.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      const inner = btn.querySelector('svg');
      if (inner) inner.style.transform = '';
    });
  });
}

// ==================== SCROLL REVEALS ====================
function initReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: stop observing after reveal
        // observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .project-card, .skill-card, .timeline-item').forEach(el => {
    observer.observe(el);
  });
}

// ==================== NAVBAR EFFECTS ====================
function initNavbar() {
  const nav = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ==================== COUNTERS ====================
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        let count = 0;
        const increment = target / 60;

        const update = () => {
          count += increment;
          if (count < target) {
            el.innerText = Math.floor(count) + '+';
            requestAnimationFrame(update);
          } else {
            el.innerText = target + '+';
          }
        };
        update();
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ==================== CONTACT FORM ====================
function initContactForm() {
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('submitBtn');
  if (!form || !btn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const originalText = btn.innerText;
    btn.innerText = 'YUBORILMOQDA...';
    btn.disabled = true;

    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      message: document.getElementById('message').value
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        btn.innerText = 'YUBORILDI!';
        btn.style.backgroundColor = '#10b981';
        form.reset();
      } else {
        throw new Error(result.error || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Submit error:', error);
      btn.innerText = 'XATOLIK!';
      btn.style.backgroundColor = '#ef4444';
    } finally {
      setTimeout(() => {
        btn.innerText = originalText;
        btn.disabled = false;
        btn.style.backgroundColor = '';
      }, 3000);
    }
  });
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
  // Particles
  const canvas = document.getElementById('particleCanvas');
  if (canvas) new ParticleSystem(canvas);

  // Typing
  const typeEl = document.getElementById('typingText');
  if (typeEl) {
    new TypingEffect(typeEl, [
      'Full-Stack Dasturchiman',
      'UI/UX Dizayneriman',
      'Mobil Dasturchiman',
      'Kreativ Musobaqachi'
    ]);
  }

  // Interactive Modules
  initNavbar();
  initReveals();
  initMagneticButtons();
  initCounters();
  initContactForm();

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
});
