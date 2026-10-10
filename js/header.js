(() => {
  "use strict";
  const header = document.getElementById("station-header");
  if (!header) return;

  const brand = document.createElement("a");
  brand.className = "station-brand";
  brand.href = "/";
  brand.setAttribute("aria-label", "WTLEB 1720 AM — Station Home");

  const image = document.createElement("img");
  image.src = "/images/wtleb1720am-logo.png";
  image.alt = "WTLEB 1720 AM - The Last Emergency Broadcast";
  image.width = 2080;
  image.height = 326;
  image.loading = "eager";
  image.decoding = "async";
  brand.appendChild(image);

  const meta = document.createElement("div");
  meta.className = "station-header-meta";
  const system = document.createElement("span");
  system.className = "station-system-label";
  system.textContent = "STATION CONTROL // AM 1720";

  const onAir = document.createElement("span");
  onAir.className = "station-on-air";
  const indicator = document.createElement("span");
  indicator.className = "station-indicator";
  indicator.setAttribute("aria-hidden", "true");
  onAir.appendChild(indicator);
  onAir.appendChild(document.createTextNode("TRANSMISSION ACTIVE"));

  meta.appendChild(system);
  meta.appendChild(onAir);
  header.appendChild(brand);
  header.appendChild(meta);
})();
