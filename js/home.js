document.addEventListener("DOMContentLoaded", () => {

  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          entry.target.classList.add("is-visible");

          revealObserver.unobserve(entry.target);

        }

      });

    },
    {
      threshold: 0.12
    }
  );


  revealElements.forEach((element) => {

    revealObserver.observe(element);

  });

  const statCounters = document.querySelectorAll("[data-count-to]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (statCounters.length) {
    const formatCounter = (element, value) => {
      const padding = Number(element.dataset.countPadding || 0);
      const suffix = element.dataset.countSuffix || "";
      return `${String(Math.round(value)).padStart(padding, "0")}${suffix}`;
    };

    const renderCounter = (element, value) => {
      element.textContent = formatCounter(element, value);
    };

    const animateCounter = (element) => {
      const target = Number(element.dataset.countTo || 0);

      if (reducedMotion.matches) {
        renderCounter(element, target);
        return;
      }

      const duration = 8000;
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        renderCounter(element, target * easedProgress);

        if (progress < 1) {
          window.requestAnimationFrame(tick);
        }
      };

      window.requestAnimationFrame(tick);
    };

    statCounters.forEach((counter) => renderCounter(counter, 0));

    if ("IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            statCounters.forEach(animateCounter);
            observer.disconnect();
          });
        },
        { threshold: 0.35 }
      );

      const statsSection = document.querySelector(".hero-numbers");
      if (statsSection) {
        counterObserver.observe(statsSection);
      }
    } else {
      statCounters.forEach(animateCounter);
    }
  }

  const tiltCards = document.querySelectorAll("[data-tilt]");


  tiltCards.forEach((card) => {

    card.addEventListener("mousemove", (event) => {

      if (window.innerWidth <= 900 || reducedMotion.matches) {
        return;
      }


      const rect = card.getBoundingClientRect();

      const x =
        event.clientX - rect.left;

      const y =
        event.clientY - rect.top;


      const centerX =
        rect.width / 2;

      const centerY =
        rect.height / 2;


      const rotateX =
        ((y - centerY) / centerY) * -5;

      const rotateY =
        ((x - centerX) / centerX) * 5;


      card.style.transform =
        `perspective(900px)
         rotateX(${rotateX}deg)
         rotateY(${rotateY}deg)
         translateY(-5px)`;

    });

    card.addEventListener("mouseleave", () => {

      card.style.removeProperty("transform");

    });

  });

  const countdown = document.querySelector("[data-event-countdown]");

  if (countdown) {
    const eventStart = new Date(countdown.dataset.eventCountdown).getTime();
    const eventEnd = new Date(
      countdown.dataset.eventEnd || countdown.dataset.eventCountdown
    ).getTime();
    const countdownLabel = countdown
      .closest(".event-countdown-row")
      ?.querySelector("span");

    const pad = (value) => String(value).padStart(2, "0");

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = eventStart - now;

      if (now >= eventEnd) {
        if (countdownLabel) countdownLabel.textContent = "Status";
        countdown.textContent = "Event completed";
        return;
      }

      if (now >= eventStart) {
        if (countdownLabel) countdownLabel.textContent = "Status";
        countdown.textContent = "Event is underway";
        return;
      }

      const totalSeconds = Math.floor(remaining / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (countdownLabel) countdownLabel.textContent = "Starts in";
      countdown.textContent =
        `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    };

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

  document.querySelectorAll(
    'a[href^="#"]'
  ).forEach((link) => {

    link.addEventListener("click", (event) => {

      const targetId =
        link.getAttribute("href");


      if (
        !targetId ||
        targetId === "#"
      ) {
        return;
      }


      const target =
        document.querySelector(targetId);


      if (!target) {
        return;
      }


      event.preventDefault();


      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    });

  });

  const heroVisual =
    document.querySelector(".about-hero-visual");


  const hero =
    document.querySelector(".about-hero");


  if (hero && heroVisual) {

    hero.addEventListener("mousemove", (event) => {

      if (window.innerWidth <= 900) {
        return;
      }


      const rect =
        hero.getBoundingClientRect();


      const x =
        (event.clientX - rect.left)
        / rect.width
        - 0.5;


      const y =
        (event.clientY - rect.top)
        / rect.height
        - 0.5;


      heroVisual.style.transform =
        `translate(
          ${x * 18}px,
          calc(-45% + ${y * 18}px)
        )`;

    });

    hero.addEventListener("mouseleave", () => {

      heroVisual.style.transform =
        "translateY(-45%)";

    });

  }

  const landingHero = document.querySelector(".landing-hero");
  const controller = document.querySelector("[data-hero-object]");

  if (landingHero && controller) {
    let frameId = null;

    const updateControllerMotion = () => {
      frameId = null;

      if (reducedMotion.matches) {
        controller.style.setProperty("--controller-scroll-x", "0px");
        controller.style.setProperty("--controller-scroll-y", "0px");
        controller.style.setProperty("--controller-scroll-rotate-x", "0deg");
        controller.style.setProperty("--controller-scroll-rotate-y", "0deg");
        controller.style.setProperty("--controller-scroll-rotate-z", "0deg");
        return;
      }

      const rect = landingHero.getBoundingClientRect();
      const progress = Math.max(
        -1,
        Math.min(1, -rect.top / Math.max(rect.height, 1))
      );

      controller.style.setProperty(
        "--controller-scroll-x",
        `${progress * 24}px`
      );
      controller.style.setProperty(
        "--controller-scroll-y",
        `${progress * -80}px`
      );
      controller.style.setProperty(
        "--controller-scroll-rotate-x",
        `${progress * 10}deg`
      );
      controller.style.setProperty(
        "--controller-scroll-rotate-y",
        `${progress * 14}deg`
      );
      controller.style.setProperty(
        "--controller-scroll-rotate-z",
        `${progress * -5}deg`
      );
    };

    const requestControllerMotion = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateControllerMotion);
      }
    };

    window.addEventListener("scroll", requestControllerMotion, { passive: true });
    window.addEventListener("resize", requestControllerMotion);

    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", requestControllerMotion);
    }

    updateControllerMotion();
  }

});
