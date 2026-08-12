(() => {
  const container = document.querySelector(".container");

  if (!container) {
    return;
  }

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.textContent = `© ${new Date().getFullYear()} WTLEB 1720 AM`;

  container.appendChild(footer);
})();
