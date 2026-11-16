/*
 * Copyright (c) 2026 Plenor Group LLC. All rights reserved.
 * Not covered by the MIT License in this repository's LICENSE file.
 * See NOTICE.md and https://everpaula.github.io/marketplace-ops-toolkit/terms.html#ownership
 */
// Tests for js/kit-landed-cost-core.js. Every expected number is worked out by hand
// in the comment next to it, using the test settings below (not the researched defaults).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const K = require('../js/kit-landed-cost-core.js');

const close = (actual, expected, eps = 1e-6, msg) =>
  assert.ok(Math.abs(actual - expected) <= eps, `${msg || ''} expected ${expected}, got ${actual}`);

// Small, round settings so the hand math stays readable.
function testSettings(over = {}) {
  const s = {
    containers: { '40HQ': { cbm: 68, kg: 26500 } },
    origins: {
      CN: { freightPerContainer: { '40HQ': 4000 }, lclPerCbm: 90, countryAdders: [{ label: 'S301 list', rate: 0.25 }] },
      VN: { freightPerContainer: { '40HQ': 4400 }, lclPerCbm: 100, countryAdders: [{ label: 'S301 FL', rate: 0.125, exemptIf232: true }] }
    },
    fees: {
      mpfRate: 0.003464, mpfMin: 30, mpfMax: 600, hmfRate: 0.00125,
      brokerPerEntry: 150, isfPerEntry: 35, bondPerEntry: 65,
      insuranceRate: 0.004, drayagePerContainer: 900
    },
    metal232Rate: 0.5,
    transitDays: { CN: { west: 16, east: 33 }, VN: { west: 22, east: 35 } },
    destination: 'west',
    clearanceDays: 7,
    cbmPerPallet: 1.6
  };
  return Object.assign(s, over);
}

// ---------- Task 1: duty layers, incoterms, packing, landed cost ----------

test('dutyRate stacks base HTS rate and country adders', () => {
  const component = { baseDutyRate: 0.035, metal232Share: 0 };
  const origin = { countryAdders: [{ label: 'a', rate: 0.25 }, { label: 'b', rate: 0.075 }] };
  close(K.dutyRate({ origin: 'CN' }, component, origin), 0.36); // 3.5% + 25% + 7.5%
});

test('dutyRate: Section 232 share replaces adders flagged exemptIf232', () => {
  const s = testSettings();
  // VN, base 4%, fully covered by 232 at 50%: forced-labor adder drops out -> 4% + 50% = 54%
  close(K.dutyRate({ origin: 'VN' }, { baseDutyRate: 0.04, metal232Share: 1 }, s.origins.VN, s), 0.54);
  // Component-level 232 rate override (25% derivative tier): 4% + 25% = 29%
  close(K.dutyRate({ origin: 'VN' }, { baseDutyRate: 0.04, metal232Share: 1, metal232Rate: 0.25 }, s.origins.VN, s), 0.29);
  // Not covered: 4% + 12.5% = 16.5%
  close(K.dutyRate({ origin: 'VN' }, { baseDutyRate: 0.04, metal232Share: 0 }, s.origins.VN, s), 0.165);
});

test('customsValue follows the incoterm', () => {
  close(K.customsValue({ incoterm: 'CIF', price: 10, cifFreightInsurancePerUnit: 1.2 }, {}), 8.8);
  close(K.customsValue({ incoterm: 'EXW', price: 9, exwToFobPerUnit: 0.4 }, {}), 9.4);
  close(K.customsValue({ incoterm: 'FOB', price: 7.25 }, {}), 7.25);
});

test('packLines: 50 CBM / 22,000 kg of flooring fits one 40HQ, volume basis', () => {
  const s = testSettings();
  const p = K.packLines([{ componentId: 'f', quoteId: 'q', origin: 'VN', cartons: 1000, cbmPerCarton: 0.05, kgPerCarton: 22 }], s);
  const vn = p.byOrigin.VN;
  assert.equal(vn.containers.length, 1);
  assert.equal(vn.containers[0].limitedBy, 'volume');
  assert.equal(vn.containers[0].full, false);
  close(vn.containers[0].cbmUsed, 50);
  close(vn.containers[0].kgUsed, 22000);
  assert.equal(vn.lclCbm, 0);
});

