"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(path.resolve(__dirname, "../js/live-radio.js"), "utf8");

function receiverHarness() {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      id, hidden: false, disabled: false, value: "75", paused: true,
      textContent: "", dataset: {}, listeners: {}, muted: false,
      style: { opacity: "1", setProperty() {} },
      addEventListener(name, callback) { this.listeners[name] = callback; },
      setAttribute() {}, removeAttribute() {},
      querySelector() { return {}; },
      pause() { this.paused = true; }, load() {},
    });
    return elements.get(id);
  };
  const root = element("live-radio");
  root.dataset.receiver = "normal";
  root.querySelectorAll = () => [0, 1, 2, 3].map(i => element("bar" + i));
  root.removeAttribute = name => {
    if (name === "data-condition") delete root.dataset.condition;
    if (name === "data-event-id") delete root.dataset.eventId;
  };
  const audio = element("radio-audio");
  let now = 0;
  let tick;
  let callbacks;
  class FakePlayer {
    constructor(url, options) {
      assert.equal(url, "https://live.wtleb1720am.com/live.mp3");
      callbacks = options;
      this.playbackMethod = "mediasource";
    }
    play() {
      audio.paused = false;
      audio.listeners.playing?.();
      return Promise.resolve();
    }
    detachAudioElement() { return Promise.resolve(); }
    stop() {}
  }
  const window = {
    IcecastMetadataPlayer: FakePlayer,
    setInterval(callback) { tick = callback; },
    addEventListener() {},
    location: { origin: "https://wtleb1720am.com", search: "" },
  };
  const document = { getElementById: element, hidden: false };
  vm.runInNewContext(script, { window, document, URL, performance: { now: () => now },
    console, URLSearchParams });
  return {
    element, tune: () => element("radio-tune").listeners.click(),
    metadata: m => callbacks.onMetadata(m),
    progress: () => element("radio-story-progress").textContent,
    advance: secs => { now += secs * 1000; tick(); },
    disconnect: () => element("radio-disconnect").listeners.click(),
  };
}

const eventId = sequence => "WTLEB-" + "a".repeat(32) + "-" + sequence;
const metadata = (sequence, category, position, rf = "E") => ({
  StreamTitle: category === "s" ? "The Sky Is Burning" : "COMMERCIAL BREAK",
  StreamUrl: "https://wtleb1720am.com#" + eventId(sequence) +
    "!v1!" + category + "!" + position + "!36000!" + rf + "!fc80",
});

test("receiver interpolates only while story audio plays, freezing in commercials", async () => {
  const h = receiverHarness();
  assert.equal(h.element("radio-story-progress").hidden, true);
  h.tune();
  h.metadata(metadata(1, "s", 9893));
  assert.match(h.progress(), /16:29 \/ 1:00:00/);
  assert.equal(h.element("radio-condition").textContent, "ELEVATED");
  assert.equal(h.element("live-radio").dataset.eventId, eventId(1));
  h.advance(5);
  assert.match(h.progress(), /16:34 \/ 1:00:00/);
  h.metadata(metadata(2, "c", 9943));
  const frozen = h.progress();
  h.advance(30);
  assert.equal(h.progress(), frozen);
  assert.equal(h.element("radio-current-title").textContent, "COMMERCIAL BREAK");
  h.metadata(metadata(3, "s", 9943));
  h.advance(2);
  assert.match(h.progress(), /16:36 \/ 1:00:00/);
  h.disconnect();
  assert.equal(h.element("radio-story-progress").hidden, true);
  assert.equal(h.element("radio-condition").textContent, "UNAVAILABLE");
});

test("legacy ICY event IDs keep title but cannot fabricate RF or timing", () => {
  const h = receiverHarness();
  h.tune();
  h.metadata({ StreamTitle: "Legacy Story",
    StreamUrl: "https://wtleb1720am.com#" + eventId(4) });
  assert.equal(h.element("radio-current-title").textContent, "Legacy Story");
  assert.equal(h.element("radio-story-progress").hidden, true);
  assert.equal(h.element("radio-condition").textContent, "UNAVAILABLE");
});

test("malformed telemetry fails closed, never requests live.json", () => {
  const h = receiverHarness();
  h.tune();
  h.metadata({ StreamTitle: "Test",
    StreamUrl: "https://evil.example/#" + eventId(1) + "!v1!s!0!50!N!ffff" });
  assert.equal(h.element("radio-story-progress").hidden, true);
  assert.equal(h.element("radio-condition").textContent, "UNAVAILABLE");
  assert.equal(script.includes("fetch("), false);
});
