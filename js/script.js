const root = document.documentElement;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let prefersReducedMotion = reducedMotionQuery.matches;

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

  const homePage = document.querySelector(".editorial-home");
  let updateHomeScrollMotion = () => {};
  let heroPointerBounds = null;

  const progress = document.createElement("div");
  const progressBar = document.createElement("span");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.append(progressBar);
  document.body.append(progress);

  let scrollFrame = 0;
  const updateScrollUI = () => {
    scrollFrame = 0;
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const ratio = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
    progressBar.style.transform = `scaleX(${ratio})`;
    backToTop?.classList.toggle("visible", window.scrollY > 520);
    heroPointerBounds = null;
    updateHomeScrollMotion();
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

  const homeMotionItems = new Set();
  const homeMotionContainers = new Set();
  const homeMotionDelays = new Map();

  if (homePage) {
    homePage.querySelectorAll(".editorial-section-head").forEach((heading) => {
      heading.classList.add("motion-heading");
      homeMotionItems.add(heading);
      homeMotionDelays.set(heading, 0);
    });

    const staggerGroups = [
      [".school-website-grid", ".school-website-card"],
      [".home-tool-groups", ".home-tool-group"],
      [".social-brand-list", ".social-brand-row"],
      [".reel-upload-rail", ".reel-upload-card"],
      [".commission-upload-grid", ".commission-upload-card"]
    ];

    staggerGroups.forEach(([groupSelector, itemSelector]) => {
      homePage.querySelectorAll(groupSelector).forEach((group) => {
        homeMotionContainers.add(group);
        group.querySelectorAll(itemSelector).forEach((item, index) => {
          const direction = index % 2 === 0 ? -1 : 1;
          const horizontalOffset = groupSelector.includes("social")
            ? 28
            : groupSelector.includes("reel") || groupSelector.includes("commission")
              ? 20
              : 14;
          item.classList.add("home-motion-card");
          homeMotionItems.add(item);
          homeMotionDelays.set(item, Math.min(index, 5) * 60);
          item.style.setProperty("--motion-x", `${direction * horizontalOffset}px`);
          item.style.setProperty("--motion-rotate", `${direction * 0.35}deg`);
        });
      });
    });

    homePage.querySelectorAll(".side-project-group").forEach((group) => {
      homeMotionContainers.add(group);
      const toolbar = group.querySelector(".media-showcase-toolbar");
      if (!toolbar) return;
      toolbar.classList.add("home-motion-subheading");
      homeMotionItems.add(toolbar);
      homeMotionDelays.set(toolbar, 0);
    });

    const contactLayout = homePage.querySelector(".editorial-contact-layout");
    if (contactLayout) contactLayout.classList.add("home-motion-panel");

    if (!prefersReducedMotion) {
      const introSelectors = [
        ".hero-kicker",
        ".profile-status",
        ".hero-name-intro",
        ".hero-name-primary",
        ".hero-name-secondary",
        ".profile-title",
        ".profile-summary",
        ".profile-location",
        ".hero-socials",
        ".hero-portrait",
        ".hero-action-panel"
      ];

      introSelectors.forEach((selector, index) => {
        const item = homePage.querySelector(selector);
        if (!item) return;
        item.classList.add("home-intro-item");
        item.style.setProperty("--home-intro-delay", `${80 + index * 65}ms`);
      });

      homePage.classList.add("home-intro-ready");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => homePage.classList.add("home-intro-visible"));
      });
    }

    const heroSection = homePage.querySelector("#home");
    const editorialSections = Array.from(homePage.querySelectorAll(".editorial-section"));
    const chapterEntries = [heroSection, ...editorialSections].filter(Boolean).map((section, index) => {
      const rawLabel = section.querySelector(".editorial-section-number")?.textContent || "";
      return {
        section,
        number: index === 0 ? "00" : String(section.dataset.section || index).padStart(2, "0"),
        label: index === 0 ? "Home" : (rawLabel.split("/").pop()?.trim() || section.querySelector("h2")?.textContent || `Section ${index}`)
      };
    });

    const chapterNav = document.createElement("nav");
    const chapterList = document.createElement("ol");
    const chapterLinks = new Map();
    chapterNav.className = "home-chapter-nav";
    chapterNav.setAttribute("aria-label", "Home page chapters");
    chapterList.className = "home-chapter-list";

    chapterEntries.forEach(({ section, number, label }) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const numberNode = document.createElement("span");
      const labelNode = document.createElement("em");
      link.href = `#${section.id}`;
      link.dataset.chapterTarget = section.id;
      numberNode.textContent = number;
      labelNode.textContent = label;
      link.append(numberNode, labelNode);
      item.append(link);
      chapterList.append(item);
      chapterLinks.set(section, link);
    });

    chapterNav.append(chapterList);
    document.body.append(chapterNav);
    homePage.classList.add("scroll-motion-ready");

    const clamp = (value, minimum = 0, maximum = 1) => Math.min(Math.max(value, minimum), maximum);

    updateHomeScrollMotion = () => {
      const viewportHeight = Math.max(window.innerHeight, 1);
      const compactMotion = window.innerWidth < 768;
      const motionScale = prefersReducedMotion ? 0 : compactMotion ? 0.42 : 1;
      const focusLine = viewportHeight * 0.46;
      let activeEntry = chapterEntries[0];
      let closestDistance = Number.POSITIVE_INFINITY;

      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        const heroTravel = Math.max(Math.min(heroRect.height * 0.82, viewportHeight), 1);
        const heroProgress = clamp((88 - heroRect.top) / heroTravel);
        homePage.style.setProperty("--hero-copy-drift", `${(-14 * heroProgress * motionScale).toFixed(2)}px`);
        homePage.style.setProperty("--hero-portrait-drift", `${(19 * heroProgress * motionScale).toFixed(2)}px`);
        homePage.style.setProperty("--hero-scroll-opacity", (1 - heroProgress * 0.14 * motionScale).toFixed(3));
      }

      editorialSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const progressValue = clamp((viewportHeight - rect.top) / Math.max(viewportHeight + rect.height, 1));
        const drift = (progressValue - 0.5) * 48 * motionScale;
        section.style.setProperty("--section-progress", prefersReducedMotion ? "1" : progressValue.toFixed(3));
        section.style.setProperty("--section-drift", `${drift.toFixed(2)}px`);

        if (section.id === "websites") {
          section.style.setProperty("--website-depth", `${((0.5 - progressValue) * 14 * motionScale).toFixed(2)}px`);
        }
      });

      chapterEntries.forEach((entry) => {
        const rect = entry.section.getBoundingClientRect();
        const containsFocusLine = rect.top <= focusLine && rect.bottom > focusLine;
        const distance = containsFocusLine ? 0 : Math.min(Math.abs(rect.top - focusLine), Math.abs(rect.bottom - focusLine));
        if (distance < closestDistance) {
          closestDistance = distance;
          activeEntry = entry;
        }
      });

      chapterEntries.forEach((entry) => {
        const isActive = entry === activeEntry;
        entry.section.classList.toggle("is-scroll-active", isActive);
        const link = chapterLinks.get(entry.section);
        link?.classList.toggle("is-active", isActive);
        if (isActive) {
          link?.setAttribute("aria-current", "location");
        } else {
          link?.removeAttribute("aria-current");
        }
      });
    };

    updateHomeScrollMotion();
  }

  const standardRevealItems = Array.from(document.querySelectorAll(
    "[data-aos], .technology-cloud span, .featured-projects a, .profile-detail-list li, .compact-list li"
  )).filter((item) => !item.classList.contains("social-profile-card") && !homeMotionContainers.has(item));

  const revealItems = Array.from(new Set([...standardRevealItems, ...homeMotionItems]));

  revealItems.forEach((item, index) => {
    item.classList.add("motion-item");
    const explicitDelay = item.dataset.aosDelay;
    const parsedDelay = Number.parseInt(explicitDelay, 10);
    const groupedDelay = homeMotionDelays.get(item);
    const delay = Number.isFinite(groupedDelay)
      ? groupedDelay
      : explicitDelay === undefined || !Number.isFinite(parsedDelay)
        ? (index % 6) * 45
        : parsedDelay;
    item.style.setProperty("--motion-delay", `${Math.min(delay, 300)}ms`);
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

  homePage?.addEventListener("focusin", (event) => {
    event.target.closest?.(".motion-item")?.classList.add("motion-visible");
  });

  reducedMotionQuery.addEventListener?.("change", (event) => {
    prefersReducedMotion = event.matches;
    if (prefersReducedMotion) revealItems.forEach((item) => item.classList.add("motion-visible"));
    queueScrollUpdate();
  });

  const hero = document.querySelector(".social-profile-card");

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (hero && finePointer && !prefersReducedMotion) {
    let pointerFrame = 0;
    let pendingPointer = null;

    const renderPointerGlow = () => {
      pointerFrame = 0;
      if (!pendingPointer || prefersReducedMotion) return;
      heroPointerBounds ||= hero.getBoundingClientRect();
      const x = (pendingPointer.x - heroPointerBounds.left) / heroPointerBounds.width;
      const y = (pendingPointer.y - heroPointerBounds.top) / heroPointerBounds.height;
      hero.style.setProperty("--pointer-x", `${(x * 100).toFixed(1)}%`);
      hero.style.setProperty("--pointer-y", `${(y * 100).toFixed(1)}%`);
    };

    hero.addEventListener("pointerenter", () => {
      heroPointerBounds = hero.getBoundingClientRect();
    });

    hero.addEventListener("pointermove", (event) => {
      pendingPointer = { x: event.clientX, y: event.clientY };
      if (!pointerFrame) pointerFrame = requestAnimationFrame(renderPointerGlow);
    });

    hero.addEventListener("pointerleave", () => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      pendingPointer = null;
      heroPointerBounds = null;
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

  const socialWorkModal = document.getElementById("socialWorkModal");
  const socialWorkModalTitle = document.getElementById("socialWorkModalTitle");
  const socialWorkModalLogo = document.getElementById("socialWorkModalLogo");
  const socialWorkSelectedPreview = document.getElementById("socialWorkSelectedPreview");
  const socialWorkPreviewImage = document.getElementById("socialWorkPreviewImage");
  const socialWorkPreviewCaption = document.getElementById("socialWorkPreviewCaption");
  const socialWorkPreviewCounter = document.getElementById("socialWorkPreviewCounter");
  const socialWorkPrevious = document.getElementById("socialWorkPrevious");
  const socialWorkNext = document.getElementById("socialWorkNext");
  const socialWorkPlaceholderGrid = document.getElementById("socialWorkPlaceholderGrid");
  const socialWorkPlaceholderNote = document.getElementById("socialWorkPlaceholderNote");
  let socialGalleryItems = [];
  let socialGalleryIndex = 0;

  const renderSocialPreview = (trigger) => {
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

    const total = socialGalleryItems.length;
    if (socialWorkPreviewCounter) socialWorkPreviewCounter.textContent = total ? `${socialGalleryIndex + 1} of ${total}` : "";
    if (socialWorkPrevious) {
      socialWorkPrevious.disabled = socialGalleryIndex <= 0;
      socialWorkPrevious.setAttribute("aria-label", socialGalleryIndex > 0
        ? `Previous post: ${socialGalleryItems[socialGalleryIndex - 1].dataset.previewAlt || "social media post"}`
        : "No previous social media post");
    }
    if (socialWorkNext) {
      socialWorkNext.disabled = socialGalleryIndex >= total - 1;
      socialWorkNext.setAttribute("aria-label", socialGalleryIndex < total - 1
        ? `Next post: ${socialGalleryItems[socialGalleryIndex + 1].dataset.previewAlt || "social media post"}`
        : "No next social media post");
    }
  };

  const moveSocialPreview = (direction) => {
    const nextIndex = socialGalleryIndex + direction;
    if (nextIndex < 0 || nextIndex >= socialGalleryItems.length) return;
    socialGalleryIndex = nextIndex;
    renderSocialPreview(socialGalleryItems[socialGalleryIndex]);
  };

  socialWorkPrevious?.addEventListener("click", () => moveSocialPreview(-1));
  socialWorkNext?.addEventListener("click", () => moveSocialPreview(1));

  socialWorkModal?.addEventListener("show.bs.modal", (event) => {
    const trigger = event.relatedTarget?.closest?.(".social-gallery-trigger-image");
    if (!trigger) return;

    const gallery = trigger.closest(".social-brand-previews-scroll");
    socialGalleryItems = gallery ? [...gallery.querySelectorAll(".social-gallery-trigger-image")] : [trigger];
    socialGalleryIndex = Math.max(0, socialGalleryItems.indexOf(trigger));
    renderSocialPreview(trigger);
  });

  socialWorkModal?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveSocialPreview(event.key === "ArrowLeft" ? -1 : 1);
  });

  document.querySelectorAll("[data-social-scroll], [data-horizontal-scroll]").forEach((control) => {
    const galleryId = control.getAttribute("aria-controls");
    const gallery = galleryId ? document.getElementById(galleryId) : null;
    if (!gallery) return;

    control.addEventListener("click", () => {
      const requestedDirection = control.dataset.socialScroll || control.dataset.horizontalScroll;
      const direction = requestedDirection === "previous" ? -1 : 1;
      const firstGalleryItem = control.dataset.socialScroll
        ? gallery.querySelector(".social-gallery-trigger")
        : null;
      const galleryStyles = window.getComputedStyle(gallery);
      const galleryGap = Number.parseFloat(galleryStyles.columnGap || galleryStyles.gap) || 0;
      const scrollDistance = firstGalleryItem
        ? firstGalleryItem.getBoundingClientRect().width + galleryGap
        : Math.max(240, gallery.clientWidth * 0.72);

      gallery.scrollBy({
        left: direction * scrollDistance,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  });

  document.querySelectorAll(".social-brand-previews-scroll[id]").forEach((gallery) => {
    const controls = [...document.querySelectorAll("[data-social-scroll]")]
      .filter((control) => control.getAttribute("aria-controls") === gallery.id);
    if (!controls.length) return;

    const updateControls = () => {
      const maximumScroll = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
      controls.forEach((control) => {
        const isPrevious = control.dataset.socialScroll === "previous";
        control.disabled = isPrevious
          ? gallery.scrollLeft <= 1
          : maximumScroll <= 1 || gallery.scrollLeft >= maximumScroll - 1;
      });
    };

    gallery.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls, { passive: true });
    window.requestAnimationFrame(updateControls);
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
    const previewBase = card.dataset.commissionPreviewBase;
    let useOptimizedPreview = Boolean(previewBase);
    if (!stage || !source) return;

    card.hidden = true;

    const image = new Image();
    image.loading = "eager";
    image.decoding = "async";
    image.alt = card.dataset.commissionAlt || "Selected flyer or commissioned design";

    image.addEventListener("load", () => {
      if (useOptimizedPreview) {
        const picture = document.createElement("picture");
        const sizes = "(max-width: 768px) 72vw, 280px";
        const avifSource = document.createElement("source");
        const webpSource = document.createElement("source");
        avifSource.type = "image/avif";
        avifSource.srcset = `${previewBase}-480.avif 480w, ${previewBase}-800.avif 800w`;
        avifSource.sizes = sizes;
        webpSource.type = "image/webp";
        webpSource.srcset = `${previewBase}-480.webp 480w, ${previewBase}-800.webp 800w`;
        webpSource.sizes = sizes;
        image.srcset = `${previewBase}-480.webp 480w, ${previewBase}-800.webp 800w`;
        image.sizes = sizes;
        picture.append(avifSource, webpSource, image);
        stage.prepend(picture);
      } else {
        stage.prepend(image);
      }
      card.hidden = false;
      card.classList.add("has-media");
      card.classList.remove("is-empty");
      loadedSideProjectCount += 1;
      if (sideProjectCounter) sideProjectCounter.textContent = String(loadedSideProjectCount);
    }, { once: true });

    image.addEventListener("error", () => {
      if (useOptimizedPreview) {
        useOptimizedPreview = false;
        image.removeAttribute("srcset");
        image.removeAttribute("sizes");
        image.src = source;
        return;
      }
      card.hidden = true;
      card.classList.add("is-empty");
    });

    image.src = useOptimizedPreview ? `${previewBase}-480.webp` : source;
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
    ...document.querySelectorAll("main > :not(.lightbox)"),
    document.querySelector("body > footer"),
    backToTop
  ].filter(Boolean);
  let activeLightbox = null;

  const setBackgroundInert = (value) => inertTargets.forEach((element) => (element.inert = value));

  const createLightbox = ({ id, imageId, triggerSelector, getPreview, onOpen, getGroup = () => "default" }) => {
    const dialog = document.getElementById(id);
    const image = document.getElementById(imageId);
    const closeButton = dialog?.querySelector(".lightbox-close");
    const previousButton = dialog?.querySelector("[data-lightbox-previous]");
    const nextButton = dialog?.querySelector("[data-lightbox-next]");
    if (!dialog || !image) return null;

    let lastFocused = null;
    let resetTimer = 0;
    let galleryItems = [];
    let galleryIndex = 0;

    const getFocusableControls = () => [...dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.hidden && element.getClientRects().length > 0);

    const syncNavigation = () => {
      const total = galleryItems.length;
      const previousPreview = galleryIndex > 0 ? getPreview(galleryItems[galleryIndex - 1]) : null;
      const nextPreview = galleryIndex < total - 1 ? getPreview(galleryItems[galleryIndex + 1]) : null;

      if (previousButton) {
        previousButton.disabled = !previousPreview;
        previousButton.setAttribute("aria-label", previousPreview?.title ? `Previous: ${previousPreview.title}` : "No previous image");
      }

      if (nextButton) {
        nextButton.disabled = !nextPreview;
        nextButton.setAttribute("aria-label", nextPreview?.title ? `Next: ${nextPreview.title}` : "No next image");
      }
    };

    const render = (requestedIndex) => {
      if (!galleryItems.length) return false;
      galleryIndex = Math.min(Math.max(requestedIndex, 0), galleryItems.length - 1);
      const preview = getPreview(galleryItems[galleryIndex]);
      if (!preview?.source) return false;

      image.src = preview.source;
      image.alt = preview.alt;
      onOpen?.({ ...preview, index: galleryIndex, total: galleryItems.length });
      syncNavigation();
      return true;
    };

    const move = (direction) => {
      const requestedIndex = galleryIndex + direction;
      if (requestedIndex < 0 || requestedIndex >= galleryItems.length) return;
      render(requestedIndex);
    };

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

    const triggers = [...document.querySelectorAll(triggerSelector)];
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        if (trigger.matches("a")) event.preventDefault();
        window.clearTimeout(resetTimer);
        lastFocused = trigger;
        const group = getGroup(trigger);
        galleryItems = triggers.filter((item) => getGroup(item) === group && !item.closest("[hidden]"));
        galleryIndex = Math.max(0, galleryItems.indexOf(trigger));
        if (!render(galleryIndex)) return;
        setBackgroundInert(true);
        dialog.classList.add("open");
        dialog.setAttribute("aria-hidden", "false");
        dialog.inert = false;
        document.body.style.overflow = "hidden";
        activeLightbox = {
          dialog,
          close,
          previous: () => move(-1),
          next: () => move(1),
          first: () => render(0),
          last: () => render(galleryItems.length - 1),
          getFocusableControls
        };
        closeButton?.focus();
      });
    });

    closeButton?.addEventListener("click", close);
    previousButton?.addEventListener("click", () => move(-1));
    nextButton?.addEventListener("click", () => move(1));
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
        source: previewImage?.dataset.fullSrc || previewImage?.currentSrc || previewImage?.src,
        alt: previewImage?.alt || "Certificate preview",
        category: card?.querySelector(".cert-record-type")?.textContent?.trim() || "Credential",
        title: card?.querySelector(".cert-meta h3")?.textContent?.trim() || "Certificate preview"
      };
    },
    onOpen: ({ category, title, index, total }) => {
      const categoryLabel = document.getElementById("certLightboxCategory");
      const titleLabel = document.getElementById("certLightboxTitle");
      const counterLabel = document.getElementById("certLightboxCounter");
      if (categoryLabel) categoryLabel.textContent = category;
      if (titleLabel) titleLabel.textContent = title;
      if (counterLabel) counterLabel.textContent = `${index + 1} of ${total}`;
    }
  });

  createLightbox({
    id: "sideProjectLightbox",
    imageId: "sideProjectLightboxImg",
    triggerSelector: ".side-project-lightbox-trigger",
    getGroup: (trigger) => trigger.dataset.lightboxGallery || "side-projects",
    getPreview: (trigger) => ({
      source: trigger.dataset.fullSrc,
      alt: trigger.querySelector("img")?.alt || "Side project preview",
      category: trigger.dataset.lightboxCategory || "Side project",
      title: trigger.dataset.lightboxTitle || "Project preview"
    }),
    onOpen: ({ category, title, index, total }) => {
      const categoryLabel = document.getElementById("sideProjectLightboxCategory");
      const titleLabel = document.getElementById("sideProjectLightboxTitle");
      const counterLabel = document.getElementById("sideProjectLightboxCounter");
      if (categoryLabel) categoryLabel.textContent = category;
      if (titleLabel) titleLabel.textContent = title;
      if (counterLabel) counterLabel.textContent = `${index + 1} of ${total}`;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!activeLightbox) return;

    if (event.key === "Escape") {
      event.preventDefault();
      activeLightbox.close();
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (event.key === "ArrowLeft") activeLightbox.previous();
      if (event.key === "ArrowRight") activeLightbox.next();
      if (event.key === "Home") activeLightbox.first();
      if (event.key === "End") activeLightbox.last();
      return;
    }

    if (event.key !== "Tab") return;
    const focusableControls = activeLightbox.getFocusableControls();
    if (!focusableControls.length) {
      event.preventDefault();
      return;
    }

    const firstControl = focusableControls[0];
    const lastControl = focusableControls.at(-1);
    const currentControl = document.activeElement;
    if (event.shiftKey && (currentControl === firstControl || !activeLightbox.dialog.contains(currentControl))) {
      event.preventDefault();
      lastControl.focus();
    } else if (!event.shiftKey && currentControl === lastControl) {
      event.preventDefault();
      firstControl.focus();
    }
  });
});
