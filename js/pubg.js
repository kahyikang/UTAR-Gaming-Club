const pubgProfileModal = document.querySelector("[data-profile-modal]");
const pubgProfileTriggers = [...document.querySelectorAll("[data-profile-trigger]")];

if (pubgProfileModal && pubgProfileTriggers.length) {
  const modalImage = pubgProfileModal.querySelector("[data-profile-modal-image]");
  const modalName = pubgProfileModal.querySelector("[data-profile-modal-name]");
  const modalIgn = pubgProfileModal.querySelector("[data-profile-modal-ign]");
  const modalRole = pubgProfileModal.querySelector("[data-profile-modal-role]");
  const modalRank = pubgProfileModal.querySelector("[data-profile-modal-rank]");
  const modalFavourite = pubgProfileModal.querySelector("[data-profile-modal-favourite]");
  const modalAbout = pubgProfileModal.querySelector("[data-profile-modal-about]");
  const modalAchievements = pubgProfileModal.querySelector("[data-profile-modal-achievements]");
  const closeButton = pubgProfileModal.querySelector(".profile-modal-close");
  const modalScroll = pubgProfileModal.querySelector(".profile-dialog-scroll");
  let lastTrigger = null;

  const closeProfile = () => {
    if (pubgProfileModal.hidden) return;
    pubgProfileModal.hidden = true;
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
    pubgProfileModal.hidden = false;
    if (modalScroll) {
      modalScroll.scrollTop = 0;
      modalScroll.scrollLeft = 0;
    }
    document.body.classList.add("profile-modal-open");
    closeButton?.focus();
  };

  pubgProfileTriggers.forEach((trigger) => trigger.addEventListener("click", () => openProfile(trigger)));
  pubgProfileModal.querySelectorAll("[data-profile-close]").forEach((element) => element.addEventListener("click", closeProfile));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProfile();
  });
}
