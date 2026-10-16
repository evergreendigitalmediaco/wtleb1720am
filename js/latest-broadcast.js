(() => {
  "use strict";

  // The newest published story is not necessarily the story currently playing
  // on WTLEB's continuous livestream.
  const LATEST_URL = "https://api.evergreendigitalmedia.co/catalog/v1/tleb/stories/latest";
  const title = document.getElementById("latest-broadcast-title");
  const description = document.getElementById("latest-broadcast-description");
  const metadata = document.getElementById("latest-broadcast-meta");
  const sourceLinks = document.getElementById("latest-broadcast-links");
  if (!title || !metadata || !sourceLinks || !description) return;

  function safeUrl(value) {
    if (typeof value !== "string") return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function link(url, label, platform) {
    const anchor = document.createElement("a");
    anchor.className = "archive-source-link";
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.setAttribute("aria-label", "Open " + label + " source in a new tab");

    const icon = document.createElement("img");
    icon.className = "archive-source-icon";
    icon.src = "/images/platforms/" + platform + ".svg";
    icon.alt = "";
    icon.width = 16;
    icon.height = 16;
    icon.setAttribute("aria-hidden", "true");
    anchor.appendChild(icon);

    const text = document.createElement("span");
    text.textContent = label;
    anchor.appendChild(text);
    return anchor;
  }

  function teaser(value) {
    if (typeof value !== "string") return "";
    const firstParagraph = value.trim().split(/\r?\n\s*\r?\n/)[0]
      .replace(/\s+/g, " ").trim();
    if (!firstParagraph) return "";
    const limit = 150;
    if (firstParagraph.length <= limit) return firstParagraph;
    const clipped = firstParagraph.slice(0, limit + 1);
    const end = clipped.lastIndexOf(" ");
    return (end > limit * 0.6 ? clipped.slice(0, end) : firstParagraph.slice(0, limit)).trimEnd() + "…";
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
      const youtube = sources.find(item => item && item.source_type === "youtube");
      const summary = teaser(story.description) || teaser(youtube && youtube.description);
      description.textContent = summary;
      description.hidden = !summary;
      for (const [sourceType, label, platform] of [["youtube", "YOUTUBE", "youtube"], ["podcast_rss", "SPOTIFY", "spotify"]]) {
        const source = sources.find(item => item.source_type === sourceType && safeUrl(item.source_url));
        if (source) sourceLinks.appendChild(link(safeUrl(source.source_url), label, platform));
      }
    } catch (error) {
      console.warn("WTLEB latest broadcast retrieval failed:", error);
      title.textContent = "LATEST TRANSMISSION DETAILS TEMPORARILY UNAVAILABLE";
      metadata.textContent = "REMOTE CATALOG CONNECTION INTERRUPTED";
      description.textContent = "";
      description.hidden = true;
    } finally {
      clearTimeout(timeout);
    }
  }

  updateLatestBroadcast();
})();
