/* WTLEB 1720 AM — ICY-only listener telemetry and receiver (v1.8 compact receiver controls). */
(() => {
  "use strict";

  const root = document.getElementById("live-radio");
  if (!root) return;

  const AUDIO_URL = "https://live.wtleb1720am.com/live.mp3";
  const audio = document.getElementById("radio-audio");
  const meterHost = document.getElementById("radio-audio-meter");
  const meterDB = document.getElementById("radio-audio-db");
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
  let icyProgress = null;
  let lastIcyAt = 0;
  let lastStoryTitle = "";
  let meterContext = null;
  let meterSource = null;
  let meterTap = null;
  let meterInstance = null;
  let meterTimer = null;
  let meterUnavailable = false;

  function startAudioMeter() {
    if (meterUnavailable || !meterHost || !meterDB) return;
    const Context = window.AudioContext || window.webkitAudioContext;
    const Meter = window.webAudioPeakMeter && window.webAudioPeakMeter.WebAudioPeakMeter;
    if (!Context || !Meter) {
      meterUnavailable = true;
      meterDB.textContent = "UNAVAILABLE";
      return;
    }
    try {
      if (!meterContext) meterContext = new Context();
      // Fail open: do not attach the audio element unless AudioWorklet works.
      if (!meterContext.audioWorklet) {
        meterUnavailable = true;
        meterDB.textContent = "UNAVAILABLE";
        return;
      }
      if (!meterSource) {
        meterSource = meterContext.createMediaElementSource(audio);
        // PRIMARY AUDIO PATH: direct to speakers, entirely independent from
        // peak-meter loading, audioWorklet callbacks and visualization updates.
        meterSource.connect(meterContext.destination);
        // Feed the analyzer a full-level tap. The locally patched meter library
        // silences ONLY its worklet output; direct speaker audio is separate.
        meterTap = meterContext.createGain();
        meterTap.gain.value = 1;
        meterSource.connect(meterTap);
        try {
          meterInstance = new Meter(meterTap, meterHost, {
            vertical: false,
            borderSize: 0,
            fontSize: 9,
            dbRangeMin: -48,
            dbRangeMax: 0,
            dbTickSize: 12,
            peakHoldDuration: 1200,
            backgroundColor: "#14120f",
            tickColor: "#9f8b6c",
            labelColor: "#d9a560",
            gradient: ["#ce7041 2%", "#e4a24b 18%", "#b9863c 50%", "#846335 100%"],
            maskTransition: "0.12s"
          });
        } catch (error) {
          // Direct playback stays connected even if the visualizer fails.
          meterTap.disconnect();
          throw error;
        }
      }
      void meterContext.resume().catch(() => {
        meterDB.textContent = "UNAVAILABLE";
      });
      if (!meterTimer) meterTimer = window.setInterval(() => {
        if (manuallyStopped || playbackState !== "playing" || !meterInstance) {
          meterDB.textContent = "— dBFS";
          return;
        }
        const readings = meterInstance.getPeaks().currentDB;
        const level = Math.max(...readings);
        meterDB.textContent = Number.isFinite(level)
          ? level.toFixed(1) + " dBFS" : "−∞ dBFS";
      }, 200);
    } catch (error) {
      meterUnavailable = true;
      meterDB.textContent = "UNAVAILABLE";
      console.warn("WTLEB optional audio meter unavailable", error);
    }
  }


  function setPlaybackState(state, label) {
    if (state !== "playing") freezeIcyProgress();
    playbackState = state;
    if (state === "playing" && icyProgress && icyProgress.category === "s") {
      icyProgress.at = performance.now();
      icyProgress.advancing = true;
    }
    root.dataset.audioState = state;
    status.textContent = label;
    tuneButton.disabled = state === "connecting" || state === "playing";
    disconnectButton.disabled = state === "standby";
    const tuneLabel = tuneButton.querySelector(".radio-tune-label");
    if (tuneLabel) tuneLabel.textContent = (state === "error" || state === "buffering") ? "RECONNECT" : "TUNE IN";
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
    if (meterDB) meterDB.textContent = "— dBFS";
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
    startAudioMeter();
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
  let previousVolume = Number(volume.value) > 0 ? Number(volume.value) : 50;

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

  // Versioned fragment carried in the MP3 ICY StreamUrl. No live.json calls.
  // <event-id>!v1!<category>!<position-ds>!<duration-ds>!<rf>!<4hex>
  function decodeIcyTelemetry(streamUrl) {
    if (typeof streamUrl !== "string" || streamUrl.length > 256) return null;
    try {
      const url = new URL(streamUrl);
      if (url.origin !== "https://wtleb1720am.com" ||
          url.pathname !== "/" || url.search) return null;
      const parts = decodeURIComponent(url.hash.slice(1)).split("!");
      if (parts.length !== 7 || parts[1] !== "v1" ||
          !/^WTLEB-[a-f0-9]{32}-[1-9][0-9]*$/.test(parts[0]) ||
          !/^[scibau]$/.test(parts[2]) ||
          !/^[NEDC-]$/.test(parts[5]) ||
          !/^(?:[0-9a-f]{4}|----)$/.test(parts[6])) return null;
      const readSeconds = value => {
        if (value === "-") return null;
        if (!/^[0-9]{1,8}$/.test(value)) return NaN;
        return Number(value) / 10;
      };
      const position = readSeconds(parts[3]);
      const duration = readSeconds(parts[4]);
      if (Number.isNaN(position) || Number.isNaN(duration) ||
          (position !== null && duration !== null && position > duration)) {
        return null;
      }
      return {
        eventId: parts[0], category: parts[2], position, duration,
        condition: parts[5],
        levels: parts[6] === "----" ? null :
          [...parts[6]].map(char => parseInt(char, 16) / 15)
      };
    } catch {
      return null;
    }
  }

  function clock(seconds) {
    let value = Math.max(0, Math.floor(seconds));
    const ss = String(value % 60).padStart(2, "0");
    value = Math.floor(value / 60);
    const mm = String(value % 60).padStart(2, "0");
    const hh = Math.floor(value / 60);
    return hh ? hh + ":" + mm + ":" + ss : mm + ":" + ss;
  }

  function freezeIcyProgress() {
    if (!icyProgress || !icyProgress.advancing) return;
    icyProgress.position = Math.min(icyProgress.duration, icyProgress.position +
      Math.max(0, (performance.now() - icyProgress.at) / 1000));
    icyProgress.at = performance.now();
    icyProgress.advancing = false;
  }

  function updateIcyClock() {
    if (manuallyStopped || !icyProgress ||
        (playbackState !== "playing" && playbackState !== "buffering")) {
      progress.hidden = true;
      return;
    }
    // Fail closed on stalled/absent metadata rather than displaying an
    // indefinitely extrapolated station time.
    if (performance.now() - lastIcyAt > 20000) freezeIcyProgress();
    const seconds = Math.min(icyProgress.duration, icyProgress.position +
      (icyProgress.advancing
        ? Math.max(0, (performance.now() - icyProgress.at) / 1000) : 0));
    progress.textContent = "STORY POSITION: " + clock(seconds) +
      " / " + clock(icyProgress.duration);
    progress.hidden = false;
  }

  window.setInterval(updateIcyClock, 1000);

  // ICY is the only receiver metadata source; StreamTitle is readable.
  function eventIdFromStreamUrl(streamUrl) {
    if (typeof streamUrl !== "string") return "";
    try {
      const value = new URL(streamUrl);
      if (value.origin !== "https://wtleb1720am.com") return "";
      const id = decodeURIComponent(value.hash.slice(1)).split("!")[0];
      return /^WTLEB-[a-f0-9]{32}-[1-9][0-9]*$/.test(id) ? id : "";
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
    icyProgress = null;
    lastIcyAt = 0;
    lastStoryTitle = "";
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

    const decoded = decodeIcyTelemetry(metadata.StreamUrl);
    if (!decoded) {
      // Old Icecast v1.2 stream (title + event ID only). Do not guess time or
      // fetch station JSON: the listener's audio can be behind the broadcaster.
      icyProgress = null;
      lastIcyAt = 0;
      progress.hidden = true;
      context.hidden = true;
      condition.textContent = "UNAVAILABLE";
      root.removeAttribute("data-condition");
      bars.forEach(bar => { bar.style.opacity = "0.16"; });
      barGroup.setAttribute("aria-label", "Signal indicator unavailable");
      metadataStatus.textContent = "PROGRAM METADATA / ICY TITLE ONLY";
      return;
    }

    lastIcyAt = performance.now();
    if (decoded.category === "s") lastStoryTitle = display;
    context.hidden = decoded.category === "s" || !lastStoryTitle;
    if (!context.hidden) context.textContent = "PROGRAM: " + lastStoryTitle;
    const old = icyProgress;
    const sameEvent = old && old.eventId === decoded.eventId;
    if (decoded.position !== null && decoded.duration !== null &&
        decoded.duration > 0 && decoded.position <= decoded.duration) {
      let position = decoded.position;
      if (sameEvent && old.advancing && decoded.category === "s") {
        const local = Math.min(old.duration, old.position +
          Math.max(0, (performance.now() - old.at) / 1000));
        if (Math.abs(local - position) < 2) position = local;
      }
      icyProgress = {
        eventId: decoded.eventId,
        category: decoded.category,
        duration: decoded.duration,
        position,
        at: performance.now(),
        advancing: playbackState === "playing" && !audio.paused &&
          decoded.category === "s"
      };
    } else {
      icyProgress = null;
    }

    const states = { N: "NORMAL", E: "ELEVATED", D: "DEGRADED", C: "CRITICAL" };
    const name = states[decoded.condition] || "UNAVAILABLE";
    condition.textContent = name;
    if (name !== "UNAVAILABLE") root.dataset.condition = name;
    else root.removeAttribute("data-condition");
    if (decoded.levels) {
      bars.forEach((bar, i) => {
        bar.style.opacity = String(0.16 + decoded.levels[i] * 0.84);
      });
      const total = decoded.levels.reduce((a, b) => a + b, 0);
      barGroup.setAttribute("aria-label",
        "Broadcast signal: " + Math.round(total) + " of 4 bars");
    } else {
      bars.forEach(bar => { bar.style.opacity = "0.16"; });
      barGroup.setAttribute("aria-label", "Signal indicator unavailable");
    }
    metadataStatus.textContent = player && player.playbackMethod === "html5"
      ? "STATION TELEMETRY / ICY FALLBACK"
      : "STATION TELEMETRY / ICY RECEIVING";
    updateIcyClock();
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
