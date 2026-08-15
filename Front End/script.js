/* Compatibility loader for older pages that still reference script.js directly. */
const legacyPage = window.location.pathname.split("/").pop() || "index.html";
const legacyScripts = ["js/common.js"];
if (legacyPage === "events.html") legacyScripts.push("js/events.js", "js/promo.js");
if (legacyPage === "event-schedule.html") legacyScripts.push("js/events.js", "js/filters.js");
if (legacyPage === "tournaments.html") legacyScripts.push("js/tournaments.js");
if (legacyPage === "shop.html") legacyScripts.push("js/shop.js");
if (legacyPage === "contact.html") legacyScripts.push("js/contact.js");
legacyScripts.forEach((src) => { const script = document.createElement("script"); script.src = src; document.head.appendChild(script); });
