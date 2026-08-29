/**
 * DataTable — the product's one tabular pattern.
 *
 * Renders a real <table> with a sticky header inside a scrollable viewport:
 * wide data scrolls horizontally rather than collapsing into cards, so column
 * alignment and row comparison survive on every screen size.
 *
 * columns: [{ key, label, width, align, className, render(row) -> Node|string }]
 *
 * Rows expand when `getChildren(row)` returns rows: the cell named by
 * `expandKey` grows a disclosure toggle, and the children appear beneath their
 * parent, indented, until it is closed again.
 */
(function (DA) {
  'use strict';

  var el = DA.dom.el;
  DA.components = DA.components || {};

  DA.components.DataTable = function DataTable(options) {
    var columns = options.columns || [];
    var rows = options.rows || [];

    // How many leading columns freeze together (Movement + Mode + Core
    // Service, say), not just the first. Needs each of those columns to
    // carry an explicit pixel width (profileKeyColumns and friends already
    // do), since a sticky column's offset is the sum of the ones before it.
    var freezeColumns = Math.min(options.freezeColumns || 1, columns.length);
    var frozenLefts = [];
    (function computeOffsets() {
      var left = 0;
      for (var i = 0; i < freezeColumns; i++) {
        frozenLefts.push(left);
        left += parseFloat(columns[i].width) || 0;
      }
    })();

    /** Sticky styling for a column at `index`, or null if it isn't frozen. */
    function frozenStyle(index) {
      if (index >= freezeColumns) return null;
      return {
        position: 'sticky',
        left: frozenLefts[index] + 'px',
        className: 'is-frozen-col' + (index === freezeColumns - 1 ? ' is-frozen-edge' : '')
      };
    }

    var colgroup = el(
      'colgroup',
      {},
      columns.map(function (column) {
        return el('col', { style: column.width ? { width: column.width } : {} });
      })
    );

    var head = el('thead', {}, [
      el(
        'tr',
        {},
        columns.map(function (column, index) {
          var custom = column.renderHeader ? column.renderHeader() : null;
          var frozen = frozenStyle(index);
          return el('th', {
            text: custom ? null : column.label,
            attrs: { scope: 'col', 'aria-label': column.ariaLabel || false },
            className: (column.headerClassName || '') + (frozen ? ' ' + frozen.className : ''),
            style: frozen ? { position: frozen.position, left: frozen.left } : {}
          }, custom ? [custom] : null);
        })
      )
    ]);

    var body = el('tbody');
    // Rows flagged `expanded` start open, as the reference screens show them.
    var open = [];
    (function seed(list) {
      (list || []).forEach(function (row) {
        if (row && row.expanded) open.push(row);
        if (row && row.children) seed(row.children);
      });
    })(rows);

    function childrenOf(row) {
      var children = options.getChildren ? options.getChildren(row) : null;
      return children && children.length ? children : null;
    }

    /**
     * `spanRepeats` columns (a shared label like Accessorial Type left
     * blank on every row after the one that names it) read as one merged
     * field spanning the whole run rather than a real rowspan: this cell's
     * own bottom border is dropped whenever the row right after it is
     * still part of the same run, i.e. that column is blank there too.
     * The border only reappears on the run's last row, where the value
     * changes again.
     */
    function spansIntoNext(column, nextRow) {
      return Boolean(column.spanRepeats && nextRow && !nextRow[column.key]);
    }

    function cell(column, row, depth, index, nextRow) {
      var content = column.render ? column.render(row) : row[column.key];
      var isNode = content instanceof Node;
      var children = column.key === options.expandKey ? childrenOf(row) : null;
      var frozen = frozenStyle(index);
      var spanContinues = spansIntoNext(column, nextRow);

      if (column.key === options.expandKey) {
        var label = isNode ? content : el('span', { text: content == null ? '' : String(content) });
        var expanded = open.indexOf(row) !== -1;
        var inner = [];

        if (children) {
          inner.push(el('button', {
            className: 'row-toggle u-tap-target',
            attrs: {
              type: 'button',
              'aria-expanded': expanded ? 'true' : 'false',
              'aria-label': (expanded ? 'Collapse ' : 'Expand ') +
                (isNode ? (row[column.key] || 'row') : String(content))
            },
            on: {
              click: function () {
                var at = open.indexOf(row);
                if (at === -1) open.push(row); else open.splice(at, 1);
                render();
              }
            }
          }, [expanded ? DA.icons.chevronDown(14) : DA.icons.chevronRight(14, '')]));
        }
        inner.push(label);

        return el('td', {
          className: (column.className || '') + ' has-expander' +
            (depth ? ' is-child-cell' : '') + (frozen ? ' ' + frozen.className : ''),
          style: Object.assign(
            depth ? { 'padding-left': (depth * 20 + 12) + 'px' } : {},
            frozen ? { position: frozen.position, left: frozen.left } : {}
          )
        }, [el('span', { className: 'expand-cell' }, inner)]);
      }

      var plain = content == null ? '' : String(content);
      return el('td', {
        className: (column.className || '') + (frozen ? ' ' + frozen.className : '') +
          (spanContinues ? ' is-span-continuation' : ''),
        text: isNode ? null : content,
        // Only a cell that actually holds text carries a tooltip; an empty
        // one was producing an empty tooltip on hover.
        attrs: { title: !isNode && plain ? plain : false },
        style: frozen ? { position: frozen.position, left: frozen.left } : {}
      }, isNode ? [content] : null);
    }

    function addRow(row, depth, nextRow) {
      body.appendChild(el('tr', {
        className: (options.rowClassName ? options.rowClassName(row) : '') +
          (depth ? ' is-child-row' : '')
      }, columns.map(function (column, index) { return cell(column, row, depth, index, nextRow); })));
    }

    /**
     * Rows in final render order, each paired with the depth it renders at
     * -- collected up front (rather than appended as each is visited) so a
     * spanRepeats column can look at the row right after it before that
     * row's own <tr> exists yet.
     */
    function flatten() {
      var flat = [];
      function visit(row, depth) {
        flat.push({ row: row, depth: depth });
        if (open.indexOf(row) !== -1) {
          (childrenOf(row) || []).forEach(function (child) { visit(child, depth + 1); });
        }
      }
      rows.forEach(function (row) { visit(row, 0); });
      return flat;
    }

    function render() {
      DA.dom.clear(body);
      if (rows.length === 0) {
        // Fixed column widths would hold the table at its full scrolling
        // width with nothing in it, pushing the empty state off to the side.
        table.classList.add('data-table--empty');
        if (colgroup.parentNode) table.removeChild(colgroup);
        body.appendChild(
          el('tr', { className: 'is-empty-row' }, [
            el('td', { attrs: { colspan: columns.length }, style: { 'white-space': 'normal' } }, [
              options.emptyState || DA.components.EmptyState({ title: 'No records found' })
            ])
          ])
        );
        return;
      }
      table.classList.remove('data-table--empty');
      if (!colgroup.parentNode) table.insertBefore(colgroup, head);
      var flat = flatten();
      flat.forEach(function (entry, index) {
        var next = flat[index + 1];
        addRow(entry.row, entry.depth, next ? next.row : null);
      });
    }


    var table = el('table', {
      className: 'data-table' +
        (options.embedded ? ' data-table--auto' : '') +
        (options.headerTone ? ' data-table--' + options.headerTone : '') +
        (options.tinted ? ' data-table--tinted' : '')
    }, [
      options.caption
        ? el('caption', { className: 'u-visually-hidden', text: options.caption })
        : null,
      colgroup,
      head,
      body
    ]);

    render();

    var viewport = el(
      'div',
      {
        className: 'data-table__viewport scroll-area' +
          (options.embedded ? ' data-table__viewport--auto' : ''),
        attrs: {
          tabindex: '0',
          role: 'region',
          'aria-label': options.caption || 'Data table'
        }
      },
      [table]
    );

    // The row-header column freezes alongside the already-always-sticky
    // header row -- unconditionally, no toggle. Freezing a single-column
    // stand-in (the empty-state placeholder tables use exactly one) would
    // have nothing to freeze against, so it's skipped there.
    if (columns.length > 1) table.classList.add('data-table--frozen');

    return viewport;
  };

  /**
   * Record link cell: identifier + chevron affordance, one hit target.
   * `onClick`, when given, is called instead of following `href` -- the
   * caller owns navigation, `href` stays only for right-click/open-in-tab
   * and as a fallback.
   */
  DA.components.RecordLink = function RecordLink(options) {
    return el(
      'a',
      {
        className: 'record-link',
        attrs: {
          href: options.href || '#',
          'aria-label': options.ariaLabel || false
        },
        on: options.onClick
          ? { click: function (event) { event.preventDefault(); options.onClick(event); } }
          : {}
      },
      [
        el('span', { className: 'record-link__label', text: options.label }),
        DA.icons.chevronRight(14)
      ]
    );
  };
})(window.DA);
