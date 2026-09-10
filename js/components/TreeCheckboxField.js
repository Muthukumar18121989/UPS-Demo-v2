/**
 * TreeCheckboxField — multi-select dropdown over a label/children tree.
 *
 * Sibling to TreeSelectField (same Dropdown popover, .dropdown__tree*
 * markup, and search-filters-leaves behavior), but every node gets a real
 * checkbox instead of a single selectable value: a leaf toggles itself, a
 * group's checkbox toggles every leaf underneath it at once. An "All" row
 * sits above the tree as the field's own default -- checking it clears
 * every other selection, and checking anything else clears it back; if a
 * caller's own toggle ever leaves nothing checked, this falls back to All
 * rather than sitting in an empty state.
 *
 * `tree` is `[{ label, badge?, children: [...] } | { label, value?, badge? }]`
 * -- a node with `children` renders as an expandable group (a chevron
 * toggle plus its own checkbox); one without renders as a plain checkbox
 * leaf, whether or not it happens to carry a `badge` of its own (a leaf's
 * badge is informational only -- Ground/Export/Import's own item counts
 * here, not a further, unbuilt level of the tree). `allBadge`, when given,
 * renders as a plain badge beside the All row (Choose Account's own
 * "Default"). `onChange(values)` fires on every toggle with the field's
 * current selection: `['All']`, or the array of every checked leaf's own
 * label/value.
 *
 * Only cascades downward (checking a group checks/unchecks its own
 * descendants); a leaf toggled on its own does not walk back up to
 * recompute its ancestor group's own checked state. That's a deliberate
 * simplification for a filter panel with no live data-filtering behind it
 * yet (see profileFilters()/openFiltersDrawer() in analyzerPacketPage.js) --
 * worth revisiting if these filters start actually filtering table rows.
 */
