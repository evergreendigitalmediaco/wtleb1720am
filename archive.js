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
    url1: "https://youtu.be/vnxoFX3kc3U",
    url2: "https://open.spotify.com/episode/244SCoM6fXRY93poMNENAS?si=S0V1Q66XR9Scpa2ynSs2Dg"
  },

  {
    title: "ALL SHADOWS ARE MISALIGNED",
    date: "2026.05.01",
    url1: "https://youtu.be/zukdeFP4iU4",
    url2: "https://open.spotify.com/episode/0lGeKxzTGvis5ah1NjHy00?si=BZPPlztoTQqCoHessXYdzQ"
  },

  {
    title: "WEATHER RADAR IS TRACKING SOMETHING THAT ISN'T THERE",
    date: "2026.04.24",
    url1: "https://youtu.be/vgfoe_xot3Y",
    url2: "https://open.spotify.com/episode/2mX7o9mzmrTBM4RtiDET0d?si=vI7u7uG2T7eJY8_aXTecNw"
  },

  {
    title: "EVERY BROADCAST WAS REPLACED BY THE SAME MESSAGE",
    date: "2026.04.17",
    url1: "https://youtu.be/icq2m-rKXFM",
    url2: "https://open.spotify.com/episode/18Y8N2RfguC5hdWgVakNIE?si=L9u4F-KZTxyHSLRlPTVqJQ"
  },

  {
    title: "GRAVITY IS FAILING",
    date: "2026.04.10",
    url1: "https://youtu.be/IltMmEsiivc",
    url2: "https://open.spotify.com/episode/6rplhdEfRRXA87daVJRCKN?si=ykn1d1kUSNGupA53mUZuFg"
  },

  {
    title: "RESIDENTS REPORT UNKNOWN INDIVIDUALS",
    date: "2026.04.03",
    url1: "https://youtu.be/DEMtxDkHBAA",
    url2: "https://open.spotify.com/episode/3f8amjlQ5nM1Acp7nAt44G?si=iIrI35xSQLi6kuVIW2eKtQ"
  },

  {
    title: "SPECIAL ADVISORY: DO NOT ENTER THE FOG",
    date: "2026.03.27",
    url1: "https://youtu.be/Ywq0Cp_vB6M",
    url2: "https://open.spotify.com/episode/5YsXQ3YunI1W6cRnjdpVPg?si=DMIZERmfSaWEU6WhtARRWw"
  },

  {
    title: "EVERY CHILD IS SEEING THE SAME ENTITY",
    date: "2026.03.20",
    url1: "https://youtu.be/JFoEiTqxMmU",
    url2: "https://open.spotify.com/episode/1Rk1EYl4zKtXLJvuAx7hPH?si=H0U4LcvuSmGwegiNvPcoCQ"
  },

  {
    title: "THE SKY IS BROADCASTING A SOUND",
    date: "2026.03.13",
    url1: "https://youtu.be/QAjWLGt_9ww",
    url2: "https://open.spotify.com/episode/5KGPdMXcNjaeCWPpGTQG3h?si=S4HyWEx_Qo6p4dD-3b_FKw"
  },

  {
    title: "MONSTERS ARE RISING FROM THE OCEANS",
    date: "2026.03.26",
    url1: "https://youtu.be/DGmfj8w8YHQ",
    url2: "https://open.spotify.com/episode/1CdS9qZEzPvVywU8OQi8GI?si=S-NpgxS_Q2eVT-N9f38csg"
  },

  {
    title: "ALIEN FIRST CONTACT FAILED",
    date: "2026.02.27",
    url1: "https://youtu.be/tnZOPN2KLck",
    url2: "https://open.spotify.com/episode/6oX5XVSeBgI1n7napbQejW?si=p6SDgS_oRPS9zF2g0mmO4g"
  },

  {
    title: "GLOBAL OUTBREAK: THE RAGE VIRUS",
    date: "2026.02.20",
    url1: "https://youtu.be/-K_YPzbHTN8",
    url2: "https://open.spotify.com/episode/3gt1VRuR0x7LgpinGHYHQf?si=ZZ6J8GPnQRa_w3defuzJCA"
  },

  {
    title: "THE DAY THE SUN NEVER ROSE",
    date: "2026.02.13",
    url1: "https://youtu.be/HRDcjIH4p6o",
    url2: "https://open.spotify.com/episode/0mwRonEaZTURzV52kC7SaC?si=_6M_CZuNQRadJy7zywEBUQ"
  },

  {
    title: "THE NIGHT THE WORLD WENT QUIET",
    date: "2026.02.06",
    url1: "https://youtu.be/1fO-n0HddxA",
    url2: "https://open.spotify.com/episode/7ekQoGkBmKAe9YwlLusI4Y?si=JN-QvdHjSBSVU9_e75Pk0A"
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
       href="${transmission.url1}"
       target="_blank">
      ${transmission.title}
    </a>

    <div class="transmission-date">
      LOGGED: ${transmission.date}
      <br /><br />
      Transmission Source:
      <a class="inline-link" title="${transmission.title} Video Broadcast" href="${transmission.url1}" target="_blank">YouTube</a> |
      <a class="inline-link" title="${transmission.title} Audio Broadcast" href="${transmission.url2}" target="_blank">Spotify</a> |
      <a class="inline-link" title="The Last Emergency Broadcast on Patreon" href="https://www.patreon.com/cw/TheLastEmergencyBroadcast" target="_blank">Patreon</a>
    </div>
  `;

  archiveList.appendChild(entry);
});
