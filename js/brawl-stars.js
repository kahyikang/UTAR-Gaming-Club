const brawlStarsProfileModal = document.querySelector("[data-profile-modal]");
const brawlStarsProfileTriggers = [...document.querySelectorAll("[data-profile-trigger]")];

if (brawlStarsProfileModal && brawlStarsProfileTriggers.length) {
  const modalImage = brawlStarsProfileModal.querySelector("[data-profile-modal-image]");
  const modalName = brawlStarsProfileModal.querySelector("[data-profile-modal-name]");
  const modalIgn = brawlStarsProfileModal.querySelector("[data-profile-modal-ign]");
  const modalRole = brawlStarsProfileModal.querySelector("[data-profile-modal-role]");
  const modalRank = brawlStarsProfileModal.querySelector("[data-profile-modal-rank]");
  const modalFavourite = brawlStarsProfileModal.querySelector("[data-profile-modal-favourite]");
  const modalAbout = brawlStarsProfileModal.querySelector("[data-profile-modal-about]");
  const modalAchievements = brawlStarsProfileModal.querySelector("[data-profile-modal-achievements]");
  const closeButton = brawlStarsProfileModal.querySelector(".profile-modal-close");
  const modalScroll = brawlStarsProfileModal.querySelector(".profile-dialog-scroll");
  let lastTrigger = null;

  const closeProfile = () => {
    if (brawlStarsProfileModal.hidden) return;
    brawlStarsProfileModal.hidden = true;
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
    brawlStarsProfileModal.hidden = false;
    if (modalScroll) {
      modalScroll.scrollTop = 0;
      modalScroll.scrollLeft = 0;
    }
    document.body.classList.add("profile-modal-open");
    closeButton?.focus();
  };

  brawlStarsProfileTriggers.forEach((trigger) => trigger.addEventListener("click", () => openProfile(trigger)));
  brawlStarsProfileModal.querySelectorAll("[data-profile-close]").forEach((element) => element.addEventListener("click", closeProfile));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProfile();
  });
}
