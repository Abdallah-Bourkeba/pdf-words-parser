const tbody = document.querySelector("#words-tbody");

const createTableRow = (word, pdfName) => {
  return `<tr><td>${word}</td><td>${pdfName}</td></tr>`;
};

if (Array.isArray(allWords) && tbody) {
  let rows = "";
  allWords.forEach((wordsContainer) => {
    const { words, pdf } = wordsContainer;
    if (Array.isArray(words) && pdf && pdf.name) {
      words.forEach((word) => {
        rows += createTableRow(word, pdf.name);
      });
    }
  });
  tbody.innerHTML = rows;
}
