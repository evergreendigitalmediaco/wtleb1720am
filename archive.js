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
    title: "TIME LOSS EVENTS REPORTED WORLDWIDE",
    date: "2026.05.08",
    url: "https://youtu.be/vnxoFX3kc3U"
  },

  {
    title: "ALL SHADOWS ARE MISALIGNED",
    date: "2026.05.01",
    url: "https://youtu.be/zukdeFP4iU4"
  },

  {
    title: "WEATHER RADAR IS TRACKING SOMETHING THAT ISN'T THERE",
    date: "2026.04.24",
    url: "https://youtu.be/vgfoe_xot3Y"
  },

  {
    title: "EVERY BROADCAST WAS REPLACED BY THE SAME MESSAGE",
    date: "2026.04.17",
    url: "https://youtu.be/icq2m-rKXFM"
  },

  {
    title: "GRAVITY IS FAILING",
    date: "2026.04.10",
    url: "https://youtu.be/IltMmEsiivc"
  },

  {
    title: "RESIDENTS REPORT UNKNOWN INDIVIDUALS",
    date: "2026.04.03",
    url: "https://youtu.be/DEMtxDkHBAA"
  },

  {
    title: "SPECIAL ADVISORY: DO NOT ENTER THE FOG",
    date: "2026.03.27",
    url: "https://youtu.be/Ywq0Cp_vB6M"
  },

  {
    title: "EVERY CHILD IS SEEING THE SAME ENTITY",
    date: "2026.03.20",
    url: "https://youtu.be/JFoEiTqxMmU"
  },

  {
    title: "THE GLOBAL SIGNAL THAT SILENCED HUMANITY",
    date: "2026.03.13",
    url: "https://youtu.be/QAjWLGt_9ww"
  },

  {
    title: "MONSTERS ARE RISING FROM THE OCEANS",
    date: "2026.03.26",
    url: "https://youtu.be/DGmfj8w8YHQ"
  },

  {
    title: "ALIEN FIRST CONTACT FAILED",
    date: "2026.02.27",
    url: "https://youtu.be/tnZOPN2KLck"
  },

  {
    title: "GLOBAL OUTBREAK: THE RAGE VIRUS",
    date: "2026.02.20",
    url: "https://youtu.be/-K_YPzbHTN8"
  },

  {
    title: "THE DAY THE SUN NEVER ROSE",
    date: "2026.02.13",
    url: "https://youtu.be/HRDcjIH4p6o"
  },

  {
    title: "THE NIGHT THE WORLD WENT QUIET",
    date: "2026.02.06",
    url: "https://youtu.be/1fO-n0HddxA"
  }
];

const archiveList = document.getElementById("archive-list");

transmissions.forEach((transmission, index) => {

  const transmissionNumber =
    String(transmissions.length - index).padStart(3, '0');

  const transmissionId = `WTLEB-${transmissionNumber}`;

  const randomStatus =
    statuses[Math.floor(Math.random() * statuses.length)];

  const entry = document.createElement("div");
  entry.className = "archive-entry";

  entry.innerHTML = `
    <div class="transmission-id">
      TRANSMISSION ID: ${transmissionId}
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
