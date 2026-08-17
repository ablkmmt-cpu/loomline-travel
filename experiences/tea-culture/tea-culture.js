const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6%" }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const heroImage = document.querySelector(".tea-hero > img");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (heroImage && !reduceMotion) {
  let ticking = false;

  const updateHero = () => {
    const offset = Math.min(window.scrollY * 0.08, 40);
    heroImage.style.transform = `translate3d(0, ${offset}px, 0) scale(1.01)`;
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHero);
    },
    { passive: true }
  );
}
