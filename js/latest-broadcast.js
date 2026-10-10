(() => {
  "use strict";

  // The newest published story is not necessarily the story currently playing
  // on WTLEB's continuous livestream.
  const LATEST_URL = "https://api.evergreendigitalmedia.co/catalog/v1/tleb/stories/latest";
  const title = document.getElementById("latest-broadcast-title");
  const metadata = document.getElementById("latest-broadcast-meta");
  const sourceLinks = document.getElementById("latest-broadcast-links");
  if (!title || !metadata || !sourceLinks) return;

  function safeUrl(value) {
    if (typeof value !== "string") return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function link(url, label) {
    const anchor = document.createElement("a");
    anchor.className = "home-latest-link";
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = label + " ↗";
    return anchor;
  }

  async function updateLatestBroadcast() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(LATEST_URL, {
        method: "GET",
        headers: { "Accept": "application/json" },
        mode: "cors",
        credentials: "omit",
        signal: controller.signal
      });
      if (!response.ok) throw new Error("Catalog HTTP status: " + response.status);

      const story = await response.json();
      if (!story || typeof story.title !== "string" || !story.title.trim()) {
        throw new Error("Unexpected catalog response format");
      }

      title.textContent = story.title;
      metadata.textContent = typeof story.published_date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(story.published_date)
        ? "LOGGED: " + story.published_date.replace(/-/g, ".")
        : "PUBLICATION DATE: UNVERIFIED";

      const sources = Array.isArray(story.sources) ? story.sources : [];
      for (const [sourceType, label] of [["youtube", "YOUTUBE"], ["podcast_rss", "PODCAST"]]) {
        const source = sources.find(item => item.source_type === sourceType && safeUrl(item.source_url));
        if (source) sourceLinks.appendChild(link(safeUrl(source.source_url), label));
      }
    } catch (error) {
      console.warn("WTLEB latest broadcast retrieval failed:", error);
      title.textContent = "LATEST TRANSMISSION DETAILS TEMPORARILY UNAVAILABLE";
      metadata.textContent = "REMOTE CATALOG CONNECTION INTERRUPTED";
    } finally {
      clearTimeout(timeout);
    }
  }

  updateLatestBroadcast();
})();
