(() => {
  const modal = document.querySelector("[data-privacy-modal]");
  const dialog = modal?.querySelector(".privacy-dialog");
  const openButtons = document.querySelectorAll("[data-privacy-open]");
  const closeButtons = modal?.querySelectorAll("[data-privacy-close]") || [];
  let lastFocus = null;

  if (!modal || !dialog || !openButtons.length) return;

  const setTriggerState = (isOpen) => {
    openButtons.forEach((button) => button.setAttribute("aria-expanded", String(isOpen)));
  };

  const open = () => {
    lastFocus = document.activeElement;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-open");
    document.body.classList.add("is-privacy-open");
    setTriggerState(true);
    window.requestAnimationFrame(() => dialog.focus());
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-privacy-open");
    setTriggerState(false);

    if (lastFocus instanceof HTMLElement) {
      lastFocus.focus();
    }
  };

  openButtons.forEach((button) => button.addEventListener("click", open));
  closeButtons.forEach((button) => button.addEventListener("click", close));

  modal.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    ).filter((element) => element.getClientRects().length > 0);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      close();
    }
  });
})();
