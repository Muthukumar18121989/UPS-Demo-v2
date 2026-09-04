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
 *
 * `onColumnHover(index, info)` opts a table into column-wise highlighting:
 * hovering any cell lights that whole column (header + body) instead of the
 * row, and the callback fires with `{ column, headerCell }` so the caller can
 * float column-level detail beside it (see the scenario comparison band).
 * `index` and `info` are null once the pointer leaves the table.
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
            // A native tooltip -- the column's own one-line description,
            // when a caller supplies one -- rather than any bespoke hover
            // popover; the browser's own title attribute already does
            // exactly this, so no custom hover machinery is needed for it.
            attrs: {
              scope: 'col',
              'aria-label': column.ariaLabel || false,
              title: column.headerTitle || false
            },
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

    function cell(column, row, depth, index, nextRow, nextDepth) {
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

        // Opt-in (`column.mergeExpanded`) rather than every expand-key
        // column's own default: Cost Details/Zones/Weight & Cube's own
        // Core Service column reads as one merged block for as long as
        // the next row is still nested (depth > 0) under some expanded
        // parent -- a real Core Service group's own row through every
        // package/zone row it opens onto -- rather than a fresh divider
        // between each. The line only comes back once the next row is
        // itself a top-level (depth 0) entry, the same "still inside the
        // same run" idea spanRepeats columns use, just keyed off nesting
        // depth instead of a repeated blank value. Comparisons/Charges/
        // Accounts' own expand-key columns don't set this, so they keep
        // their existing borders on every row exactly as before.
        var groupContinues = column.mergeExpanded && nextRow != null && nextDepth > 0;

        return el('td', {
          className: (column.className || '') + ' has-expander' +
            (depth ? ' is-child-cell' : '') + (frozen ? ' ' + frozen.className : '') +
            (groupContinues ? ' is-span-continuation' : ''),
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

    function addRow(row, depth, nextRow, nextDepth) {
      body.appendChild(el('tr', {
        className: (options.rowClassName ? options.rowClassName(row) : '') +
          (depth ? ' is-child-row' : '')
      }, columns.map(function (column, index) { return cell(column, row, depth, index, nextRow, nextDepth); })));
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
        addRow(entry.row, entry.depth, next ? next.row : null, next ? next.depth : null);
      });
    }


    var table = el('table', {
      className: 'data-table' +
        (options.embedded ? ' data-table--auto' : '') +
        (options.headerTone ? ' data-table--' + options.headerTone : '') +
        (options.tinted ? ' data-table--tinted' : '') +
        (options.noRowheadHover ? ' data-table--no-rowhead-hover' : '')
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

    if (typeof options.onColumnHover === 'function') {
      setupColumnHover(table, viewport, columns, options.onColumnHover);
    }

    return viewport;
  };

  /**
   * Column-wise hover: light the whole column under the pointer and tell the
   * caller which one it is. Moving between cells in the same column is a
   * no-op; leaving the scroll viewport clears it.
   */
  function setupColumnHover(table, viewport, columns, notify) {
    var active = -1;

    function cellsInColumn(index) {
      var out = [];
      var rows = table.rows; // thead row(s) then every tbody row, in order
      for (var r = 0; r < rows.length; r++) {
        var c = rows[r].cells[index];
        if (c && !c.hasAttribute('colspan')) out.push(c);
      }
      return out;
    }

    function clear() {
      if (active === -1) return;
      cellsInColumn(active).forEach(function (c) { c.classList.remove('is-col-highlight'); });
      table.classList.remove('has-col-highlight');
      active = -1;
    }

    function paint(index) {
      if (index === active) return;
      clear();
      if (index < 0 || index >= columns.length) { notify(null, null); return; }
      active = index;
      cellsInColumn(index).forEach(function (c) { c.classList.add('is-col-highlight'); });
      table.classList.add('has-col-highlight');
      var headRow = table.tHead && table.tHead.rows[0];
      notify(index, { column: columns[index], headerCell: headRow && headRow.cells[index] });
    }

    table.addEventListener('mouseover', function (event) {
      var cell = event.target.closest && event.target.closest('th, td');
      if (!cell || cell.hasAttribute('colspan')) return;
      paint(cell.cellIndex);
    });

    viewport.addEventListener('mouseleave', function () {
      clear();
      notify(null, null);
    });
  }

  /**
   * Record link cell: identifier + chevron affordance, one hit target.
   * `onClick` navigates in place (event.preventDefault() first) instead of
   * following `href`, for records opened without a real route behind them.
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
