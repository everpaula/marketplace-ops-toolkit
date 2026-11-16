/*
 * Kit Landed Cost Calculator: math core.
 * Pure functions, no DOM. Loaded by kit-landed-cost-calculator.html as window.KitCore
 * and by the Node tests as a CommonJS module.
 *
 * Units: money in USD, volume in CBM, weight in kg, rates as fractions (0.25 = 25%).
 * "Per unit" means per unit of measure of the component (sq ft, each, set).
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.KitCore = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  var EPS = 1e-9;
  var CONTAINER_TYPES = ['40HQ', '40GP', '20GP'];

  // Researched defaults. Every value is editable on the page. Not customs or legal advice.
  var DEFAULTS = {
    asOf: '2026-11-16',
    destination: 'west',
    origins: {
      CN: {
        label: 'China',
        // Port-to-port, per container. 40GP = Drewry WCI Shanghai lane (Nov 12, 2026), rounded.
        // 40HQ and 20GP are derived from it (HQ premium about 3%, 20GP about 55%).
        freightPerContainer: { '20GP': 4100, '40GP': 7400, '40HQ': 7650 },
        lclPerCbm: 160,
        freightByCoast: {
          west: { '20GP': 4100, '40GP': 7400, '40HQ': 7650 },
          east: { '20GP': 5000, '40GP': 9000, '40HQ': 9300 }
        },
        lclByCoast: { west: 160, east: 190 },
        countryAdders: [
          { label: 'Section 301 China, List 3 (most kit HTS lines)', rate: 0.25 },
          { label: 'Section 301 forced-labor action (from Jul 24, 2026)', rate: 0.125, exemptIf232: true }
        ]
      },
      VN: {
        label: 'Vietnam',
        // No public index lane for Vietnam: Shanghai lane plus about 5%. Replace with your forwarder quote.
        freightPerContainer: { '20GP': 4300, '40GP': 7800, '40HQ': 8050 },
        lclPerCbm: 170,
        freightByCoast: {
          west: { '20GP': 4300, '40GP': 7800, '40HQ': 8050 },
          east: { '20GP': 5200, '40GP': 9500, '40HQ': 9750 }
        },
        lclByCoast: { west: 170, east: 200 },
        countryAdders: [
          { label: 'Section 301 forced-labor action (from Jul 24, 2026)', rate: 0.125, exemptIf232: true }
        ]
      }
    },
    fees: {
      mpfRate: 0.003464,      // CBP FY2027 (from Oct 1, 2026): 0.3464% ad valorem
      mpfMin: 34.58,          // per formal entry
      mpfMax: 670.86,         // per formal entry
      hmfRate: 0.00125,       // 0.125% of value, ocean shipments
      brokerPerEntry: 175,    // estimate
      isfPerEntry: 35,        // estimate
      bondPerEntry: 75,       // estimate, single-entry bond
      insuranceRate: 0.004,   // estimate, on goods + freight
      drayagePerContainer: 950, // estimate, port to warehouse
      lclDelivery: 350        // estimate, CFS to warehouse per LCL shipment
    },
    // Section 232 (steel, aluminum, copper). Since Apr 6, 2026 a covered article pays on its full
    // customs value: 50% for articles mostly of metal, 25% for listed derivatives. Set the share to
    // 1 (covered) or 0 (not covered, or metal under 15% of the article's weight).
    metal232Rate: 0.5,
    // Usable payload is the US road-legal limit, not the box's maximum gross weight.
    containers: {
      '20GP': { cbm: 28, kg: 19000 },
      '40GP': { cbm: 58, kg: 20000 },
      '40HQ': { cbm: 68, kg: 20000 }
    },
    transitDays: { CN: { west: 16, east: 33 }, VN: { west: 22, east: 35 } },
    clearanceDays: 7,
    cbmPerPallet: 1.6,
    sources: [
      { label: 'USTR Section 301 forced-labor final action, 91 FR 47318 (Jul 28, 2026): China and Vietnam 12.5%, effective Jul 24, 2026; goods under Section 232 exempt', url: 'https://www.govinfo.gov/content/pkg/FR-2026-07-28/html/2026-15181.htm', asOf: '2026-07-28' },
      { label: 'USTR fact sheet on the forced-labor Section 301 action', url: 'https://ustr.gov/about/policy-offices/press-office/fact-sheets/2026/july/fact-sheet-ustr-section-301-action-response-failure-60-economies-ban-imports-produced-forced-labor', asOf: '2026-07-23' },
      { label: 'CBP CSMS 18-000554: Section 301 List 3 on China, heading 9903.88.03 (25% since May 10, 2019)', url: 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/20eee50', asOf: '2019-05-10' },
      { label: 'Supreme Court, Learning Resources v. Trump (Feb 20, 2026): IEEPA tariffs struck down; CBP stopped collecting Feb 24, 2026. The Section 122 10% surcharge that followed expired Jul 24, 2026', url: 'https://www.bradley.com/insights/publications/2026/02/supreme-court-strikes-down-ieepa-tariffs-key-takeaways-and-next-steps-for-businesses', asOf: '2026-02-20' },
      { label: 'Section 232 steel, aluminum and copper restructured from Apr 6, 2026: full customs value, 50% and 25% tiers, under 15% metal by weight excluded (summary)', url: 'https://www.bdo.com/insights/tax/section-232-metals-tariffs-expanded-and-recalibrated-what-importers-need-to-know', asOf: '2026-04-06' },
      { label: 'USITC Harmonized Tariff Schedule (column 1 general rates used in the example)', url: 'https://hts.usitc.gov/', asOf: '2026-11-16' },
      { label: 'CBP Dec. 26-14, customs user fees for FY2027, 91 FR 48398: MPF $34.58 min, $670.86 max, 0.3464%', url: 'https://www.federalregister.gov/documents/2026/07/31/2026-15530/customs-user-fees-to-be-adjusted-for-inflation-in-fiscal-year-2027', asOf: '2026-10-01' },
      { label: 'CBP user fee table (HMF 0.125%, MPF limits)', url: 'https://www.cbp.gov/trade/basic-import-export/user-fee-table', asOf: '2026-11-16' },
      { label: 'Drewry World Container Index, Nov 12, 2026: Shanghai to Los Angeles $7,416 and to New York $9,020 per 40ft', url: 'https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry', asOf: '2026-11-12' },
      { label: 'Dimerco, ocean transit times Asia to USA (port to port ranges)', url: 'https://dimerco.com/blog-post/a-guide-to-international-freight-transit-times-from-asia-to-usa/', asOf: '2026-11-16' }
    ]
  };

  function num(x, fallback) {
    var n = typeof x === 'number' ? x : (x === null || x === undefined || x === '' ? NaN : Number(x));
    if (Number.isFinite(n)) return n;
    return fallback === undefined ? 0 : fallback;
  }
  function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }
  function incotermOf(q) {
    var t = String((q && q.incoterm) || 'FOB').toUpperCase();
    return t === 'EXW' || t === 'CIF' ? t : 'FOB';
  }
  function originCfg(origin, settings) {
    if (origin && typeof origin === 'object') return origin;
    var s = settings || DEFAULTS;
    return (s.origins && s.origins[origin]) || { countryAdders: [] };
  }

  // Duty as a fraction of customs value: base HTS rate + country adders + Section 232 layer.
  // Adders flagged exemptIf232 fall away on the share of value that pays Section 232.
  function dutyRate(quote, component, origin, settings) {
    var s = settings || DEFAULTS;
    var o = originCfg(origin !== undefined ? origin : quote && quote.origin, s);
    var c = component || {};
    var share = clamp(num(c.metal232Share, 0), 0, 1);
    var rate232 = num(c.metal232Rate, num(s.metal232Rate, DEFAULTS.metal232Rate));
    var r = num(c.baseDutyRate, 0);
    (o.countryAdders || []).forEach(function (a) {
      var ar = num(a.rate, 0);
      r += a.exemptIf232 ? ar * (1 - share) : ar;
    });
    r += share * rate232;
    return Math.max(0, r);
  }

  // Transaction value per unit of measure. FOB as quoted; EXW adds the origin leg to the port
  // (conservative: some brokers can leave it out on a through bill of lading); CIF removes the
  // ocean freight and insurance that the price already includes.
  function customsValue(quote) {
    var price = num(quote.price, 0);
    var t = incotermOf(quote);
    if (t === 'EXW') return price + num(quote.exwToFobPerUnit, 0);
    if (t === 'CIF') return Math.max(0, price - num(quote.cifFreightInsurancePerUnit, 0));
    return price;
  }

  // One shipment line: a component bought from one quote, qty in its unit of measure.
  function buildLine(component, quote, qty, settings, originOverride) {
    var origin = originOverride || quote.origin;
    var upc = num(component.unitsPerCarton, 0);
    var q = Math.max(0, num(qty, 0));
    var cv = customsValue(quote, component);
    var t = incotermOf(quote);
    return {
      componentId: component.id,
      quoteId: quote.id,
      origin: origin,
      incoterm: t,
      qty: q,
      cartons: upc > 0 ? q / upc : 0,
      cbmPerCarton: num(quote.cbmPerCarton, 0),
      kgPerCarton: num(quote.kgPerCarton, 0),
      fobPerUnit: cv,
      customsValuePerUnit: cv,
      cifFreightPerUnit: t === 'CIF' ? num(quote.cifFreightInsurancePerUnit, 0) : 0,
      dutyRate: dutyRate(quote, component, origin, settings)
    };
  }

  function lineCbm(l) { return l.incoterm === 'CIF' ? 0 : num(l.cartons) * num(l.cbmPerCarton); }
  function lineKg(l) { return l.incoterm === 'CIF' ? 0 : num(l.cartons) * num(l.kgPerCarton); }

  // Containers for one origin. Full boxes use the type with the lowest cost per usable CBM at this
  // load's density; the rest goes in whichever is cheaper: one more box of a type it fits, or LCL
  // (offered only below half the largest box).
  function packOrigin(cbm, kg, o, s) {
    var caps = s.containers || DEFAULTS.containers;
    var freight = o.freightPerContainer || {};
    var res = { containers: [], lclCbm: 0, lclKg: 0, lclCost: 0, freightTotal: 0 };
    if (!(cbm > EPS)) return res;
    var types = CONTAINER_TYPES.filter(function (t) {
      return caps[t] && num(caps[t].cbm) > 0 && num(caps[t].kg) > 0 && num(freight[t]) > 0;
    });
    var lclRate = Math.max(0, num(o.lclPerCbm, 0));
    var density = kg / cbm;
    var maxCbm = types.reduce(function (m, t) { return Math.max(m, caps[t].cbm); }, 0) || num(caps['40HQ'] && caps['40HQ'].cbm, 68);
    var lclMax = s.lclMaxCbm !== undefined ? num(s.lclMaxCbm, maxCbm / 2) : maxCbm / 2;

    if (!types.length) {
      res.lclCbm = cbm; res.lclKg = kg; res.lclCost = Math.max(cbm, 1) * lclRate; res.freightTotal = res.lclCost;
      return res;
    }
    var eff = function (t) { return Math.min(caps[t].cbm, density > 0 ? caps[t].kg / density : Infinity); };
    var best = types.slice().sort(function (a, b) { return freight[a] / eff(a) - freight[b] / eff(b); })[0];
    var remCbm = cbm, remKg = kg;
    var fits = function (t) { return remCbm <= caps[t].cbm + EPS && remKg <= caps[t].kg + EPS; };
    var guard = 0;
    while (!fits(best) && guard++ < 1e6) {
      var fillCbm = eff(best);
      var fillKg = fillCbm * density;
      var byWeight = density > 0 && caps[best].kg / density < caps[best].cbm - EPS;
      res.containers.push({ type: best, cbmUsed: fillCbm, kgUsed: fillKg, limitedBy: byWeight ? 'weight' : 'volume', full: true, cost: num(freight[best]) });
      remCbm -= fillCbm; remKg -= fillKg;
    }
    if (remCbm > EPS) {
      var opts = types.filter(fits).map(function (t) { return { type: t, cost: num(freight[t]) }; });
      if (lclRate > 0 && remCbm <= lclMax + EPS) opts.push({ type: 'LCL', cost: Math.max(remCbm, 1) * lclRate });
      opts.sort(function (a, b) { return a.cost - b.cost; });
      var pick = opts[0];
      if (pick.type === 'LCL') {
        res.lclCbm = remCbm; res.lclKg = Math.max(0, remKg); res.lclCost = pick.cost;
      } else {
        res.containers.push({ type: pick.type, cbmUsed: remCbm, kgUsed: Math.max(0, remKg), limitedBy: 'volume', full: false, cost: pick.cost });
      }
    }
    res.freightTotal = res.containers.reduce(function (a, c) { return a + c.cost; }, 0) + res.lclCost;
    return res;
  }

  // Group lines by origin (one entry per origin per shipment) and pack each group.
  // CIF lines count toward the entry value but not toward our containers.
  function packLines(lines, settings) {
    var s = settings || DEFAULTS;
    var byOrigin = {};
    (lines || []).forEach(function (l) {
      var g = byOrigin[l.origin] || (byOrigin[l.origin] = { cbm: 0, kg: 0, value: 0 });
      var v = num(l.qty) * num(l.customsValuePerUnit);
      g.value += Number.isFinite(v) ? v : 0;
      g.cbm += lineCbm(l);
      g.kg += lineKg(l);
    });
    Object.keys(byOrigin).forEach(function (o) {
      var g = byOrigin[o];
      var p = packOrigin(g.cbm, g.kg, originCfg(o, s), s);
      Object.keys(p).forEach(function (k) { g[k] = p[k]; });
    });
    return { byOrigin: byOrigin };
  }

  var ZERO = { fob: 0, freight: 0, duty: 0, mpf: 0, hmf: 0, broker: 0, insurance: 0, drayage: 0, total: 0 };

  // Landed cost per unit of measure for one line, given the packing of its shipment.
  function landedCostPerUnit(line, packing, settings) {
    var s = settings || DEFAULTS;
    var f = s.fees || DEFAULTS.fees;
    var qty = num(line.qty);
    if (!(qty > 0)) return Object.assign({}, ZERO);
    var g = (packing && packing.byOrigin && packing.byOrigin[line.origin]) || { cbm: 0, kg: 0, value: 0, containers: [], lclCbm: 0, lclCost: 0 };
    var cv = num(line.customsValuePerUnit);
    var fob = num(line.fobPerUnit, cv);
    var freight = 0, drayage = 0, insurance = 0;
    var dray = num(f.drayagePerContainer);

    if (line.incoterm === 'CIF') {
      freight = num(line.cifFreightPerUnit);
      // Supplier-booked box: charge drayage pro rata to a full 40HQ by volume.
      var hq = (s.containers && s.containers['40HQ']) || DEFAULTS.containers['40HQ'];
      drayage = dray * (num(line.cartons) * num(line.cbmPerCarton)) / num(hq.cbm, 68) / qty;
    } else {
      var lc = lineCbm(line), lk = lineKg(line);
      var shareCbm = g.cbm > EPS ? lc / g.cbm : 0;
      var shareKg = g.kg > EPS ? lk / g.kg : shareCbm;
      var fr = 0, dr = 0;
      (g.containers || []).forEach(function (c) {
        var sh = c.limitedBy === 'weight' ? shareKg : shareCbm;
        fr += c.cost * sh;
        dr += dray * sh;
      });
      if (g.lclCbm > EPS) {
        fr += g.lclCost * shareCbm;
        dr += num(f.lclDelivery) * shareCbm;
      }
      freight = fr / qty;
      drayage = dr / qty;
      insurance = num(f.insuranceRate) * (fob + freight);
    }

    var duty = num(line.dutyRate) * cv;
    var entryValue = num(g.value);
    var valueShare = entryValue > EPS ? cv / entryValue : 0;
    var mpfEntry = clamp(num(f.mpfRate) * entryValue, num(f.mpfMin), num(f.mpfMax, Infinity));
    var mpf = entryValue > EPS ? mpfEntry * valueShare : 0;
    var hmf = num(f.hmfRate) * cv;
    var broker = (num(f.brokerPerEntry) + num(f.isfPerEntry) + num(f.bondPerEntry)) * valueShare;
    var total = fob + freight + duty + mpf + hmf + broker + insurance + drayage;
    return { fob: fob, freight: freight, duty: duty, mpf: mpf, hmf: hmf, broker: broker, insurance: insurance, drayage: drayage, total: total };
  }

  return {
    DEFAULTS: DEFAULTS,
    CONTAINER_TYPES: CONTAINER_TYPES,
    num: num,
    dutyRate: dutyRate,
    customsValue: customsValue,
    buildLine: buildLine,
    packLines: packLines,
    landedCostPerUnit: landedCostPerUnit
  };
});
