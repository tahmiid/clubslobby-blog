/**
 * Pro Clubs HQ — interactive build embed for blog articles.
 *
 * Usage in an article (the anchor is the no-JS/SEO fallback AND the click
 * target — the whole card is one link into the app, opened in a new tab):
 *
 *   <a class="pchq-build" data-build="<uuid>" href="https://proclubshq.com/b/<uuid>"
 *      target="_blank" rel="noopener">Creative Playmaker — open in Pro Clubs HQ</a>
 *
 * The script hydrates every .pchq-build on the page from
 * GET /api/builds/{id}/public — same origin as the blog, so no CORS.
 * If the fetch fails the anchor stays a styled plain link; nothing breaks.
 *
 * Layout (2026-08-08, mirroring the Edit Build page — see the CSS header):
 * spec over build name + white archetype logo right, the teal level slider,
 * six key attributes in rating colors, 68px gold signature diamonds,
 * creator + counts + the blue "Open in builder" primary button.
 */
(function () {
  "use strict";

  var _ds = (document.currentScript && document.currentScript.dataset) || {};
  var API_BASE = _ds.apiBase || "";
  var ASSET_BASE = _ds.assetBase || "";

  var LABELS = {
    ballControl: "Ball Control", shortPass: "Short Passing", longPass: "Long Passing",
    attPosition: "Att. Positioning", defAware: "Def. Awareness", standTackle: "Stand Tackle",
    slideTackle: "Slide Tackle", headingAcc: "Heading Acc.", fkAcc: "FK Accuracy",
    shotPower: "Shot Power", longShots: "Long Shots", sprintSpeed: "Sprint Speed",
    gkPositioning: "GK Positioning", gkReflexes: "GK Reflexes", gkHandling: "GK Handling",
    gkDiving: "GK Diving", gkKicking: "GK Kicking"
  };
  function label(key) {
    if (LABELS[key]) return LABELS[key];
    var s = key.replace(/([A-Z])/g, " $1");
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Tier accent — spec label only. The card carries NO tier border.
  var TIERS = {
    bronze: "#b0793f", silver: "#b9c0cc", gold: "#e8c35a",
    purple: "#a06bff", black: "#8affd6"
  };

  // The app's rating scale (AttributeSlider.jsx / StatBar.jsx).
  function ratingColor(v) {
    return v >= 80 ? "#2FD26B" : v >= 55 ? "#E8912D" : "#D9542F";
  }

  var LEVEL_MAX = 100;

  function h(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  function hydrate(anchor) {
    var id = anchor.dataset.build;
    if (!id) return;

    fetch(API_BASE + "/api/builds/" + encodeURIComponent(id) + "/public")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (b) { render(anchor, b); })
      .catch(function () { anchor.classList.add("pchq-card-fallback"); });
  }

  // The A/B treatments (experiment, 2026-08-14): an anchor may carry
  // data-variant="invite" (same card, a better ask) or "reel" (a miniature
  // of the /b/ page it opens). No attribute means the baseline card - the
  // articles outside the experiment re-render byte-identically.
  function render(anchor, b) {
    if (anchor.dataset.variant === "reel") { renderReel(anchor, b); return; }
    var invite = anchor.dataset.variant === "invite";
    anchor.classList.add("pchq-card");
    anchor.style.setProperty("--pchq-tier", TIERS[b.cardTier] || "#e8c35a");
    anchor.textContent = "";

    // The app's background stack: photo, shade, vignette, cursor glow.
    anchor.appendChild(h("span", "pchq-bg"));
    anchor.appendChild(h("span", "pchq-shade"));
    anchor.appendChild(h("span", "pchq-vig"));
    anchor.appendChild(h("span", "pchq-glow"));

    var inner = h("span", "pchq-in");

    // Header: spec over name; white archetype logo right, spanning both lines.
    var head = h("span", "pchq-head");
    var idCol = h("span", "pchq-id-col");
    idCol.appendChild(h("span", "pchq-arch", b.cardLabel || ""));
    idCol.appendChild(h("span", "pchq-name", b.buildName));
    head.appendChild(idCol);
    if (b.archetype_id) {
      var logo = document.createElement("img");
      logo.className = "pchq-logo";
      logo.src = ASSET_BASE + "/assets/archetypes/" + encodeURIComponent(b.archetype_id) + ".svg";
      logo.alt = "";
      logo.loading = "lazy";
      logo.addEventListener("error", function () { logo.remove(); });
      head.appendChild(logo);
    }
    inner.appendChild(head);

    // The level slider, static: fill stops exactly at the build's level.
    var lv = h("span", "pchq-lv");
    var line = h("span", "pchq-lv-line");
    line.appendChild(h("span", "pchq-lv-label", "Level"));
    line.appendChild(h("span", "pchq-lv-val", String(b.level)));
    lv.appendChild(line);
    var track = h("span", "pchq-lv-track");
    var pct = Math.max(0, Math.min(100, (b.level / LEVEL_MAX) * 100));
    var fill = h("span", "pchq-lv-fill");
    fill.style.width = pct + "%";
    track.appendChild(fill);
    var thumb = h("span", "pchq-lv-thumb");
    thumb.style.left = pct + "%";
    track.appendChild(thumb);
    lv.appendChild(track);
    inner.appendChild(lv);

    // Top six attributes by value — the build's own numbers, rating colors.
    var attrs = Object.entries(b.attributes || {})
      .sort(function (x, y) { return y[1] - x[1]; }).slice(0, 6);
    var grid = h("span", "pchq-attrs");
    attrs.forEach(function (kv) {
      var col = ratingColor(kv[1]);
      var row = h("span", "pchq-attr");
      var top = h("span", "pchq-attr-line");
      top.appendChild(h("span", "pchq-attr-name", label(kv[0])));
      var val = h("span", "pchq-attr-val", String(kv[1]));
      val.style.color = col;
      top.appendChild(val);
      row.appendChild(top);
      var bar = h("span", "pchq-bar");
      var f = h("span", "pchq-fill");
      f.style.width = kv[1] + "%";
      f.style.background = col;
      f.style.boxShadow = "0 0 6px " + col + "66";
      bar.appendChild(f);
      row.appendChild(bar);
      grid.appendChild(row);
    });
    inner.appendChild(grid);

    // Signature PlayStyles: gold, PlayStyles-tab size.
    var sigs = h("span", "pchq-sigs");
    (b.signature || []).forEach(function (slug) {
      var ic = document.createElement("img");
      ic.className = "pchq-sig-ic";
      ic.src = ASSET_BASE + "/assets/playstyles/" + encodeURIComponent(slug) + ".png";
      ic.loading = "lazy";
      ic.addEventListener("error", function () { ic.remove(); });
      var title = slug.split("-").map(function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1);
      }).join(" ");
      ic.title = title;
      ic.alt = title + " (signature PlayStyle)";
      sigs.appendChild(ic);
    });
    if (sigs.childNodes.length) inner.appendChild(sigs);

    // Footer: creator + counts, and the primary-button CTA.
    var foot = h("span", "pchq-foot" + (invite ? " pchq-foot-inv" : ""));
    var creator = b.creator && b.creator.handle ? "@" + b.creator.handle : "Pro Clubs HQ";
    foot.appendChild(h("span", "pchq-by", creator));
    if (invite) {
      // The invite treatment never shows a zero - "0 loves" is social proof
      // running in reverse at the exact moment of decision. What is genuinely
      // positive gets said in a sentence, not a stat pair.
      if ((b.copyCount || 0) > 0) {
        foot.appendChild(h("span", "pchq-social",
          "⚡ " + b.copyCount + (b.copyCount === 1 ? " player has" : " players have") + " copied this build"));
      } else if ((b.loveCount || 0) > 0) {
        foot.appendChild(h("span", "pchq-social", "❤ " + b.loveCount + " loves"));
      }
      inner.appendChild(foot);
      inner.appendChild(h("span", "pchq-cta-block", "See the full build →"));
      inner.appendChild(h("span", "pchq-cta-sub",
        "every attribute, the AP order, and a copy you can bend into your own"));
    } else {
      foot.appendChild(h("span", "pchq-stat", (b.loveCount || 0) + " loves"));
      foot.appendChild(h("span", "pchq-stat", (b.copyCount || 0) + " copies"));
      foot.appendChild(h("span", "pchq-cta", "Open in builder"));
      inner.appendChild(foot);
    }

    anchor.appendChild(inner);

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Mouse-reactive: the card tilts toward the cursor and a glow follows it.
    anchor.addEventListener("pointermove", function (e) {
      var r = anchor.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;   // 0..1
      var py = (e.clientY - r.top) / r.height;
      anchor.style.setProperty("--pchq-rx", ((0.5 - py) * 5).toFixed(2) + "deg");
      anchor.style.setProperty("--pchq-ry", ((px - 0.5) * 7).toFixed(2) + "deg");
      anchor.style.setProperty("--pchq-mx", (px * 100).toFixed(1) + "%");
      anchor.style.setProperty("--pchq-my", (py * 100).toFixed(1) + "%");
    });
    anchor.addEventListener("pointerleave", function () {
      anchor.style.setProperty("--pchq-rx", "0deg");
      anchor.style.setProperty("--pchq-ry", "0deg");
    });
  }

  // The reel teaser: a miniature of the /b/ page the click opens - same art,
  // same scrim, level chip, gold signature rail, a taste of the stat stream,
  // the plate, and the CTA. Visual continuity IS the seamlessness: the click
  // feels like the card going full-screen because the destination looks like
  // this. The stream animates in line by line the way the app's stream
  // accumulates - triggered the first time the card is actually seen, and
  // reduced-motion readers get the finished state immediately, the same rule
  // the app follows.
  function renderReel(anchor, b) {
    anchor.classList.add("pchq-reel");
    anchor.style.setProperty("--pchq-tier", TIERS[b.cardTier] || "#e8c35a");
    anchor.textContent = "";

    var art = h("span", "pchq-r-art" + (anchor.dataset.art === "keeper" ? " pchq-r-art-gk" : ""));
    anchor.appendChild(art);
    anchor.appendChild(h("span", "pchq-r-scrim"));
    anchor.appendChild(h("span", "pchq-r-lvl", "LVL " + b.level));

    var rail = h("span", "pchq-r-rail");
    (b.signature || []).slice(0, 4).forEach(function (slug) {
      var ic = document.createElement("img");
      ic.className = "pchq-r-sig";
      ic.src = ASSET_BASE + "/assets/playstyles/" + encodeURIComponent(slug) + ".png";
      ic.alt = "";
      ic.loading = "lazy";
      ic.addEventListener("error", function () { ic.remove(); });
      rail.appendChild(ic);
    });
    anchor.appendChild(rail);

    var stream = h("span", "pchq-r-stream");
    anchor.appendChild(stream);
    var lines = reelStreamLines(b);

    var plate = h("span", "pchq-r-plate");
    if (b.archetype_id) {
      var logo = document.createElement("img");
      logo.className = "pchq-r-logo";
      logo.src = ASSET_BASE + "/assets/archetypes/" + encodeURIComponent(b.archetype_id) + ".svg";
      logo.alt = "";
      logo.addEventListener("error", function () { logo.remove(); });
      plate.appendChild(logo);
    }
    var idc = h("span", "pchq-r-id");
    var handle = b.creator && b.creator.handle ? " · @" + b.creator.handle : "";
    idc.appendChild(h("span", "pchq-r-spec", (b.cardLabel || "") + handle));
    idc.appendChild(h("span", "pchq-r-name", b.buildName));
    plate.appendChild(idc);
    anchor.appendChild(plate);

    anchor.appendChild(h("span", "pchq-r-cta", "Check out the whole build →"));

    // The app's stream rule, both halves: it ACCUMULATES - lines append one
    // by one and the window auto-scrolls, nothing is ever removed, a reader
    // can scroll back up inside it - and reduced motion gets the finished
    // state, not a slower animation. Appending starts the first time the
    // card is actually seen.
    var showAll = function () {
      lines.forEach(function (l) { stream.appendChild(l); });
      stream.scrollTop = stream.scrollHeight;
    };
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }
    var reveal = function (i) {
      if (i >= lines.length) return;
      stream.appendChild(lines[i]);
      stream.scrollTop = stream.scrollHeight;
      setTimeout(function () { reveal(i + 1); }, lines[i].dataset.quick ? 240 : 520);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.disconnect(); reveal(0); }
      });
    }, { threshold: 0.35 });
    io.observe(anchor);
  }

  // The stream's content, mirroring the app's BuildStream order: the
  // attribute-group bars first (the build's shape before anything else),
  // then physique, run type, weak foot, skill moves, the equipped
  // PlayStyles - and the top attributes last, the closing act. Comments and
  // the love/send rail are the two things deliberately not replicated.
  var GROUPS = [
    ["Pace", ["acceleration", "sprintSpeed"]],
    ["Ball Control", ["agility", "balance", "reactions", "ballControl", "dribbling", "composure"]],
    ["Passing", ["vision", "crossing", "fkAcc", "shortPass", "longPass", "curve"]],
    ["Scoring", ["attPosition", "finishing", "shotPower", "longShots", "volleys", "penalties"]],
    ["Defending", ["interceptions", "headingAcc", "defAware", "standTackle", "slideTackle"]],
    ["Physical", ["jumping", "strength", "stamina", "aggression"]],
    ["Shot Stopping", ["gkDiving", "gkHandling", "gkKicking", "gkPositioning", "gkReflexes"]]
  ];

  function reelStreamLines(b) {
    var attrs = b.attributes || {};
    var lines = [];

    function barLine(name, value, quick) {
      var line = h("span", "pchq-r-line");
      if (quick) line.dataset.quick = "1";
      line.appendChild(h("span", "pchq-r-nm", name));
      var bar = h("span", "pchq-r-bar");
      var fill = h("span", "pchq-r-fill");
      fill.style.width = value + "%";
      fill.style.background = ratingColor(value);
      fill.style.boxShadow = "0 0 6px " + ratingColor(value) + "88";
      bar.appendChild(fill);
      line.appendChild(bar);
      var val = h("span", "pchq-r-val", String(value));
      val.style.color = ratingColor(value);
      line.appendChild(val);
      return line;
    }

    function textLine(name, value) {
      var line = h("span", "pchq-r-line pchq-r-line-t");
      line.appendChild(h("span", "pchq-r-nm", name));
      line.appendChild(h("span", "pchq-r-txt", value));
      return line;
    }

    GROUPS.forEach(function (g) {
      var vals = g[1].map(function (k) { return attrs[k]; })
        .filter(function (v) { return typeof v === "number"; });
      if (!vals.length) return;
      var avg = Math.round(vals.reduce(function (s, v) { return s + v; }, 0) / vals.length);
      lines.push(barLine(g[0], avg, true));
    });

    if (b.height && b.weight) {
      lines.push(textLine("Physique",
        Math.floor(b.height / 12) + "'" + (b.height % 12) + '" · ' + b.weight + " lb"));
    }
    if (b.accelerationType) lines.push(textLine("Run type", b.accelerationType));
    var stars = function (n) {
      n = Math.max(1, Math.min(5, n || 0));
      return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
    };
    if (b.weakFoot) lines.push(textLine("Weak foot", stars(b.weakFoot)));
    if (b.skillMoves) lines.push(textLine("Skill moves", stars(b.skillMoves)));

    if (b.playstyles && b.playstyles.length) {
      var line = h("span", "pchq-r-line pchq-r-line-t");
      line.appendChild(h("span", "pchq-r-nm", "PlayStyles"));
      var row = h("span", "pchq-r-ps");
      b.playstyles.forEach(function (slug) {
        var ic = document.createElement("img");
        ic.className = "pchq-r-ps-ic";
        ic.src = ASSET_BASE + "/assets/playstyles/" + encodeURIComponent(slug) + ".png";
        ic.alt = "";
        ic.loading = "lazy";
        ic.addEventListener("error", function () { ic.remove(); });
        row.appendChild(ic);
      });
      line.appendChild(row);
      lines.push(line);
    }

    Object.entries(attrs)
      .sort(function (x, y) { return y[1] - x[1]; }).slice(0, 3)
      .forEach(function (kv) { lines.push(barLine(label(kv[0]), kv[1])); });

    return lines;
  }

  function boot() {
    document.querySelectorAll("a.pchq-build[data-build]").forEach(hydrate);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
