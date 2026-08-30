/**
 * Design token registry — the editable half of styles/tokens.css.
 *
 * This file doesn't define token values; tokens.css still does that. It's
 * metadata: every token's group (matching tokens.css's own section
 * comments), what kind of value it holds (so the editor picks the right
 * control), and a plain-language label. The Token Editor reads each token's
 * *current* value straight off the document at render time
 * (getComputedStyle), so this registry never goes stale even if a default
 * changes -- it only has to know what exists and how to edit it.
 *
 * Kinds: 'color' | 'font-family' | 'font-size' | 'font-weight' |
 * 'line-height' | 'letter-spacing' | 'spacing' | 'radius' | 'dimension' |
 * 'duration' | 'shadow' | 'easing'.
 */
(function (DA) {
  'use strict';

  DA.designTokens = [
    /* ---- Brand ------------------------------------------------------------ */
    { name: '--color-brand-gold', group: 'Brand', kind: 'color', label: 'Brand gold' },
    { name: '--color-brand-gold-hover', group: 'Brand', kind: 'color', label: 'Brand gold — hover' },
    { name: '--color-brand-gold-active', group: 'Brand', kind: 'color', label: 'Brand gold — active' },
    { name: '--color-brand-brown', group: 'Brand', kind: 'color', label: 'Brand brown' },
    { name: '--color-brand-shield', group: 'Brand', kind: 'color', label: 'Brand shield' },

    /* ---- Primary ------------------------------------------------------------ */
    { name: '--color-primary', group: 'Primary', kind: 'color', label: 'Primary (teal)' },
    { name: '--color-primary-hover', group: 'Primary', kind: 'color', label: 'Primary — hover' },
    { name: '--color-primary-active', group: 'Primary', kind: 'color', label: 'Primary — active' },
    { name: '--color-primary-subtle', group: 'Primary', kind: 'color', label: 'Primary — subtle fill' },
    { name: '--color-on-primary', group: 'Primary', kind: 'color', label: 'Text on primary' },
    { name: '--color-primary-text', group: 'Primary', kind: 'color', label: 'Primary as text' },

    /* ---- Neutrals / surfaces ------------------------------------------------ */
    { name: '--color-bg', group: 'Neutrals / Surfaces', kind: 'color', label: 'Page background' },
    { name: '--color-surface', group: 'Neutrals / Surfaces', kind: 'color', label: 'Surface' },
    { name: '--color-surface-raised', group: 'Neutrals / Surfaces', kind: 'color', label: 'Surface — raised' },
    { name: '--color-surface-sunken', group: 'Neutrals / Surfaces', kind: 'color', label: 'Surface — sunken' },
    { name: '--color-surface-muted', group: 'Neutrals / Surfaces', kind: 'color', label: 'Surface — muted' },
    { name: '--color-surface-muted-strong', group: 'Neutrals / Surfaces', kind: 'color', label: 'Surface — muted strong' },
    { name: '--color-surface-hover', group: 'Neutrals / Surfaces', kind: 'color', label: 'Surface — hover' },
    { name: '--color-surface-inverse', group: 'Neutrals / Surfaces', kind: 'color', label: 'Surface — inverse (table headers)' },
    { name: '--color-surface-inverse-warm', group: 'Neutrals / Surfaces', kind: 'color', label: 'Surface — inverse (warm alias)' },

    /* ---- Borders ------------------------------------------------------------ */
    { name: '--color-border', group: 'Borders', kind: 'color', label: 'Border' },
    { name: '--color-border-strong', group: 'Borders', kind: 'color', label: 'Border — strong' },
    { name: '--color-border-subtle', group: 'Borders', kind: 'color', label: 'Border — subtle' },

    /* ---- Text --------------------------------------------------------------- */
    { name: '--color-text-primary', group: 'Text', kind: 'color', label: 'Text — primary' },
    { name: '--color-text-secondary', group: 'Text', kind: 'color', label: 'Text — secondary' },
    { name: '--color-text-muted', group: 'Text', kind: 'color', label: 'Text — muted' },
    { name: '--color-text-inverse', group: 'Text', kind: 'color', label: 'Text — inverse' },
    { name: '--color-text-link', group: 'Text', kind: 'color', label: 'Text — link' },
    { name: '--color-text-link-hover', group: 'Text', kind: 'color', label: 'Text — link hover' },

    /* ---- Semantic feedback --------------------------------------------------- */
    { name: '--color-info', group: 'Semantic Feedback', kind: 'color', label: 'Info' },
    { name: '--color-info-subtle', group: 'Semantic Feedback', kind: 'color', label: 'Info — subtle fill' },
    { name: '--color-success', group: 'Semantic Feedback', kind: 'color', label: 'Success' },
    { name: '--color-success-subtle', group: 'Semantic Feedback', kind: 'color', label: 'Success — subtle fill' },
    { name: '--color-warning', group: 'Semantic Feedback', kind: 'color', label: 'Warning' },
    { name: '--color-warning-subtle', group: 'Semantic Feedback', kind: 'color', label: 'Warning — subtle fill' },
    { name: '--color-error', group: 'Semantic Feedback', kind: 'color', label: 'Error' },
    { name: '--color-error-subtle', group: 'Semantic Feedback', kind: 'color', label: 'Error — subtle fill' },
    { name: '--color-neutral-badge', group: 'Semantic Feedback', kind: 'color', label: 'Neutral badge' },
    { name: '--color-neutral-badge-subtle', group: 'Semantic Feedback', kind: 'color', label: 'Neutral badge — subtle fill' },

    /* ---- Form fields ---------------------------------------------------------- */
    { name: '--color-field-bg', group: 'Form Fields', kind: 'color', label: 'Field background' },
    { name: '--color-field-bg-subtle', group: 'Form Fields', kind: 'color', label: 'Field background — subtle' },
    { name: '--color-field-border', group: 'Form Fields', kind: 'color', label: 'Field border' },
    { name: '--color-field-border-hover', group: 'Form Fields', kind: 'color', label: 'Field border — hover' },
    { name: '--color-field-border-filled', group: 'Form Fields', kind: 'color', label: 'Field border — filled' },
    { name: '--color-field-label', group: 'Form Fields', kind: 'color', label: 'Field label' },
    { name: '--color-field-placeholder', group: 'Form Fields', kind: 'color', label: 'Field placeholder' },
    { name: '--color-field-text', group: 'Form Fields', kind: 'color', label: 'Field text' },

    /* ---- Disabled ------------------------------------------------------------- */
    { name: '--color-disabled-bg', group: 'Disabled', kind: 'color', label: 'Disabled background' },
    { name: '--color-disabled-border', group: 'Disabled', kind: 'color', label: 'Disabled border' },
    { name: '--color-disabled-text', group: 'Disabled', kind: 'color', label: 'Disabled text' },

    /* ---- Focus ------------------------------------------------------------------ */
    { name: '--color-focus-ring', group: 'Focus', kind: 'color', label: 'Focus ring color' },
    { name: '--focus-ring-width', group: 'Focus', kind: 'dimension', label: 'Focus ring width' },
    { name: '--focus-ring-offset', group: 'Focus', kind: 'dimension', label: 'Focus ring offset' },

    /* ---- Typography --------------------------------------------------------------- */
    { name: '--font-family-base', group: 'Typography', kind: 'font-family', label: 'Font family — base' },
    { name: '--font-family-numeric', group: 'Typography', kind: 'font-family', label: 'Font family — numeric' },
    { name: '--font-size-3xs', group: 'Typography', kind: 'font-size', label: 'Font size — 3xs (10px)' },
    { name: '--font-size-2xs', group: 'Typography', kind: 'font-size', label: 'Font size — 2xs (11px)' },
    { name: '--font-size-xs', group: 'Typography', kind: 'font-size', label: 'Font size — xs (12px)' },
    { name: '--font-size-sm', group: 'Typography', kind: 'font-size', label: 'Font size — sm (13px)' },
    { name: '--font-size-md', group: 'Typography', kind: 'font-size', label: 'Font size — md (14px, body)' },
    { name: '--font-size-lg', group: 'Typography', kind: 'font-size', label: 'Font size — lg (16px)' },
    { name: '--font-size-xl', group: 'Typography', kind: 'font-size', label: 'Font size — xl (18px)' },
    { name: '--font-size-2xl', group: 'Typography', kind: 'font-size', label: 'Font size — 2xl (22px)' },
    { name: '--font-weight-regular', group: 'Typography', kind: 'font-weight', label: 'Font weight — regular' },
    { name: '--font-weight-medium', group: 'Typography', kind: 'font-weight', label: 'Font weight — medium' },
    { name: '--font-weight-semibold', group: 'Typography', kind: 'font-weight', label: 'Font weight — semibold' },
    { name: '--font-weight-bold', group: 'Typography', kind: 'font-weight', label: 'Font weight — bold' },
    { name: '--line-height-tight', group: 'Typography', kind: 'line-height', label: 'Line height — tight' },
    { name: '--line-height-snug', group: 'Typography', kind: 'line-height', label: 'Line height — snug' },
    { name: '--line-height-normal', group: 'Typography', kind: 'line-height', label: 'Line height — normal' },
    { name: '--letter-spacing-tight', group: 'Typography', kind: 'letter-spacing', label: 'Letter spacing — tight' },
    { name: '--letter-spacing-normal', group: 'Typography', kind: 'letter-spacing', label: 'Letter spacing — normal' },
    { name: '--letter-spacing-wide', group: 'Typography', kind: 'letter-spacing', label: 'Letter spacing — wide' },
    { name: '--letter-spacing-wider', group: 'Typography', kind: 'letter-spacing', label: 'Letter spacing — wider' },

    /* ---- Spacing scale --------------------------------------------------------------- */
    { name: '--space-0', group: 'Spacing', kind: 'spacing', label: 'Space 0' },
    { name: '--space-1', group: 'Spacing', kind: 'spacing', label: 'Space 1 (4px base)' },
    { name: '--space-2', group: 'Spacing', kind: 'spacing', label: 'Space 2' },
    { name: '--space-3', group: 'Spacing', kind: 'spacing', label: 'Space 3' },
    { name: '--space-4', group: 'Spacing', kind: 'spacing', label: 'Space 4' },
    { name: '--space-5', group: 'Spacing', kind: 'spacing', label: 'Space 5' },
    { name: '--space-6', group: 'Spacing', kind: 'spacing', label: 'Space 6' },
    { name: '--space-7', group: 'Spacing', kind: 'spacing', label: 'Space 7' },
    { name: '--space-8', group: 'Spacing', kind: 'spacing', label: 'Space 8' },

    /* ---- Radius ------------------------------------------------------------------------ */
    { name: '--radius-xs', group: 'Radius', kind: 'radius', label: 'Radius xs' },
    { name: '--radius-sm', group: 'Radius', kind: 'radius', label: 'Radius sm' },
    { name: '--radius-md', group: 'Radius', kind: 'radius', label: 'Radius md' },
    { name: '--radius-lg', group: 'Radius', kind: 'radius', label: 'Radius lg' },
    { name: '--radius-pill', group: 'Radius', kind: 'radius', label: 'Radius — pill' },
    { name: '--radius-surface', group: 'Radius', kind: 'radius', label: 'Radius by role — surface' },
    { name: '--radius-container', group: 'Radius', kind: 'radius', label: 'Radius by role — container' },
    { name: '--radius-control', group: 'Radius', kind: 'radius', label: 'Radius by role — control' },

    /* ---- Elevation ------------------------------------------------------------------------ */
    { name: '--shadow-none', group: 'Elevation', kind: 'shadow', label: 'Shadow — none' },
    { name: '--shadow-xs', group: 'Elevation', kind: 'shadow', label: 'Shadow xs' },
    { name: '--shadow-sm', group: 'Elevation', kind: 'shadow', label: 'Shadow sm' },
    { name: '--shadow-md', group: 'Elevation', kind: 'shadow', label: 'Shadow md' },

    /* ---- Component dimensions ------------------------------------------------------------------------ */
    { name: '--app-header-height', group: 'Component Dimensions', kind: 'dimension', label: 'App header height' },
    { name: '--control-height-sm', group: 'Component Dimensions', kind: 'dimension', label: 'Control height — sm' },
    { name: '--control-height-md', group: 'Component Dimensions', kind: 'dimension', label: 'Control height — md' },
    { name: '--control-height-lg', group: 'Component Dimensions', kind: 'dimension', label: 'Control height — lg' },
    { name: '--icon-button-size', group: 'Component Dimensions', kind: 'dimension', label: 'Icon button size' },
    { name: '--avatar-size', group: 'Component Dimensions', kind: 'dimension', label: 'Avatar size' },
    { name: '--field-height', group: 'Component Dimensions', kind: 'dimension', label: 'Field height' },
    { name: '--field-padding-x', group: 'Component Dimensions', kind: 'dimension', label: 'Field horizontal padding' },
    { name: '--field-help-size', group: 'Component Dimensions', kind: 'dimension', label: 'Field help icon size' },
    { name: '--tap-target-min', group: 'Component Dimensions', kind: 'dimension', label: 'Minimum tap target (WCAG)' },
    { name: '--table-header-height', group: 'Component Dimensions', kind: 'dimension', label: 'Table header height' },
    { name: '--table-row-height', group: 'Component Dimensions', kind: 'dimension', label: 'Table row height' },
    { name: '--table-cell-padding-x', group: 'Component Dimensions', kind: 'dimension', label: 'Table cell horizontal padding' },
    { name: '--table-min-width', group: 'Component Dimensions', kind: 'dimension', label: 'Table minimum width' },
    { name: '--table-min-height', group: 'Component Dimensions', kind: 'dimension', label: 'Table minimum height' },
    { name: '--page-max-width', group: 'Component Dimensions', kind: 'dimension', label: 'Page max width' },
    { name: '--page-gutter', group: 'Component Dimensions', kind: 'dimension', label: 'Page gutter' },
    { name: '--form-card-width', group: 'Component Dimensions', kind: 'dimension', label: 'Form card width' },

    /* ---- Motion ------------------------------------------------------------------------ */
    { name: '--duration-fast', group: 'Motion', kind: 'duration', label: 'Duration — fast' },
    { name: '--duration-base', group: 'Motion', kind: 'duration', label: 'Duration — base' },
    { name: '--easing-standard', group: 'Motion', kind: 'easing', label: 'Easing — standard' }
  ];

  /** Groups in tokens.css's own reading order, not alphabetical. */
  DA.designTokenGroups = [
    'Brand', 'Primary', 'Neutrals / Surfaces', 'Borders', 'Text',
    'Semantic Feedback', 'Form Fields', 'Disabled', 'Focus', 'Typography',
    'Spacing', 'Radius', 'Elevation', 'Component Dimensions', 'Motion'
  ];
})(window.DA);
