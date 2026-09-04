document.querySelectorAll("img[data-fallback]").forEach((image) => {
  image.addEventListener(
    "error",
    () => {
      image.src = image.dataset.fallback;
    },
    { once: true },
  );
});

const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (heroSlides.length > 1 && !reduceMotion) {
  let activeIndex = 0;

  window.setInterval(() => {
    heroSlides[activeIndex].classList.remove("is-active");
    activeIndex = (activeIndex + 1) % heroSlides.length;
    heroSlides[activeIndex].classList.add("is-active");
  }, 5200);
}

document.querySelectorAll("[data-destination-scroll]").forEach((scroller) => {
  const track = scroller.querySelector("[data-destination-track]");
  const arrows = scroller.querySelectorAll("[data-scroll-dir]");
  const scrollStorageKey = "loomline.destinationScrollLeft";

  if (!track) return;

  const saveScrollPosition = () => {
    try {
      window.sessionStorage.setItem(scrollStorageKey, String(track.scrollLeft));
    } catch {
      // The carousel still works when browser storage is unavailable.
    }
  };

  const restoreScrollPosition = () => {
    try {
      const savedPosition = Number(window.sessionStorage.getItem(scrollStorageKey));
      if (!Number.isFinite(savedPosition) || savedPosition <= 0) return;

      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      track.scrollLeft = Math.min(savedPosition, maxScroll);
    } catch {
      // Keep the default first-card position when browser storage is unavailable.
    }
  };

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft >= maxScroll - 2;

    scroller.classList.toggle("is-at-start", atStart);
    scroller.classList.toggle("is-at-end", atEnd || maxScroll <= 2);
  };

  arrows.forEach((arrow) => {
    arrow.addEventListener("click", () => {
      const direction = Number(arrow.dataset.scrollDir);
      const card = track.querySelector(".destination-card");
      const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      const distance = card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.85;

      track.scrollBy({
        left: direction * distance,
        behavior: "smooth",
      });
    });
  });

  track.addEventListener(
    "scroll",
    () => {
      updateArrows();
      saveScrollPosition();
    },
    { passive: true },
  );
  track.querySelectorAll(".destination-card").forEach((card) => {
    card.addEventListener("click", saveScrollPosition);
  });
  window.addEventListener("pagehide", saveScrollPosition);
  window.addEventListener("pageshow", () => {
    window.requestAnimationFrame(() => {
      restoreScrollPosition();
      updateArrows();
    });
  });
  window.addEventListener("resize", updateArrows);
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      restoreScrollPosition();
      updateArrows();
    });
  });
});

const experienceFilters = document.querySelectorAll("[data-experience-filter]");
const experienceCards = document.querySelectorAll("[data-experience-categories]");
const experienceList = document.querySelector("[data-experience-list]");
const experienceToggle = document.querySelector("[data-experience-toggle]");
const experienceToggleLabel = document.querySelector("[data-experience-toggle-label]");
let experiencesExpanded = false;

const updateExperienceToggle = (activeFilter = "all") => {
  if (!experienceList || !experienceToggle || !experienceToggleLabel) return;

  const isAll = activeFilter === "all";
  experienceList.classList.toggle("is-collapsed", isAll && !experiencesExpanded);
  experienceToggle.hidden = !isAll;
  experienceToggle.setAttribute("aria-expanded", String(experiencesExpanded));
  experienceToggleLabel.textContent = experiencesExpanded
    ? "Show fewer experiences"
    : `View all ${experienceCards.length} experiences`;
};

experienceFilters.forEach((filterButton) => {
  filterButton.addEventListener("click", () => {
    const activeFilter = filterButton.dataset.experienceFilter;

    experienceFilters.forEach((button) => {
      button.classList.toggle("is-active", button === filterButton);
    });

    experienceCards.forEach((card) => {
      const categories = (card.dataset.experienceCategories || "").split(" ");
      const shouldShow = activeFilter === "all" || categories.includes(activeFilter);

      card.classList.toggle("is-hidden", !shouldShow);
    });

    updateExperienceToggle(activeFilter);
  });
});

experienceToggle?.addEventListener("click", () => {
  experiencesExpanded = !experiencesExpanded;
  updateExperienceToggle("all");
});

updateExperienceToggle();

// Reveal content as it enters the viewport without affecting card transforms.
const revealGroups = [
  [".section-heading", ".destinations-heading", ".experiences-heading"],
  [".service-choice", ".destination-card", ".experience-card"],
  [".destinations-cta", ".experience-filters", ".experiences-cta"],
  [".about-copy", ".plan-panel"],
];

const revealItems = revealGroups.flatMap((selectors) =>
  Array.from(document.querySelectorAll(selectors.join(","))),
);

revealItems.forEach((item, index) => {
  item.classList.add("reveal-item");
  item.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
});

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-revealed"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -7% 0px" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

// A restrained hero parallax keeps the image alive while preserving readability.
const hero = document.querySelector(".hero");
const heroCarousel = document.querySelector(".hero-carousel");

