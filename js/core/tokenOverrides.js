/**
 * Token override engine — the part of the Style Guide that makes "Submit"
 * real instead of a preview.
 *
 * This app is static (no build step, no server, no database), so there's no
 * way for a browser to rewrite styles/tokens.css on disk. What it *can* do,
 * genuinely:
 *   1. Apply an edited token to `:root` via `style.setProperty`, which every
 *      component already reads from -- the whole live app re-themes at
 *      once, immediately, no reload.
 *   2. Persist the override set to localStorage and re-apply it the moment
 *      this script runs (before the app mounts), so a reload -- or another
 *      tab on the same browser -- keeps the customized theme instead of
 *      flashing back to the shipped default.
 *   3. Export the merged (defaults + overrides) set as a tokens.css-shaped
 *      file, the deliberate bridge from "I like this" to an actual source
 *      change -- that one step takes a person, since nothing in a static
 *      site can commit code on its own.
 */
(function (DA) {
  'use strict';

  var STORAGE_KEY = 'da-token-overrides';
  var root = document.documentElement;

  /** Current value of a token as the page actually computes it right now --
      the shipped default, or a previously-applied override, whichever is
      live. Never reads the registry for a value, only for its existence. */
  function currentValue(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  function readStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function writeStored(overrides) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch (e) {
      // Storage unavailable (private browsing, quota) -- the override still
      // applies for this page view, it just won't survive a reload.
    }
  }

  /** Sets every token in `overrides` on :root. Doesn't touch anything else. */
  function apply(overrides) {
    Object.keys(overrides || {}).forEach(function (name) {
      if (overrides[name] != null && overrides[name] !== '') {
        root.style.setProperty(name, overrides[name]);
      }
    });
  }

  /** Applies and persists in one step -- what Submit calls. */
  function commit(overrides) {
    var stored = readStored();
    Object.keys(overrides || {}).forEach(function (name) {
      stored[name] = overrides[name];
    });
    apply(stored);
    writeStored(stored);
    return stored;
  }

  /** Drops every override (or just the ones named) and reloads, so the page
      re-mounts against the shipped defaults with nothing stale left over
      in inline root styles. */
  function reset(names) {
    if (!names) {
      writeStored({});
    } else {
      var stored = readStored();
      names.forEach(function (name) { delete stored[name]; });
      writeStored(stored);
    }
    location.reload();
  }

  /** The full tokens.css :root block, defaults overlaid with any active
      overrides, grouped the same way the source file is -- the file this
      produces is meant to replace tokens.css's own :root block verbatim. */
  function exportCss() {
    var overrides = readStored();
    var lines = [
      '/* ==========================================================================',
      '   Digital Analyzer — Design Tokens',
      '   Exported from the Style Guide\'s Token Editor.',
      '   ========================================================================== */',
      '',
      ':root {'
    ];
    DA.designTokenGroups.forEach(function (group) {
      lines.push('  /* ---- ' + group + ' ---- */');
      DA.designTokens
        .filter(function (token) { return token.group === group; })
        .forEach(function (token) {
          var value = Object.prototype.hasOwnProperty.call(overrides, token.name)
            ? overrides[token.name]
            : currentValue(token.name);
          lines.push('  ' + token.name + ': ' + value + ';');
        });
      lines.push('');
    });
    lines.push('}');
    return lines.join('\n');
  }

  /** Triggers a download of exportCss()'s output -- no server round trip,
      just an in-browser Blob, same mechanism the rest of the product's
      "Download ..." links describe without actually wiring yet. */
  function downloadCss() {
    var blob = new Blob([exportCss()], { type: 'text/css' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'tokens.css';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  DA.tokenOverrides = {
    currentValue: currentValue,
    readStored: readStored,
    apply: apply,
    commit: commit,
    reset: reset,
    exportCss: exportCss,
    downloadCss: downloadCss
  };

  // Applied as soon as this script runs -- before main.js mounts anything --
  // so the first paint already reflects any saved customization instead of
  // showing the default theme for a moment first.
  apply(readStored());
})(window.DA);
