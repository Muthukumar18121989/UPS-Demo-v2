/**
 * SummaryPanel — collapsible record header.
 *
 * Collapsed it shows a single identifying title line; expanded it adds the
 * detail fields, grouped into titled sections (Packet Information, Ownership
 * & Audit, and so on) so a long record reads as a few short groups rather
 * than one flat list.
 */
(function (DA) {
  'use strict';

  var el = DA.dom.el;
  DA.components = DA.components || {};

  var uid = 0;

  DA.components.Detail = function Detail(options) {
    return el('p', { className: 'detail' }, [
      el('span', { className: 'detail__label', text: options.label + ':' }),
      ' ',
      el('span', {
        className: 'detail__value',
        text: options.value == null || options.value === '' ? '-' : String(options.value)
      })
    ]);
  };

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

  DA.components.SummaryPanel = function SummaryPanel(options) {
    options = options || {};
    uid += 1;
    var bodyId = 'summary-panel-' + uid;
    var expanded = options.expanded !== false;
    var headline = options.headline || {};

    var body = el('div', {
      className: 'summary-panel__body',
      attrs: { id: bodyId, hidden: !expanded }
    }, (options.sections || []).map(section));

    var titleParts = [
      el('span', { className: 'detail__label', text: headline.label + ':' }),
      ' ',
      el('span', { className: 'summary-panel__title-value', text: headline.value })
    ];
    if (headline.secondary) {
      titleParts.push(' — ');
      titleParts.push(el('span', { className: 'summary-panel__title-value', text: headline.secondary }));
    }

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
      el('span', { className: 'summary-panel__title' }, titleParts)
    ]);

    return el('section', {
      className: 'summary-panel',
      attrs: { 'aria-label': options.ariaLabel || 'Record summary' }
    }, [header, body]);
  };
})(window.DA);
