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
      el('span', { text: value }),
      options.editable === false
        ? null
        : el('button', {
            className: 'icon-action u-tap-target',
            attrs: { type: 'button', 'aria-label': 'Edit ' + value }
          }, [DA.icons.pencil(13)])
    ]);
  }

  /* ---- Tier Incentives ---------------------------------------------------- */

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
          el('span', { className: 'matrix__label-sub', text: group.sublabel })
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

  /** The incentive settings for one service: options, method and rate grid. */
  function servicePlan() {
    var C = DA.components;
    var zones = DA.data.rateZones;

    var grid = el('table', { className: 'matrix' }, [
      el('caption', { className: 'u-visually-hidden', text: 'Weight break incentives by zone' }),
      el('thead', {}, [
        el('tr', {}, [
          el('th', {
            className: 'matrix__rowhead',
            attrs: { scope: 'col', colspan: 2, rowspan: 2 },
            text: 'Billable Weight (lbs)'
          }),
          el('th', { attrs: { scope: 'colgroup', colspan: zones.length }, text: 'Domestic' }),
          el('th', { attrs: { scope: 'col', rowspan: 2 }, text: '' })
        ]),
        el('tr', {}, zones.map(function (zone) {
          return el('th', { attrs: { scope: 'col' }, text: zone });
        }))
      ]),
      el('tbody', {}, DA.data.weightBreaks.map(function (band) {
        return el('tr', {}, [
          el('th', { className: 'matrix__rowhead', attrs: { scope: 'row' }, text: band.from }),
          el('td', { className: 'matrix__rowhead', text: band.to })
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
        return C.Checkbox({ checked: true, label: option });
      })),
      C.SegmentedControl({
        ariaLabel: 'Incentive basis',
        value: 'cell',
        items: [
          { value: 'base', label: 'Base/Zone' },
          { value: 'cell', label: 'Cell by Cell/Customs' },
          { value: 'minimum', label: 'Minimum' }
        ]
      }),
      el('div', { className: 'field-row' }, [
        el('span', { className: 'field-row__label', text: 'Incentive Method *' }),
        C.SelectField({
          label: 'Incentive Method',
          hideLabel: true,
          value: 'Weight Break',
          options: DA.data.filterOptions.incentiveMethod.map(function (value) {
            return { value: value, label: value };
          })
        })
      ]),
      el('div', { className: 'card' }, [
        el('p', { className: 'rate-grid__caption', text: 'Zone Reference: Daily' }),
        el('div', { className: 'grid-scroll scroll-area' }, [grid]),
        el('div', { className: 'grid-footer' }, [
          el('a', { className: 'link-with-icon', attrs: { href: '#add-weight-break' } }, [
            DA.icons.plusCircle(18),
            el('span', { text: 'Add weight break' })
          ]),
          el('a', { className: 'link-with-icon', attrs: { href: '#save-changes' } }, [
            DA.icons.save(15),
            el('span', { text: 'Save Changes' })
          ])
        ])
      ])
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

    return el('div', {}, [
      el('div', { style: { padding: 'var(--space-4) var(--space-4) 0' } }, [
        el('a', { className: 'link-with-icon', attrs: { href: options.addHref } }, [
          DA.icons.plusCircle(18),
          el('span', { text: options.addLabel })
        ])
      ]),
      el('div', { className: 'view-filters' }, [
        el('div', { className: 'view-filters__field' }, [select])
      ]),
      planSlot
    ]);
  }

  /** Option 2: the searchable single-select tree dropdown, current default. */
  function servicesView() {
    return planPicker({
      tree: DA.data.pricingServiceTree,
      leafRender: servicePlan,
      selectLabel: 'Choose Service',
      addHref: '#add-plan',
      addLabel: 'Add Service Incentive Plan'
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
      el('div', { style: { padding: 'var(--space-4) var(--space-4) 0' } }, [
        el('a', { className: 'link-with-icon', attrs: { href: '#add-plan' } }, [
          DA.icons.plusCircle(18),
          el('span', { text: 'Add Service Incentive Plan' })
        ])
      ]),
      el('div', { className: 'plan-tree' }, DA.data.pricingServiceTree.map(function (region) {
        return planNode({ label: region.label, children: region.children, expanded: true }, servicePlan);
      }))
    ]);
  }

  /** Services tab: Option 1 (tree) / Option 2 (dropdown), swapped live. */
  function servicesViewSwitchable() {
    var C = DA.components;
    var option = 'option2';
    var mount = el('div', { className: 'card' });

    function render() {
      DA.dom.clear(mount).appendChild(option === 'option1' ? servicesTreeView() : servicesView());
    }

    var switcher = C.SegmentedControl({
      ariaLabel: 'Services view layout',
      value: option,
      items: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
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

    function labelColumn(key, label, width) {
      return { key: key, label: label, width: width || '140px', className: 'is-rowhead' };
    }

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
        // Movement, Mode, Service Group and Core Service together identify
        // the line -- frozen as a group, same as Adjustments.
        freezeColumns: 4,
        columns: [
          labelColumn('movement', 'Movement', '110px'),
          labelColumn('mode', 'Mode', '90px'),
          labelColumn('serviceGroup', 'Service Group', '130px'),
          labelColumn('service', 'Core Service', '170px'),
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

  /** Option 2: the searchable single-select tree dropdown, current default. */
  function accessorialsView() {
    return planPicker({
      tree: DA.data.pricingAccessorialTree,
      leafRender: accessorialPlan,
      selectLabel: 'Choose Accessorial',
      addHref: '#add-accessorial-plan',
      addLabel: 'Add Accessorial Incentive Plan'
    });
  }

  /** Option 1: the earlier always-expanded nested-accordion hierarchy,
      restored alongside Option 2 the same way Services' was. */
  function accessorialsTreeView() {
    return el('div', {}, [
      el('div', { style: { padding: 'var(--space-4) var(--space-4) 0' } }, [
        el('a', { className: 'link-with-icon', attrs: { href: '#add-accessorial-plan' } }, [
          DA.icons.plusCircle(18),
          el('span', { text: 'Add Accessorial Incentive Plan' })
        ])
      ]),
      el('div', { className: 'plan-tree' }, DA.data.pricingAccessorialTree.map(function (node) {
        return planNode(node, accessorialPlan);
      }))
    ]);
  }

  /** Accessorials tab: Option 1 (tree) / Option 2 (dropdown), swapped live. */
  function accessorialsViewSwitchable() {
    var C = DA.components;
    var option = 'option2';
    var mount = el('div', { className: 'card' });

    function render() {
      DA.dom.clear(mount).appendChild(option === 'option1' ? accessorialsTreeView() : accessorialsView());
    }

    var switcher = C.SegmentedControl({
      ariaLabel: 'Accessorials view layout',
      value: option,
      items: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
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
