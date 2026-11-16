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
