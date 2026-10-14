# Icecast Metadata Player — pinned vendored distribution

Source: https://github.com/eshaz/icecast-metadata-js
Upstream package: icecast-metadata-player
Pinned version: 1.17.13
License: LGPL-3.0-or-later (see upstream repository and bundled license notice).

The minified scripts in this directory are unmodified builds copied from:
https://github.com/eshaz/icecast-metadata-js/tree/main/src/icecast-metadata-player/build

Keep all the JavaScript files together: the main bundle dynamically loads
additional codec/playback modules depending on browser support.

WTLEB only uses the public MP3 endpoint and ICY metadata. The library does not
provide EGM-Broadcast's story progress or radio-environment telemetry; those
require a separately versioned ICY StreamUrl payload from the broadcaster.

Do not load the current-state live.json from this player. A station-side
snapshot can be ahead of audio buffered by an individual listener.
