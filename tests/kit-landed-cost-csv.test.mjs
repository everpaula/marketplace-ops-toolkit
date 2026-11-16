// Tests for js/kit-landed-cost-csv.js: paste from a spreadsheet, export and re-import a project.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const C = require('../js/kit-landed-cost-csv.js');

test('parseNumber reads currency, thousands separators and decimal commas', () => {
  assert.equal(C.parseNumber('$1,234.50').value, 1234.5);
  assert.equal(C.parseNumber('1.234,50', 'pt').value, 1234.5);
  assert.equal(C.parseNumber('US$ 12').value, 12);
  assert.equal(C.parseNumber('0,95', 'pt').value, 0.95);
  assert.equal(C.parseNumber('1,05').value, 1.05);          // no locale: a lone comma with 2 decimals is a decimal comma
  assert.equal(C.parseNumber('12,500').value, 12500);       // three digits after the comma: thousands
  assert.equal(C.parseNumber('abc').ok, false);
  assert.equal(C.parseNumber('').ok, false);
});

test('parseQuotesTable: TSV pasted from Excel with a header, currency and an empty line', () => {
  const text = [
    'Component\tSupplier\tOrigin\tIncoterm\tPrice USD\tMOQ\tProduction days\tDeposit %\tCBM per carton\tKg per carton',
    'Kitchen faucet\tAcme Sanitary\tChina\tFOB\t$1,234.50\t500\t45\t30%\t0.09\t17',
    '',
    'Kitchen faucet\tRiver Bath\tVN\tEXW\t36.00\t1,000\t50\t30\t0.09\t17.5'
  ].join('\n');
  const r = C.parseQuotesTable(text);
  assert.deepEqual(r.errors, []);
  assert.equal(r.rows.length, 2);
  assert.equal(r.rows[0].price, 1234.5);
  assert.equal(r.rows[0].origin, 'CN');
  assert.equal(r.rows[0].depositPct, 0.3);
  assert.equal(r.rows[1].origin, 'VN');
  assert.equal(r.rows[1].incoterm, 'EXW');
  assert.equal(r.rows[1].moq, 1000);
  assert.equal(r.rows[1].kgPerCarton, 17.5);
});

test('parseQuotesTable: Brazilian-format CSV with semicolons and decimal commas', () => {
  const text = 'Piso SPC;Hai Phong Floor;VN;FOB;1.234,50;20.000;40;30%;0,0132;22';
  const r = C.parseQuotesTable(text, { locale: 'pt' });
  assert.deepEqual(r.errors, []);
  assert.equal(r.rows[0].price, 1234.5);
  assert.equal(r.rows[0].moq, 20000);
  assert.equal(r.rows[0].cbmPerCarton, 0.0132);
});

test('parseQuotesTable: text in a numeric column reports the right line, never NaN', () => {
  const text = [
    'Kitchen faucet,Acme,CN,FOB,34.80,500,45,30,0.09,17',
    '',
    'Kitchen faucet,Beta,CN,FOB,call us,500,45,30,0.09,17'
  ].join('\n');
  const r = C.parseQuotesTable(text);
  assert.equal(r.rows.length, 1);
  assert.equal(r.errors.length, 1);
  assert.equal(r.errors[0].line, 3);
  assert.match(r.errors[0].message, /price/i);
  for (const row of r.rows) for (const v of Object.values(row)) if (typeof v === 'number') assert.ok(Number.isFinite(v));
});

