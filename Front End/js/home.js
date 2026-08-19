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

  const tiltCards = document.querySelectorAll("[data-tilt]");


  tiltCards.forEach((card) => {

    card.addEventListener("mousemove", (event) => {

      if (window.innerWidth <= 900) {
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

      card.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg)";

    });

  });

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
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
