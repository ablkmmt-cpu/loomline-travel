(() => {
  const images = Array.from(document.querySelectorAll("img[data-route-src]"));

  const load = (image) => {
    if (!image.dataset.routeSrc) return;
    if (image.dataset.routeSrcset) {
      image.srcset = image.dataset.routeSrcset;
      delete image.dataset.routeSrcset;
    }
    image.src = image.dataset.routeSrc;
    delete image.dataset.routeSrc;
  };

  if (!("IntersectionObserver" in window)) {
    images.forEach(load);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        load(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "200px 0px" },
  );

  images.forEach((image) => observer.observe(image));
})();
