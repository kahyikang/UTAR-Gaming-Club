(() => {
  const daySections = Array.from(document.querySelectorAll('[data-schedule-day]'));
  const programButtons = Array.from(document.querySelectorAll('[data-program-filter]'));
  const typeSelect = document.querySelector('[data-type-filter]');
  const selectedDateWrap = document.querySelector('.selected-date');
  const selectedRelative = document.querySelector('[data-selected-relative]');
  const selectedWeekday = document.querySelector('[data-selected-weekday]');
  const selectedDate = document.querySelector('[data-selected-date]');
  const selectedContext = document.querySelector('[data-selected-context]');
  const emptyState = document.querySelector('[data-schedule-empty]');
  const loadMoreButton = document.querySelector('[data-load-more]');
  const topbar = document.querySelector('.schedule-topbar');
  const siteHeader = document.querySelector('.site-header');

  /* Session storage: remember the visitor's Event Schedule view
     for the current browser tab/session only. */
  const SESSION_KEY = 'ugc_event_schedule_state';

  const readSessionState = () => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || {};
    } catch {
      return {};
    }
  };

  const savedState = readSessionState();

  let activeProgram =
    typeof savedState.program === 'string' ? savedState.program : 'all';
  let activeType =
    typeof savedState.type === 'string' ? savedState.type : 'all';
  let activeDateIndex =
    Number.isInteger(savedState.dateIndex) ? savedState.dateIndex : 0;
  let visibleDayCount =
    Number.isInteger(savedState.visibleDayCount)
      ? Math.min(Math.max(savedState.visibleDayCount, 1), daySections.length)
      : Math.min(3, daySections.length);

  const saveSessionState = () => {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          program: activeProgram,
          type: activeType,
          dateIndex: activeDateIndex,
          visibleDayCount,
        })
      );
    } catch {
      /* Keep the schedule usable even if storage is unavailable. */
    }
  };
  let currentScrollIndex = -1;
  let scrollTicking = false;

  const parseLocalDate = (isoDate) => new Date(`${isoDate}T12:00:00`);

  const formatHeaderDate = (isoDate) => {
    const date = parseLocalDate(isoDate);
    return {
      weekday: new Intl.DateTimeFormat('en', { weekday: 'long' })
        .format(date)
        .toUpperCase(),
      date: new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit' })
        .format(date)
        .replace(' 0', ' '),
    };
  };

  const getRelativeLabel = (isoDate) => {
    const target = parseLocalDate(isoDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
    const diffDays = Math.round((target - today) / 86400000);

    if (diffDays === 0) return 'TODAY';
    if (diffDays === 1) return 'TOMORROW';
    if (diffDays > 1) return 'UPCOMING';
    return 'PAST';
  };

  const cardMatches = (card) => {
    const programMatches =
      activeProgram === 'all' ||
      card.dataset.program === activeProgram ||
      card.dataset.program === 'all';
    const typeMatches = activeType === 'all' || card.dataset.type === activeType;
    return programMatches && typeMatches;
  };

  const getVisibleSections = () => daySections.filter((section) => !section.hidden);
  const getVisibleIndices = () =>
    getVisibleSections().map((section) => daySections.indexOf(section));

  const animateDate = () => {
    if (!selectedDateWrap) return;
    selectedDateWrap.classList.remove('is-updating');
    void selectedDateWrap.offsetWidth;
    selectedDateWrap.classList.add('is-updating');

    clearTimeout(animateDate.timer);
    animateDate.timer = setTimeout(() => {
      selectedDateWrap.classList.remove('is-updating');
    }, 420);
  };

  const updateHeaderForIndex = (index, animate = false) => {
    if (index < 0 || index >= daySections.length || daySections[index].hidden) return;

    const section = daySections[index];
    const isoDate = section.dataset.date;
    const formatted = formatHeaderDate(isoDate);
    const visibleCards = section.querySelectorAll('[data-event-card]:not([hidden])').length;

    activeDateIndex = index;
    saveSessionState();

    if (selectedRelative) selectedRelative.textContent = getRelativeLabel(isoDate);
    if (selectedWeekday) selectedWeekday.textContent = formatted.weekday;
    if (selectedDate) selectedDate.textContent = formatted.date;
    if (selectedContext) {
      selectedContext.textContent = `${visibleCards} scheduled item${visibleCards === 1 ? '' : 's'} on this day`;
    }

    daySections.forEach((item, itemIndex) => {
      item.classList.toggle('is-current-day', itemIndex === index && !item.hidden);
    });

    if (animate) animateDate();
  };

  const getStickyThreshold = () => {
    const headerHeight = siteHeader?.getBoundingClientRect().height || 78;
    const topbarHeight = topbar?.getBoundingClientRect().height || 180;
    return headerHeight + topbarHeight + 34;
  };

  const updateDateFromScroll = () => {
    const sections = getVisibleSections();
    if (!sections.length) return;

    const threshold = getStickyThreshold();
    let currentSection = sections[0];

    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) {
        currentSection = section;
      } else {
        break;
      }
    }

    const nextIndex = daySections.indexOf(currentSection);
    if (nextIndex !== currentScrollIndex) {
      currentScrollIndex = nextIndex;
      updateHeaderForIndex(nextIndex, true);
    }
  };

  const requestScrollUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;

    requestAnimationFrame(() => {
      updateDateFromScroll();
      scrollTicking = false;
    });
  };

  const render = () => {
    daySections.forEach((section, dayIndex) => {
      let hasMatchingCard = false;

      section.querySelectorAll('[data-event-card]').forEach((card) => {
        const shouldShow = cardMatches(card);
        card.hidden = !shouldShow;
        if (shouldShow) hasMatchingCard = true;
      });

      const insideLoadLimit = dayIndex < visibleDayCount;
      section.hidden = !hasMatchingCard || !insideLoadLimit;
    });

    const sections = getVisibleSections();
    if (emptyState) emptyState.hidden = sections.length !== 0;

    if (loadMoreButton) {
      const moreMatchingDays = daySections.slice(visibleDayCount).some((section) =>
        Array.from(section.querySelectorAll('[data-event-card]')).some(cardMatches)
      );
      loadMoreButton.hidden = !moreMatchingDays;
    }

    if (!sections.length) {
      if (selectedRelative) selectedRelative.textContent = 'SCHEDULE';
      if (selectedWeekday) selectedWeekday.textContent = 'NO EVENTS';
      if (selectedDate) selectedDate.textContent = '—';
      if (selectedContext) selectedContext.textContent = 'No events match the current filters.';
      return;
    }

    const indices = getVisibleIndices();
    const safeIndex = indices.includes(activeDateIndex) ? activeDateIndex : indices[0];
    currentScrollIndex = safeIndex;
    updateHeaderForIndex(safeIndex, false);
    requestScrollUpdate();
  };

  const scrollToDateIndex = (index) => {
    if (index < 0 || index >= daySections.length) return;

    if (index >= visibleDayCount) {
      visibleDayCount = index + 1;
      render();
    }

    if (daySections[index].hidden) return;

    currentScrollIndex = index;
    updateHeaderForIndex(index, true);
    daySections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  programButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeProgram = button.dataset.programFilter;
      programButtons.forEach((item) => item.classList.toggle('active', item === button));
      visibleDayCount = daySections.length;
      saveSessionState();
      render();
    });
  });

  typeSelect?.addEventListener('change', () => {
    activeType = typeSelect.value;
    visibleDayCount = daySections.length;
    saveSessionState();
    render();
  });

  document.querySelector('[data-date-prev]')?.addEventListener('click', () => {
    const indices = getVisibleIndices();
    if (!indices.length) return;
    const position = Math.max(0, indices.indexOf(activeDateIndex));
    scrollToDateIndex(indices[Math.max(0, position - 1)]);
  });

  document.querySelector('[data-date-next]')?.addEventListener('click', () => {
    const indices = getVisibleIndices();
    if (!indices.length) return;
    const position = Math.max(0, indices.indexOf(activeDateIndex));
    scrollToDateIndex(indices[Math.min(indices.length - 1, position + 1)]);
  });

  document.querySelector('[data-date-today]')?.addEventListener('click', () => {
    const todayIso = new Date().toISOString().slice(0, 10);

    const matchingIndices = daySections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) =>
        Array.from(section.querySelectorAll('[data-event-card]')).some(cardMatches)
      )
      .map(({ index }) => index);

    if (!matchingIndices.length) return;

    let targetIndex = matchingIndices.find(
      (index) => daySections[index].dataset.date >= todayIso
    );

    if (typeof targetIndex !== 'number') {
      targetIndex = matchingIndices[matchingIndices.length - 1];
    }

    scrollToDateIndex(targetIndex);
  });

  loadMoreButton?.addEventListener('click', () => {
    visibleDayCount = Math.min(daySections.length, visibleDayCount + 2);
    saveSessionState();
    render();
  });

  const pad2 = (num) => String(num).padStart(2, '0');

  document.querySelectorAll('[data-ics]').forEach((button) => {
    button.addEventListener('click', () => {
      const {
        icsTitle: title,
        icsStart: start,
        icsEnd: end,
        icsDesc: description,
      } = button.dataset;

      const toIcsLocal = (isoLocal) => isoLocal.replace(/[-:]/g, '');
      const nowUtc = new Date();
      const dtstamp =
        `${nowUtc.getUTCFullYear()}` +
        `${pad2(nowUtc.getUTCMonth() + 1)}` +
        `${pad2(nowUtc.getUTCDate())}` +
        `T${pad2(nowUtc.getUTCHours())}` +
        `${pad2(nowUtc.getUTCMinutes())}` +
        `${pad2(nowUtc.getUTCSeconds())}Z`;

      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Utar Gaming//Event Schedule//EN',
        'BEGIN:VEVENT',
        `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@utargaming`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${toIcsLocal(start)}`,
        `DTEND:${toIcsLocal(end)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${(description || '').replace(/,/g, '\\,')}`,
        'LOCATION:UTAR Campus',
        'END:VEVENT',
        'END:VCALENDAR',
      ];

      const blob = new Blob([lines.join('\r\n')], {
        type: 'text/calendar;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  });

  /* Restore the saved controls for this browser session. */
  if (!programButtons.some((button) => button.dataset.programFilter === activeProgram)) {
    activeProgram = 'all';
  }
  programButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.programFilter === activeProgram);
  });

  if (typeSelect) {
    const hasSavedType = Array.from(typeSelect.options).some(
      (option) => option.value === activeType
    );
    if (!hasSavedType) activeType = 'all';
    typeSelect.value = activeType;
  }

  if (activeDateIndex < 0 || activeDateIndex >= daySections.length) {
    activeDateIndex = 0;
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);

  render();

  /* Re-open the remembered date after the filters have been restored. */
  if (daySections[activeDateIndex] && !daySections[activeDateIndex].hidden) {
    updateHeaderForIndex(activeDateIndex, false);
  }
  saveSessionState();
})();
