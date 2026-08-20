// js/contact.js - Contact page only.
// Keeps the local form workflow and merges session, cookie, and optional API features.
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "utarGamingContacts";
  const SESSION_KEY = "utarGamingContactSession";
  const contactForm = document.querySelector("[data-contact-form]");

  if (!contactForm) return;

  const note = contactForm.querySelector("[data-form-note]");
  const topicSelect = contactForm.querySelector("[data-topic-select]");
  const topicDetails = contactForm.querySelector("[data-topic-details]");
  const topicGuidance = contactForm.querySelector("[data-topic-guidance]");
  const topicDetailsCopy = contactForm.querySelector("[data-topic-details-copy]");
  const gameField = contactForm.querySelector('[data-topic-field="game"]');
  const teamField = contactForm.querySelector('[data-topic-field="team"]');
  const gameSelect = contactForm.querySelector('[name="game"]');
  const teamInput = contactForm.querySelector('[name="team"]');
  const copyButtons = document.querySelectorAll("[data-copy-contact]");
  const copyStatus = document.querySelector("[data-contact-copy-status]");
  let messageTimer;
  let copyTimer;

  const topicOptions = {
    "Competition registration": {
      guidance: "Register a team or ask about joining an upcoming competition.",
      details: "Select the game you want to enter. Add a team name if you already have one.",
      showGame: true,
      showTeam: true,
      requiredGame: true,
    },
    "Club membership": {
      guidance: "Ask about joining UTAR Gaming and becoming part of the club community.",
      details: "Choose the game you are most interested in, or leave it open if you want to explore.",
      showGame: true,
      showTeam: false,
    },
    "Team tryouts": {
      guidance: "Ask about tryouts, team openings, training, or player recruitment.",
      details: "Select the game you want to try out for so the committee can direct your request.",
      showGame: true,
      showTeam: false,
      requiredGame: true,
    },
    "Event or training enquiry": {
      guidance: "Ask about tournaments, training sessions, workshops, or club meetings.",
    },
    "Merchandise enquiry": {
      guidance: "Ask about shop items, sizing, orders, pickup, or merchandise availability.",
    },
    "Media and collaboration": {
      guidance: "Contact us about interviews, content, coverage, or creative collaborations.",
    },
    Partnership: {
      guidance: "Discuss sponsorship, event support, or a partnership with UTAR Gaming.",
    },
    "General enquiry": {
      guidance: "Send a general question to the UTAR Gaming committee.",
    },
    Other: {
      guidance: "Tell us what you need and we will direct your message to the right person.",
    },
  };

  function updateTopicFields() {
    if (!topicSelect) return;

    const selectedTopic = topicOptions[topicSelect.value];
    const hasDetails = Boolean(selectedTopic?.showGame || selectedTopic?.showTeam);

    if (topicDetails) topicDetails.hidden = !hasDetails;
    if (gameField) gameField.hidden = !selectedTopic?.showGame;
    if (teamField) teamField.hidden = !selectedTopic?.showTeam;
    if (gameSelect) gameSelect.required = Boolean(selectedTopic?.requiredGame);
    if (topicGuidance) {
      topicGuidance.textContent = selectedTopic?.guidance || "Choose the reason that best matches your message.";
    }
    if (topicDetailsCopy) topicDetailsCopy.textContent = selectedTopic?.details || "";

    if (!hasDetails) {
      if (gameSelect) gameSelect.value = "";
      if (teamInput) teamInput.value = "";
    }
  }

  topicSelect?.addEventListener("change", updateTopicFields);
  updateTopicFields();

  async function copyContactValue(button) {
    const value = button.dataset.copyValue || "";
    const label = button.querySelector("[data-copy-label]");
    if (!value) return;

    let copied = false;

    try {
      await navigator.clipboard.writeText(value);
      copied = true;
    } catch (error) {
      try {
        const fallback = document.createElement("textarea");
        fallback.value = value;
        fallback.setAttribute("readonly", "");
        fallback.style.position = "fixed";
        fallback.style.opacity = "0";
        document.body.appendChild(fallback);
        fallback.select();
        copied = document.execCommand("copy");
        fallback.remove();
      } catch (fallbackError) {
        console.error("Unable to copy contact detail:", fallbackError);
      }
    }

    if (!copied) {
      if (copyStatus) copyStatus.textContent = "Copy failed. Please select the text manually.";
      return;
    }

    if (label) {
      const previousLabel = label.textContent.trim();
      label.textContent = "COPIED";
      window.clearTimeout(button.copyTimer);
      button.copyTimer = window.setTimeout(() => {
        label.textContent = previousLabel;
      }, 1800);
    }

    if (copyStatus) {
      window.clearTimeout(copyTimer);
      copyStatus.textContent = `${value} copied to clipboard.`;
      copyTimer = window.setTimeout(() => {
        copyStatus.textContent = "";
      }, 2200);
    }
  }

  copyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      void copyContactValue(button);
    });

    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        void copyContactValue(button);
      }
    });
  });

  function getSubmissions() {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const data = savedData ? JSON.parse(savedData) : [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Unable to read contact submissions:", error);
      return [];
    }
  }

  function saveSubmissions(submissions) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
      return true;
    } catch (error) {
      console.error("Unable to save contact submission:", error);
      return false;
    }
  }

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + date.toUTCString() + ";path=/";
  }

  function getCookie(name) {
    const prefix = name + "=";
    return document.cookie.split(";").map((item) => item.trim()).find((item) => item.indexOf(prefix) === 0)?.slice(prefix.length) || "";
  }

  function saveSessionData(data) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Unable to save contact session:", error);
      return false;
    }
  }

  function getSessionData() {
    try {
      const savedSession = sessionStorage.getItem(SESSION_KEY);
      return savedSession ? JSON.parse(savedSession) : null;
    } catch (error) {
      console.error("Unable to read contact session:", error);
      return null;
    }
  }

  async function sendToRESTAPI(submission) {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: submission.name,
          email: submission.email,
          topic: submission.topic,
          game: submission.game,
          team: submission.team,
          message: submission.message,
          date: submission.date,
        }),
      });
      if (!response.ok) throw new Error("REST API request failed.");
      return await response.json();
    } catch (error) {
      // The local submission remains the source of truth when the demo API is unavailable.
      console.error("REST API error:", error);
      return null;
    }
  }

  if (!getCookie("utarGamingVisitor")) setCookie("utarGamingVisitor", "true", 30);
  const previousSession = getSessionData();
  if (previousSession) contactForm.dataset.previousSession = "true";

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = contactForm.querySelector('[name="name"]')?.value.trim() || "";
    const email = contactForm.querySelector('[name="email"]')?.value.trim() || "";
    const topic = contactForm.querySelector('[name="topic"]')?.value || "";
    const game = contactForm.querySelector('[name="game"]')?.value || "";
    const team = contactForm.querySelector('[name="team"]')?.value.trim() || "";
    const message = contactForm.querySelector('[name="message"]')?.value.trim() || "";

    if (!name || !email || !topic || !message) {
      showMessage("Please complete all required fields.", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage("Please enter a valid email address.", "error");
      return;
    }

    if (topicOptions[topic]?.requiredGame && !game) {
      showMessage("Please select the game related to your request.", "error");
      return;
    }

    const submission = {
      id: Date.now(),
      name: name,
      email: email,
      topic: topic,
      game: game,
      team: team,
      message: message,
      date: new Date().toLocaleString(),
    };

    const submissions = getSubmissions();
    submissions.push(submission);
    if (!saveSubmissions(submissions)) {
      showMessage("Unable to save your message. Please try again.", "error");
      return;
    }

    saveSessionData({
      lastSubmissionId: submission.id,
      name: submission.name,
      email: submission.email,
      topic: submission.topic,
      game: submission.game,
      team: submission.team,
      submittedAt: submission.date,
    });
    setCookie("utarGamingLastContact", String(submission.id), 30);
    void sendToRESTAPI(submission);

    showMessage("Message sent successfully! Thank you for contacting UTAR Gaming.", "success");
    contactForm.reset();
    updateTopicFields();
  });

  function showMessage(message, type) {
    if (!note) return;
    window.clearTimeout(messageTimer);
    note.textContent = message;
    note.classList.remove("success", "error");
    note.classList.add(type);
    messageTimer = window.setTimeout(() => {
      note.textContent = "";
      note.classList.remove("success", "error");
    }, 6000);
  }
});
