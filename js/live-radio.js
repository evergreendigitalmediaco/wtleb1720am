/* WTLEB 1720 AM — lightweight live audio and station metadata receiver. */
(() => {
  "use strict";

  const root = document.getElementById("live-radio");
  if (!root) return;

  const AUDIO_URL = "https://live.wtleb1720am.com/live.mp3";
  const METADATA_URL = "https://live.wtleb1720am.com/live.json";
  const POLL_MS = 5000;
  const FRESHNESS_MS = 30000;
  const audio = document.getElementById("radio-audio");
  const tuneButton = document.getElementById("radio-tune");
  const disconnectButton = document.getElementById("radio-disconnect");
  const volume = document.getElementById("radio-volume");
  const muteButton = document.getElementById("radio-mute");
  const status = document.getElementById("radio-playback-status");
  const feedback = document.getElementById("radio-feedback");
  const title = document.getElementById("radio-current-title");
  const context = document.getElementById("radio-program-context");
  const progress = document.getElementById("radio-story-progress");
  const condition = document.getElementById("radio-condition");
  const bars = [...root.querySelectorAll(".radio-bar")];
  const barGroup = document.getElementById("radio-bars");
  const metadataStatus = document.getElementById("radio-metadata-status");
  const popout = document.getElementById("radio-popout");

  if (!audio || !tuneButton || !disconnectButton || !volume || !muteButton || !status ||
      !feedback || !title || !context || !progress || !condition ||
      bars.length !== 4 || !barGroup || !metadataStatus) return;

  const isPopup = root.dataset.receiver === "popup";
  let manuallyStopped = true;
  let playbackState = "standby";
  let popupWindow = null;
  let metadataPending = false;
  let lastGoodMetadata = 0;
  let storyClock = null; // Latest confirmed position plus a local monotonic clock.

  function setPlaybackState(state, label) {
    playbackState = state;
    root.dataset.audioState = state;
    status.textContent = label;
    tuneButton.disabled = state === "connecting" || state === "playing";
    disconnectButton.disabled = state === "standby";
    tuneButton.textContent = (state === "error" || state === "buffering")
      ? "↻ RECONNECT TRANSMISSION" : "▶ TUNE INTO TRANSMISSION";
    synchronizeStoryClockPlayback();
  }

  function showFeedback(message, isError = false) {
    feedback.textContent = message;
    feedback.dataset.error = String(isError);
    feedback.hidden = !message;
  }

  function stopAudio() {
    manuallyStopped = true;
    audio.pause();
    audio.removeAttribute("src");
    audio.load(); // Release the streaming HTTP connection.
    setPlaybackState("standby", "● STANDBY");
    showFeedback("RECEIVER DISCONNECTED");
  }

  async function tuneAudio() {
    manuallyStopped = false;
    setPlaybackState("connecting", "● CONNECTING");
    showFeedback("ESTABLISHING AUDIO CONNECTION...");
    try {
      // Always rejoin the live edge, rather than resuming an old paused buffer.
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.src = AUDIO_URL;
      await audio.play();
    } catch (error) {
      if (manuallyStopped) return;
      setPlaybackState("error", "● SIGNAL UNAVAILABLE");
      if (error && error.name === "NotAllowedError") {
        showFeedback("AUTOMATIC PLAYBACK BLOCKED. SELECT TUNE TO START THE RECEIVER.", true);
      } else {
        showFeedback("UNABLE TO RECEIVE AUDIO. SELECT RECONNECT OR TRY A VIDEO RELAY.", true);
      }
    }
  }

  const muteLabel = muteButton.querySelector(".radio-mute-label");
  let previousVolume = Number(volume.value) > 0 ? Number(volume.value) : 75;

  function updateVolumeControls() {
    const muted = audio.muted || Number(volume.value) === 0;
    const action = muted ? "Restore previous volume" : "Mute audio";
    muteButton.setAttribute("aria-pressed", String(muted));
    muteButton.setAttribute("aria-label", action);
    muteButton.title = action;
    if (muteLabel) muteLabel.textContent = muted ? "UNMUTE" : "MUTE";
    volume.style.setProperty("--radio-volume-percent", volume.value + "%");
  }

  function setMuted(muted) {
    if (muted) {
      const currentVolume = Number(volume.value);
      if (currentVolume > 0) previousVolume = currentVolume;
      volume.value = "0";
      audio.volume = 0;
      audio.muted = true;
    } else {
      const restoredVolume = Math.max(1, Math.min(100, previousVolume));
      volume.value = String(restoredVolume);
      audio.volume = restoredVolume / 100;
      audio.muted = false;
    }
    updateVolumeControls();
  }

  audio.volume = Number(volume.value) / 100;
  volume.addEventListener("input", () => {
    const nextVolume = Number(volume.value);
    if (nextVolume > 0) previousVolume = nextVolume;
    audio.volume = nextVolume / 100;
    // Moving the slider off zero restores sound, just like a desktop mixer.
    audio.muted = nextVolume === 0;
    updateVolumeControls();
  });
  muteButton.addEventListener("click", () => {
    setMuted(!(audio.muted || Number(volume.value) === 0));
  });
  updateVolumeControls();

  tuneButton.addEventListener("click", () => { void tuneAudio(); });
  disconnectButton.addEventListener("click", stopAudio);

  audio.addEventListener("playing", () => {
    if (manuallyStopped) return;
    setPlaybackState("playing", "● RECEIVING AUDIO");
    showFeedback("CONNECTED TO THE CONTINUOUS AUDIO TRANSMISSION");
    if (isPopup && window.opener && !window.opener.closed) {
      // Avoid two audible receivers when the listener transfers to the pop-out.
      window.opener.postMessage({ type: "wtleb-radio-popup-playing" }, window.location.origin);
    }
  });
  audio.addEventListener("waiting", () => {
    if (!manuallyStopped) {
      setPlaybackState("buffering", "● BUFFERING");
      showFeedback("RECEIVER BUFFERING — RECONNECT IF AUDIO DOES NOT RETURN");
    }
  });
  audio.addEventListener("stalled", () => {
    if (!manuallyStopped) {
      setPlaybackState("buffering", "● BUFFERING");
      showFeedback("AUDIO DELIVERY DELAYED — RECONNECT IF NECESSARY");
    }
  });
  audio.addEventListener("error", () => {
    if (!manuallyStopped) {
      setPlaybackState("error", "● SIGNAL UNAVAILABLE");
      showFeedback("AUDIO CONNECTION LOST. SELECT RECONNECT TO REJOIN THE LIVE STREAM.", true);
    }
  });
  audio.addEventListener("ended", () => {
    if (!manuallyStopped) {
      setPlaybackState("error", "● TRANSMISSION ENDED");
      showFeedback("THE AUDIO STREAM ENDED. SELECT RECONNECT TO TRY AGAIN.", true);
    }
  });

  if (popout) {
    popout.addEventListener("click", () => {
      if (popupWindow && !popupWindow.closed) {
        popupWindow.focus();
        return;
      }
      const autoTune = playbackState === "playing" || playbackState === "buffering";
      const path = autoTune ? "/radio.html?autotune=1" : "/radio.html";
      popupWindow = window.open(
        path, "wtleb1720_radio",
        "popup=yes,width=530,height=570,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes"
      );
      if (!popupWindow) {
        showFeedback("POP-OUT BLOCKED. ALLOW POP-UPS FOR WTLEB1720AM.COM.", true);
        return;
      }
      popupWindow.focus();
      // Keep main-page audio running until the new receiver actually starts.
    });

    window.addEventListener("message", event => {
      if (event.origin !== window.location.origin ||
          !popupWindow || event.source !== popupWindow ||
          !event.data || event.data.type !== "wtleb-radio-popup-playing") return;
      if (!manuallyStopped) stopAudio();
      showFeedback("AUDIO TRANSFERRED TO POP-OUT RECEIVER");
    });
  }

  // Browser window managers may ignore resize requests (especially when
  // configured to open pop-ups as tabs). For script-opened windows, fit the
  // actual compact receiver plus browser chrome instead of forcing screen height.
  if (isPopup) {
    const shell = document.querySelector(".radio-popup-shell");
    if (shell && window.opener) {
      let pendingFit = false;
      const fitWindow = () => {
        if (pendingFit) return;
        pendingFit = true;
        window.requestAnimationFrame(() => {
          pendingFit = false;
          const contentHeight = Math.ceil(shell.getBoundingClientRect().bottom + 10);
          const chromeHeight = Math.max(0, window.outerHeight - window.innerHeight);
          const target = Math.min(screen.availHeight, Math.max(350, contentHeight + chromeHeight));
          if (Math.abs(window.outerHeight - target) > 12) {
            window.resizeTo(window.outerWidth, target);
          }
        });
      };
      window.addEventListener("load", fitWindow);
      if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(fitWindow);
        observer.observe(shell);
      }
    }
  }

  function clock(seconds) {
    let value = Math.max(0, Math.floor(seconds));
    const s = String(value % 60).padStart(2, "0");
    value = Math.floor(value / 60);
    const m = String(value % 60).padStart(2, "0");
    const h = Math.floor(value / 60);
    return h ? h + ":" + m + ":" + s : m + ":" + s;
  }

  function setUnknownMetadata(message) {
    storyClock = null;
    title.textContent = "STATION DATA UNAVAILABLE";
    context.hidden = true;
    progress.hidden = true;
    condition.textContent = "UNAVAILABLE";
    root.removeAttribute("data-condition");
    bars.forEach(bar => { bar.style.opacity = "0.16"; });
    barGroup.setAttribute("aria-label", "Signal indicator unavailable");
    metadataStatus.textContent = message;
  }

  function freezeStoryClock() {
    if (!storyClock || !storyClock.advancing) return;
    const elapsed = Math.max(0, (performance.now() - storyClock.receivedAt) / 1000);
    storyClock.position = Math.min(storyClock.duration, storyClock.position + elapsed);
    storyClock.receivedAt = performance.now();
    storyClock.advancing = false;
    updateStoryClock();
  }

  function synchronizeStoryClockPlayback() {
    if (!storyClock) return;
    const shouldAdvance = !manuallyStopped && playbackState === "playing" &&
      !audio.paused && storyClock.category === "story" &&
      lastGoodMetadata && Date.now() - lastGoodMetadata <= FRESHNESS_MS;
    if (shouldAdvance && !storyClock.advancing) {
      storyClock.receivedAt = performance.now();
      storyClock.advancing = true;
    } else if (!shouldAdvance && storyClock.advancing) {
      freezeStoryClock();
    }
  }

  function updateStoryClock() {
    if (!storyClock) return;
    synchronizeStoryClockPlayback();
    // Stop extrapolating if the receiver loses contact with the metadata feed.
    if (lastGoodMetadata && Date.now() - lastGoodMetadata > FRESHNESS_MS &&
        storyClock.advancing) {
      freezeStoryClock();
    }
    const elapsed = storyClock.advancing
      ? Math.max(0, (performance.now() - storyClock.receivedAt) / 1000)
      : 0;
    const position = Math.min(storyClock.duration, storyClock.position + elapsed);
    storyClock.displayPosition = position;
    progress.textContent = "STORY POSITION: " + clock(position) +
      " / " + clock(storyClock.duration);
  }

  function renderMetadata(data) {
    const playout = data.playout;
    const environment = data.environment;
    const displayed = typeof playout.display_text === "string"
      ? playout.display_text.trim().slice(0, 180) : "";
    title.textContent = displayed || "WTLEB 1720 AM";

    const story = typeof playout.story_title === "string"
      ? playout.story_title.trim().slice(0, 180) : "";
    context.hidden = !story || playout.category === "story";
    if (!context.hidden) context.textContent = "PROGRAM: " + story;

    const position = playout.story_position_seconds;
    const duration = playout.story_duration_seconds;
    const hasProgress = typeof position === "number" && Number.isFinite(position) &&
      position >= 0 && typeof duration === "number" && Number.isFinite(duration) && duration > 0;
    progress.hidden = !hasProgress;
    if (hasProgress) {
      const eventId = typeof playout.event_id === "string" && playout.event_id
        ? playout.event_id : playout.category + ":" + displayed;
      const sameEvent = storyClock && storyClock.eventId === eventId;
      const isPlaying = !manuallyStopped && playbackState === "playing" && !audio.paused;

      // When disconnected or buffering, preserve the last displayed position
      // rather than jumping forward each time a new JSON snapshot arrives.
      if (!sameEvent || isPlaying) {
        let basePosition = Math.min(position, duration);
        if (sameEvent && storyClock.advancing && playout.category === "story") {
          const localPosition = Math.min(storyClock.duration, storyClock.position +
            Math.max(0, (performance.now() - storyClock.receivedAt) / 1000));
          // Ignore tiny transport jitter that would otherwise make the counter
          // skip or repeat a second; correct meaningful drift immediately.
          if (Math.abs(basePosition - localPosition) < 2) basePosition = localPosition;
        }
        storyClock = {
          eventId,
          category: playout.category,
          position: basePosition,
          duration,
          receivedAt: performance.now(),
          advancing: isPlaying && playout.category === "story"
        };
      } else {
        freezeStoryClock();
      }
      updateStoryClock();
    } else {
      storyClock = null;
    }

    const allowed = ["NORMAL", "ELEVATED", "DEGRADED", "CRITICAL"];
    const state = allowed.includes(environment.condition) ? environment.condition : "";
    condition.textContent = state || "UNAVAILABLE";
    if (state) root.dataset.condition = state;
    else root.removeAttribute("data-condition");

    const levels = environment.signal_bar_levels;
    const validLevels = Array.isArray(levels) && levels.length === 4 &&
      levels.every(level => typeof level === "number" &&
        Number.isFinite(level) && level >= 0 && level <= 1);
    if (validLevels) {
      bars.forEach((bar, i) => { bar.style.opacity = String(0.16 + levels[i] * 0.84); });
      const count = Math.max(0, Math.min(4, Math.round(levels.reduce((a, b) => a + b, 0))));
      barGroup.setAttribute("aria-label", "Broadcast signal: " + count + " of 4 bars");
    } else {
      bars.forEach(bar => { bar.style.opacity = "0.16"; });
      barGroup.setAttribute("aria-label", "Signal indicator unavailable");
    }
    metadataStatus.textContent = "STATION TELEMETRY / RECEIVING";
  }

  async function refreshMetadata() {
    if (metadataPending) return;
    // Idle background tabs need not poll; active receivers keep their updates.
    if (document.hidden && manuallyStopped) return;
    metadataPending = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4500);
    try {
      const response = await fetch(METADATA_URL, {
        mode: "cors", cache: "no-store", signal: controller.signal
      });
      if (!response.ok) throw new Error("Metadata HTTP " + response.status);
      const data = await response.json();
      if (!data || data.schema_version !== 2 || !data.playout ||
          typeof data.playout !== "object" || !data.environment ||
          typeof data.environment !== "object" || !data.updated_at) {
        throw new Error("Unsupported metadata schema");
      }
      const updated = Date.parse(data.updated_at);
      if (!Number.isFinite(updated) || updated > Date.now() + 60000 ||
          Date.now() - updated > FRESHNESS_MS) {
        setUnknownMetadata("STATION TELEMETRY / STALE");
        lastGoodMetadata = 0;
        return;
      }
      renderMetadata(data);
      lastGoodMetadata = Date.now();
    } catch (error) {
      if (!lastGoodMetadata || Date.now() - lastGoodMetadata > FRESHNESS_MS) {
        setUnknownMetadata("STATION TELEMETRY / UNAVAILABLE");
        lastGoodMetadata = 0;
      } else {
        metadataStatus.textContent = "STATION TELEMETRY / RETRYING";
      }
    } finally {
      window.clearTimeout(timeout);
      metadataPending = false;
    }
  }

  setPlaybackState("standby", "● STANDBY");
  setUnknownMetadata("STATION TELEMETRY / CONNECTING");
  showFeedback("SELECT TUNE TO LISTEN TO THE LIVE TRANSMISSION");
  void refreshMetadata();
  window.setInterval(() => { void refreshMetadata(); }, POLL_MS);
  window.setInterval(updateStoryClock, 1000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) void refreshMetadata();
  });

  if (isPopup && new URLSearchParams(window.location.search).get("autotune") === "1") {
    // Best effort only; browsers may require a fresh tap in the new window.
    void tuneAudio();
  }
})();
