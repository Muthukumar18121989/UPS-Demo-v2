/**
 * Analyzer packet report data — demo figures transcribed from the reference
 * screens. `{customer}` is replaced with the packet's customer at render, so
 * the report reads as one record end to end.
 */
(function (DA) {
  'use strict';

  DA.data = DA.data || {};

  /** Figures behind the comparison band, one set per scenario. */
  DA.data.scenarioFigures = {
    Current: {
      adv: '17313.0',
      baseFrtDisc: '51.3%',
      totalDisc: '55.9%',
      rpp: '$ 12.41',
      revenue: '$ 1,074,292',
      or: '0.98',
      profit: '$ 26,111'
    },
    'Scenario 1': {
      adv: '17340.2',
      baseFrtDisc: '50.9%',
      totalDisc: '55.5%',
      rpp: '$ 12.57',
      revenue: '$ 1,095,226',
      or: '0.97',
      profit: '$ 37,273'
    }
  };

  DA.data.comparisonKeys = ['adv', 'baseFrtDisc', 'totalDisc', 'rpp', 'revenue', 'or', 'profit'];

  /** Sample choices for the report filters. */
  DA.data.filterOptions = {
    revenueBasis: ['All', 'Freight Only', 'Accessorial Only', 'Net Revenue'],
    costBasis: ['Fully Allocated Cost', 'Marginal Cost', 'Direct Cost'],
    incentiveMethod: ['Cell-by-cell', 'Base/Zone', 'Custom Net Rate'],
    service: ['All', 'Next Day Air', 'Next Day Air Saver', '2nd Day Air', 'Ground', 'Ground Saver'],
    accessorial: ['All', 'Fuel Surcharge', 'Delivery Area', 'Additional Handling', 'Return Labels'],
    accountSuffix: ['MAIN', 'EAST', 'WEST']
  };

  /**
   * Differences between two scenarios, keyed "from|to". These come from the
   * source rather than being recomputed here: the figures above are rounded for
   * display, so subtracting them lands a unit off on Total Disc and Profit.
   */
  DA.data.scenarioDifferences = {
    'Current|Scenario 1': {
      adv: '27.2',
      baseFrtDisc: '-0.4%',
      totalDisc: '-0.5%',
      rpp: '$ 0.16',
      revenue: '$ 20,934',
      or: '-0.01',
      profit: '$ 11,161'
    }
  };

  /* ---- Summary tab -------------------------------------------------------- */

  /**
   * Analyzer > Comparisons row hierarchy, as of the row-header/hierarchy-only
   * update: Total, an Unincented PLD group (broken out by individual
   * service/lane), and a Hormel 2024 group (its own Sub-total, no further
   * children given). Current and Scenario 1 render the identical tree so the
   * two panels line up row for row -- a fresh array per call (not one array
   * shared by both panels) since each panel's own DataTable tracks its
   * row-expanded state by row-object identity.
   */
  function comparisonSummaryTree() {
    return [
      { label: 'Total', total: true, adv: '198.8', baseFrt: '0.1%', totalDisc: '0.0%', rpp: '$ 2,859.09', annRev: '$ 147,780,476' },
      {
        label: 'Unincented PLD',
        expanded: true,
        adv: '195.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 2,914.29', annRev: '$ 147,754,284',
        children: [
          { label: 'Sub-total', adv: '-', baseFrt: '-', totalDisc: '-', rpp: '$ 2,914.29', annRev: '$ 147,754,284' },
          { label: 'N-3 Day Select', adv: '85.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 3,389.67', annRev: '$ 74,911,779' },
          { label: 'E-Standard to Canada', adv: '10.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 2.64', annRev: '$ 6,864' },
          { label: 'I-Standard from Canada', adv: '2.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 6.60', annRev: '$ 3,432' },
          { label: 'N-Ground', adv: '4.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 2,982.32', annRev: '$ 3,101,612' },
          { label: 'E-Worldwide Express Saver', adv: '42.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 3,800.87', annRev: '$ 41,505,464' },
          { label: 'I-Worldwide Express Saver', adv: '4.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 3,596.00', annRev: '$ 3,739,840' },
          { label: 'E-Worldwide Express Midday', adv: '10.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 2,828.40', annRev: '$ 7,353,840' },
          { label: 'I-Worldwide Express Midday', adv: '2.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 7,552.70', annRev: '$ 3,927,404' },
          { label: 'E-Worldwide Express', adv: '10.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 96.78', annRev: '$ 251,628' },
          { label: 'I-Worldwide Express', adv: '2.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 9,617.90', annRev: '$ 5,001,308' },
          { label: 'E-Worldwide Expedited', adv: '10.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 96.78', annRev: '$ 251,628' },
          { label: 'I-Worldwide Expedited', adv: '2.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 13,721.90', annRev: '$ 7,135,388' },
          { label: 'E-Standard to Mexico', adv: '10.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 2.64', annRev: '$ 6,864' },
          { label: 'I-Standard from Mexico', adv: '2.0', baseFrt: '0.0%', totalDisc: '0.0%', rpp: '$ 1,071.60', annRev: '$ 557,232' }
        ]
      },
      {
        label: 'Hormel 2024',
        expanded: true,
        adv: '3.8', baseFrt: '70.3%', totalDisc: '64.6%', rpp: '$ 26.51', annRev: '$ 26,191',
        children: [
          { label: 'Sub-total', adv: '-', baseFrt: '-', totalDisc: '-', rpp: '$ 26.51', annRev: '$ 26,191' }
        ]
      }
    ];
  }

  DA.data.packetSummaryTrees = {
    Current: comparisonSummaryTree(),
    'Scenario 1': comparisonSummaryTree()
  };

  /* ---- Shipping Profiles tab ---------------------------------------------- */

  /**
   * Every shipping profile view lists the same lanes in the same order, so the
   * keys live once and each view supplies only its own figures.
   */
  var PROFILE_KEYS = [
    { movement: 'N', mode: 'AIR', service: '1DA', zone: '-', lane: '-' },
    { movement: 'N', mode: 'AIR', service: '1DM', zone: '-', lane: '-' },
    { movement: 'N', mode: 'AIR', service: '1DP', zone: '-', lane: '-' },
    { movement: 'N', mode: 'AIR', service: '2DA', zone: '-', lane: '-' },
    { movement: 'N', mode: 'AIR', service: '2DM', zone: '-', lane: '-' },
    { movement: 'N', mode: 'AIR', service: '3DS', zone: '-', lane: '-' },
    { movement: 'N', mode: 'GROUND', service: 'GND', zone: '-', lane: '-' },
    { movement: 'N', mode: 'GROUND SAV', service: 'USG', zone: '-', lane: '-' },
    { movement: 'N', mode: 'GROUND SAV', service: 'USL', zone: '-', lane: '-' }
  ];

  function withKeys(figures) {
    return PROFILE_KEYS.map(function (keys, index) {
      return Object.assign({}, keys, figures[index]);
    });
  }

  /**
   * Cost Details row hierarchy/labels, per the client's reference
   * screenshot (Analyzer > Cost Details update). Only the 4 rows it shows
   * (1DA/1DP/2DA/3DS) get a friendly serviceLabel and updated visible
   * figures -- the other 5 rows are untouched, unlabeled Movement-Mode-
   * Service rows as before, per the client's own scoping choice.
   *
   * 1DA and 1DP additionally get a real `children` array: a package-type
   * row ("UPS <service> -Pkg <type>", superscript product/rate codes,
   * reusing serviceLabel()'s own .service-pkg markup from the Services
   * tab) that shows "-" for every figure of its own -- real numbers only
   * surface one level deeper, on the Zone/Lane rows the package row's own
   * chevron opens onto, exactly as the client's screenshot and its
   * explicit expand-behavior instructions describe. 1DA's own zone rows
   * (102/104/105/.../108, all lane US) are the screenshot's own values;
   * 1DP's two package rows (Commercial/Residential) are shown collapsed
   * in the screenshot with their contents not visible, so they're left as
   * leaves rather than inventing unseen zone data for them.
   *
   * Every column not visible in the screenshot (DL Dens, PU, LS, CS, AR,
   * JF, GF, BR, PD, DL, NO, OTH, Total Freight Cost, Cost Adj, New Cost)
   * keeps this row's own pre-existing placeholder figures unchanged, on
   * every row including 1DA's new zone children -- only the columns the
   * screenshot actually shows were replaced.
   */
  DA.data.shippingProfileCost = withKeys([
    {
      serviceLabel: 'N-Next Day Air',
      expanded: true,
      volume: '234.0', adv: '0.9', pps: '1.00', weightPiece: '8.0', avgCube: '1.24', avgCubeFactor: '0.98', puDens: '1.8',
      dlDens: '1.65', pu: '$ 2.42', ls: '$ 0.47', cs: '$ 2.15', ar: '$ 3.62', jf: '$ 12.31', gf: '$ 2.12', br: '$ 0.0', pd: '$ 1.83', dl: '$ 5.59', no: '$ 3.06', oth: '$ 0.0', totalFreightCost: '$ 33.57', costAdj: '-', newCost: '$ 33.57',
      children: [
        {
          movement: '', mode: '', service: '',
          expanded: true,
          pkgType: 'Residential', pkgParentLabel: 'N-Next Day Air', pkgCodes: 'FC, PP, RS, RTP, TP',
          zone: '-', lane: '-',
          volume: '-', adv: '-', pps: '-', weightPiece: '-', avgCube: '-', avgCubeFactor: '-', puDens: '-',
          dlDens: '-', pu: '-', ls: '-', cs: '-', ar: '-', jf: '-', gf: '-', br: '-', pd: '-', dl: '-', no: '-', oth: '-', totalFreightCost: '-', costAdj: '-', newCost: '-',
          children: [
            { movement: '', mode: '', service: '', zone: '102', lane: 'US', volume: '52.0', adv: '0.2', pps: '1.00', weightPiece: '10.0', avgCube: '1.04', avgCubeFactor: '1.20', puDens: '0.9', dlDens: '1.65', pu: '$ 2.42', ls: '$ 0.47', cs: '$ 2.15', ar: '$ 3.62', jf: '$ 12.31', gf: '$ 2.12', br: '$ 0.0', pd: '$ 1.83', dl: '$ 5.59', no: '$ 3.06', oth: '$ 0.0', totalFreightCost: '$ 33.57', costAdj: '-', newCost: '$ 33.57' },
            { movement: '', mode: '', service: '', zone: '104', lane: 'US', volume: '52.0', adv: '0.2', pps: '1.00', weightPiece: '2.0', avgCube: '0.89', avgCubeFactor: '0.20', puDens: '12.4', dlDens: '1.65', pu: '$ 2.42', ls: '$ 0.47', cs: '$ 2.15', ar: '$ 3.62', jf: '$ 12.31', gf: '$ 2.12', br: '$ 0.0', pd: '$ 1.83', dl: '$ 5.59', no: '$ 3.06', oth: '$ 0.0', totalFreightCost: '$ 33.57', costAdj: '-', newCost: '$ 33.57' },
            { movement: '', mode: '', service: '', zone: '105', lane: 'US', volume: '26.0', adv: '0.1', pps: '1.00', weightPiece: '2.0', avgCube: '0.87', avgCubeFactor: '0.19', puDens: '12.4', dlDens: '1.65', pu: '$ 2.42', ls: '$ 0.47', cs: '$ 2.15', ar: '$ 3.62', jf: '$ 12.31', gf: '$ 2.12', br: '$ 0.0', pd: '$ 1.83', dl: '$ 5.59', no: '$ 3.06', oth: '$ 0.0', totalFreightCost: '$ 33.57', costAdj: '-', newCost: '$ 33.57' },
            { movement: '', mode: '', service: '', zone: '106', lane: 'US', volume: '26.0', adv: '0.1', pps: '1.00', weightPiece: '19.0', avgCube: '2.79', avgCubeFactor: '2.04', puDens: '0.9', dlDens: '1.65', pu: '$ 2.42', ls: '$ 0.47', cs: '$ 2.15', ar: '$ 3.62', jf: '$ 12.31', gf: '$ 2.12', br: '$ 0.0', pd: '$ 1.83', dl: '$ 5.59', no: '$ 3.06', oth: '$ 0.0', totalFreightCost: '$ 33.57', costAdj: '-', newCost: '$ 33.57' },
            { movement: '', mode: '', service: '', zone: '107', lane: 'US', volume: '26.0', adv: '0.1', pps: '1.00', weightPiece: '16.0', avgCube: '1.03', avgCubeFactor: '1.79', puDens: '1.8', dlDens: '1.65', pu: '$ 2.42', ls: '$ 0.47', cs: '$ 2.15', ar: '$ 3.62', jf: '$ 12.31', gf: '$ 2.12', br: '$ 0.0', pd: '$ 1.83', dl: '$ 5.59', no: '$ 3.06', oth: '$ 0.0', totalFreightCost: '$ 33.57', costAdj: '-', newCost: '$ 33.57' },
            { movement: '', mode: '', service: '', zone: '108', lane: 'US', volume: '52.0', adv: '0.2', pps: '1.00', weightPiece: '5.5', avgCube: '1.32', avgCubeFactor: '1.00', puDens: '2.2', dlDens: '1.65', pu: '$ 2.42', ls: '$ 0.47', cs: '$ 2.15', ar: '$ 3.62', jf: '$ 12.31', gf: '$ 2.12', br: '$ 0.0', pd: '$ 1.83', dl: '$ 5.59', no: '$ 3.06', oth: '$ 0.0', totalFreightCost: '$ 33.57', costAdj: '-', newCost: '$ 33.57' }
          ]
        }
      ]
    },
    { volume: '15.0', adv: '3.0', pps: '1.0', weightPiece: '14.87', avgCube: '1.51', avgCubeFactor: '1.07', puDens: '4.54', dlDens: '1.61', pu: '$ 4.9', ls: '$ 0.39', cs: '$ 2.17', ar: '$ 3.72', jf: '$ 18.69', gf: '$ 2.83', br: '$ 0.0', pd: '$ 2.07', dl: '$ 8.43', no: '$ 5.17', oth: '$ 0.0', totalFreightCost: '$ 48.39', costAdj: '-', newCost: '$ 48.39' },
    {
      serviceLabel: 'N-Next Day Air Saver',
      expanded: true,
      volume: '52.0', adv: '0.2', pps: '1.00', weightPiece: '15.0', avgCube: '1.47', avgCubeFactor: '1.64', puDens: '2.1',
      dlDens: '4.04', pu: '$ 3.92', ls: '$ 0.17', cs: '$ 2.64', ar: '$ 3.95', jf: '$ 10.26', gf: '$ 1.87', br: '$ 0.0', pd: '$ 1.92', dl: '$ 2.14', no: '$ 2.5', oth: '$ 0.0', totalFreightCost: '$ 29.37', costAdj: '-', newCost: '$ 29.37',
      children: [
        {
          movement: '', mode: '', service: '',
          pkgType: 'Commercial', pkgParentLabel: 'N-Next Day Air Saver', pkgCodes: 'FC, PP, TP',
          zone: '-', lane: '-',
          volume: '-', adv: '-', pps: '-', weightPiece: '-', avgCube: '-', avgCubeFactor: '-', puDens: '-',
          dlDens: '-', pu: '-', ls: '-', cs: '-', ar: '-', jf: '-', gf: '-', br: '-', pd: '-', dl: '-', no: '-', oth: '-', totalFreightCost: '-', costAdj: '-', newCost: '-'
        },
        {
          movement: '', mode: '', service: '',
          pkgType: 'Residential', pkgParentLabel: 'N-Next Day Air Saver', pkgCodes: 'FC, PP, TP',
          zone: '-', lane: '-',
          volume: '-', adv: '-', pps: '-', weightPiece: '-', avgCube: '-', avgCubeFactor: '-', puDens: '-',
          dlDens: '-', pu: '-', ls: '-', cs: '-', ar: '-', jf: '-', gf: '-', br: '-', pd: '-', dl: '-', no: '-', oth: '-', totalFreightCost: '-', costAdj: '-', newCost: '-'
        }
      ]
    },
    {
      serviceLabel: 'N-2nd Day Air',
      volume: '26.0', adv: '0.1', pps: '1.000', weightPiece: '17.0', avgCube: '1.10', avgCubeFactor: '1.85', puDens: '1.9',
      dlDens: '2.68', pu: '$ 4.77', ls: '$ 0.49', cs: '$ 1.81', ar: '$ 0.43', jf: '$ 1.48', gf: '$ 0.9', br: '$ 0.0', pd: '$ 1.25', dl: '$ 2.85', no: '$ 1.8', oth: '$ 0.01', totalFreightCost: '$ 15.78', costAdj: '-', newCost: '$ 15.78'
    },
    { volume: '9.0', adv: '1.8', pps: '1.0', weightPiece: '13.89', avgCube: '0.99', avgCubeFactor: '0.91', puDens: '2.78', dlDens: '5.78', pu: '$ 5.9', ls: '$ 0.51', cs: '$ 2.71', ar: '$ 0.56', jf: '$ 2.3', gf: '$ 1.75', br: '$ 0.0', pd: '$ 1.67', dl: '$ 4.14', no: '$ 2.5', oth: '$ 0.0', totalFreightCost: '$ 22.05', costAdj: '-', newCost: '$ 22.05' },
    {
      serviceLabel: 'N-3 Day Select',
      volume: '22100.0', adv: '85.0', pps: '3.40', weightPiece: '76.5', avgCube: '1.12', avgCubeFactor: '1.05', puDens: '13.39',
      dlDens: '1.84', pu: '$ 1.53', ls: '$ 0.47', cs: '$ 2.09', ar: '$ 0.25', jf: '$ 1.08', gf: '$ 1.62', br: '$ 0.0', pd: '$ 1.51', dl: '$ 3.14', no: '$ 1.93', oth: '$ 0.01', totalFreightCost: '$ 13.62', costAdj: '-', newCost: '$ 13.62'
    },
    { volume: '20953.0', adv: '4190.6', pps: '1.0', weightPiece: '13.01', avgCube: '1.36', avgCubeFactor: '1.15', puDens: '117.72', dlDens: '1.3', pu: '$ 0.23', ls: '$ 0.51', cs: '$ 1.85', ar: '$ 0.0', jf: '$ 0.0', gf: '$ 2.78', br: '$ 0.0', pd: '$ 1.2', dl: '$ 4.0', no: '$ 1.37', oth: '$ 0.02', totalFreightCost: '$ 11.91', costAdj: '-', newCost: '$ 11.91' },
    { volume: '62796.0', adv: '12559.2', pps: '1.0', weightPiece: '3.59', avgCube: '0.52', avgCubeFactor: '1.09', puDens: '3031.44', dlDens: '1.16', pu: '$ 0.07', ls: '$ 0.41', cs: '$ 1.24', ar: '$ 0.0', jf: '$ 0.0', gf: '$ 0.94', br: '$ 0.0', pd: '$ 0.96', dl: '$ 5.53', no: '$ 1.04', oth: '$ 0.0', totalFreightCost: '$ 10.19', costAdj: '-', newCost: '$ 10.19' },
    { volume: '1497.0', adv: '299.4', pps: '1.0', weightPiece: '12.12', avgCube: '0.29', avgCubeFactor: '1.11', puDens: '3335.35', dlDens: '1.21', pu: '$ 0.07', ls: '$ 0.25', cs: '$ 0.88', ar: '$ 0.0', jf: '$ 0.0', gf: '$ 0.57', br: '$ 0.0', pd: '$ 0.8', dl: '$ 5.25', no: '$ 0.89', oth: '$ 0.0', totalFreightCost: '$ 8.69', costAdj: '-', newCost: '$ 8.69' }
  ]);

  /**
   * Zones row hierarchy/labels, per the client's reference screenshot
   * (Analyzer > Zones update) -- same scope and structure as the Cost
   * Details update just above: only the 4 rows the screenshot shows
   * (1DA/1DP/2DA/3DS) get a friendly serviceLabel and updated visible
   * figures; the other 5 stay as plain Movement-Mode-Service rows.
   *
   * 1DA again gets a real package-type row (Residential, "FC, PP, RS,
   * RTP, TP") showing "-" for its own figures, opening onto the same 6
   * real zone rows (102/104/.../108, lane US) with the screenshot's own
   * Volume/ADV/PPS/Weight-Piece figures (Volume and ADV both still sum
   * back to 1DA's own 234/0.9). 1DP again gets two package rows
   * (Commercial/Residential, "FC, PP, TP") shown collapsed with contents
   * not visible in the screenshot, so left as leaves rather than
   * inventing unseen zone data, matching Cost Details' and Charges' own
   * precedent this round.
   *
   * Screenshot columns map to this table's own by meaning, not position
   * (its Base Gross Rev/Base Net Rev/Base Disc aren't this table's
   * column set) -- Base Gross Rev -> freightGrossSpent, Base Net Rev ->
   * freightNetSpent, Base Disc -> freightDiscount. Freight RPP, Freight
   * Profit and Freight OR aren't shown in the screenshot at all, so
   * every touched row (1DA's own zone children included) keeps that
   * service's pre-existing placeholder figures for those three columns
   * unchanged.
   */
  DA.data.shippingProfileZone = withKeys([
    {
      serviceLabel: 'N-Next Day Air',
      expanded: true,
      volume: '234', adv: '0.9', pps: '1.0', weightPiece: '8.0',
      freightGrossSpent: '$ 34,098.00', freightNetSpent: '$ 7,154.00', freightDiscount: '79.0%',
      freightRpp: '$ 86.50', freightProfit: '$ 34,511.69', freightOr: '0.39',
      children: [
        {
          movement: '', mode: '', service: '',
          expanded: true,
          pkgType: 'Residential', pkgParentLabel: 'N-Next Day Air', pkgCodes: 'FC, PP, RS, RTP, TP',
          zone: '-', lane: '-',
          volume: '-', adv: '-', pps: '-', weightPiece: '-',
          freightGrossSpent: '-', freightNetSpent: '-', freightDiscount: '-', freightRpp: '-', freightProfit: '-', freightOr: '-',
          children: [
            { movement: '', mode: '', service: '', zone: '102', lane: 'US', volume: '52', adv: '0.2', pps: '1.0', weightPiece: '10.0', freightGrossSpent: '$ 3,334.00', freightNetSpent: '$ 1,073.00', freightDiscount: '67.8%', freightRpp: '$ 86.50', freightProfit: '$ 34,511.69', freightOr: '0.39' },
            { movement: '', mode: '', service: '', zone: '104', lane: 'US', volume: '52', adv: '0.2', pps: '1.0', weightPiece: '2.0', freightGrossSpent: '$ 4,921.00', freightNetSpent: '$ 1,073.00', freightDiscount: '78.2%', freightRpp: '$ 86.50', freightProfit: '$ 34,511.69', freightOr: '0.39' },
            { movement: '', mode: '', service: '', zone: '105', lane: 'US', volume: '26', adv: '0.1', pps: '1.0', weightPiece: '2.0', freightGrossSpent: '$ 2,675.00', freightNetSpent: '$ 537.00', freightDiscount: '79.9%', freightRpp: '$ 86.50', freightProfit: '$ 34,511.69', freightOr: '0.39' },
            { movement: '', mode: '', service: '', zone: '106', lane: 'US', volume: '26', adv: '0.1', pps: '1.0', weightPiece: '19.0', freightGrossSpent: '$ 7,004.00', freightNetSpent: '$ 1,352.00', freightDiscount: '80.7%', freightRpp: '$ 86.50', freightProfit: '$ 34,511.69', freightOr: '0.39' },
            { movement: '', mode: '', service: '', zone: '107', lane: 'US', volume: '26', adv: '0.1', pps: '1.0', weightPiece: '16.0', freightGrossSpent: '$ 7,549.00', freightNetSpent: '$ 1,457.00', freightDiscount: '80.7%', freightRpp: '$ 86.50', freightProfit: '$ 34,511.69', freightOr: '0.39' },
            { movement: '', mode: '', service: '', zone: '108', lane: 'US', volume: '52', adv: '0.2', pps: '1.0', weightPiece: '5.5', freightGrossSpent: '$ 8,614.00', freightNetSpent: '$ 1,662.00', freightDiscount: '80.7%', freightRpp: '$ 86.50', freightProfit: '$ 34,511.69', freightOr: '0.39' }
          ]
        }
      ]
    },
    { volume: '15', adv: '3', pps: '1', weightPiece: '14.87', freightGrossSpent: '$ 3,590.93', freightDiscount: '0.00%', freightRpp: '$ 239.40', freightNetSpent: '$ 3,590.93', freightProfit: '$ 2,865.14', freightOr: '0.20' },
    {
      serviceLabel: 'N-Next Day Air Saver',
      expanded: true,
      volume: '52', adv: '0.2', pps: '1.0', weightPiece: '15.0',
      freightGrossSpent: '$ 11,806.00', freightNetSpent: '$ 2,420.00', freightDiscount: '79.5%',
      freightRpp: '$ 64.86', freightProfit: '$ 2,413.15', freightOr: '0.45',
      children: [
        {
          movement: '', mode: '', service: '',
          pkgType: 'Commercial', pkgParentLabel: 'N-Next Day Air Saver', pkgCodes: 'FC, PP, TP',
          zone: '-', lane: '-',
          volume: '-', adv: '-', pps: '-', weightPiece: '-',
          freightGrossSpent: '-', freightNetSpent: '-', freightDiscount: '-', freightRpp: '-', freightProfit: '-', freightOr: '-'
        },
        {
          movement: '', mode: '', service: '',
          pkgType: 'Residential', pkgParentLabel: 'N-Next Day Air Saver', pkgCodes: 'FC, PP, TP',
          zone: '-', lane: '-',
          volume: '-', adv: '-', pps: '-', weightPiece: '-',
          freightGrossSpent: '-', freightNetSpent: '-', freightDiscount: '-', freightRpp: '-', freightProfit: '-', freightOr: '-'
        }
      ]
    },
    {
      serviceLabel: 'N-2nd Day Air',
      volume: '26', adv: '0.1', pps: '1.0', weightPiece: '17.0',
      freightGrossSpent: '$ 3,014.00', freightNetSpent: '$ 820.00', freightDiscount: '72.8%',
      freightRpp: '$ 23.69', freightProfit: '$ 1,724.03', freightOr: '0.67'
    },
    { volume: '9', adv: '1.8', pps: '1', weightPiece: '13.89', freightGrossSpent: '$ 677.18', freightDiscount: '18.86%', freightRpp: '$ 61.05', freightNetSpent: '$ 549.49', freightProfit: '$ 351.08', freightOr: '0.36' },
    {
      serviceLabel: 'N-3 Day Select',
      volume: '22100', adv: '85.0', pps: '3.4', weightPiece: '76.5',
      freightGrossSpent: '$ 9,928,004.00', freightNetSpent: '$ 9,928,004.00', freightDiscount: '0.0%',
      freightRpp: '$ 24.46', freightProfit: '$ 3,870.04', freightOr: '0.56'
    },
    { volume: '20953', adv: '4190.6', pps: '1', weightPiece: '13.01', freightGrossSpent: '$ 444,324.98', freightDiscount: '58.02%', freightRpp: '$ 8.90', freightNetSpent: '$ 186,522.07', freightProfit: '$ -63,128.55', freightOr: '1.34' },
    { volume: '62796', adv: '12559.2', pps: '1', weightPiece: '3.59', freightGrossSpent: '$ 1,077,840.91', freightDiscount: '48.86%', freightRpp: '$ 8.78', freightNetSpent: '$ 551,247.59', freightProfit: '$ -88,456.19', freightOr: '1.16' },
    { volume: '1497', adv: '299.4', pps: '1', weightPiece: '12.12', freightGrossSpent: '$ 21,525.93', freightDiscount: '37.83%', freightRpp: '$ 8.94', freightNetSpent: '$ 13,382.90', freightProfit: '$ 380.12', freightOr: '0.97' }
  ]);

  /**
   * Accessorial charges: a parent total over the services that incurred it.
   * Row headers/hierarchy taken from the client's reference screenshot
   * (Analyzer > Charges update). Two rows -- Additional Handling Packaging
   * and Delivery Area Commercial -- show broken-out children there; every
   * other row is collapsed in that screenshot with its contents not shown,
   * so it's kept as a leaf here rather than inventing unseen child rows.
   * Units/ADU/Discount figures are placeholders (the screenshot's own
   * Discount column was cut off and unreadable), formatted to match this
   * table's existing convention (no thousands separators on Units/ADU,
   * "$ #,###.00" on revenue, one-decimal "%") rather than the screenshot's.
   */
  DA.data.shippingProfileAccessorial = [
    {
      type: 'Fuel Surcharge',
      group: 'Fuel Surcharge',
      detail: 'Fuel Surcharge',
      totalUnits: '17888.0', pctTotalVolume: '97.2%', adu: '596.3',
      grossRevenue: '$ 65,904,390.00', netRevenue: '$ 65,903,160.00', discount: '0.0%'
    },
    {
      type: 'Transportation Charges',
      group: 'Additional Handling',
      detail: 'Additional Handling Packaging',
      expanded: true,
      totalUnits: '9360.0', pctTotalVolume: '18.1%', adu: '312.0',
      grossRevenue: '$ 340,236.00', netRevenue: '$ 340,236.00', discount: '0.0%',
      children: [
        { type: '', group: '', detail: 'Worldwide Express Saver', totalUnits: '6760.0', pctTotalVolume: '13.1%', adu: '225.3', grossRevenue: '$ 245,726.00', netRevenue: '$ 245,726.00', discount: '0.0%' },
        { type: '', group: '', detail: 'Worldwide Express Midday', totalUnits: '2600.0', pctTotalVolume: '5.0%', adu: '260.0', grossRevenue: '$ 94,510.00', netRevenue: '$ 94,510.00', discount: '0.0%' }
      ]
    },
    {
      type: 'Transportation Charges',
      group: 'Delivery Area',
      detail: 'Delivery Area Commercial',
      expanded: true,
      totalUnits: '104.0', pctTotalVolume: '0.6%', adu: '10.4',
      grossRevenue: '$ 468.00', netRevenue: '$ 210.00', discount: '55.0%',
      children: [
        { type: '', group: '', detail: 'Next Day Air Saver', totalUnits: '26.0', pctTotalVolume: '0.1%', adu: '2.6', grossRevenue: '$ 117.00', netRevenue: '$ 53.00', discount: '55.0%' },
        { type: '', group: '', detail: '2nd Day Air', totalUnits: '26.0', pctTotalVolume: '0.1%', adu: '2.6', grossRevenue: '$ 117.00', netRevenue: '$ 53.00', discount: '55.0%' },
        { type: '', group: '', detail: 'Ground', totalUnits: '52.0', pctTotalVolume: '0.3%', adu: '5.2', grossRevenue: '$ 234.00', netRevenue: '$ 105.00', discount: '55.0%' }
      ]
    },
    {
      type: 'Transportation Charges',
      group: 'Delivery Area',
      detail: 'Delivery Area Residential',
      totalUnits: '260.0', pctTotalVolume: '1.4%', adu: '26.0',
      grossRevenue: '$ 681.00', netRevenue: '$ 307.00', discount: '55.0%'
    },
    {
      type: 'Transportation Charges',
      group: 'Large Package',
      detail: 'Large Package Commercial',
      totalUnits: '29380.0', pctTotalVolume: '56.8%', adu: '1469.0',
      grossRevenue: '$ 7,748,780.00', netRevenue: '$ 7,748,780.00', discount: '0.0%'
    },
    {
      type: 'Transportation Charges',
      group: 'Over Maximum Limits',
      detail: 'Over Max Weight Surcharge',
      totalUnits: '19240.0', pctTotalVolume: '37.2%', adu: '1924.0',
      grossRevenue: '$ 36,075,000.00', netRevenue: '$ 36,075,000.00', discount: '0.0%'
    },
    {
      type: 'Transportation Charges',
      group: 'Residential Surcharge',
      detail: 'Residential Surcharge',
      totalUnits: '9620.0', pctTotalVolume: '52.3%', adu: '320.7',
      grossRevenue: '$ 65,910.00', netRevenue: '$ 63,047.00', discount: '4.5%'
    },
    {
      type: 'Other Charges',
      group: 'Other Charges',
      detail: 'Address Correction',
      totalUnits: '26.0', pctTotalVolume: '0.1%', adu: '2.6',
      grossRevenue: '$ 656.00', netRevenue: '$ 328.00', discount: '50.0%'
    },
    {
      type: 'Other Charges',
      group: 'Other Charges',
      detail: 'Third Party Billing Service',
      totalUnits: '520.0', pctTotalVolume: '2.8%', adu: '52.0',
      grossRevenue: '$ 427.00', netRevenue: '$ 171.00', discount: '60.0%'
    }
  ];

  /* ---- Pricing terms tab -------------------------------------------------- */

  /** Region > mode > service, as the service incentive plans are grouped. */
  DA.data.pricingServiceTree = [
    {
      label: 'Domestic',
      children: [
        {
          label: 'Air',
          children: [
            { label: '2nd Day Air' },
            { label: '2nd Day Air A.M.' },
            { label: '3 Day Select' },
            { label: 'Next Day Air' },
            { label: 'Next Day Air Early' },
            { label: 'Next Day Air Saver' }
          ]
        },
        { label: 'Ground', children: [{ label: 'Ground - Package' }] }
      ]
    }
  ];

  /** Zone columns and weight bands behind a service's incentive grid. */
  DA.data.rateZones = ['2', '3', '4', '5', '6', '7', '8', '44', '45', '46'];

  /** The Cell-by-cell method's own, smaller zone set (zero-padded, as the
      reference screen shows them -- distinct from rateZones' un-padded
      codes, which the Custom Net Rate method reuses instead). */
  DA.data.weightBreakZones = ['002', '003', '004', '005', '006', '007', '008'];

  DA.data.weightBreaks = [
    { from: '1', to: '5', rate: '46.00%' },
    { from: '6', to: '10', rate: '47.00%' },
    { from: '11', to: '20', rate: '50.00%' },
    { from: '21', to: '50', rate: '52.00%' },
    { from: '51+', to: '9999999', rate: '54.00%' }
  ];

  /**
   * Base/Zone method: a flat zone/ADV/incentive-amount table, no weight
   * bands -- the incentive is set once per zone rather than varying by
   * billable weight.
   */
  DA.data.baseZoneIncentives = [
    { zone: '401', adv: '0.51', incentiveAmount: '25.00%' },
    { zone: '402', adv: '0.00', incentiveAmount: '14.50%' },
    { zone: '403', adv: '0.02', incentiveAmount: '4.50%' },
    { zone: '404', adv: '0.38', incentiveAmount: '4.50%' },
    { zone: '405', adv: '0.00', incentiveAmount: '4.50%' },
    { zone: '406', adv: '0.00', incentiveAmount: '4.50%' },
    { zone: '407', adv: '0.00', incentiveAmount: '4.50%' },
    { zone: '409', adv: '0.00', incentiveAmount: '4.50%' },
    { zone: '411', adv: '0.00', incentiveAmount: '4.50%' },
    { zone: '412', adv: '0.03', incentiveAmount: '4.50%' },
    { zone: '413', adv: '0.00', incentiveAmount: '4.50%' },
    { zone: '420', adv: '0.00', incentiveAmount: '4.50%' },
    { zone: '421', adv: '0.00', incentiveAmount: '4.50%' },
    { zone: '481', adv: '5.31', incentiveAmount: '4.50%' },
    { zone: '482', adv: '2.43', incentiveAmount: '4.50%' },
    { zone: '484', adv: '0.00', incentiveAmount: '45.00%' }
  ];

  /**
   * Custom Net Rate method: a $ rate per billable weight (1 lb at a time,
   * not banded) and zone -- uploaded from a template rather than set as a
   * percentage, so every cell is a flat, non-editable figure. Keyed by
   * rateZones' own zone codes.
   */
  DA.data.customNetRateRows = [
    { weight: '1', rates: { '2': '$6.22', '3': '$6.22', '4': '$6.22', '5': '$6.22', '6': '$6.22', '7': '$6.22', '8': '$6.22', '44': '$15.22', '45': '$15.18', '46': '$20.05' } },
    { weight: '2', rates: { '2': '$0.00', '3': '$0.00', '4': '$0.00', '5': '$0.00', '6': '$0.00', '7': '$0.00', '8': '$0.00', '44': '$16.93', '45': '$17.00', '46': '$21.77' } },
    { weight: '3', rates: { '2': '$0.00', '3': '$0.00', '4': '$0.00', '5': '$0.00', '6': '$6.25', '7': '$6.47', '8': '$6.79', '44': '$18.40', '45': '$19.38', '46': '$23.18' } },
    { weight: '4', rates: { '2': '$0.00', '3': '$0.00', '4': '$0.00', '5': '$6.35', '6': '$6.51', '7': '$6.94', '8': '$7.28', '44': '$20.20', '45': '$20.65', '46': '$25.14' } },
    { weight: '5', rates: { '2': '$0.00', '3': '$0.00', '4': '$0.00', '5': '$6.62', '6': '$6.90', '7': '$7.25', '8': '$7.70', '44': '$21.90', '45': '$22.41', '46': '$26.73' } },
    { weight: '6', rates: { '2': '$0.00', '3': '$0.00', '4': '$0.00', '5': '$6.65', '6': '$0.00', '7': '$7.28', '8': '$0.00', '44': '$23.64', '45': '$23.87', '46': '$27.76' } },
    { weight: '7', rates: { '2': '$0.00', '3': '$0.00', '4': '$6.33', '5': '$6.86', '6': '$7.03', '7': '$7.48', '8': '$7.99', '44': '$25.24', '45': '$25.69', '46': '$29.17' } },
    { weight: '8', rates: { '2': '$0.00', '3': '$0.00', '4': '$6.54', '5': '$7.05', '6': '$7.30', '7': '$7.77', '8': '$8.35', '44': '$26.22', '45': '$27.04', '46': '$30.79' } },
    { weight: '9', rates: { '2': '$0.00', '3': '$0.00', '4': '$6.57', '5': '$7.14', '6': '$7.47', '7': '$8.08', '8': '$8.79', '44': '$28.07', '45': '$28.91', '46': '$32.60' } }
  ];

  DA.data.flowThroughOptions = [
    'P/P Pre-Paid',
    'F/C Freight Collect',
    'T/P Third Party',
    'Return Service'
  ];

  DA.data.tierIncentive = {
    tier: 'Tier 1',
    meta: [
      { label: 'Basis', value: 'Gross Revenue' },
      { label: 'Rolling Avg', value: '52 Weeks' },
      { label: 'Modeled', value: '$481,401' }
    ],
    bands: [
      { modeled: '0.0%', low: '$0.01', high: '$249,999.99', locked: true },
      { modeled: '51.9%', low: '$250,000.00', high: '$289,999.99' },
      { modeled: '60.2%', low: '$290,000.00', high: '$329,999.99' },
      // The two bands nearest the target, and the target itself, are still
      // open for negotiation -- their service group rates stay editable.
      { modeled: '68.6%', low: '$330,000.00', high: '$359,999.99', ratesEditable: true },
      { modeled: '74.8%', low: '$360,000.00', high: '$444,999.99', ratesEditable: true },
      { modeled: '92.4%', low: '$445,000.00', high: '$9,999,999,999.99', target: true, ratesEditable: true }
    ],
    serviceGroups: [
      { name: 'UPS N-Next Day Air', sublabel: '-LTR FC PP TP', rates: ['0.0%', '72.1%', '76.3%', '76.7%', '78.7%', '79.0%'] },
      { name: 'UPS N-Next Day Air', sublabel: '-PKG-Hundredweight FC PP TP', rates: ['0.0%', '38.0%', '43.0%', '44.0%', '46.3%', '46.6%'] },
      { name: 'UPS N-Next Day Air', sublabel: '-PKG FC PP RS TP', rates: ['0.0%', '72.8%', '76.8%', '77.3%', '81.7%', '82.2%'] },
      { name: 'UPS N-Next Day Air Saver', sublabel: '-LTR FC PP TP', rates: ['0.0%', '72.9%', '77.0%', '77.4%', '79.4%', '79.6%'] },
      { name: 'UPS N-Next Day Air Saver', sublabel: '-PKG-Hundredweight FC PP TP', rates: ['0.0%', '38.0%', '43.0%', '44.0%', '46.3%', '46.6%'] }
    ]
  };

  /**
   * Accessorial incentive plans under pricing terms, grouped by charge
   * family the same way the service incentive plans are grouped by region
   * -- Fuel Surcharge and Other Charges have nothing to open onto further,
   * so they're leaves themselves; Transportation Charges opens onto its
   * charge groups the way Domestic opens onto its modes.
   */
  DA.data.pricingAccessorialTree = [
    { label: 'Fuel Surcharge' },
    {
      label: 'Transportation Charges',
      children: [
        { label: 'Delivery Area', children: [{ label: 'Delivery Area Commercial' }] }
      ]
    },
    { label: 'Other Charges' }
  ];

  /**
   * The full accessorial catalog "Add Accessorial Incentive Plan" opens
   * onto -- every chargeable line a plan could be built from, Product and
   * Non-Product types mixed together the way the reference screen shows
   * them (Customs Brokerage's own charge lines are all Non-Product; the
   * surcharge-style lines below them are Product).
   */
  DA.data.accessorialCatalog = [
    { accessorialType: 'Customs Brokerage', productType: 'Non-Product', group: 'Complex Entries', detail: 'Complex Entry - Entry Status Upgrade' },
    { accessorialType: 'Customs Brokerage', productType: 'Non-Product', group: 'Complex Entries', detail: 'Complex Entry - US Goods Return' },
    { accessorialType: 'Customs Brokerage', productType: 'Non-Product', group: 'Complex Entries', detail: 'Live Entry Fee' },
    { accessorialType: 'Customs Brokerage', productType: 'Non-Product', group: 'Entry Preparation', detail: 'Document Fee' },
    { accessorialType: 'Customs Brokerage', productType: 'Non-Product', group: 'Other Brokerage Charges', detail: '1st Refund Charge' },
    { accessorialType: 'Customs Brokerage', productType: 'Non-Product', group: 'Other Brokerage Charges', detail: '3299 Personal Effects' },
    { accessorialType: 'Customs Brokerage', productType: 'Non-Product', group: 'Other Brokerage Charges', detail: 'Additional Entry Preparation Fee' },
    { accessorialType: 'Fuel Surcharge', productType: 'Product', group: 'Fuel', detail: 'Fuel Surcharge - Domestic' },
    { accessorialType: 'Fuel Surcharge', productType: 'Product', group: 'Fuel', detail: 'Fuel Surcharge - International' },
    { accessorialType: 'Delivery Area Surcharge', productType: 'Product', group: 'Delivery Area', detail: 'Delivery Area Commercial' },
    { accessorialType: 'Delivery Area Surcharge', productType: 'Product', group: 'Delivery Area', detail: 'Delivery Area Residential' },
    { accessorialType: 'Additional Handling', productType: 'Product', group: 'Additional Handling', detail: 'Additional Handling - Weight' },
    { accessorialType: 'Additional Handling', productType: 'Product', group: 'Additional Handling', detail: 'Additional Handling - Dimension' },
    { accessorialType: 'Additional Handling', productType: 'Product', group: 'Additional Handling', detail: 'Additional Handling - Packaging' },
    { accessorialType: 'Residential Surcharge', productType: 'Product', group: 'Residential', detail: 'Residential Surcharge' },
    { accessorialType: 'Large Package Surcharge', productType: 'Product', group: 'Large Package', detail: 'Large Package Surcharge' },
    { accessorialType: 'Signature Required', productType: 'Product', group: 'Delivery Confirmation', detail: 'Direct Signature Required' },
    { accessorialType: 'Signature Required', productType: 'Product', group: 'Delivery Confirmation', detail: 'Adult Signature Required' },
    { accessorialType: 'Address Correction', productType: 'Non-Product', group: 'Address Correction', detail: 'Address Correction Fee' },
    { accessorialType: 'Return Service', productType: 'Non-Product', group: 'Returns', detail: 'UPS Return Service' }
  ];

  /**
   * The incentive plan every accessorial leaf opens onto -- one shared
   * table, same as servicePlan()'s weight-break grid is shared across every
   * service leaf regardless of which one opened it.
   */
  DA.data.pricingAccessorialIncentives = [
    { movement: 'Domestic', mode: 'Air', serviceGroup: 'Next Day', service: 'Next Day Air Early', adu: '0.00', nrpp: '$0.00', incentiveType: '% Off', incentiveAmount: '60.00%' },
    { movement: 'Domestic', mode: 'Air', serviceGroup: 'Next Day', service: 'Next Day Air', adu: '0.42', nrpp: '$1.80', incentiveType: '% Off', incentiveAmount: '60.00%' },
    { movement: 'Domestic', mode: 'Air', serviceGroup: 'Next Day', service: 'Next Day Air Saver', adu: '0.00', nrpp: '$0.00', incentiveType: '% Off', incentiveAmount: '60.00%' },
    { movement: 'Domestic', mode: 'Air', serviceGroup: '2nd Day', service: '2nd Day Air A.M.', adu: '0.00', nrpp: '$0.00', incentiveType: '% Off', incentiveAmount: '60.00%' },
    { movement: 'Domestic', mode: 'Air', serviceGroup: '2nd Day', service: '2nd Day Air', adu: '0.40', nrpp: '$1.80', incentiveType: '% Off', incentiveAmount: '60.00%' },
    { movement: 'Domestic', mode: 'Air', serviceGroup: '3rd Day', service: '3 Day Select', adu: '0.03', nrpp: '$1.80', incentiveType: '% Off', incentiveAmount: '60.00%' },
    { movement: 'Domestic', mode: 'Ground', serviceGroup: 'Ground', service: 'Ground', adu: '1.68', nrpp: '$1.82', incentiveType: '% Off', incentiveAmount: '60.00%' }
  ];

  /**
   * Rows behind Analyzer > Accounts: the customer's parent account, grouped
   * by subparent, over the individual UPS account numbers billing under it.
   * Volume/ADV/Zone on the parent are the group's totals, not independent
   * figures, so they're written down directly rather than summed from
   * children the way an additive breakdown would -- there's no shared
   * "share of the whole" to derive per account here, each is its own record.
   */
  DA.data.packetAccounts = [
    {
      parent: '{customer}',
      subParent: 'No Sub Parent',
      accountNumber: '-',
      expanded: true,
      volume: '172658.0', adv: '2656.3', zone: '19.4',
      children: [
        { parent: '', subParent: '', accountNumber: '0000AW0689', volume: '19307.0', adv: '297.0', zone: '65.8' },
        { parent: '', subParent: '', accountNumber: '000082W208', volume: '153317.0', adv: '2358.7', zone: '13.6' },
        { parent: '', subParent: '', accountNumber: '000083E306', volume: '34.0', adv: '0.5', zone: '3.6' }
      ]
    }
  ];

  /**
   * Rows behind Analyzer > Weight & Cube: the same core services Services
   * lists, opening onto the billable weight tiers behind each (derived via
   * weightBreakdown, so a tier's figures always add back up to its
   * service's) -- except N-Next Day Air and N-Next Day Air Saver, which
   * carry a real `children` of their own instead, per the client's
   * reference screenshot (Analyzer > Weight & Cube update).
   *
   * Same scope/precedent as the Cost Details, Zones and Charges updates:
   * of the 5 rows the screenshot shows, only N-Next Day Air and N-Next Day
   * Air Saver get the package-type middle tier (a "UPS <service> -Pkg
   * <type>" row, superscript product/rate codes, showing "-" for its own
   * figures -- real numbers surface one level deeper, on the row's own
   * chevron). N-Next Day Air's package row (Residential, "FC, PP, RS,
   * RTP, TP") opens onto 5 real billable-weight rows straight from the
   * screenshot (Volume and ADV both sum back to the parent's 234/0.9).
   * N-Next Day Air Saver's two package rows (Commercial/Residential,
   * "FC, PP, TP") are shown collapsed with contents not visible, so left
   * as leaves. N-2nd Day Air, N-3 Day Select and N-Ground get the
   * screenshot's own visible figures and (N-3 Day Select/N-Ground) are
   * new rows the table didn't carry before, but keep the table's existing
   * generic weightBreakdown() split -- the screenshot doesn't show a
   * package tier for any of them.
   *
   * Base RPP/Base Profit/Base OR aren't visible in the screenshot for any
   * row (cut off past Base Gross Rev/Net Rev/Disc) or, for the two new
   * rows, anywhere in this table before now -- N-Next Day Air, N-Next Day
   * Air Saver and N-2nd Day Air (and, in turn, N-Next Day Air's own new
   * billable-weight children) keep each row's own pre-existing
   * placeholder figures for those three columns; N-3 Day Select and
   * N-Ground reuse the same-named service's own figures already on file
   * in DA.data.packetServices below, rather than inventing new ones.
   */
  DA.data.packetWeightCube = [
    {
      service: 'N-Next Day Air', billable: '-',
      expanded: true,
      volume: '234', adv: '0.9', pps: '1.0', weightPiece: '5.8',
      baseGrossRev: '$34,098', baseNetRev: '$7,154', baseDisc: '79.0%',
      baseRpp: '$32.85', baseProfit: '$5,037', baseOr: '0.50',
      children: [
        {
          service: 'N-Next Day Air', billable: '-',
          expanded: true,
          pkgType: 'Residential', pkgCodes: 'FC, PP, RS, RTP, TP',
          volume: '-', adv: '-', pps: '-', weightPiece: '-',
          baseGrossRev: '-', baseNetRev: '-', baseDisc: '-', baseRpp: '-', baseProfit: '-', baseOr: '-',
          children: [
            { service: '', billable: '2', volume: '104', adv: '0.4', pps: '1.0', weightPiece: '1.0', baseGrossRev: '$11,012', baseNetRev: '$2,269', baseDisc: '79.4%', baseRpp: '$32.85', baseProfit: '$5,037', baseOr: '0.50' },
            { service: '', billable: '9', volume: '26', adv: '0.1', pps: '1.0', weightPiece: '9.0', baseGrossRev: '$5,199', baseNetRev: '$1,003', baseDisc: '80.7%', baseRpp: '$32.85', baseProfit: '$5,037', baseOr: '0.50' },
            { service: '', billable: '10', volume: '52', adv: '0.2', pps: '1.0', weightPiece: '9.5', baseGrossRev: '$3,334', baseNetRev: '$1,073', baseDisc: '67.8%', baseRpp: '$32.85', baseProfit: '$5,037', baseOr: '0.50' },
            { service: '', billable: '16', volume: '26', adv: '0.1', pps: '1.0', weightPiece: '15.0', baseGrossRev: '$7,549', baseNetRev: '$1,457', baseDisc: '80.7%', baseRpp: '$32.85', baseProfit: '$5,037', baseOr: '0.50' },
            { service: '', billable: '19', volume: '26', adv: '0.1', pps: '1.0', weightPiece: '5.0', baseGrossRev: '$7,004', baseNetRev: '$1,352', baseDisc: '80.7%', baseRpp: '$32.85', baseProfit: '$5,037', baseOr: '0.50' }
          ]
        }
      ]
    },
    {
      service: 'N-Next Day Air Saver', billable: '-',
      expanded: true,
      volume: '52', adv: '0.2', pps: '1.0', weightPiece: '10.0',
      baseGrossRev: '$11,806', baseNetRev: '$2,420', baseDisc: '79.5%',
      baseRpp: '$11.98', baseProfit: '$0', baseOr: '0.99',
      children: [
        {
          service: 'N-Next Day Air Saver', billable: '-',
          pkgType: 'Commercial', pkgCodes: 'FC, PP, TP',
          volume: '-', adv: '-', pps: '-', weightPiece: '-',
          baseGrossRev: '-', baseNetRev: '-', baseDisc: '-', baseRpp: '-', baseProfit: '-', baseOr: '-'
        },
        {
          service: 'N-Next Day Air Saver', billable: '-',
          pkgType: 'Residential', pkgCodes: 'FC, PP, TP',
          volume: '-', adv: '-', pps: '-', weightPiece: '-',
          baseGrossRev: '-', baseNetRev: '-', baseDisc: '-', baseRpp: '-', baseProfit: '-', baseOr: '-'
        }
      ]
    },
    {
      service: 'N-2nd Day Air', billable: '-',
      volume: '26', adv: '0.1', pps: '1.0', weightPiece: '15.0',
      baseGrossRev: '$3,014', baseNetRev: '$820', baseDisc: '72.8%',
      baseRpp: '$19.68', baseProfit: '$ -341', baseOr: '0.52'
    },
    {
      service: 'N-3 Day Select', billable: '-',
      volume: '22100', adv: '85.0', pps: '3.4', weightPiece: '368.5',
      baseGrossRev: '$9,928,004', baseNetRev: '$9,928,004', baseDisc: '0.0%',
      baseRpp: '$19.18', baseProfit: '$2,046', baseOr: '0.86'
    },
    {
      service: 'N-Ground', billable: '-',
      volume: '1716', adv: '6.6', pps: '1.0', weightPiece: '153.3',
      baseGrossRev: '$240,236', baseNetRev: '$236,326', baseDisc: '1.6%',
      baseRpp: '$8.83', baseProfit: '$18,213', baseOr: '0.86'
    }
  ];

  /**
   * Rows behind Analyzer > Services. Reference screen order: 2nd Day Air,
   * 3 Day Select, Next Day Air, Next Day Air Saver, Ground (its own
   * volume/ADV/Avg Zone/Billable Wt lifted directly from that screen).
   * N-2nd Day Air, N-Next Day Air, and N-Next Day Air Saver share the
   * same volume/ADV with their packetWeightCube rows below -- the same
   * packet's shipments, just organized by a different breakdown -- so
   * their revenue figures are carried over unchanged rather than
   * re-invented. N-Ground is expanded by default, matching the
   * reference. The remaining domestic and international services round
   * the list out past 20 rows.
   */
  DA.data.packetServices = [
    { service: 'N-2nd Day Air', volume: '4203', adv: '64.7', avgZone: '206.3', billableWt: '8.5', pps: '1.0', baseGrossRev: '$407,142', baseNetRev: '$82,709', disc: '79.7%', baseRpp: '$19.68', baseProfit: '$ -341', baseOr: '0.52' },
    { service: 'N-3 Day Select', volume: '741', adv: '11.4', avgZone: '307.1', billableWt: '6.4', pps: '1.0', baseGrossRev: '$62,480', baseNetRev: '$14,213', disc: '77.3%', baseRpp: '$19.18', baseProfit: '$2,046', baseOr: '0.86' },
    { service: 'N-Next Day Air', volume: '890', adv: '13.7', avgZone: '106.3', billableWt: '8.8', pps: '1.0', baseGrossRev: '$164,299', baseNetRev: '$29,249', disc: '82.2%', baseRpp: '$32.85', baseProfit: '$5,037', baseOr: '0.50' },
    { service: 'N-Next Day Air Saver', volume: '1', adv: '0.0', avgZone: '136.0', billableWt: '0.0', pps: '1.0', baseGrossRev: '$59', baseNetRev: '$12', disc: '79.6%', baseRpp: '$11.98', baseProfit: '$0', baseOr: '0.99' },
    { service: 'N-Ground', volume: '14926', adv: '229.6', avgZone: '5.9', billableWt: '12.6', pps: '1.0', baseGrossRev: '$298,940', baseNetRev: '$131,835', disc: '55.9%', baseRpp: '$8.83', baseProfit: '$18,213', baseOr: '0.86', expanded: true },
    { service: 'N-2nd Day Air A.M.', volume: '186', adv: '2.9', avgZone: '245.0', billableWt: '21.2', pps: '1.0', baseGrossRev: '$27,830', baseNetRev: '$16,984', disc: '39.0%', baseRpp: '$91.31', baseProfit: '$6,412', baseOr: '0.62' },
    { service: 'N-Next Day Air Early', volume: '54', adv: '0.8', avgZone: '105.0', billableWt: '9.6', pps: '1.0', baseGrossRev: '$9,845', baseNetRev: '$5,712', disc: '42.0%', baseRpp: '$105.78', baseProfit: '$2,014', baseOr: '0.65' },
    { service: 'N-Ground Saver', volume: '3812', adv: '58.6', avgZone: '5.4', billableWt: '4.1', pps: '1.0', baseGrossRev: '$41,230', baseNetRev: '$28,842', disc: '30.1%', baseRpp: '$7.57', baseProfit: '$2,105', baseOr: '0.93' },
    { service: 'N-SurePost Under 1 lb', volume: '2960', adv: '45.5', avgZone: '4.9', billableWt: '0.9', pps: '1.0', baseGrossRev: '$12,470', baseNetRev: '$8,724', disc: '30.0%', baseRpp: '$2.95', baseProfit: '$ -612', baseOr: '1.07' },
    { service: 'N-SurePost 1 lb & Over', volume: '1548', adv: '23.8', avgZone: '5.2', billableWt: '2.6', pps: '1.0', baseGrossRev: '$18,920', baseNetRev: '$13,244', disc: '30.0%', baseRpp: '$8.55', baseProfit: '$890', baseOr: '0.93' },
    { service: 'E-Worldwide Expedited', volume: '4', adv: '0.0', avgZone: '71.0', billableWt: '7.0', pps: '1.0', baseGrossRev: '$697', baseNetRev: '$334', disc: '52.1%', baseRpp: '$83.44', baseProfit: '$233', baseOr: '0.30' },
    { service: 'E-Worldwide Express Saver', volume: '4', adv: '0.0', avgZone: '481.0', billableWt: '10.0', pps: '1.0', baseGrossRev: '$787', baseNetRev: '$326', disc: '58.5%', baseRpp: '$81.61', baseProfit: '$213', baseOr: '0.35' },
    { service: 'E-Worldwide Express', volume: '62', adv: '0.5', avgZone: '512.0', billableWt: '9.4', pps: '1.0', baseGrossRev: '$18,940', baseNetRev: '$9,845', disc: '48.0%', baseRpp: '$158.79', baseProfit: '$6,102', baseOr: '0.38' },
    { service: 'E-Worldwide Express Plus', volume: '11', adv: '0.1', avgZone: '512.0', billableWt: '14.1', pps: '1.0', baseGrossRev: '$4,982', baseNetRev: '$2,610', disc: '47.6%', baseRpp: '$237.30', baseProfit: '$1,540', baseOr: '0.41' },
    { service: 'E-Worldwide Saver', volume: '38', adv: '0.3', avgZone: '498.0', billableWt: '8.2', pps: '1.0', baseGrossRev: '$7,214', baseNetRev: '$3,802', disc: '47.3%', baseRpp: '$100.05', baseProfit: '$2,046', baseOr: '0.46' },
    { service: 'E-Worldwide Economy DDU', volume: '26', adv: '0.2', avgZone: '512.0', billableWt: '6.7', pps: '1.0', baseGrossRev: '$2,984', baseNetRev: '$1,712', disc: '42.6%', baseRpp: '$65.85', baseProfit: '$612', baseOr: '0.64' },
    { service: 'E-Worldwide Economy DDP', volume: '19', adv: '0.2', avgZone: '512.0', billableWt: '7.9', pps: '1.0', baseGrossRev: '$3,127', baseNetRev: '$1,896', disc: '39.4%', baseRpp: '$99.79', baseProfit: '$701', baseOr: '0.63' },
    { service: 'E-Standard', volume: '84', adv: '0.7', avgZone: '12.4', billableWt: '5.3', pps: '1.0', baseGrossRev: '$5,612', baseNetRev: '$4,215', disc: '24.9%', baseRpp: '$50.18', baseProfit: '$1,890', baseOr: '0.55' },
    { service: 'E-Import Express', volume: '9', adv: '0.1', avgZone: '498.0', billableWt: '8.8', pps: '1.0', baseGrossRev: '$3,845', baseNetRev: '$2,014', disc: '47.6%', baseRpp: '$223.78', baseProfit: '$1,102', baseOr: '0.45' },
    { service: 'E-Import Express Saver', volume: '7', adv: '0.1', avgZone: '481.0', billableWt: '7.5', pps: '1.0', baseGrossRev: '$2,690', baseNetRev: '$1,412', disc: '47.5%', baseRpp: '$201.71', baseProfit: '$780', baseOr: '0.45' },
    { service: 'E-Worldwide Express Freight', volume: '3', adv: '0.0', avgZone: '512.0', billableWt: '412.0', pps: '1.0', baseGrossRev: '$8,940', baseNetRev: '$5,203', disc: '41.8%', baseRpp: '$1,734.33', baseProfit: '$2,014', baseOr: '0.61' },
    { service: 'E-Worldwide Express Freight Midday', volume: '2', adv: '0.0', avgZone: '512.0', billableWt: '398.0', pps: '1.0', baseGrossRev: '$6,214', baseNetRev: '$3,618', disc: '41.8%', baseRpp: '$1,809.00', baseProfit: '$1,402', baseOr: '0.61' }
  ];

  /**
   * Rate Charts' Net-basis grid: a $ rate per zone/weight-tier cell, the same
   * for every scenario in this demo (the reference screen shows Current and
   * Scenario 1 landing on identical figures). Gross and Volume bases have no
   * reference data yet -- the view's own empty state covers them.
   */
  DA.data.rateChartGrid = {
    zones: ['051', '052', '053', '054'],
    rows: [
      { weight: '1', net: ['$15.14', '$15.21', '$15.28', '$20.20'] },
      { weight: '2', net: ['$15.14', '$15.21', '$15.28', '$20.20'] },
      { weight: '3', net: ['$15.14', '$15.21', '$15.28', '$20.20'] },
      { weight: '4', net: ['$15.14', '$15.21', '$15.28', '$20.20'] },
      { weight: '5', net: ['$15.14', '$15.21', '$15.28', '$20.20'] },
      { weight: '6', net: ['$15.29', '$15.43', '$15.54', '$20.20'] },
      { weight: '7', net: ['$15.99', '$16.14', '$16.25', '$20.20'] },
      { weight: '8', net: ['$16.72', '$16.87', '$17.00', '$20.20'] },
      { weight: '9', net: ['$17.41', '$17.57', '$17.70', '$20.23'] }
    ]
  };

  /**
   * Rows behind Other Terms > Dim Divisor. Published Fuel Surcharge has no
   * reference screen yet. Each row's threshold band data (divisorCode,
   * cubicVolumeFrom, divisor) feeds the Structure Details dialog rather
   * than a flat column -- the outer table only ever shows the drill-down.
   */
  DA.data.packetDimDivisor = [
    { movement: 'Domestic', mode: 'Air', serviceGroup: 'Next Day Air Early', incentiveType: 'DIM Divisor', divisorCode: '01 - Dim Weight Divisor', cubicVolumeFrom: '0.0', divisor: '194.0' },
    { movement: 'Domestic', mode: 'Air', serviceGroup: 'Next Day Air Early', incentiveType: 'DIM Divisor', divisorCode: '01 - Dim Weight Divisor', cubicVolumeFrom: '0.0', divisor: '194.0' },
    { movement: 'Domestic', mode: 'Air', serviceGroup: 'Next Day Air Early', incentiveType: 'DIM Divisor', divisorCode: '01 - Dim Weight Divisor', cubicVolumeFrom: '0.0', divisor: '194.0' },
    { movement: 'Domestic', mode: 'Air', serviceGroup: 'Next Day Air Early', incentiveType: 'DIM Divisor', divisorCode: '01 - Dim Weight Divisor', cubicVolumeFrom: '0.0', divisor: '194.0' },
    { movement: 'Domestic', mode: 'Air', serviceGroup: 'Next Day Air Early', incentiveType: 'DIM Divisor', divisorCode: '01 - Dim Weight Divisor', cubicVolumeFrom: '0.0', divisor: '194.0' },
    { movement: 'Domestic', mode: 'Air', serviceGroup: 'Next Day Air Early', incentiveType: 'DIM Divisor', divisorCode: '01 - Dim Weight Divisor', cubicVolumeFrom: '0.0', divisor: '194.0' },
    { movement: 'Domestic', mode: 'Air', serviceGroup: 'Next Day Air', incentiveType: 'DIM Divisor', divisorCode: '01 - Dim Weight Divisor', cubicVolumeFrom: '0.0', divisor: '194.0' },
    { movement: 'Domestic', mode: 'Air', serviceGroup: 'Next Day Air', incentiveType: 'DIM Divisor', divisorCode: '01 - Dim Weight Divisor', cubicVolumeFrom: '0.0', divisor: '194.0' }
  ];
})(window.DA);