if (hero && heroCarousel && !reduceMotion) {
  let parallaxFrame = 0;

  const updateHeroParallax = () => {
    parallaxFrame = 0;
    const progress = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
    const distance = window.matchMedia("(max-width: 760px)").matches ? 14 : 34;
    heroCarousel.style.setProperty("--hero-shift", `${progress * distance}px`);
  };

  const requestHeroParallax = () => {
    if (parallaxFrame) return;
    parallaxFrame = window.requestAnimationFrame(updateHeroParallax);
  };

  window.addEventListener("scroll", requestHeroParallax, { passive: true });
  window.addEventListener("resize", requestHeroParallax);
  updateHeroParallax();
}

const cityMobileCta = document.querySelector(".chengdu-mobile-cta");
const cityHero = document.querySelector(".chengdu-hero");
const cityContact = document.querySelector(".chengdu-contact");

if (cityMobileCta && cityHero && cityContact) {
  const updateCityMobileCta = () => {
    const heroIsPast = cityHero.getBoundingClientRect().bottom <= 80;
    const contactIsNear = cityContact.getBoundingClientRect().top <= window.innerHeight * 0.82;
    cityMobileCta.classList.toggle("is-visible", heroIsPast && !contactIsNear);
  };

  window.addEventListener("scroll", updateCityMobileCta, { passive: true });
  window.addEventListener("resize", updateCityMobileCta);
  updateCityMobileCta();
}

const tripForm = document.querySelector("[data-trip-form]");
const formFeedback = document.querySelector("[data-form-feedback]");
const feedbackKicker = document.querySelector("[data-feedback-kicker]");
const feedbackTitle = document.querySelector("[data-feedback-title]");
const feedbackMessage = document.querySelector("[data-feedback-message]");
const feedbackBrand = document.querySelector("[data-feedback-brand]");
const feedbackClose = document.querySelector("[data-feedback-close]");
let feedbackTimer;
let formIsSubmitting = false;
const submitCooldownMs = 120000;
const submitCooldownKey = "triptochina:last-form-submit";

const hideFeedback = () => {
  if (!formFeedback) return;

  window.clearTimeout(feedbackTimer);
  formFeedback.classList.remove("is-visible", "is-success", "is-error");
  feedbackClose?.classList.remove("is-counting");
};

const restartFeedbackCountdown = () => {
  if (!feedbackClose) return;

  feedbackClose.classList.remove("is-counting");
  void feedbackClose.offsetWidth;
  feedbackClose.classList.add("is-counting");
};

const setFeedback = ({ type, kicker, title, message, brand = "Loomline Travel" }) => {
  if (!formFeedback) return;

  window.clearTimeout(feedbackTimer);
  formFeedback.classList.remove("is-success", "is-error");

  if (type) {
    formFeedback.classList.add(`is-${type}`);
  }

  feedbackKicker.textContent = kicker;
  feedbackTitle.textContent = title;
  feedbackMessage.textContent = message;
  feedbackBrand.textContent = brand;
  formFeedback.classList.add("is-visible");
  restartFeedbackCountdown();

  feedbackTimer = window.setTimeout(hideFeedback, 20000);
};

feedbackClose?.addEventListener("click", hideFeedback);

tripForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = tripForm.querySelector('button[type="submit"]');
  const formData = new FormData(tripForm);
  const honeypot = String(formData.get("_gotcha") || "").trim();
  const lastSubmitAt = Number(window.localStorage.getItem(submitCooldownKey) || 0);
  const waitMs = submitCooldownMs - (Date.now() - lastSubmitAt);

  if (formIsSubmitting) return;

  if (honeypot) {
    tripForm.reset();
    setFeedback({
      type: "success",
      kicker: "Received",
      title: "Thanks!",
      message: "Your trip details have been sent.\nWe’ll review your request and get back to you soon.\nPlease check your email for our reply.",
    });
    return;
  }

  if (waitMs > 0) {
    const waitSeconds = Math.ceil(waitMs / 1000);
    setFeedback({
      type: "error",
      kicker: "Please wait",
      title: "Already sent.",
      message: `To prevent repeated submissions, please wait about ${waitSeconds} seconds before sending again.`,
    });
    return;
  }

  formIsSubmitting = true;
  submitButton.disabled = true;
  setFeedback({
    type: "",
    kicker: "Sending",
    title: "Sending...",
    message: "Please wait a moment.",
  });

  try {
    const response = await fetch(tripForm.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Form submission failed");
    }

    tripForm.reset();
    window.localStorage.setItem(submitCooldownKey, String(Date.now()));
    setFeedback({
      type: "success",
      kicker: "Received",
      title: "Thanks!",
      message: "Your trip details have been sent.\nWe’ll review your request and get back to you soon.\nPlease check your email for our reply.",
    });
  } catch (error) {
    setFeedback({
      type: "error",
      kicker: "Not sent",
      title: "Something went wrong.",
      message: "Please try again, or email us directly at\nhello@loomlinetravel.com.",
    });
  } finally {
    formIsSubmitting = false;
    submitButton.disabled = false;
  }
});
