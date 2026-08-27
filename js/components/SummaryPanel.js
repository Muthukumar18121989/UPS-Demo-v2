/**
 * SummaryPanel — collapsible record header.
 *
 * Collapsed it shows the identifying fields inline; expanded it adds the full
 * detail grid. Both use the same label/value pair so the record reads
 * consistently either way. `columns` lays fields out side by side in their
 * own stack; `rows` renders after them as full-width lines, for a value too
 * long to share a column (see Detail's `wide`) or one that joins two related
 * fields into a single line.
 */
(function (DA) {
  'use strict';

  var el = DA.dom.el;
  DA.components = DA.components || {};

  var uid = 0;

  /**
   * `chip: true` renders the value as a badge instead of plain text -- for a
   * short categorical value (Customer Hierarchy's Parent/Child), the same
   * treatment a status or tag gets elsewhere in the product. `wide: true`
   * spans the value across the whole row rather than sitting in one column,
   * for a value long enough to wrap onto two or three lines (the packet
   * description) or one made of two related fields joined into one line
   * (a date range, a pair of optional linked-record IDs).
   */
  DA.components.Detail = function Detail(options) {
    options = options || {};
    var hasValue = options.value != null && options.value !== '';
    var text = hasValue ? String(options.value) : '-';

    return el('p', { className: 'detail' + (options.wide ? ' detail--wide' : '') }, [
      el('span', { className: 'detail__label', text: options.label + ':' }),
      ' ',
      options.chip
        ? el('span', { className: 'badge badge--neutral badge--pill', text: text })
        : el('span', { className: 'detail__value', text: text })
    ]);
  };

  DA.components.SummaryPanel = function SummaryPanel(options) {
    options = options || {};
    uid += 1;
    var bodyId = 'summary-panel-' + uid;
    var expanded = options.expanded !== false;

    var body = el('div', {
      className: 'summary-panel__body',
      attrs: { id: bodyId, hidden: !expanded }
    }, (options.columns || []).map(function (column) {
      return el('div', { className: 'summary-panel__column' }, column.map(function (item) {
        return DA.components.Detail(item);
      }));
    }).concat((options.rows || []).map(function (item) {
      return DA.components.Detail(item);
    })));

    var header = el('button', {
      className: 'summary-panel__header',
      attrs: {
        type: 'button',
        'aria-expanded': expanded ? 'true' : 'false',
        'aria-controls': bodyId
      },
      on: {
        click: function () {
          expanded = !expanded;
          header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
          body.hidden = !expanded;
        }
      }
    }, [
      DA.icons.chevronRight(16, 'summary-panel__icon'),
      el('span', { className: 'summary-panel__header-items' },
        (options.headline || []).map(function (item) {
          return DA.components.Detail(item);
        })
      )
    ]);

    return el('section', {
      className: 'summary-panel',
      attrs: { 'aria-label': options.ariaLabel || 'Record summary' }
    }, [header, body]);
  };
})(window.DA);
