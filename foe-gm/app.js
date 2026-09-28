/* Fallout: Equestria — Panel Mistrza Gry
 * Całość działa lokalnie w przeglądarce: dane w localStorage, PDF podręcznika w IndexedDB.
 */
'use strict';

const STORE_KEY = 'foe-gm-v1';

const TYPES = [
  { id: 'przygoda', label: 'Kampania i wątki', one: 'Przygoda / wątek', icon: '✦',
    tpl: '## Zarys\n\n## Stawka\nCo się stanie, jeśli gracze nic nie zrobią?\n\n## Zaangażowani\n- \n\n## Etapy\n- [ ] \n- [ ] \n\n## Możliwe zakończenia\n- ' },
  { id: 'sesja', label: 'Sesje', one: 'Sesja', icon: '◷',
    tpl: '**Data:** \n**Obecni:** \n\n## Cel sesji\n\n## Przypomnienie z poprzedniej sesji\n\n## Sceny\n- [ ] \n- [ ] \n\n## Spotkania / walki\n\n## Łupy i nagrody\n\n## Co się faktycznie wydarzyło\n' },
  { id: 'lokacja', label: 'Lokacje', one: 'Lokacja', icon: '⌂',
    tpl: '## Pierwsze wrażenie\n> Opis do przeczytania graczom.\n\n## Co tu jest\n- \n\n## Mieszkańcy / zagrożenia\n- \n\n## Sekrety\n- \n\n## Łupy\n- ' },
  { id: 'npc', label: 'NPC', one: 'NPC', icon: '☺', stats: true,
    tpl: '**Rasa:** \n**Rola:** \n\n## Wygląd i zachowanie\n\n## Czego chce\n\n## Co wie\n- \n\n## Sekrety\n- \n\n## Powiązania\n- ' },
  { id: 'frakcja', label: 'Frakcje', one: 'Frakcja', icon: '⚑',
    tpl: '## Cele\n\n## Zasoby\n\n## Przywódcy\n- \n\n## Stosunek do graczy\n\n## Postępy planów\n- [ ] \n' },
  { id: 'gracz', label: 'Postacie graczy', one: 'Postać gracza', icon: '★', stats: true,
    tpl: '**Gracz:** \n**Rasa:** \n**Znaczek:** \n\n## Historia\n\n## Wątki osobiste\n- \n\n## Ekwipunek\n- ' },
  { id: 'stwor', label: 'Bestiariusz', one: 'Stwór', icon: '☠', stats: true,
    tpl: '## Opis\n\n## Ataki\n- \n\n## Taktyka\n\n## Łupy\n- ' },
  { id: 'przedmiot', label: 'Przedmioty', one: 'Przedmiot', icon: '✚',
    tpl: '## Opis\n\n## Działanie\n\n## Gdzie można znaleźć\n' },
  { id: 'zasada', label: 'Zasady i ściągi', one: 'Zasada / ściąga', icon: '§',
    tpl: '## Skrót\n\nŹródło: [[str:1]]\n' },
  { id: 'notatka', label: 'Notatki', one: 'Notatka', icon: '✎', tpl: '' },
];
const TYPE = Object.fromEntries(TYPES.map(t => [t.id, t]));
const SPECIAL = ['S', 'P', 'E', 'C', 'I', 'A', 'L'];
const DEFAULT_STATS = [['S', '5'], ['P', '5'], ['E', '5'], ['C', '5'], ['I', '5'], ['A', '5'], ['L', '5'],
  ['HP', ''], ['AP', ''], ['DT', ''], ['Sekwencja', '']];
const HP_KEYS = ['hp', 'pż', 'pz', 'punkty życia'];
const INIT_KEYS = ['sekwencja', 'inicjatywa', 'init', 'sequence', 'seq'];

// ---------- narzędzia pomocnicze ----------
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const now = () => Date.now();
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const byTitle = (a, b) => a.title.localeCompare(b.title, 'pl', { numeric: true });

function toast(msg, ms = 2200) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.tm);
  toast.tm = setTimeout(() => t.classList.remove('show'), ms);
}

// ---------- stan i zapis ----------
let db;
let saveTimer;

function emptyDb() {
  return {
    version: 1, campaign: 'Moja kampania', entries: {}, notes: '',
    combat: { round: 1, turn: 0, list: [] }, bookmarks: [],
    ui: { theme: 'green', rightW: 380, tab: 'dice', collapsed: {}, toolsHidden: false, preview: true },
  };
}

function normalize(d) {
  const base = emptyDb();
  const out = Object.assign(base, d);
  out.ui = Object.assign(emptyDb().ui, d.ui || {});
  out.combat = Object.assign(emptyDb().combat, d.combat || {});
  for (const [id, e] of Object.entries(out.entries)) {
    e.id = id;
    e.tags = e.tags || [];
    e.body = e.body || '';
    if (!TYPE[e.type]) e.type = 'notatka';
  }
  return out;
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (err) { console.error(err); }
  return null;
}

function save(immediate) {
  clearTimeout(saveTimer);
  const doit = () => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
      $('#save-status').textContent = 'zapisano ' + new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      console.error(err);
      $('#save-status').textContent = '⚠ błąd zapisu!';
      toast('Nie udało się zapisać danych w przeglądarce. Zrób eksport do pliku!', 5000);
    }
  };
  if (immediate) doit(); else saveTimer = setTimeout(doit, 300);
}

const entries = () => Object.values(db.entries);
function findByTitle(title) {
  const t = title.trim().toLowerCase();
  return entries().find(e => e.title.toLowerCase() === t);
}
function stat(e, keys) {
  if (!e.stats) return '';
  const row = e.stats.find(([k]) => keys.includes(String(k).trim().toLowerCase()));
  return row ? row[1] : '';
}
function ancestors(e) {
  const out = [];
  const seen = new Set();
  let p = e.parent && db.entries[e.parent];
  while (p && !seen.has(p.id)) { out.unshift(p); seen.add(p.id); p = p.parent && db.entries[p.parent]; }
  return out;
}
function descendants(id) {
  const out = new Set([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const e of entries()) if (e.parent && out.has(e.parent) && !out.has(e.id)) { out.add(e.id); grew = true; }
  }
  return out;
}
function linkRegex(title) {
  return new RegExp('\\[\\[\\s*' + reEsc(title) + '\\s*(\\||\\]\\])', 'i');
}
function backlinks(e) {
  const re = linkRegex(e.title);
  return entries().filter(o => o.id !== e.id && re.test(o.body)).sort(byTitle);
}
function snippet(e, len = 140) {
  return e.body.replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (m, a, b) => b || a)
    .replace(/[#*>`_~|-]/g, ' ').replace(/\s+/g, ' ').replace(/ ([.,:;!?])/g, '$1').trim().slice(0, len);
}

// ---------- markdown ----------
function wikiLink(inner) {
  const bar = inner.indexOf('|');
  const target = (bar < 0 ? inner : inner.slice(0, bar)).trim();
  const label = bar < 0 ? null : inner.slice(bar + 1).trim();
  let m;
  if ((m = target.match(/^(?:str|s|p|pdf|page)\.?\s*:?\s*(\d+)$/i))) {
    return `<a class="wl book" data-page="${m[1]}" title="Podręcznik, strona ${m[1]}">📖 ${esc(label || 'str. ' + m[1])}</a>`;
  }
  if ((m = target.match(/^(?:r|rzut|roll)\s*:\s*(.+)$/i))) {
    return `<a class="wl roll" data-roll="${esc(m[1])}" data-label="${esc(label || '')}" title="Kliknij, aby rzucić">🎲 ${esc(label || m[1])}</a>`;
  }
  const e = findByTitle(target);
  if (e) return `<a class="wl" data-id="${e.id}" title="${esc(TYPE[e.type].one)}: ${esc(e.title)}">${esc(label || target)}</a>`;
  return `<a class="wl missing" data-new="${esc(target)}" title="Brak wpisu — kliknij, aby utworzyć">${esc(label || target)}</a>`;
}

function inline(s) {
  const tok = [];
  const hold = h => { tok.push(h); return '\u0000' + (tok.length - 1) + '\u0000'; };
  s = s.replace(/`([^`]+)`/g, (m, c) => hold('<code>' + esc(c) + '</code>'));
  s = s.replace(/\[\[([^\]\n]+?)\]\]/g, (m, c) => hold(wikiLink(c)));
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (m, t, u) => hold(`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>`));
  s = esc(s);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s](?:[^*]*?[^*\s])?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>');
  s = s.replace(/(^|\s)#([\p{L}\p{N}_-]+)/gu, '$1<a class="tag" data-tag="$2">#$2</a>');
  return s.replace(/\u0000(\d+)\u0000/g, (m, n) => tok[n]);
}

const RE_LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const RE_HR = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/;
const RE_TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
function isBlockStart(line, next) {
  return /^```/.test(line) || /^#{1,6}\s/.test(line) || RE_HR.test(line) || /^>/.test(line) ||
    RE_LIST.test(line) || (/^\s*\|/.test(line) && next !== undefined && RE_TABLE_SEP.test(next));
}
function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
}

