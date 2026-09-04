/**
 * SummaryPanel — collapsible record header.
 *
 * Collapsed it shows a single identifying title line; expanded it adds the
 * detail fields, grouped into titled sections (Packet Information, Customer
 * Information, User Information) so a long record reads as a few short groups
 * rather than one flat list.
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
   * description).
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

  /** One titled, boxed group of fields inside the expanded body. */
  function section(group) {
    return el('div', { className: 'summary-panel__section' }, [
      el('p', { className: 'summary-panel__section-title', text: group.title }),
      el('div', {
        className: 'summary-panel__section-grid',
        style: { '--summary-panel-columns': String(group.columns || 3) }
      }, (group.fields || []).map(function (field) {
        return DA.components.Detail(field);
      }))
    ]);
  }

  /**
   * SummaryPanel's earlier layout -- fields side by side in plain columns,
   * a headline of several fields rather than one title line, no section
   * grouping. Kept alongside the grouped version (not replaced by it) so a
   * page can offer both as a live-switchable "Option 1 / Option 2" demo
   * choice rather than only ever showing one.
   */
  DA.components.SummaryPanelFlat = function SummaryPanelFlat(options) {
    options = options || {};
    uid += 1;
    var bodyId = 'summary-panel-flat-' + uid;
    var expanded = options.expanded !== false;

    var columnNodes = (options.columns || []).map(function (column) {
      return el('div', { className: 'summary-panel__column' }, column.map(function (item) {
        return DA.components.Detail(item);
      }));
    });
    var rowNodes = (options.rows || []).map(function (item) {
      return DA.components.Detail(item);
    });
    var divider = columnNodes.length && rowNodes.length
      ? [el('hr', { className: 'summary-panel__divider' })]
      : [];

    var body = el('div', {
      className: 'summary-panel__body summary-panel__body--flat',
      attrs: { id: bodyId, hidden: !expanded }
    }, columnNodes.concat(divider, rowNodes));

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

  /**
   * `bodyContent` renders in place of `sections` for a caller with its own
   * body markup already built (Option 3's column layout) rather than the
   * titled-section shape `sections` maps into. `chevronPosition: 'end'`
   * moves the disclosure chevron to the header's right edge instead of
   * its usual left -- Option 3's own placement, distinct from Option 1/2's
   * shared left-chevron convention, so this is opt-in per call rather
   * than a change to the default.
   */
  DA.components.SummaryPanel = function SummaryPanel(options) {
    options = options || {};
    uid += 1;
    var bodyId = 'summary-panel-' + uid;
    var expanded = options.expanded !== false;
    var chevronEnd = options.chevronPosition === 'end';

    var bodyChildren = options.bodyContent || (options.sections || []).map(section);
    var body = el('div', {
      className: 'summary-panel__body' + (chevronEnd ? ' summary-panel__body--chevron-end' : ''),
      attrs: { id: bodyId, hidden: !expanded }
    }, bodyChildren);

    var chevron = DA.icons.chevronRight(16, 'summary-panel__icon');
    // Same header row SummaryPanelFlat's collapsed state uses -- Packet
    // ID, Customer Name and Reference Number side by side in the same
    // .summary-panel__header-items grid -- instead of one flat title
    // string, so the collapsed header carries the same information
    // regardless of which option is showing.
    var headlineItems = el('span', { className: 'summary-panel__header-items' },
      (options.headline || []).map(function (item) {
        return DA.components.Detail(item);
      })
    );

    var header = el('button', {
      className: 'summary-panel__header' + (chevronEnd ? ' summary-panel__header--chevron-end' : ''),
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
    }, chevronEnd ? [headlineItems, chevron] : [chevron, headlineItems]);

    return el('section', {
      className: 'summary-panel',
      attrs: { 'aria-label': options.ariaLabel || 'Record summary' }
    }, [header, body]);
  };
})(window.DA);
