document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const loading = document.getElementById("loading");
  const backToTop = document.getElementById("backToTop");
  const yearEl = document.getElementById("year");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loadingStartedAt = performance.now();

  const bodyEl = document.body;
  if (bodyEl && bodyEl.classList.contains("page-enter")) {
    bodyEl.classList.remove("page-enter");
  }

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const setTheme = (theme, persist = false) => {
    html.setAttribute("data-theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#101014" : "#c62828");

    if (themeToggle) {
      const isDark = theme === "dark";
      const icon = themeToggle.querySelector("i");
      themeToggle.setAttribute("aria-pressed", String(isDark));
      icon?.classList.toggle("fa-sun", isDark);
      icon?.classList.toggle("fa-moon", !isDark);
    }

    if (persist) {
      localStorage.setItem("theme", theme);
    }
  };

  const storedTheme = localStorage.getItem("theme");
  setTheme(storedTheme || "light");

  themeToggle?.addEventListener("click", () => {
    const nextTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(nextTheme, true);
  });

  window.addEventListener("load", () => {
    if (!loading) return;
    const elapsed = performance.now() - loadingStartedAt;
    const delay = Math.max(0, 650 - elapsed);

    setTimeout(() => {
      loading.style.opacity = "0";
      loading.style.visibility = "hidden";
      setTimeout(() => loading.remove(), 360);
    }, delay);
  });

  if (window.AOS) {
    AOS.init({
      duration: 820,
      once: true,
      offset: 70,
      easing: "ease-out-cubic"
    });
  }

  if (window.gsap && !prefersReducedMotion) {
    gsap.from(".site-nav", { y: -18, opacity: 0, duration: 0.55, ease: "power2.out" });
    gsap.from(".hero-actions .btn", {
      y: 18,
      opacity: 0,
      duration: 0.55,
      stagger: 0.08,
      delay: 0.25,
      ease: "power2.out"
    });
    gsap.from(".social-profile-card", { y: 20, opacity: 0, duration: 0.75, delay: 0.12, ease: "power2.out" });
  }

  const motionItems = Array.from(document.querySelectorAll(
    ".skill-item, .technology-cloud span, .tool-tile-grid span, .snapshot-list a, .featured-projects a, .profile-detail-list li, .compact-list li, .cert-card"
  )).filter((item) => !item.hasAttribute("data-aos"));

  motionItems.forEach((item, index) => {
    item.classList.add("motion-item");
    item.style.setProperty("--motion-delay", `${(index % 8) * 55}ms`);
  });

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const motionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("motion-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

    motionItems.forEach((item) => motionObserver.observe(item));
  } else {
    motionItems.forEach((item) => item.classList.add("motion-visible"));
  }

  const resumeImage = document.getElementById("resumeImage");
  const resumeZoomIn = document.getElementById("resumeZoomIn");
  const resumeZoomOut = document.getElementById("resumeZoomOut");
  const resumeZoomReset = document.getElementById("resumeZoomReset");
  const resumeZoomLevel = document.getElementById("resumeZoomLevel");
  let resumeScale = 1;

  const updateResumeZoom = () => {
    if (!resumeImage) return;
    resumeImage.style.width = `${resumeScale * 100}%`;
    if (resumeZoomLevel) resumeZoomLevel.textContent = `${Math.round(resumeScale * 100)}%`;
    if (resumeZoomOut) resumeZoomOut.disabled = resumeScale <= 0.75;
    if (resumeZoomIn) resumeZoomIn.disabled = resumeScale >= 2;
  };

  resumeZoomIn?.addEventListener("click", () => {
    resumeScale = Math.min(2, resumeScale + 0.25);
    updateResumeZoom();
  });

  resumeZoomOut?.addEventListener("click", () => {
    resumeScale = Math.max(0.75, resumeScale - 0.25);
    updateResumeZoom();
  });

  resumeZoomReset?.addEventListener("click", () => {
    resumeScale = 1;
    updateResumeZoom();
  });

  updateResumeZoom();

  // Inline certificate lightbox.
  const certLightbox = document.getElementById('certLightbox');
  const certImg = document.getElementById('certLightboxImg');
  const certClose = certLightbox?.querySelector('.lightbox-close');
  let _lastFocusedCert = null;

  document.querySelectorAll('a.cert-link').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || a.querySelector('img')?.src;
      if (!href || !certLightbox) return;
      e.preventDefault();
      _lastFocusedCert = a;
      certImg.src = href;
      certImg.alt = a.querySelector('img')?.alt || '';
      certLightbox.classList.add('open');
      certLightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      certClose?.focus();
    });
  });

  const closeCertLightbox = () => {
    if (!certLightbox) return;
    certLightbox.classList.remove('open');
    certLightbox.setAttribute('aria-hidden', 'true');
    certImg.src = '';
    document.body.style.overflow = '';
    try { _lastFocusedCert?.focus(); } catch (err) { /* ignore */ }
  };

  certClose?.addEventListener('click', closeCertLightbox);
  certLightbox?.addEventListener('click', (ev) => { if (ev.target === certLightbox) closeCertLightbox(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeCertLightbox(); });

  const typed = document.getElementById("typed-subtitle");
  if (typed && !prefersReducedMotion) {
    const text = typed.dataset.text || typed.textContent.trim();
    let index = 0;
    typed.textContent = "";

    const typeNext = () => {
      typed.textContent = text.slice(0, index);
      index += 1;

      if (index <= text.length) {
        setTimeout(typeNext, 18);
      } else {
        typed.classList.add("typing-done");
      }
    };

    setTimeout(typeNext, 250);
  } else if (typed) {
    typed.classList.add("typing-done");
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });

      const navMenu = document.getElementById("navMenu");
      if (navMenu?.classList.contains("show") && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
      }
    });
  });

  document.querySelectorAll('a[href$=".html"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        anchor.target === "_blank"
      ) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.href === window.location.href) return;

      event.preventDefault();
      document.body.classList.add("page-exit");
      setTimeout(() => {
        window.location.href = destination.href;
      }, prefersReducedMotion ? 0 : 170);
    });
  });

  const nav = document.getElementById("mainNav");
  const updateNavShadow = () => {
    nav?.classList.toggle("nav-scrolled", window.scrollY > 16);
  };
  updateNavShadow();
  window.addEventListener("scroll", updateNavShadow, { passive: true });

  const navLinks = Array.from(document.querySelectorAll(".site-nav .nav-link"));
  const sections = navLinks
    .map((link) => {
      const href = link.getAttribute("href");
      return href && href.startsWith("#") ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  // Mark active nav link for static pages
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage || (href === 'index.html' && currentPage === '')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0
    });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const animateCounter = (el) => {
    const target = Number.parseInt(el.dataset.target || "0", 10);
    const start = target > 1000 ? target - 27 : 0;
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(start + (target - start) * eased);
      el.textContent = value.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const counters = document.querySelectorAll(".counter");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        if (entry.target.classList.contains("counter")) {
          animateCounter(entry.target);
        }

        observer.unobserve(entry.target);
      });
    }, { threshold: 0.45 });

    counters.forEach((counter) => revealObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  const updateBackToTop = () => {
    backToTop?.classList.toggle("visible", window.scrollY > 520);
  };
  updateBackToTop();
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

});