function md(src, off = 0) {
  const lines = src.replace(/\r/g, '').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    let m;
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>');
      continue;
    }
    if (/^\s*$/.test(line)) { i++; continue; }
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
      const n = m[1].length;
      out.push(`<h${n}>${inline(m[2])}</h${n}>`);
      i++; continue;
    }
    if (RE_HR.test(line)) { out.push('<hr>'); i++; continue; }
    if (/^>/.test(line)) {
      const start = i, buf = [];
      while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push('<blockquote>' + md(buf.join('\n'), off + start) + '</blockquote>');
      continue;
    }
    if (/^\s*\|/.test(line) && RE_TABLE_SEP.test(lines[i + 1] || '')) {
      const head = splitRow(line);
      i += 2;
      let html = '<table><thead><tr>' + head.map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>';
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        html += '<tr>' + splitRow(lines[i++]).map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>';
      }
      out.push(html + '</tbody></table>');
      continue;
    }
    if (RE_LIST.test(line)) {
      const items = [];
      while (i < lines.length && (m = lines[i].match(RE_LIST))) {
        items.push({ indent: m[1].replace(/\t/g, '  ').length, ordered: /\d/.test(m[2]), text: m[3], line: off + i });
        i++;
      }
      let html = '';
      const stack = [];
      for (const it of items) {
        while (stack.length && it.indent < stack[stack.length - 1].indent) html += '</li></' + stack.pop().tag + '>';
        if (!stack.length || it.indent > stack[stack.length - 1].indent) {
          const tag = it.ordered ? 'ol' : 'ul';
          stack.push({ indent: it.indent, tag });
          html += '<' + tag + '>';
        } else html += '</li>';
        const task = it.text.match(/^\[( |x|X)\]\s?(.*)$/);
        if (task) {
          const done = task[1] !== ' ';
          html += `<li class="task${done ? ' done' : ''}"><input type="checkbox" data-line="${it.line}"${done ? ' checked' : ''}><span>${inline(task[2])}</span>`;
        } else html += '<li>' + inline(it.text);
      }
      while (stack.length) html += '</li></' + stack.pop().tag + '>';
      out.push(html);
      continue;
    }
    const buf = [line];
    i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !isBlockStart(lines[i], lines[i + 1])) buf.push(lines[i++]);
    out.push('<p>' + buf.map(inline).join('<br>') + '</p>');
  }
  return out.join('\n');
}

// ---------- nawigacja ----------
let hist = [];
let hpos = -1;
let view = { name: 'home' };
let editing = null; // { id, isNew }

function go(v, push = true) {
  if (editing && !confirmLeaveEditor()) return;
  view = v;
  if (push) {
    hist = hist.slice(0, hpos + 1);
    const last = hist[hist.length - 1];
    if (!last || JSON.stringify(last) !== JSON.stringify(v)) hist.push(v);
    if (hist.length > 200) hist.shift();
    hpos = hist.length - 1;
  }
  render();
  $('#main').scrollTop = 0;
}
function back() { if (hpos > 0) { const t = hist[hpos - 1]; if (editing && !confirmLeaveEditor()) return; hpos--; go(t, false); } }
function fwd() { if (hpos < hist.length - 1) { const t = hist[hpos + 1]; if (editing && !confirmLeaveEditor()) return; hpos++; go(t, false); } }
function openEntry(id) { go({ name: 'entry', id }); }

function confirmLeaveEditor() {
  if (!editing) return true;
  const e = db.entries[editing.id];
  if (isEditorDirty(e) && !confirm('Masz niezapisane zmiany. Porzucić je?')) return false;
  if (editing.isNew) delete db.entries[editing.id];
  editing = null;
  return true;
}

function render() {
  if (view.name === 'entry' && !db.entries[view.id]) view = { name: 'home' };
  $('#btn-back').disabled = hpos <= 0;
  $('#btn-fwd').disabled = hpos >= hist.length - 1;
  renderTree();
  if (editing) renderEditor();
  else if (view.name === 'entry') renderEntry(db.entries[view.id]);
  else renderHome();
}

// ---------- pasek boczny ----------
function matches(e, q) {
  if (!q) return true;
  return q.split(/\s+/).filter(Boolean).every(w => {
    if (w.startsWith('#')) return e.tags.some(t => t.toLowerCase().startsWith(w.slice(1)));
    return e.title.toLowerCase().includes(w) || e.body.toLowerCase().includes(w) || e.tags.some(t => t.toLowerCase().includes(w));
  });
}

function renderTree() {
  const q = $('#search').value.trim().toLowerCase();
  const activeId = editing ? editing.id : view.name === 'entry' ? view.id : null;
  let html = '';
  for (const t of TYPES) {
    const list = entries().filter(e => e.type === t.id && matches(e, q));
    if (q && !list.length) continue;
    // Wpisy tego samego typu, których rodzic też jest tego typu, pokazujemy wcięte pod rodzicem.
    const ids = new Set(list.map(e => e.id));
    const roots = list.filter(e => !(e.parent && ids.has(e.parent))).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || byTitle(a, b));
    const item = (e, child) => `<a data-id="${e.id}" class="${e.id === activeId ? 'active' : ''}${child ? ' child' : ''}" title="${esc(e.title)}">${e.pinned ? '<span class="pin">📌</span> ' : ''}${esc(e.title)}</a>`;
    let items = '';
    for (const r of roots) {
      items += item(r, false);
      for (const c of list.filter(e => e.parent === r.id).sort(byTitle)) items += item(c, true);
    }
    const collapsed = !q && db.ui.collapsed[t.id];
    html += `<div class="group${collapsed ? ' collapsed' : ''}" data-type="${t.id}">
      <div class="group-head"><span class="caret">${collapsed ? '▸' : '▾'}</span><span>${t.icon} ${t.label}</span>
      <span class="count">${list.length}</span><button class="add" data-add="${t.id}" title="Nowy: ${t.one}">+</button></div>
      <div class="items">${items}</div></div>`;
  }
  if (!html) html = '<p class="muted small" style="padding:10px">Brak wyników.</p>';
  $('#tree').innerHTML = html;
}

// ---------- widok wpisu ----------
function statBlock(e) {
  if (!e.stats || !e.stats.length) return '';
  return '<div class="statblock">' + e.stats.map(([k, v]) =>
    `<div class="stat${SPECIAL.includes(k) ? ' special' : ''}"><div class="k" title="${esc(k)}">${esc(k)}</div><div class="v">${esc(v || '–')}</div></div>`
  ).join('') + '</div>';
}