const CHECKS = { factoryVerified: true, businessLicense: true, usExportHistory: false, thirdPartyAudit: false, sampleApproved: true, certifications: true, responsive: true };
function q(id, over) {
  return Object.assign({
    id, supplier: 'Supplier ' + id, origin: 'CN', incoterm: 'FOB', price: 10.5, moq: 500, productionDays: 45,
    paymentTerms: { depositPct: 0.3, balance: 'beforeShipment' }, cbmPerCarton: 0.09, kgPerCarton: 17,
    exwToFobPerUnit: 0, cifFreightInsurancePerUnit: 0, risk: { checks: Object.assign({}, CHECKS) }
  }, over);
}
function sampleProject() {
  return {
    name: 'Round trip, "quoted", with commas',
    kits: [{ id: 'k1', name: 'Standard', units: 80 }, { id: 'k2', name: 'Premium', units: 40, price: 4100 }],
    components: [
      { id: 'c1', kitId: 'k1', name: 'SPC flooring', uom: 'sq ft', qtyPerUnit: 650, wastePct: 0.1, unitsPerCarton: 23.6, htsCode: '3918.10.10', baseDutyRate: 0.053, metal232Share: 0,
        quotes: [q('q1', { origin: 'VN', price: 1.12, cbmPerCarton: 0.0132, kgPerCarton: 22 }), q('q2', { origin: 'CN', price: 0.94, incoterm: 'CIF', cifFreightInsurancePerUnit: 0.21, cbmPerCarton: 0.0132, kgPerCarton: 22 })] },
      { id: 'c2', kitId: 'k1', name: 'Kitchen faucet', uom: 'each', qtyPerUnit: 1, wastePct: 0, unitsPerCarton: 6, htsCode: '8481.80.10', baseDutyRate: 0.04, metal232Share: 0,
        quotes: [q('q3', { price: 34.8 }), q('q4', { origin: 'VN', incoterm: 'EXW', price: 36, exwToFobPerUnit: 0.45, paymentTerms: { depositPct: 0.5, balance: 'onArrival' } })] },
      { id: 'c3', kitId: 'k2', name: 'Bath accessories set', uom: 'set', qtyPerUnit: 1, wastePct: 0.02, unitsPerCarton: 10, htsCode: '8302.50.00', baseDutyRate: 0, metal232Share: 1, metal232Rate: 0.25,
        quotes: [q('q5', { price: 11.5 }), q('q6', { price: 10.2, risk: { checks: Object.assign({}, CHECKS, { factoryVerified: false, sampleApproved: false }) } })] }
    ],
    waves: [{ id: 'w1', date: '2027-01-11', units: 60 }, { id: 'w2', date: '2027-03-15', units: 60 }],
    pricing: { mode: 'margin', value: 0.22 },
    billing: [{ pct: 0.3, daysAfter: 'contract', days: 0 }, { pct: 0.7, daysAfter: 'delivery', days: 30 }],
    storage: { perPalletMonth: 28, months: 1 },
    moqOverage: 'project'
  };
}

test('exportProjectCsv starts with the version line and documents every column', () => {
  const csv = C.exportProjectCsv(sampleProject());
  const lines = csv.split(/\r?\n/);
  assert.equal(lines[0], '# kit-landed-cost-csv v1');
  assert.equal(lines[1], C.CSV_COLUMNS.map(c => c.key).join(','));
  for (const c of C.CSV_COLUMNS) assert.ok(c.note && c.note.length > 3, 'note for ' + c.key);
});

test('parseProjectCsv(exportProjectCsv(p)) gives back p', () => {
  const p = sampleProject();
  const back = C.parseProjectCsv(C.exportProjectCsv(p));
  assert.deepEqual(back, p);
});

test('export with results adds landed cost and rank, import ignores them', () => {
  const p = sampleProject();
  const results = { picks: { c2: 'q3' }, alternates: { c2: 'q4' }, rows: { c2: [{ quoteId: 'q3', landedPerUnit: 49.2345, componentTotal: 5908.14, rank: 1 }] } };
  const csv = C.exportProjectCsv(p, results);
  const header = csv.split(/\r?\n/)[1].split(',');
  const q3 = csv.split(/\r?\n/).find(l => l.startsWith('quote,q3,')).split(',');
  assert.equal(q3[header.indexOf('landed_per_unit_usd')], '49.23');
  assert.equal(q3[header.indexOf('rank')], '1');
  assert.equal(q3[header.indexOf('pick')], 'recommended');
  assert.deepEqual(C.parseProjectCsv(csv), p);
});

test('parseProjectCsv rejects a file without the version line', () => {
  assert.throws(() => C.parseProjectCsv('record,id\nkit,k1'), /kit-landed-cost-csv v1/);
});
