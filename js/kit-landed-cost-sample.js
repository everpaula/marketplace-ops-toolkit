/*
 * Copyright (c) 2026 Plenor Group LLC. All rights reserved.
 * Not covered by the MIT License in this repository's LICENSE file.
 * See NOTICE.md and https://everpaula.github.io/marketplace-ops-toolkit/terms.html#ownership
 */
/*
 * Example project for the Kit Landed Cost Calculator: a 120-unit multifamily renovation,
 * one mid-range finish kit, two shipment lots. Supplier names are placeholders; prices,
 * MOQs, cartons and weights are plausible ranges, not quotes from real factories.
 * HTS codes are examples. Confirm classification with your broker.
 */
(function (root) {
  'use strict';
  var ALL = { factoryVerified: true, businessLicense: true, usExportHistory: true, thirdPartyAudit: true, sampleApproved: true, certifications: true, responsive: true };
  function checks(off) {
    var c = {};
    Object.keys(ALL).forEach(function (k) { c[k] = (off || []).indexOf(k) < 0; });
    return c;
  }
  function q(id, supplier, origin, price, moq, days, cbm, kg, off, extra) {
    var o = {
      id: id, supplier: supplier, origin: origin, incoterm: 'FOB', price: price, moq: moq, productionDays: days,
      paymentTerms: { depositPct: 0.3, balance: 'beforeShipment' }, cbmPerCarton: cbm, kgPerCarton: kg,
      exwToFobPerUnit: 0, cifFreightInsurancePerUnit: 0, risk: { checks: checks(off) }
    };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    return o;
  }

  var SAMPLE = {
    name: 'Example: 120-unit multifamily renovation',
    contractDate: '2027-01-04',
    kits: [{ id: 'k1', name: 'Standard finish kit', units: 120 }],
    components: [
      { id: 'floor', kitId: 'k1', name: 'LVP/SPC flooring, 5 mm click', uom: 'sq ft', qtyPerUnit: 650, wastePct: 0.1, unitsPerCarton: 23.6, htsCode: '3918.10.10', baseDutyRate: 0.053, metal232Share: 0,
        quotes: [
          q('floor-a', 'Supplier A, Haiphong', 'VN', 1.12, 20000, 40, 0.0132, 22, []),
          q('floor-b', 'Supplier B, Binh Duong', 'VN', 1.06, 30000, 45, 0.0132, 22, ['thirdPartyAudit', 'usExportHistory']),
          q('floor-c', 'Supplier C, Changzhou', 'CN', 0.94, 20000, 35, 0.0132, 22, ['thirdPartyAudit'])
        ] },
      { id: 'kfaucet', kitId: 'k1', name: 'Kitchen faucet, pull-down', uom: 'each', qtyPerUnit: 1, wastePct: 0, unitsPerCarton: 6, htsCode: '8481.80.10', baseDutyRate: 0.04, metal232Share: 0,
        quotes: [
          q('kf-a', 'Supplier D, Kaiping', 'CN', 34.8, 300, 45, 0.09, 17, []),
          q('kf-b', 'Supplier E, Wenzhou', 'CN', 31.9, 500, 40, 0.09, 17, ['factoryVerified', 'sampleApproved', 'thirdPartyAudit']),
          q('kf-c', 'Supplier F, Taizhou', 'CN', 33.2, 200, 50, 0.09, 17, ['thirdPartyAudit', 'usExportHistory'])
        ] },
      { id: 'bfaucet', kitId: 'k1', name: 'Bathroom faucet, single hole', uom: 'each', qtyPerUnit: 1, wastePct: 0, unitsPerCarton: 8, htsCode: '8481.80.10', baseDutyRate: 0.04, metal232Share: 0,
        quotes: [
          q('bf-a', 'Supplier D, Kaiping', 'CN', 18.4, 300, 45, 0.07, 12, []),
          q('bf-b', 'Supplier F, Taizhou', 'CN', 16.9, 500, 50, 0.07, 12, ['thirdPartyAudit'])
        ] },
      { id: 'shower', kitId: 'k1', name: 'Shower valve and trim set', uom: 'set', qtyPerUnit: 1, wastePct: 0, unitsPerCarton: 4, htsCode: '8481.80.10', baseDutyRate: 0.04, metal232Share: 0,
        quotes: [
          q('sh-a', 'Supplier D, Kaiping', 'CN', 42, 200, 45, 0.08, 14, []),
          q('sh-b', 'Supplier G, Xiamen', 'CN', 39.5, 200, 45, 0.08, 14, ['thirdPartyAudit', 'usExportHistory'])
        ] },
      { id: 'light', kitId: 'k1', name: 'LED flush-mount ceiling light', uom: 'each', qtyPerUnit: 4, wastePct: 0, unitsPerCarton: 6, htsCode: '9405.11.60', baseDutyRate: 0.076, metal232Share: 0,
        quotes: [
          q('li-a', 'Supplier H, Zhongshan', 'CN', 13.2, 500, 35, 0.12, 9, []),
          q('li-b', 'Supplier I, Jiangmen', 'CN', 11.8, 1000, 35, 0.12, 9, ['usExportHistory', 'thirdPartyAudit'])
        ] },
      { id: 'pulls', kitId: 'k1', name: 'Cabinet pull, zinc alloy, 5 in', uom: 'each', qtyPerUnit: 14, wastePct: 0.03, unitsPerCarton: 100, htsCode: '8302.42.30', baseDutyRate: 0.039, metal232Share: 0,
        quotes: [
          q('pu-a', 'Supplier J, Jieyang', 'CN', 0.92, 2000, 30, 0.03, 12, []),
          q('pu-b', 'Supplier K, Ningbo', 'CN', 0.78, 5000, 30, 0.03, 12, ['thirdPartyAudit'])
        ] },
      { id: 'bathacc', kitId: 'k1', name: 'Bath accessory set (towel bar, ring, hook, paper holder)', uom: 'set', qtyPerUnit: 1, wastePct: 0, unitsPerCarton: 10, htsCode: '8302.50.00', baseDutyRate: 0, metal232Share: 1, metal232Rate: 0.25,
        quotes: [
          q('ba-a', 'Supplier L, Yuyao', 'CN', 11.5, 300, 35, 0.05, 11, []),
          q('ba-b', 'Supplier M, Jiangmen', 'CN', 10.2, 300, 40, 0.05, 11, ['thirdPartyAudit', 'certifications', 'responsive'])
        ] }
    ],
    waves: [{ id: 'w1', date: '2027-01-11', units: 60 }, { id: 'w2', date: '2027-03-15', units: 60 }],
    pricing: { mode: 'margin', value: 0.22 },
    billing: [{ pct: 0.3, daysAfter: 'contract', days: 0 }, { pct: 0.7, daysAfter: 'delivery', days: 30 }],
    storage: { perPalletMonth: 28, months: 1 },
    moqOverage: 'project'
  };

  if (typeof module === 'object' && module.exports) module.exports = SAMPLE;
  if (root) root.KitSample = SAMPLE;
})(typeof window !== 'undefined' ? window : null);