test('packLines: 65 CBM / 28,600 kg is weight-limited (first box closes on weight)', () => {
  // Density 440 kg/CBM > 26,500/68 = 389.7, so the first 40HQ fills at 26,500 kg = 60.227 CBM.
  // Leftover 4.773 CBM / 2,100 kg.
  const line = { componentId: 'f', quoteId: 'q', origin: 'VN', cartons: 1300, cbmPerCarton: 0.05, kgPerCarton: 22 };
  // LCL priced high (1,000/CBM -> 4,773 > 4,400 box): a second container is cheaper.
  const sHigh = testSettings();
  sHigh.origins.VN.lclPerCbm = 1000;
  const pHigh = K.packLines([line], sHigh).byOrigin.VN;
  assert.equal(pHigh.containers.length, 2);
  assert.equal(pHigh.containers[0].limitedBy, 'weight');
  assert.equal(pHigh.containers[0].full, true);
  close(pHigh.containers[0].kgUsed, 26500, 1e-6);
  close(pHigh.containers[0].cbmUsed, 26500 / 440, 1e-9);
  assert.equal(pHigh.lclCbm, 0);
  // Normal LCL (100/CBM -> 477 < 4,400): one weight-limited box plus LCL for the rest.
  const pLow = K.packLines([line], testSettings()).byOrigin.VN;
  assert.equal(pLow.containers.length, 1);
  assert.equal(pLow.containers[0].limitedBy, 'weight');
  close(pLow.lclCbm, 65 - 26500 / 440, 1e-9);
});

test('packLines: 3 CBM goes LCL, no container', () => {
  const p = K.packLines([{ componentId: 'h', quoteId: 'q', origin: 'CN', cartons: 30, cbmPerCarton: 0.1, kgPerCarton: 5 }], testSettings());
  assert.deepEqual(p.byOrigin.CN.containers, []);
  close(p.byOrigin.CN.lclCbm, 3);
  close(p.byOrigin.CN.freightTotal, 270); // 3 CBM x 90
});

test('packLines: CIF lines are left out of our containers (supplier books the freight)', () => {
  const p = K.packLines([
    { componentId: 'a', quoteId: 'q1', origin: 'CN', cartons: 30, cbmPerCarton: 0.1, kgPerCarton: 5 },
    { componentId: 'b', quoteId: 'q2', origin: 'CN', cartons: 500, cbmPerCarton: 0.1, kgPerCarton: 5, incoterm: 'CIF' }
  ], testSettings());
  close(p.byOrigin.CN.cbm, 3);
  close(p.byOrigin.CN.lclCbm, 3);
});

test('landedCostPerUnit: 40HQ freight split 60/40 by CBM, every bucket by hand', () => {
  const s = testSettings();
  // A: 6,000 units at $2.00, 600 cartons x 0.05 CBM = 30 CBM (60%), base duty 4% -> 29%
  // B: 1,000 units at $15.00, 400 cartons x 0.05 CBM = 20 CBM (40%), base duty 3% -> 28%
  const compA = { id: 'A', unitsPerCarton: 10, baseDutyRate: 0.04, metal232Share: 0 };
  const compB = { id: 'B', unitsPerCarton: 2.5, baseDutyRate: 0.03, metal232Share: 0 };
  const qA = { id: 'qa', origin: 'CN', incoterm: 'FOB', price: 2, cbmPerCarton: 0.05, kgPerCarton: 5 };
  const qB = { id: 'qb', origin: 'CN', incoterm: 'FOB', price: 15, cbmPerCarton: 0.05, kgPerCarton: 4 };
  const lA = K.buildLine(compA, qA, 6000, s);
  const lB = K.buildLine(compB, qB, 1000, s);
  close(lA.cartons, 600);
  close(lB.cartons, 400);
  const packing = K.packLines([lA, lB], s);
  assert.equal(packing.byOrigin.CN.containers.length, 1); // 50 CBM, above the 34 CBM LCL cut-off
  const a = K.landedCostPerUnit(lA, packing, s);
  const b = K.landedCostPerUnit(lB, packing, s);
  close(a.fob, 2);
  close(a.freight, 0.4);          // 4,000 x 60% / 6,000
  close(b.freight, 1.6);          // 4,000 x 40% / 1,000
  close(a.duty, 0.58);            // 29% x 2.00
  close(b.duty, 4.2);             // 28% x 15.00
  close(a.mpf, 0.006928);         // entry 27,000 x 0.3464% = 93.528 (inside 30..600), 12,000/27,000 share / 6,000
  close(b.mpf, 0.05196);
  close(a.hmf, 0.0025);           // 0.125% x 2.00
  close(a.broker, 250 * 12000 / 27000 / 6000); // 150 + 35 + 65 per entry, by value
  close(a.insurance, 0.0096);     // 0.4% x (2.00 + 0.40)
  close(a.drayage, 0.09);         // 900 x 60% / 6,000
  close(b.drayage, 0.36);
  const sumA = a.fob + a.freight + a.duty + a.mpf + a.hmf + a.broker + a.insurance + a.drayage;
  close(a.total, sumA, 1e-9);
  close(a.total, 3.1075465, 1e-6);
});