function renderEntry(e) {
  const t = TYPE[e.type];
  const anc = ancestors(e);
  const children = entries().filter(o => o.parent === e.id).sort((a, b) => TYPES.indexOf(TYPE[a.type]) - TYPES.indexOf(TYPE[b.type]) || byTitle(a, b));
  const bl = backlinks(e);
  const canFight = e.stats && e.stats.length;
  $('#main').innerHTML = `
    <div class="crumbs"><a data-go="home">Pulpit</a> › ${anc.map(a => `<a data-id="${a.id}">${esc(a.title)}</a> › `).join('')}<span>${esc(t.one)}</span></div>
    <div class="entry-head">
      <h1><span class="icon">${t.icon}</span>${esc(e.title)}</h1>
      <div class="entry-actions">
        <button class="primary" data-act="edit" title="Edytuj (E)">✎ Edytuj</button>
        ${canFight ? '<button data-act="fight" title="Dodaj do trackera walki">⚔ Do walki</button>' : ''}
        <button data-act="child" title="Utwórz wpis podrzędny, np. scenę w sesji albo pomieszczenie w lokacji">+ Podrzędny</button>
        <button data-act="pin" title="Przypnij na pulpicie">${e.pinned ? '📌 Odepnij' : '📌 Przypnij'}</button>
        <button data-act="dup" title="Duplikuj (np. kolejny bandyta)">⧉</button>
        <button data-act="del" class="danger" title="Usuń">🗑</button>
      </div>
    </div>
    <div class="tags"><span class="type-badge">${esc(t.one)}</span>${e.tags.map(g => `<a class="tag" data-tag="${esc(g)}">#${esc(g)}</a>`).join('')}</div>
    ${statBlock(e)}
    <div class="md" id="entry-body">${e.body.trim() ? md(e.body) : '<p class="empty-body">Pusty wpis. Kliknij „Edytuj”, aby dodać treść.</p>'}</div>
    ${children.length ? `<div class="panel"><h3>Wpisy podrzędne (${children.length})</h3><div class="link-list">${children.map(c => `<a class="wl" data-id="${c.id}">${TYPE[c.type].icon} ${esc(c.title)}</a>`).join('')}</div></div>` : ''}
    <div class="panel"><h3>Wspomniane w (${bl.length})</h3>${bl.length ? '<div class="link-list">' + bl.map(b => `<a class="wl" data-id="${b.id}">${TYPE[b.type].icon} ${esc(b.title)}</a>`).join('') + '</div>' : '<span class="ctx">Żaden wpis jeszcze tu nie linkuje.</span>'}</div>
    <p class="muted small">Utworzono ${new Date(e.created).toLocaleString('pl')} · zmieniono ${new Date(e.updated).toLocaleString('pl')}</p>`;
  e.viewed = now();
  save();
}

function toggleTask(line) {
  const e = db.entries[view.id];
  if (!e) return;
  const lines = e.body.split('\n');
  if (lines[line] === undefined) return;
  lines[line] = lines[line].replace(/\[( |x|X)\]/, (m, c) => (c === ' ' ? '[x]' : '[ ]'));
  e.body = lines.join('\n');
  e.updated = now();
  save();
  const scroll = $('#main').scrollTop;
  render();
  $('#main').scrollTop = scroll;
}

// ---------- tworzenie / usuwanie ----------
function createEntry({ title = '', type = 'notatka', parent = null, body = null, stats = null } = {}) {
  const t = TYPE[type];
  const e = {
    id: uid(), title, type, parent, tags: [], body: body ?? t.tpl,
    stats: stats ?? (t.stats ? DEFAULT_STATS.map(r => [...r]) : null),
    created: now(), updated: now(), pinned: false,
  };
  db.entries[e.id] = e;
  return e;
}

function startNew(opts) {
  if (editing && !confirmLeaveEditor()) return;
  const e = createEntry(opts);
  editing = { id: e.id, isNew: true, snapshot: null };
  view = { name: 'entry', id: e.id };
  hist = hist.slice(0, hpos + 1); hist.push(view); hpos = hist.length - 1;
  render();
  setTimeout(() => (opts.title ? $('#body-input') : $('#f-title'))?.focus(), 0);
}

function askTypeThen(title, cb) {
  openModal(`<div class="body"><div>Jakiego typu ma być wpis${title ? ` <b>${esc(title)}</b>` : ''}?</div>
    <div class="type-grid">${TYPES.map((t, i) => `<button data-type="${t.id}">${t.icon} ${t.one} <span class="muted small">${i < 9 ? i + 1 : 0}</span></button>`).join('')}</div></div>`,
  box => {
    box.addEventListener('click', ev => {
      const b = ev.target.closest('[data-type]');
      if (b) { closeModal(); cb(b.dataset.type); }
    });
    box.tabIndex = -1; box.focus();
    box.addEventListener('keydown', ev => {
      const n = ev.key === '0' ? 9 : parseInt(ev.key, 10) - 1;
      if (TYPES[n]) { ev.preventDefault(); closeModal(); cb(TYPES[n].id); }
    });
  });
}

function deleteEntry(e) {
  const bl = backlinks(e).length;
  const kids = entries().filter(o => o.parent === e.id).length;
  let msg = `Usunąć „${e.title}”?`;
  if (bl) msg += `\nLinkuje tu ${bl} wpis(ów) — linki staną się czerwone.`;
  if (kids) msg += `\n${kids} wpis(ów) podrzędnych zostanie odłączonych (nie usuniętych).`;
  if (!confirm(msg)) return;
  for (const o of entries()) if (o.parent === e.id) o.parent = null;
  delete db.entries[e.id];
  save();
  toast('Usunięto: ' + e.title);
  hist = hist.filter(h => h.id !== e.id);
  hpos = Math.min(hpos, hist.length - 1);
  go({ name: 'home' });
}

function uniqueTitle(base) {
  let n = 2, t = base;
  while (findByTitle(t)) t = `${base} (${n++})`;
  return t;
}

// ---------- edytor ----------
function editorState(e) {
  return JSON.stringify({ t: e.title, ty: e.type, p: e.parent, g: e.tags, b: e.body, s: e.stats });
}
function readEditor() {
  if (!$('#f-title')) return null;
  const stats = $('#f-hasstats').checked
    ? $$('.stat-row').map(r => [r.querySelector('.k').value.trim(), r.querySelector('.v').value.trim()]).filter(([k]) => k)
    : null;
  return {
    title: $('#f-title').value.trim(),
    type: $('#f-type').value,
    parent: $('#f-parent').value || null,
    tags: $('#f-tags').value.split(/[,\s]+/).map(s => s.replace(/^#/, '').trim()).filter(Boolean),
    body: $('#body-input').value,
    stats,
  };
}
function isEditorDirty(e) {
  const d = readEditor();
  if (!d || !editing) return false;
  return JSON.stringify({ t: d.title, ty: d.type, p: d.parent, g: d.tags, b: d.body, s: d.stats }) !== editing.snapshot;
}

function statRowHtml(k, v) {
  return `<span class="stat-row"><input class="k" value="${esc(k)}" placeholder="nazwa"><input class="v" value="${esc(v)}" placeholder="wartość"><button type="button" class="rm" title="Usuń pole">✕</button></span>`;
}

function renderEditor() {
  const e = db.entries[editing.id];
  if (!editing.snapshot) editing.snapshot = editorState(e);
  const forbidden = descendants(e.id);
  const parents = entries().filter(o => !forbidden.has(o.id))
    .sort((a, b) => TYPES.indexOf(TYPE[a.type]) - TYPES.indexOf(TYPE[b.type]) || byTitle(a, b));
  const stats = e.stats || DEFAULT_STATS;
  $('#main').innerHTML = `
    <div class="crumbs">${editing.isNew ? 'Nowy wpis' : 'Edycja wpisu'} · <kbd>Ctrl+S</kbd> zapisz · <kbd>Esc</kbd> anuluj · wpisz <code>[[</code>, aby wstawić link</div>
    <div class="editor-grid">
      <label class="full">Tytuł<input id="f-title" class="title-input" value="${esc(e.title)}" placeholder="np. Stajnia 42, Sesja 3 — Oblężenie, Rusty Bolt"></label>
      <label>Typ<select id="f-type">${TYPES.map(t => `<option value="${t.id}"${t.id === e.type ? ' selected' : ''}>${t.icon} ${t.one}</option>`).join('')}</select></label>
      <label>Należy do (wpis nadrzędny)<select id="f-parent"><option value="">— brak —</option>${parents.map(p => `<option value="${p.id}"${p.id === e.parent ? ' selected' : ''}>${TYPE[p.type].icon} ${esc(p.title)}</option>`).join('')}</select></label>
      <label class="full">Tagi (oddzielone przecinkami lub spacjami)<input id="f-tags" value="${esc(e.tags.join(', '))}" placeholder="np. manehattan, akt1, wróg"></label>
      <div class="full">
        <label class="check"><input type="checkbox" id="f-hasstats"${e.stats ? ' checked' : ''}> Blok statystyk (S.P.E.C.I.A.L., HP itd.)</label>
        <div id="stats-wrap" ${e.stats ? '' : 'hidden'}>
          <div class="stats-editor" id="stats-editor">${stats.map(([k, v]) => statRowHtml(k, v)).join('')}
            <button type="button" id="stat-add">+ pole</button></div>
        </div>
      </div>
    </div>
    <div class="editor-bar">
      <button class="primary" id="ed-save">💾 Zapisz</button>
      <button id="ed-cancel">Anuluj</button>
      <button id="ed-tpl" title="Wstaw szablon dla wybranego typu">Wstaw szablon</button>
      <label class="check"><input type="checkbox" id="ed-preview"${db.ui.preview ? ' checked' : ''}> podgląd</label>
      <span class="muted small">Składnia: <code>## Nagłówek</code> <code>**pogrubienie**</code> <code>- [ ] zadanie</code> <code>&gt; cytat</code> <code>[[Wpis]]</code> <code>[[str:42]]</code> <code>[[r:2k6+3]]</code> <code>#tag</code></span>
    </div>
    <div class="editor-split${db.ui.preview ? '' : ' no-preview'}">
      <div class="ta-wrap"><textarea id="body-input" spellcheck="true">${esc(e.body)}</textarea><div class="ac" id="ac" hidden></div></div>
      <div class="preview md" id="preview"></div>
    </div>`;
  updatePreview();
}

function updatePreview() {
  const p = $('#preview');
  if (p && db.ui.preview) p.innerHTML = md($('#body-input').value) || '<p class="empty-body">Podgląd</p>';
}

function saveEditor() {
  const e = db.entries[editing.id];
  const d = readEditor();
  if (!d.title) { toast('Wpis musi mieć tytuł.'); $('#f-title').focus(); return; }
  const clash = findByTitle(d.title);
  if (clash && clash.id !== e.id) { toast('Wpis o tytule „' + d.title + '” już istnieje.'); $('#f-title').focus(); return; }
  // Zmiana tytułu: popraw linki w innych wpisach.
  let relinked = 0;
  if (!editing.isNew && e.title && e.title !== d.title) {
    const re = new RegExp('\\[\\[\\s*' + reEsc(e.title) + '\\s*(\\||\\]\\])', 'gi');
    for (const o of entries()) {
      if (o.id === e.id) continue;
      const nb = o.body.replace(re, (m, tail) => '[[' + d.title + tail);
      if (nb !== o.body) { o.body = nb; o.updated = now(); relinked++; }
    }
  }
  Object.assign(e, d, { updated: now() });
  editing = null;
  save();
  toast(relinked ? `Zapisano. Zaktualizowano linki w ${relinked} wpisach.` : 'Zapisano.');
  render();
}

function cancelEditor() {
  const id = editing.id;
  const wasNew = editing.isNew;
  if (isEditorDirty(db.entries[id]) && !confirm('Porzucić zmiany?')) return;
  editing = null;
  if (wasNew) {
    delete db.entries[id];
    hist = hist.filter(h => h.id !== id);
    hpos = hist.length - 1;
    view = hist[hpos] || { name: 'home' };
  }
  render();
}

// autouzupełnianie linków [[...
let ac = { items: [], sel: 0, start: 0 };
function checkAC() {
  const ta = $('#body-input');
  const before = ta.value.slice(0, ta.selectionStart);
  const m = before.match(/\[\[([^\]\n|]*)$/);
  const box = $('#ac');
  if (!m) { box.hidden = true; return; }
  const q = m[1].toLowerCase();
  const cur = editing && db.entries[editing.id];
  ac.items = entries().filter(e => e !== cur && e.title.toLowerCase().includes(q))
    .sort((a, b) => (a.title.toLowerCase().startsWith(q) ? 0 : 1) - (b.title.toLowerCase().startsWith(q) ? 0 : 1) || byTitle(a, b))
    .slice(0, 10);
  ac.start = ta.selectionStart - m[1].length;
  ac.sel = 0;
  if (!ac.items.length) { box.hidden = true; return; }
  const lineNo = before.split('\n').length;
  const lh = parseFloat(getComputedStyle(ta).lineHeight) || 22;
  box.style.top = Math.min(ta.clientHeight - 40, 8 + lineNo * lh - ta.scrollTop) + 'px';
  box.innerHTML = ac.items.map((e, i) => `<div data-i="${i}" class="${i === 0 ? 'sel' : ''}">${TYPE[e.type].icon} ${esc(e.title)}<span class="t">${esc(TYPE[e.type].one)}</span></div>`).join('');
  box.hidden = false;
}
function acceptAC(i) {
  const ta = $('#body-input');
  const e = ac.items[i];
  if (!e) return;
  const after = ta.value.slice(ta.selectionStart);
  const close = after.startsWith(']]') ? '' : ']]';
  ta.value = ta.value.slice(0, ac.start) + e.title + close + after;
  const pos = ac.start + e.title.length + 2;
  ta.setSelectionRange(pos, pos);
  $('#ac').hidden = true;
  ta.focus();
  updatePreview();
}

// ---------- pulpit ----------
function renderHome() {
  const all = entries();
  const pinned = all.filter(e => e.pinned).sort(byTitle);
  const recent = [...all].sort((a, b) => b.updated - a.updated).slice(0, 10);
  const viewed = [...all].filter(e => e.viewed).sort((a, b) => b.viewed - a.viewed).slice(0, 10);
  const sessions = all.filter(e => e.type === 'sesja').sort((a, b) => byTitle(b, a)).slice(0, 8);
  const openTasks = [];
  for (const e of all) {
    if (e.type !== 'sesja' && e.type !== 'przygoda') continue;
    const n = (e.body.match(/^\s*[-*+]\s+\[ \]/gm) || []).length;
    if (n) openTasks.push([e, n]);
  }
  const card = e => `<div class="card" data-id="${e.id}"><div class="t">${TYPE[e.type].icon} ${esc(e.title)}</div><div class="s">${esc(snippet(e)) || '&nbsp;'}</div></div>`;
  const list = arr => arr.length ? '<div class="link-list" style="flex-direction:column">' + arr.map(e => `<a class="wl" data-id="${e.id}">${TYPE[e.type].icon} ${esc(e.title)}</a>`).join('') + '</div>' : '<span class="ctx">Brak.</span>';
  $('#main').innerHTML = `
    <input class="home-title" id="campaign-name" value="${esc(db.campaign)}" title="Kliknij, aby zmienić nazwę kampanii">
    <div class="chips">${TYPES.map(t => `<span class="chip" data-new-type="${t.id}" title="Nowy: ${t.one}">${t.icon} ${t.label}<b>${all.filter(e => e.type === t.id).length}</b></span>`).join('')}</div>
    <div class="panel"><h3>📌 Przypięte</h3>${pinned.length ? '<div class="cards">' + pinned.map(card).join('') + '</div>' : '<span class="ctx">Przypnij najważniejsze wpisy (np. opis kampanii, najbliższą sesję) przyciskiem 📌 na ich stronie.</span>'}</div>
    <div class="home-cols">
      <div class="panel"><h3>◷ Sesje</h3>${list(sessions)}</div>
      <div class="panel"><h3>☐ Niezrobione punkty</h3>${openTasks.length ? '<div class="link-list" style="flex-direction:column">' + openTasks.map(([e, n]) => `<a class="wl" data-id="${e.id}">${TYPE[e.type].icon} ${esc(e.title)} <span class="ctx">(${n})</span></a>`).join('') + '</div>' : '<span class="ctx">Brak otwartych punktów w sesjach i przygodach.</span>'}</div>
      <div class="panel"><h3>👁 Ostatnio oglądane</h3>${list(viewed)}</div>
      <div class="panel"><h3>✎ Ostatnio zmieniane</h3>${list(recent)}</div>
    </div>
    <div class="panel help"><h3>Jak z tego korzystać</h3>
      <table>
        <tr><td><code>[[Nazwa wpisu]]</code></td><td>link do innego wpisu. Czerwony link oznacza, że wpis jeszcze nie istnieje. Kliknięcie go utworzy.</td></tr>
        <tr><td><code>[[Nazwa|inny tekst]]</code></td><td>link z własnym tekstem</td></tr>
        <tr><td><code>[[str:42]]</code></td><td>otwiera wczytany podręcznik PDF na stronie 42</td></tr>
        <tr><td><code>[[r:2k6+3]]</code></td><td>klikalny rzut kośćmi, np. atak NPC: <code>[[r:2k10+4|Strzelba]]</code></td></tr>
        <tr><td><code>- [ ] scena</code></td><td>lista zadań: w widoku wpisu można ją odhaczać w trakcie sesji</td></tr>
        <tr><td><code>#tag</code></td><td>tag. Kliknięcie go filtruje listę po lewej</td></tr>
        <tr><td><kbd>Ctrl+K</kbd></td><td>szybkie przejście do dowolnego wpisu (albo utworzenie nowego)</td></tr>
        <tr><td><kbd>Alt+←</kbd> <kbd>Alt+→</kbd></td><td>wstecz / dalej, jak w przeglądarce</td></tr>
        <tr><td><kbd>E</kbd></td><td>edycja otwartego wpisu, <kbd>Ctrl+S</kbd> zapis, <kbd>Esc</kbd> anulowanie</td></tr>
        <tr><td><kbd>Ctrl+Shift+N</kbd></td><td>nowy wpis</td></tr>
        <tr><td><b>Należy do</b></td><td>wpis nadrzędny, np. sesja należy do przygody, pomieszczenie do lokacji. Daje okruszki nawigacji i listę „Wpisy podrzędne”.</td></tr>
      </table>
      <p class="small muted">Dane zapisują się automatycznie w tej przeglądarce na tym komputerze. <b>Regularnie rób „⭳ Eksport”</b>: plik .json jest Twoją kopią zapasową i pozwala przenieść kampanię na inny komputer.</p>
    </div>
    <div class="panel"><h3>⚙ Ustawienia</h3>
      <div class="row" style="flex-wrap:wrap">
        <label class="check">Motyw
          <select id="theme-select">
            <option value="green">Pip-Buck zielony</option><option value="amber">Bursztyn</option>
            <option value="blue">Niebieski</option><option value="paper">Jasny (papier)</option>
          </select></label>
        <span class="spacer"></span>
        <button id="load-sample">Wczytaj przykładową kampanię</button>
        <button id="wipe" class="danger">Nowa, pusta kampania</button>
      </div>
    </div>`;
  $('#theme-select').value = db.ui.theme;
}

// ---------- szybkie przejście (Ctrl+K) ----------
let modalCleanup = null;
function openModal(html, setup) {
  const m = $('#modal');
  m.innerHTML = '<div class="modal-box">' + html + '</div>';
  m.hidden = false;
  modalCleanup = setup ? setup(m.firstChild) : null;
}
function closeModal() {
  $('#modal').hidden = true;
  $('#modal').innerHTML = '';
  if (typeof modalCleanup === 'function') modalCleanup();
  modalCleanup = null;
}

function openSwitcher() {
  openModal(`<input id="sw-q" placeholder="Wpisz nazwę wpisu, #tag, albo „str 42”…" autocomplete="off"><div class="results" id="sw-res"></div>
    <div class="hint">↑↓ wybór · Enter otwórz · Esc zamknij · brak wyniku → utwórz nowy wpis</div>`, box => {
    const input = $('#sw-q', box);
    let items = [], sel = 0;
    const draw = () => {
      const q = input.value.trim().toLowerCase();
      const pm = q.match(/^(?:str|s|p)\.?\s*:?\s*(\d+)$/);
      const words = q.split(/\s+/).filter(Boolean);
      const found = entries().filter(e => words.every(w => w.startsWith('#')
        ? e.tags.some(t => t.toLowerCase().startsWith(w.slice(1)))
        : e.title.toLowerCase().includes(w)))
        .sort((a, b) => {
          const as = a.title.toLowerCase().startsWith(q) ? 0 : 1, bs = b.title.toLowerCase().startsWith(q) ? 0 : 1;
          return as - bs || (q ? 0 : (b.viewed || 0) - (a.viewed || 0)) || byTitle(a, b);
        }).slice(0, 30);
      items = found.map(e => ({ kind: 'e', e }));
      if (pm) items.unshift({ kind: 'page', page: pm[1] });
      if (q && !q.startsWith('#') && !findByTitle(input.value)) items.push({ kind: 'new', title: input.value.trim() });
      sel = Math.min(sel, Math.max(0, items.length - 1));
      $('#sw-res', box).innerHTML = items.map((it, i) => {
        const cls = 'res' + (i === sel ? ' sel' : '');
        if (it.kind === 'page') return `<div class="${cls}" data-i="${i}"><span class="ic">📖</span>Podręcznik — strona ${it.page}</div>`;
        if (it.kind === 'new') return `<div class="${cls}" data-i="${i}"><span class="ic">+</span>Utwórz „${esc(it.title)}”</div>`;
        return `<div class="${cls}" data-i="${i}"><span class="ic">${TYPE[it.e.type].icon}</span>${esc(it.e.title)}<span class="t">${esc(TYPE[it.e.type].one)}</span></div>`;
      }).join('');
      $('#sw-res .sel', box)?.scrollIntoView({ block: 'nearest' });
    };
    const pick = i => {
      const it = items[i];
      if (!it) return;
      closeModal();
      if (it.kind === 'e') openEntry(it.e.id);
      else if (it.kind === 'page') openBook(it.page);
      else askTypeThen(it.title, type => startNew({ title: it.title, type }));
    };
    input.addEventListener('input', () => { sel = 0; draw(); });
    input.addEventListener('keydown', ev => {
      if (ev.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); draw(); ev.preventDefault(); }
      else if (ev.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); ev.preventDefault(); }
      else if (ev.key === 'Enter') { pick(sel); ev.preventDefault(); }
    });
    $('#sw-res', box).addEventListener('click', ev => { const r = ev.target.closest('[data-i]'); if (r) pick(+r.dataset.i); });
    draw();
    input.focus();
  });
}

// ---------- kości ----------
const diceLog = [];
function rollExpr(expr, label = '') {
  const clean = expr.toLowerCase().replace(/\s+/g, '').replace(/k/g, 'd');
  if (!/^[+-]?(\d*d\d+|\d+)([+-](\d*d\d+|\d+))*$/.test(clean)) { toast('Nie rozumiem rzutu: ' + expr); return null; }
  let total = 0;
  const parts = [];
  for (const m of clean.matchAll(/([+-]?)(?:(\d*)d(\d+)|(\d+))/g)) {
    const sign = m[1] === '-' ? -1 : 1;
    if (m[3]) {
      const n = Math.min(100, parseInt(m[2] || '1', 10)), sides = parseInt(m[3], 10);
      if (!sides) continue;
      const rolls = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * sides));
      total += sign * rolls.reduce((a, b) => a + b, 0);
      parts.push(`${sign < 0 ? '−' : parts.length ? '+' : ''}${n}k${sides}[${rolls.join(',')}]`);
    } else {
      total += sign * parseInt(m[4], 10);
      parts.push(`${sign < 0 ? '−' : '+'}${m[4]}`);
    }
  }
  pushLog({ label, expr: expr.replace(/d/gi, 'k'), detail: parts.join(' '), total });
  return total;
}
function skillTest(target, label = '') {
  const roll = 1 + Math.floor(Math.random() * 100);
  const ok = roll <= target;
  pushLog({ label: label || `Test ${target}%`, expr: 'k100', total: roll, detail: `${ok ? 'SUKCES' : 'PORAŻKA'} · margines ${Math.abs(target - roll)}`, ok });
}
function pushLog(r) {
  r.secret = $('#dice-secret').checked;
  r.time = new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  diceLog.unshift(r);
  diceLog.length = Math.min(diceLog.length, 50);
  $('#dice-log').innerHTML = diceLog.map(x => `<li>${x.label ? `<span class="label">${esc(x.label)}</span> · ` : ''}${esc(x.expr)} = <span class="total ${x.ok === true ? 'ok' : x.ok === false ? 'fail' : ''}">${x.total}</span>
    ${x.secret ? '<span class="secret">[tajny]</span>' : ''}<div class="detail">${esc(x.detail)} · ${x.time}</div></li>`).join('');
}

// ---------- walka ----------
function addCombatant({ name, init = 0, hp = '', entryId = null }) {
  const hpN = hp === '' || isNaN(parseInt(hp, 10)) ? null : parseInt(hp, 10);
  const same = db.combat.list.filter(c => c.name === name || c.name.startsWith(name + ' #')).length;
  db.combat.list.push({ id: uid(), name: same ? `${name} #${same + 1}` : name, init: parseInt(init, 10) || 0, hp: hpN, max: hpN, note: '', entryId });
  save();
  renderCombat();
}
function sortCombat() {
  const cur = db.combat.list[db.combat.turn];
  db.combat.list.sort((a, b) => b.init - a.init);
  db.combat.turn = Math.max(0, db.combat.list.indexOf(cur));
  save(); renderCombat();
}
function nextTurn() {
  const L = db.combat.list;
  if (!L.length) return;
  let guard = 0;
  do {
    db.combat.turn++;
    if (db.combat.turn >= L.length) { db.combat.turn = 0; db.combat.round++; }
  } while (L[db.combat.turn].hp !== null && L[db.combat.turn].hp <= 0 && ++guard < L.length);
  save(); renderCombat();
}
function renderCombat() {
  const c = db.combat;
  $('#cb-round').textContent = c.round;
  $('#cb-list').innerHTML = c.list.map((x, i) => {
    const down = x.hp !== null && x.hp <= 0;
    const pct = x.max ? Math.max(0, Math.min(100, (x.hp / x.max) * 100)) : 0;
    return `<li data-id="${x.id}" class="${i === c.turn ? 'current' : ''}${down ? ' down' : ''}">
      <input class="ini" value="${x.init}" title="Inicjatywa" data-f="init">
      <div class="nm">${x.entryId && db.entries[x.entryId] ? `<a data-id="${x.entryId}">${esc(x.name)}</a>` : esc(x.name)}</div>
      <div class="hp">${x.hp !== null ? `<b>${x.hp}</b>/${x.max}` : ''}<input placeholder="±" data-f="dmg" title="np. -7 (obrażenia) lub +5 (leczenie); bez znaku = ustaw HP"><button class="x" data-f="rm" title="Usuń">✕</button></div>
      ${x.max ? `<div class="hpbar"><i style="width:${pct}%"></i></div>` : ''}
      <input class="note" value="${esc(x.note)}" placeholder="stan, efekty…" data-f="note">
    </li>`;
  }).join('') || '<p class="muted small">Brak uczestników walki.</p>';
}

// ---------- podręcznik PDF ----------
let bookUrl = null;
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('foe-gm', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('files');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbPut(key, val) {
  const d = await idb();
  return new Promise((res, rej) => { const tx = d.transaction('files', 'readwrite'); tx.objectStore('files').put(val, key); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
}
async function idbGet(key) {
  const d = await idb();
  return new Promise((res, rej) => { const r = d.transaction('files').objectStore('files').get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
}
function setBook(blob) {
  if (bookUrl) URL.revokeObjectURL(bookUrl);
  bookUrl = URL.createObjectURL(blob);
  $('#tab-book').classList.add('loaded');
  $('#book-frame').src = bookUrl;
}
function openBook(page) {
  showTab('book');
  if (!bookUrl) { toast('Najpierw wczytaj PDF podręcznika (zakładka Podręcznik).', 3500); return; }
  const f = $('#book-frame');
  if (page) {
    $('#book-page').value = page;
    // Przeładowanie wymusza skok na stronę we wbudowanym czytniku PDF przeglądarki.
    f.src = 'about:blank';
    setTimeout(() => { f.src = bookUrl + '#page=' + page; }, 30);
  }
}
function renderBookmarks() {
  $('#book-marks').innerHTML = db.bookmarks.map((b, i) =>
    `<span class="bm" data-page="${b.page}" title="Strona ${b.page}">${esc(b.label)} <span class="muted">s.${b.page}</span><button data-rm="${i}" title="Usuń zakładkę">✕</button></span>`).join('');
}

// ---------- panel narzędzi ----------
function showTab(name, reveal = true) {
  if (reveal && document.body.classList.contains('tools-hidden')) toggleTools(false);
  db.ui.tab = name;
  $$('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  $$('.tab').forEach(s => s.classList.toggle('active', s.id === 'tab-' + name));
  save();
}
function toggleTools(force) {
  const hidden = force ?? !document.body.classList.contains('tools-hidden');
  document.body.classList.toggle('tools-hidden', hidden);
  db.ui.toolsHidden = hidden;
  save();
}
function setRightWidth(w) {
  w = Math.max(260, Math.min(window.innerWidth - 500, w));
  db.ui.rightW = w;
  document.documentElement.style.setProperty('--right-w', w + 'px');
}
function applyTheme() {
  if (db.ui.theme === 'green') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = db.ui.theme;
}

// ---------- eksport / import ----------
function exportJson() {
  const blob = new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  const safe = db.campaign.replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-|-$/g, '') || 'kampania';
  a.href = URL.createObjectURL(blob);
  a.download = `${safe}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Wyeksportowano kampanię do pliku.');
}
function importJson(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || typeof d.entries !== 'object') throw new Error('Brak wpisów w pliku');
      const n = Object.keys(d.entries).length;
      if (!confirm(`Wczytać kampanię „${d.campaign || '?'}” (${n} wpisów)?\nObecne dane zostaną ZASTĄPIONE. Jeśli chcesz je zachować, anuluj i najpierw zrób eksport.`)) return;
      editing = null;
      db = normalize(d);
      save(true);
      applyUi();
      hist = []; hpos = -1;
      go({ name: 'home' });
      toast('Wczytano kampanię.');
    } catch (err) {
      alert('Nie udało się wczytać pliku: ' + err.message);
    }
  };
  r.readAsText(file);
}

function applyUi() {
  applyTheme();
  setRightWidth(db.ui.rightW);
  document.body.classList.toggle('tools-hidden', !!db.ui.toolsHidden);
  showTab(db.ui.tab || 'dice', false);
  $('#session-notes').value = db.notes || '';
  renderCombat();
  renderBookmarks();
}

// ---------- przykładowa kampania ----------
function seed() {
  const d = emptyDb();
  d.campaign = 'Echa Stajni 42 (przykład)';
  const mk = (type, title, body, extra = {}) => {
    const e = { id: uid(), title, type, parent: null, tags: [], body, stats: null, created: now(), updated: now(), pinned: false, ...extra };
    d.entries[e.id] = e;
    return e;
  };
  const S = (s, p, e, c, i, a, l, hp, ap, dt, seq) => [['S', s], ['P', p], ['E', e], ['C', c], ['I', i], ['A', a], ['L', l], ['HP', hp], ['AP', ap], ['DT', dt], ['Sekwencja', seq]].map(([k, v]) => [k, String(v)]);

  const camp = mk('przygoda', 'Echa Stajni 42', `To jest **przykładowa kampania**. Pokazuje, jak łączyć wpisy. Możesz ją usunąć w ustawieniach na pulpicie („Nowa, pusta kampania”).

## Założenie
Stajnia 42 otwiera się po raz pierwszy od dwustu lat. [[Nadzorczyni Silver Quill]] wysyła grupę ochotników — graczy — by sprawdzili, czy powierzchnia nadaje się do życia. Na zewnątrz czekają [[Łowcy niewolników z Fillydelphii]], a [[Stalowi Strażnicy]] interesują się technologią Stajni.

## Główne wątki
- Tajemnica, dlaczego Stajnia była zamknięta tak długo → [[Sekret Stajni 42]]
- Kto przejmie kontrolę nad [[Posterunek Kamienne Kopyto|Posterunkiem Kamienne Kopyto]]?
- Osobiste wątki postaci graczy

## Plan aktów
- [x] Akt I — Wyjście ze Stajni ([[Sesja 1 — Wrota]])
- [ ] Akt II — Handel i pierwsze sojusze ([[Sesja 2 — Posterunek]])
- [ ] Akt III — Oblężenie Stajni

## Klimat
> Szare niebo, wiatr niesie popiół. Gdzieś daleko gra radio Nadziei.

Zasady, które warto mieć pod ręką: [[Ściąga MG]].`, { pinned: true, tags: ['kampania'] });

  mk('przygoda', 'Sekret Stajni 42', `Wątek poboczny ukryty przed graczami.

## Prawda
Stajnia była eksperymentem. Drzwi zamknęła celowo Nadzorczyni sprzed stu lat, bo na zewnątrz czekało coś gorszego niż promieniowanie.

## Wskazówki do rozsiania
- [ ] Zapiski w terminalu biura [[Nadzorczyni Silver Quill]]
- [ ] Plotka u [[Rusty Bolt]]
- [ ] Znak Stajni na zbroi jednego ze [[Stalowi Strażnicy|Stalowych Strażników]]`, { parent: camp.id, tags: ['sekret'] });

  const s1 = mk('sesja', 'Sesja 1 — Wrota', `**Data:** 2026-10-03
**Obecni:** wszyscy

## Cel sesji
Wyprowadzić drużynę ze [[Stajnia 42|Stajni]] i pokazać, że Pustkowia są groźne, ale pełne możliwości.

## Sceny
- [x] Odprawa u [[Nadzorczyni Silver Quill]]
- [x] Otwarcie wrót, pierwszy widok na Pustkowia
- [ ] Atak [[Bloatsprite|bloatsprite'ów]] w tunelu (2–3 sztuki)
- [ ] Spotkanie z [[Rusty Bolt]] na drodze

## Spotkania / walki
| Kto | Ile | Uwagi |
|---|---|---|
| [[Bloatsprite]] | 3 | ucieka, gdy zostanie jeden |

Szybkie rzuty: [[r:k100|Losowe spotkanie]] · [[r:2k6|Nastrój Rusty'ego]]

## Łupy i nagrody
- 25 kapsli, [[Pip-Buck]] dla każdego

## Co się faktycznie wydarzyło
`, { parent: camp.id, tags: ['akt1'] });

  mk('sesja', 'Sesja 2 — Posterunek', `## Cel sesji
Wprowadzić [[Posterunek Kamienne Kopyto]] i konflikt z [[Łowcy niewolników z Fillydelphii]].

## Sceny
- [ ] Przybycie na posterunek
- [ ] Targ u [[Rusty Bolt]]
- [ ] Nocny napad łowców niewolników
`, { parent: camp.id, tags: ['akt2'] });

  const stable = mk('lokacja', 'Stajnia 42', `## Pierwsze wrażenie
> Stalowe korytarze pachną olejem i chłodną mgiełką z oczyszczaczy powietrza. Wszędzie ten sam niebiesko-żółty kolor.

## Co tu jest
- Atrium i biuro [[Nadzorczyni Silver Quill]]
- Hydroponika, reaktor, sala kinowa
- Wielkie wrota w kształcie koła zębatego

## Sekrety
- Zamknięty sektor C → [[Sekret Stajni 42]]`, { tags: ['stajnia'] });

  mk('lokacja', 'Posterunek Kamienne Kopyto', `Osada handlowa pół dnia drogi od [[Stajnia 42|Stajni]].

## Mieszkańcy / zagrożenia
- Handlarz [[Rusty Bolt]]
- Patrole [[Stalowi Strażnicy|Stalowych Strażników]] przechodzą tędy raz w tygodniu
- Zwiadowcy [[Łowcy niewolników z Fillydelphii|łowców niewolników]] obserwują osadę

## Łupy
- Sklep Rusty'ego: amunicja, leki, stare [[Pip-Buck|Pip-Bucki]] na części`, { tags: ['osada'] });

  mk('npc', 'Nadzorczyni Silver Quill', `**Rasa:** jednorożec
**Rola:** zarządczyni Stajni 42 (Overmare)

## Wygląd i zachowanie
Siwa grzywa, okulary, zawsze z notatnikiem. Mówi spokojnie, ale nie znosi sprzeciwu.

## Czego chce
Utrzymać porządek w [[Stajnia 42|Stajni]] i nie dopuścić, by wyszedł na jaw [[Sekret Stajni 42]].

## Co wie
- Zna część prawdy o sektorze C
- Wie, że [[Stalowi Strażnicy]] kiedyś pukali do wrót`, { parent: stable.id, tags: ['stajnia'], stats: S(3, 6, 4, 7, 8, 4, 5, 25, 7, 0, 8) });

  mk('npc', 'Rusty Bolt', `**Rasa:** kucyk ziemski
**Rola:** wędrowny handlarz

## Wygląd i zachowanie
Rdzawa sierść, wóz pełen złomu i dwie kozy juczne. Targuje się o każdy kapsel.

## Czego chce
Zarobić, przeżyć i nie wchodzić w drogę [[Łowcy niewolników z Fillydelphii|łowcom niewolników]].

## Co wie
- Plotki o znaku [[Stajnia 42|Stajni 42]] na zbroi Strażnika
- Gdzie łowcy mają kryjówkę (za odpowiednią cenę)

Atak: [[r:2k6+2|Strzelba myśliwska]]`, { tags: ['handel', 'sojusznik'], stats: S(5, 6, 6, 7, 5, 5, 7, 32, 8, 2, 11) });

  mk('frakcja', 'Stalowi Strażnicy', `Zakon kucyków w pancerzach wspomaganych, zbierający przedwojenną technologię.

## Cele
Zabezpieczyć technologię [[Stajnia 42|Stajni 42]].

## Stosunek do graczy
Neutralny, dopóki gracze nie mają czegoś, czego Strażnicy chcą.

## Postępy planów
- [ ] Zwiad w okolicy Stajni
- [ ] Propozycja „ochrony” dla [[Posterunek Kamienne Kopyto|posterunku]]
- [ ] Siłowe przejęcie, jeśli negocjacje zawiodą`, { tags: ['frakcja'] });

  mk('frakcja', 'Łowcy niewolników z Fillydelphii', `Bezwzględna banda łapiąca kucyki na sprzedaż.

## Cele
Pojmać „czyste” kucyki ze Stajni — są cenne na targach.

## Przywódcy
- Herszt Brimstone (jeszcze bez wpisu — kliknij, aby go utworzyć: [[Herszt Brimstone]])`, { tags: ['wróg'] });

  mk('stwor', 'Bloatsprite', `Zmutowany, napuchnięty i latający kuzyn parasprite'a. Atakuje w chmarach.

## Ataki
- Ugryzienie: [[r:1k6|obrażenia]]

## Taktyka
Nadlatuje z góry, ucieka, gdy zostanie sam.

Zasady walki: [[str:1|strona z podręcznika (ustaw właściwą)]]`, { tags: ['pustkowia'], stats: [['HP', '10'], ['AP', '6'], ['DT', '0'], ['Sekwencja', '12']] });

  mk('przedmiot', 'Pip-Buck', `Naręczny komputer każdego mieszkańca Stajni: mapa, radio, licznik promieniowania, inwentarz.

Szczegóły działania według podręcznika: [[str:1]] (podmień numer strony).`, { tags: ['sprzęt'] });

  mk('gracz', 'Przykładowa postać gracza', `**Gracz:** Ania
**Rasa:** pegaz
**Znaczek:** kompas

## Wątki osobiste
- Szuka zaginionej siostry, która wyszła ze [[Stajnia 42|Stajni]] w tajemnicy`, { stats: S(4, 7, 5, 6, 5, 8, 6, 28, 9, 0, 12) });

  mk('zasada', 'Ściąga MG', `Uzupełnij własnymi skrótami zasad z podręcznika i dodaj numery stron, aby jednym kliknięciem otwierać PDF.

## Testy
- Test umiejętności: … ([[str:1]])
- Trudności i modyfikatory: …

## Walka
- Kolejność tur: …
- Punkty akcji: …
- Trafienia krytyczne: …

## Przydatne tabele
| Co | Strona |
|---|---|
| Rasy | [[str:1]] |
| Umiejętności | [[str:1]] |
| Ekwipunek | [[str:1]] |`, { pinned: true, tags: ['zasady'] });

  d.notes = '';
  d.bookmarks = [{ page: 1, label: 'Początek' }];
  s1.viewed = now();
  return d;
}

// ---------- zdarzenia ----------
function bind() {
  $('#btn-back').onclick = back;
  $('#btn-fwd').onclick = fwd;
  $('#btn-home').onclick = () => go({ name: 'home' });
  $('#btn-switch').onclick = openSwitcher;
  $('#btn-tools').onclick = () => toggleTools();
  $('#btn-new').onclick = () => askTypeThen('', type => startNew({ type }));
  $('#btn-export').onclick = exportJson;
  $('#btn-import').onclick = () => $('#import-file').click();
  $('#import-file').onchange = ev => { if (ev.target.files[0]) importJson(ev.target.files[0]); ev.target.value = ''; };
  $('#search').addEventListener('input', renderTree);

  // Kliknięcia w całym dokumencie: linki, tagi, przyciski wpisu.
  document.addEventListener('click', ev => {
    const t = ev.target;
    if (t.closest('#modal') && t.id === 'modal') { closeModal(); return; }
    const add = t.closest('[data-add]');
    if (add) { ev.stopPropagation(); startNew({ type: add.dataset.add }); return; }
    const gh = t.closest('.group-head');
    if (gh) {
      const type = gh.parentElement.dataset.type;
      db.ui.collapsed[type] = !db.ui.collapsed[type];
      save(); renderTree(); return;
    }
    const a = t.closest('[data-id]');
    if (a && !t.closest('#modal') && !(t.closest('#cb-list') && !t.closest('a'))) { ev.preventDefault(); openEntry(a.dataset.id); return; }
    const miss = t.closest('a.wl.missing');
    if (miss) { const title = miss.dataset.new; askTypeThen(title, type => startNew({ title, type })); return; }
    const bk = t.closest('a.wl.book');
    if (bk) { openBook(bk.dataset.page); return; }
    const rl = t.closest('a.wl.roll');
    if (rl) {
      showTab('dice');
      const e = view.name === 'entry' ? db.entries[view.id] : null;
      rollExpr(rl.dataset.roll, [e && e.title, rl.dataset.label].filter(Boolean).join(': '));
      return;
    }
    const tag = t.closest('a.tag');
    if (tag) { $('#search').value = '#' + tag.dataset.tag.toLowerCase(); renderTree(); $('#search').focus(); return; }
    const goH = t.closest('[data-go="home"]');
    if (goH) { go({ name: 'home' }); return; }
    const nt = t.closest('[data-new-type]');
    if (nt) { startNew({ type: nt.dataset.newType }); return; }
  });

  // Główny obszar: akcje wpisu, checkboxy, edytor, pulpit.
  const main = $('#main');
  main.addEventListener('click', ev => {
    const t = ev.target;
    if (t.matches('#entry-body input[type=checkbox]')) { ev.preventDefault(); toggleTask(+t.dataset.line); return; }
    const act = t.closest('[data-act]');
    if (act && view.name === 'entry') {
      const e = db.entries[view.id];
      switch (act.dataset.act) {
        case 'edit': editing = { id: e.id, isNew: false }; render(); $('#body-input').focus(); break;
        case 'fight':
          addCombatant({ name: e.title, init: stat(e, INIT_KEYS), hp: stat(e, HP_KEYS), entryId: e.id });
          showTab('combat'); toast('Dodano do walki: ' + e.title); break;
        case 'child': askTypeThen('', type => startNew({ type, parent: e.id })); break;
        case 'pin': e.pinned = !e.pinned; save(); render(); break;
        case 'dup': {
          const c = createEntry({ title: uniqueTitle(e.title), type: e.type, parent: e.parent, body: e.body, stats: e.stats && e.stats.map(r => [...r]) });
          c.tags = [...e.tags]; save(); openEntry(c.id); toast('Utworzono kopię.'); break;
        }
        case 'del': deleteEntry(e); break;
      }
      return;
    }
    if (t.id === 'ed-save') saveEditor();
    else if (t.id === 'ed-cancel') cancelEditor();
    else if (t.id === 'ed-tpl') {
      const ta = $('#body-input');
      const tpl = TYPE[$('#f-type').value].tpl;
      if (!tpl) { toast('Ten typ nie ma szablonu.'); return; }
      ta.value = ta.value.trim() ? ta.value.replace(/\s*$/, '\n\n') + tpl : tpl;
      updatePreview();
    } else if (t.id === 'stat-add') {
      t.insertAdjacentHTML('beforebegin', statRowHtml('', ''));
      t.previousElementSibling.querySelector('.k').focus();
    } else if (t.matches('.stat-row .rm')) t.closest('.stat-row').remove();
    else if (t.closest('.ac [data-i]')) acceptAC(+t.closest('.ac [data-i]').dataset.i);
    else if (t.id === 'load-sample') {
      if (!confirm('Wczytać przykładową kampanię? Obecne dane zostaną ZASTĄPIONE (zrób najpierw eksport, jeśli ich potrzebujesz).')) return;
      db = Object.assign(seed(), { ui: db.ui }); save(true); applyUi(); go({ name: 'home' });
    } else if (t.id === 'wipe') {
      if (!confirm('Utworzyć nową, pustą kampanię? WSZYSTKIE obecne wpisy zostaną usunięte (zrób najpierw eksport!).')) return;
      db = Object.assign(emptyDb(), { ui: db.ui }); save(true); applyUi(); hist = []; hpos = -1; go({ name: 'home' });
    }
  });
  main.addEventListener('change', ev => {
    const t = ev.target;
    if (t.id === 'f-hasstats') $('#stats-wrap').hidden = !t.checked;
    else if (t.id === 'ed-preview') {
      db.ui.preview = t.checked; save();
      $('.editor-split').classList.toggle('no-preview', !t.checked); updatePreview();
    } else if (t.id === 'f-type') {
      const ty = TYPE[t.value];
      if (ty.stats && !$('#f-hasstats').checked) { $('#f-hasstats').checked = true; $('#stats-wrap').hidden = false; }
      const ta = $('#body-input');
      const oldTpl = TYPES.find(x => x.tpl === ta.value);
      if (!ta.value.trim() || oldTpl) { ta.value = ty.tpl; updatePreview(); }
    } else if (t.id === 'theme-select') { db.ui.theme = t.value; applyTheme(); save(); }
    else if (t.id === 'campaign-name') { db.campaign = t.value.trim() || 'Moja kampania'; save(); }
  });
  main.addEventListener('input', ev => {
    if (ev.target.id === 'body-input') { updatePreview(); checkAC(); }
  });
  main.addEventListener('keydown', ev => {
    if (ev.target.id !== 'body-input') return;
    const box = $('#ac');
    if (box && !box.hidden) {
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ac.sel = (ac.sel + (ev.key === 'ArrowDown' ? 1 : -1) + ac.items.length) % ac.items.length;
        $$('#ac div').forEach((d, i) => d.classList.toggle('sel', i === ac.sel));
        ev.preventDefault();
      } else if (ev.key === 'Enter' || ev.key === 'Tab') { acceptAC(ac.sel); ev.preventDefault(); }
      else if (ev.key === 'Escape') { box.hidden = true; ev.stopPropagation(); ev.preventDefault(); }
    } else if (ev.key === 'Tab') {
      // Tab wstawia wcięcie (przydatne dla list zagnieżdżonych).
      ev.preventDefault();
      const ta = ev.target, s = ta.selectionStart;
      ta.setRangeText('  ', s, ta.selectionEnd, 'end');
    }
  });

  // Globalne skróty klawiszowe.
  document.addEventListener('keydown', ev => {
    const inField = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    const mod = ev.ctrlKey || ev.metaKey;
    if (mod && ev.key.toLowerCase() === 'k') { ev.preventDefault(); openSwitcher(); return; }
    if (mod && ev.shiftKey && ev.key.toLowerCase() === 'n') { ev.preventDefault(); askTypeThen('', type => startNew({ type })); return; }
    if (mod && ev.key.toLowerCase() === 's') { ev.preventDefault(); if (editing) saveEditor(); else save(true); return; }
    if (mod && ev.key === 'Enter' && !editing) { ev.preventDefault(); nextTurn(); return; }
    if (ev.key === 'Escape') {
      if (!$('#modal').hidden) { closeModal(); return; }
      if (editing) { cancelEditor(); return; }
    }
    if (ev.altKey && ev.key === 'ArrowLeft') { ev.preventDefault(); back(); return; }
    if (ev.altKey && ev.key === 'ArrowRight') { ev.preventDefault(); fwd(); return; }
    if (!inField && !mod && !ev.altKey && $('#modal').hidden) {
      if (ev.key === 'e' && view.name === 'entry' && !editing) { ev.preventDefault(); editing = { id: view.id, isNew: false }; render(); $('#body-input').focus(); }
      else if (ev.key === '/') { ev.preventDefault(); $('#search').focus(); }
    }
  });
  window.addEventListener('beforeunload', ev => {
    save(true);
    if (editing && isEditorDirty(db.entries[editing.id])) { ev.preventDefault(); ev.returnValue = ''; }
  });

  // Narzędzia: zakładki.
  $$('.tabs button').forEach(b => { b.onclick = () => showTab(b.dataset.tab); });

  // Kości.
  $$('.dice-buttons button').forEach(b => { b.onclick = () => rollExpr('1d' + b.dataset.die); });
  $('#dice-form').onsubmit = ev => { ev.preventDefault(); const v = $('#dice-expr').value.trim(); if (v) rollExpr(v); };
  $('#skill-form').onsubmit = ev => {
    ev.preventDefault();
    const v = parseInt($('#skill-target').value, 10);
    if (v > 0) skillTest(v); else toast('Podaj wartość umiejętności w %.');
  };

  // Walka.
  $('#cb-add').onsubmit = ev => {
    ev.preventDefault();
    const f = ev.target;
    addCombatant({ name: f.name.value.trim(), init: f.init.value, hp: f.hp.value });
    f.reset(); f.name.focus();
  };
  $('#cb-next').onclick = nextTurn;
  $('#cb-sort').onclick = sortCombat;
  $('#cb-reset').onclick = () => {
    if (db.combat.list.length && !confirm('Zakończyć walkę i wyczyścić listę?')) return;
    db.combat = { round: 1, turn: 0, list: [] }; save(); renderCombat();
  };
  $('#cb-list').addEventListener('click', ev => {
    if (ev.target.dataset.f !== 'rm') return;
    const id = ev.target.closest('li').dataset.id;
    const idx = db.combat.list.findIndex(x => x.id === id);
    db.combat.list.splice(idx, 1);
    if (db.combat.turn > idx || db.combat.turn >= db.combat.list.length) db.combat.turn = Math.max(0, db.combat.turn - 1);
    save(); renderCombat();
  });
  $('#cb-list').addEventListener('keydown', ev => {
    if (ev.key !== 'Enter') return;
    const li = ev.target.closest('li');
    const c = db.combat.list.find(x => x.id === li.dataset.id);
    const f = ev.target.dataset.f;
    if (f === 'dmg') {
      const raw = ev.target.value.trim();
      const n = parseInt(raw, 10);
      if (isNaN(n)) return;
      if (/^[+-]/.test(raw)) {
        c.hp = (c.hp ?? 0) + n;
        if (c.max === null) c.max = Math.max(c.hp, 0);
      } else { c.hp = n; if (c.max === null || n > c.max) c.max = n; }
      save(); renderCombat();
      $(`#cb-list li[data-id="${c.id}"] [data-f="dmg"]`)?.focus();
    } else ev.target.blur();
  });
  $('#cb-list').addEventListener('change', ev => {
    const li = ev.target.closest('li');
    const c = db.combat.list.find(x => x.id === li.dataset.id);
    if (ev.target.dataset.f === 'init') { c.init = parseInt(ev.target.value, 10) || 0; save(); }
    if (ev.target.dataset.f === 'note') { c.note = ev.target.value; save(); }
  });

  // Notatki.
  $('#session-notes').addEventListener('input', ev => { db.notes = ev.target.value; save(); });
  $('#notes-clear').onclick = () => {
    if (db.notes && !confirm('Wyczyścić brudnopis?')) return;
    db.notes = ''; $('#session-notes').value = ''; save();
  };
  $('#notes-to-entry').onclick = () => {
    if (!db.notes.trim()) { toast('Brudnopis jest pusty.'); return; }
    const title = uniqueTitle('Notatki z sesji ' + new Date().toLocaleDateString('pl'));
    const e = createEntry({ title, type: 'sesja', body: db.notes });
    save(); openEntry(e.id);
    toast('Utworzono wpis. Brudnopis możesz teraz wyczyścić.');
  };

  // Podręcznik.
  $('#book-load').onclick = () => $('#book-file').click();
  $('#book-file').onchange = async ev => {
    const f = ev.target.files[0];
    ev.target.value = '';
    if (!f) return;
    setBook(f);
    try { await idbPut('rulebook', f); toast('Podręcznik wczytany i zapamiętany.'); }
    catch (err) { console.error(err); toast('Podręcznik wczytany, ale przeglądarka nie pozwoliła go zapamiętać — przy następnym uruchomieniu wczytaj go ponownie.', 5000); }
  };
  $('#book-go').onclick = () => { const p = parseInt($('#book-page').value, 10); if (p > 0) openBook(p); };
  $('#book-page').addEventListener('keydown', ev => { if (ev.key === 'Enter') $('#book-go').click(); });
  $('#book-mark').onclick = () => {
    const p = parseInt($('#book-page').value, 10);
    if (!(p > 0)) { toast('Wpisz numer strony w polu „str.”, a potem kliknij ★.'); $('#book-page').focus(); return; }
    const label = prompt('Nazwa zakładki (np. Walka, Rasy, Tabela krytyków):', 'Strona ' + p);
    if (!label) return;
    db.bookmarks.push({ page: p, label });
    db.bookmarks.sort((a, b) => a.page - b.page);
    save(); renderBookmarks();
  };
  $('#book-marks').addEventListener('click', ev => {
    const rm = ev.target.closest('[data-rm]');
    if (rm) { db.bookmarks.splice(+rm.dataset.rm, 1); save(); renderBookmarks(); return; }
    const bm = ev.target.closest('.bm');
    if (bm) openBook(bm.dataset.page);
  });
  $('#book-wide').onclick = () => {
    setRightWidth(db.ui.rightW < window.innerWidth * 0.45 ? window.innerWidth * 0.55 : 380);
    save();
  };

  // Zmiana szerokości panelu narzędzi.
  const div = $('#divider');
  div.addEventListener('mousedown', ev => {
    ev.preventDefault();
    div.classList.add('drag');
    document.body.classList.add('dragging');
    const move = e => setRightWidth(window.innerWidth - e.clientX);
    const up = () => {
      div.classList.remove('drag');
      document.body.classList.remove('dragging');
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      save();
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });
}

// ---------- start ----------
(function init() {
  db = load();
  if (!db) { db = seed(); save(true); }
  bind();
  applyUi();
  go({ name: 'home' });
  idbGet('rulebook').then(b => { if (b) setBook(b); }).catch(err => console.warn('IndexedDB niedostępne:', err));
})();
