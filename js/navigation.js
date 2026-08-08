(() => {
  const navigation = document.getElementById("station-navigation");

  if (!navigation) {
    return;
  }

  navigation.innerHTML = `
    <div class="panel-title">CONTROL INTERFACE</div>
    <div class="panel-subtitle">STATION SERVICES AVAILABLE</div>

    <a class="link-button" href="/">
      STATION HOME
    </a>

    <a class="link-button" href="/archive.html">
      ARCHIVED TRANSMISSIONS
    </a>

    <a class="link-button" href="https://www.patreon.com/TheLastEmergencyBroadcast" target="_blank" rel="noopener noreferrer">
      SECURE CHANNEL
    </a>

    <a class="link-button" href="https://shop.wtleb1720am.com" target="_blank" rel="noopener noreferrer">
      SUPPLY ACCESS
    </a>

    <a class="link-button" href="/report.html">
      SUBMIT REPORT
    </a>
  `;
})();
