/**
 * Pro Clubs HQ — interactive build embed for blog articles.
 *
 * Usage in an article (the anchor is the no-JS/SEO fallback AND the click
 * target — the whole card is one link into the app):
 *
 *   <a class="pchq-build" data-build="<uuid>" href="https://proclubshq.com/b/<uuid>">
 *     Creative Playmaker — open in Pro Clubs HQ
 *   </a>
 *
 * The script hydrates every .pchq-build on the page from
 * GET /api/builds/{id}/public — same origin as the blog, so no CORS.
 * If the fetch fails the anchor stays a styled plain link; nothing breaks.
 */
(function () {
  "use strict";

  // On proclubshq.com the API and the app's static assets are both
  // same-origin; the data attributes exist so a local demo can point at the
  // dev servers (API on 8001, CRA assets on 3000).
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

  var TIERS = {
    bronze: "#b0793f", silver: "#b9c0cc", gold: "#e8c35a",
    purple: "#a06bff", black: "#8affd6"
  };

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

  function render(anchor, b) {
    var tier = TIERS[b.cardTier] || "#e8c35a";
    anchor.classList.add("pchq-card");
    anchor.style.setProperty("--pchq-tier", tier);
    anchor.textContent = "";

    var glow = h("span", "pchq-glow");

    // Header: the archetype logo spans both identity lines, with the
    // specialization label over the build name beside it.
    var head = h("span", "pchq-head");
    var ident = h("span", "pchq-ident");
    if (b.archetype_id) {
      var logo = document.createElement("img");
      logo.className = "pchq-logo";
      logo.src = ASSET_BASE + "/assets/archetypes/" + encodeURIComponent(b.archetype_id) + ".svg";
      logo.alt = "";
      logo.loading = "lazy";
      // A missing icon (future archetype, renamed id) must not leave a broken
      // image glyph on the card.
      logo.addEventListener("error", function () { logo.remove(); });
      ident.appendChild(logo);
    }
    var idCol = h("span", "pchq-id-col");
    idCol.appendChild(h("span", "pchq-arch", b.cardLabel || ""));
    idCol.appendChild(h("span", "pchq-name", b.buildName));
    ident.appendChild(idCol);
    head.appendChild(ident);
    head.appendChild(h("span", "pchq-lvl", "LVL " + b.level));

    // Top six attributes by value - the build's own numbers, nothing invented.
    var attrs = Object.entries(b.attributes || {})
      .sort(function (x, y) { return y[1] - x[1]; }).slice(0, 6);
    var grid = h("span", "pchq-attrs");
    attrs.forEach(function (kv) {
      var row = h("span", "pchq-attr");
      row.appendChild(h("span", "pchq-attr-name", label(kv[0])));
      var bar = h("span", "pchq-bar");
      var fill = h("span", "pchq-fill");
      fill.style.width = kv[1] + "%";
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(h("span", "pchq-attr-val", String(kv[1])));
      grid.appendChild(row);
    });

    // Equipped PlayStyles: icon only, natural silver, one row above the
    // signature set (added 2026-08-07 for the spoke articles — builds now
    // carry their full nine slots, and the icons ARE the content).
    var eq = h("span", "pchq-eq");
    (b.playstyles || []).forEach(function (slug) {
      var ic = document.createElement("img");
      ic.className = "pchq-eq-ic";
      ic.src = ASSET_BASE + "/assets/playstyles/" + encodeURIComponent(slug) + ".png";
      ic.loading = "lazy";
      ic.addEventListener("error", function () { ic.remove(); });
      var title = slug.split("-").map(function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1);
      }).join(" ");
      ic.title = title;
      ic.alt = title + " (PlayStyle)";
      eq.appendChild(ic);
    });

    // Signature PlayStyles: icon only, rendered gold regardless of card tier
    // (signature PlayStyles are the gold ones in-game), using the app's own
    // GOLD_FILTER recipe from PlayStyleDiamond.jsx so the blog card and the
    // app agree about what "signature gold" looks like. The derived name
    // survives as a tooltip and for screen readers.
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

    var foot = h("span", "pchq-foot");
    var creator = b.creator && b.creator.handle ? "@" + b.creator.handle : "Pro Clubs HQ";
    foot.appendChild(h("span", "pchq-by", creator));
    foot.appendChild(h("span", "pchq-stat", "♥ " + (b.loveCount || 0)));
    foot.appendChild(h("span", "pchq-stat", "⧉ " + (b.copyCount || 0) + " copies"));
    foot.appendChild(h("span", "pchq-cta", "Open in builder →"));

    anchor.appendChild(glow);
    anchor.appendChild(head);
    anchor.appendChild(grid);
    if (eq.childNodes.length) anchor.appendChild(eq);
    if (sigs.childNodes.length) anchor.appendChild(sigs);
    anchor.appendChild(foot);

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Mouse-reactive: the card tilts toward the cursor and a glow follows it.
    anchor.addEventListener("pointermove", function (e) {
      var r = anchor.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;   // 0..1
      var py = (e.clientY - r.top) / r.height;
      anchor.style.setProperty("--pchq-rx", ((0.5 - py) * 8).toFixed(2) + "deg");
      anchor.style.setProperty("--pchq-ry", ((px - 0.5) * 10).toFixed(2) + "deg");
      anchor.style.setProperty("--pchq-mx", (px * 100).toFixed(1) + "%");
      anchor.style.setProperty("--pchq-my", (py * 100).toFixed(1) + "%");
    });
    anchor.addEventListener("pointerleave", function () {
      anchor.style.setProperty("--pchq-rx", "0deg");
      anchor.style.setProperty("--pchq-ry", "0deg");
    });
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
