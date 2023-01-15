setTimeout(() => {
  // Add active class to the about section text
  document.querySelector("#about p").classList.add("active");

  // Add active class to the features list items
  const featureItems = document.querySelectorAll("#features li");
  featureItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add("active");
    }, index * 300);
  });

  // Add active class to the pricing section text
  document.querySelector("#pricing p").classList.add("active");
}, 300);

// Add event listener to the document for smooth scrolling
document.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    event.preventDefault();
    const targetId = event.target.getAttribute("href");
    document.querySelector(targetId).scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
});

document.querySelector("button").addEventListener("click", () => {
  window.location.href = "/upload";
});
