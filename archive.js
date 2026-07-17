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

const SPOTIFY_SHOW_URL = "https://open.spotify.com/show/2HImUC8mgbFOSEdd7tUyKp";

const transmissions = [
   {
    title: "MACHINES NO LONGER WORK FOR US",
    date: "2026.08.14",
    url1: "https://youtu.be/EamgNNoSNPo",
    url2: SPOTIFY_SHOW_URL
   },
   {
    title: "THE VOYAGER PROBES HAVE RETURNED TO EARTH",
    date: "2026.08.07",
    url1: "https://youtu.be/Zn1k0jR0aPo",
    url2: SPOTIFY_SHOW_URL
   },
   {
    title: "SHADOW PEOPLE ARE APPEARING WORLDWIDE",
    date: "2026.07.31",
    url1: "https://youtu.be/z28Hc2mm38Y",
    url2: SPOTIFY_SHOW_URL
   },
   {
    title: "PEOPLE WHO COME HOME ARE NOT THE SAME",
    date: "2026.07.24",
    url1: "https://youtu.be/_nom61Yonj4",
    url2: SPOTIFY_SHOW_URL
   },
   {
    title: "THERE ARE DOORS WHERE DOORS SHOULD NOT EXIST",
    date: "2026.07.17",
    url1: "https://youtu.be/mYUnUmhfb-w",
    url2: "https://open.spotify.com/episode/2WV4kUp8N7cXmBUVS5Uu48?si=lgsgQU0rT8unoo8-_2L4ag"
   },
   {
    title: "THE MAPS NO LONGER MATCH REALITY",
    date: "2026.07.10",
    url1: "https://youtu.be/HWEtgYQpmE4",
    url2: "https://open.spotify.com/episode/5Y4fYsEVTIaEO1sVp04CSn?si=XOfG-ftCTyCQk284Vtng0A"
   },
   {
    title: "THE HORIZON IS GETTING CLOSER",
    date: "2026.07.03",
    url1: "https://youtu.be/3AO3va7s9-c",
    url2: "https://open.spotify.com/episode/5q3CDwMS3Ojyvog4YFs6nu?si=anQuu7xaSNKFqX_lk5onHA"
   },
   {
    title: "THE MOON LEFT ITS ORBIT",
    date: "2026.06.26",
    url1: "https://youtu.be/-QZbd9fO9q0",
    url2: "https://open.spotify.com/episode/0CNVElB1lBBkllqEpgrPcR?si=7quTA-qXTBu5e0bV5c0b-A"
   },
   {
    title: "THE SKY STARTED FLICKERING OFF",
    date: "2026.06.19",
    url1: "https://youtu.be/qGBbGbpAfHs",
    url2: "https://open.spotify.com/episode/2h05zpbgPpiQ9SQUXS6DQv?si=V37S70vXQJ-6VigANz1TZA"
   },
   {
    title: "EVERY PHONE CALL CONTAINS A THIRD VOICE",
    date: "2026.06.12",
    url1: "https://youtu.be/w25_7KYMtWc",
    url2: "https://open.spotify.com/episode/28L6lFN43xQx4XJRu81MTg?si=VRjgi6McSA2SbNKbZxpDgA"
   },
   {
    title: "THE EARTH'S ROTATION IS SLOWING",
    date: "2026.06.05",
    url1: "https://youtu.be/x7WIocOoerE",
    url2: "https://open.spotify.com/episode/0XQoaKbO8ZnPNMoIdB7Ny3?si=jdiiarq5TEmb3x2CsSN_Tw"
   },
   {
    title: "THE OCEAN IS RECEDING WORLDWIDE",
    date: "2026.05.29",
    url1: "https://youtu.be/3FdLvSiV2iA",
    url2: "https://open.spotify.com/episode/03X7256bRWMuMc032X4KVO?si=By6ZGHIqQ4y4noozNIEauA"
  },
  {
    title: "PEOPLE WHO GO OUTSIDE AFTER MIDNIGHT DON'T COME BACK",
    date: "2026.05.22",
    url1: "https://youtu.be/_4MoUlb8yGo",
    url2: "https://open.spotify.com/episode/0ROJIwqdGTeVp63bxkcSyG?si=uR2B34oMQ6C-_Vtu1I0d6A"
  },
  {
    title: "SIMULTANEOUS GLOBAL BLACKOUT REPORTED",
    date: "2026.05.15",
    url1: "https://youtu.be/pMeKpl1wPQg",
    url2: "https://open.spotify.com/episode/4Y6nffmnS8stSgrMC1Avpq?si=LjKyaEHEQMOokN5yOFt2UA"
  },
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

const now = new Date();

const visibleTransmissions = transmissions.filter(transmission => {

  // Convert "2026.06.12" -> "2026-06-12T12:00:00Z"
  const publishDate =
    new Date(transmission.date.replace(/\./g, '-') + 'T12:00:00Z');

  return now >= publishDate;
});

const archiveList = document.getElementById("archive-list");

visibleTransmissions.forEach((transmission, index) => {

  const transmissionNumber =
    String(visibleTransmissions.length - index).padStart(3, '0');

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
      Transmission Sources:
      <a class="inline-link" title="${transmission.title} Youtube Video Broadcast" href="${transmission.url1}" target="_blank">YouTube</a> |
      <a class="inline-link" title="${transmission.title} Spotify Audio Broadcast" href="${transmission.url2}" target="_blank">Spotify</a> |
      <a class="inline-link" title="The Last Emergency Broadcast on Patreon" href="https://www.patreon.com/TheLastEmergencyBroadcast" target="_blank">Patreon</a>
    </div>
  `;

  archiveList.appendChild(entry);
});
