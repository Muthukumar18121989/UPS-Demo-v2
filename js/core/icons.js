/**
 * Icon set — stroke icons on a 24px grid so weight stays consistent.
 * Every icon is decorative; accessible names live on the control that owns it.
 */
(function (DA) {
  'use strict';

  var svg = DA.dom.svg;
  var STROKE =
    'fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round"';

  function bell(size) {
    return svg(
      '<path ' + STROKE + ' d="M18 8.5a6 6 0 1 0-12 0c0 5.2-1.5 6.8-2 7.5h16c-.5-.7-2-2.3-2-7.5Z"/>' +
      '<path ' + STROKE + ' d="M10 19a2.2 2.2 0 0 0 4 0"/>',
      { size: size || 22 }
    );
  }

  function search(size) {
    return svg(
      '<circle ' + STROKE + ' cx="11" cy="11" r="6.25"/>' +
      '<path ' + STROKE + ' d="m16 16 4 4"/>',
      { size: size || 18 }
    );
  }

  function chevronRight(size, className) {
    return svg('<path ' + STROKE + ' d="m9.5 5.5 6.5 6.5-6.5 6.5"/>', {
      size: size || 14,
      className: className || 'record-link__chevron'
    });
  }

  function chevronLeft(size, className) {
    return svg('<path ' + STROKE + ' d="M14.5 5.5 8 12l6.5 6.5"/>', {
      size: size || 14,
      className: className || ''
    });
  }

  function chevronDown(size, className) {
    return svg('<path ' + STROKE + ' d="m5.5 9 6.5 6.5L18.5 9"/>', {
      size: size || 18,
      className: className || ''
    });
  }

  function chevronUp(size, className) {
    return svg('<path ' + STROKE + ' d="M5.5 15 12 8.5 18.5 15"/>', {
      size: size || 18,
      className: className || ''
    });
  }

  function help(size) {
    return svg(
      '<circle ' + STROKE + ' cx="12" cy="12" r="8.5"/>' +
      '<path ' + STROKE + ' d="M9.7 9.4a2.35 2.35 0 1 1 2.9 2.65v1.4"/>' +
      '<circle cx="12.6" cy="16.4" r="0.95" fill="currentColor"/>',
      { size: size || 16 }
    );
  }

  function close(size) {
    return svg('<path ' + STROKE + ' d="m7 7 10 10M17 7 7 17"/>', { size: size || 14 });
  }

  function closeCircle(size) {
    return svg(
      '<circle ' + STROKE + ' cx="12" cy="12" r="8.5"/>' +
      '<path ' + STROKE + ' d="m9.2 9.2 5.6 5.6m0-5.6-5.6 5.6"/>',
      { size: size || 16 }
    );
  }

  function checkCircle(size) {
    return svg(
      '<circle cx="12" cy="12" r="9" fill="currentColor"/>' +
      '<path fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" ' +
      'stroke-linejoin="round" d="m8 12.2 2.7 2.7L16 9.6"/>',
      { size: size || 18 }
    );
  }

  function upload(size) {
    return svg(
      '<path ' + STROKE + ' d="M12 16V5.5m0 0L8.2 9.3M12 5.5l3.8 3.8"/>' +
      '<path ' + STROKE + ' d="M4.5 15v2.5A1.5 1.5 0 0 0 6 19h12a1.5 1.5 0 0 0 1.5-1.5V15"/>',
      { size: size || 22 }
    );
  }

  function download(size) {
    return svg(
      '<path ' + STROKE + ' d="M12 4.5v10m0 0-3.8-3.8M12 14.5l3.8-3.8"/>' +
      '<path ' + STROKE + ' d="M4.5 16v2A1.5 1.5 0 0 0 6 19.5h12A1.5 1.5 0 0 0 19.5 18v-2"/>',
      { size: size || 18 }
    );
  }

  function info(size) {
    return svg(
      '<circle cx="12" cy="12" r="9" fill="currentColor"/>' +
      '<path fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" ' +
      'd="M12 11v5.2"/>' +
      '<circle cx="12" cy="7.9" r="1.05" fill="#fff"/>',
      { size: size || 18 }
    );
  }

  function check(size, className) {
    return svg(
      '<path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" ' +
      'stroke-linejoin="round" d="m6 12.4 4 4 8-8.8"/>',
      { size: size || 16, className: className || '' }
    );
  }

  function box(size) {
    return svg(
      '<path ' + STROKE + ' d="M20.5 8.2v7.6a1.5 1.5 0 0 1-.78 1.32l-6.98 3.83a1.5 1.5 0 0 1-1.48 0l-6.98-3.83A1.5 1.5 0 0 1 3.5 15.8V8.2a1.5 1.5 0 0 1 .78-1.32l6.98-3.83a1.5 1.5 0 0 1 1.48 0l6.98 3.83A1.5 1.5 0 0 1 20.5 8.2Z"/>' +
      '<path ' + STROKE + ' d="m3.8 7.4 8.2 4.5 8.2-4.5M12 20.8v-8.9"/>',
      { size: size || 26 }
    );
  }

  function boxOff(size) {
    return svg(
      '<path ' + STROKE + ' d="M20.5 8.2v7.6a1.5 1.5 0 0 1-.78 1.32l-6.98 3.83a1.5 1.5 0 0 1-1.48 0l-6.98-3.83A1.5 1.5 0 0 1 3.5 15.8V8.2a1.5 1.5 0 0 1 .78-1.32l6.98-3.83a1.5 1.5 0 0 1 1.48 0l6.98 3.83A1.5 1.5 0 0 1 20.5 8.2Z"/>' +
      '<path ' + STROKE + ' d="m3.8 7.4 8.2 4.5 8.2-4.5M12 20.8v-8.9"/>' +
      '<path ' + STROKE + ' d="m3 3 18 18"/>',
      { size: size || 26 }
    );
  }

  function pencil(size) {
    return svg(
      '<path ' + STROKE + ' d="M4.5 19.5h3.2l9-9a2.26 2.26 0 0 0-3.2-3.2l-9 9Z"/>' +
      '<path ' + STROKE + ' d="m13.7 8.1 2.2 2.2"/>',
      { size: size || 13 }
    );
  }

  function trash(size) {
    return svg(
      '<path ' + STROKE + ' d="M4.8 6.5h14.4M9.5 6.5V4.8h5v1.7M6.6 6.5l.8 12.1a1.2 1.2 0 0 0 1.2 1.1h6.8a1.2 1.2 0 0 0 1.2-1.1l.8-12.1"/>',
      { size: size || 14 }
    );
  }

  function save(size) {
    return svg(
      '<path ' + STROKE + ' d="M5.5 4.5h10.2L19.5 8.3v11.2H5.5Z"/>' +
      '<path ' + STROKE + ' d="M8.5 4.5v5h7M8.5 19.5v-5h7v5"/>',
      { size: size || 15 }
    );
  }

  function refresh(size) {
    return svg(
      '<path ' + STROKE + ' d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/>' +
      '<path ' + STROKE + ' d="M19.8 4.2v4.3h-4.3"/>',
      { size: size || 15 }
    );
  }

  function filter(size) {
    return svg('<path ' + STROKE + ' d="M4.5 5.5h15l-5.9 6.8v5.4l-3.2 1.8v-7.2Z"/>', {
      size: size || 16
    });
  }

  function settings(size) {
    return svg(
      '<circle ' + STROKE + ' cx="12" cy="12" r="2.9"/>' +
      '<path ' + STROKE + ' d="M19.1 14.2a1.5 1.5 0 0 0 .3 1.65l.05.05a1.8 1.8 0 1 1-2.55 2.55l-.05-.05a1.5 1.5 0 0 0-1.65-.3 1.5 1.5 0 0 0-.9 1.37v.14a1.8 1.8 0 1 1-3.6 0v-.07a1.5 1.5 0 0 0-.98-1.37 1.5 1.5 0 0 0-1.65.3l-.05.05a1.8 1.8 0 1 1-2.55-2.55l.05-.05a1.5 1.5 0 0 0 .3-1.65 1.5 1.5 0 0 0-1.37-.9h-.14a1.8 1.8 0 1 1 0-3.6h.07a1.5 1.5 0 0 0 1.37-.98 1.5 1.5 0 0 0-.3-1.65l-.05-.05a1.8 1.8 0 1 1 2.55-2.55l.05.05a1.5 1.5 0 0 0 1.65.3h.07a1.5 1.5 0 0 0 .9-1.37v-.14a1.8 1.8 0 1 1 3.6 0v.07a1.5 1.5 0 0 0 .9 1.37 1.5 1.5 0 0 0 1.65-.3l.05-.05a1.8 1.8 0 1 1 2.55 2.55l-.05.05a1.5 1.5 0 0 0-.3 1.65v.07a1.5 1.5 0 0 0 1.37.9h.14a1.8 1.8 0 1 1 0 3.6h-.07a1.5 1.5 0 0 0-1.37.9Z"/>',
      { size: size || 14 }
    );
  }

  function plusCircle(size) {
    return svg(
      '<circle ' + STROKE + ' cx="12" cy="12" r="8.5"/>' +
      '<path ' + STROKE + ' d="M12 8.4v7.2M8.4 12h7.2"/>',
      { size: size || 18 }
    );
  }

  function file(size) {
    return svg(
      '<path ' + STROKE + ' d="M13.5 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8.5Z"/>' +
      '<path ' + STROKE + ' d="M13.5 3.5v5h5"/>',
      { size: size || 16 }
    );
  }

  function plus(size) {
    return svg('<path ' + STROKE + ' d="M12 5.5v13M5.5 12h13"/>', { size: size || 16 });
  }

  function inbox(size) {
    return svg(
      '<path ' + STROKE + ' d="M3.5 13.5h4l1.5 2.5h6l1.5-2.5h4"/>' +
      '<path ' + STROKE + ' d="M5.6 4.5h12.8l2.1 9v5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-5Z"/>',
      { size: size || 40 }
    );
  }

  /*
   * Key Scenario Drivers' per-metric icons -- ADV already had a natural
   * fit in `box` (shipping volume), so only the other 6 metrics needed a
   * new glyph: a discount %, a discount tag, stacked coins, a rising
   * trend line, a gauge (a ratio read at a glance) and a dollar figure.
   */
  function percent(size, className) {
    return svg(
      '<path ' + STROKE + ' d="M18 6 6 18"/>' +
      '<circle cx="7.5" cy="7.5" r="1.9" fill="currentColor"/>' +
      '<circle cx="16.5" cy="16.5" r="1.9" fill="currentColor"/>',
      { size: size || 18, className: className || '' }
    );
  }

  function tag(size, className) {
    return svg(
      '<path ' + STROKE +
      ' d="M11.7 4.5H6.8a2.3 2.3 0 0 0-2.3 2.3v4.9c0 .4.16.78.44 1.06l8.6 8.6a1.5 1.5 0 0 0 2.12 0l4.9-4.9a1.5 1.5 0 0 0 0-2.12l-8.6-8.6a1.5 1.5 0 0 0-1.06-.44Z"/>' +
      '<circle cx="8.3" cy="8.3" r="1.3" fill="currentColor"/>',
      { size: size || 18, className: className || '' }
    );
  }

  function coins(size, className) {
    return svg(
      '<circle ' + STROKE + ' cx="9" cy="9" r="5"/>' +
      '<circle ' + STROKE + ' cx="15.2" cy="15.2" r="5"/>',
      { size: size || 18, className: className || '' }
    );
  }

  function trendingUp(size, className) {
    return svg(
      '<path ' + STROKE + ' d="M4 16.5 9.8 10.7 13.2 14.1 20 7.3"/>' +
      '<path ' + STROKE + ' d="M14.6 7.3H20v5.4"/>',
      { size: size || 18, className: className || '' }
    );
  }

  function gauge(size, className) {
    return svg(
      '<path ' + STROKE + ' d="M4 16.5a8 8 0 0 1 16 0"/>' +
      '<path ' + STROKE + ' d="M12 16.5 15.3 11"/>' +
      '<circle cx="12" cy="16.5" r="1.3" fill="currentColor"/>',
      { size: size || 18, className: className || '' }
    );
  }

  function dollarCircle(size, className) {
    return svg(
      '<circle ' + STROKE + ' cx="12" cy="12" r="8.5"/>' +
      '<path ' + STROKE + ' d="M12 6.8v10.4"/>' +
      '<path ' + STROKE +
      ' d="M14.6 9.4c0-1.05-1.16-1.9-2.6-1.9s-2.6.85-2.6 1.9c0 2.5 5.2 1.15 5.2 3.65 0 1.05-1.16 1.9-2.6 1.9s-2.6-.85-2.6-1.9"/>',
      { size: size || 18, className: className || '' }
    );
  }

  /* A column-header sort affordance -- up chevron over down chevron,
     the same "unsorted, but sortable" glyph most data grids use. Purely
     decorative here (no column in this app actually sorts yet), matching
     the same convention Base/Zone's Incentive Amount header already set. */
  function sort(size, className) {
    return svg(
      '<path ' + STROKE + ' d="M6 9.5 9 6.5 12 9.5"/>' +
      '<path ' + STROKE + ' d="M6 12.5 9 15.5 12 12.5"/>',
      { size: size || 14, className: className || '' }
    );
  }

  /* Four squares in a 2x2 grid -- the "tile" half of a Tile view /
     Table view icon toggle. */
  function gridView(size, className) {
    return svg(
      '<rect ' + STROKE + ' x="3.5" y="3.5" width="7.5" height="7.5" rx="1.2"/>' +
      '<rect ' + STROKE + ' x="13" y="3.5" width="7.5" height="7.5" rx="1.2"/>' +
      '<rect ' + STROKE + ' x="3.5" y="13" width="7.5" height="7.5" rx="1.2"/>' +
      '<rect ' + STROKE + ' x="13" y="13" width="7.5" height="7.5" rx="1.2"/>',
      { size: size || 16, className: className || '' }
    );
  }

  /* A bordered grid with one row and one column divider -- the "table"
     half of the same toggle. */
  function tableViewIcon(size, className) {
    return svg(
      '<rect ' + STROKE + ' x="3.5" y="4.5" width="17" height="15" rx="1.5"/>' +
      '<path ' + STROKE + ' d="M3.5 9.7h17M9.3 9.7v9.8"/>',
      { size: size || 16, className: className || '' }
    );
  }

  /**
   * The real UPS shield mark (traced from the brand's own SVG, not the
   * hand-built approximation this replaced), scaled to the header's
   * previous 60px height at its native ~0.816 aspect ratio (39.4 x 48.3)
   * instead of being stretched into the old placeholder's 52 x 60 box --
   * see .app-header__logo in components.css for the matching width change.
   * The two brand colors (#341b14 / #ffb406 in the source file) are wired
   * to the same --color-brand-brown / --color-brand-shield tokens the old
   * mark used, so the shield still follows the Style Guide's live Token
   * Editor instead of carrying hardcoded colors of its own.
   */
  function upsShield() {
    var node = DA.dom.svg('', { viewBox: '0 0 39.4 48.3', size: 0 });
    node.setAttribute('width', '49');
    node.setAttribute('height', '60');
    node.innerHTML =
      '<path fill="var(--color-brand-brown)" d="M19.7 46.5c.4-.2 10.8-4.7 14.1-7.4 3.4-2.8 5.2-6.8 5.2-11.6V5l-.3-.1C30.4.4 20.1.7 19.6.7 19.2.7 8.9.4.6 4.9L.4 5v22.6c0 4.8 1.8 8.8 5.2 11.6 3.3 2.7 13.7 7.2 14.1 7.3"/>' +
      '<path fill="var(--color-brand-shield)" d="M19.7 47s-11-4.8-14.4-7.5C1.7 36.5 0 32.4 0 27.7V4.3C8.7-.4 19.7 0 19.7 0s11-.4 19.7 4.3v23.3c0 4.7-1.7 8.8-5.3 11.8-3.4 2.8-14.4 7.6-14.4 7.6M1.6 27.7c0 4.4 1.6 8 4.7 10.5 2.8 2.3 11.1 6 13.4 7 2.3-1 10.7-4.8 13.4-7 3.1-2.5 4.7-6.2 4.7-10.5v-23c-11.6-1.1-25.4-.5-36.2 9.5v13.5z"/>' +
      '<path fill="var(--color-brand-shield)" d="M30.8 24.4c1.5.9 2.1 1.5 2.2 2.6 0 1.2-.8 1.9-2.1 1.9-1.1 0-2.4-.6-3.3-1.4v3.2c1.1.6 2.4 1.1 3.8 1.1 3.4 0 5-2.4 5-4.6.1-2-.5-3.6-3.4-5.3-1.3-.8-2.3-1.3-2.3-2.5s1.1-1.7 2-1.7c1.2 0 2.4.7 3.1 1.4v-3c-.6-.5-1.9-1.2-3.8-1.1-2.3.1-4.7 1.7-4.7 4.5.1 1.9.7 3.3 3.5 4.9M19 31.6c.3.1.8.2 1.6.2 3.9 0 6.1-3.5 6.1-8.5 0-5.1-2.3-8.2-6.4-8.2-1.9 0-3.4.4-4.7 1.2v22.6H19v-7.3zM19 18c.3-.1.8-.3 1.2-.3 2 0 2.8 1.6 2.8 5.5 0 3.8-1 5.6-3 5.6-.5 0-.9-.1-1.1-.2V18zM8.5 31.8c2.1 0 3.9-.5 5.2-1.4V15.3h-3.5v13.1c-.4.3-.9.4-1.6.4-1.6 0-1.8-1.5-1.8-2.4V15.3H3.3v10.9c0 3.7 1.8 5.6 5.2 5.6"/>' +
      '<path fill="var(--color-brand-shield)" d="M31.8 45.3v2.3h.4v-.9h.1l.6.9h.5s-.6-.9-.7-1c.3-.1.5-.3.5-.6s-.2-.7-.8-.7h-.6zm.6.3c.3 0 .4.2.4.3 0 .2-.1.4-.5.4h-.1v-.7h.2z"/>' +
      '<path fill="var(--color-brand-shield)" d="M34 46.4c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5c.9 0 1.5.7 1.5 1.5m-1.5-1.9c-1 0-1.9.8-1.9 1.9 0 1 .8 1.9 1.9 1.9 1 0 1.9-.8 1.9-1.9 0-1-.9-1.9-1.9-1.9"/>';
    return node;
  }

  DA.icons = {
    bell: bell,
    search: search,
    chevronRight: chevronRight,
    chevronLeft: chevronLeft,
    chevronDown: chevronDown,
    chevronUp: chevronUp,
    help: help,
    close: close,
    closeCircle: closeCircle,
    checkCircle: checkCircle,
    upload: upload,
    download: download,
    info: info,
    check: check,
    pencil: pencil,
    trash: trash,
    save: save,
    refresh: refresh,
    filter: filter,
    box: box,
    boxOff: boxOff,
    settings: settings,
    plusCircle: plusCircle,
    file: file,
    plus: plus,
    inbox: inbox,
    percent: percent,
    tag: tag,
    coins: coins,
    trendingUp: trendingUp,
    gauge: gauge,
    dollarCircle: dollarCircle,
    sort: sort,
    gridView: gridView,
    tableViewIcon: tableViewIcon,
    upsShield: upsShield
  };
})(window.DA);
