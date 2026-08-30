/**
 * Style Guide component catalog — Pass 1.
 *
 * Each entry's `render()` calls the real DA.components.* factory the rest
 * of the app uses, not a redrawn mockup -- when a component changes, the
 * catalog reflects it automatically instead of drifting out of sync with
 * hand-copied examples. `tokens` lists the design tokens that component's
 * own CSS actually reads, so a reader can jump straight from a sample to
 * the exact Token Editor rows that would change it.
 *
 * Pass 2 (not yet catalogued here): AppHeader, Avatar, Breadcrumb,
 * ChipInput, Dropdown (as its own entry beyond SelectField), EmptyState,
 * FileUpload, FilterChips, Panel, ScenarioBlock, SearchField, StatRow,
 * SummaryPanel/SummaryPanelFlat, TreeSelectField.
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
    }
  ];
})(window.DA);
