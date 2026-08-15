const contactForm = document.querySelector("[data-contact-form]");
contactForm?.addEventListener("submit", (event) => { event.preventDefault(); const note = contactForm.querySelector("[data-form-note]"); if (note) note.textContent = "Thanks. This template form is ready to connect to your backend."; contactForm.reset(); });
