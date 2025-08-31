// ========= PSA frontend enhancements (refactored) =========
(function () {
  // ---------- Utilities ----------
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const setStyles = (el, styles) => { for (const k in styles) el.style[k] = styles[k]; };

  // ---------- Mobile navigation ----------
  const navToggle = qs('.nav-toggle');
  const navLinks = qs('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const next = !(navToggle.getAttribute('aria-expanded') === 'true');
      navToggle.classList.toggle('active', next);
      navLinks.classList.toggle('active', next);
      navToggle.setAttribute('aria-expanded', String(next));
    });

    // Close on link click (event delegation)
    navLinks.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link');
      if (!link) return;
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  }

  // ---------- Active nav + TOC highlighting ----------
  const sectionNodes = qsa('section, header');
  const navItems = qsa('.nav-link');
  const tocItems = qsa('.toc-link');

  function setActiveNav() {
    let current = '';
    const offset = 100;
    for (const sec of sectionNodes) {
      const top = sec.offsetTop;
      if (window.pageYOffset >= top - offset) current = sec.getAttribute('id') || '';
    }
    const matchHref = `#${current}`;
    [...navItems, ...tocItems].forEach((el) => {
      const isActive = el.getAttribute('href') === matchHref;
      el.classList.toggle('active', isActive);
      if (isActive) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });
  window.addEventListener('load', setActiveNav);

  // ---------- Scroll animations ----------
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setStyles(entry.target, { opacity: '1', transform: 'translateY(0)' });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    qsa('.glass-card').forEach((card) => {
      setStyles(card, { opacity: '0', transform: 'translateY(30px)', transition: 'opacity 0.8s ease, transform 0.8s ease' });
      observer.observe(card);
    });
  }

  // ---------- Loading animation ----------
  window.addEventListener('load', () => document.body.classList.add('loaded'));

  // ---------- Smooth scroll using native behavior; offset via CSS scroll-padding-top ----------
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    const target = href ? qs(href) : null;
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---------- Floating brand animation ----------
  const navBrand = qs('.nav-brand');
  if (navBrand) {
    let t = 0;
    (function animate() {
      t += 0.015;
      const y = Math.sin(t) * 1.5;
      const x = Math.cos(t * 0.5) * 0.5;
      setStyles(navBrand, { transform: `translate(${x}px, ${y}px)` });
      requestAnimationFrame(animate);
    })();
  }

  // ---------- Background particles (respect motion preferences) ----------
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function createParticleEffect() {
    const particleCount = 50;
    const style = document.createElement('style');
    style.textContent = `@keyframes particleFloat { 0%,100%{transform:translateY(0) rotate(0);opacity:.1} 50%{transform:translateY(-20px) rotate(180deg);opacity:.3} }`;
    document.head.appendChild(style);
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `position:fixed;width:4px;height:4px;background:rgba(255,255,255,.1);border-radius:50%;pointer-events:none;z-index:-1;left:${Math.random()*100}vw;top:${Math.random()*100}vh;animation:particleFloat ${Math.random()*10+5}s ease-in-out infinite;animation-delay:${Math.random()*5}s;`;
      document.body.appendChild(p);
    }
  }
  if (!prefersReduced && window.innerWidth > 768) createParticleEffect();

  // ---------- Scroll progress bar ----------
 

  // ---------- Hover effects (idempotent) ----------
  qsa('.nav-link, .glass-card, .support-badge, .contributor-category').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (el.dataset.scaled === '1') return;
      el.style.transform = (el.style.transform || '') + ' scale(1.02)';
      el.dataset.scaled = '1';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = (el.style.transform || '').replace(' scale(1.02)', '');
      el.dataset.scaled = '0';
    });
  });
})();

// Add keyboard navigation support (re-query elements in this scope)
document.addEventListener('keydown', (e) => {
  const navToggleEl = document.querySelector('.nav-toggle');
  const navLinksEl = document.querySelector('.nav-links');
  if (e.key === 'Escape' && navLinksEl && navLinksEl.classList.contains('active')) {
    navToggleEl && navToggleEl.classList.remove('active');
    navLinksEl.classList.remove('active');
    navToggleEl && navToggleEl.setAttribute('aria-expanded', 'false');
  }
});

// (Removed duplicate global hover handlers; handled above)

// Add dynamic theme switching capability (for future enhancement)
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Theme toggle functionality (can be activated later)
  window.toggleTheme = function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };
}

initializeTheme();

// Hardcode timeline and footer dates
// Pulls the current time/date of the visitors system and updates "Still ongoing" accordingly
// "Resolved" function added see Index.html

// (Removed hardcoded timeline/footer date mutator to avoid stale content)

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// (Removed artificial re-dispatch of scroll events)

// (Removed redundant aria-label additions on nav links)

if (document.querySelector('.nav-toggle')) {
  const nt = document.querySelector('.nav-toggle');
  nt.setAttribute('aria-label', 'Toggle navigation menu');
  if (!nt.hasAttribute('aria-expanded')) nt.setAttribute('aria-expanded', 'false');
}

// Research page: fetch GitHub activity for OpenCentauri/OpenCentauri
(function initResearchGitHubFeed() {
  const commitsEl = document.getElementById('gh-commits');
  const issuesEl = document.getElementById('gh-issues');
  const pullsEl = document.getElementById('gh-pulls');
  if (!commitsEl && !issuesEl && !pullsEl) return;

  const repo = 'OpenCentauri/OpenCentauri';

  // Helper to create list items safely
  function addItem(listEl, html) {
    if (!listEl) return;
    const li = document.createElement('li');
    li.innerHTML = html;
    listEl.appendChild(li);
  }

  // Fetch recent commits via Netlify proxy
  fetch(`/.netlify/functions/gh-proxy?repo=${encodeURIComponent(repo)}&resource=commits&per_page=5`)
    .then(r => r.ok ? r.json() : [])
    .then(data => {
      if (!Array.isArray(data)) return;
      data.forEach(c => {
        addItem(commitsEl, `<a href="${url}" target="_blank">${msg}</a> <code>#${sha}</code>`);
        const sha = (c.sha || '').substring(0,7);
        const url = c.html_url || `https://github.com/${repo}/commit/${c.sha}`;
        addItem(commitsEl, `<a href="${url}" target="_blank" rel="noopener noreferrer">${msg}</a> <code>#${sha}</code>`);
      });
    }).catch(() => {});

  // Fetch open issues via Netlify proxy
  fetch(`/.netlify/functions/gh-proxy?repo=${encodeURIComponent(repo)}&resource=issues&state=open&per_page=5`)
    .then(r => r.ok ? r.json() : [])
        addItem(issuesEl, `<a href="${i.html_url}" target="_blank">#${i.number} ${i.title}</a>`);
      if (!Array.isArray(data)) return;
      data.filter(i => !i.pull_request).forEach(i => {
        addItem(issuesEl, `<a href="${i.html_url}" target="_blank" rel="noopener noreferrer">#${i.number} ${i.title}</a>`);
      });
    }).catch(() => {});

  // Fetch open pull requests via Netlify proxy
  fetch(`/.netlify/functions/gh-proxy?repo=${encodeURIComponent(repo)}&resource=pulls&state=open&per_page=5`)
    .then(r => r.ok ? r.json() : [])
        addItem(pullsEl, `<a href="${p.html_url}" target="_blank">#${p.number} ${p.title}</a>`);
      if (!Array.isArray(data)) return;
      data.forEach(p => {
        addItem(pullsEl, `<a href="${p.html_url}" target="_blank" rel="noopener noreferrer">#${p.number} ${p.title}</a>`);
      });
    }).catch(() => {});
})();
