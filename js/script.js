const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getStoredTheme = () => {
  try {
    return window.localStorage.getItem("theme");
  } catch {
    return null;
  }
};

const storeTheme = (theme) => {
  try {
    window.localStorage.setItem("theme", theme);
  } catch {
    // The theme still works when storage is unavailable.
  }
};

root.dataset.theme = getStoredTheme() || "light";

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("mainNav");
  const navMenu = document.getElementById("navMenu");
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");
  const year = document.getElementById("year");

  if (year) year.textContent = String(new Date().getFullYear());

  const setTheme = (theme, persist = false) => {
    const isDark = theme === "dark";
    root.dataset.theme = isDark ? "dark" : "light";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#310b12" : "#681827");

    if (themeToggle) {
      const icon = themeToggle.querySelector("i");
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      icon?.classList.toggle("fa-sun", isDark);
      icon?.classList.toggle("fa-moon", !isDark);
    }

    if (persist) storeTheme(isDark ? "dark" : "light");
  };

  setTheme(root.dataset.theme);

  themeToggle?.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
  });

  document.querySelectorAll('img[loading="lazy"]').forEach((image) => {
    image.decoding = "async";
  });

  const navLinks = Array.from(document.querySelectorAll(".site-nav .nav-link[href]"));
  const currentPage = decodeURIComponent(window.location.pathname.split("/").pop() || "index.html");

  navLinks.forEach((link) => {
    const destination = new URL(link.href, window.location.href);
    const destinationPage = decodeURIComponent(destination.pathname.split("/").pop() || "index.html");
    const isCurrent = destinationPage === currentPage;
    link.classList.toggle("active", isCurrent);

    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }

    link.addEventListener("click", () => {
      if (!navMenu?.classList.contains("show") || !window.bootstrap) return;
      window.bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
    });
  });

  document.querySelectorAll(".work-collection").forEach((collection) => {
    collection.querySelectorAll("[data-work-count]").forEach((counter) => {
      const selector = counter.dataset.countSelector;
      if (selector) counter.textContent = String(collection.querySelectorAll(selector).length);
    });
  });

  const credentialCounter = document.querySelector("[data-cert-count]");
  if (credentialCounter) {
    credentialCounter.textContent = String(document.querySelectorAll(".cert-card").length);
  }

  document.querySelectorAll(".cert-meta-top small").forEach((recordNumber) => {
    recordNumber.setAttribute("aria-hidden", "true");
  });

  if (window.location.hash) {
    const requestedTarget = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    const requestedCollection = requestedTarget?.classList.contains("work-collection")
      ? requestedTarget
      : requestedTarget?.closest(".work-collection");
    if (requestedCollection) {
      requestedCollection.open = true;
      requestAnimationFrame(() => (requestedTarget || requestedCollection).scrollIntoView({ block: "start" }));
    }
  }

  const progress = document.createElement("div");
  const progressBar = document.createElement("span");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.append(progressBar);
  nav?.append(progress);

  let scrollFrame = 0;
  const updateScrollUI = () => {
    scrollFrame = 0;
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const ratio = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
    progressBar.style.transform = `scaleX(${ratio})`;
    backToTop?.classList.toggle("visible", window.scrollY > 520);
  };

  const queueScrollUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateScrollUI);
  };

  updateScrollUI();
  window.addEventListener("scroll", queueScrollUpdate, { passive: true });
  window.addEventListener("resize", queueScrollUpdate, { passive: true });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  const revealItems = Array.from(document.querySelectorAll(
    "[data-aos], .technology-cloud span, .featured-projects a, .profile-detail-list li, .compact-list li"
  )).filter((item) => !item.classList.contains("social-profile-card"));

  revealItems.forEach((item, index) => {
    item.classList.add("motion-item");
    const explicitDelay = item.dataset.aosDelay;
    const parsedDelay = Number.parseInt(explicitDelay, 10);
    const delay = explicitDelay === undefined || !Number.isFinite(parsedDelay)
      ? (index % 6) * 45
      : parsedDelay;
    item.style.setProperty("--motion-delay", `${Math.min(delay, 220)}ms`);
  });

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("motion-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -28px" });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("motion-visible"));
  }

  const hero = document.querySelector(".social-profile-card");

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (hero && finePointer && !prefersReducedMotion) {
    hero.addEventListener("pointermove", (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      hero.style.setProperty("--pointer-x", `${(x * 100).toFixed(1)}%`);
      hero.style.setProperty("--pointer-y", `${(y * 100).toFixed(1)}%`);
    });

    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--pointer-x", "32%");
      hero.style.setProperty("--pointer-y", "36%");
    });
  }

  document.querySelectorAll("[data-tool-logo]").forEach((mark) => {
    const source = mark.dataset.toolLogo;
    if (!source) return;

    const logo = new Image();
    logo.alt = "";
    logo.decoding = "async";

    logo.addEventListener("load", () => {
      mark.prepend(logo);
      mark.classList.add("is-logo-loaded");
    }, { once: true });

    logo.src = source;
  });

  document.querySelectorAll("[data-experience-image]").forEach((card) => {
    const source = card.dataset.experienceImage;
    if (!source) return;

    const image = new Image();
    image.className = "experience-card-background";
    image.alt = "";
    image.decoding = "async";

    image.addEventListener("load", () => {
      card.prepend(image);
      card.classList.add("has-experience-image");
    }, { once: true });

    image.src = source;
  });

  const socialWorkModal = document.getElementById("socialWorkModal");
  const socialWorkModalTitle = document.getElementById("socialWorkModalTitle");
  const socialWorkModalLogo = document.getElementById("socialWorkModalLogo");
  const socialWorkSelectedPreview = document.getElementById("socialWorkSelectedPreview");
  const socialWorkPreviewImage = document.getElementById("socialWorkPreviewImage");
  const socialWorkPreviewCaption = document.getElementById("socialWorkPreviewCaption");
  const socialWorkPlaceholderGrid = document.getElementById("socialWorkPlaceholderGrid");
  const socialWorkPlaceholderNote = document.getElementById("socialWorkPlaceholderNote");

  socialWorkModal?.addEventListener("show.bs.modal", (event) => {
    const trigger = event.relatedTarget?.closest?.(".social-gallery-trigger");
    if (!trigger) return;

    const pageTitle = trigger.dataset.pageTitle || "Facebook page";
    const pageLogo = trigger.dataset.pageLogo || "";
    const pageAccent = trigger.dataset.pageAccent || "#1877f2";
    const previewImage = trigger.dataset.previewImage || "";
    const previewAlt = trigger.dataset.previewAlt || `${pageTitle} social media post`;

    socialWorkModal.style.setProperty("--social-page-accent", pageAccent);
    if (socialWorkModalTitle) socialWorkModalTitle.textContent = pageTitle;
    socialWorkModal.querySelectorAll("[data-social-page-name]").forEach((element) => {
      element.textContent = pageTitle;
    });

    if (socialWorkModalLogo && pageLogo) {
      socialWorkModalLogo.src = pageLogo;
      socialWorkModalLogo.alt = `${pageTitle} logo`;
    }

    if (socialWorkSelectedPreview && socialWorkPreviewImage && previewImage) {
      socialWorkPreviewImage.src = previewImage;
      socialWorkPreviewImage.alt = previewAlt;
      socialWorkSelectedPreview.hidden = false;
      if (socialWorkPreviewCaption) socialWorkPreviewCaption.textContent = previewAlt;
      if (socialWorkPlaceholderGrid) socialWorkPlaceholderGrid.hidden = true;
      if (socialWorkPlaceholderNote) socialWorkPlaceholderNote.hidden = true;
    } else {
      if (socialWorkSelectedPreview) socialWorkSelectedPreview.hidden = true;
      if (socialWorkPlaceholderGrid) socialWorkPlaceholderGrid.hidden = false;
      if (socialWorkPlaceholderNote) socialWorkPlaceholderNote.hidden = false;
    }
  });

  document.querySelectorAll("[data-social-scroll], [data-horizontal-scroll]").forEach((control) => {
    const galleryId = control.getAttribute("aria-controls");
    const gallery = galleryId ? document.getElementById(galleryId) : null;
    if (!gallery) return;

    control.addEventListener("click", () => {
      const requestedDirection = control.dataset.socialScroll || control.dataset.horizontalScroll;
      const direction = requestedDirection === "previous" ? -1 : 1;
      gallery.scrollBy({
        left: direction * Math.max(240, gallery.clientWidth * 0.72),
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  });

  const reelCounter = document.querySelector("[data-reel-count]");
  let loadedReelCount = 0;

  document.querySelectorAll("[data-reel-src]").forEach((card) => {
    const video = card.querySelector("video");
    const source = card.dataset.reelSrc;
    if (!video || !source) return;

    card.hidden = true;

    video.addEventListener("loadedmetadata", () => {
      video.controls = true;
      card.hidden = false;
      card.classList.add("has-media");
      card.classList.remove("is-empty");
      loadedReelCount += 1;
      if (reelCounter) reelCounter.textContent = String(loadedReelCount);
    }, { once: true });

    video.addEventListener("error", () => {
      card.hidden = true;
      card.classList.add("is-empty");
    }, { once: true });

    video.src = source;
    video.load();
  });

  const sideProjectCounter = document.querySelector("[data-side-project-count]");
  let loadedSideProjectCount = document.querySelectorAll(".commission-upload-card.has-media").length;
  if (sideProjectCounter) sideProjectCounter.textContent = String(loadedSideProjectCount);

  document.querySelectorAll("[data-commission-src]").forEach((card) => {
    const stage = card.querySelector(".commission-upload-stage");
    const source = card.dataset.commissionSrc;
    if (!stage || !source) return;

    card.hidden = true;

    const image = new Image();
    image.loading = "eager";
    image.decoding = "async";
    image.alt = card.dataset.commissionAlt || "Selected flyer or commissioned design";

    image.addEventListener("load", () => {
      stage.prepend(image);
      card.hidden = false;
      card.classList.add("has-media");
      card.classList.remove("is-empty");
      loadedSideProjectCount += 1;
      if (sideProjectCounter) sideProjectCounter.textContent = String(loadedSideProjectCount);
    }, { once: true });

    image.addEventListener("error", () => {
      card.hidden = true;
      card.classList.add("is-empty");
    }, { once: true });

    image.src = source;
  });

  const bindTabKeyboard = (tabs, activate) => {
    tabs.forEach((tab, index) => {
      tab.addEventListener("keydown", (event) => {
        const lastIndex = tabs.length - 1;
        const nextIndex = {
          ArrowRight: (index + 1) % tabs.length,
          ArrowDown: (index + 1) % tabs.length,
          ArrowLeft: (index - 1 + tabs.length) % tabs.length,
          ArrowUp: (index - 1 + tabs.length) % tabs.length,
          Home: 0,
          End: lastIndex
        }[event.key];

        if (nextIndex === undefined) return;
        event.preventDefault();
        activate(tabs[nextIndex]);
      });
    });
  };

  const beyondDeck = document.querySelector(".beyond-deck");
  const beyondTabs = Array.from(document.querySelectorAll(".beyond-card[role='tab']"));
  const beyondPanel = document.getElementById("beyondPanel");
  const beyondPanelType = document.getElementById("beyondPanelType");
  const beyondPanelTitle = document.getElementById("beyondPanelTitle");
  const beyondPanelCopy = document.getElementById("beyondPanelCopy");
  const beyondPanelIndex = document.getElementById("beyondPanelIndex");
  const beyondPanelIcon = beyondPanel?.querySelector(".beyond-panel-icon i");

  const activateBeyondInterest = (tab, { focus = false, scroll = false } = {}) => {
    const activeIndex = beyondTabs.indexOf(tab);
    if (activeIndex < 0 || !beyondDeck || !beyondPanel) return;

    beyondDeck.dataset.active = String(activeIndex);
    beyondTabs.forEach((item, index) => {
      const isActive = index === activeIndex;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });

    beyondPanel.setAttribute("aria-labelledby", tab.id);
    if (beyondPanelType) beyondPanelType.textContent = tab.dataset.type || "Personal interest";
    if (beyondPanelTitle) beyondPanelTitle.textContent = tab.dataset.title || "Beyond Technology";
    if (beyondPanelCopy) beyondPanelCopy.textContent = tab.dataset.copy || "";
    if (beyondPanelIndex) beyondPanelIndex.textContent = String(activeIndex + 1).padStart(2, "0");
    if (beyondPanelIcon) beyondPanelIcon.className = `fa-solid ${tab.dataset.icon || "fa-star"}`;

    if (focus) tab.focus();
    if (scroll && window.innerWidth < 768) {
      tab.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
    }

    if (!prefersReducedMotion && typeof beyondPanel.animate === "function") {
      beyondPanel.animate(
        [
          { opacity: 0.62, transform: "translateY(5px)" },
          { opacity: 1, transform: "translateY(0)" }
        ],
        { duration: 220, easing: "cubic-bezier(0.2, 0.75, 0.25, 1)" }
      );
    }
  };

  beyondTabs.forEach((tab) => {
    tab.addEventListener("click", () => activateBeyondInterest(tab));

    if (finePointer) {
      tab.addEventListener("pointerenter", () => activateBeyondInterest(tab));
    }
  });
  bindTabKeyboard(beyondTabs, (tab) => activateBeyondInterest(tab, { focus: true, scroll: true }));

  const resumeImage = document.getElementById("resumeImage");
  const resumeZoomIn = document.getElementById("resumeZoomIn");
  const resumeZoomOut = document.getElementById("resumeZoomOut");
  const resumeZoomReset = document.getElementById("resumeZoomReset");
  const resumeZoomLevel = document.getElementById("resumeZoomLevel");
  const resumeExpand = document.querySelector("[data-resume-expand]");
  let resumeScale = 1;

  const syncResumeLinks = () => {
    if (!resumeImage) return;
    const source = resumeImage.currentSrc || resumeImage.src;
    if (resumeExpand) resumeExpand.href = source;
  };

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
  syncResumeLinks();
  resumeImage?.addEventListener("load", syncResumeLinks, { once: true });

  const inertTargets = [
    document.querySelector("body > .skip-link"),
    document.querySelector("body > nav"),
    ...document.querySelectorAll("main > *"),
    document.querySelector("body > footer"),
    backToTop
  ].filter(Boolean);
  let activeLightbox = null;

  const setBackgroundInert = (value) => inertTargets.forEach((element) => (element.inert = value));

  const createLightbox = ({ id, imageId, triggerSelector, getPreview, onOpen }) => {
    const dialog = document.getElementById(id);
    const image = document.getElementById(imageId);
    const closeButton = dialog?.querySelector(".lightbox-close");
    if (!dialog || !image) return null;

    let lastFocused = null;
    let resetTimer = 0;

    const close = () => {
      if (!dialog.classList.contains("open")) return;
      dialog.classList.remove("open");
      dialog.setAttribute("aria-hidden", "true");
      dialog.inert = true;
      document.body.style.overflow = "";
      setBackgroundInert(false);
      activeLightbox = null;
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        if (dialog.classList.contains("open")) return;
        image.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
        image.alt = "";
      }, 180);
      lastFocused?.focus();
    };

    document.querySelectorAll(triggerSelector).forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        const preview = getPreview(trigger);
        if (!preview?.source) return;
        if (trigger.matches("a")) event.preventDefault();
        window.clearTimeout(resetTimer);
        lastFocused = trigger;
        image.src = preview.source;
        image.alt = preview.alt;
        onOpen?.(preview);
        dialog.classList.add("open");
        dialog.setAttribute("aria-hidden", "false");
        dialog.inert = false;
        document.body.style.overflow = "hidden";
        setBackgroundInert(true);
        activeLightbox = { close, closeButton };
        closeButton?.focus();
      });
    });

    closeButton?.addEventListener("click", close);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
    return { close };
  };

  createLightbox({
    id: "certLightbox",
    imageId: "certLightboxImg",
    triggerSelector: ".cert-link",
    getPreview: (trigger) => {
      const previewImage = trigger.querySelector("img");
      const card = trigger.closest(".cert-card");
      return {
        source: previewImage?.currentSrc || previewImage?.src,
        alt: previewImage?.alt || "Certificate preview",
        category: card?.querySelector(".cert-record-type")?.textContent?.trim() || "Credential",
        title: card?.querySelector(".cert-meta h3")?.textContent?.trim() || "Certificate preview"
      };
    },
    onOpen: ({ category, title }) => {
      const categoryLabel = document.getElementById("certLightboxCategory");
      const titleLabel = document.getElementById("certLightboxTitle");
      if (categoryLabel) categoryLabel.textContent = category;
      if (titleLabel) titleLabel.textContent = title;
    }
  });

  createLightbox({
    id: "workLightbox",
    imageId: "workLightboxImg",
    triggerSelector: ".visual-work-preview",
    getPreview: (trigger) => {
      const previewImage = trigger.querySelector("img");
      const title = trigger.dataset.workTitle || "Campaign concept";
      return {
        source: trigger.dataset.workImage || previewImage?.currentSrc || previewImage?.src,
        alt: previewImage?.alt || `${title} preview`,
        title
      };
    },
    onOpen: ({ title }) => {
      const titleLabel = document.getElementById("workLightboxTitle");
      if (titleLabel) titleLabel.textContent = title;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!activeLightbox) return;
    if (event.key === "Escape") activeLightbox.close();
    if (event.key === "Tab") activeLightbox.closeButton?.focus();
    if (event.key === "Escape" || event.key === "Tab") event.preventDefault();
  });
});
