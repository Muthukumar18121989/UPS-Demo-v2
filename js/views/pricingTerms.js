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
          el('span', { className: 'matrix__label-sub', text: group.variant + '  ' + group.codes })
        ])
      ].concat(group.rates.map(function (rate, index) {
        var band = tier.bands[index];
        return el('td', { className: 'matrix__cell' + (band && band.target ? ' is-target' : '') }, [
          editableCell(rate, { editable: !(band && band.locked) })
        ]);
      })));
    })));

    return el('div', { className: 'card' }, [
      el('div', { className: 'tier-header' }, [
        DA.icons.chevronDown(16, 'tier-header__icon'),
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
      el('div', { className: 'data-table__viewport scroll-area data-table__viewport--auto' }, [
        el('table', { className: 'matrix' }, [
          el('caption', { className: 'u-visually-hidden', text: tier.tier + ' incentives' }),
          head,
          body
        ])
      ])
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
   * shaped like TreeSelectField's own leaf records so the initial plan
   * shown before any selection reads the same as one chosen from it.
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

  function servicesView() {
    var C = DA.components;
    var tree = DA.data.pricingServiceTree;
    var planSlot = el('div', {});

    function showPlan(leaf) {
      DA.dom.clear(planSlot).appendChild(
        el('div', { className: 'plan-detail-panel' }, [
          el('p', { className: 'plan-detail-panel__title', text: leaf.path.join(' / ') }),
          servicePlan()
        ])
      );
    }

    var defaultLeaf = firstLeaf(tree);
    var select = C.TreeSelectField({
      label: 'Choose Service',
      tree: tree,
      value: defaultLeaf && defaultLeaf.value,
      onChange: function (value, leaf) { showPlan(leaf); }
    });

    if (defaultLeaf) showPlan(defaultLeaf);

    return el('div', {}, [
      el('div', { style: { padding: 'var(--space-4) var(--space-4) 0' } }, [
        el('a', { className: 'link-with-icon', attrs: { href: '#add-plan' } }, [
          DA.icons.plusCircle(18),
          el('span', { text: 'Add Service Incentive Plan' })
        ])
      ]),
      el('div', { className: 'view-filters' }, [
        el('div', { className: 'view-filters__field' }, [select])
      ]),
      planSlot
    ]);
  }

  /* ---- Accessorials -------------------------------------------------------- */

  /**
   * Accessorials reads as a tree of cards rather than Services' single-select
   * dropdown: several charge families can be open at once, and Delivery Area
   * opens onto its own Delivery Area Commercial card rather than a lone
   * plan, so a plain accordion (each card its own toggle) fits where
   * TreeSelectField's "pick exactly one leaf" doesn't.
   */
  function accessorialsView(numeric) {
    var C = DA.components;

    function accessorialTable(rows) {
      return C.DataTable({
        caption: 'Accessorial incentive plan',
        embedded: true,
        headerTone: 'warm',
        tinted: true,
        columns: [
          { key: 'movement', label: 'Movement', width: '130px', className: 'is-rowhead' },
          { key: 'mode', label: 'Mode', width: '100px', className: 'is-rowhead' },
          { key: 'serviceGroup', label: 'Service Group', width: '140px' },
          { key: 'service', label: 'Core Service', width: '190px' },
          numeric('adu', 'ADU', { width: '100px' }),
          numeric('nrpp', 'NRPP', { width: '100px' }),
          {
            key: 'incentiveType',
            label: 'Incentive Type',
            width: '160px',
            className: 'is-numeric is-end',
            headerClassName: 'is-end',
            render: function (row) { return editableCell(row.incentiveType); }
          },
          {
            key: 'incentiveAmount',
            label: 'Incentive Amount',
            width: '170px',
            className: 'is-numeric is-end',
            headerClassName: 'is-end',
            render: function (row) { return editableCell(row.incentiveAmount); }
          }
        ],
        rows: rows
      });
    }

    /** A charge family with nothing built under it yet still opens -- onto
        the product's empty table state, same as any other unbuilt view. */
    function accessorialNode(node) {
      return C.Accordion({
        title: node.label,
        className: 'accordion--charges',
        expanded: Boolean(node.expanded),
        renderContent: function () {
          if (node.children) return node.children.map(accessorialNode);
          if (node.rows) return [accessorialTable(node.rows)];
          return [el('p', { className: 'table-empty', text: 'No data available.' })];
        }
      });
    }

    return el('div', { className: 'card' }, [
      el('div', { style: { padding: 'var(--space-4) var(--space-4) 0' } }, [
        el('a', { className: 'link-with-icon', attrs: { href: '#add-accessorial-plan' } }, [
          DA.icons.plusCircle(18),
          el('span', { text: 'Add Accessorial Incentive Plan' })
        ])
      ]),
      el('div', { className: 'accessorial-tree' },
        DA.data.pricingAccessorialTree.map(accessorialNode)
      )
    ]);
  }

  /**
   * @param {Object} context  { packet, numeric, filters, emptyView, updatePacketAction }
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
            return el('div', {}, [context.filters(), el('div', { className: 'card' }, [servicesView()])]);
          } },
          { id: 'accessorials', label: 'Accessorials', render: function () {
            return el('div', {}, [
              context.filters(),
              accessorialsView(context.numeric),
              context.updatePacketAction()
            ]);
          } },
          { id: 'modifiers', label: 'Modifiers', render: function () {
            return el('div', {}, [context.filters(), context.emptyView('Modifier')()]);
          } }
        ]
      })
    ]);
  };
})(window.DA);
