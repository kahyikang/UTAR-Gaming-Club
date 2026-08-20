(() => {
  const ranking = document.querySelector("[data-team-ranking]");
  const teamCards = [...document.querySelectorAll("[data-team-id]")];

  if (!ranking || !teamCards.length) return;

  const storageKey = "utar_gaming_team_popularity";
  const initialPopularity = {
    "utar-reapers": 128,
    "utar-lynx": 104,
    "utar-brawlers": 86,
    "utar-war-clan": 67,
    "utar-creators": 51
  };
  const teams = teamCards.map((card, index) => ({
    id: card.dataset.teamId,
    name: card.dataset.teamName,
    game: card.dataset.teamGame,
    logo: card.dataset.teamLogo,
    href: card.getAttribute("href"),
    order: index
  }));
  let votes = readVotes();
  let scoresHaveAnimated = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function readVotes() {
    const defaults = Object.fromEntries(
      teams.map((team) => [team.id, initialPopularity[team.id] ?? 0])
    );

    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
      teams.forEach((team) => {
        const value = Number(saved?.[team.id]);
        if (Number.isFinite(value) && value >= 0) defaults[team.id] = Math.floor(value);
      });
    } catch {
      // Keep the ranking usable if browser storage is unavailable.
    }

    return defaults;
  }

  function saveVotes() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(votes));
    } catch {
      // Keep the in-memory ranking available when storage is blocked.
    }
  }

  function getRankedTeams() {
    return [...teams].sort((first, second) => {
      const voteDifference = votes[second.id] - votes[first.id];
      return voteDifference || first.order - second.order;
    });
  }

  function createRankingItem(team, position, displayScore = votes[team.id]) {
    const item = document.createElement("li");
    item.className = "team-ranking-item";
    item.dataset.teamId = team.id;
    item.innerHTML = `
      <span class="team-ranking-position" aria-label="Rank ${position}">${position}</span>
      <img class="team-ranking-logo" src="${team.logo}" alt="" />
      <a class="team-ranking-team" href="${team.href}">
        <strong>${team.name}</strong>
        <small>${team.game}</small>
      </a>
      <span class="team-ranking-score">
        <strong data-team-score="${team.id}">${displayScore}</strong>
        <small>${votes[team.id] === 1 ? "support" : "supports"}</small>
      </span>
      <button class="team-support-button" type="button" data-team-support="${team.id}" aria-label="Support ${team.name}">
        <span aria-hidden="true">+</span> Support
      </button>
    `;
    return item;
  }

  function render({ startScoresAtZero = false } = {}) {
    const rankedTeams = getRankedTeams();
    ranking.replaceChildren(
      ...rankedTeams.map((team, index) =>
        createRankingItem(team, index + 1, startScoresAtZero ? 0 : votes[team.id])
      )
    );
  }

  function animateScores() {
    if (scoresHaveAnimated) return;
    scoresHaveAnimated = true;

    const scoreElements = [...ranking.querySelectorAll("[data-team-score]")];
    if (reducedMotion.matches) {
      scoreElements.forEach((element) => {
        element.textContent = votes[element.dataset.teamScore];
      });
      return;
    }

    const duration = 3000;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      scoreElements.forEach((element) => {
        const target = votes[element.dataset.teamScore] || 0;
        element.textContent = Math.round(target * easedProgress);
      });

      if (progress < 1) window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  }

  function supportTeam(teamId) {
    const team = teams.find((candidate) => candidate.id === teamId);
    if (!team) return;

    votes[teamId] += 1;
    saveVotes();
    render();

    const rankedTeams = getRankedTeams();
    const newPosition = rankedTeams.findIndex((candidate) => candidate.id === teamId) + 1;
    const status = document.querySelector("[data-team-ranking-status]");
    if (status) status.textContent = `${team.name} is now ranked ${newPosition}.`;

    const updatedItem = ranking.querySelector(`[data-team-id="${teamId}"]`);
    const updatedButton = updatedItem?.querySelector("[data-team-support]");
    updatedButton?.classList.add("is-updated");
    window.setTimeout(() => updatedButton?.classList.remove("is-updated"), 420);
  }

  ranking.addEventListener("click", (event) => {
    const button = event.target.closest("[data-team-support]");
    if (!button) return;
    event.preventDefault();
    supportTeam(button.dataset.teamSupport);
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    votes = readVotes();
    render();
  });

  render({ startScoresAtZero: true });

  const popularitySection = ranking.closest(".team-popularity");
  if ("IntersectionObserver" in window && popularitySection) {
    let sectionIsVisible = false;
    let userHasScrolled = window.scrollY > 0;
    const startAfterScroll = () => {
      userHasScrolled = true;
      if (!sectionIsVisible) return;
      animateScores();
      window.removeEventListener("scroll", startAfterScroll);
    };

    window.addEventListener("scroll", startAfterScroll, { passive: true });

    const scoreObserver = new IntersectionObserver(
      (entries, observer) => {
        sectionIsVisible = entries.some((entry) => entry.isIntersecting);
        if (!sectionIsVisible || !userHasScrolled) return;
        animateScores();
        window.removeEventListener("scroll", startAfterScroll);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );
    scoreObserver.observe(popularitySection);

    if (userHasScrolled && popularitySection.getBoundingClientRect().top < window.innerHeight) {
      animateScores();
      window.removeEventListener("scroll", startAfterScroll);
      scoreObserver.disconnect();
    }
  } else {
    animateScores();
  }
})();
