/*
 * RESTful API + jQuery integration for events.html
 * ------------------------------------------------
 * REST API: current Malaysia time (Asia/Kuala_Lumpur)
 * jQuery: $.ajax() performs the asynchronous HTTP GET request.
 * The API time is then used to calculate which UTAR Gaming events are upcoming.
 */
$(function () {
  const $grid = $("[data-api-projects]");
  const $status = $("[data-api-status]");
  const $filters = $("[data-api-topic]");
  const $refresh = $("[data-api-refresh]");
  const $source = $("[data-api-source]");

  if (!$grid.length) return;

  let currentFilter = "all";
  let malaysiaNow = null;

  const clubEvents = [
    {
      title: "Mobile Legends Weekly Scrim",
      game: "Mobile Legends",
      team: "Utar Lynx",
      type: "community",
      typeLabel: "Practice",
      start: "2026-08-20T19:00:00+08:00",
      end: "2026-08-20T21:00:00+08:00",
      logo: "assets/mobile-legends-logo.png",
      copy: "Ranked draft practice and rotation timing for the Utar Lynx roster.",
      link: "event-schedule.html"
    },
    {
      title: "Nexus Open 2026 · PUBG Group Stage",
      game: "PUBG",
      team: "Utar Reapers",
      type: "tournament",
      typeLabel: "Tournament",
      start: "2026-08-22T10:00:00+08:00",
      end: "2026-08-22T13:00:00+08:00",
      logo: "assets/pubg-logo.png",
      copy: "PUBG squad group-stage matches for the Utar Reapers at Nexus Open 2026.",
      link: "tournaments.html"
    },
    {
      title: "Nexus Open 2026 · Mobile Legends",
      game: "Mobile Legends",
      team: "Utar Lynx",
      type: "tournament",
      typeLabel: "Tournament",
      start: "2026-08-22T14:00:00+08:00",
      end: "2026-08-22T17:00:00+08:00",
      logo: "assets/mobile-legends-logo.png",
      copy: "Mobile Legends group-stage competition for Utar Lynx.",
      link: "tournaments.html"
    },
    {
      title: "Nexus Open 2026 · Brawl Stars Final",
      game: "Brawl Stars",
      team: "Utar Brawlers",
      type: "tournament",
      typeLabel: "Final",
      start: "2026-08-23T12:00:00+08:00",
      end: "2026-08-23T14:00:00+08:00",
      logo: "assets/brawl-stars-logo.png",
      copy: "Championship-stage Brawl Stars matches for Utar Brawlers.",
      link: "tournaments.html"
    },
    {
      title: "PUBG Squad Strategy Workshop",
      game: "PUBG",
      team: "Utar Reapers",
      type: "community",
      typeLabel: "Workshop",
      start: "2026-08-29T14:00:00+08:00",
      end: "2026-08-29T16:00:00+08:00",
      logo: "assets/pubg-logo.png",
      copy: "Rotations, loadouts and endgame positioning workshop for the squad.",
      link: "event-schedule.html"
    },
    {
      title: "Brawl Stars Open Lobby Night",
      game: "Brawl Stars",
      team: "Utar Brawlers",
      type: "community",
      typeLabel: "Community",
      start: "2026-09-05T19:00:00+08:00",
      end: "2026-09-05T22:00:00+08:00",
      logo: "assets/brawl-stars-logo.png",
      copy: "Casual matches for every skill level with the club community.",
      link: "event-schedule.html"
    },
    {
      title: "Roblox Creator & Competitive Tryouts",
      game: "Roblox",
      team: "Utar Creators",
      type: "community",
      typeLabel: "Tryout",
      start: "2026-09-12T18:00:00+08:00",
      end: "2026-09-12T20:00:00+08:00",
      logo: "assets/roblox-logo.png",
      copy: "Open evaluation for competitive players and creator-track applicants.",
      link: "event-schedule.html"
    },
    {
      title: "Campus Cup 2026 Qualifiers",
      game: "Multi-game",
      team: "UTAR Gaming",
      type: "tournament",
      typeLabel: "Qualifier",
      start: "2026-10-10T10:00:00+08:00",
      end: "2026-10-10T18:00:00+08:00",
      logo: "assets/utar-gaming-logo.jpeg",
      copy: "Campus Cup qualifying day across UTAR Gaming programs.",
      link: "tournaments.html"
    }
  ];

  const formatDate = (iso) => new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kuala_Lumpur"
  }).format(new Date(iso));

  const formatTime = (iso) => new Intl.DateTimeFormat("en-MY", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kuala_Lumpur"
  }).format(new Date(iso));

  const daysUntil = (iso, now) => {
    const diff = new Date(iso).getTime() - now.getTime();
    const days = Math.ceil(diff / 86400000);
    if (days <= 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  const showLoading = () => {
    $status.removeClass("is-error").text("Calling REST API for current Malaysia time…");
    $refresh.addClass("is-loading").prop("disabled", true);
    $grid.html(`
      <article class="api-project-card api-placeholder"><div class="api-placeholder-line"></div><div class="api-placeholder-line"></div><div class="api-placeholder-line"></div></article>
      <article class="api-project-card api-placeholder"><div class="api-placeholder-line"></div><div class="api-placeholder-line"></div><div class="api-placeholder-line"></div></article>
      <article class="api-project-card api-placeholder"><div class="api-placeholder-line"></div><div class="api-placeholder-line"></div><div class="api-placeholder-line"></div></article>
    `);
  };

  const renderEvents = () => {
    const now = malaysiaNow || new Date();
    let events = clubEvents
      .filter((event) => new Date(event.end) > now)
      .filter((event) => currentFilter === "all" || event.type === currentFilter)
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    if (!events.length) {
      $grid.html('<article class="api-project-card"><h3>No upcoming events</h3><p>There are no future activities in this category right now. Try another filter.</p></article>');
      return;
    }

    const cards = events.slice(0, 3).map((event) => `
      <article class="api-project-card api-event-card">
        <div class="api-project-top">
          <div class="api-owner api-event-game">
            <img src="${event.logo}" alt="" loading="lazy" />
            <span>${event.game}</span>
          </div>
          <span class="api-event-type">${event.typeLabel}</span>
        </div>
        <p class="api-event-date">${formatDate(event.start)} · ${formatTime(event.start)}</p>
        <h3>${event.title}</h3>
        <p>${event.copy}</p>
        <div class="api-card-footer">
          <span class="api-language">${daysUntil(event.start, now)} · ${event.team}</span>
          <a class="api-project-link" href="${event.link}">View details →</a>
        </div>
      </article>
    `).join("");

    $grid.html(cards);
  };

  const getMalaysiaTime = () => {
    showLoading();

    $.ajax({
      url: "https://gateway.timeapi.world/timezone/Asia/Kuala_Lumpur",
      method: "GET",
      dataType: "json",
      timeout: 10000
    })
      .done(function (response) {
        const apiDate = response && response.datetime ? new Date(response.datetime) : null;
        if (!apiDate || Number.isNaN(apiDate.getTime())) throw new Error("Invalid API time");

        malaysiaNow = apiDate;
        renderEvents();
        const displayNow = new Intl.DateTimeFormat("en-MY", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "numeric", minute: "2-digit", hour12: true,
          timeZone: "Asia/Kuala_Lumpur"
        }).format(malaysiaNow);
        $status.removeClass("is-error").text(`REST API connected · Malaysia time: ${displayNow} · showing the next 3 matching events`);
        $source.text("Live time source: Time API · Asia/Kuala_Lumpur");
      })
      .fail(function () {
        malaysiaNow = new Date();
        renderEvents();
        $status.addClass("is-error").text("REST API unavailable · showing the schedule using your browser time as fallback");
        $source.text("Fallback active · use Refresh schedule to call the REST API again");
      })
      .always(function () {
        $refresh.removeClass("is-loading").prop("disabled", false);
      });
  };

  $filters.on("click", function () {
    currentFilter = $(this).data("apiTopic");
    $filters.removeClass("active").attr("aria-pressed", "false");
    $(this).addClass("active").attr("aria-pressed", "true");
    renderEvents();
  });

  $refresh.on("click", getMalaysiaTime);

  getMalaysiaTime();
});
