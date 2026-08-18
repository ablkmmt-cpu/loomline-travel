/* ============================================================
   contact.js — 联系页专用
   - 读取 URL 参数预填上下文：?interest=城市/线路 &type=standard|custom
   - 记录来源页面（referrer），随表单提交
   ============================================================ */
(() => {
  const interestField = document.querySelector("[data-interest-field]");
  const referrerField = document.querySelector("[data-referrer-field]");
  const contextNotice = document.querySelector("[data-contact-context]");

  if (!interestField) return;

  const params = new URLSearchParams(window.location.search);

  // 兴趣上下文：?interest=beijing → 预填 + 提示条
  const interest = (params.get("interest") || "").trim();
  if (interest) {
    interestField.value = interest;
    const label = interest
      .split(/[_-]/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
    if (contextNotice) {
      contextNotice.textContent = `Planning: ${label} — we've noted it and will tailor our reply to it.`;
      contextNotice.hidden = false;
    }
  }

  // 支持类型：?type=standard | ?type=custom → 预填下拉
  const supportType = params.get("type") || params.get("support");
  const select = document.querySelector('select[name="support_type"]');
  if (supportType && select) {
    const normalized = supportType.toLowerCase();
    const value =
      normalized.includes("custom") || normalized.includes("tailor")
        ? "Custom Tour Package"
        : normalized.includes("self") || normalized.includes("standard")
          ? "Self-Guided Trip Support"
          : null;
    if (value) select.value = value;
  }

  // 来源页面：优先 referrer（站内跳转），兜底当前路径
  if (referrerField) {
    let source = document.referrer || "";
    try {
      const url = new URL(source);
      if (url.origin === window.location.origin) {
        source = url.pathname + url.search;
      }
    } catch {
      source = source || window.location.pathname;
    }
    if (!source) source = window.location.pathname;
    referrerField.value = source;
  }
})();
