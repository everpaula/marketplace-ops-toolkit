/*
 * Kit Landed Cost Calculator: paste from a spreadsheet, export and re-import a project as CSV.
 * Loaded by the page as window.KitCsv and by the Node tests as a CommonJS module. No DOM.
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.KitCsv = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  var VERSION_LINE = '# kit-landed-cost-csv v1';
  var CHECK_KEYS = ['factoryVerified', 'businessLicense', 'usExportHistory', 'thirdPartyAudit', 'sampleApproved', 'certifications', 'responsive'];

  // Columns for pasting quotes, in order. A header row is optional; when present it can reorder them.
  var QUOTE_PASTE_COLUMNS = [
    { key: 'component', field: 'component', label: 'Component', required: true },
    { key: 'supplier', field: 'supplier', label: 'Supplier' },
    { key: 'origin', field: 'origin', label: 'Origin (CN or VN)' },
    { key: 'incoterm', field: 'incoterm', label: 'Incoterm (FOB, EXW, CIF)' },
    { key: 'price_usd', field: 'price', label: 'Price USD per unit', numeric: true, required: true },
    { key: 'moq', field: 'moq', label: 'MOQ', numeric: true },
    { key: 'production_days', field: 'productionDays', label: 'Production days', numeric: true },
    { key: 'deposit_pct', field: 'depositPct', label: 'Deposit %', numeric: true, pct: true },
    { key: 'cbm_per_carton', field: 'cbmPerCarton', label: 'CBM per carton', numeric: true },
    { key: 'kg_per_carton', field: 'kgPerCarton', label: 'Kg per carton', numeric: true }
  ];

  // Project file columns. Every row has a record type; each type fills the columns it needs.
  var CSV_COLUMNS = [
    { key: 'record', note: 'Row type: project, kit, component, quote, wave or billing' },
    { key: 'id', note: 'Your id for the kit, component, quote or wave' },
    { key: 'parent_id', note: 'Component row: its kit id. Quote row: its component id' },
    { key: 'name', note: 'Project, kit or component name' },
    { key: 'pricing_mode', note: 'Project row: margin (percent on landed cost) or pricePerKit' },
    { key: 'margin_pct', note: 'Project row: margin on landed cost, percent' },
    { key: 'price_per_kit_usd', note: 'Project row: default price per kit. Kit row: price for that kit' },
    { key: 'moq_overage', note: 'Project row: project (MOQ leftover costed to this job) or carry (held as stock)' },
    { key: 'storage_per_pallet_month_usd', note: 'Project row: US storage, USD per pallet per month' },
    { key: 'storage_months', note: 'Project row: months in storage before delivery to site' },
    { key: 'contract_date', note: 'Project row: contract signing date, YYYY-MM-DD (blank = first PO date)' },
    { key: 'units', note: 'Kit row: apartment units on this kit. Wave row: units in this lot' },
    { key: 'uom', note: 'Component row: unit of measure (sq ft, each, set)' },
    { key: 'qty_per_unit', note: 'Component row: quantity per apartment unit' },
    { key: 'waste_pct', note: 'Component row: waste and overage, percent' },
    { key: 'units_per_carton', note: 'Component row: units of measure per carton' },
    { key: 'hts_code', note: 'Component row: HTS code you or your broker chose' },
    { key: 'base_duty_pct', note: 'Component row: column 1 general duty rate, percent' },
    { key: 'metal232_share_pct', note: 'Component row: share of value under Section 232, percent (100 or 0 since Apr 6, 2026)' },
    { key: 'metal232_rate_pct', note: 'Component row: Section 232 rate if not the default, percent' },
    { key: 'supplier', note: 'Quote row: supplier name' },
    { key: 'origin', note: 'Quote row: CN or VN' },
    { key: 'incoterm', note: 'Quote row: FOB, EXW or CIF' },
    { key: 'price_usd', note: 'Quote row: price per unit of measure, USD' },
    { key: 'moq', note: 'Quote row: minimum order quantity, units of measure' },
    { key: 'production_days', note: 'Quote row: days from PO to goods ready' },
    { key: 'deposit_pct', note: 'Quote row: deposit at PO, percent' },
    { key: 'balance_terms', note: 'Quote row: beforeShipment or onArrival' },
    { key: 'cbm_per_carton', note: 'Quote row: carton volume, CBM' },
    { key: 'kg_per_carton', note: 'Quote row: carton gross weight, kg' },
    { key: 'exw_to_fob_usd', note: 'Quote row, EXW only: origin trucking and export per unit, USD' },
    { key: 'cif_freight_ins_usd', note: 'Quote row, CIF only: ocean freight and insurance inside the price, per unit, USD' },
    { key: 'risk_checks', note: 'Quote row: passed checks separated by |' },
    { key: 'date', note: 'Wave row: PO date, YYYY-MM-DD' },
    { key: 'pct', note: 'Billing row: percent of the contract price' },
    { key: 'days_after', note: 'Billing row: contract or delivery' },
    { key: 'days', note: 'Billing row: days after that event' },
    { key: 'landed_per_unit_usd', note: 'Export only: landed cost per unit at full-container rates' },
    { key: 'component_total_usd', note: 'Export only: cost of this quote for the whole project' },
    { key: 'rank', note: 'Export only: rank among eligible quotes, 1 = lowest landed cost' },
    { key: 'pick', note: 'Export only: recommended or alternate' }
  ];

  function digitsOnly(s) { return /^[+-]?\d+$/.test(s); }

  // Reads "$1,234.50", "1.234,50" (locale pt), "30%", "US$ 12". Returns {ok, value}.
  function parseNumber(raw, locale) {
    var s = String(raw === null || raw === undefined ? '' : raw).trim();
    if (!s) return { ok: false, value: null };
    var neg = /^\(.*\)$/.test(s);
    s = s.replace(/^\((.*)\)$/, '$1').replace(/US\$|USD|R\$|\$|%|\s| /gi, '');
    if (!s) return { ok: false, value: null };
    var dot = s.lastIndexOf('.'), comma = s.lastIndexOf(',');
    if (dot >= 0 && comma >= 0) {
      if (comma > dot) s = s.replace(/\./g, '').replace(',', '.');
      else s = s.replace(/,/g, '');
    } else if (comma >= 0) {
      var parts = s.split(',');
      var thousands = locale !== 'pt' && parts.length > 1 && parts.slice(1).every(function (p) { return p.length === 3; }) && digitsOnly(parts[0].replace('-', '') || '0');
      s = thousands ? parts.join('') : (parts.length === 2 ? parts[0] + '.' + parts[1] : s);
    } else if (dot >= 0 && locale === 'pt') {
      var ps = s.split('.');
      if (ps.length > 1 && ps.slice(1).every(function (p) { return p.length === 3; })) s = ps.join('');
    }
    if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return { ok: false, value: null };
    var v = Number(s);
    if (!Number.isFinite(v)) return { ok: false, value: null };
    return { ok: true, value: neg ? -v : v };
  }

  // Split one delimited line, honoring double quotes.
  function splitLine(line, delim) {
    var out = [], cur = '', inQ = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (inQ) {
        if (ch === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false;
        } else cur += ch;
      } else if (ch === '"' && cur === '') inQ = true;
      else if (ch === delim) { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out;
  }

  function detectDelimiter(line, locale) {
    if (line.indexOf('\t') >= 0) return '\t';
    var semis = (line.match(/;/g) || []).length, commas = (line.match(/,/g) || []).length;
    if (semis > 0 && (semis >= commas || locale === 'pt')) return ';';
    return ',';
  }

  function normKey(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  var HEADER_ALIASES = {
    component: ['component', 'item', 'componente'],
    supplier: ['supplier', 'vendor', 'factory', 'fornecedor'],
    origin: ['origin', 'country', 'origem', 'pais'],
    incoterm: ['incoterm', 'incoterms', 'terms'],
    price_usd: ['priceusd', 'price', 'fob', 'unitprice', 'priceusdperunit', 'preco'],
    moq: ['moq', 'minimumorder'],
    production_days: ['productiondays', 'leadtime', 'leadtimedays', 'prazo'],
    deposit_pct: ['depositpct', 'deposit', 'sinal'],
    cbm_per_carton: ['cbmpercarton', 'cbm', 'cartoncbm', 'volume'],
    kg_per_carton: ['kgpercarton', 'kg', 'cartonkg', 'weight', 'peso']
  };
  function headerMap(cells) {
    var idx = {}, hits = 0;
    cells.forEach(function (c, i) {
      var k = normKey(c);
      Object.keys(HEADER_ALIASES).forEach(function (col) {
        if (idx[col] === undefined && HEADER_ALIASES[col].indexOf(k) >= 0) { idx[col] = i; hits++; }
      });
    });
    return hits >= 2 ? idx : null;
  }

  function normOrigin(s) {
    var k = normKey(s);
    if (!k) return 'CN';
    if (k === 'cn' || k === 'china' || k === 'prc') return 'CN';
    if (k === 'vn' || k === 'vietnam' || k === 'vietna') return 'VN';
    return null;
  }

  // Paste block of quotes (TSV from Excel/Sheets, or CSV). Returns {rows, errors}; a bad row is
  // reported with its line number and left out, never turned into NaN.
  function parseQuotesTable(text, opts) {
    var locale = opts && opts.locale;
    var lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    var rows = [], errors = [], delim = null, map = null, first = true;
    lines.forEach(function (line, i) {
      var lineNo = i + 1;
      if (!line.trim()) return;
      if (delim === null) delim = detectDelimiter(line, locale);
      var cells = splitLine(line, delim).map(function (c) { return c.trim(); });
      if (first) {
        first = false;
        var hm = headerMap(cells);
        if (hm) { map = hm; return; }
      }
      var get = function (col, pos) { var j = map ? map[col] : pos; return j === undefined ? '' : (cells[j] || ''); };
      var row = {}, bad = null;
      QUOTE_PASTE_COLUMNS.forEach(function (col, pos) {
        if (bad) return;
        var raw = get(col.key, pos);
        if (col.numeric) {
          if (raw === '') {
            if (col.required) bad = col.label + ' is empty';
            return;
          }
          var n = parseNumber(raw, locale);
          if (!n.ok) { bad = '"' + raw + '" in ' + col.label + ' is not a number'; return; }
          var v = n.value;
          if (col.pct) v = v > 1 ? v / 100 : v;
          row[col.field] = v;
        } else if (col.key === 'origin') {
          var o = normOrigin(raw);
          if (!o) bad = 'Origin "' + raw + '" must be CN or VN';
          else row.origin = o;
        } else if (col.key === 'incoterm') {
          var t = (raw || 'FOB').toUpperCase();
          if (['FOB', 'EXW', 'CIF'].indexOf(t) < 0) bad = 'Incoterm "' + raw + '" must be FOB, EXW or CIF';
          else row.incoterm = t;
        } else {
          if (col.required && !raw) bad = col.label + ' is empty';
          else row[col.field] = raw;
        }
      });
      if (bad) errors.push({ line: lineNo, message: 'Line ' + lineNo + ': ' + bad });
      else rows.push(row);
    });
    return { rows: rows, errors: errors };
  }

  // ---------- Project file ----------

  function pctOut(x) { return String(+(Number(x) * 100).toPrecision(12)); }
  function numOut(x) { return x === null || x === undefined || x === '' ? '' : String(x); }
  function esc(v) {
    var s = v === null || v === undefined ? '' : String(v);
    if (/^[=+@]/.test(s)) s = "'" + s; // keep spreadsheets from running it as a formula
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function exportProjectCsv(project, results) {
    var keys = CSV_COLUMNS.map(function (c) { return c.key; });
    var out = [VERSION_LINE, keys.join(',')];
    var row = function (o) { out.push(keys.map(function (k) { return esc(o[k]); }).join(',')); };
    var p = project || {};
    var pricing = p.pricing || { mode: 'margin', value: 0 };
    var proj = {
      record: 'project', name: p.name, pricing_mode: pricing.mode,
      moq_overage: p.moqOverage || 'project',
      storage_per_pallet_month_usd: numOut(p.storage && p.storage.perPalletMonth),
      storage_months: numOut(p.storage && p.storage.months),
      contract_date: p.contractDate || ''
    };
    if (pricing.mode === 'pricePerKit') proj.price_per_kit_usd = numOut(pricing.value);
    else proj.margin_pct = pctOut(pricing.value);
    row(proj);
    (p.kits || []).forEach(function (k) {
      row({ record: 'kit', id: k.id, name: k.name, units: numOut(k.units), price_per_kit_usd: k.price !== undefined ? numOut(k.price) : '' });
    });
    var picks = (results && results.picks) || {}, alts = (results && results.alternates) || {};
    var resRows = (results && results.rows) || {};
    (p.components || []).forEach(function (c) {
      row({
        record: 'component', id: c.id, parent_id: c.kitId, name: c.name, uom: c.uom,
        qty_per_unit: numOut(c.qtyPerUnit), waste_pct: pctOut(c.wastePct || 0), units_per_carton: numOut(c.unitsPerCarton),
        hts_code: c.htsCode || '', base_duty_pct: pctOut(c.baseDutyRate || 0), metal232_share_pct: pctOut(c.metal232Share || 0),
        metal232_rate_pct: c.metal232Rate !== undefined ? pctOut(c.metal232Rate) : ''
      });
      (c.quotes || []).forEach(function (q) {
        var r = (resRows[c.id] || []).filter(function (x) { return x.quoteId === q.id; })[0];
        var pt = q.paymentTerms || {};
        var checks = (q.risk && q.risk.checks) || {};
        row({
          record: 'quote', id: q.id, parent_id: c.id, supplier: q.supplier, origin: q.origin, incoterm: q.incoterm,
          price_usd: numOut(q.price), moq: numOut(q.moq), production_days: numOut(q.productionDays),
          deposit_pct: pctOut(pt.depositPct || 0), balance_terms: pt.balance || 'beforeShipment',
          cbm_per_carton: numOut(q.cbmPerCarton), kg_per_carton: numOut(q.kgPerCarton),
          exw_to_fob_usd: numOut(q.exwToFobPerUnit || 0), cif_freight_ins_usd: numOut(q.cifFreightInsurancePerUnit || 0),
          risk_checks: CHECK_KEYS.filter(function (k) { return checks[k]; }).join('|'),
          landed_per_unit_usd: r && r.landedPerUnit !== null && r.landedPerUnit !== undefined ? r.landedPerUnit.toFixed(2) : '',
          component_total_usd: r && r.componentTotal !== null && r.componentTotal !== undefined ? r.componentTotal.toFixed(2) : '',
          rank: r && r.rank ? String(r.rank) : '',
          pick: picks[c.id] === q.id ? 'recommended' : (alts[c.id] === q.id ? 'alternate' : '')
        });
      });
    });
    (p.waves || []).forEach(function (w) { row({ record: 'wave', id: w.id, date: w.date, units: numOut(w.units) }); });
    (p.billing || []).forEach(function (b) { row({ record: 'billing', pct: pctOut(b.pct), days_after: b.daysAfter, days: numOut(b.days) }); });
    return out.join('\r\n') + '\r\n';
  }

  function parseProjectCsv(text) {
    var lines = String(text || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
    var i = 0;
    while (i < lines.length && !lines[i].trim()) i++;
    if (i >= lines.length || lines[i].replace(/,+$/, '').trim() !== VERSION_LINE) {
      throw new Error('Not a project file: the first line must be "' + VERSION_LINE + '"');
    }
    i++;
    var header = splitLine(lines[i] || '', ',').map(function (h) { return h.trim(); });
    i++;
    var project = { name: '', kits: [], components: [], waves: [], pricing: { mode: 'margin', value: 0 }, billing: [], storage: { perPalletMonth: 0, months: 0 }, moqOverage: 'project' };
    var compById = {};
    var pendingQuotes = [];
    for (; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      var cells = splitLine(lines[i], ',');
      var r = {};
      header.forEach(function (h, j) {
        var v = cells[j] === undefined ? '' : cells[j];
        if (/^'[=+@]/.test(v)) v = v.slice(1);
        r[h] = v;
      });
      var lineNo = i + 1;
      var n = function (k, fallback) {
        if (r[k] === undefined || r[k] === '') return fallback === undefined ? 0 : fallback;
        var x = parseNumber(r[k]);
        if (!x.ok) throw new Error('Line ' + lineNo + ': "' + r[k] + '" in ' + k + ' is not a number');
        return x.value;
      };
      var pct = function (k) { return n(k, 0) / 100; };
      switch (r.record) {
        case 'project':
          project.name = r.name || '';
          project.pricing = r.pricing_mode === 'pricePerKit'
            ? { mode: 'pricePerKit', value: n('price_per_kit_usd') }
            : { mode: 'margin', value: pct('margin_pct') };
          project.moqOverage = r.moq_overage === 'carry' ? 'carry' : 'project';
          project.storage = { perPalletMonth: n('storage_per_pallet_month_usd'), months: n('storage_months') };
          if (r.contract_date) project.contractDate = r.contract_date;
          break;
        case 'kit':
          var kit = { id: r.id, name: r.name, units: n('units') };
          if (r.price_per_kit_usd !== '' && r.price_per_kit_usd !== undefined) kit.price = n('price_per_kit_usd');
          project.kits.push(kit);
          break;
        case 'component':
          var c = {
            id: r.id, kitId: r.parent_id, name: r.name, uom: r.uom, qtyPerUnit: n('qty_per_unit'), wastePct: pct('waste_pct'),
            unitsPerCarton: n('units_per_carton'), htsCode: r.hts_code, baseDutyRate: pct('base_duty_pct'),
            metal232Share: pct('metal232_share_pct')
          };
          if (r.metal232_rate_pct !== '' && r.metal232_rate_pct !== undefined) c.metal232Rate = pct('metal232_rate_pct');
          c.quotes = [];
          compById[c.id] = c;
          project.components.push(c);
          break;
        case 'quote':
          var checks = {};
          var passed = String(r.risk_checks || '').split('|');
          CHECK_KEYS.forEach(function (k) { checks[k] = passed.indexOf(k) >= 0; });
          pendingQuotes.push({ parent: r.parent_id, line: lineNo, q: {
            id: r.id, supplier: r.supplier, origin: r.origin, incoterm: r.incoterm || 'FOB', price: n('price_usd'),
            moq: n('moq'), productionDays: n('production_days'),
            paymentTerms: { depositPct: pct('deposit_pct'), balance: r.balance_terms === 'onArrival' ? 'onArrival' : 'beforeShipment' },
            cbmPerCarton: n('cbm_per_carton'), kgPerCarton: n('kg_per_carton'),
            exwToFobPerUnit: n('exw_to_fob_usd'), cifFreightInsurancePerUnit: n('cif_freight_ins_usd'),
            risk: { checks: checks }
          } });
          break;
        case 'wave':
          project.waves.push({ id: r.id, date: r.date, units: n('units') });
          break;
        case 'billing':
          project.billing.push({ pct: pct('pct'), daysAfter: r.days_after === 'contract' ? 'contract' : 'delivery', days: n('days') });
          break;
        default:
          throw new Error('Line ' + lineNo + ': unknown record type "' + r.record + '"');
      }
    }
    pendingQuotes.forEach(function (pq) {
      var c = compById[pq.parent];
      if (!c) throw new Error('Line ' + pq.line + ': quote points to unknown component "' + pq.parent + '"');
      c.quotes.push(pq.q);
    });
    return project;
  }

  return {
    VERSION_LINE: VERSION_LINE,
    CSV_COLUMNS: CSV_COLUMNS,
    QUOTE_PASTE_COLUMNS: QUOTE_PASTE_COLUMNS,
    CHECK_KEYS: CHECK_KEYS,
    parseNumber: parseNumber,
    parseQuotesTable: parseQuotesTable,
    exportProjectCsv: exportProjectCsv,
    parseProjectCsv: parseProjectCsv
  };
});
