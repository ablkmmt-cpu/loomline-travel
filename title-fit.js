(() => {
  const headings = Array.from(document.querySelectorAll("main h1:not([data-no-fit]), main h2:not([data-no-fit])"));
  let frame = 0;

  const fitHeading = (heading) => {
    heading.classList.add("fit-title");
    heading.style.removeProperty("font-size");
    heading.style.removeProperty("width");

    const startingSize = Number.parseFloat(window.getComputedStyle(heading).fontSize);
    const headingRect = heading.getBoundingClientRect();
    const parent = heading.parentElement;
    const parentStyle = parent ? window.getComputedStyle(parent) : null;
    const parentPadding = parentStyle
      ? Number.parseFloat(parentStyle.paddingLeft) + Number.parseFloat(parentStyle.paddingRight)
      : 0;
    const parentWidth = parent ? parent.clientWidth - parentPadding : heading.clientWidth;
    const viewportWidth = window.innerWidth - Math.max(0, headingRect.left) - 18;
    const availableWidth = Math.max(1, Math.floor(Math.min(parentWidth, viewportWidth)));
    const targetWidth = availableWidth * 0.9;

    heading.style.width = `${availableWidth}px`;

    const measureTextWidth = () => {
      const range = document.createRange();
      range.selectNodeContents(heading);
      const width = range.getBoundingClientRect().width;
      range.detach();
      return width;
    };

    if (!availableWidth || measureTextWidth() <= targetWidth + 1) return;

    let low = 11;
    let high = startingSize;

    for (let step = 0; step < 12; step += 1) {
      const size = (low + high) / 2;
      heading.style.fontSize = `${size}px`;

      if (measureTextWidth() <= targetWidth + 1) {
        low = size;
      } else {
        high = size;
      }
    }

    heading.style.fontSize = `${Math.max(11, low - 0.5)}px`;
  };

  const fitAllHeadings = () => {
    headings.forEach(fitHeading);
  };

  const scheduleFit = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(fitAllHeadings);
  };

  fitAllHeadings();
  window.addEventListener("resize", scheduleFit, { passive: true });

  if (document.fonts?.ready) {
    document.fonts.ready.then(scheduleFit);
  }
})();