test('landedCostPerUnit: MPF floor and ceiling apply per entry', () => {
  const s = testSettings();
  const comp = { id: 'A', unitsPerCarton: 1, baseDutyRate: 0, metal232Share: 0 };
  // Tiny entry: 10 x $10 = $100 -> 0.3464% = 0.35, floor 30 -> 3.00 per unit
  const small = K.buildLine(comp, { id: 'q', origin: 'CN', incoterm: 'FOB', price: 10, cbmPerCarton: 0.01, kgPerCarton: 1 }, 10, s);
  close(K.landedCostPerUnit(small, K.packLines([small], s), s).mpf, 3);
  // Large entry: 10,000 x $50 = $500,000 -> 1,732 capped at 600 -> 0.06 per unit
  const big = K.buildLine(comp, { id: 'q', origin: 'CN', incoterm: 'FOB', price: 50, cbmPerCarton: 0.001, kgPerCarton: 0.1 }, 10000, s);
  close(K.landedCostPerUnit(big, K.packLines([big], s), s).mpf, 0.06);
});

test('landedCostPerUnit: CIF never pays our ocean freight twice; EXW adds the origin leg', () => {
  const s = testSettings();
  const comp = { id: 'A', unitsPerCarton: 1, baseDutyRate: 0.1, metal232Share: 0 };
  const cif = K.buildLine(comp, { id: 'c', origin: 'CN', incoterm: 'CIF', price: 10, cifFreightInsurancePerUnit: 1.2, cbmPerCarton: 0.1, kgPerCarton: 2 }, 100, s);
  const r = K.landedCostPerUnit(cif, K.packLines([cif], s), s);
  close(r.fob, 8.8);
  close(r.freight, 1.2);      // the freight already inside the CIF price, shown once
  close(r.insurance, 0);      // insurance is inside CIF too
  close(r.duty, 3.08);        // (10% base + 25% CN adder) x 8.80
  const exw = K.buildLine(comp, { id: 'e', origin: 'CN', incoterm: 'EXW', price: 9, exwToFobPerUnit: 0.4, cbmPerCarton: 0.1, kgPerCarton: 2 }, 100, s);
  const e = K.landedCostPerUnit(exw, K.packLines([exw], s), s);
  close(e.fob, 9.4);
  close(e.duty, 3.29);        // 35% x 9.40
});

