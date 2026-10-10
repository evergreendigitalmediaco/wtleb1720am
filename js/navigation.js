(() => {
  "use strict";
  const navigation = document.getElementById("station-navigation");
  if (!navigation) return;

  const links = [
    { text: "STATION HOME", url: "/", path: "/" },
    { text: "LIVE ON AIR!", url: "/live.html", path: "/live.html" },
    { text: "STATION INFO", url: "/station-info.html", path: "/station-info.html" },
    { text: "RELAY NETWORKS", url: "/relay.html", path: "/relay.html" },
    { text: "ARCHIVED BROADCASTS", url: "/archive.html", path: "/archive.html" },
    { text: "SECURE CHANNEL", url: "https://www.patreon.com/TheLastEmergencyBroadcast" },
    { text: "SUPPLY ACCESS", url: "https://shop.wtleb1720am.com" },
    { text: "SUBMIT REPORT", url: "/report.html", path: "/report.html" }
  ];

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "station-nav-toggle";
  toggle.id = "station-nav-toggle";
  toggle.setAttribute("aria-controls", "station-nav-panel");
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "STATION CONTROL // MENU";
  navigation.appendChild(toggle);

  const panel = document.createElement("div");
  panel.className = "station-nav-panel";
  panel.id = "station-nav-panel";

  const heading = document.createElement("div");
  heading.className = "panel-title";
  heading.textContent = "CONTROL INTERFACE";
  panel.appendChild(heading);

  const subtitle = document.createElement("div");
  subtitle.className = "panel-subtitle";
  subtitle.textContent = "STATION SERVICES AVAILABLE";
  panel.appendChild(subtitle);

  const currentPath = window.location.pathname.replace(/\/index\.html$/, "/");
  for (const item of links) {
    const link = document.createElement("a");
    link.className = "link-button";
    link.href = item.url;
    link.textContent = item.text;
    if (!item.path) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else if (item.path === currentPath) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
    panel.appendChild(link);
  }
  navigation.appendChild(panel);

  toggle.addEventListener("click", () => {
    const expanded = navigation.classList.toggle("is-expanded");
    toggle.setAttribute("aria-expanded", String(expanded));
  });
})();
