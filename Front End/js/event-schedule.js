const scheduleFilterRow = document.querySelector("[data-schedule-filter]");
if (scheduleFilterRow) {
  scheduleFilterRow.addEventListener("click", (event) => { const button = event.target.closest("[data-filter]"); if (button) sessionStorage.setItem("ugc_schedule_filter", button.dataset.filter); });
  const rememberedFilter = sessionStorage.getItem("ugc_schedule_filter");
  if (rememberedFilter) scheduleFilterRow.querySelector(`[data-filter="${rememberedFilter}"]`)?.click();
}

const countdownEls = document.querySelectorAll("[data-countdown]");
if (countdownEls.length) {
  const padCountdownValue = (value) => String(value).padStart(2, "0");
  const tickCountdowns = () => countdownEls.forEach((el) => {
    const diff = new Date(el.dataset.countdown).getTime() - Date.now();
    const days = el.querySelector("[data-cd-days]");
    const hours = el.querySelector("[data-cd-hours]");
    const minutes = el.querySelector("[data-cd-mins]");
    if (diff <= 0) {
      el.classList.add("is-live");
      el.querySelector(".countdown-label")?.replaceChildren(document.createTextNode("Happening now"));
      [days, hours, minutes].forEach((node) => { if (node) node.textContent = "00"; });
      return;
    }
    if (days) days.textContent = padCountdownValue(Math.floor(diff / 864e5));
    if (hours) hours.textContent = padCountdownValue(Math.floor((diff % 864e5) / 36e5));
    if (minutes) minutes.textContent = padCountdownValue(Math.floor((diff % 36e5) / 6e4));
  });
  tickCountdowns();
  window.setInterval(tickCountdowns, 30000);
}

const scheduleItems = document.querySelectorAll("[data-schedule-item]");
if (scheduleItems.length) {
  const now = new Date();
  let nextItem = null;
  let nextDate = null;
  scheduleItems.forEach((item) => {
    const timeEl = item.querySelector("time[datetime]");
    const itemDate = timeEl ? new Date(timeEl.getAttribute("datetime")) : null;
    if (itemDate && itemDate >= now && (!nextDate || itemDate < nextDate)) { nextItem = item; nextDate = itemDate; }
  });
  if (nextItem) {
    nextItem.classList.add("is-next");
    const badge = document.createElement("span");
    badge.className = "next-badge";
    badge.textContent = "Next up";
    nextItem.querySelector(".schedule-copy")?.prepend(badge);
  }
}

/* --- Add-to-calendar: build a downloadable .ics file for a schedule item --- */
const pad2 = (num) => String(num).padStart(2, "0");
document.querySelectorAll("[data-ics]").forEach((button) => {
  button.addEventListener("click", () => {
    const { icsTitle: title, icsStart: start, icsEnd: end, icsDesc: description } = button.dataset;
    const toIcsLocal = (isoLocal) => isoLocal.replace(/[-:]/g, "");
    const nowUtc = new Date();
    const dtstamp = `${nowUtc.getUTCFullYear()}${pad2(nowUtc.getUTCMonth() + 1)}${pad2(nowUtc.getUTCDate())}T${pad2(nowUtc.getUTCHours())}${pad2(nowUtc.getUTCMinutes())}${pad2(nowUtc.getUTCSeconds())}Z`;
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Utar Gaming//Event Schedule//EN", "BEGIN:VEVENT",
      `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@utargaming`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${toIcsLocal(start)}`,
      `DTEND:${toIcsLocal(end)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${(description || "").replace(/,/g, "\\,")}`,
      "LOCATION:UTAR Campus",
      "END:VEVENT", "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
});
