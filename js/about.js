const storyTourButton = document.querySelector("[data-story-tour]");
const storyTourStatus = document.querySelector("#story-tour-status");
const storyTourSections = [...document.querySelectorAll("main > section:not(.about-hero)")];
const storyArrivalTimers = new WeakMap();

const animateStoryArrival = (section) => {
  const previousTimer = storyArrivalTimers.get(section);
  if (previousTimer) window.clearTimeout(previousTimer);

  section.classList.remove("is-arriving");
  void section.offsetWidth;
  section.classList.add("is-arriving");

  const timer = window.setTimeout(() => section.classList.remove("is-arriving"), 1050);
  storyArrivalTimers.set(section, timer);
};

storyTourSections.forEach((section) => section.classList.add("story-reveal"));

if ("IntersectionObserver" in window) {
  const storyRevealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      animateStoryArrival(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  storyTourSections.forEach((section) => storyRevealObserver.observe(section));
} else {
  storyTourSections.forEach((section) => section.classList.add("is-visible"));
}

let storyTourTimers = [];
let storyTourActive = false;
let storyTourIndex = 0;
const storyTourPause = 1800;
const storyTourScrollTime = 850;

const clearStoryTourTimers = () => {
  storyTourTimers.forEach((timer) => window.clearTimeout(timer));
  storyTourTimers = [];
};

const getHeaderOffset = () => document.querySelector("[data-header]")?.offsetHeight || 0;

const setStoryTourStatus = (message) => {
  if (storyTourStatus) storyTourStatus.textContent = message;
};

const stopStoryTour = (message = "") => {
  clearStoryTourTimers();
  storyTourActive = false;
  storyTourIndex = 0;
  storyTourButton?.classList.remove("is-touring");
  storyTourButton?.setAttribute("aria-label", "Discover our story");
  setStoryTourStatus(message);
};

const moveToStorySection = (section) => {
  const top = Math.max(0, window.scrollY + section.getBoundingClientRect().top - getHeaderOffset());
  window.scrollTo({ top, behavior: "smooth" });
};

const continueStoryTour = () => {
  if (!storyTourActive || storyTourIndex >= storyTourSections.length) {
    stopStoryTour("Story tour complete.");
    return;
  }

  const section = storyTourSections[storyTourIndex];
  const sectionName = section.querySelector("h2")?.textContent.replace(/\s+/g, " ").trim() || "next section";
  moveToStorySection(section);
  setStoryTourStatus(`Viewing ${sectionName}.`);
  storyTourIndex += 1;

  const arrivalTimer = window.setTimeout(() => {
    section.classList.add("is-visible");
    animateStoryArrival(section);
  }, Math.round(storyTourScrollTime * 0.75));
  storyTourTimers.push(arrivalTimer);

  const timer = window.setTimeout(continueStoryTour, storyTourScrollTime + storyTourPause);
  storyTourTimers.push(timer);
};

const startStoryTour = () => {
  clearStoryTourTimers();
  storyTourActive = true;
  storyTourIndex = 0;
  storyTourButton?.classList.add("is-touring");
  storyTourButton?.setAttribute("aria-label", "Stop story tour");
  setStoryTourStatus("Starting story tour.");
  continueStoryTour();
};

storyTourButton?.addEventListener("click", (event) => {
  event.preventDefault();
  if (storyTourActive) {
    stopStoryTour("Story tour paused.");
    return;
  }
  startStoryTour();
});

window.addEventListener("wheel", () => {
  if (storyTourActive) stopStoryTour("Story tour paused.");
}, { passive: true });

window.addEventListener("touchstart", () => {
  if (storyTourActive) stopStoryTour("Story tour paused.");
}, { passive: true });

window.addEventListener("keydown", (event) => {
  if (storyTourActive && ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
    stopStoryTour("Story tour paused.");
  }
});
