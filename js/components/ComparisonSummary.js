/**
 * ComparisonSummary — the scenario comparison band on the Analyzer Packet
 * report. Revenue and Profit lead as hero cards with a from/to bar underneath
 * each; the remaining figures follow as a row of smaller tiles. Replaces the
 * plain comparison table with the two scenarios read side by side.
 */
(function (DA) {
  'use strict';

  var el = DA.dom.el;
  var num = DA.figures.toNumber;
  DA.components = DA.components || {};

  var HERO_FIELDS = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'profit', label: 'Profit' }
  ];

  var TILE_FIELDS = [
    { key: 'adv', label: 'ADV' },
    { key: 'baseFrtDisc', label: 'Base Frt Disc' },
    { key: 'totalDisc', label: 'Total Disc' },
    { key: 'rpp', label: 'RPP' },
    { key: 'or', label: 'OR' }
  ];

  // Base Frt Disc and Total Disc move in percentage points, not percent.
  var POINT_FIELDS = { baseFrtDisc: true, totalDisc: true };

  /** The recorded difference string, signed and re-shaped for its field. */
  function signedDelta(key, text) {
    if (text == null || text === '-') return null;
    var value = num(text);
    if (value == null) return null;
    var body = POINT_FIELDS[key] ? text.replace(/%\s*$/, ' pp') : text.replace(/\$\s*/, '$');
    return (value > 0 ? '+' : '') + body;
  }

  function deltaTag(key, text) {
    var value = num(text);
    if (value == null) return null;
    var isDown = value < 0;
    return el('span', {
      className: 'comparison-summary__delta ' +
        (isDown ? 'comparison-summary__delta--down' : 'comparison-summary__delta--up') +
        (POINT_FIELDS[key] ? ' comparison-summary__delta--muted' : ' comparison-summary__delta--accent')
    }, [
      isDown ? DA.icons.arrowDown(12) : DA.icons.arrowUp(12),
      el('span', { text: signedDelta(key, text) })
    ]);
  }

  /** One bar in a hero card's from/to pair; the excess over `other` is accented. */
  function bar(label, value, other, max, accented) {
    var safeMax = max || 1;
    var total = Math.min(Math.abs(value) / safeMax * 100, 100);
    var base = accented && value > other ? Math.min(Math.abs(other) / safeMax * 100, 100) : total;
    var extra = total - base;

    return el('div', { className: 'comparison-summary__bar-row' }, [
      el('span', { className: 'comparison-summary__bar-label', text: label }),
      el('div', { className: 'comparison-summary__bar-track' }, [
        el('div', {
          className: 'comparison-summary__bar-fill',
          style: { width: base + '%' }
        }),
        extra > 0
          ? el('div', {
              className: 'comparison-summary__bar-fill comparison-summary__bar-fill--accent',
              style: { width: extra + '%', left: base + '%' }
            })
          : null
      ])
    ]);
  }

  function heroCard(field, baseline, compare, difference) {
    var key = field.key;
    var fromText = baseline.figures[key];
    var fromNum = num(fromText) || 0;
    var deltaText = compare ? difference[key] : null;
    var deltaNum = num(deltaText);

    var valueLine = [el('span', { text: fromText == null ? '-' : fromText })];
    if (compare) {
      valueLine.push(el('span', { className: 'comparison-summary__hero-arrow', text: '→' }));
      valueLine.push(el('span', { text: compare.figures[key] == null ? '-' : compare.figures[key] }));
    }

    var children = [
      el('p', { className: 'comparison-summary__hero-label', text: field.label }),
      el('p', { className: 'comparison-summary__hero-values' }, valueLine)
    ];

    if (compare && deltaNum != null) {
      var pct = fromNum ? Math.abs(deltaNum / fromNum * 100) : null;
      var line = [deltaTag(key, deltaText)];
      if (pct != null) {
        line.push(el('span', {
          className: 'comparison-summary__hero-percent',
          text: ' (' + (deltaNum >= 0 ? '+' : '-') + pct.toFixed(1) + '%)'
        }));
      }
      children.push(el('p', { className: 'comparison-summary__hero-delta-line' }, line));

      var toNum = num(compare.figures[key]) || 0;
      var max = Math.max(Math.abs(fromNum), Math.abs(toNum)) || 1;
      children.push(el('div', { className: 'comparison-summary__hero-bars' }, [
        bar(baseline.name, fromNum, toNum, max, false),
        bar(compare.name, toNum, fromNum, max, true)
      ]));
    }

    return el('div', { className: 'comparison-summary__hero' }, children);
  }

  function tile(field, baseline, compare, difference) {
    var key = field.key;
    var fromText = baseline.figures[key];

    var children = [
      el('p', { className: 'comparison-summary__tile-label', text: field.label }),
      el('p', { className: 'comparison-summary__tile-value', text: fromText == null ? '-' : fromText })
    ];

    if (compare) {
      var toLine = [
        el('span', { className: 'comparison-summary__tile-arrow', text: '→' }),
        el('span', { text: compare.figures[key] == null ? '-' : compare.figures[key] })
      ];
      var tag = deltaTag(key, difference[key]);
      if (tag) toLine.push(tag);
      children.push(el('p', { className: 'comparison-summary__tile-delta-line' }, toLine));
    }

    return el('div', { className: 'comparison-summary__tile' }, children);
  }

  /**
   * @param {Object} options.baseline  { name, figures } — always required.
   * @param {Object} [options.compare] { name, figures } — omitted while only
   *   one scenario is selected; cards then show the baseline figure alone.
   * @param {Object} [options.difference] figures keyed the same as `figures`.
   */
  DA.components.ComparisonSummary = function ComparisonSummary(options) {
    options = options || {};
    var baseline = options.baseline;
    var compare = options.compare || null;
    var difference = options.difference || {};

    if (!baseline) {
      return el('div', { className: 'comparison-summary' }, [
        el('p', { className: 'table-empty', text: 'Choose scenarios to compare.' })
      ]);
    }

    return el('div', { className: 'comparison-summary' }, [
      el('div', { className: 'comparison-summary__heroes' },
        HERO_FIELDS.map(function (field) { return heroCard(field, baseline, compare, difference); })
      ),
      el('div', { className: 'comparison-summary__tiles' },
        TILE_FIELDS.map(function (field) { return tile(field, baseline, compare, difference); })
      )
    ]);
  };
})(window.DA);
