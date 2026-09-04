/**
 * Add Service Incentive Plan — opened from "Add Service Incentive Plan" in
 * Pricing Terms > Services, every layout (Option 1's tree, Option 2's
 * dropdown, Option 3's sidebar all share the same trigger and this same
 * dialog). Same shape as Accessorials' own AddAccessorialIncentivePlanDialog
 * -- search + filter over a radio-select catalog table, Next disabled until
 * a row is picked -- built from the same movement/mode/serviceGroup/service
 * rows accessorialPlan() already renders per leaf (DA.data.pricingAccessorialIncentives),
 * rather than a second, newly-invented services catalog.
 */
(function (DA) {
  'use strict';

  var el = DA.dom.el;

  DA.dialogs = DA.dialogs || {};

  /**
   * @param {Object} [options]
   * @param {Function} [options.onSelect]  called with the picked catalog
   *                                        row once Next is pressed
   */
  DA.dialogs.AddServiceIncentivePlanDialog = function AddServiceIncentivePlanDialog(options) {
    options = options || {};
    var C = DA.components;
    var rows = DA.data.pricingAccessorialIncentives;
    var query = '';
    var filter = 'All';
    var picked = null;
    var tableMount = el('div', { className: 'card' });

    function matches(row) {
      if (filter !== 'All' && row.mode !== filter) return false;
      if (!query) return true;
      var haystack = (row.movement + ' ' + row.mode + ' ' + row.serviceGroup + ' ' + row.service).toLowerCase();
      return haystack.indexOf(query.toLowerCase()) !== -1;
    }

    var nextButton = C.Button({
      label: 'Next',
      variant: 'primary',
      shape: 'pill',
      icon: DA.icons.chevronRight(14, ''),
      iconPosition: 'end',
      disabled: true,
      onClick: function () {
        modal.close();
        if (picked && options.onSelect) options.onSelect(picked);
      }
    });

    function radioCell(row) {
      return el('input', {
        attrs: {
          type: 'radio',
          name: 'service-catalog-pick',
          'aria-label': 'Select ' + row.service,
          checked: picked === row
        },
        on: {
          change: function () {
            picked = row;
            nextButton.disabled = false;
          }
        }
      });
    }

    function renderTable() {
      DA.dom.clear(tableMount).appendChild(
        C.DataTable({
          caption: 'Service catalog',
          embedded: true,
          headerTone: 'warm',
          columns: [
            { key: 'select', label: '', width: '48px', render: radioCell },
            { key: 'movement', label: 'Movement', width: '150px', className: 'is-rowhead' },
            { key: 'mode', label: 'Mode', width: '130px' },
            { key: 'serviceGroup', label: 'Service Group', width: '180px' },
            { key: 'service', label: 'Service', width: '220px' }
          ],
          rows: rows.filter(matches),
          emptyState: el('p', { className: 'table-empty', text: 'No services match your search.' })
        })
      );
    }

    renderTable();

    var body = el('div', {}, [
      el('div', { className: 'accessorial-picker__filters' }, [
        el('div', { className: 'accessorial-picker__search' }, [
          C.SearchField({
            label: 'Search Table',
            placeholder: 'Search Table',
            clearable: true,
            onSearch: function (value) { query = value; renderTable(); }
          })
        ]),
        C.SelectField({
          label: 'Filter',
          value: filter,
          options: [
            { value: 'All', label: 'All' },
            { value: 'Air', label: 'Air' },
            { value: 'Ground', label: 'Ground' }
          ],
          onChange: function (value) { filter = value; renderTable(); }
        })
      ]),
      el('p', { className: 'accessorial-picker__note', text: 'Select one service to proceed.' }),
      tableMount,
      el('div', { className: 'dialog-footer' }, [
        nextButton,
        C.Button({ label: 'Close', variant: 'link', onClick: function () { modal.close(); } })
      ])
    ]);

    var modal = C.Modal({
      size: 'wide',
      titleRule: true,
      title: 'Add Service Incentive Plan',
      body: body
    });

    return modal;
  };
})(window.DA);
