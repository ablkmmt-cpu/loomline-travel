(function () {
  "use strict";

  var script = document.currentScript;
  var cssHref = script ? new URL("whatsapp-float.css?v=9", script.src).href : "whatsapp-float.css?v=9";
  var siteRoot = script ? new URL(".", script.src) : new URL(".", window.location.href);
  var whatsappNumber = "8615719582142";
  var whatsappIcon = '<svg viewBox="0 0 32 32"><path d="M16.03 5.33a10.58 10.58 0 0 0-9.1 15.98L5.5 26.67l5.49-1.4a10.6 10.6 0 1 0 5.04-19.94Zm0 19.07c-1.7 0-3.37-.46-4.81-1.34l-.34-.2-3.26.83.87-3.18-.22-.35a8.47 8.47 0 1 1 7.76 4.24Zm4.65-6.35c-.25-.13-1.5-.74-1.74-.82-.23-.09-.4-.13-.57.13-.17.25-.66.82-.81.99-.15.17-.3.19-.55.06-.26-.12-1.08-.4-2.06-1.27a7.73 7.73 0 0 1-1.42-1.77c-.15-.26-.02-.4.11-.52.12-.11.26-.3.38-.44.13-.15.17-.26.26-.43.08-.17.04-.32-.02-.45-.07-.12-.58-1.38-.79-1.89-.2-.5-.42-.43-.57-.44h-.49c-.17 0-.45.06-.68.32-.23.25-.89.87-.89 2.12 0 1.25.92 2.46 1.04 2.63.13.17 1.8 2.75 4.37 3.86.61.26 1.09.42 1.46.54.61.2 1.17.17 1.61.1.49-.08 1.51-.62 1.72-1.22.21-.59.21-1.1.15-1.21-.06-.1-.23-.17-.49-.3Z"/></svg>';

  var destinationNames = {
    beijing: "Beijing",
    chengdu: "Chengdu",
    chongqing: "Chongqing",
    guilin: "Guilin",
    shanghai: "Shanghai",
    tibet: "Tibet",
    xian: "Xi'an",
    xinjiang: "Xinjiang",
    yunnan: "Yunnan",
    zhangjiajie: "Zhangjiajie"
  };

  var experienceNames = {
    "tea-culture": "Tea Culture Experience",
    "traditional-wellness": "Traditional Wellness Experience",
    "yunnan-tie-dye": "Yunnan Tie-Dye Workshop",
    "sichuan-mahjong": "Sichuan Mahjong Class",
    "pottery-workshop": "Chinese Pottery Workshop",
    "imperial-dinner-show": "Imperial Dinner Show",
    "seal-carving": "Seal Carving Workshop"
  };

  function getPageMessage() {
    var path = decodeURIComponent(window.location.pathname).toLowerCase();
    var match = path.match(/\/destinations\/([^/]+)\//);

    if (match && destinationNames[match[1]]) {
      return "Hi Loomline Travel, I'm interested in adding " + destinationNames[match[1]] + " to my China trip. Could you help me with an itinerary?";
    }

    match = path.match(/\/experiences\/([^/]+)\//);
    if (match && experienceNames[match[1]]) {
      return "Hi Loomline Travel, I'd like to add the " + experienceNames[match[1]] + " to my China trip. Could you tell me more about availability?";
    }

    if (path.indexOf("/services/standard-routes/") !== -1) {
      return "Hi Loomline Travel, I'm interested in your Standard Routes. Could you help me find the right route for my trip?";
    }

    if (path.indexOf("/services/custom-tour/") !== -1) {
      return "Hi Loomline Travel, I'm interested in a Custom Tour Package. Could you help me plan a private trip and prepare a quote?";
    }

    if (path.indexOf("/field-guide-taste-test/") !== -1) {
      return "Hi Loomline Travel, I'm exploring your China trip planning approach and have a question.";
    }

    if (path.indexOf("/field-guide/") !== -1) {
      return "Hi Loomline Travel, I'm reading your China travel field guide and would like some local advice.";
    }

    return "Hi Loomline Travel, I'm planning my first trip to China and would like some local help.";
  }

  var whatsappMessage = getPageMessage() + "\n\nReference: " + document.title;
  var whatsappUrl = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(whatsappMessage);

  function updateWhatsappLinks() {
    var links = document.querySelectorAll('a[href*="wa.me/"], a[href*="api.whatsapp.com"]');
    links.forEach(function (link) {
      // 页头 / 页脚是统一组件：其 WhatsApp 链接保持组件里的统一预设（wa.me/message/<code>），
      // 不随页面替换为按页面变化的 ?text= 预设词（业务预设链接全站一致）。
      if (link.closest(".site-footer") || link.classList.contains("ttc-nav-whatsapp")) return;
      link.href = whatsappUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  }

  if (!document.querySelector('link[data-ttc-whatsapp-style]')) {
    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = cssHref;
    stylesheet.dataset.ttcWhatsappStyle = "";
    document.head.appendChild(stylesheet);
  }

  function makeWhatsappLink(className, label) {
    var link = document.createElement("a");
    link.className = className;
    link.href = whatsappUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", label);
    link.innerHTML = whatsappIcon;
    return link;
  }

  function buildGlobalHeader() {
    var homeUrl = new URL("index.html", siteRoot).href;
    var header = document.createElement("header");
    header.className = "ttc-global-header ttc-fixed-header";
    header.innerHTML =
      '<a class="ttc-global-brand" href="' + homeUrl + '#top" aria-label="Loomline Travel home">' +
        '<img src="' + new URL("assets/brand/loomline-emblem-gold-smooth.png?v=4", siteRoot).href + '" alt="">' +
        '<img src="' + new URL("assets/brand/loomline-wordmark-ivory-smooth.png", siteRoot).href + '" alt="Loomline Travel">' +
      '</a>' +
      '<nav aria-label="Main navigation">' +
        '<a href="' + homeUrl + '#services">Services</a>' +
        '<a href="' + homeUrl + '#destinations">Destinations</a>' +
        '<a href="' + homeUrl + '#experiences">Experiences</a>' +
        '<a href="' + homeUrl + '#about">About Us</a>' +
      '</nav>' +
      '<div class="ttc-nav-actions">' +
        '<a class="ttc-nav-whatsapp" href="' + whatsappUrl + '" target="_blank" rel="noopener noreferrer" aria-label="Chat with Loomline Travel on WhatsApp">' + whatsappIcon + '</a>' +
        '<a class="ttc-global-header-cta" href="' + homeUrl + '#trip-plan-check">Start With Your Trip</a>' +
      '</div>';
    document.body.prepend(header);
    return header;
  }

  function enhanceNavigation() {
    var header = document.querySelector(".site-header, .shanghai-header, .city-topbar, .tea-nav");
    if (!header) header = buildGlobalHeader();
    if (header.parentElement !== document.body) document.body.prepend(header);
    header.classList.add("ttc-fixed-header");

    if (header.querySelector(".ttc-nav-whatsapp")) return;

    var cta = header.querySelector(".nav-cta, .shanghai-nav-cta, .tea-nav-cta, .city-topbar-cta, .header-cta");
    if (!cta) return;

    var actions = document.createElement("div");
    actions.className = "ttc-nav-actions";
    cta.parentNode.insertBefore(actions, cta);
    actions.appendChild(makeWhatsappLink("ttc-nav-whatsapp", "Chat with Loomline Travel on WhatsApp"));
    actions.appendChild(cta);
  }

  function initializeWhatsappFloat() {
    if (document.querySelector(".ttc-whatsapp-float")) return;

    updateWhatsappLinks();
    enhanceNavigation();

    var hasMobileCta = document.querySelector(".tea-mobile-cta, .chengdu-mobile-cta, .mobile-booking");
    if (hasMobileCta) document.body.classList.add("ttc-has-mobile-cta");

    var contact = document.createElement("a");
    contact.className = "ttc-whatsapp-float";
    contact.href = whatsappUrl;
    contact.target = "_blank";
    contact.rel = "noopener noreferrer";
    contact.setAttribute("aria-label", "Quick chat on WhatsApp");
    contact.setAttribute("aria-expanded", "false");
    contact.innerHTML =
      '<span class="ttc-whatsapp-label" aria-hidden="true">' +
        '<strong>Quick chat on WhatsApp</strong>' +
        '<small>Tap again to open</small>' +
      '</span>' +
      '<span class="ttc-whatsapp-icon" aria-hidden="true">' + whatsappIcon +
      '</span>';

    document.body.appendChild(contact);

    var touchMode = window.matchMedia("(hover: none), (pointer: coarse)");
    var isArmed = false;
    var closeTimer = 0;

    function closePrompt() {
      isArmed = false;
      contact.classList.remove("is-open");
      contact.setAttribute("aria-expanded", "false");
      window.clearTimeout(closeTimer);
    }

    contact.addEventListener("click", function (event) {
      if (!touchMode.matches && window.innerWidth > 760) return;

      if (!isArmed) {
        event.preventDefault();
        isArmed = true;
        contact.classList.add("is-open");
        contact.setAttribute("aria-expanded", "true");
        window.clearTimeout(closeTimer);
        closeTimer = window.setTimeout(closePrompt, 6500);
      }
    });

    document.addEventListener("pointerdown", function (event) {
      if (isArmed && !contact.contains(event.target)) closePrompt();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isArmed) closePrompt();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWhatsappFloat, { once: true });
  } else {
    initializeWhatsappFloat();
  }
})();
