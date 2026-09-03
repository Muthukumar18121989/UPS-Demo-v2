/**
 * Add Accessorial Incentive Plan — opened from "Add Accessorial Incentive
 * Plan" in Pricing Terms > Accessorials, every layout (Option 1's tree,
 * Option 2's dropdown, Option 3's sidebar all share the same trigger and
 * this same dialog).
 *
 * A searchable, filterable catalog of every accessorial charge line a plan
 * could be built from -- Product and Non-Product types mixed together, one
 * radio pick required before Next enables.
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
  DA.dialogs.AddAccessorialIncentivePlanDialog = function AddAccessorialIncentivePlanDialog(options) {
    options = options || {};
    var C = DA.components;
    var rows = DA.data.accessorialCatalog;
    var query = '';
    var filter = 'All';
    var picked = null;
    var tableMount = el('div', { className: 'card' });

    function matches(row) {
      if (filter !== 'All' && row.productType !== filter) return false;
      if (!query) return true;
      var haystack = (row.accessorialType + ' ' + row.productType + ' ' + row.group + ' ' + row.detail).toLowerCase();
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
          name: 'accessorial-catalog-pick',
          'aria-label': 'Select ' + row.detail,
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
          caption: 'Accessorial catalog',
          embedded: true,
          headerTone: 'warm',
          columns: [
            { key: 'select', label: '', width: '48px', render: radioCell },
            { key: 'accessorialType', label: 'Accessorial Type', width: '190px', className: 'is-rowhead' },
            { key: 'productType', label: 'Type', width: '150px' },
            { key: 'group', label: 'Group', width: '220px' },
            { key: 'detail', label: 'Detail', width: '280px' }
          ],
          rows: rows.filter(matches),
          emptyState: el('p', { className: 'table-empty', text: 'No accessorials match your search.' })
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
            { value: 'Product', label: 'Product' },
            { value: 'Non-Product', label: 'Non-Product' }
          ],
          onChange: function (value) { filter = value; renderTable(); }
        })
      ]),
      el('p', {
        className: 'accessorial-picker__note',
        text: 'Data contains both Product and Non-Product types — select one accessorial to proceed.'
      }),
      tableMount,
      el('div', { className: 'dialog-footer' }, [
        nextButton,
        C.Button({ label: 'Close', variant: 'link', onClick: function () { modal.close(); } })
      ])
    ]);

    var modal = C.Modal({
      size: 'wide',
      titleRule: true,
      title: 'Add Accessorial Incentive Plan',
      body: body
    });

    return modal;
  };
})(window.DA);
