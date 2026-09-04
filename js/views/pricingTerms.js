/**
 * Pricing terms — the incentive structure behind a scenario's bid.
 *
 * Four views: Tier Incentives (revenue bands and the rates they unlock),
 * Services (an incentive plan per service), Accessorials, and Modifiers.
 * Modifiers has no reference screen yet.
 */
(function (DA) {
  'use strict';

  var el = DA.dom.el;

  DA.views = DA.views || {};

  function editableCell(value, options) {
    options = options || {};
    return el('span', { className: 'cell-value' }, [
      el('span', {
        className: options.tone ? 'cell-value__text--' + options.tone : null,
        text: value
      }),
      options.editable === false
        ? null
        : el('button', {
            className: 'icon-action u-tap-target',
            attrs: { type: 'button', 'aria-label': 'Edit ' + value }
          }, [DA.icons.pencil(13)])
    ]);
  }

  /**
   * A Flow Through Option, shown as a plain outlined pill -- informational
   * only (which flow types this incentive plan can apply to), not a
   * pick list. Nothing here is actually selectable, so it's a plain
   * <span>, not a <button>: no click handler, no pressed state, no
   * affordance implying it can be toggled.
   */
  function flowThroughChip(label) {
    return el('span', { className: 'flow-chip' }, [el('span', { text: label })]);
  }

  /* ---- Tier Incentives ---------------------------------------------------- */

  /**
   * A service group's sublabel pairs its billing type (LTR, PKG, or
   * PKG-Hundredweight) with the qualifier codes that follow it (FC, PP,
   * TP, RS...) -- the codes render as superscript, set off from the
   * billing type they qualify instead of reading as one flat string.
   */
  function serviceGroupSublabel(sublabel) {
    var match = /^(-(?:LTR|PKG(?:-Hundredweight)?))\s+(.+)$/.exec(sublabel || '');
    if (!match) return [el('span', { text: sublabel })];
    return [
      el('span', { text: match[1] }),
      ' ',
      el('sup', { text: match[2] })
    ];
  }

  function tierIncentivesView() {
    var C = DA.components;
    var tier = DA.data.tierIncentive;

    function bandCells(pick, options) {
      options = options || {};
      return tier.bands.map(function (band) {
        return el('td', {
          className: 'matrix__cell' + (band.target ? ' is-target' : '')
        }, [
          options.plain
            ? el('span', { text: band[pick] })
            : editableCell(band[pick], { editable: !band.locked })
        ]);
      });
    }

    var head = el('thead', {}, [
      el('tr', {}, [el('th', { attrs: { scope: 'col' }, text: '' })].concat(
        tier.bands.map(function (band) {
          return el('th', {
            attrs: { scope: 'col' },
            className: band.target ? 'is-target' : ''
          }, [
            band.target
              ? el('span', { className: 'matrix__target-flag', text: 'Target' })
              : el('span')
          ]);
        })
      ))
    ]);

    var body = el('tbody', {}, [
      el('tr', {}, [el('th', { className: 'matrix__label', attrs: { scope: 'row' }, text: '% Modeled' })]
        .concat(bandCells('modeled', { plain: true }))),
      el('tr', {}, [el('th', { className: 'matrix__label', attrs: { scope: 'row' }, text: 'Low' })]
        .concat(bandCells('low'))),
      el('tr', {}, [el('th', { className: 'matrix__label', attrs: { scope: 'row' }, text: 'High' })]
        .concat(bandCells('high', { plain: true }))),
      el('tr', { className: 'matrix__section' }, [
        el('td', { attrs: { colspan: tier.bands.length + 1 }, text: 'Service Group' })
      ])
    ].concat(tier.serviceGroups.map(function (group) {
      return el('tr', {}, [
        el('th', { className: 'matrix__label', attrs: { scope: 'row' } }, [
          el('span', { text: group.name }),
          el('span', { className: 'matrix__label-sub' }, serviceGroupSublabel(group.sublabel))
        ])
      ].concat(group.rates.map(function (rate, index) {
        var band = tier.bands[index];
        return el('td', { className: 'matrix__cell' + (band && band.target ? ' is-target' : '') }, [
          // Only the bands nearest the target stay open for negotiation --
          // the ones already past are read-only, same as Low's own locked band.
          editableCell(rate, { editable: Boolean(band && band.ratesEditable) })
        ]);
      })));
    })));

    var grid = el('div', { className: 'data-table__viewport scroll-area data-table__viewport--auto' }, [
      el('table', { className: 'matrix' }, [
        el('caption', { className: 'u-visually-hidden', text: tier.tier + ' incentives' }),
        head,
        body
      ])
    ]);

    var open = true;
    var toggle = el('button', {
      className: 'tier-header__toggle u-tap-target',
      attrs: { type: 'button', 'aria-expanded': 'true', 'aria-label': 'Collapse ' + tier.tier }
    }, [DA.icons.chevronDown(16)]);
    toggle.addEventListener('click', function () {
      open = !open;
      grid.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', (open ? 'Collapse ' : 'Expand ') + tier.tier);
      DA.dom.clear(toggle).appendChild(open ? DA.icons.chevronDown(16) : DA.icons.chevronRight(16, ''));
    });

    return el('div', { className: 'card' }, [
      el('div', { className: 'tier-header' }, [
        toggle,
        el('span', { className: 'tier-header__value', text: tier.tier }),
        el('div', { className: 'tier-header__meta' }, tier.meta.map(function (item) {
          return el('div', { className: 'tier-header__item' }, [
            el('span', { className: 'tier-header__label', text: item.label }),
            el('span', { className: 'tier-header__value', text: item.value })
          ]);
        })),
        el('div', { className: 'tier-header__actions' }, [
          C.Button({
            label: 'Tier Options',
            variant: 'link',
            icon: DA.icons.chevronRight(14, ''),
            iconPosition: 'end'
          })
        ])
      ]),
      grid
    ]);
  }

  /* ---- Services ----------------------------------------------------------- */

  /**
   * Cell-by-cell: a matrix grid, one row per weight band, rate an editable
   * percent per zone -- the method's own smaller, zero-padded zone set
   * (weightBreakZones), not the 10-zone set the other rate grids share.
   *
   * "Zone Reference: Daily" moved from a standalone caption above the
   * table into the table's own header (a third thead row, spanning the
   * zone columns only -- Billable Weight's own two columns sit blank
   * beneath it, matching the client's reference screenshot), and the last
   * band's `to` cell renders genuinely empty rather than an editable "-"
   * placeholder.
   *
   * The grid keeps its own working copy of the bands (not
   * DA.data.weightBreaks directly) so "Add weight break band" can grow it
   * without rewriting the shared demo data every other view of this same
   * table reads from. Per the client's own explicit description: clicking
   * "Add weight break band" turns the last band's empty `to` cell into a
   * live input; entering a value there bounds that band (its own "51+"
   * drops the "+", matching every bounded band above it) and appends a
   * fresh band below it, copying the completed band's own rate and left
   * with an empty `to` cell of its own -- the new open-ended band, in
   * exactly the same resting state the old one started in.
   */
  function weightBreakGrid() {
    var zones = DA.data.weightBreakZones;
    var bands = DA.data.weightBreaks.map(function (band) { return Object.assign({}, band); });
    var editingLast = false;
    var tableMount = el('div', {});

    function toCell(band, isLast) {
      if (isLast && editingLast) {
        var input = el('input', {
          className: 'cell-input',
          attrs: {
            type: 'text',
            inputmode: 'numeric',
            'aria-label': 'Weight break boundary after ' + band.from
          },
          on: {
            keydown: function (event) { if (event.key === 'Enter') input.blur(); },
            blur: function () { commitBoundary(band, input.value.trim()); }
          }
        });
        window.setTimeout(function () { input.focus(); }, 0);
        return el('span', { className: 'cell-value' }, [input]);
      }
      return band.to ? editableCell(band.to) : el('span', { className: 'cell-value' });
    }

    function commitBoundary(band, value) {
      editingLast = false;
      if (value) {
        band.to = value;
        band.from = band.from.replace('+', '');
        bands.push({ from: String(Number(value) + 1) + '+', to: '', rate: band.rate });
      }
      render();
    }

    function buildTable() {
      return el('table', { className: 'matrix' }, [
        el('caption', { className: 'u-visually-hidden', text: 'Weight break incentives by zone' }),
        el('thead', {}, [
          el('tr', {}, [
            el('th', { className: 'matrix__rowhead', attrs: { scope: 'col', colspan: 2 } }),
            el('th', {
              className: 'rate-grid__caption',
              attrs: { scope: 'colgroup', colspan: zones.length },
              text: 'Zone Reference: Daily'
            }),
            el('th', { className: 'matrix__rowhead', attrs: { scope: 'col' } })
          ]),
          el('tr', {}, [
            el('th', {
              className: 'matrix__rowhead',
              attrs: { scope: 'col', colspan: 2, rowspan: 2 },
              text: 'Billable Weight'
            }),
            el('th', { attrs: { scope: 'colgroup', colspan: zones.length }, text: 'Domestic' }),
            el('th', { attrs: { scope: 'col', rowspan: 2 }, text: '' })
          ]),
          el('tr', {}, zones.map(function (zone) {
            return el('th', { attrs: { scope: 'col' }, text: zone });
          }))
        ]),
        el('tbody', {}, bands.map(function (band, index) {
          var isLast = index === bands.length - 1;
          return el('tr', {}, [
            el('th', { className: 'matrix__rowhead', attrs: { scope: 'row' } }, [editableCell(band.from)]),
            el('td', { className: 'matrix__rowhead' }, [toCell(band, isLast)])
          ].concat(zones.map(function () {
            return el('td', { className: 'matrix__cell' }, [editableCell(band.rate)]);
          })).concat([
            el('td', {}, [
              el('button', {
                className: 'icon-action icon-action--danger u-tap-target',
                attrs: { type: 'button', 'aria-label': 'Remove weight break ' + band.from }
              }, [DA.icons.trash(14)])
            ])
          ]));
        }))
      ]);
    }

    function render() {
      DA.dom.clear(tableMount).appendChild(buildTable());
    }

    render();

    return el('div', { className: 'card' }, [
      el('div', { className: 'grid-scroll scroll-area' }, [tableMount]),
      el('div', { className: 'grid-footer' }, [
        el('a', {
          className: 'link-with-icon',
          attrs: { href: '#add-weight-break' },
          on: {
            click: function (event) {
              event.preventDefault();
              editingLast = true;
              render();
            }
          }
        }, [
          DA.icons.plusCircle(18),
          el('span', { text: 'Add weight break band' })
        ]),
        el('a', { className: 'link-with-icon', attrs: { href: '#save-changes' } }, [
          DA.icons.save(15),
          el('span', { text: 'Save Changes' })
        ])
      ])
    ]);
  }

  /**
   * Base/Zone: no weight bands at all -- one incentive amount per zone,
   * flat. A plain DataTable rather than a matrix grid, since there's no
   * second axis (zone columns x weight rows) to lay out.
   */
  function baseZoneGrid() {
    var C = DA.components;
    return el('div', { className: 'card' }, [
      C.DataTable({
        caption: 'Base/Zone incentive amounts',
        embedded: true,
        headerTone: 'warm',
        columns: [
          {
            key: 'zone', label: 'Zone', width: '160px',
            render: function (row) {
              return el('a', { text: row.zone, attrs: { href: '#zone-detail', 'aria-label': 'Zone ' + row.zone } });
            }
          },
          { key: 'adv', label: 'ADV', width: '160px', className: 'is-numeric is-end', headerClassName: 'is-end' },
          {
            key: 'incentiveAmount', label: 'Incentive Amount', width: '180px',
            className: 'is-numeric is-end', headerClassName: 'is-end',
            // A static sort affordance, matching the reference screen --
            // no other column in the app sorts yet, so this doesn't wire
            // up a real sort either, just the same chevron cue.
            renderHeader: function () {
              return el('span', { className: 'th-with-icon' }, [
                el('span', { text: 'Incentive Amount' }),
                DA.icons.chevronDown(14)
              ]);
            },
            render: function (row) { return editableCell(row.incentiveAmount, { tone: 'alert' }); }
          }
        ],
        rows: DA.data.baseZoneIncentives
      }),
      el('div', { className: 'grid-footer' }, [
        el('a', { className: 'link-with-icon', attrs: { href: '#save-changes' } }, [
          DA.icons.save(15),
          el('span', { text: 'Save Changes' })
        ])
      ])
    ]);
  }

  /**
   * Custom Net Rate: the same matrix shape Cell-by-cell uses, but keyed by
   * a single billable weight per row (not a from/to band) against
   * rateZones' full 10-zone set, and every cell is a flat $ figure -- set
   * by uploading a template, not edited cell by cell, so no pencil icons.
   */
  function customNetRateGrid() {
    var zones = DA.data.rateZones;

    var grid = el('table', { className: 'matrix' }, [
      el('caption', { className: 'u-visually-hidden', text: 'Custom net rate by weight and zone' }),
      el('thead', {}, [
        el('tr', {}, [
          el('th', {
            className: 'matrix__rowhead',
            attrs: { scope: 'col', rowspan: 2 },
            text: 'Billable Weight (lbs)'
          }),
          el('th', { attrs: { scope: 'colgroup', colspan: zones.length }, text: 'Domestic' })
        ]),
        el('tr', {}, zones.map(function (zone) {
          return el('th', { attrs: { scope: 'col' }, text: zone });
        }))
      ]),
      el('tbody', {}, DA.data.customNetRateRows.map(function (row) {
        return el('tr', {}, [
          el('th', { className: 'matrix__rowhead', attrs: { scope: 'row' }, text: row.weight })
        ].concat(zones.map(function (zone) {
          return el('td', { className: 'matrix__cell' }, [el('span', { text: row.rates[zone] })]);
        })));
      }))
    ]);

    return el('div', { className: 'card' }, [
      el('p', { className: 'rate-grid__caption', text: 'Zone Reference: Daily' }),
      el('div', { className: 'grid-scroll scroll-area' }, [grid]),
      el('div', { className: 'grid-footer' }, [
        el('a', { className: 'link-with-icon', attrs: { href: '#save-changes' } }, [
          DA.icons.save(15),
          el('span', { text: 'Save Changes' })
        ])
      ])
    ]);
  }

  /** The incentive settings for one service: options, method and rate grid --
      which of the three (Cell-by-cell, Base/Zone, Custom Net Rate) swaps
      live with the Incentive Method dropdown, each its own table shape. */
  function servicePlan() {
    var C = DA.components;
    var method = 'Cell-by-cell';
    var gridMount = el('div', {});

    // Only Custom Net Rate is set by uploading a template rather than
    // editing cells -- these stay out of the flow for the other two
    // methods rather than sitting there disabled.
    var templateActions = el('div', { className: 'field-row__actions' }, [
      el('a', { className: 'link-with-icon', attrs: { href: '#download-template' } }, [
        DA.icons.download(15),
        el('span', { text: 'Download Template' })
      ]),
      el('a', { className: 'link-with-icon', attrs: { href: '#upload-net-rate' } }, [
        DA.icons.upload(15),
        el('span', { text: 'Upload Net Rate Values' })
      ])
    ]);

    function renderMethod() {
      DA.dom.clear(gridMount).appendChild(
        method === 'Base/Zone' ? baseZoneGrid()
          : method === 'Custom Net Rate' ? customNetRateGrid()
          : weightBreakGrid()
      );
      templateActions.hidden = method !== 'Custom Net Rate';
    }

    renderMethod();

    return el('div', { className: 'plan-detail' }, [
      C.Tabs({
        ariaLabel: 'Freight type',
        value: 'commercial',
        items: [
          { id: 'commercial', label: 'Commercial Frt', render: function () { return el('div'); } },
          { id: 'residence', label: 'Residence Frt', render: function () { return el('div'); } }
        ]
      }),
      el('p', { className: 'plan-detail__label', text: 'Flow Through Options' }),
      el('div', { className: 'checkbox-row' }, DA.data.flowThroughOptions.map(function (option) {
        return flowThroughChip(option);
      })),
      C.SegmentedControl({
        ariaLabel: 'Incentive basis',
        value: 'base',
        items: [
          { value: 'base', label: 'Base Incentive' },
          { value: 'minimum', label: 'Minimum' }
        ]
      }),
      el('div', { className: 'field-row' }, [
        el('span', { className: 'field-row__label', text: 'Incentive Method' }),
        C.SelectField({
          label: 'Incentive Method',
          hideLabel: true,
          value: method,
          options: DA.data.filterOptions.incentiveMethod.map(function (value) {
            return { value: value, label: value };
          }),
          onChange: function (value) {
            method = value;
            renderMethod();
          }
        }),
        templateActions
      ]),
      gridMount
    ]);
  }

  /**
   * The first leaf (a node with no `children`) under a tree, depth-first,
   * shaped like TreeSelectField's own leaf records so the initial plan shown
   * before any selection reads the same as one chosen from the dropdown.
   */
  function firstLeaf(nodes, ancestors) {
    ancestors = ancestors || [];
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (!node.children) {
        return { label: node.label, value: node.label, path: ancestors.concat(node.label) };
      }
      var found = firstLeaf(node.children, ancestors.concat(node.label));
      if (found) return found;
    }
    return null;
  }

  /**
   * Shared shell for Services and Accessorials: a single-select tree dropdown
   * over `tree`, with the chosen leaf's plan (`leafRender`) shown below under
   * its full breadcrumb. Replaces the old always-expanded nested accordions.
   */
  function planPicker(options) {
    var C = DA.components;
    var tree = options.tree;
    var planSlot = el('div', {});

    function showPlan(leaf) {
      DA.dom.clear(planSlot).appendChild(
        el('div', { className: 'plan-detail-panel' }, [
          el('p', { className: 'plan-detail-panel__title', text: leaf.path.join(' / ') }),
          options.leafRender()
        ])
      );
    }

    var defaultLeaf = firstLeaf(tree);
    var select = C.TreeSelectField({
      label: options.selectLabel,
      tree: tree,
      value: defaultLeaf && defaultLeaf.value,
      onChange: function (value, leaf) { showPlan(leaf); }
    });

    if (defaultLeaf) showPlan(defaultLeaf);

    // Accessorials wires a real dialog behind its own add link; Services
    // has no add entry point at all -- omitted rather than left as a
    // dead link, since planPicker's callers no longer all pass one.
    var addLink = options.addLabel
      ? el('div', { style: { padding: 'var(--space-4) var(--space-4) 0' } }, [
          el('a', {
            className: 'link-with-icon',
            attrs: { href: options.addHref },
            on: options.onAddClick
              ? { click: function (event) { event.preventDefault(); options.onAddClick(); } }
              : {}
          }, [
            DA.icons.plusCircle(18),
            el('span', { text: options.addLabel })
          ])
        ])
      : null;

    return el('div', {}, [
      addLink,
      el('div', { className: 'view-filters' }, [
        el('div', { className: 'view-filters__field' }, [select])
      ]),
      planSlot
    ]);
  }

  /** Option 2: the searchable single-select tree dropdown, current default.
      No "Add Service Incentive Plan" entry point -- Accessorials keeps its
      own, Services doesn't need one. */
  function servicesView() {
    return planPicker({
      tree: DA.data.pricingServiceTree,
      leafRender: servicePlan,
      selectLabel: 'Choose Service'
    });
  }

  /**
   * One collapsible level of Option 1's tree. The last level -- the one
   * actually holding the table, not another branch to open -- gets its own
   * class so only it, not every expanded level above it, picks up the
   * "you're here" highlight (see accordion--plan-leaf in components.css).
   */
  function planNode(node, leafRender) {
    var C = DA.components;
    return C.Accordion({
      title: node.label,
      className: 'accordion--plan' + (node.children ? '' : ' accordion--plan-leaf'),
      expanded: Boolean(node.expanded),
      renderContent: node.children
        ? function () {
            return node.children.map(function (child) { return planNode(child, leafRender); });
          }
        : function () { return [leafRender()]; }
    });
  }

  /**
   * Option 1: the earlier always-expanded nested-accordion hierarchy,
   * predating the searchable dropdown planPicker() replaced it with. Kept
   * alongside Option 2 (not discarded) so either can be pulled up live
   * while presenting, the same choice the packet summary and comparison
   * band already offer elsewhere on this page.
   */
  function servicesTreeView() {
    return el('div', {}, [
      el('div', { className: 'plan-tree' }, DA.data.pricingServiceTree.map(function (region) {
        return planNode({ label: region.label, children: region.children, expanded: true }, servicePlan);
      }))
    ]);
  }

  /**
   * Option 3: the same hierarchy Option 1 shows, but as a persistent
   * left-hand pane instead of a stack of accordions -- built on the exact
   * .dropdown__tree/.dropdown__option markup Option 2's popover tree
   * already uses (so it looks like the same tree, just always open), next
   * to the selected leaf's plan on the right. Lets the user see the whole
   * structure and the open leaf at once, without opening a dropdown or
   * scrolling past every collapsed sibling accordion first.
   */
  function planSidebar(options) {
    var tree = options.tree;
    var leafRows = []; // { row, leaf } across every leaf, for selection styling

    var detailMount = el('div', { className: 'plan-sidebar__detail' });

    function select(leaf) {
      leafRows.forEach(function (entry) {
        var selected = entry.leaf === leaf;
        entry.row.classList.toggle('is-selected', selected);
        entry.row.setAttribute('aria-selected', selected ? 'true' : 'false');
      });
      DA.dom.clear(detailMount).appendChild(
        el('div', { className: 'plan-detail-panel' }, [
          el('p', { className: 'plan-detail-panel__title', text: leaf.path.join(' / ') }),
          options.leafRender()
        ])
      );
    }

    function buildLeaf(node, ancestors, depth) {
      var value = node.value == null ? node.label : node.value;
      var leaf = { label: node.label, value: value, path: ancestors.concat(node.label) };

      var row = el('li', {
        className: 'dropdown__option dropdown__option--select dropdown__tree-leaf',
        attrs: { role: 'treeitem', tabindex: '0', 'aria-selected': 'false' },
        style: { '--tree-depth': String(depth) },
        on: {
          click: function () { select(leaf); },
          keydown: function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              select(leaf);
            }
          }
        }
      }, [
        DA.icons.check(16, 'dropdown__option-check'),
        el('span', { className: 'dropdown__option-label', text: node.label })
      ]);

      leafRows.push({ row: row, leaf: leaf });
      return row;
    }

    function buildGroup(node, ancestors, depth) {
      var childList = el('ul', { className: 'dropdown__tree-group', attrs: { role: 'group' } },
        node.children.map(function (child) {
          return child.children
            ? buildGroup(child, ancestors.concat(node.label), depth + 1)
            : buildLeaf(child, ancestors.concat(node.label), depth + 1);
        })
      );

      var toggle = el('button', {
        className: 'dropdown__tree-toggle',
        attrs: { type: 'button', 'aria-expanded': 'true' },
        style: { '--tree-depth': String(depth) },
        on: {
          click: function () {
            var open = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
            childList.hidden = open;
          }
        }
      }, [
        DA.icons.chevronDown(14, 'dropdown__tree-chevron'),
        // A top-level group ("Domestic", "Transportation Charges") gets a
        // category icon alongside its chevron, matching the Accounts
        // page's own box icon -- so it still reads as "this is an
        // expandable group" at a glance, collapsed or not, rather than
        // relying on the chevron alone. Nested levels (Air, Ground -
        // Package) skip it -- the icon marks the main header, not every
        // level down.
        depth === 0 ? DA.icons.box(16) : null,
        el('span', { className: 'dropdown__tree-label', text: node.label })
      ]);

      return el('li', { className: 'dropdown__tree-node', attrs: { role: 'treeitem' } }, [toggle, childList]);
    }

    var treeList = el('ul', {
      className: 'dropdown__tree',
      attrs: { role: 'tree', 'aria-label': options.selectLabel }
    }, tree.map(function (node) {
      return node.children ? buildGroup(node, [], 0) : buildLeaf(node, [], 0);
    }));

    var defaultLeaf = firstLeaf(tree);
    var defaultRow = defaultLeaf && leafRows.filter(function (entry) {
      return entry.leaf.value === defaultLeaf.value;
    })[0];
    if (defaultRow) select(defaultRow.leaf);

    // Collapsing the nav hides it outright rather than shrinking it, so
    // the detail pane's table can use the full page width when the
    // hierarchy isn't needed -- a slim expand strip stays in its place,
    // the only part of the nav that stays visible, so there's always a
    // way back in.
    var collapseButton = el('button', {
      className: 'icon-action u-tap-target',
      attrs: { type: 'button', 'aria-label': 'Collapse hierarchy panel', 'aria-expanded': 'true' }
    }, [DA.icons.chevronLeft(14)]);

    var expandButton = el('button', {
      className: 'plan-sidebar__expand',
      attrs: { type: 'button', 'aria-label': 'Expand hierarchy panel' }
    }, [
      DA.icons.chevronRight(14, 'plan-sidebar__expand-chevron'),
      // Echoes the category icon a top-level group (buildGroup, depth 0)
      // carries in the expanded tree, so the collapsed strip still reads
      // as "the same hierarchy panel, just narrowed" instead of turning
      // into an unrelated bare arrow.
      DA.icons.box(16)
    ]);

    var wrap = el('div', { className: 'plan-sidebar' });

    function setCollapsed(collapsed) {
      wrap.classList.toggle('is-collapsed', collapsed);
      collapseButton.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    }

    collapseButton.addEventListener('click', function () { setCollapsed(true); });
    expandButton.addEventListener('click', function () { setCollapsed(false); });

    DA.dom.append(wrap, [
      el('nav', { className: 'plan-sidebar__nav', attrs: { 'aria-label': options.selectLabel } }, [
        el('div', { className: 'plan-sidebar__nav-head' }, [
          el('span', { className: 'plan-sidebar__nav-title', text: options.selectLabel }),
          collapseButton
        ]),
        el('div', { className: 'plan-sidebar__nav-body' }, [treeList])
      ]),
      expandButton,
      detailMount
    ]);

    // Accessorials wires a real dialog behind its own add link; Services
    // has no add entry point at all -- omitted rather than left as a
    // dead link, since planSidebar's callers no longer all pass one.
    var addLink = options.addLabel
      ? el('div', { style: { padding: 'var(--space-4) var(--space-4) 0' } }, [
          el('a', {
            className: 'link-with-icon',
            attrs: { href: options.addHref },
            on: options.onAddClick
              ? { click: function (event) { event.preventDefault(); options.onAddClick(); } }
              : {}
          }, [
            DA.icons.plusCircle(18),
            el('span', { text: options.addLabel })
          ])
        ])
      : null;

    return el('div', {}, [addLink, wrap]);
  }

  /** No "Add Service Incentive Plan" entry point -- Accessorials keeps its
      own, Services doesn't need one. */
  function servicesSidebarView() {
    return planSidebar({
      tree: DA.data.pricingServiceTree,
      leafRender: servicePlan,
      selectLabel: 'Choose Service'
    });
  }

  /** Services tab: Option 1 (tree) / Option 2 (dropdown) / Option 3 (left-pane hierarchy), swapped live. */
  function servicesViewSwitchable() {
    var C = DA.components;
    var option = 'option2';
    var mount = el('div', { className: 'card' });

    function render() {
      DA.dom.clear(mount).appendChild(
        option === 'option1' ? servicesTreeView()
          : option === 'option3' ? servicesSidebarView()
          : servicesView()
      );
    }

    var switcher = C.SegmentedControl({
      ariaLabel: 'Services view layout',
      value: option,
      items: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ],
      onChange: function (value) {
        option = value;
        render();
      }
    });

    render();

    return el('div', {}, [
      el('div', { className: 'plan-view-option-switch' }, [switcher]),
      mount
    ]);
  }

  /* ---- Accessorials -------------------------------------------------------- */

  /**
   * An accessorial's incentive plan: the same generic table for every leaf,
   * mirroring servicePlan() -- what's edited is the incentive itself, not
   * which leaf you opened it from.
   */
  function accessorialPlan() {
    var C = DA.components;

    function editableColumn(key, label, width) {
      return {
        key: key,
        label: label,
        width: width,
        className: 'is-numeric is-end',
        headerClassName: 'is-end',
        render: function (row) { return editableCell(row[key]); }
      };
    }

    return el('div', { className: 'card' }, [
      C.DataTable({
        caption: 'Accessorial incentive plan',
        embedded: true,
        headerTone: 'warm',
        tinted: true,
        // Single Core Service column now, so nothing left to freeze as a
        // group -- the row-header column freezes on its own regardless.
        freezeColumns: 1,
        columns: [
          {
            // Movement, Mode, Service Group and the leaf's own name joined
            // into one label -- the same "Core Service" pattern Analyzer's
            // Cost Details/Zones tables use (profileKeyColumns()), rather
            // than four separate frozen columns for what reads as a single
            // line identifying the row.
            key: 'coreService',
            label: 'Core Service',
            width: '280px',
            className: 'is-rowhead',
            render: function (row) {
              return [row.movement, row.mode, row.serviceGroup, row.service].join('-');
            }
          },
          {
            key: 'adu', label: 'ADU', width: '90px',
            className: 'is-numeric is-end', headerClassName: 'is-end'
          },
          {
            key: 'nrpp', label: 'NRPP', width: '100px',
            className: 'is-numeric is-end', headerClassName: 'is-end'
          },
          editableColumn('incentiveType', 'Incentive Type', '150px'),
          editableColumn('incentiveAmount', 'Incentive Amount', '165px')
        ],
        rows: DA.data.pricingAccessorialIncentives
      }),
      el('div', { className: 'grid-footer' }, [
        el('a', { className: 'link-with-icon', attrs: { href: '#save-changes' } }, [
          DA.icons.save(15),
          el('span', { text: 'Save Changes' })
        ])
      ])
    ]);
  }

  /** Shared by all three Accessorials layouts -- same trigger, same dialog. */
  function openAddAccessorialPlanDialog() {
    DA.dialogs.AddAccessorialIncentivePlanDialog().open();
  }

  /** Option 2: the searchable single-select tree dropdown, current default. */
  function accessorialsView() {
    return planPicker({
      tree: DA.data.pricingAccessorialTree,
      leafRender: accessorialPlan,
      selectLabel: 'Choose Accessorial',
      addHref: '#add-accessorial-plan',
      addLabel: 'Add Accessorial Incentive Plan',
      onAddClick: openAddAccessorialPlanDialog
    });
  }

  /** Option 1: the earlier always-expanded nested-accordion hierarchy,
      restored alongside Option 2 the same way Services' was. */
  function accessorialsTreeView() {
    return el('div', {}, [
      el('div', { style: { padding: 'var(--space-4) var(--space-4) 0' } }, [
        el('a', {
          className: 'link-with-icon',
          attrs: { href: '#add-accessorial-plan' },
          on: { click: function (event) { event.preventDefault(); openAddAccessorialPlanDialog(); } }
        }, [
          DA.icons.plusCircle(18),
          el('span', { text: 'Add Accessorial Incentive Plan' })
        ])
      ]),
      el('div', { className: 'plan-tree' }, DA.data.pricingAccessorialTree.map(function (node) {
        return planNode(node, accessorialPlan);
      }))
    ]);
  }

  function accessorialsSidebarView() {
    return planSidebar({
      tree: DA.data.pricingAccessorialTree,
      leafRender: accessorialPlan,
      selectLabel: 'Choose Accessorial',
      addHref: '#add-accessorial-plan',
      addLabel: 'Add Accessorial Incentive Plan',
      onAddClick: openAddAccessorialPlanDialog
    });
  }

  /** Accessorials tab: Option 1 (tree) / Option 2 (dropdown) / Option 3 (left-pane hierarchy), swapped live. */
  function accessorialsViewSwitchable() {
    var C = DA.components;
    var option = 'option2';
    var mount = el('div', { className: 'card' });

    function render() {
      DA.dom.clear(mount).appendChild(
        option === 'option1' ? accessorialsTreeView()
          : option === 'option3' ? accessorialsSidebarView()
          : accessorialsView()
      );
    }

    var switcher = C.SegmentedControl({
      ariaLabel: 'Accessorials view layout',
      value: option,
      items: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ],
      onChange: function (value) {
        option = value;
        render();
      }
    });

    render();

    return el('div', {}, [
      el('div', { className: 'plan-view-option-switch' }, [switcher]),
      mount
    ]);
  }

  /**
   * @param {Object} context  { packet, numeric, filters, emptyView }
   */
  DA.views.PricingTerms = function PricingTerms(context) {
    var C = DA.components;

    return el('div', { className: 'tabs--boxed' }, [
      C.Tabs({
        ariaLabel: 'Pricing term views',
        value: 'tier-incentives',
        items: [
          { id: 'tier-incentives', label: 'Tier Incentives', render: function () {
            return el('div', {}, [context.filters(), tierIncentivesView()]);
          } },
          { id: 'services', label: 'Services', render: function () {
            return el('div', {}, [context.filters(), servicesViewSwitchable()]);
          } },
          { id: 'accessorials', label: 'Accessorials', render: function () {
            return el('div', {}, [context.filters(), accessorialsViewSwitchable()]);
          } },
          { id: 'modifiers', label: 'Modifiers', render: function () {
            return el('div', {}, [context.filters(), context.emptyView('Modifier')()]);
          } }
        ]
      })
    ]);
  };
})(window.DA);
