const mobileLegendsProfileModal = document.querySelector("[data-profile-modal]");
const mobileLegendsProfileTriggers = [...document.querySelectorAll("[data-profile-trigger]")];

if (mobileLegendsProfileModal && mobileLegendsProfileTriggers.length) {
  const modalImage = mobileLegendsProfileModal.querySelector("[data-profile-modal-image]");
  const modalName = mobileLegendsProfileModal.querySelector("[data-profile-modal-name]");
  const modalIgn = mobileLegendsProfileModal.querySelector("[data-profile-modal-ign]");
  const modalRole = mobileLegendsProfileModal.querySelector("[data-profile-modal-role]");
  const modalRank = mobileLegendsProfileModal.querySelector("[data-profile-modal-rank]");
  const modalFavourite = mobileLegendsProfileModal.querySelector("[data-profile-modal-favourite]");
  const modalAbout = mobileLegendsProfileModal.querySelector("[data-profile-modal-about]");
  const modalAchievements = mobileLegendsProfileModal.querySelector("[data-profile-modal-achievements]");
  const closeButton = mobileLegendsProfileModal.querySelector(".profile-modal-close");
  let lastTrigger = null;

  const closeProfile = () => {
    if (mobileLegendsProfileModal.hidden) return;
    mobileLegendsProfileModal.hidden = true;
    document.body.classList.remove("profile-modal-open");
    lastTrigger?.focus();
  };

  const openProfile = (trigger) => {
    lastTrigger = trigger;
    const profile = trigger.dataset;
    modalImage.src = profile.profileImage;
    modalImage.alt = profile.profileName;
    modalName.textContent = profile.profileName;
    modalIgn.textContent = profile.profileIgn;
    modalRole.textContent = profile.profileRole;
    modalRank.textContent = profile.profileRank;
    modalFavourite.textContent = profile.profileFavourite;
    modalAbout.textContent = profile.profileAbout;
    modalAchievements.replaceChildren(...profile.profileAchievements.split("|").map((achievement) => {
      const item = document.createElement("li");
      item.textContent = achievement;
      return item;
    }));
    mobileLegendsProfileModal.hidden = false;
    document.body.classList.add("profile-modal-open");
    closeButton?.focus();
  };

  mobileLegendsProfileTriggers.forEach((trigger) => trigger.addEventListener("click", () => openProfile(trigger)));
  mobileLegendsProfileModal.querySelectorAll("[data-profile-close]").forEach((element) => element.addEventListener("click", closeProfile));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProfile();
  });
}
