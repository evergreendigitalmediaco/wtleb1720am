const transmissions = [
  {
    id: "WTLEB-042",
    status: "ACTIVE EVENT RECORD",
    title: "THE OCEAN IS RECEDING WORLDWIDE",
    date: "2026.05.02",
    url: "https://youtube.com/"
  },

  {
    id: "WTLEB-041",
    status: "SIGNAL INSTABILITY DETECTED",
    title: "UNIDENTIFIED SIGNAL DETECTED",
    date: "2026.04.25",
    url: "https://youtube.com/"
  },

  {
    id: "WTLEB-040",
    status: "PARTIAL RECORD RECOVERED",
    title: "THE SUN NEVER ROSE",
    date: "2026.04.18",
    url: "https://youtube.com/"
  },

  {
    id: "WTLEB-039",
    status: "CONTAINMENT FAILURE",
    title: "WEATHER RADAR IS TRACKING SOMETHING THAT ISN'T THERE",
    date: "2026.04.11",
    url: "https://youtube.com/"
  }
];

const archiveList = document.getElementById("archive-list");

transmissions.forEach((transmission) => {
  const entry = document.createElement("div");
  entry.className = "archive-entry";

  entry.innerHTML = `
    <div class="transmission-id">
      TRANSMISSION ID: ${transmission.id}
    </div>

    <div class="transmission-status">
      STATUS: ${transmission.status}
    </div>

    <a class="transmission-link"
       href="${transmission.url}"
       target="_blank">
      ${transmission.title}
    </a>

    <div class="transmission-date">
      LOGGED: ${transmission.date}
    </div>
  `;

  archiveList.appendChild(entry);
});
