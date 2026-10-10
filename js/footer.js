(() => {
  "use strict";
  const container = document.querySelector(".container");
  if (!container) return;

  const footer = document.createElement("footer");
  footer.className = "site-footer";

  const copyright = document.createElement("span");
  copyright.textContent = "© " + new Date().getFullYear() + " WTLEB 1720 AM";

  const notice = document.createElement("span");
  notice.className = "site-footer-notice";
  notice.textContent = "CONTINUITY IS NOT GUARANTEED";

  footer.appendChild(copyright);
  footer.appendChild(notice);
  container.appendChild(footer);
})();
