document.addEventListener("DOMContentLoaded", () => {

  const STORAGE_KEY =
    "utarGamingContacts";

  const contactForm =
    document.querySelector("[data-contact-form]");


  if (!contactForm) {
    return;
  }


  const note =
    contactForm.querySelector(
      "[data-form-note]"
    );

  function getSubmissions() {

    try {

      const savedData =
        localStorage.getItem(
          STORAGE_KEY
        );


      if (!savedData) {

        return [];

      }


      const data =
        JSON.parse(savedData);


      if (!Array.isArray(data)) {

        return [];

      }


      return data;


    } catch (error) {

      console.error(
        "Unable to read contact submissions:",
        error
      );


      return [];

    }

  }

  function saveSubmissions(
    submissions
  ) {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          submissions
        )
      );


      return true;


    } catch (error) {

      console.error(
        "Unable to save contact submission:",
        error
      );


      return false;

    }

  }

  contactForm.addEventListener(
    "submit",
    (event) => {


      event.preventDefault();

      const nameInput =
        contactForm.querySelector(
          '[name="name"]'
        );


      const emailInput =
        contactForm.querySelector(
          '[name="email"]'
        );


      const topicInput =
        contactForm.querySelector(
          '[name="topic"]'
        );


      const messageInput =
        contactForm.querySelector(
          '[name="message"]'
        );


      if (
        !nameInput ||
        !emailInput ||
        !topicInput ||
        !messageInput
      ) {

        return;

      }

      const name =
        nameInput.value.trim();


      const email =
        emailInput.value.trim();


      const topic =
        topicInput.value;


      const message =
        messageInput.value.trim();

      if (
        name === "" ||
        email === "" ||
        topic === "" ||
        message === ""
      ) {


        showMessage(
          "Please complete all required fields.",
          "error"
        );


        return;

      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      if (
        !emailPattern.test(email)
      ) {


        showMessage(
          "Please enter a valid email address.",
          "error"
        );


        return;

      }

      const submission = {

        id:
          Date.now(),

        name:
          name,

        email:
          email,

        topic:
          topic,

        message:
          message,

        date:
          new Date().toLocaleString()

      };

      const submissions =
        getSubmissions();

      submissions.push(
        submission
      );

      const saved =
        saveSubmissions(
          submissions
        );


      if (!saved) {


        showMessage(
          "Unable to save your message. Please try again.",
          "error"
        );


        return;

      }

      showMessage(
        "Message sent successfully! Thank you for contacting UTAR Gaming.",
        "success"
      );

      contactForm.reset();


    }
  );

  function showMessage(
    message,
    type
  ) {


    if (!note) {

      return;

    }


    note.textContent =
      message;


    note.classList.remove(
      "success",
      "error"
    );


    note.classList.add(
      type
    );

    setTimeout(
      () => {

        note.textContent =
          "";

        note.classList.remove(
          "success",
          "error"
        );

      },
      6000
    );

  }


});
