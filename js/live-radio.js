/* WTLEB 1720 AM — listener-aligned ICY radio receiver (v1.3). */
(() => {
  "use strict";

  const root = document.getElementById("live-radio");
  if (!root) return;

  const AUDIO_URL = "https://live.wtleb1720am.com/live.mp3";
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
  let player = null;
  let stopPending = false;
  let receiverGeneration = 0;

  function setPlaybackState(state, label) {
    playbackState = state;
    root.dataset.audioState = state;
    status.textContent = label;
    tuneButton.disabled = state === "connecting" || state === "playing";
    disconnectButton.disabled = state === "standby";
    tuneButton.textContent = (state === "error" || state === "buffering")
      ? "↻ RECONNECT TRANSMISSION" : "▶ TUNE INTO TRANSMISSION";
  }

  function showFeedback(message, isError = false) {
    feedback.textContent = message;
    feedback.dataset.error = String(isError);
    feedback.hidden = !message;
  }

  // Each tune creates a new streaming connection. Disconnect aborts its
  // fetch and discards buffered media before another tune is allowed.
  async function stopAudio() {
    if (stopPending) return;
    manuallyStopped = true;
    receiverGeneration++;
    stopPending = true;
    const previousPlayer = player;
    player = null;

    setPlaybackState("standby", "● STANDBY");
    tuneButton.disabled = true;
    resetMetadata("PROGRAM METADATA / DISCONNECTED");
    showFeedback("RECEIVER DISCONNECTED");

    try {
      if (previousPlayer) await previousPlayer.detachAudioElement();
    } catch (error) {
      console.warn("WTLEB receiver cleanup failed", error);
    } finally {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      stopPending = false;
      tuneButton.disabled = false;
    }
  }

  function tuneAudio() {
    if (stopPending) return;
    if (!manuallyStopped) {
      // The button also acts as RECONNECT after a stall or terminal error.
      if (playbackState === "playing" || playbackState === "connecting") return;
      void stopAudio().then(() => tuneAudio());
      return;
    }
    manuallyStopped = false;
    const generation = ++receiverGeneration;
    resetMetadata("PROGRAM METADATA / AWAITING AUDIO");
    setPlaybackState("connecting", "● CONNECTING");
    showFeedback("ESTABLISHING AUDIO CONNECTION...");

    if (typeof window.IcecastMetadataPlayer !== "function") {
      setPlaybackState("error", "● SIGNAL UNAVAILABLE");
      showFeedback("RADIO PLAYER COULD NOT BE LOADED.", true);
      return;
    }

    try {
      player = new window.IcecastMetadataPlayer(AUDIO_URL, {
        audioElement: audio,
        metadataTypes: ["icy"],
        playbackMethod: "mediasource",
        bufferLength: 1,
        retryTimeout: 30,
        onMetadata: (metadata) => {
          if (!manuallyStopped && generation === receiverGeneration) {
            renderIcyMetadata(metadata);
          }
        },
        onRetry: () => {
          if (!manuallyStopped && generation === receiverGeneration) {
            setPlaybackState("buffering", "● RECONNECTING");
            showFeedback("SIGNAL INTERRUPTED — RECONNECTING...");
          }
        },
        onRetryTimeout: () => {
          if (!manuallyStopped && generation === receiverGeneration) {
            setPlaybackState("error", "● SIGNAL UNAVAILABLE");
            showFeedback("UNABLE TO RESTORE TRANSMISSION. SELECT RECONNECT.", true);
          }
        },
        onError: (message, error) => {
          if (!manuallyStopped && generation === receiverGeneration) {
            console.warn("WTLEB playback issue", message, error);
            showFeedback("AUDIO CONNECTION ISSUE — ATTEMPTING RECOVERY");
          }
        }
      });
      // Start inside the user gesture (important for mobile Safari).
      void player.play().catch(error => {
        if (manuallyStopped || generation !== receiverGeneration) return;
        setPlaybackState("error", "● SIGNAL UNAVAILABLE");
        const blocked = error && error.name === "NotAllowedError";
        showFeedback(blocked
          ? "PLAYBACK BLOCKED. SELECT TUNE TO START THE RECEIVER."
          : "UNABLE TO RECEIVE AUDIO. SELECT RECONNECT OR TRY A VIDEO RELAY.", true);
      });
    } catch (error) {
      if (generation !== receiverGeneration) return;
      setPlaybackState("error", "● SIGNAL UNAVAILABLE");
      showFeedback("UNABLE TO INITIALIZE RADIO RECEIVER.", true);
      console.warn("WTLEB receiver initialization failed", error);
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

  // Current ICY metadata: readable title and event identity in StreamUrl.
  // Future versioned StreamUrl telemetry will be decoded in a later change.
  function eventIdFromStreamUrl(streamUrl) {
    if (typeof streamUrl !== "string") return "";
    try {
      const value = new URL(streamUrl);
      if (value.origin !== "https://wtleb1720am.com") return "";
      const id = decodeURIComponent(value.hash.slice(1));
      return /^[a-zA-Z0-9_-]{1,180}$/.test(id) ? id : "";
    } catch {
      return "";
    }
  }

  function resetMetadata(message) {
    title.textContent = "AWAITING STATION DATA";
    context.hidden = true;
    progress.hidden = true;
    progress.textContent = "";
    condition.textContent = "UNAVAILABLE";
    root.removeAttribute("data-condition");
    root.removeAttribute("data-event-id");
    bars.forEach(bar => { bar.style.opacity = "0.16"; });
    barGroup.setAttribute("aria-label", "Signal indicator unavailable");
    metadataStatus.textContent = message;
  }

  function renderIcyMetadata(metadata) {
    if (!metadata || typeof metadata !== "object") return;
    const display = typeof metadata.StreamTitle === "string"
      ? metadata.StreamTitle.trim().slice(0, 180) : "";
    if (!display) return;

    title.textContent = display;
    const eventId = eventIdFromStreamUrl(metadata.StreamUrl);
    if (eventId) root.dataset.eventId = eventId;
    else root.removeAttribute("data-event-id");

    // RF telemetry and a reliable story clock are not in the v1.2 ICY payload.
    // Station-side live.json could be ahead of listener playback, so don't poll.
    context.hidden = true;
    progress.hidden = true;
    metadataStatus.textContent = player && player.playbackMethod === "html5"
      ? "PROGRAM METADATA / FALLBACK TIMING"
      : "PROGRAM METADATA / ICY RECEIVING";
  }

  setPlaybackState("standby", "● STANDBY");
  resetMetadata("PROGRAM METADATA / AWAITING AUDIO");
  showFeedback("SELECT TUNE TO LISTEN TO THE LIVE TRANSMISSION");

  window.addEventListener("pagehide", () => {
    manuallyStopped = true;
    receiverGeneration++;
    if (player) void player.stop();
  });

  if (isPopup && new URLSearchParams(window.location.search).get("autotune") === "1") {
    // Best effort only; browsers may require a fresh tap in the new window.
    tuneAudio();
  }
})();
