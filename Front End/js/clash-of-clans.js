const clashOfClansProfileModal = document.querySelector("[data-profile-modal]");
const clashOfClansProfileTriggers = [...document.querySelectorAll("[data-profile-trigger]")];

if (clashOfClansProfileModal && clashOfClansProfileTriggers.length) {
  const modalImage = clashOfClansProfileModal.querySelector("[data-profile-modal-image]");
  const modalName = clashOfClansProfileModal.querySelector("[data-profile-modal-name]");
  const modalIgn = clashOfClansProfileModal.querySelector("[data-profile-modal-ign]");
  const modalRole = clashOfClansProfileModal.querySelector("[data-profile-modal-role]");
  const modalRank = clashOfClansProfileModal.querySelector("[data-profile-modal-rank]");
  const modalFavourite = clashOfClansProfileModal.querySelector("[data-profile-modal-favourite]");
  const modalAbout = clashOfClansProfileModal.querySelector("[data-profile-modal-about]");
  const modalAchievements = clashOfClansProfileModal.querySelector("[data-profile-modal-achievements]");
  const closeButton = clashOfClansProfileModal.querySelector(".profile-modal-close");
  let lastTrigger = null;

  const closeProfile = () => {
    if (clashOfClansProfileModal.hidden) return;
    clashOfClansProfileModal.hidden = true;
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
    clashOfClansProfileModal.hidden = false;
    document.body.classList.add("profile-modal-open");
    closeButton?.focus();
  };

  clashOfClansProfileTriggers.forEach((trigger) => trigger.addEventListener("click", () => openProfile(trigger)));
  clashOfClansProfileModal.querySelectorAll("[data-profile-close]").forEach((element) => element.addEventListener("click", closeProfile));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProfile();
  });
}
