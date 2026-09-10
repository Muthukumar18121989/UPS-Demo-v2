/**
 * Style Guide — component catalog (documentation) + Token Editor (the
 * "admin" piece that actually changes the live app).
 *
 * Reached from the header's Design System link, from anywhere in the app.
 * See js/core/designTokens.js and js/core/tokenOverrides.js for what
 * Submit actually does and why (this is a static app -- there's no server
 * to rewrite styles/tokens.css from, so Submit applies + persists in the
 * browser and offers an export instead).
 */
(function (DA) {
  'use strict';

  var el = DA.dom.el;

  DA.pages = DA.pages || {};

  /* ---- Components tab ----------------------------------------------------- */

  function componentsTab() {
    return el('div', { className: 'style-guide__entries' },
      DA.data.styleGuideCatalog.map(function (entry) {
        return el('section', { className: 'style-guide__entry', attrs: { 'aria-labelledby': 'sg-' + entry.id } }, [
          el('h3', { className: 'style-guide__entry-title', id: 'sg-' + entry.id, text: entry.name }),
          el('p', { className: 'style-guide__entry-desc', text: entry.description }),
          el('div', { className: 'style-guide__sample' }, [entry.render()]),
          el('div', { className: 'style-guide__tokens' }, [
            el('span', { className: 'style-guide__tokens-label', text: 'Tokens used' }),
            el('div', { className: 'style-guide__token-chips' },
              entry.tokens.map(function (name) {
                return el('code', { className: 'style-guide__token-chip', text: name });
              }))
          ])
        ]);
      })
    );
  }

  /* ---- Tokens tab ----------------------------------------------------------- */

  /** Splits "12px" / "0.75rem" / "180ms" into { number, unit }. Values with
      no trailing unit (line-height, font-weight) come back with unit ''. */
  function splitValue(value) {
    var match = /^(-?[\d.]+)([a-z%]*)$/i.exec(String(value).trim());
    if (!match) return { number: null, unit: '' };
    return { number: parseFloat(match[1]), unit: match[2] };
  }

  function tokenControl(token, draft, onEdit) {
    var current = Object.prototype.hasOwnProperty.call(draft, token.name)
      ? draft[token.name]
      : DA.tokenOverrides.currentValue(token.name);

    function commitLocal(value) {
      draft[token.name] = value;
      onEdit(token.name, value);
    }

    var control;

    if (token.kind === 'color') {
      var swatch = el('input', {
        attrs: { type: 'color', value: /^#[0-9a-f]{6}$/i.test(current) ? current : '#000000' }
      });
      var hexField = el('input', { className: 'token-editor__hex', attrs: { type: 'text', value: current } });
      swatch.addEventListener('input', function () { hexField.value = swatch.value; commitLocal(swatch.value); });
      hexField.addEventListener('change', function () {
        if (/^#[0-9a-f]{6}$/i.test(hexField.value)) swatch.value = hexField.value;
        commitLocal(hexField.value);
      });
      control = el('div', { className: 'token-editor__color' }, [swatch, hexField]);
    } else if (token.kind === 'font-family') {
      var familyField = el('input', { className: 'token-editor__text', attrs: { type: 'text', value: current } });
      familyField.addEventListener('change', function () { commitLocal(familyField.value); });
      control = familyField;
    } else if (token.kind === 'font-weight') {
      var select = el('select', { className: 'token-editor__select' },
        ['400', '500', '600', '700'].map(function (w) {
          return el('option', { text: w, attrs: { value: w, selected: String(current) === w } });
        }));
      select.addEventListener('change', function () { commitLocal(select.value); });
      control = select;
    } else if (['spacing', 'radius', 'dimension', 'font-size', 'duration'].indexOf(token.kind) !== -1) {
      var parts = splitValue(current);
      var numberField = el('input', {
        className: 'token-editor__number',
        attrs: { type: 'number', step: token.kind === 'duration' ? '10' : '0.5', value: parts.number == null ? 0 : parts.number }
      });
      var unit = parts.unit || (token.kind === 'duration' ? 'ms' : token.kind === 'font-size' || token.kind === 'spacing' ? 'rem' : 'px');
      numberField.addEventListener('change', function () {
        commitLocal(numberField.value + unit);
      });
      control = el('div', { className: 'token-editor__dimension' }, [
        numberField,
        el('span', { className: 'token-editor__unit', text: unit })
      ]);
    } else if (token.kind === 'line-height') {
      var lhField = el('input', { className: 'token-editor__number', attrs: { type: 'number', step: '0.05', value: current } });
      lhField.addEventListener('change', function () { commitLocal(lhField.value); });
      control = lhField;
    } else {
      // letter-spacing, shadow, easing -- composite or mixed-unit values,
      // free text rather than a specialized widget for this first pass.
      var textField = el('input', { className: 'token-editor__text', attrs: { type: 'text', value: current } });
      textField.addEventListener('change', function () { commitLocal(textField.value); });
      control = textField;
    }

    return el('div', { className: 'token-editor__row' }, [
      el('label', { className: 'token-editor__label', text: token.label }),
      el('code', { className: 'token-editor__name', text: token.name }),
      control
    ]);
  }

  function previewStrip() {
    var C = DA.components;
    return el('div', { className: 'token-editor__preview' }, [
      el('p', { className: 'token-editor__preview-label', text: 'Live preview — updates as you edit, before Submit' }),
      el('div', { className: 'token-editor__preview-row' }, [
        C.Button({ label: 'Primary Button', variant: 'primary', onClick: function () {} }),
        C.Button({ label: 'Secondary', variant: 'secondary', onClick: function () {} }),
        C.StatusBadge('Completed', { pill: true }),
        C.StatusBadge('Error Occurred', { pill: true }),
        C.DataTable({
          caption: 'Preview table',
          embedded: true,
          headerTone: 'warm',
          columns: [{ key: 'a', label: 'Core Service', width: '150px', className: 'is-rowhead' }],
          rows: [{ a: 'Next Day Air' }]
        })
      ])
    ]);
  }

  function tokensTab() {
    var C = DA.components;
    var draft = {};
    var statusMount = el('p', { className: 'token-editor__status', attrs: { role: 'status' } });

    function setStatus(text) {
      statusMount.textContent = text;
    }

    var groups = DA.designTokenGroups.map(function (group) {
      var tokens = DA.designTokens.filter(function (t) { return t.group === group; });
      return C.Accordion({
        title: group + ' (' + tokens.length + ')',
        expanded: group === 'Brand' || group === 'Primary',
        content: tokens.map(function (token) {
          return tokenControl(token, draft, function (name, value) {
            // Applies to the live app immediately, unpersisted -- exactly
            // what "live preview" means here. Submit is what makes it stick.
            var patch = {};
            patch[name] = value;
            DA.tokenOverrides.apply(patch);
            setStatus('Unsaved changes — Submit to apply them permanently.');
          });
        })
      });
    });

    var actions = el('div', { className: 'token-editor__actions' }, [
      C.Button({
        label: 'Submit — apply to my application',
        variant: 'primary',
        shape: 'pill',
        onClick: function () {
          DA.tokenOverrides.commit(draft);
          draft = {};
          setStatus('Applied and saved to this browser. It will still be applied the next time you load the app here.');
        }
      }),
      C.Button({
        label: 'Discard unsaved changes',
        variant: 'ghost',
        onClick: function () { location.reload(); }
      }),
      C.Button({
        label: 'Reset everything to defaults',
        variant: 'ghost',
        onClick: function () { DA.tokenOverrides.reset(); }
      }),
      C.Button({
        label: 'Export tokens.css',
        variant: 'link',
        icon: DA.icons.download(16),
        onClick: function () { DA.tokenOverrides.downloadCss(); }
      })
    ]);

    return el('div', { className: 'token-editor' }, [
      C.Alert({
        plain: true,
        message: 'Submit applies every edited token across the whole application immediately and saves it to this browser, ' +
          'so it survives a reload here. It can’t rewrite the project’s own tokens.css file directly -- this is a ' +
          'static app with no server to do that from. Export tokens.css when you’re happy with a theme and want it made permanent.'
      }),
      previewStrip(),
      statusMount,
      actions,
      el('div', { className: 'token-editor__groups' }, groups)
    ]);
  }

  /* ---- Page ----------------------------------------------------------------- */

  DA.pages.StyleGuidePage = function StyleGuidePage(options) {
    options = options || {};
    var C = DA.components;

    return el('main', { className: 'page', attrs: { id: 'main-content' } }, [
      el('div', { className: 'page-back' }, [
        C.Button({
          label: 'Back',
          variant: 'link',
          icon: DA.icons.chevronLeft(14),
          onClick: function () { if (options.onBack) options.onBack(); }
        })
      ]),
      el('h2', { className: 'page-heading__title title-rule title-rule--full', text: 'Style Guide' }),
      el('p', { className: 'page-heading__subtitle', text: 'Every component in the product, and a live editor for the design tokens behind them.' }),
      el('div', { className: 'tabs--boxed' }, [
        C.Tabs({
          ariaLabel: 'Style guide sections',
          value: 'components',
          items: [
            { id: 'components', label: 'Components', render: componentsTab },
            { id: 'tokens', label: 'Tokens', render: tokensTab }
          ]
        })
      ])
    ]);
  };
})(window.DA);
