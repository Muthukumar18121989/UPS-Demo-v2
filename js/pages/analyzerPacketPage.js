/**
 * Analyzer Packet — the report built from the packet's scenarios.
 *
 * Reached from "Proceed to Analyzer Packet". The comparison selector chooses
 * which scenarios the report covers; the tabs below split it into Analyzer,
 * Pricing Terms, Other Terms, Adjustments and Rate Charts. Analyzer holds its
 * own sub-tabs: Comparisons, Services, Charges, Accounts, Cost Details,
 * Zones and Weight & Cube.
 *
 * Comparisons, Services, Charges, Cost Details and Zones are documented by
 * reference screens. Accounts and Weight & Cube are built from the same
 * conventions (is-rowhead label columns, a breakdown that always sums back
 * to its parent) rather than a reference screenshot of this exact packet's
 * data. Rate Charts, Adjustments and Other Terms > Dim Divisor are now built
 * from their own reference screens too, transcribed as flat (non-expanding)
 * tables since none of them open onto a breakdown. Other Terms > Minimums
 * still renders the product's empty table state -- not built yet.
 */
(function (DA) {
  'use strict';

  var el = DA.dom.el;
  var C = DA.components;

  DA.pages = DA.pages || {};

  /** Right-aligned numeric column; `link` makes the figure a drill-down. */
  function numeric(key, label, options) {
    options = options || {};
    return {
      key: key,
      label: label,
      width: options.width || '110px',
      className: 'is-numeric is-end',
      headerClassName: 'is-end',
      render: options.link
        ? function (row) {
            return el('a', {
              text: row[key] == null ? '-' : row[key],
              attrs: { href: '#detail', 'aria-label': label + ' ' + row[key] }
            });
          }
        : function (row) { return row[key] == null ? '-' : row[key]; }
    };
  }

  /**
   * The one-line expansion behind each comparison metric's abbreviation --
   * shown as a native tooltip in both comparison views, keyed by the same
   * column keys DRIVER_KEYS uses.
   */
  var METRIC_DESCRIPTIONS = {
    adv: 'Average Daily Volume',
    baseFrtDisc: 'Base Freight Discount excluding Accessorials',
    totalDisc: 'Total Discount including Accessorials',
    rpp: 'Net Revenue per Piece',
    or: 'Operating Ratio',
    revenue: 'Total Net Revenue',
    profit: 'Net Profit after Cost'
  };

  /**
   * A distinct icon per metric for Key Scenario Drivers' corner info
   * button -- every card showed the same generic "?" regardless of which
   * metric it was, keyed by the same column keys METRIC_DESCRIPTIONS is.
   */
  var METRIC_ICONS = {
    adv: DA.icons.box,
    baseFrtDisc: DA.icons.percent,
    totalDisc: DA.icons.tag,
    rpp: DA.icons.coins,
    or: DA.icons.gauge,
    revenue: DA.icons.trendingUp,
    profit: DA.icons.dollarCircle
  };

  /** A figure with an inline edit affordance -- the Adjustments dollar cell. */
  function editableCell(value) {
    return el('span', { className: 'cell-value' }, [
      el('span', { text: value }),
      el('button', {
        className: 'icon-action u-tap-target',
        attrs: { type: 'button', 'aria-label': 'Edit ' + value }
      }, [DA.icons.pencil(13)])
    ]);
  }

  function emptyView(label) {
    return function () {
      return el('div', { className: 'card' }, [
        C.DataTable({
          caption: label,
          embedded: true,
          headerTone: 'warm',
          columns: [{ key: 'name', label: label }],
          rows: [],
          emptyState: el('p', { className: 'table-empty', text: 'No data available.' })
        })
      ]);
    };
  }

  DA.pages.AnalyzerPacketPage = function AnalyzerPacketPage(options) {
    options = options || {};
    var packet = options.packet || {};
    var customer = packet.customerName || '-';
    var scenarios = packet.scenarios || [];

    function withCustomer(text) {
      return String(text).replace('{customer}', customer);
    }

    function asOptions(values) {
      return values.map(function (value) { return { value: value, label: value }; });
    }

    /** The customer's accounts, as the bid and account pickers list them. */
    function accountOptions() {
      return DA.data.filterOptions.accountSuffix.map(function (suffix) {
        return { value: customer + ' ' + suffix, label: customer + ' ' + suffix };
      });
    }

    /* ---- Comparison selector --------------------------------------------- */

    // The baseline scenario is always part of a comparison; the rest are opt-in.
    var chosen = scenarios.slice(0, 1).map(function (scenario) { return scenario.name; });
    var pending = chosen.slice();
    var comparisonBand = el('section', { className: 'panel panel--auto' });

    var comparisonSelector = C.Dropdown({
      label: 'Comparison View',
      value: chosen.join(', '),
      content: [
        el('div', {}, scenarios.map(function (scenario) {
          return el('div', { className: 'dropdown__option' }, [
            C.Checkbox({
              checked: pending.indexOf(scenario.name) !== -1,
              label: scenario.name,
              onChange: function (checked) {
                var at = pending.indexOf(scenario.name);
                if (checked && at === -1) pending.push(scenario.name);
                if (!checked && at !== -1) pending.splice(at, 1);
              }
            })
          ]);
        })),
        el('div', { className: 'dropdown__footer' }, [
          C.Button({
            label: 'Apply',
            variant: 'outline',
            shape: 'pill',
            onClick: function () {
              chosen = pending.slice();
              renderComparisonView();
              comparisonSelector.setValue(chosen.join(', '));
              comparisonSelector.close();
            }
          })
        ])
      ]
    });

    /**
     * One row per chosen scenario, padded to two, then their difference.
     * A recorded difference is used when there is one; otherwise it is derived
     * from the figures shown, which can land a unit off where those are
     * rounded for display.
     */
    function comparisonRows() {
      var figures = DA.data.scenarioFigures;
      var keys = DA.data.comparisonKeys;
      var picked = scenarios.filter(function (scenario) {
        return chosen.indexOf(scenario.name) !== -1;
      });

      var rows = picked.map(function (scenario) {
        var values = figures[scenario.name] || {};
        var row = { scenario: scenario.name };
        keys.forEach(function (key) { row[key] = values[key]; });
        return row;
      });

      while (rows.length < 2) rows.push({ scenario: '-' });

      var difference = { scenario: 'Change', difference: true };
      if (picked.length === 2) {
        var a = figures[picked[0].name] || {};
        var b = figures[picked[1].name] || {};
        var recorded = DA.data.scenarioDifferences[picked[0].name + '|' + picked[1].name];
        keys.forEach(function (key) {
          difference[key] = recorded ? recorded[key] : DA.figures.difference(a[key], b[key]);
        });
      }
      rows.push(difference);
      return rows;
    }

    /** Up / down / flat, from a figure that may carry $, %, commas or a sign. */
    function deltaDirection(value) {
      var n = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      if (isNaN(n) || n === 0) return 'flat';
      return n > 0 ? 'up' : 'down';
    }

    /**
     * An arrow + green/red span for a difference figure -- shared by the
     * Tile view's driverCard() (its own "Scenario impact" line) and the
     * Table view's renderComparisonCards() (its Change row), reusing
     * driverCard()'s own col-driver-card__delta styling rather than a
     * one-off pair just for the Scenario comparison view.
     */
    function comparisonDelta(value) {
      var dir = deltaDirection(value);
      return el('span', { className: 'col-driver-card__delta col-driver-card__delta--' + dir }, [
        dir === 'up' ? DA.icons.chevronUp(12) : dir === 'down' ? DA.icons.chevronDown(12) : null,
        el('span', { text: String(value) })
      ]);
    }

    /** A stored delta's own sign, made explicit -- "27.2" reads as "+27.2". */
    function signed(text) {
      var n = DA.figures.toNumber(text);
      if (n == null || n <= 0) return String(text);
      return '+' + text;
    }

    /** A percentage-shaped delta reads as a point change, not a percent of
        itself -- "-0.4%" becomes "-0.4 pp" wherever it's shown as a change. */
    function asPointChange(text) {
      var s = String(text);
      return /%$/.test(s) ? s.replace(/%$/, ' pp') : s;
    }

    // Same order the comparison table's own columns use (comparisonKeys),
    // shared by both comparison views (Tile and Table).
    var DRIVER_KEYS = [
      { key: 'adv', label: 'ADV' },
      { key: 'baseFrtDisc', label: 'Base Frt Disc' },
      { key: 'totalDisc', label: 'Total Disc' },
      { key: 'rpp', label: 'RPP' },
      { key: 'revenue', label: 'Revenue' },
      { key: 'or', label: 'OR' },
      { key: 'profit', label: 'Profit' }
    ];

    /**
     * Tile view: the comparison read as always-visible cards instead of a
     * table -- one Key Scenario Drivers grid covers all 7 metrics
     * (Revenue/Profit included), all seven in a single row.
     */
    function renderImpactCards() {
      var rows = comparisonRows();
      var current = rows[0] || {};
      var scenario = rows[1] || {};
      var change = rows[rows.length - 1] || {};
      var hasScenario = scenario.scenario && scenario.scenario !== '-';

      if (!hasScenario) {
        DA.dom.clear(comparisonBand).appendChild(
          C.Alert({ plain: true, message: 'Add a scenario to the comparison to see its impact.' })
        );
        return;
      }

      function driverCard(key, label) {
        var card = el('div', { className: 'driver-card' });
        var dir = deltaDirection(change[key]);
        // The corner used to repeat the same up/down chevron the Scenario
        // impact line already shows below -- replaced with an info button
        // carrying the metric's own icon (not the generic "?" HelpButton
        // otherwise uses) and its description as the tooltip, so the
        // corner both reads as "this card" at a glance and adds
        // information instead of repeating the arrow.
        var iconFn = METRIC_ICONS[key] || DA.icons.info;
        card.appendChild(el('div', { className: 'driver-card__head' }, [
          el('p', { className: 'col-driver-card__title', style: { margin: 0 }, text: label }),
          METRIC_DESCRIPTIONS[key]
            ? el('button', {
                className: 'help-button u-tap-target',
                attrs: { type: 'button', 'aria-label': METRIC_DESCRIPTIONS[key], title: METRIC_DESCRIPTIONS[key] }
              }, [iconFn(18)])
            : null
        ]));
        card.appendChild(el('div', { className: 'col-driver-card__flow' }, [
          el('div', { className: 'col-driver-card__step' }, [
            el('span', { className: 'col-driver-card__scen', text: current.scenario }),
            el('span', { className: 'col-driver-card__val', text: current[key] == null ? '-' : DA.figures.compact(current[key]) })
          ]),
          el('span', { className: 'col-driver-card__arrow', text: '→' }),
          el('div', { className: 'col-driver-card__step' }, [
            el('span', { className: 'col-driver-card__scen', text: scenario.scenario }),
            el('span', { className: 'col-driver-card__val', text: scenario[key] == null ? '-' : DA.figures.compact(scenario[key]) })
          ])
        ]));
        var delta = change[key];
        if (delta != null && delta !== '-') {
          card.appendChild(el('div', { className: 'col-driver-card__impact' }, [
            el('span', { className: 'col-driver-card__delta col-driver-card__delta--' + dir }, [
              dir === 'down' ? DA.icons.chevronDown(12) : DA.icons.chevronUp(12),
              el('span', { text: signed(asPointChange(delta)) })
            ]),
            el('span', { className: 'col-driver-card__impact-label', text: 'Scenario impact' })
          ]));
        }
        return card;
      }

      DA.dom.clear(comparisonBand).appendChild(el('div', { className: 'impact-cards-panel' }, [
        el('p', { className: 'impact-section-title', text: 'Key Scenario Drivers' }),
        el('div', { className: 'driver-cards-grid' },
          DRIVER_KEYS.map(function (item) { return driverCard(item.key, item.label); }))
      ]));
    }

    /**
     * Table view: a card-per-row layout for the same comparison -- one
     * row per scenario as its own bordered card on a white surface,
     * instead of a plain grid table, so it can carry the row hover state
     * below. No row is singled out permanently; the gold outline is a
     * hover state any row picks up, not a fixed marker on Current.
     * Metric columns carry the same METRIC_ICONS glyph the Tile view
     * uses for that metric. Metric headers and values are right-aligned
     * (numbers read right-to-left for comparison); the leading
     * "Scenario" column stays left-aligned since it's a row label, not a
     * figure. No sort affordance -- nothing in this product actually
     * sorts yet, and the decorative sort glyph this column header used
     * to carry was dropped as noise rather than left in as a false
     * promise.
     */
    function renderComparisonCards() {
      var rows = comparisonRows();

      function headerCell(label, isFirst, iconFn) {
        return el('div', {
          className: 'comparison-cards__header-cell' + (isFirst ? '' : ' comparison-cards__header-cell--metric'),
          attrs: { role: 'columnheader' }
        }, [
          iconFn ? iconFn(13) : null,
          el('span', { text: label })
        ]);
      }

      var header = el('div', {
        className: 'comparison-cards__header',
        attrs: { role: 'row' }
      }, [
        headerCell('Scenario', true, null)
      ].concat(DRIVER_KEYS.map(function (item) {
        return headerCell(item.label, false, METRIC_ICONS[item.key]);
      })));

      var cards = rows.map(function (row) {
        return el('div', {
          className: 'comparison-card',
          attrs: { role: 'row' }
        }, [
          el('div', { className: 'comparison-card__field comparison-card__field--scenario', attrs: { role: 'cell' } }, [
            el('span', { text: row.scenario })
          ])
        ].concat(DRIVER_KEYS.map(function (item) {
          var value = row[item.key];
          var content = row.difference && value != null && value !== '-'
            ? comparisonDelta(value)
            : el('span', { text: value == null ? '-' : String(value) });
          return el('div', { className: 'comparison-card__field comparison-card__field--metric', attrs: { role: 'cell' } }, [content]);
        })));
      });

      DA.dom.clear(comparisonBand).appendChild(
        el('div', {
          className: 'comparison-cards scroll-area',
          attrs: { role: 'table', 'aria-label': 'Scenario comparison' }
        }, [header].concat(cards))
      );
    }

    // Table view is the default -- the fuller, more scannable read of the
    // comparison; Tile view is the alternate for someone who wants each
    // metric called out as its own card instead.
    var comparisonOption = 'table';

    function renderComparisonView() {
      if (comparisonOption === 'tile') renderImpactCards();
      else renderComparisonCards();
    }

    var comparisonOptionSwitch = C.SegmentedControl({
      ariaLabel: 'Scenario comparison view',
      value: comparisonOption,
      items: [
        { value: 'tile', label: 'Tile view' },
        { value: 'table', label: 'Table view' }
      ],
      onChange: function (value) {
        comparisonOption = value;
        renderComparisonView();
      }
    });

    renderComparisonView();

    /**
     * The header (title + view switch) and the band it controls collapse
     * away together -- with the band hidden, the switch has nothing left
     * to switch between, so it goes with it rather than sitting there
     * doing nothing. Freeing this whole block gives Analyzer / Pricing
     * Terms / Other Terms / Adjustments / Rate Charts the full page
     * height below the filters instead of losing a fixed chunk of it to
     * the comparison by default.
     */
    var comparisonCollapsible = el('div', {}, [
      el('div', { className: 'comparison-header' }, [
        el('h3', { className: 'comparison-header__title', text: 'Scenario Comparison' }),
        comparisonOptionSwitch
      ]),
      comparisonBand
    ]);

    var comparisonVisibilityToggle = C.Toggle({
      checked: true,
      label: 'Show Scenario Comparison',
      onChange: function (checked) {
        comparisonCollapsible.hidden = !checked;
      }
    });

    /* ---- Summary tab ------------------------------------------------------ */

    function summaryColumns() {
      return [
        {
          key: 'label',
          label: 'Cost Basis: FA',
          width: '150px',
          className: 'is-rowhead',
          render: function (row) { return withCustomer(row.label); }
        },
        numeric('adv', 'ADV', { link: true, width: '110px' }),
        numeric('baseFrt', 'Base Frt', { link: true, width: '105px' }),
        numeric('totalDisc', 'Total Disc', { link: true, width: '110px' }),
        numeric('rpp', 'RPP', { link: true, width: '110px' }),
        numeric('annRev', 'Ann Rev', { link: true, width: '140px' })
      ];
    }

    /**
     * Side-by-side scenario summaries share the same column layout, but not
     * necessarily the same rows -- a scenario carrying non-incented revenue
     * (Unincented PLD) adds a top-level row the others don't have, which
     * shifted every row below it out of alignment when this matched by
     * position. Matches by the row-header cell's own label text instead, so
     * "1DA" finds "1DA" in every other panel regardless of what rows come
     * before it or how deep the tree is expanded there. Assumes a label is
     * unique within its own table, true for this single-account demo data;
     * a second account sharing a service code's label would need a richer
     * key than text.
     */
    function summaryComparisonSync() {
      var panels = []; // { viewport, table }
      var enabled = false;
      var suppressScroll = false;

      function clearHighlights(exceptTable) {
        panels.forEach(function (p) {
          if (p.table === exceptTable) return;
          Array.prototype.forEach.call(
            p.table.querySelectorAll('.is-sync-highlight'),
            function (cell) { cell.classList.remove('is-sync-highlight'); }
          );
        });
      }

      function register(viewport) {
        var table = viewport.querySelector('table');
        if (!table) return;
        var entry = { viewport: viewport, table: table };
        panels.push(entry);

        viewport.addEventListener('scroll', function () {
          if (!enabled || suppressScroll) return;
          suppressScroll = true;
          panels.forEach(function (p) {
            if (p !== entry) p.viewport.scrollLeft = viewport.scrollLeft;
          });
          suppressScroll = false;
        });

        table.addEventListener('mouseover', function (event) {
          if (!enabled) return;
          var cell = event.target.closest('td');
          if (!cell || !table.tBodies[0]) return;
          var row = cell.parentElement;
          var cellIndex = Array.prototype.indexOf.call(row.cells, cell);
          var rowHead = row.querySelector('.is-rowhead');
          var rowKey = rowHead && rowHead.textContent.trim();
          if (!rowKey) return;
          panels.forEach(function (p) {
            if (p === entry || !p.table.tBodies[0]) return;
            var otherRow = Array.prototype.find.call(p.table.tBodies[0].rows, function (candidate) {
              var candidateHead = candidate.querySelector('.is-rowhead');
              return candidateHead && candidateHead.textContent.trim() === rowKey;
            });
            var otherCell = otherRow && otherRow.cells[cellIndex];
            if (otherCell) otherCell.classList.add('is-sync-highlight');
          });
        });

        table.addEventListener('mouseout', function (event) {
          if (!enabled || !event.target.closest('td')) return;
          clearHighlights(table);
        });
      }

      var toggle = C.Toggle({
        checked: enabled,
        label: 'Sync scroll & highlight across scenarios',
        onChange: function (checked) {
          enabled = checked;
          if (!checked) clearHighlights(null);
        }
      });

      return { register: register, toggle: toggle };
    }

    function summaryView() {
      var trees = DA.data.packetSummaryTrees;
      var sync = summaryComparisonSync();

      var grid = el('div', { className: 'comparison-grid' },
        scenarios.map(function (scenario) {
          var rows = trees[scenario.name] || trees.Current;
          var table = C.DataTable({
            caption: scenario.name + ' summary',
            embedded: true,
            headerTone: 'warm',
            expandKey: 'label',
            getChildren: function (row) { return row.children; },
            columns: summaryColumns(),
            rows: rows
          });
          sync.register(table);
          return C.Accordion({
            title: scenario.name,
            expanded: true,
            className: 'accordion--filled',
            content: [table]
          });
        })
      );

      return el('div', {}, [
        el('div', { className: 'comparison-sync-toggle' }, [sync.toggle]),
        grid
      ]);
    }

    /* ---- Shipping Profiles tab -------------------------------------------- */

    function profileFilters() {
      return el('div', { className: 'card' }, [
        el('div', { className: 'view-filters' }, [
          el('div', { className: 'view-filters__field' }, [
            C.SelectField({
              label: 'Choose Scenario',
              value: scenarios[0] && scenarios[0].name,
              options: scenarios.map(function (scenario) {
                return { value: scenario.name, label: scenario.name };
              })
            })
          ]),
          el('span', { className: 'view-filters__divider' }),
          el('div', { className: 'view-filters__field' }, [
            C.SelectField({
              label: 'Account',
              value: customer + ' MAIN',
              options: accountOptions()
            })
          ]),
          C.Button({ label: 'Filters', variant: 'ghost', icon: DA.icons.filter(16) })
        ])
      ]);
    }

    /** The lane key every shipping profile view opens with: Movement, Mode and
     * (the raw) Core Service joined into one Core Service label column. */
    function profileKeyColumns() {
      return [
        {
          key: 'coreService',
          label: 'Core Service',
          width: '220px',
          className: 'is-rowhead',
          render: function (row) { return [row.movement, row.mode, row.service].join('-'); }
        },
        numeric('zone', 'Zone', { width: '85px' }),
        numeric('lane', 'Lane', { width: '85px' })
      ];
    }

    function profileTable(options) {
      return el('div', {}, [
        profileFilters(),
        el('div', { className: 'card' }, [
          C.DataTable({
            caption: options.caption,
            embedded: true,
            headerTone: 'warm',
            tinted: true,
            expandKey: 'coreService',
            // A lane opens onto the zones it shipped in.
            getChildren: function (row) {
              if (row.zone !== '-') return null;
              return DA.data.zoneBreakdown(row, 'service', DA.data.additive[options.additive]);
            },
            columns: profileKeyColumns().concat(options.columns),
            rows: options.rows
          })
        ])
      ]);
    }

    /** Filter row for the pricing term views. */
    function pricingFilters() {
      return el('div', { className: 'card' }, [
        el('div', { className: 'view-filters' }, [
          el('div', { className: 'view-filters__field' }, [
            C.SelectField({
              label: 'Choose Scenario',
              value: scenarios[scenarios.length - 1] && scenarios[scenarios.length - 1].name,
              options: scenarios.map(function (scenario) {
                return { value: scenario.name, label: scenario.name };
              })
            })
          ]),
          el('div', { className: 'view-filters__field' }, [
            C.SelectField({
              label: 'Choose Bid',
              value: customer + ' MAIN',
              options: accountOptions()
            })
          ]),
          C.Button({
            label: 'Reset',
            variant: 'ghost',
            icon: DA.icons.refresh(15),
            iconPosition: 'end'
          }),
          el('span', { className: 'view-filters__divider' }),
          C.Button({
            label: 'Define Bid Structure',
            variant: 'ghost',
            icon: DA.icons.chevronRight(14, ''),
            iconPosition: 'end'
          })
        ])
      ]);
    }

    function costView() {
      return profileTable({
        caption: 'Shipping profile cost',
        additive: 'cost',
        rows: DA.data.shippingProfileCost,
        columns: [
          numeric('volume', 'Volume', { link: true, width: '110px' }),
          numeric('adv', 'ADV', { link: true, width: '100px' }),
          numeric('pps', 'PPS', { link: true, width: '80px' }),
          numeric('weightPiece', 'Weight/ Piece', { link: true, width: '120px' }),
          numeric('avgCube', 'Avg Cube', { link: true, width: '105px' }),
          numeric('avgCubeFactor', 'Avg Cube Factor', { link: true, width: '145px' }),
          numeric('puDens', 'PU Dens', { link: true, width: '105px' }),
          numeric('dlDens', 'DL Dens', { link: true, width: '105px' }),
          numeric('pu', 'PU', { link: true, width: '90px' }),
          numeric('ls', 'LS', { link: true, width: '90px' }),
          numeric('cs', 'CS', { link: true, width: '90px' }),
          numeric('ar', 'AR', { link: true, width: '90px' }),
          numeric('jf', 'JF', { link: true, width: '95px' }),
          numeric('gf', 'GF', { link: true, width: '90px' }),
          numeric('br', 'BR', { link: true, width: '90px' }),
          numeric('pd', 'PD', { link: true, width: '90px' }),
          numeric('dl', 'DL', { link: true, width: '90px' }),
          numeric('no', 'NO', { link: true, width: '90px' }),
          numeric('oth', 'OTH', { link: true, width: '95px' }),
          numeric('totalFreightCost', 'Total Freight Cost', { link: true, width: '160px' }),
          numeric('costAdj', 'Cost Adj', { width: '105px' }),
          numeric('newCost', 'New Cost', { link: true, width: '115px' })
        ]
      });
    }

    function zoneView() {
      return profileTable({
        caption: 'Shipping profile zones',
        additive: 'zone',
        rows: DA.data.shippingProfileZone,
        columns: [
          numeric('volume', 'Volume', { link: true, width: '110px' }),
          numeric('adv', 'ADV', { link: true, width: '100px' }),
          numeric('pps', 'PPS', { link: true, width: '80px' }),
          numeric('weightPiece', 'Weight/Piece', { link: true, width: '125px' }),
          numeric('freightGrossSpent', 'Freight Gross Spent', { link: true, width: '175px' }),
          numeric('freightDiscount', 'Freight Discount (%)', { link: true, width: '175px' }),
          numeric('freightRpp', 'Freight RPP', { link: true, width: '125px' }),
          numeric('freightNetSpent', 'Freight Net Spent', { link: true, width: '165px' }),
          numeric('freightProfit', 'Freight Profit ($)', { link: true, width: '160px' }),
          numeric('freightOr', 'Freight OR', { link: true, width: '120px' })
        ]
      });
    }

    function accessorialView() {
      function labelColumn(key, label, width, spanRepeats) {
        return {
          key: key,
          label: label,
          width: width || '135px',
          className: 'is-rowhead',
          spanRepeats: spanRepeats
        };
      }

      return el('div', {}, [
        profileFilters(),
        el('div', { className: 'card' }, [
          C.DataTable({
            caption: 'Accessorial charges',
            embedded: true,
            headerTone: 'warm',
            tinted: true,
            expandKey: 'detail',
            getChildren: function (row) { return row.children; },
            columns: [
              // Accessorial Type and Group repeat the same value down every
              // row a charge breaks into -- the children carry it blank
              // rather than restate it, so it reads as one merged field.
              labelColumn('type', 'Accessorial Type', null, true),
              labelColumn('group', 'Group', null, true),
              labelColumn('detail', 'Detail', '235px'),
              numeric('totalUnits', 'Total Units', { link: true, width: '120px' }),
              numeric('pctTotalVolume', '% Total Volume', { link: true, width: '150px' }),
              numeric('adu', 'ADU', { link: true, width: '110px' }),
              numeric('grossRevenue', 'Gross Revenue', { link: true, width: '150px' }),
              numeric('netRevenue', 'Net Revenue', { link: true, width: '145px' }),
              numeric('discount', 'Discount', { link: true, width: '110px' })
            ],
            rows: DA.data.shippingProfileAccessorial
          })
        ])
      ]);
    }

    function serviceView() {
      return el('div', {}, [
        profileFilters(),
        el('div', { className: 'card' }, [
          C.DataTable({
            caption: 'Shipping profile services',
            embedded: true,
            headerTone: 'warm',
            tinted: true,
            expandKey: 'service',
            getChildren: function (row) {
              return DA.data.zoneBreakdown(row, 'service', DA.data.additive.service);
            },
            columns: [
              { key: 'service', label: 'Core Service', width: '250px', className: 'is-rowhead' },
              numeric('volume', 'Volume', { link: true, width: '95px' }),
              numeric('adv', 'ADV', { link: true, width: '80px' }),
              numeric('avgZone', 'Avg Zone', { link: true, width: '100px' }),
              numeric('billableWt', 'Billable Wt', { link: true, width: '105px' }),
              numeric('pps', 'PPS', { link: true, width: '80px' }),
              numeric('baseGrossRev', 'Base Gross Rev', { link: true, width: '135px' }),
              numeric('baseNetRev', 'Base Net Rev', { link: true, width: '125px' }),
              numeric('disc', 'Disc', { width: '85px' }),
              numeric('baseRpp', 'Base RPP', { link: true, width: '105px' }),
              numeric('baseProfit', 'Base Profit', { link: true, width: '110px' }),
              numeric('baseOr', 'Base OR', { width: '95px' })
            ],
            rows: DA.data.packetServices
          })
        ])
      ]);
    }

    function accountsView() {
      function labelColumn(key, label, width, render, spanRepeats) {
        return {
          key: key,
          label: label,
          width: width || '160px',
          className: 'is-rowhead',
          render: render,
          spanRepeats: spanRepeats
        };
      }

      return el('div', {}, [
        profileFilters(),
        el('div', { className: 'card' }, [
          C.DataTable({
            caption: 'Accounts',
            embedded: true,
            headerTone: 'warm',
            tinted: true,
            expandKey: 'accountNumber',
            // Parent, Sub Parent and Account Number together identify the
            // record -- frozen as a group, the same treatment Movement/
            // Mode/Core Service gets.
            freezeColumns: 3,
            getChildren: function (row) { return row.children; },
            columns: [
              // Parent and Sub Parent repeat down every account under
              // them, left blank on the children the same way Accessorial
              // Type/Group are -- one merged field, not a fresh blank cell.
              labelColumn('parent', 'Parent', '170px', function (row) {
                return row.parent ? withCustomer(row.parent) : '';
              }, true),
              labelColumn('subParent', 'Sub Parent', '150px', null, true),
              labelColumn('accountNumber', 'Account Number', '170px'),
              numeric('volume', 'Volume', { link: true, width: '110px' }),
              numeric('adv', 'ADV', { link: true, width: '100px' }),
              numeric('zone', 'Zone', { link: true, width: '90px' })
            ],
            rows: DA.data.packetAccounts
          })
        ])
      ]);
    }

    function weightCubeView() {
      return el('div', {}, [
        profileFilters(),
        el('div', { className: 'card' }, [
          C.DataTable({
            caption: 'Weight and cube',
            embedded: true,
            headerTone: 'warm',
            tinted: true,
            expandKey: 'service',
            // A service opens onto the billable weight tiers behind it.
            getChildren: function (row) {
              return DA.data.weightBreakdown(row, 'service', DA.data.additive.service);
            },
            columns: [
              { key: 'service', label: 'Core Service', width: '220px', className: 'is-rowhead' },
              { key: 'billable', label: 'Billable', width: '85px', className: 'is-numeric is-end' },
              numeric('volume', 'Volume', { link: true, width: '95px' }),
              numeric('adv', 'ADV', { link: true, width: '80px' }),
              numeric('pps', 'PPS', { link: true, width: '80px' }),
              numeric('weightPiece', 'Weight/Piece', { link: true, width: '120px' }),
              numeric('baseGrossRev', 'Base Gross Rev', { link: true, width: '135px' }),
              numeric('baseNetRev', 'Base Net Rev', { link: true, width: '125px' }),
              numeric('baseDisc', 'Base Disc', { width: '100px' }),
              numeric('baseRpp', 'Base RPP', { link: true, width: '105px' }),
              numeric('baseProfit', 'Base Profit', { link: true, width: '110px' }),
              numeric('baseOr', 'Base OR', { width: '95px' })
            ],
            rows: DA.data.packetWeightCube
          })
        ])
      ]);
    }

    /** Filter row shared by Adjustments and Other Terms: scenario and bid pickers plus Reset. */
    function scenarioBidFilters() {
      return el('div', { className: 'card' }, [
        el('div', { className: 'view-filters' }, [
          el('div', { className: 'view-filters__field' }, [
            C.SelectField({
              label: 'Choose Scenario',
              value: scenarios[0] && scenarios[0].name,
              options: scenarios.map(function (scenario) {
                return { value: scenario.name, label: scenario.name };
              })
            })
          ]),
          el('div', { className: 'view-filters__field' }, [
            C.SelectField({
              label: 'Choose Bid',
              value: customer + ' MAIN',
              options: accountOptions()
            })
          ]),
          C.Button({
            label: 'Reset',
            variant: 'ghost',
            icon: DA.icons.refresh(15),
            iconPosition: 'end'
          })
        ])
      ]);
    }

    /** Filter row above a Rate Charts panel: bid and service group pickers, Export. */
    function rateChartPanelFilters() {
      var bid = 'P310041099 (SP- Stampin Up)';
      var serviceGroup = 'UPS E-Standard to Canada';
      return el('div', { className: 'card' }, [
        el('div', { className: 'view-filters' }, [
          el('div', { className: 'view-filters__field' }, [
            C.SelectField({ label: 'Choose Bid', value: bid, options: [{ value: bid, label: bid }] })
          ]),
          el('div', { className: 'view-filters__field' }, [
            C.SelectField({
              label: 'Choose Service Group',
              value: serviceGroup,
              options: [{ value: serviceGroup, label: serviceGroup }]
            })
          ]),
          C.Button({ label: 'Export', variant: 'ghost', icon: DA.icons.download(16) })
        ])
      ]);
    }

    /**
     * One scenario's rate grid: zones across, weight tiers down, a $ figure
     * per cell -- the same 2-row-header shape servicePlan()'s own weight
     * break grid uses (a merged corner label over two matrix__rowhead
     * columns, zone/weight-break headers spanning both header rows).
     * Net is the only basis with reference data; Gross and Volume show the
     * table's own empty state rather than invented figures.
     */
    function rateChartGrid(scenario, basis) {
      var data = DA.data.rateChartGrid;
      var zones = data.zones;

      if (basis !== 'net') {
        return el('p', { className: 'table-empty', text: 'No data available.' });
      }

      var head = el('thead', {}, [
        el('tr', {}, [
          el('th', { className: 'matrix__rowhead', attrs: { scope: 'col', colspan: 2 }, text: 'Zones' })
        ].concat(zones.map(function (zone) {
          return el('th', { attrs: { scope: 'col', rowspan: 2 }, text: zone });
        }))),
        el('tr', {}, [
          el('th', { className: 'matrix__rowhead', attrs: { scope: 'col', colspan: 2 }, text: 'Weight' })
        ])
      ]);

      var body = el('tbody', {}, data.rows.map(function (row) {
        return el('tr', {}, [
          el('th', { className: 'matrix__rowhead', attrs: { scope: 'row' } }),
          el('td', { className: 'matrix__rowhead', text: row.weight })
        ].concat(row.net.map(function (rate) {
          // A plain <a> here, same as every other report table's linked
          // figure -- it's what makes the value read as link-blue and
          // pick up the hover highlight, both for free from the base `a`
          // rule rather than a one-off color/hover rule just for this cell.
          return el('td', { className: 'matrix__cell' }, [
            el('a', { text: rate, attrs: { href: '#rate-detail', 'aria-label': 'Rate ' + rate } })
          ]);
        })));
      }));

      return el('div', { className: 'grid-scroll scroll-area' }, [
        el('table', { className: 'matrix' }, [
          el('caption', { className: 'u-visually-hidden', text: scenario.name + ' rate chart' }),
          head,
          body
        ])
      ]);
    }

    function rateChartPanel(scenario) {
      var basis = 'net';
      var gridMount = el('div', {});

      function renderGrid() {
        DA.dom.clear(gridMount).appendChild(rateChartGrid(scenario, basis));
      }
      renderGrid();

      return el('div', {}, [
        rateChartPanelFilters(),
        el('div', { className: 'card' }, [
          el('div', { className: 'card__body' }, [
            el('p', { className: 'section-title', style: { margin: 0 }, text: scenario.name })
          ])
        ]),
        el('div', { className: 'card' }, [
          el('div', { className: 'card__body' }, [
            C.RadioGroup({
              ariaLabel: 'Rate basis for ' + scenario.name,
              name: 'rate-basis-' + scenario.number,
              value: basis,
              items: [
                { value: 'net', label: 'Net' },
                { value: 'gross', label: 'Gross' },
                { value: 'volume', label: 'Volume' }
              ],
              onChange: function (value) { basis = value; renderGrid(); }
            }),
            el('div', { style: { 'margin-top': 'var(--space-4)' } }, [gridMount])
          ])
        ])
      ]);
    }

    /** Rate Charts: one panel per scenario, side by side. */
    function rateChartsView() {
      return el('div', { className: 'comparison-grid' },
        scenarios.map(function (scenario) { return rateChartPanel(scenario); })
      );
    }

    /**
     * A single, packet-wide dollar adjustment -- not one per lane the way
     * the reference screen this replaced first suggested. One row, one
     * editable figure.
     */
    function adjustmentsView() {
      return el('div', {}, [
        scenarioBidFilters(),
        el('div', { className: 'card' }, [
          C.DataTable({
            caption: 'Adjustments',
            embedded: true,
            headerTone: 'warm',
            columns: [
              {
                key: 'amount',
                label: 'Dollar Amount',
                width: '330px',
                render: function (row) { return editableCell(row.amount); }
              }
            ],
            rows: [{ amount: '$0' }]
          }),
          el('div', { className: 'grid-footer' }, [
            el('a', { className: 'link-with-icon', attrs: { href: '#save-changes' } }, [
              DA.icons.save(15),
              el('span', { text: 'Save Changes' })
            ])
          ])
        ]),
        el('div', { className: 'page-actions page-actions--wide' }, [
          C.Button({
            label: 'Update Analyzer Packet',
            variant: 'primary',
            shape: 'pill',
            icon: DA.icons.chevronRight(14, ''),
            iconPosition: 'end',
            disabled: true
          })
        ])
      ]);
    }

    /** Other Terms > Dim Divisor: the DIM weight divisor set per service. */
    function dimDivisorView() {
      return el('div', {}, [
        scenarioBidFilters(),
        el('div', { className: 'card' }, [
          el('div', { style: { padding: 'var(--space-4)' } }, [
            C.Button({ label: 'Add Service', variant: 'secondary', icon: DA.icons.plusCircle(16) })
          ]),
          C.DataTable({
            caption: 'Dim divisor',
            embedded: true,
            headerTone: 'warm',
            tinted: true,
            // Single Core Service column now, so nothing left to freeze as
            // a group.
            freezeColumns: 1,
            columns: [
              {
                // Movement, Mode and Service Group joined into one label --
                // the same "Core Service" pattern Analyzer's Cost Details/
                // Zones tables use (profileKeyColumns()), rather than three
                // separate frozen columns for what reads as a single line
                // identifying the row.
                key: 'coreService',
                label: 'Core Service',
                width: '280px',
                className: 'is-rowhead',
                render: function (row) {
                  return [row.movement, row.mode, row.serviceGroup].join('-');
                }
              },
              { key: 'incentiveType', label: 'Incentive Type', width: '150px' },
              {
                key: 'incentiveAmount',
                label: 'Incentive Amount',
                width: '160px',
                // The threshold bands behind the divisor code live in the
                // Details dialog, not as a flat figure on this row.
                render: function (row) {
                  return el('a', {
                    className: 'link-with-icon',
                    attrs: { href: '#structure-details-' + row.serviceGroup },
                    on: {
                      click: function (event) {
                        event.preventDefault();
                        DA.dialogs.DimDivisorDetailsDialog(row).open();
                      }
                    }
                  }, [el('span', { text: 'Structure Details' }), DA.icons.chevronRight(14, '')]);
                }
              },
              {
                key: 'remove',
                label: '',
                width: '56px',
                render: function () {
                  return el('button', {
                    className: 'icon-action icon-action--danger u-tap-target',
                    attrs: { type: 'button', 'aria-label': 'Remove service' }
                  }, [DA.icons.trash(14)]);
                }
              }
            ],
            rows: DA.data.packetDimDivisor
          })
        ])
      ]);
    }

    /**
     * Other Terms: Dim Divisor is built; Published Fuel Surcharge has no
     * reference screen yet.
     */
    function otherTermsView() {
      return el('div', { className: 'tabs--boxed' }, [
        C.Tabs({
          ariaLabel: 'Other term views',
          value: 'dim-divisor',
          items: [
            { id: 'dim-divisor', label: 'Dim Divisor', render: dimDivisorView },
            {
              id: 'published-fuel-surcharge',
              label: 'Published Fuel Surcharge',
              render: emptyView('Published Fuel Surcharge')
            }
          ]
        })
      ]);
    }

    /**
     * The merged "Analyzer" tab: Comparisons (the former standalone Summary
     * tab's content, unchanged) alongside the shipping-profile views, all as
     * one set of sub-tabs rather than two separate top-level tabs. Every
     * sub-tab's underlying content and data is exactly what it was before --
     * only the menu structure and labels moved, matching the reference menu.
     */
    function analyzerView() {
      return el('div', { className: 'tabs--boxed' }, [
        C.Tabs({
          ariaLabel: 'Analyzer views',
          value: 'comparisons',
          items: [
            { id: 'comparisons', label: 'Comparisons', render: summaryView },
            { id: 'services', label: 'Services', render: serviceView },
            { id: 'charges', label: 'Charges', render: accessorialView },
            { id: 'accounts', label: 'Accounts', render: accountsView },
            { id: 'cost-details', label: 'Cost Details', render: costView },
            { id: 'zones', label: 'Zones', render: zoneView },
            { id: 'weight-cube', label: 'Weight & Cube', render: weightCubeView }
          ]
        })
      ]);
    }

    /* ---- Composition ------------------------------------------------------ */

    var page = el('main', { className: 'page', attrs: { id: 'main-content' } }, [
      C.Breadcrumb({
        separator: '/',
        items: [
          { label: 'My Analyzers', onClick: options.onExit },
          { label: 'Packet' }
        ]
      }),
      el('div', { className: 'record-header' }, [
        el('h2', {
          className: 'record-header__title title-rule title-rule--full',
          text: customer
        }),
        el('div', { className: 'record-header__meta' }, [
          el('span', { className: 'badge badge--success', text: packet.industry || '-' }),
          el('span', { text: 'Sub Industry : ' + (packet.subIndustry || '-') }),
          el('span', { className: 'meta-divider' }),
          el('span', { text: packet.referenceNumber || '-' }),
          el('span', { className: 'meta-divider' }),
          el('span', { text: 'Analyzer Packet: ' + (packet.packetId || '-') })
        ])
      ]),
      el('div', { className: 'page-back' }, [
        C.Button({
          label: 'Back to Scenarios',
          variant: 'link',
          icon: DA.icons.chevronLeft(14),
          onClick: function () { if (options.onBack) options.onBack(); }
        })
      ]),
      el('div', { className: 'report-filters' }, [
        el('div', { className: 'report-filters__field' }, [comparisonSelector]),
        el('div', { className: 'report-filters__field' }, [
          C.SelectField({ label: 'Revenue Basis', value: 'All', options: asOptions(DA.data.filterOptions.revenueBasis) })
        ]),
        el('div', { className: 'report-filters__field' }, [
          C.SelectField({
            label: 'Cost Basis',
            value: 'Fully Allocated Cost',
            options: asOptions(DA.data.filterOptions.costBasis)
          })
        ]),
        el('div', { className: 'report-filters__actions' }, [
          C.Button({
            label: 'Reset',
            variant: 'outline',
            shape: 'pill',
            icon: DA.icons.refresh(15),
            iconPosition: 'end'
          })
        ])
      ]),
      el('div', { className: 'comparison-visibility-toggle' }, [comparisonVisibilityToggle]),
      comparisonCollapsible,
      el('div', { className: 'tabs--page' }, [
        C.Tabs({
          ariaLabel: 'Report sections',
          value: 'analyzer',
          items: [
            { id: 'analyzer', label: 'Analyzer', render: function () {
              return el('section', { className: 'panel panel--auto' }, [
                el('div', { className: 'panel__content' }, [analyzerView()])
              ]);
            } },
            { id: 'pricing-terms', label: 'Pricing Terms', render: function () {
              return el('section', { className: 'panel panel--auto' }, [
                el('div', { className: 'panel__content' }, [
                  DA.views.PricingTerms({
                    packet: packet,
                    numeric: numeric,
                    filters: pricingFilters,
                    emptyView: emptyView
                  })
                ])
              ]);
            } },
            { id: 'other-terms', label: 'Other Terms', render: otherTermsView },
            { id: 'adjustments', label: 'Adjustments', render: adjustmentsView },
            { id: 'rate-charts', label: 'Rate Charts', render: rateChartsView }
          ]
        })
      ])
    ]);

    return page;
  };
})(window.DA);
