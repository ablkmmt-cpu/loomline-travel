/* Loomline Travel — Google Analytics 4 + Consent Mode v2 + 同意横幅
 *
 * 说明：
 *  - 默认对所有访客设为「拒绝采集」（GDPR 合规），访客点"接受"后才真正启用 GA。
 *  - 选择用 localStorage 记住（loomline_cookie_consent），不会重复弹。
 *  - 本文件是唯一需要注入的脚本；样式内联，无需改 styles.css。
 */
(function () {
  var GA_ID = "G-72QYM7PQST";
  var CONSENT_KEY = "loomline_cookie_consent";
  var CONSENT_EXPIRE = 180 * 24 * 60 * 60 * 1000; // 180 天

  // 1) dataLayer / gtag 桩（必须在 gtag.js 加载前定义）
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  // 2) 读取已存选择
  function storedChoice() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  // 3) 生成 consent 状态对象
  function consentObj(granted) {
    var s = granted ? "granted" : "denied";
    return {
      analytics_storage: s,
      ad_storage: s,
      ad_personalization: s,
      ad_user_data: s,
      wait_for_update: 500
    };
  }

  // 4) 设置默认同意（早于 gtag.js 加载，必须同步）
  gtag("consent", "default", consentObj(false));

  // 5) 注入 gtag.js
  var gs = document.createElement("script");
  gs.async = true;
  gs.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(gs);
  gtag("js", new Date());
  gtag("config", GA_ID);

  // 6) 变更同意
  function setConsent(accepted) {
    try { localStorage.setItem(CONSENT_KEY, accepted ? "accepted" : "declined"); } catch (e) {}
    gtag("consent", "update", consentObj(accepted));
  }

  // 7) 同意横幅 UI（内联样式，品牌配色）
  function showBanner() {
    if (document.getElementById("lt-consent-banner")) return;
    var s = document.createElement("div");
    s.id = "lt-consent-banner";
    s.setAttribute("role", "region");
    s.setAttribute("aria-label", "Cookie consent");
    s.innerHTML =
      '<div class="lt-consent-box">' +
      '<p class="lt-consent-text">We use cookies to improve your experience and analyse our traffic. Read our <a href="' + privacyHref() + '">privacy policy</a>.</p>' +
      '<div class="lt-consent-actions">' +
      '<button class="lt-consent-reject">Necessary only</button>' +
      '<button class="lt-consent-accept">Accept analytics</button>' +
      "</div>" +
      "</div>";
    s.style.cssText =
      "position:fixed;inset:auto 0 0 0;z-index:2147483000;padding:14px 18px;background:#10231f;color:#fff8ed;" +
      "font-family:Inter,system-ui,sans-serif;box-shadow:0 -8px 30px rgba(16,35,31,.35);font-size:14px;line-height:1.5;";
    s.querySelector(".lt-consent-box").style.cssText =
      "max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;";
    s.querySelector(".lt-consent-text").style.cssText =
      "margin:0;flex:1 1 320px;color:rgba(255,248,237,.9);";
    var an = s.querySelector(".lt-consent-text a");
    if (an) an.style.cssText = "color:#c9a24b;text-decoration:underline;";
    var btns = s.querySelector(".lt-consent-actions");
    btns.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;";
    var accept = s.querySelector(".lt-consent-accept");
    var reject = s.querySelector(".lt-consent-reject");
    [accept, reject].forEach(function (b) {
      b.style.cssText =
        "font:inherit;cursor:pointer;padding:10px 16px;border-radius:999px;font-weight:600;";
    });
    accept.style.cssText += "background:#572723;color:#fff8ed;border:1px solid #572723;";
    reject.style.cssText += "background:transparent;color:#fff8ed;border:1px solid rgba(255,248,237,.45);";
    accept.addEventListener("click", function () { setConsent(true); s.remove(); });
    reject.addEventListener("click", function () { setConsent(false); s.remove(); });
    document.body.appendChild(s);
  }

  function privacyHref() {
    // 从 analytics.js 的已解析 URL 反推 ../../ = 项目根（不管页面对第几层都正确）
    var src = document.currentScript && document.currentScript.src;
    if (src) {
      try { return new URL("../../policies/privacy-policy.html", src).href; } catch (e) {}
    }
    return "/policies/privacy-policy.html";
  }

  // 8) 只在尚未选择时弹横幅
  if (storedChoice() === null) showBanner();
})();
