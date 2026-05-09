const statuses = [
  "ACTIVE EVENT RECORD",
  "SIGNAL INSTABILITY DETECTED",
  "PARTIAL RECORD RECOVERED",
  "CONTAINMENT FAILURE",
  "SOURCE VERIFICATION PENDING",
  "DATA INTEGRITY UNCONFIRMED",
  "BROADCAST ANOMALY DETECTED",
  "TIMELINE CONSISTENCY FAILURE",
  "RELAY INTERRUPTION LOGGED",
  "ARCHIVAL RECOVERY INCOMPLETE"
];

const transmissions = [
  {
    id: "WTLEB-042",
    title: "THE OCEAN IS RECEDING WORLDWIDE",
    date: "2026.05.02",
    url: "https://youtube.com/"
  },

  {
    id: "WTLEB-041",
    title: "UNIDENTIFIED SIGNAL DETECTED",
    date: "2026.04.25",
    url: "https://youtube.com/"
  },

  {
    id: "WTLEB-040",
    title: "THE SUN NEVER ROSE",
    date: "2026.04.18",
    url: "https://youtube.com/"
  }
];

const archiveList = document.getElementById("archive-list");

transmissions.forEach((transmission) => {

  const randomStatus =
    statuses[Math.floor(Math.random() * statuses.length)];

  const entry = document.createElement("div");
  entry.className = "archive-entry";

  entry.innerHTML = `
    <div class="transmission-id">
      TRANSMISSION ID: ${transmission.id}
    </div>

    <div class="transmission-status">
      STATUS: ${randomStatus}
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