(function (DA) {
  'use strict';

  var el = DA.dom.el;
  DA.components = DA.components || {};

  DA.components.TreeCheckboxField = function TreeCheckboxField(options) {
    options = options || {};
    var tree = options.tree || [];
    var allLabel = options.allLabel || 'All';
    var selected = {}; // value -> true, for every checked node outside of "All"
    var allChecked = true;
    var allCheckboxSet = null; // the All row's own Checkbox `set` fn, wired after creation
    var nodeEntries = []; // { value, setChecked, descendants? }

    function valueOf(node) {
      return node.value == null ? node.label : node.value;
    }

    function syncAllRow() {
      if (allCheckboxSet) allCheckboxSet(allChecked);
      dropdown.setValue(allChecked ? allLabel : (Object.keys(selected).length + ' selected'));
    }

    function fireChange() {
      var values = allChecked ? [allLabel] : Object.keys(selected);
      if (options.onChange) options.onChange(values);
    }

    function reconcileAll() {
      if (Object.keys(selected).length === 0) allChecked = true;
      syncAllRow();
    }

    function setNode(entry, checked) {
      if (checked) selected[entry.value] = true; else delete selected[entry.value];
      entry.setChecked(checked);
      if (entry.descendants) {
        entry.descendants.forEach(function (child) {
          if (checked) selected[child.value] = true; else delete selected[child.value];
          child.setChecked(checked);
        });
      }
    }

    function chooseAll() {
      if (allChecked) return;
      allChecked = true;
      selected = {};
      nodeEntries.forEach(function (entry) { entry.setChecked(false); });
      syncAllRow();
      fireChange();
    }

    function toggleNode(entry, checked) {
      allChecked = false;
      setNode(entry, checked);
      reconcileAll();
      fireChange();
    }

    function buildLeaf(node, depth) {
      var value = valueOf(node);
      var row = el('li', { className: 'dropdown__tree-leaf-node' }, [
        el('div', {
          className: 'dropdown__tree-row',
          style: { '--tree-depth': String(depth) }
        }, [
          DA.components.Checkbox({
            checked: false,
            label: node.label,
            onChange: function (checked) { toggleNode(entry, checked); }
          }),
          node.badge ? el('span', { className: 'dropdown__tree-badge', text: node.badge }) : null
        ])
      ]);
      var entry = { value: value, setChecked: null };
      var input = row.querySelector('.checkbox__input');
      entry.setChecked = function (checked) { input.checked = checked; };
      nodeEntries.push(entry);
      return {
        li: row,
        entry: entry,
        applyFilter: function (query) {
          var visible = !query || node.label.toLowerCase().indexOf(query) !== -1;
          row.hidden = !visible;
          return visible;
        }
      };
    }

    function buildGroup(node, depth) {
      var value = valueOf(node);
      var built = node.children.map(function (child) {
        return child.children ? buildGroup(child, depth + 1) : buildLeaf(child, depth + 1);
      });
      // Every descendant entry (sub-groups included, not just leaves) --
      // checking this group's own checkbox has to walk all the way down,
      // or an intermediate group (Choose Account's own "No Sub Parent")
      // would sit unchecked between a checked parent and a checked leaf.
      var descendantEntries = built.reduce(function (all, child) {
        return all.concat([child.entry], child.entry.descendants || []);
      }, []);

      var childList = el('ul', {
        className: 'dropdown__tree-group',
        attrs: { role: 'group' }
      }, built.map(function (c) { return c.li; }));

      var chevronBtn = el('button', {
        className: 'dropdown__tree-chevron-btn',
        attrs: { type: 'button', 'aria-expanded': 'true', 'aria-label': 'Toggle ' + node.label },
        on: {
          click: function () {
            var open = chevronBtn.getAttribute('aria-expanded') === 'true';
            chevronBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
            childList.hidden = open;
          }
        }
      }, [DA.icons.chevronDown(14, 'dropdown__tree-chevron')]);

      var entry = { value: value, setChecked: null, descendants: descendantEntries };
      var checkboxNode = DA.components.Checkbox({
        checked: false,
        label: node.label,
        onChange: function (checked) { toggleNode(entry, checked); }
      });
      var input = checkboxNode.querySelector('.checkbox__input');
      entry.setChecked = function (checked) { input.checked = checked; };
      nodeEntries.push(entry);

      var row = el('div', {
        className: 'dropdown__tree-row',
        style: { '--tree-depth': String(depth) }
      }, [
        chevronBtn,
        checkboxNode,
        node.badge ? el('span', { className: 'dropdown__tree-badge', text: node.badge }) : null
      ]);

      var li = el('li', { className: 'dropdown__tree-node', attrs: { role: 'treeitem' } }, [row, childList]);

      return {
        li: li,
        entry: entry,
        applyFilter: function (query) {
          var anyVisible = built.reduce(function (found, c) { return c.applyFilter(query) || found; }, false);
          li.hidden = !anyVisible;
          if (query && anyVisible) {
            childList.hidden = false;
            chevronBtn.setAttribute('aria-expanded', 'true');
          }
          return anyVisible;
        }
      };
    }

    var roots = tree.map(function (node) {
      return node.children ? buildGroup(node, 0) : buildLeaf(node, 0);
    });

    var allCheckbox = DA.components.Checkbox({
      checked: true,
      label: allLabel,
      onChange: function (checked) { if (checked) chooseAll(); else allCheckboxSet(true); }
    });
    allCheckboxSet = function (checked) {
      var input = allCheckbox.querySelector('.checkbox__input');
      input.checked = checked;
    };

    var allRow = el('div', { className: 'dropdown__tree-row dropdown__tree-row--all' }, [
      allCheckbox,
      options.allBadge ? el('span', { className: 'dropdown__tree-badge', text: options.allBadge }) : null
    ]);

    var search = DA.components.SearchField({
      label: 'Search ' + (options.label || 'options'),
      placeholder: 'Search Field Label',
      onSearch: function (text) {
        var query = text.trim().toLowerCase();
        roots.forEach(function (r) { r.applyFilter(query); });
      }
    });

    var treeList = el('ul', {
      className: 'dropdown__tree',
      attrs: { role: 'tree', 'aria-label': options.label || 'Options' }
    }, roots.map(function (r) { return r.li; }));

    var dropdown = DA.components.Dropdown({
      label: options.label,
      hideLabel: options.hideLabel,
      value: allLabel,
      triggerClassName: 'select-field__trigger',
      content: [
        el('div', { className: 'dropdown__tree-search' }, [search]),
        allRow,
        treeList
      ]
    });

    var wrapper = el('div', { className: 'form-field' }, [
      el('div', { className: 'field' }, [dropdown])
    ]);

    wrapper.getValue = function () { return allChecked ? [allLabel] : Object.keys(selected); };
    wrapper.reset = function () {
      allChecked = true;
      selected = {};
      nodeEntries.forEach(function (entry) { entry.setChecked(false); });
      syncAllRow();
    };
    return wrapper;
  };
})(window.DA);
