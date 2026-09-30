document.querySelectorAll(".city-detail-intro-copy").forEach((copy, index) => {
  const paragraphs = [...copy.querySelectorAll(":scope > p")];
  if (paragraphs.length < 2) return;

  copy.classList.add("is-collapsible");

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "city-detail-intro-toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Show full city introduction");
  toggle.setAttribute("aria-controls", `city-detail-intro-more-${index}`);

  const more = paragraphs[1];
  more.id = `city-detail-intro-more-${index}`;
  copy.insertBefore(toggle, more);

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    copy.classList.toggle("is-expanded", !expanded);
    toggle.setAttribute("aria-expanded", String(!expanded));
    toggle.setAttribute("aria-label", expanded ? "Show full city introduction" : "Hide full city introduction");
  });
});
