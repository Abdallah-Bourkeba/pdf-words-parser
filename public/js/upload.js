const form = document.querySelector("form");
const fileInput = document.querySelector("#file");
const nameInput = document.querySelector("#name");
const allWordsDiv = document.querySelector("#all-words");
const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modal-content");
const closeModal = document.querySelector("#close-modal");
const modalWord = document.querySelector("#modal-word");
const modalYes = document.querySelector("#modal-yes");
const modalNo = document.querySelector("#modal-no");
const totalWords = document.getElementById("total-words");
const knownWordsEle = document.getElementById("known-words");
const unknownWords = document.getElementById("unknown-words");
const seenWords = document.getElementById("seen-words");
let totalWordsCount;
let pdfName = "";
let userName = "";
let allWordsArr = [];
let unknownWordsArr = [];

checkAndSetId();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    // Extract form data
    pdfName = fileInput.files[0].name;
    userName =
      nameInput.value === ""
        ? localStorage.getItem("userName")
        : nameInput.value;

    // Validate form data
    if (!pdfName || !userName) {
      return showUserMessage("Please fill in all form fields.");
    }

    // Prepare form data for submission
    const formData = new FormData();
    formData.append("pdfFile", fileInput.files[0]);
    // Submit form data and handle response
    const res = await fetch("/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    const allWords = data.preparedWords;
    allWordsArr = allWords;

    if (allWords.length > 0) {
      allWordsDiv.innerHTML = `
          <h2>All words in the PDF:</h2>
          <ul>
            <li>${allWords.join("</li><li>")}</li>
          </ul>
          <button class="btn" id="start-modal">Start Checking</button>
          `;
      document
        .querySelector("#start-modal")
        .addEventListener("click", () => (modal.style.display = "flex"));
      document.querySelector(".float").style.display = "flex";
      totalWordsCount = allWordsArr.length;
      form.remove();
      checkAndSetId();
      checkWord();
      changeFlaotValues();
    }
  } catch (error) {
    console.log(error);
    showUserMessage(error);
  }
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

modalYes.addEventListener("click", () => {
  allWordsArr = allWordsArr.filter((word) => word !== modalWord.innerText);
  checkWord();
});

modalNo.addEventListener("click", () => {
  unknownWordsArr.push(modalWord.innerText);
  allWordsArr = allWordsArr.filter((word) => word !== modalWord.innerText);
  checkWord();
});

// Functions
async function checkWord() {
  try {
    if (allWordsArr.length > 0) {
      modalWord.innerText = allWordsArr[0];
    } else {
      closeModal.click();
      allWordsDiv.innerHTML = `
        <h2>Unknown Words:</h2>
        <ul>
          <li>${unknownWordsArr.join("</li><li>")}</li>
        </ul>
        `;
      // code to save the unknown words to the database
      handleSaveResponse(
        await fetch("/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ unknownWordsArr, pdfName, userName }),
        })
      );
    }
    changeFlaotValues();
  } catch (error) {
    console.error(error);
  }

  async function handleSaveResponse(response) {
    if (!response.ok) {
      throw new Error("An error occurred while saving the words.");
    }
    const data = await response.json();
    showUserMessage(data.message);
  }
}

function changeFlaotValues() {
  // Variables to store the counts of words
  let unknownWordsCount = unknownWordsArr.length;
  let knownWordsCount = totalWordsCount - unknownWordsArr.length;
  let seenWordsCount = totalWordsCount - allWordsArr.length;

  // Update the innerHTML of the HTML elements with the counts
  totalWords.innerHTML = "Total Words: " + totalWordsCount;
  unknownWords.innerHTML = "Unknown Words: " + unknownWordsCount;
  knownWordsEle.innerHTML = "Known Words: " + knownWordsCount;
  seenWords.innerHTML = "Seen Words: " + seenWordsCount;
}

function checkAndSetId() {
  const wordsLink = document.querySelector("#all-words a");
  if (!localStorage.getItem("userName")) {
    if (userName) localStorage.setItem("userName", userName);
    if (wordsLink) wordsLink.remove();
  } else {
    userName = localStorage.getItem("userName");
    if (wordsLink) wordsLink.href += `/${userName}`;
    const nameInput = document.querySelector(".name-input");
    if (nameInput) nameInput.remove();
  }
}

function showUserMessage(messageText) {
  const message = document.createElement("div");
  message.classList.add("message");
  message.textContent = messageText;
  document.body.appendChild(message);

  setTimeout(() => {
    message.classList.add("active");
  }, 300);

  setTimeout(() => {
    message.classList.remove("active");
  }, 3000);

  setTimeout(() => {
    message.remove();
  }, 3300);
}
