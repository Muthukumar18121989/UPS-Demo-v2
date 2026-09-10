/**
 * Style Guide component catalog — Pass 1 (core controls) + Pass 2 (chrome,
 * layout and the remaining composite fields).
 *
 * Each entry's `render()` calls the real DA.components.* factory the rest
 * of the app uses, not a redrawn mockup -- when a component changes, the
 * catalog reflects it automatically instead of drifting out of sync with
 * hand-copied examples. `tokens` lists the design tokens that component's
 * own CSS actually reads, so a reader can jump straight from a sample to
 * the exact Token Editor rows that would change it.
 */
(function (DA) {
  'use strict';

  var el = DA.dom.el;
  var noop = function () {};

  DA.data = DA.data || {};

  /** A labelled sample inside a catalog entry's demo area. */
  function variant(label, node) {
    return el('div', { className: 'style-guide__variant' }, [
      el('span', { className: 'style-guide__variant-label', text: label }),
      el('div', { className: 'style-guide__variant-sample' }, [node])
    ]);
  }

  DA.data.styleGuideCatalog = [
    {
      id: 'button',
      name: 'Button',
      description: 'The product\'s one clickable-action shape. `variant` picks the visual weight, `shape: \'pill\'` fully rounds it, `iconPosition: \'end\'` puts the icon after the label.',
      tokens: [
        '--color-brand-gold', '--color-brand-gold-hover', '--color-brand-gold-active',
        '--color-border-strong', '--color-text-link', '--color-text-link-hover',
        '--color-disabled-bg', '--color-disabled-border', '--color-disabled-text',
        '--font-weight-semibold', '--radius-pill', '--control-height-md'
      ],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('primary', C.Button({ label: 'Primary', variant: 'primary', onClick: noop })),
          variant('secondary', C.Button({ label: 'Secondary', variant: 'secondary', onClick: noop })),
          variant('ghost', C.Button({ label: 'Ghost', variant: 'ghost', onClick: noop })),
          variant('link', C.Button({ label: 'Link', variant: 'link', onClick: noop })),
          variant('pill', C.Button({ label: 'Pill', variant: 'primary', shape: 'pill', onClick: noop })),
          variant('icon, end', C.Button({
            label: 'Continue', variant: 'primary', icon: DA.icons.chevronRight(14, ''), iconPosition: 'end', onClick: noop
          })),
          variant('disabled', C.Button({ label: 'Disabled', variant: 'primary', disabled: true, onClick: noop }))
        ]);
      }
    },
    {
      id: 'field',
      name: 'Field',
      description: 'Outlined text input with a floating label -- the placeholder carries the label while empty, and it rises to the border once the field holds a value. A trailing `*` in the label is the product\'s required marker.',
      tokens: [
        '--color-field-bg', '--color-field-border', '--color-field-border-hover',
        '--color-field-border-filled', '--color-field-label', '--color-field-placeholder',
        '--color-field-text', '--field-height', '--radius-control'
      ],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('empty', C.Field({ label: 'Enter Bid Number *' })),
          variant('filled', C.Field({ label: 'Bid Name', value: 'Hormel 2024' })),
          variant('with hint', C.Field({ label: 'Scenario Name', value: 'Scenario 1', hint: 'Shown on every bid table row.' })),
          variant('multiline', C.Field({ label: 'Scenario Description', multiline: true }))
        ]);
      }
    },
    {
      id: 'select-field',
      name: 'SelectField',
      description: 'A single-select listbox built on Dropdown, styled and keyboard-driven the same way everywhere it appears -- not the browser\'s native, unstyled `<select>` popover.',
      tokens: [
        '--color-field-bg', '--color-field-border', '--color-primary',
        '--color-surface', '--shadow-sm', '--radius-control'
      ],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('default', C.SelectField({
            label: 'Choose Scenario',
            value: 'Current',
            options: [{ value: 'Current', label: 'Current' }, { value: 'Scenario 1', label: 'Scenario 1' }]
          }))
        ]);
      }
    },
    {
      id: 'checkbox',
      name: 'Checkbox',
      description: 'Native input with a styled box, so keyboard and form semantics stay untouched under the custom look.',
      tokens: ['--color-primary', '--color-on-primary', '--color-border-strong', '--color-focus-ring', '--radius-control'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('unchecked', C.Checkbox({ label: 'Fuel Surcharge', onChange: noop })),
          variant('checked', C.Checkbox({ label: 'Transportation Charges', checked: true, onChange: noop }))
        ]);
      }
    },
    {
      id: 'radio-group',
      name: 'RadioGroup',
      description: 'Round radio inputs for a real mutually-exclusive form choice -- distinct from SegmentedControl, which is a pill-styled view-scope switch, not a form field.',
      tokens: ['--color-primary', '--color-on-primary', '--color-border-strong', '--color-focus-ring', '--radius-pill'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('default', C.RadioGroup({
            name: 'style-guide-basis',
            value: 'net',
            items: [{ value: 'net', label: 'Net' }, { value: 'gross', label: 'Gross' }, { value: 'volume', label: 'Volume' }],
            onChange: noop
          }))
        ]);
      }
    },
    {
      id: 'toggle',
      name: 'Toggle',
      description: 'Labelled switch, rendered as a real button with `aria-checked` so it announces its state and responds to Space/Enter.',
      tokens: ['--color-primary', '--color-border-strong', '--duration-fast'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('off', C.Toggle({ label: 'Sync scroll & highlight', checked: false, onChange: noop })),
          variant('on', C.Toggle({ label: 'Sync scroll & highlight', checked: true, onChange: noop }))
        ]);
      }
    },
    {
      id: 'segmented-control',
      name: 'SegmentedControl',
      description: 'Mutually exclusive scope switch rendered as a pill group, exposed as a radiogroup so arrow keys and screen readers behave as expected.',
      tokens: ['--color-primary', '--color-on-primary', '--color-border', '--radius-pill'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('default', C.SegmentedControl({
            value: 'option2',
            items: [{ value: 'option1', label: 'Option 1' }, { value: 'option2', label: 'Option 2' }],
            onChange: noop
          }))
        ]);
      }
    },
    {
      id: 'tabs',
      name: 'Tabs',
      description: 'One visible panel at a time, following the tablist pattern -- arrow keys move between tabs, Home/End jump to the ends.',
      tokens: ['--color-primary-text', '--color-text-secondary', '--color-border', '--font-weight-medium'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('default', C.Tabs({
            value: 'a',
            items: [
              { id: 'a', label: 'Comparisons', render: function () { return el('p', { text: 'Panel content.' }); } },
              { id: 'b', label: 'Services', render: function () { return el('p', { text: 'Panel content.' }); } },
              { id: 'c', label: 'Charges', render: function () { return el('p', { text: 'Panel content.' }); } }
            ]
          }))
        ]);
      }
    },
    {
      id: 'accordion',
      name: 'Accordion',
      description: 'One collapsible section. The trigger owns `aria-expanded` and points at the panel it controls.',
      tokens: ['--color-border', '--color-text-secondary', '--duration-base'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('default', C.Accordion({
            title: 'Domestic',
            expanded: true,
            content: [el('p', { text: 'Panel content.' })]
          }))
        ]);
      }
    },
    {
      id: 'modal',
      name: 'Modal',
      description: 'Dialog over a dimmed backdrop. Traps Tab, closes on Escape or a backdrop click. `variant: \'drawer\'` anchors it to the right edge as a full-height side sheet.',
      tokens: ['--color-surface', '--color-border', '--shadow-md', '--radius-container', '--color-brand-gold'],
      render: function () {
        var C = DA.components;
        var trigger = C.Button({
          label: 'Open sample modal',
          variant: 'secondary',
          onClick: function () {
            C.Modal({
              title: 'Sample Modal',
              titleRule: true,
              body: el('p', { text: 'This is a real Modal, opened the same way every dialog in the app opens.' })
            }).open();
          }
        });
        return el('div', { className: 'style-guide__row' }, [variant('trigger', trigger)]);
      }
    },
    {
      id: 'status-badge',
      name: 'StatusBadge',
      description: 'Compact state pill. A tone map keeps one status spelling tied to one colour everywhere it appears, so no screen invents its own.',
      tokens: [
        '--color-info', '--color-info-subtle', '--color-success', '--color-success-subtle',
        '--color-warning', '--color-warning-subtle', '--color-error', '--color-error-subtle',
        '--color-neutral-badge', '--color-neutral-badge-subtle', '--radius-pill'
      ],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('info', C.StatusBadge('Sourcing Data', { pill: true })),
          variant('success', C.StatusBadge('Completed', { pill: true })),
          variant('warning', C.StatusBadge('Pending Review', { pill: true })),
          variant('error', C.StatusBadge('Error Occurred', { pill: true })),
          variant('neutral', C.StatusBadge('Draft', { pill: true }))
        ]);
      }
    },
    {
      id: 'alert',
      name: 'Alert',
      description: 'Contextual banner with a leading severity bar. `plain` drops the bar for guidance rather than status.',
      tokens: ['--color-surface-sunken', '--color-border', '--color-surface-inverse', '--color-error', '--color-success'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('info', C.Alert({ message: 'Active Bids sourced for existing customers' })),
          variant('plain', C.Alert({ plain: true, message: 'Values represented as averages' })),
          variant('success', C.Alert({ tone: 'success', message: 'Changes saved.' })),
          variant('error', C.Alert({ tone: 'error', message: 'Something needs your attention.' }))
        ]);
      }
    },
    {
      id: 'data-table',
      name: 'DataTable',
      description: 'The product\'s one tabular pattern: a real `<table>` with a sticky header inside a scrollable viewport. `headerTone`, `tinted` and `freezeColumns` are the styling levers every report table shares.',
      tokens: [
        '--color-surface-inverse', '--color-text-inverse', '--color-border-subtle',
        '--table-header-height', '--table-row-height', '--table-cell-padding-x'
      ],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('warm header, tinted', C.DataTable({
            caption: 'Sample table',
            embedded: true,
            headerTone: 'warm',
            tinted: true,
            columns: [
              { key: 'service', label: 'Core Service', width: '160px', className: 'is-rowhead' },
              { key: 'volume', label: 'Volume', width: '100px', className: 'is-numeric is-end', headerClassName: 'is-end' }
            ],
            rows: [
              { service: 'Next Day Air', volume: '652.0' },
              { service: 'Ground', volume: '20,953.0' }
            ]
          }))
        ]);
      }
    },
    {
      id: 'app-header',
      name: 'AppHeader',
      description: 'Product bar shared by every screen: brand mark + product name on the left, account utilities on the right. `backLink` adds a return path beneath the product name, for screens opened outside the main workflow.',
      tokens: ['--app-header-height', '--color-surface', '--color-brand-shield', '--color-text-primary', '--color-text-link'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row style-guide__row--stack' }, [
          variant('default', C.AppHeader({ productName: 'Digital Analyzer', user: { name: 'Alagulaxman Alagappan', initials: 'AA' } })),
          variant('with back link', C.AppHeader({
            productName: 'Digital Analyzer',
            user: { name: 'Alagulaxman Alagappan', initials: 'AA' },
            backLink: { label: 'Back to My Analyzers', onClick: noop }
          }))
        ]);
      }
    },
    {
      id: 'avatar',
      name: 'Avatar',
      description: 'Initials in a ringed circle. Acts as the account menu trigger.',
      tokens: ['--avatar-size', '--color-primary', '--color-on-primary', '--font-weight-semibold'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('default', C.Avatar({ name: 'Alagulaxman Alagappan', initials: 'AA' }))
        ]);
      }
    },
    {
      id: 'breadcrumb',
      name: 'Breadcrumb',
      description: 'The trail back up the record hierarchy. The last item is the current location and is not a link.',
      tokens: ['--color-text-link', '--color-text-secondary', '--font-size-xs'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('default', C.Breadcrumb({
            items: [
              { label: 'Scenario 1', onClick: noop },
              { label: 'Hormel 2024', onClick: noop },
              { label: 'Account' }
            ]
          }))
        ]);
      }
    },
    {
      id: 'chip-input',
      name: 'ChipInput',
      description: 'Free-text entries committed to removable chips. Space or Enter commits the current entry; pasting a delimited string commits every value in it.',
      tokens: ['--color-field-border', '--color-field-label', '--color-surface-muted', '--radius-control'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('filled', C.ChipInput({ label: 'Enter OPP(s) to link to packet', values: ['OPP-1001', 'OPP-1002'], onChange: noop }))
        ]);
      }
    },
    {
      id: 'dropdown',
      name: 'Dropdown',
      description: 'A trigger that opens a panel beneath it -- the popover mechanics every custom field (SelectField, TreeSelectField, the Comparison View picker) is built on. The caller owns what\'s inside the panel.',
      tokens: ['--color-field-label', '--color-field-border', '--color-surface', '--shadow-sm', '--radius-control'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('default', C.Dropdown({
            label: 'Comparison View',
            value: 'Current',
            content: [
              el('div', { className: 'dropdown__option', text: 'Current' }),
              el('div', { className: 'dropdown__option', text: 'Scenario 1' })
            ]
          }))
        ]);
      }
    },
    {
      id: 'empty-state',
      name: 'EmptyState',
      description: 'Shown in place of table rows when a filter returns nothing.',
      tokens: ['--color-text-muted', '--color-text-primary', '--font-size-sm'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('default', C.EmptyState({
            title: 'No analyzer packets match your search',
            description: 'Check the spelling or clear the search to see all packets.'
          }))
        ]);
      }
    },
    {
      id: 'file-upload',
      name: 'FileDropzone / FileItem',
      description: 'File selection by drop or browse, and the confirmation row for a file that has been attached.',
      tokens: ['--color-border', '--color-surface-muted', '--color-primary', '--radius-container'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('dropzone', C.FileDropzone({ fileType: 'CSV', onFile: noop })),
          variant('attached file', C.FileItem({ name: 'shipping-profile.csv', onRemove: noop }))
        ]);
      }
    },
    {
      id: 'filter-chips',
      name: 'FilterChips',
      description: 'The filters currently applied, each removable.',
      tokens: ['--color-surface-muted', '--color-text-primary', '--radius-pill'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('default', C.FilterChips({ values: ['Fuel Surcharge', 'Transportation Charges'], onChange: noop }))
        ]);
      }
    },
    {
      id: 'panel',
      name: 'Panel',
      description: 'White content surface with an optional toolbar, body and footer. The toolbar keeps filters on the left and the primary action on the right.',
      tokens: ['--color-surface', '--color-border', '--shadow-xs', '--radius-container'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('with toolbar', C.Panel({
            ariaLabel: 'Sample panel',
            toolbar: {
              filters: [C.SearchField({ label: 'Search', placeholder: 'Search' })],
              actions: [C.Button({ label: 'New', variant: 'primary', onClick: noop })]
            },
            body: [el('p', { text: 'Panel body content.' })]
          }))
        ]);
      }
    },
    {
      id: 'scenario-block',
      name: 'ScenarioBlock',
      description: 'One scenario on the Create Scenarios screen: its heading, summary row, and the bid table the row expands to reveal. The baseline scenario copied from sourcing is read-only; scenarios the user creates are editable, which adds account association, linked shipping profiles, bid simulation and a save action.',
      tokens: ['--color-surface', '--color-border', '--color-text-primary', '--color-primary', '--radius-container'],
      render: function () {
        var C = DA.components;
        var scenario = {
          title: 'Scenario 1',
          name: 'Scenario 1',
          description: 'S0 Full Copy',
          status: 'Analysis In Progress',
          editable: true,
          expanded: true,
          included: true,
          number: 1,
          createdDate: '08-18-2026',
          lastModified: '08-18-2026',
          bids: [
            { bidNumber: 'P080040662', bidName: 'UPSC|FLEX|1.00|3.00|100|READY', shippingProfile: 'S1-UPS-PLD-1', construct: 'Daily', selectable: true, selected: true }
          ]
        };
        return el('div', { className: 'style-guide__row style-guide__row--stack' }, [
          variant('editable, expanded', C.ScenarioBlock(scenario, { packet: { customerName: 'APPLEGATE FARMS' }, onOpenAccounts: noop }))
        ]);
      }
    },
    {
      id: 'search-field',
      name: 'SearchField',
      description: 'Labelled search input with a leading icon. Input is debounced so filtering doesn\'t run on every keystroke. `clearable` adds a clear button once the field has text.',
      tokens: ['--color-field-border', '--color-text-muted', '--radius-control'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('clearable', C.SearchField({ label: 'Search accounts', placeholder: 'Search Accounts', clearable: true }))
        ]);
      }
    },
    {
      id: 'stat-row',
      name: 'StatRow',
      description: 'A row of counts summarising the records below it. Each tile carries an icon, the number, and a labelled help affordance.',
      tokens: ['--color-text-primary', '--color-text-secondary', '--font-size-2xl', '--font-weight-semibold'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('default', C.StatRow({
            ariaLabel: 'Sample counts',
            items: [
              { icon: DA.icons.box(26), value: 7, label: 'Total Accounts', help: 'Every account under this bid.' },
              { icon: DA.icons.box(26), value: 6, label: 'UPS Accounts', help: 'Accounts held in the UPS account system.' }
            ]
          }))
        ]);
      }
    },
    {
      id: 'summary-panel',
      name: 'SummaryPanel / SummaryPanelFlat',
      description: 'Collapsible record header. SummaryPanel groups its fields into titled sections (Packet/Customer/User Information); SummaryPanelFlat -- its earlier layout, kept alongside rather than replaced -- lays fields side by side in plain columns instead. See Create Scenarios\' Option 1 / Option 2 switch, which offers both live.',
      tokens: ['--color-surface', '--color-border', '--shadow-xs', '--color-text-primary', '--color-text-secondary'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row style-guide__row--stack' }, [
          variant('grouped (SummaryPanel)', C.SummaryPanel({
            headline: [
              { label: 'Analyzer Packet ID', value: '112002' },
              { label: 'Customer Name', value: 'APPLEGATE FARMS' },
              { label: 'Reference Number', value: '0000067577' }
            ],
            sections: [
              { title: 'Packet Information', columns: 2, fields: [
                { label: 'Analyzer Packet ID', value: '112002' },
                { label: 'Customer Name', value: 'APPLEGATE FARMS' }
              ] }
            ]
          })),
          variant('flat (SummaryPanelFlat)', C.SummaryPanelFlat({
            headline: [{ label: 'Analyzer Packet ID', value: '112002' }, { label: 'Customer Name', value: 'APPLEGATE FARMS' }],
            columns: [[{ label: 'Owner', value: 'Alagulaxman Alagappan' }]]
          }))
        ]);
      }
    },
    {
      id: 'tree-select-field',
      name: 'TreeSelectField',
      description: 'Single-select dropdown over a label/children tree, organized into collapsible groups instead of one flat list. Only a leaf is selectable; a search box filters leaves by label and auto-expands any group holding a match. This is Pricing Terms > Services\' Option 2.',
      tokens: ['--color-field-label', '--color-field-border', '--color-surface', '--shadow-sm', '--color-primary'],
      render: function () {
        var C = DA.components;
        return el('div', { className: 'style-guide__row' }, [
          variant('default', C.TreeSelectField({ label: 'Choose Service', tree: DA.data.pricingServiceTree, onChange: noop }))
        ]);
      }
    }
  ];
})(window.DA);
