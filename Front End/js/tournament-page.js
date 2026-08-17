(() => {
  document.body.classList.add("js-enhanced");

  /* Countdown ----------------------------------------------------------- */
  const countdown = document.querySelector("[data-countdown]");
  const pad = (value) => String(Math.max(0, value)).padStart(2, "0");

  const updateCountdown = () => {
    if (!countdown) return;
    const target = new Date(countdown.dataset.target).getTime();
    const diff = target - Date.now();
    const fields = {
      days: countdown.querySelector("[data-days]"),
      hours: countdown.querySelector("[data-hours]"),
      minutes: countdown.querySelector("[data-minutes]"),
      seconds: countdown.querySelector("[data-seconds]"),
    };

    if (diff <= 0) {
      countdown.classList.add("is-live");
      Object.values(fields).forEach((field) => { if (field) field.textContent = "00"; });
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    if (fields.days) fields.days.textContent = pad(Math.floor(totalSeconds / 86400));
    if (fields.hours) fields.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
    if (fields.minutes) fields.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
    if (fields.seconds) fields.seconds.textContent = pad(totalSeconds % 60);
  };

  updateCountdown();
  if (countdown) window.setInterval(updateCountdown, 1000);

  /* Interactive game category selector -------------------------------- */
  const gameData = {
    pubg: {
      label: "Battle Royale",
      title: "PUBG · Squad Competition",
      copy: "Teams compete across placement and elimination rounds, with overall performance determining who reaches the final lobby.",
      team: "Utar Reapers",
      mode: "Squad rounds",
      stage: "Group → Final lobby",
      logo: "assets/pubg-logo.png",
      link: "program/pubg.html",
      showcaseTitle: "PUBG leaderboard.",
      showcaseCopy: "PUBG is scored through cumulative placement and elimination points, so a standings table communicates progress better than a knockout bracket.",
      statusTitle: "Leaderboard status",
      status: "Waiting for Day 1 match points",
    },
    mlbb: {
      label: "MOBA",
      title: "Mobile Legends · 5v5 Bracket",
      copy: "Five-player teams progress through a best-of series bracket, where draft preparation, role mastery and team rotations decide each match.",
      team: "Utar Lynx",
      mode: "5v5 · Best-of series",
      stage: "Groups → Knockout",
      logo: "assets/mobile-legends-logo.png",
      link: "program/mobile-legends.html",
      showcaseTitle: "Mobile Legends playoffs.",
      showcaseCopy: "Mobile Legends uses the featured knockout bracket because its 5v5 best-of series progresses naturally from quarterfinals to the grand final.",
      statusTitle: "Bracket status",
      status: "Waiting for group-stage results",
    },
    brawl: {
      label: "Action",
      title: "Brawl Stars · Team Match",
      copy: "Fast team rounds focus on map control, brawler matchups and objective play before the strongest players move into the final stage.",
      team: "Utar Brawlers",
      mode: "Team rounds",
      stage: "Qualifiers → Final",
      logo: "assets/brawl-stars-logo.png",
      link: "program/brawl-stars.html",
      showcaseTitle: "Brawl Stars elimination flow.",
      showcaseCopy: "Brawl Stars is shown as a compact match progression so visitors can understand the qualifier, semifinal and final series without forcing a full bracket.",
      statusTitle: "Elimination status",
      status: "Qualifier teams pending",
    },
    coc: {
      label: "Strategy",
      title: "Clash of Clans · War Format",
      copy: "Players plan attacks, coordinate war strategy and compete for the strongest overall result across the tournament's clan-war stage.",
      team: "Utar War Clan",
      mode: "Clan war",
      stage: "War rounds → Final",
      logo: "assets/clash-of-clans-logo.png",
      link: "program/clash-of-clans.html",
      showcaseTitle: "Clash of Clans war score.",
      showcaseCopy: "Clash of Clans is presented as a war scoreboard using stars and destruction percentage, which better matches how clan-war results are judged.",
      statusTitle: "War status",
      status: "Sample score shown for format preview",
    },
    roblox: {
      label: "Multi-game",
      title: "Roblox · Competitive Challenge",
      copy: "A flexible challenge format brings competitive experiences and creator-focused gameplay into one open tournament category.",
      team: "Utar Creators",
      mode: "Challenge format",
      stage: "Qualifier → Final",
      logo: "assets/roblox-logo.png",
      link: "program/roblox.html",
      showcaseTitle: "Roblox challenge ranking.",
      showcaseCopy: "Roblox uses a challenge ranking view where players or teams collect points across rounds before the highest-ranked entries move into the final stage.",
      statusTitle: "Ranking status",
      status: "Challenge points update by round",
    },
  };

  const gameButtons = Array.from(document.querySelectorAll("[data-game-tab]"));
  const panel = document.querySelector(".format-panel");
  const formatViews = Array.from(document.querySelectorAll("[data-format-view]"));
  const showcaseTitle = document.querySelector("[data-showcase-title]");
  const showcaseCopy = document.querySelector("[data-showcase-copy]");
  const showcaseStatusTitle = document.querySelector("[data-showcase-status-title]");
  const showcaseStatus = document.querySelector("[data-showcase-status]");

  const setGame = (key, focusPanel = false) => {
    const data = gameData[key];
    if (!data || !panel) return;

    gameButtons.forEach((button) => {
      const isActive = button.dataset.gameTab === key;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

    panel.classList.add("is-changing");
    window.setTimeout(() => {
      panel.querySelector("[data-format-label]").textContent = data.label;
      panel.querySelector("[data-format-title]").textContent = data.title;
      panel.querySelector("[data-format-copy]").textContent = data.copy;
      panel.querySelector("[data-format-team]").textContent = data.team;
      panel.querySelector("[data-format-mode]").textContent = data.mode;
      panel.querySelector("[data-format-stage]").textContent = data.stage;
      const logo = panel.querySelector("[data-format-logo]");
      logo.src = data.logo;
      logo.alt = `${data.title.split(" · ")[0]} logo`;
      panel.querySelector("[data-format-link]").href = data.link;

      formatViews.forEach((view) => {
        const active = view.dataset.formatView === key;
        view.classList.toggle("active", active);
        view.setAttribute("aria-hidden", String(!active));
      });
      if (showcaseTitle) showcaseTitle.textContent = data.showcaseTitle;
      if (showcaseCopy) showcaseCopy.textContent = data.showcaseCopy;
      if (showcaseStatusTitle) showcaseStatusTitle.textContent = data.statusTitle;
      if (showcaseStatus) showcaseStatus.textContent = data.status;

      panel.classList.remove("is-changing");
      if (focusPanel) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 120);
  };

  gameButtons.forEach((button, index) => {
    button.addEventListener("click", () => setGame(button.dataset.gameTab));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % gameButtons.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + gameButtons.length) % gameButtons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = gameButtons.length - 1;
      gameButtons[nextIndex].focus();
      setGame(gameButtons[nextIndex].dataset.gameTab);
    });
  });
  if (gameButtons.length) setGame(gameButtons.find((button) => button.classList.contains("active"))?.dataset.gameTab || gameButtons[0].dataset.gameTab);

  /* Sticky section navigation + reading progress ----------------------- */
  const trackedSections = Array.from(document.querySelectorAll("[data-track-section]"));
  const sectionLinks = Array.from(document.querySelectorAll("[data-section-link]"));
  const progressBar = document.querySelector("[data-nav-progress]");
  const stickyNav = document.querySelector("[data-tournament-nav]");

  const setActiveSection = (id) => {
    sectionLinks.forEach((link) => {
      const active = link.dataset.sectionLink === id;
      link.classList.toggle("active", active);
      if (active) {
        link.setAttribute("aria-current", "location");
        link.scrollIntoView({ block: "nearest", inline: "center" });
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  if (trackedSections.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, { rootMargin: "-155px 0px -58% 0px", threshold: [0.01, 0.15, 0.35] });
    trackedSections.forEach((section) => sectionObserver.observe(section));
  }

  const updateProgress = () => {
    if (!progressBar) return;
    const main = document.querySelector("main");
    if (!main) return;
    const navHeight = stickyNav?.offsetHeight || 0;
    const start = main.offsetTop;
    const end = Math.max(start + 1, main.offsetTop + main.offsetHeight - window.innerHeight + navHeight);
    const progress = ((window.scrollY - start) / (end - start)) * 100;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  /* Subtle reveal animation -------------------------------------------- */
  if (trackedSections.length && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    trackedSections.forEach((section) => revealObserver.observe(section));
  } else {
    trackedSections.forEach((section) => section.classList.add("in-view"));
  }

  /* Timeline current-stage hint based on the calendar date ------------- */
  const timelineItems = Array.from(document.querySelectorAll(".tournament-timeline li"));
  if (timelineItems.length >= 5) {
    const now = Date.now();
    const cutoffs = [
      new Date("2026-08-20T00:00:00+08:00").getTime(),
      new Date("2026-08-23T00:00:00+08:00").getTime(),
      new Date("2026-08-23T13:00:00+08:00").getTime(),
      new Date("2026-08-23T18:00:00+08:00").getTime(),
    ];
    let currentStage = 0;
    while (currentStage < cutoffs.length && now >= cutoffs[currentStage]) currentStage += 1;
    timelineItems.forEach((item, index) => item.classList.toggle("timeline-current", index === currentStage));
  }

  /* Archive segmented filters ----------------------------------------- */
  const archiveFilterButtons = Array.from(document.querySelectorAll("[data-archive-filter]"));
  const archiveCards = Array.from(document.querySelectorAll("[data-archive-grid] .archive-card"));
  const archiveEmpty = document.querySelector("[data-archive-empty]");

  const getBookmarks = () => {
    try { return JSON.parse(localStorage.getItem("ugc_bookmarked_tournaments")) || []; }
    catch { return []; }
  };

  let activeArchiveFilter = "all";

  const applyArchiveFilter = () => {
    const saved = getBookmarks();
    let visible = 0;
    archiveCards.forEach((card) => {
      const saveButton = card.querySelector("[data-bookmark]");
      const isSaved = saveButton ? saved.includes(saveButton.dataset.bookmark) : false;
      const matches = activeArchiveFilter === "all"
        || (activeArchiveFilter === "saved" && isSaved)
        || card.dataset.archiveStatus === activeArchiveFilter;
      card.classList.toggle("is-hidden", !matches);
      if (matches) visible += 1;
    });
    if (archiveEmpty) {
      archiveEmpty.hidden = visible !== 0;
      if (!visible) archiveEmpty.textContent = activeArchiveFilter === "saved"
        ? "No saved tournaments yet. Use ‘Save event’ on a tournament card first."
        : "No tournaments match this filter.";
    }
  };

  archiveFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeArchiveFilter = button.dataset.archiveFilter;
      archiveFilterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      applyArchiveFilter();
    });
  });

  document.querySelectorAll("[data-bookmark]").forEach((button) => {
    button.addEventListener("click", () => window.setTimeout(applyArchiveFilter, 0));
  });
  applyArchiveFilter();

  /* Back-to-top -------------------------------------------------------- */
  const backTop = document.querySelector("[data-back-top]");
  const updateBackTop = () => backTop?.classList.toggle("show", window.scrollY > 900);
  backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateProgress();
      updateBackTop();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateProgress();
  updateBackTop();
})();