test('5,000-unit project with researched defaults: every bucket finite and positive', () => {
  const s = K.DEFAULTS;
  assert.match(s.asOf, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(Array.isArray(s.sources) && s.sources.length >= 5);
  const floor = { id: 'floor', unitsPerCarton: 23.6, baseDutyRate: 0.053, metal232Share: 0 };
  const faucet = { id: 'faucet', unitsPerCarton: 6, baseDutyRate: 0.04, metal232Share: 0 };
  const lines = [
    K.buildLine(floor, { id: 'qf', origin: 'VN', incoterm: 'FOB', price: 1.1, cbmPerCarton: 0.0132, kgPerCarton: 22 }, 5000 * 700 * 1.1, s),
    K.buildLine(faucet, { id: 'qk', origin: 'CN', incoterm: 'FOB', price: 35, cbmPerCarton: 0.09, kgPerCarton: 17 }, 5000, s)
  ];
  const packing = K.packLines(lines, s);
  for (const o of ['VN', 'CN']) {
    const g = packing.byOrigin[o];
    assert.ok(g.containers.length >= 1, o + ' needs containers');
    for (const c of g.containers) {
      assert.ok(Number.isFinite(c.cbmUsed) && c.cbmUsed > 0);
      assert.ok(Number.isFinite(c.kgUsed) && c.kgUsed > 0);
    }
    assert.ok(Number.isFinite(g.lclCbm) && g.lclCbm >= 0);
  }
  assert.ok(packing.byOrigin.VN.containers.some(c => c.limitedBy === 'weight'), 'SPC flooring should be weight-limited');
  for (const line of lines) {
    const r = K.landedCostPerUnit(line, packing, s);
    for (const k of ['fob', 'freight', 'duty', 'mpf', 'hmf', 'broker', 'insurance', 'drayage', 'total']) {
      assert.ok(Number.isFinite(r[k]) && r[k] > 0, `${line.componentId}.${k} = ${r[k]}`);
    }
  }
});

// ---------- Task 2: quote comparison, supplier risk, recommended mix ----------

const ALL_CHECKS = { factoryVerified: true, businessLicense: true, usExportHistory: true, thirdPartyAudit: true, sampleApproved: true, certifications: true, responsive: true };
const TIER_C_CHECKS = Object.assign({}, ALL_CHECKS, { factoryVerified: false, sampleApproved: false });

function quote(over) {
  return Object.assign({
    id: 'q', supplier: 'S', origin: 'CN', incoterm: 'FOB', price: 10, moq: 0, productionDays: 45,
    paymentTerms: { depositPct: 0.3, balance: 'beforeShipment' },
    cbmPerCarton: 0.09, kgPerCarton: 17, exwToFobPerUnit: 0, cifFreightInsurancePerUnit: 0,
    risk: { checks: Object.assign({}, ALL_CHECKS) }
  }, over);
}
function component(over) {
  return Object.assign({
    id: 'c1', kitId: 'k1', name: 'Kitchen faucet', uom: 'each', qtyPerUnit: 1, wastePct: 0, unitsPerCarton: 6,
    htsCode: '8481.80.10', baseDutyRate: 0.04, metal232Share: 0, quotes: []
  }, over);
}
function project(over) {
  return Object.assign({
    name: 'Test', kits: [{ id: 'k1', name: 'Standard', units: 120 }], components: [],
    waves: [{ id: 'w1', date: '2027-01-04', units: 120 }],
    pricing: { mode: 'margin', value: 0.25 },
    billing: [{ pct: 0.3, daysAfter: 'contract', days: 0 }, { pct: 0.7, daysAfter: 'delivery', days: 30 }],
    storage: { perPalletMonth: 0, months: 0 }, moqOverage: 'project'
  }, over);
}

test('needQty: 120 units x 700 sq ft x 1.10 waste = 92,400 sq ft', () => {
  const c = component({ qtyPerUnit: 700, wastePct: 0.1, uom: 'sq ft' });
  const n = K.needQty(c, project());
  close(n.perKit, 770);
  close(n.total, 92400);
});

test('riskScore: all checks = 100/A; no factory check and no sample = tier C', () => {
  assert.deepEqual(K.riskScore(ALL_CHECKS), { score: 100, tier: 'A' });
  const r = K.riskScore(TIER_C_CHECKS);
  assert.equal(r.tier, 'C');
  assert.equal(r.score, 50); // factory 25 + sample 25 removed
});

test('compareQuotes: cheaper FOB from China loses to Vietnam on landed cost', () => {
  const s = testSettings();
  const c = component({ quotes: [quote({ id: 'cn', origin: 'CN', price: 30 }), quote({ id: 'vn', origin: 'VN', price: 32 })] });
  const p = project({ components: [c] });
  const rows = K.compareQuotes(c, p, s);
  const cn = rows.find(r => r.quoteId === 'cn');
  const vn = rows.find(r => r.quoteId === 'vn');
  assert.equal(cn.cheapestFob, true);
  assert.equal(vn.cheapestFob, false);
  assert.equal(vn.rank, 1);
  assert.equal(cn.rank, 2);
  assert.equal(rows[0].quoteId, 'vn');
  // CN: 30 x 29% duty = 8.70. VN: 32 x 16.5% = 5.28. Freight per carton at full-box rate:
  // max(0.09/68, 17/26,500) = 0.0013235 of a box -> CN 5.294/6 = 0.882, VN 5.824/6 = 0.971 per unit.
  close(cn.breakdown.duty, 8.7);
  close(vn.breakdown.duty, 5.28);
  close(cn.breakdown.freight, 4000 * 0.09 / 68 / 6, 1e-9);
  assert.ok(vn.landedPerUnit < cn.landedPerUnit);
});

test('compareQuotes: MOQ overage counts in the project only when moqOverage = project', () => {
  const s = testSettings();
  const c = component({ unitsPerCarton: 1, quotes: [quote({ id: 'm', moq: 500 })] });
  const p = project({ kits: [{ id: 'k1', name: 'Standard', units: 240 }], components: [c] });
  const inProject = K.compareQuotes(c, p, s)[0];
  close(inProject.needQty, 240);
  close(inProject.orderQty, 500);
  close(inProject.overageQty, 260);
  close(inProject.componentTotal, inProject.landedPerUnit * 500, 1e-6);
  const carried = K.compareQuotes(c, Object.assign({}, p, { moqOverage: 'carry' }), s)[0];
  close(carried.componentTotal, carried.landedPerUnit * 240, 1e-6);
});

test('compareQuotes: missing price or carton data is not eligible and never ranked first', () => {
  const s = testSettings();
  const c = component({ quotes: [
    quote({ id: 'zero', price: 0 }),
    quote({ id: 'nocbm', price: 5, cbmPerCarton: 0 }),
    quote({ id: 'ok', price: 20 })
  ] });
  const rows = K.compareQuotes(c, project({ components: [c] }), s);
  const zero = rows.find(r => r.quoteId === 'zero');
  assert.equal(zero.eligible, false);
  assert.match(zero.reason, /price/i);
  assert.equal(zero.rank, null);
  const nocbm = rows.find(r => r.quoteId === 'nocbm');
  assert.equal(nocbm.eligible, false);
  assert.match(nocbm.reason, /volume/i);
  assert.equal(rows[0].quoteId, 'ok');
  assert.equal(rows[0].rank, 1);
  assert.equal(rows.find(r => r.quoteId === 'ok').cheapestFob, true);
});

test('recommendMix skips a tier C supplier when minTier is B and returns the next one', () => {
  const s = testSettings();
  const c = component({ quotes: [
    quote({ id: 'cheapC', price: 20, risk: { checks: TIER_C_CHECKS } }),
    quote({ id: 'midB', price: 22, risk: { checks: Object.assign({}, ALL_CHECKS, { thirdPartyAudit: false, certifications: false }) } }),
    quote({ id: 'topA', price: 24 })
  ] });
  const p = project({ components: [c] });
  const mix = K.recommendMix(p, s, { minTier: 'B' });
  assert.equal(mix.picks.c1, 'midB');
  assert.equal(mix.alternates.c1, 'topA');
  const loose = K.recommendMix(p, s, { minTier: 'C' });
  assert.equal(loose.picks.c1, 'cheapC');
});

// ---------- Task 3: totals, margin, scenarios, cash timeline ----------

// Settings with no duty, no fees and LCL at a flat rate, so cost = goods + LCL freight.
function zeroSettings() {
  const s = testSettings();
  s.origins.CN = { freightPerContainer: {}, lclPerCbm: 0, countryAdders: [] };
  s.origins.VN = { freightPerContainer: {}, lclPerCbm: 100, countryAdders: [] };
  s.fees = { mpfRate: 0, mpfMin: 0, mpfMax: 0, hmfRate: 0, brokerPerEntry: 0, isfPerEntry: 0, bondPerEntry: 0, insuranceRate: 0, drayagePerContainer: 0, lclDelivery: 0 };
  return s;
}
function oneItemProject(over, quoteOver) {
  const c = component({ unitsPerCarton: 1, baseDutyRate: 0, quotes: [quote(Object.assign({ id: 'q1', origin: 'VN', price: 100, cbmPerCarton: 0.1, kgPerCarton: 5 }, quoteOver))] });
  return project(Object.assign({ kits: [{ id: 'k1', name: 'Standard', units: 10 }], components: [c], waves: [{ id: 'w1', date: '2027-01-04', units: 10 }] }, over));
}

test('projectTotals: 25% margin on a $1,000 kit = $1,250 price, $250 margin', () => {
  const s = zeroSettings();
  const p = oneItemProject({}, { origin: 'CN', price: 1000 });
  const t = K.projectTotals(p, { c1: 'q1' }, s);
  close(t.perKit.k1.cost, 1000);
  close(t.perKit.k1.price, 1250);
  close(t.perKit.k1.margin, 250);
  close(t.project.cost, 10000);
  close(t.project.margin, 2500);
  const b = t.breakdown;
  close(b.fob + b.freight + b.duty + b.fees + b.broker + b.insurance + b.drayage + b.storage + b.moqOverage, t.project.cost, 1e-6);
});

test('applyScenario: CN 40HQ from $3,000 to $25,000 scales freight per unit, FOB unchanged', () => {
  const s = testSettings();
  s.origins.CN.freightPerContainer = { '40HQ': 3000 };
  // 1,360 cartons x 0.1 CBM = 136 CBM, light: exactly two 40HQ.
  const c = component({ unitsPerCarton: 1, quotes: [quote({ id: 'q1', origin: 'CN', price: 20, cbmPerCarton: 0.1, kgPerCarton: 1 })] });
  const p = project({ kits: [{ id: 'k1', name: 'Standard', units: 1360 }], components: [c], waves: [{ id: 'w1', date: '2027-01-04', units: 1360 }] });
  const base = K.projectTotals(p, { c1: 'q1' }, s);
  const s2 = K.applyScenario(s, { freightPerContainer: { CN: 25000 } });
  assert.equal(s.origins.CN.freightPerContainer['40HQ'], 3000, 'input settings not mutated');
  // The contract price is set on the base case; a freight shock after signing eats margin.
  const hit = K.projectTotals(p, { c1: 'q1' }, s2, { fixedPrices: K.fixedPricesFrom(base) });
  close(hit.perKit.k1.price, base.perKit.k1.price, 1e-9);
  close(base.breakdown.freight, 6000, 1e-6);
  close(hit.breakdown.freight / base.breakdown.freight, 25000 / 3000, 1e-9);
  close(hit.breakdown.fob, base.breakdown.fob, 1e-9);
  close(hit.breakdown.duty, base.breakdown.duty, 1e-9);
  assert.ok(hit.project.margin < base.project.margin);
});

test('cashTimeline: one wave, every date and the peak checked by hand', () => {
  const s = zeroSettings();
  const p = oneItemProject();
  // Cost 1,000 goods + 100 LCL (1 CBM x 100) = 1,100. Price = 1,375.
  // 01-04 deposit -300, contract receipt +412.50 (outs first: -300, +112.50)
  // 02-18 (PO + 45) balance -700 -> -587.50, freight -100 -> -687.50 (peak)
  // arrival 03-12 (+22 VN west), on site 03-19 (+7), receipt 70% on 04-18 (+30): +962.50 -> 275
  const t = K.cashTimeline(p, { c1: 'q1' }, s);
  const ev = t.events.map(e => [e.date, e.kind, Math.round(e.amount * 100) / 100]);
  assert.deepEqual(ev, [
    ['2027-01-04', 'out', 300], ['2027-01-04', 'in', 412.5],
    ['2027-02-18', 'out', 700], ['2027-02-18', 'out', 100],
    ['2027-04-18', 'in', 962.5]
  ]);
  close(t.events[t.events.length - 1].cumulative, 275);
  close(t.peakCapital, 687.5);
  assert.equal(t.peakDate, '2027-02-18');
  assert.equal(t.workingCapitalDays, 59); // negative from 02-18 to 04-18
});

test('cashTimeline: two waves pay suppliers twice and end at price minus cost', () => {
  const s = zeroSettings();
  const p = oneItemProject({ waves: [{ id: 'w1', date: '2027-01-04', units: 5 }, { id: 'w2', date: '2027-03-01', units: 5 }] });
  const totals = K.projectTotals(p, { c1: 'q1' }, s);
  close(totals.project.cost, 1200); // goods 1,000 + two LCL minimums of 100
  const t = K.cashTimeline(p, { c1: 'q1' }, s);
  assert.equal(t.events.filter(e => /deposit/i.test(e.label)).length, 2);
  assert.equal(t.events.filter(e => /balance/i.test(e.label)).length, 2);
  close(t.events[t.events.length - 1].cumulative, totals.project.price - totals.project.cost, 1e-6);
  close(t.events[t.events.length - 1].cumulative, 300, 1e-6);
});

test('costRange: low <= mid <= high, and mid is the base cost per unit', () => {
  const s = testSettings();
  const c = component({ unitsPerCarton: 6, quotes: [quote({ id: 'q1', origin: 'CN', price: 30 })] });
  const p = project({ components: [c] });
  const r = K.costRange(p, { c1: 'q1' }, s);
  assert.ok(r.low <= r.mid && r.mid <= r.high, JSON.stringify(r));
  assert.ok(r.low < r.high);
  close(r.mid, K.projectTotals(p, { c1: 'q1' }, s).perUnit.cost, 1e-9);
});

test('packLines: heavy LCL is charged weight-or-measure (1 CBM = 1,000 kg)', () => {
  // 1.2 CBM of flooring at 2,000 kg -> 2 revenue tons x 100 = 200 (not 1.2 x 100)
  const p = K.packLines([{ componentId: 'f', quoteId: 'q', origin: 'VN', cartons: 100, cbmPerCarton: 0.012, kgPerCarton: 20 }], testSettings());
  close(p.byOrigin.VN.lclCbm, 1.2);
  close(p.byOrigin.VN.lclCost, 200);
});
