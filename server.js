const paragraph = document.getElementById("interactiveText");

// STEP 1: Split text into words
const words = paragraph.innerText.split(" ");

paragraph.innerHTML = words
  .map(word => `<span class="word">${word}</span>`)
  .join(" ");

// STEP 2: Get all word elements
const wordElements = document.querySelectorAll(".word");

// STEP 3: Add mouse interaction
paragraph.addEventListener("mousemove", (e) => {
  const mouseY = e.clientY;

  wordElements.forEach(word => {
    const rect = word.getBoundingClientRect();

    // Check if cursor is near this word vertically
    const isNear = Math.abs(mouseY - rect.top) < rect.height;

    if (isNear) {
      word.classList.add("highlight");
    } else {
      word.classList.remove("highlight");
    }
  });
});