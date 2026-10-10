(() => {
  "use strict";

  // Public, read-only catalog endpoint. The API manages source synchronization,
  // publication visibility, pagination, and HTTP caching.
  const CATALOG_URL = "https://api.evergreendigitalmedia.co/catalog/v1/tleb/stories";
  const PAGE_SIZE = 20;
  const FETCH_TIMEOUT_MS = 12000;

  // Fictional classifications are stable for a given transmission, rather than
  // changing every time a listener reloads the archive.
  const STATUSES = [
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

  const list = document.getElementById("archive-list");
  const feedback = document.getElementById("archive-feedback");
  const loadMore = document.getElementById("archive-load-more");
  const recordCount = document.getElementById("archive-record-count");

  if (!list || !feedback || !loadMore || !recordCount) return;

  let nextCursor = null;
  let retrievedCount = 0;
  let requestInProgress = false;

  function stableStatus(story) {
    const key = String(story.content_id || story.episode_number || story.title);
    let hash = 0;
    for (const char of key) {
      hash = (Math.imul(hash, 31) + char.codePointAt(0)) | 0;
    }
    return STATUSES[(hash >>> 0) % STATUSES.length];
  }

  function broadcastReference(story) {
    if (Number.isInteger(story.episode_number) && story.episode_number > 0) {
      return "WTLEB-" + String(story.episode_number).padStart(3, "0");
    }
    if (typeof story.content_id === "string" && /^[0-9a-f-]{36}$/i.test(story.content_id)) {
      return "WTLEB-" + story.content_id.slice(0, 8).toUpperCase();
    }
    return "REFERENCE PENDING";
  }

  function displayDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return "UNVERIFIED";
    }
    return value.replace(/-/g, ".");
  }

  function durationLabel(story) {
    const sources = Array.isArray(story.sources) ? story.sources : [];
    const source = sources.find(item => item.source_type === "podcast_rss" &&
      Number.isInteger(item.duration_seconds) && item.duration_seconds > 0) ||
      sources.find(item => Number.isInteger(item.duration_seconds) && item.duration_seconds > 0);
    if (!source) return null;

    const seconds = source.duration_seconds;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;
    const padded = number => String(number).padStart(2, "0");
    return hours
      ? padded(hours) + ":" + padded(minutes) + ":" + padded(remainder)
      : padded(minutes) + ":" + padded(remainder);
  }

  function safeSourceUrl(value) {
    if (typeof value !== "string") return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function sourceLink(url, label) {
    const link = element("a", "archive-source-link", label + " ↗");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }

  function renderTransmission(story) {
    if (!story || typeof story.title !== "string" || !story.title.trim()) return;

    const sources = Array.isArray(story.sources) ? story.sources : [];
    const youtube = sources.find(source => source.source_type === "youtube" &&
      safeSourceUrl(source.source_url));
    const podcast = sources.find(source => source.source_type === "podcast_rss" &&
      safeSourceUrl(source.source_url));
    const youtubeUrl = youtube ? safeSourceUrl(youtube.source_url) : null;
    const podcastUrl = podcast ? safeSourceUrl(podcast.source_url) : null;

    const entry = element("article", "archive-entry");
    const heading = element("h2", "archive-transmission-heading");
    const header = element("div", "archive-record-header");
    header.appendChild(element("span", "archive-record-id",
      "TRANSMISSION ID: " + broadcastReference(story)));
    header.appendChild(element("span", "archive-record-status",
      "STATUS: " + stableStatus(story)));
    entry.appendChild(header);

    const mainUrl = youtubeUrl || podcastUrl;
    if (mainUrl) {
      const titleLink = element("a", "archive-transmission-link", story.title);
      titleLink.href = mainUrl;
      titleLink.target = "_blank";
      titleLink.rel = "noopener noreferrer";
      heading.appendChild(titleLink);
    } else {
      heading.appendChild(element("span", "archive-transmission-title", story.title));
    }
    entry.appendChild(heading);

    const meta = element("div", "archive-record-meta");
    meta.appendChild(element("span", "", "LOGGED: " + displayDate(story.published_date)));
    const duration = durationLabel(story);
    if (duration) meta.appendChild(element("span", "", "DURATION: " + duration));
    entry.appendChild(meta);

    const relays = element("div", "archive-source-links");
    relays.appendChild(element("span", "archive-relay-caption", "AVAILABLE SOURCES:"));
    if (youtubeUrl) relays.appendChild(sourceLink(youtubeUrl, "YOUTUBE"));
    if (podcastUrl) relays.appendChild(sourceLink(podcastUrl, "PODCAST"));
    if (!youtubeUrl && !podcastUrl) {
      relays.appendChild(element("span", "archive-no-source", "SOURCE LINK UNAVAILABLE"));
    }
    entry.appendChild(relays);
    list.appendChild(entry);
  }

  async function retrieveRecords() {
    if (requestInProgress) return;
    requestInProgress = true;
    loadMore.disabled = true;
    loadMore.hidden = true;
    feedback.hidden = false;
    feedback.textContent = retrievedCount === 0
      ? "CONTACTING REMOTE CATALOG..."
      : "RETRIEVING ADDITIONAL RECORDS...";

    const url = new URL(CATALOG_URL);
    url.searchParams.set("limit", String(PAGE_SIZE));
    url.searchParams.set("order", "newest");
    if (nextCursor) url.searchParams.set("cursor", nextCursor);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url.href, {
        method: "GET",
        headers: { "Accept": "application/json" },
        mode: "cors",
        credentials: "omit",
        signal: controller.signal
      });
      if (!response.ok) throw new Error("Catalog HTTP status: " + response.status);

      const page = await response.json();
      if (!page || !Array.isArray(page.stories) ||
          (page.next_cursor !== null && typeof page.next_cursor !== "string")) {
        throw new Error("Unexpected catalog response format");
      }

      // The catalog publishes at most PAGE_SIZE records, newest first, and
      // supplies an opaque cursor if another page is available.
      for (const story of page.stories) renderTransmission(story);
      retrievedCount += page.stories.length;
      nextCursor = page.next_cursor;

      recordCount.textContent = "RECORDS RETRIEVED: " + retrievedCount;
      if (retrievedCount === 0) {
        feedback.textContent = "NO PUBLIC TRANSMISSION RECORDS ARE CURRENTLY AVAILABLE.";
      } else {
        feedback.textContent = "ARCHIVE INDEX SYNCHRONIZED.";
      }

      loadMore.hidden = !nextCursor;
      loadMore.textContent = "RETRIEVE ADDITIONAL RECORDS ↓";
    } catch (error) {
      console.warn("WTLEB archive retrieval failed:", error);
      feedback.textContent = retrievedCount
        ? "REMOTE CATALOG INTERRUPTED. PREVIOUSLY RETRIEVED RECORDS REMAIN AVAILABLE."
        : "ARCHIVE CONNECTION INTERRUPTED. REMOTE RECORDS TEMPORARILY UNAVAILABLE.";
      loadMore.textContent = retrievedCount
        ? "RETRY RECORD RETRIEVAL ↻"
        : "RETRY ARCHIVE CONNECTION ↻";
      loadMore.hidden = false;
    } finally {
      clearTimeout(timeout);
      loadMore.disabled = false;
      requestInProgress = false;
    }
  }

  loadMore.addEventListener("click", retrieveRecords);
  retrieveRecords();
})();
