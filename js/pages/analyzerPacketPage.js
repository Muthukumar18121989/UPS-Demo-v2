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
              renderComparisonBand();
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

      var difference = { scenario: '', difference: true };
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

    function renderComparisonBand() {
      DA.dom.clear(comparisonBand).appendChild(
        C.DataTable({
          caption: 'Scenario comparison',
          embedded: true,
          headerTone: 'plain',
          dividers: true,
          rowClassName: function (row) { return row.difference ? 'is-difference' : ''; },
          columns: [
            { key: 'scenario', label: 'Scenario', width: '150px' },
            numeric('adv', 'ADV'),
            numeric('baseFrtDisc', 'Base Frt Disc'),
            numeric('totalDisc', 'Total Disc'),
            numeric('rpp', 'RPP'),
            numeric('revenue', 'Revenue', { width: '150px' }),
            numeric('or', 'OR'),
            numeric('profit', 'Profit', { width: '130px' })
          ],
          rows: comparisonRows()
        })
      );
    }

    renderComparisonBand();

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

    /** The lane keys every shipping profile view opens with. */
    function profileKeyColumns() {
      return [
        { key: 'movement', label: 'Movement', width: '110px', className: 'is-rowhead' },
        { key: 'mode', label: 'Mode', width: '115px', className: 'is-rowhead' },
        { key: 'service', label: 'Core Service', width: '175px', className: 'is-rowhead' },
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
            expandKey: 'service',
            // Movement, Mode and Core Service together identify the lane --
            // frozen as a group, so they stay in view alongside whichever
            // figures the reader has scrolled to.
            freezeColumns: 3,
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
      function labelColumn(key, label, width) {
        return { key: key, label: label, width: width || '135px', className: 'is-rowhead' };
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
              labelColumn('type', 'Accessorial Type'),
              labelColumn('group', 'Group'),
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
      function labelColumn(key, label, width, render) {
        return { key: key, label: label, width: width || '160px', className: 'is-rowhead', render: render };
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
              labelColumn('parent', 'Parent', '170px', function (row) {
                return row.parent ? withCustomer(row.parent) : '';
              }),
              labelColumn('subParent', 'Sub Parent', '150px'),
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

    /** Filter row shared by Rate Charts: a scenario picker plus a Filters button. */
    function rateChartFilters() {
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
          C.Button({ label: 'Filters', variant: 'ghost', icon: DA.icons.filter(16) })
        ])
      ]);
    }

    /** Filter row shared by Adjustments and Other Terms: scenario picker plus Reset. */
    function scenarioResetFilters() {
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
          C.Button({
            label: 'Reset',
            variant: 'ghost',
            icon: DA.icons.refresh(15),
            iconPosition: 'end'
          })
        ])
      ]);
    }

    /** Label column shared by the flat (non-expanding) rate/adjustment tables. */
    function flatLabelColumn(key, label, width) {
      return { key: key, label: label, width: width || '150px', className: 'is-rowhead' };
    }

    function rateChartsView() {
      return el('div', {}, [
        rateChartFilters(),
        el('div', { className: 'card' }, [
          C.DataTable({
            caption: 'Rate charts',
            embedded: true,
            headerTone: 'warm',
            tinted: true,
            columns: [
              flatLabelColumn('service', 'Core Service', '220px'),
              numeric('zone', 'Zone', { width: '90px' }),
              numeric('volume', 'Volume', { link: true, width: '110px' }),
              numeric('grossRate', 'Gross Rate', { link: true, width: '120px' }),
              numeric('netRate', 'Net Rate', { link: true, width: '120px' }),
              numeric('disc', 'Disc', { width: '100px' })
            ],
            rows: DA.data.packetRateCharts
          })
        ])
      ]);
    }

    function adjustmentsView() {
      return el('div', {}, [
        scenarioResetFilters(),
        el('div', { className: 'card' }, [
          C.DataTable({
            caption: 'Adjustments',
            embedded: true,
            headerTone: 'warm',
            tinted: true,
            freezeColumns: 4,
            columns: [
              flatLabelColumn('movement', 'Movement', '120px'),
              flatLabelColumn('mode', 'Mode', '110px'),
              flatLabelColumn('serviceGroup', 'Service Group', '150px'),
              flatLabelColumn('service', 'Core Service', '190px'),
              { key: 'basis', label: 'Basis', width: '140px' },
              {
                key: 'amount',
                label: 'Dollar Amount',
                width: '150px',
                className: 'is-numeric is-end',
                headerClassName: 'is-end',
                render: function (row) { return editableCell(row.amount); }
              }
            ],
            rows: DA.data.packetAdjustments
          }),
          el('div', { className: 'grid-footer' }, [
            el('a', { className: 'link-with-icon', attrs: { href: '#save-changes' } }, [
              DA.icons.save(15),
              el('span', { text: 'Save Changes' })
            ])
          ])
        ])
      ]);
    }

    /** Other Terms > Dim Divisor: the DIM weight divisor set per service. */
    function dimDivisorView() {
      return el('div', {}, [
        scenarioResetFilters(),
        el('div', { style: { padding: '0 var(--space-4) var(--space-4)' } }, [
          C.Button({ label: 'Add Service', icon: DA.icons.plusCircle(16) })
        ]),
        el('div', { className: 'card' }, [
          C.DataTable({
            caption: 'Dim divisor',
            embedded: true,
            headerTone: 'warm',
            tinted: true,
            freezeColumns: 3,
            columns: [
              flatLabelColumn('movement', 'Movement', '120px'),
              flatLabelColumn('mode', 'Mode', '110px'),
              flatLabelColumn('serviceGroup', 'Service Group', '190px'),
              { key: 'incentiveType', label: 'Incentive Type', width: '150px' },
              numeric('divisor', 'Dim Weight Divisor', { width: '170px' }),
              {
                key: 'structureDetails',
                label: 'Structure Details',
                width: '160px',
                render: function () {
                  return el('a', { text: 'Structure Details', attrs: { href: '#structure-details' } });
                }
              }
            ],
            rows: DA.data.packetDimDivisor
          })
        ])
      ]);
    }

    /** Other Terms: Dim Divisor is built; Minimums has no reference screen yet. */
    function otherTermsView() {
      return el('div', { className: 'card' }, [
        C.Tabs({
          ariaLabel: 'Other term views',
          value: 'dim-divisor',
          items: [
            { id: 'dim-divisor', label: 'Dim Divisor', render: dimDivisorView },
            { id: 'minimums', label: 'Minimums', render: emptyView('Minimum') }
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
      C.FilterChips({ ariaLabel: 'Applied charge filters', values: DA.data.chargeFilters }),
      comparisonBand,
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
