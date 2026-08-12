(() => {
  const navigation = document.getElementById("station-navigation");

  if (!navigation) {
    return;
  }

  navigation.innerHTML = `
    <div class="panel-title">CONTROL INTERFACE</div>
    <div class="panel-subtitle">STATION SERVICES AVAILABLE</div>

    <a class="link-button" href="/" data-station-path="/">
      STATION HOME
    </a>

    <a class="link-button" href="/relay.html" data-station-path="/relay.html">
      RELAY NETWORKS
    </a>

    <a class="link-button" href="/archive.html" data-station-path="/archive.html">
      ARCHIVED TRANSMISSIONS
    </a>

    <a class="link-button" href="https://www.patreon.com/TheLastEmergencyBroadcast" target="_blank" rel="noopener noreferrer">
      SECURE CHANNEL
    </a>

    <a class="link-button" href="https://shop.wtleb1720am.com" target="_blank" rel="noopener noreferrer">
      SUPPLY ACCESS
    </a>

    <a class="link-button" href="/report.html" data-station-path="/report.html">
      SUBMIT REPORT
    </a>
  `;

  const currentPath = window.location.pathname.replace(/\/index\.html$/, "/");
  const activeControl = navigation.querySelector(`[data-station-path="${currentPath}"]`);

  if (activeControl) {
    activeControl.classList.add("active");
    activeControl.setAttribute("aria-current", "page");
  }
})();
