// js/contact.js - Contact page only.
// Keeps the local form workflow and merges session, cookie, and optional API features.
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "utarGamingContacts";
  const SESSION_KEY = "utarGamingContactSession";
  const contactForm = document.querySelector("[data-contact-form]");
  const socialPlugin = document.querySelector(".contact-social-plugin");

  if (!contactForm) return;

  const note = contactForm.querySelector("[data-form-note]");
  let messageTimer;

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

  async function loadSocialMediaData() {
    if (!socialPlugin) return;
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/users");
      if (!response.ok) throw new Error("Unable to load social media data.");
      const users = await response.json();
      if (!users[0]) return;
      const apiStatus = document.createElement("p");
      apiStatus.className = "api-status";
      apiStatus.textContent = "Social media plugin connected successfully.";
      socialPlugin.appendChild(apiStatus);
    } catch (error) {
      console.error("Social media API error:", error);
    }
  }

  if (!getCookie("utarGamingVisitor")) setCookie("utarGamingVisitor", "true", 30);
  const previousSession = getSessionData();
  if (previousSession) contactForm.dataset.previousSession = "true";
  void loadSocialMediaData();

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = contactForm.querySelector('[name="name"]')?.value.trim() || "";
    const email = contactForm.querySelector('[name="email"]')?.value.trim() || "";
    const topic = contactForm.querySelector('[name="topic"]')?.value || "";
    const message = contactForm.querySelector('[name="message"]')?.value.trim() || "";

    if (!name || !email || !topic || !message) {
      showMessage("Please complete all required fields.", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage("Please enter a valid email address.", "error");
      return;
    }

    const submission = {
      id: Date.now(),
      name: name,
      email: email,
      topic: topic,
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
      submittedAt: submission.date,
    });
    setCookie("utarGamingLastContact", String(submission.id), 30);
    void sendToRESTAPI(submission);

    showMessage("Message sent successfully! Thank you for contacting UTAR Gaming.", "success");
    contactForm.reset();
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
