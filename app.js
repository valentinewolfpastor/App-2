'use strict';

/* =========================================================
   Daily Habits — a small, offline-first habit tracker.
   All data lives in this browser's localStorage.
   ========================================================= */

const STORE_KEY = 'daily-habits.v1';

// Schedules: { type: 'daily' } | { type: 'weekdays' } | { type: 'weekly', times: n }
const DEFAULT_HABITS = [
  { id: 'workout',      icon: '🏋️', name: 'Work out',                     schedule: { type: 'daily' } },
  { id: 'run',          icon: '🏃', name: 'Go for a run',                  schedule: { type: 'weekly', times: 1 } },
  { id: 'supplements',  icon: '💊', name: 'Wellbel & supplements',         schedule: { type: 'daily' } },
  { id: 'electrolytes', icon: '💧', name: 'Drink electrolytes',            schedule: { type: 'daily' } },
  { id: 'no-sugar',     icon: '🍬', name: 'No sugar',                      schedule: { type: 'weekdays' } },
  { id: 'news',         icon: '📰', name: 'Read the news / news podcast',  schedule: { type: 'daily' } },
  { id: 'no-snacking',  icon: '🚫', name: 'No snacking',                   schedule: { type: 'daily' } },
  { id: 'meditate',     icon: '🧘', name: 'Meditate 10 min',               schedule: { type: 'daily' } },
  { id: 'stretch',      icon: '🤸', name: 'Stretch 15 min',                schedule: { type: 'daily' } },
  { id: 'vibration',    icon: '📳', name: 'Vibration plate',               schedule: { type: 'daily' } },
];

// Optional extras, offered on the Habits tab. Not active until added.
const SUGGESTIONS = [
  { id: 's-water',    icon: '🚰', name: 'Drink 8 glasses of water',     schedule: { type: 'daily' },    why: 'Pairs well with electrolytes for all-day hydration.' },
  { id: 's-sleep',    icon: '😴', name: 'Sleep 7+ hours',               schedule: { type: 'daily' },    why: 'Recovery is where workouts actually pay off.' },
  { id: 's-steps',    icon: '👟', name: 'Walk 8,000+ steps',            schedule: { type: 'daily' },    why: 'Easy movement on non-workout days.' },
  { id: 's-protein',  icon: '🥚', name: 'Hit my protein goal',          schedule: { type: 'daily' },    why: 'Supports muscle from your workouts and curbs snacking.' },
  { id: 's-sun',      icon: '☀️', name: 'Morning sunlight 10 min',      schedule: { type: 'daily' },    why: 'Helps your energy and sleep rhythm.' },
  { id: 's-screens',  icon: '📵', name: 'No screens 30 min before bed', schedule: { type: 'daily' },    why: 'A simple wind-down that improves sleep.' },
  { id: 's-book',     icon: '📖', name: 'Read a book 20 min',           schedule: { type: 'daily' },    why: 'Balances news time with something slower.' },
  { id: 's-journal',  icon: '✍️', name: 'Journal / 3 gratitudes',       schedule: { type: 'daily' },    why: 'Two minutes; pairs nicely with meditation.' },
  { id: 's-alcohol',  icon: '🍷', name: 'No alcohol on weeknights',     schedule: { type: 'weekdays' }, why: 'Goes hand-in-hand with no sugar in the workweek.' },
  { id: 's-mobility', icon: '🧗', name: 'Strength or mobility class',   schedule: { type: 'weekly', times: 2 }, why: 'A set target per week instead of every day.' },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ---------------- Dates (local time, keyed YYYY-MM-DD) ---------------- */

const pad = (n) => String(n).padStart(2, '0');
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const today = () => startOfDay(new Date());
const sameDay = (a, b) => dateKey(a) === dateKey(b);
const weekStart = (d) => addDays(startOfDay(d), -((d.getDay() + 6) % 7)); // Monday
const isWeekday = (d) => d.getDay() >= 1 && d.getDay() <= 5;

/* ---------------- State ---------------- */

function freshState() {
  return {
    habits: DEFAULT_HABITS.map((h) => structuredClone(h)),
    log: {},
    created: dateKey(today()),
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && Array.isArray(s.habits) && s.log && typeof s.log === 'object') {
        s.created ||= dateKey(today());
        return s;
      }
    }
  } catch (_) { /* storage unavailable or corrupt: start fresh */ }
  return freshState();
}

let storageWarned = false;
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (_) {
    if (!storageWarned) { toast('Heads up: this browser is not saving data.'); storageWarned = true; }
  }
}

let state = load();
let view = 'today';
let cursor = today();               // day shown on Today
let weekCursor = weekStart(today()); // week shown on Progress

/* ---------------- Habit logic ---------------- */

const isDone = (h, d) => !!state.log[dateKey(d)]?.[h.id];

function setDone(h, d, value) {
  const k = dateKey(d);
  const day = state.log[k] || (state.log[k] = {});
  if (value) day[h.id] = true; else delete day[h.id];
  if (!Object.keys(day).length) delete state.log[k];
  save();
}

function isScheduled(h, d) {
  if (h.schedule.type === 'weekdays') return isWeekday(d);
  return true; // daily, and weekly habits can be done any day
}

function weekCount(h, d) {
  const ws = weekStart(d);
  let n = 0;
  for (let i = 0; i < 7; i++) if (isDone(h, addDays(ws, i))) n++;
  return n;
}

function scheduleLabel(s) {
  if (s.type === 'weekdays') return 'Weekdays';
  if (s.type === 'weekly') return s.times === 1 ? 'Once a week' : `${s.times}× a week`;
  return 'Every day';
}

function earliestDate() {
  let min = state.created;
  for (const k of Object.keys(state.log)) if (k < min) min = k;
  return parseKey(min);
}

/** Current streak, in days (daily/weekdays) or weeks (weekly). */
function currentStreak(h) {
  const t = today();
  const start = earliestDate();
  if (h.schedule.type === 'weekly') {
    let ws = weekStart(t);
    let n = 0;
    // This week only counts once the goal is met; an unfinished week doesn't break the streak.
    if (weekCount(h, ws) >= h.schedule.times) n++;
    ws = addDays(ws, -7);
    while (ws >= weekStart(start) && weekCount(h, ws) >= h.schedule.times) { n++; ws = addDays(ws, -7); }
    return n;
  }
  let d = t;
  // Not having done it *yet* today doesn't break the streak.
  if (!isDone(h, d)) d = addDays(d, -1);
  let n = 0;
  while (d >= start) {
    if (isScheduled(h, d)) {
      if (!isDone(h, d)) break;
      n++;
    }
    d = addDays(d, -1);
  }
  return n;
}

function bestStreak(h) {
  const t = today();
  const start = earliestDate();
  let best = 0, run = 0;
  if (h.schedule.type === 'weekly') {
    for (let ws = weekStart(start); ws <= t; ws = addDays(ws, 7)) {
      if (weekCount(h, ws) >= h.schedule.times) best = Math.max(best, ++run);
      else if (!sameDay(ws, weekStart(t))) run = 0;
    }
    return best;
  }
  for (let d = start; d <= t; d = addDays(d, 1)) {
    if (!isScheduled(h, d)) continue;
    if (isDone(h, d)) best = Math.max(best, ++run);
    else if (!sameDay(d, t)) run = 0;
  }
  return best;
}

/** Share of the last 30 days (or last 4 weeks for weekly habits) that were hit. */
function recentRate(h) {
  const t = today();
  const start = earliestDate();
  if (h.schedule.type === 'weekly') {
    let hit = 0, total = 0;
    for (let i = 0; i < 4; i++) {
      const ws = addDays(weekStart(t), -7 * i);
      if (addDays(ws, 6) < start) break;
      const met = weekCount(h, ws) >= h.schedule.times;
      if (i === 0 && !met) continue; // current week still in progress
      total++; if (met) hit++;
    }
    return total ? hit / total : null;
  }
  let hit = 0, total = 0;
  for (let i = 0; i < 30; i++) {
    const d = addDays(t, -i);
    if (d < start) break;
    if (!isScheduled(h, d)) continue;
    if (i === 0 && !isDone(h, d)) continue; // today still in progress
    total++; if (isDone(h, d)) hit++;
  }
  return total ? hit / total : null;
}

/* ---------------- Rendering helpers ---------------- */

const app = document.getElementById('app');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function fmtDate(d, opts) { return d.toLocaleDateString(undefined, opts); }

function ring(fraction) {
  const r = 26, c = 2 * Math.PI * r;
  return `<svg class="ring" viewBox="0 0 64 64" aria-hidden="true">
    <circle class="track" cx="32" cy="32" r="${r}"/>
    <circle class="bar" cx="32" cy="32" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - fraction)}"/>
  </svg>`;
}

function streakText(h) {
  const n = currentStreak(h);
  if (!n) return '';
  const unit = h.schedule.type === 'weekly' ? (n === 1 ? 'week' : 'weeks') : (n === 1 ? 'day' : 'days');
  return ` · <span class="flame">🔥 ${n} ${unit}</span>`;
}

/* ---------------- Today ---------------- */

function renderToday() {
  const d = cursor;
  const isToday = sameDay(d, today());
  const habits = state.habits;
  const on = habits.filter((h) => isScheduled(h, d));
  const off = habits.filter((h) => !isScheduled(h, d));

  const complete = (h) => isDone(h, d) || (h.schedule.type === 'weekly' && weekCount(h, d) >= h.schedule.times);
  const doneCount = on.filter(complete).length;
  const total = on.length;
  const left = total - doneCount;

  let message;
  if (!total) message = 'Nothing scheduled.';
  else if (!left) message = isToday ? 'Perfect day — everything’s done! 🎉' : 'Every habit was done this day. 🎉';
  else if (!doneCount) message = isToday ? 'Tap a habit when you’ve done it.' : 'Nothing logged for this day.';
  else message = `${left} to go${isToday ? ' — keep it up!' : '.'}`;

  const title = isToday ? 'Today' : sameDay(d, addDays(today(), -1)) ? 'Yesterday' : fmtDate(d, { weekday: 'long' });

  const row = (h) => {
    const done = isDone(h, d);
    let meta = scheduleLabel(h.schedule);
    let cls = '';
    if (h.schedule.type === 'weekly') {
      const c = weekCount(h, d);
      const met = c >= h.schedule.times;
      meta = `${c} of ${h.schedule.times} this week${met ? ' ✓' : ''}`;
      if (met && !done) cls = 'goal-met';
    }
    if (!isScheduled(h, d)) { cls = 'off'; meta = 'Off today · weekdays only'; }
    return `<li><button type="button" class="habit ${cls}" role="checkbox" aria-checked="${done}" data-toggle="${esc(h.id)}">
      <span class="emoji" aria-hidden="true">${esc(h.icon || '✅')}</span>
      <span class="body"><span class="name">${esc(h.name)}</span><span class="meta">${meta}${isScheduled(h, d) ? streakText(h) : ''}</span></span>
      <span class="check" aria-hidden="true">✓</span>
    </button></li>`;
  };

  app.innerHTML = `
    <header class="day-head">
      <div class="titles">
        <h1>${esc(title)}</h1>
        <p class="sub">${esc(fmtDate(d, { weekday: isToday ? 'long' : undefined, month: 'long', day: 'numeric' }))}
          ${isToday ? '' : ' · <button type="button" class="link-btn" data-action="go-today">Back to today</button>'}</p>
      </div>
      <button type="button" class="icon-btn" data-action="prev-day" aria-label="Previous day">‹</button>
      <button type="button" class="icon-btn" data-action="next-day" aria-label="Next day" ${isToday ? 'disabled' : ''}>›</button>
    </header>

    <section class="summary">
      ${ring(total ? doneCount / total : 0)}
      <div><strong>${doneCount} of ${total} done</strong><span>${message}</span></div>
    </section>

    ${habits.length ? '' : '<p class="empty">No habits yet. Add some on the Habits tab.</p>'}
    ${on.length ? `<h2>Habits</h2><ul class="habit-list">${on.map(row).join('')}</ul>` : ''}
    ${off.length ? `<h2>Rest day</h2><ul class="habit-list">${off.map(row).join('')}</ul>` : ''}
  `;
}

/* ---------------- Progress ---------------- */

function renderProgress() {
  const t = today();
  const ws = weekCursor;
  const days = [...Array(7)].map((_, i) => addDays(ws, i));
  const isThisWeek = sameDay(ws, weekStart(t));
  const rangeLabel = `${fmtDate(days[0], { month: 'short', day: 'numeric' })} – ${fmtDate(days[6], { month: 'short', day: 'numeric' })}`;

  const cell = (h, d) => {
    const done = isDone(h, d);
    const future = d > t;
    const off = !isScheduled(h, d);
    const cls = [done && 'done', off && 'off', future && 'future'].filter(Boolean).join(' ');
    const label = `${h.name}, ${fmtDate(d, { weekday: 'long', month: 'short', day: 'numeric' })}: ${done ? 'done' : off ? 'not scheduled' : 'not done'}`;
    return `<td><button type="button" class="cell ${cls}" ${future ? 'disabled' : ''} data-cell="${esc(h.id)}|${dateKey(d)}" aria-label="${esc(label)}" aria-pressed="${done}">${done ? '✓' : ''}</button></td>`;
  };

  const stat = (h) => {
    const rate = recentRate(h);
    const cur = currentStreak(h);
    const best = bestStreak(h);
    const unit = h.schedule.type === 'weekly' ? 'wk' : 'd';
    const pct = rate === null ? null : Math.round(rate * 100);
    const window = h.schedule.type === 'weekly' ? 'last 4 weeks' : 'last 30 days';
    return `<li class="stat">
      <span class="emoji" aria-hidden="true">${esc(h.icon || '✅')}</span>
      <span>
        <span class="name">${esc(h.name)}</span>
        <span class="meta">${pct === null ? 'No history yet' : `${pct}% · ${window}`} · best ${best}${unit}</span>
        <span class="bar-track"><span class="bar-fill" style="width:${pct ?? 0}%"></span></span>
      </span>
      <span class="streak"><b>${cur}</b><small>${unit === 'wk' ? 'week' : 'day'} streak</small></span>
    </li>`;
  };

  app.innerHTML = `
    <header class="day-head"><div class="titles"><h1>Progress</h1><p class="sub">Tap any square to fix a missed check-in.</p></div></header>

    <section class="card">
      <div class="week-nav">
        <button type="button" class="icon-btn" data-action="prev-week" aria-label="Previous week">‹</button>
        <strong>${isThisWeek ? 'This week' : esc(rangeLabel)}${isThisWeek ? `<br><span class="sub">${esc(rangeLabel)}</span>` : ''}</strong>
        <button type="button" class="icon-btn" data-action="next-week" aria-label="Next week" ${isThisWeek ? 'disabled' : ''}>›</button>
      </div>
      ${state.habits.length ? `
      <table class="grid">
        <thead><tr><th scope="col"></th>${days.map((d, i) => `<th scope="col" class="${sameDay(d, t) ? 'today' : ''}">${DAY_LABELS[i][0]}<br>${d.getDate()}</th>`).join('')}</tr></thead>
        <tbody>${state.habits.map((h) => `<tr><td title="${esc(h.name)}" aria-label="${esc(h.name)}">${esc(h.icon || '✅')}</td>${days.map((d) => cell(h, d)).join('')}</tr>`).join('')}</tbody>
      </table>
      <div class="legend"><span><i class="done"></i>Done</span><span><i></i>Missed</span><span><i class="off"></i>Not scheduled</span></div>
      ` : '<p class="empty">No habits yet.</p>'}
    </section>

    <h2>Streaks &amp; consistency</h2>
    <ul class="stats">${state.habits.map(stat).join('')}</ul>
  `;
}

/* ---------------- Manage ---------------- */

function renderManage() {
  const names = new Set(state.habits.map((h) => h.name.toLowerCase()));
  const ids = new Set(state.habits.map((h) => h.id));
  const suggestions = SUGGESTIONS.filter((s) => !ids.has(s.id) && !names.has(s.name.toLowerCase()));
  const n = state.habits.length;

  app.innerHTML = `
    <header class="day-head"><div class="titles"><h1>Habits</h1><p class="sub">${n} habit${n === 1 ? '' : 's'} you’re tracking</p></div></header>

    <ul class="habit-list">
      ${state.habits.map((h, i) => `<li class="manage-row">
        <span class="emoji" aria-hidden="true">${esc(h.icon || '✅')}</span>
        <span class="body"><span class="name">${esc(h.name)}</span><span class="meta">${scheduleLabel(h.schedule)}</span></span>
        <span class="row-actions">
          <button type="button" class="mini" data-move="${esc(h.id)}|-1" aria-label="Move ${esc(h.name)} up" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" class="mini" data-move="${esc(h.id)}|1" aria-label="Move ${esc(h.name)} down" ${i === n - 1 ? 'disabled' : ''}>↓</button>
          <button type="button" class="mini" data-edit="${esc(h.id)}" aria-label="Edit ${esc(h.name)}">✎</button>
          <button type="button" class="mini danger" data-delete="${esc(h.id)}" aria-label="Delete ${esc(h.name)}">✕</button>
        </span>
      </li>`).join('')}
    </ul>
    <button type="button" class="btn primary full" data-action="add">+ Add a habit</button>

    ${suggestions.length ? `
      <h2>Suggestions</h2>
      <ul class="habit-list">
        ${suggestions.map((s) => `<li class="manage-row suggest-row">
          <span class="emoji" aria-hidden="true">${esc(s.icon)}</span>
          <span class="body"><span class="name">${esc(s.name)}</span><span class="meta">${scheduleLabel(s.schedule)}</span><span class="why">${esc(s.why)}</span></span>
          <button type="button" class="btn small" data-suggest="${esc(s.id)}">Add</button>
        </li>`).join('')}
      </ul>` : ''}

    <h2>Your data</h2>
    <section class="card">
      <p class="sub" style="margin:0 0 12px">Everything is stored on this device only. Export a backup to move it to another device.</p>
      <div class="btn-row">
        <button type="button" class="btn" data-action="export">Export backup</button>
        <button type="button" class="btn" data-action="import">Import backup</button>
        <button type="button" class="btn danger" data-action="reset">Reset everything</button>
      </div>
      <input type="file" id="import-file" accept="application/json,.json" hidden>
    </section>
  `;
}

/* ---------------- Router ---------------- */

function render() {
  if (view === 'progress') renderProgress();
  else if (view === 'manage') renderManage();
  else renderToday();
  document.querySelectorAll('.tab').forEach((b) => {
    if (b.dataset.view === view) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
}

function setView(v) {
  view = v;
  try { sessionStorage.setItem('daily-habits.view', v); } catch (_) {}
  window.scrollTo(0, 0);
  render();
}

/* ---------------- Habit dialog ---------------- */

const dialog = document.getElementById('habit-dialog');
const form = document.getElementById('habit-form');
const timesField = form.querySelector('.times-field');
let editingId = null;

function syncTimesField() { timesField.hidden = form.type.value !== 'weekly'; }
form.type.addEventListener('change', syncTimesField);

function openDialog(h) {
  editingId = h ? h.id : null;
  document.getElementById('dialog-title').textContent = h ? 'Edit habit' : 'Add habit';
  form.name.value = h ? h.name : '';
  form.icon.value = h ? h.icon : '';
  form.type.value = h ? h.schedule.type : 'daily';
  form.times.value = h && h.schedule.type === 'weekly' ? h.schedule.times : 3;
  syncTimesField();
  dialog.showModal();
  if (!h) form.name.focus();
}

document.getElementById('dialog-cancel').addEventListener('click', () => dialog.close());

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  if (!name) return;
  const type = form.type.value;
  const schedule = type === 'weekly'
    ? { type, times: Math.min(7, Math.max(1, parseInt(form.times.value, 10) || 1)) }
    : { type };
  const icon = form.icon.value.trim() || '✅';
  if (editingId) {
    const h = state.habits.find((x) => x.id === editingId);
    if (h) Object.assign(h, { name, icon, schedule });
  } else {
    state.habits.push({ id: `h-${Date.now().toString(36)}`, name, icon, schedule });
  }
  save();
  dialog.close();
  render();
  toast(editingId ? 'Habit updated' : 'Habit added');
});

/* ---------------- Toast ---------------- */

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

/* ---------------- Data import / export ---------------- */

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `habits-backup-${dateKey(today())}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const s = JSON.parse(reader.result);
      if (!s || !Array.isArray(s.habits) || typeof s.log !== 'object') throw new Error('bad shape');
      for (const h of s.habits) {
        if (!h.id || !h.name || !h.schedule || !['daily', 'weekdays', 'weekly'].includes(h.schedule.type)) throw new Error('bad habit');
      }
      if (!confirm('Replace your current habits and history with this backup?')) return;
      state = { habits: s.habits, log: s.log, created: s.created || dateKey(today()) };
      save();
      render();
      toast('Backup imported');
    } catch (_) {
      toast('That file doesn’t look like a habits backup.');
    }
  };
  reader.readAsText(file);
}

/* ---------------- Events ---------------- */

document.querySelector('.tabbar').addEventListener('click', (e) => {
  const b = e.target.closest('.tab');
  if (b) setView(b.dataset.view);
});

app.addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  const find = (id) => state.habits.find((h) => h.id === id);

  if (t.dataset.toggle) {
    const h = find(t.dataset.toggle);
    if (h) { setDone(h, cursor, !isDone(h, cursor)); render(); }
    return;
  }
  if (t.dataset.cell) {
    const [id, k] = t.dataset.cell.split('|');
    const h = find(id);
    if (h) { const d = parseKey(k); setDone(h, d, !isDone(h, d)); render(); }
    return;
  }
  if (t.dataset.move) {
    const [id, dir] = t.dataset.move.split('|');
    const i = state.habits.findIndex((h) => h.id === id);
    const j = i + Number(dir);
    if (i >= 0 && j >= 0 && j < state.habits.length) {
      [state.habits[i], state.habits[j]] = [state.habits[j], state.habits[i]];
      save(); render();
    }
    return;
  }
  if (t.dataset.edit) { openDialog(find(t.dataset.edit)); return; }
  if (t.dataset.delete) {
    const h = find(t.dataset.delete);
    if (h && confirm(`Delete “${h.name}”? Its history will be removed from view.`)) {
      state.habits = state.habits.filter((x) => x.id !== h.id);
      save(); render(); toast('Habit deleted');
    }
    return;
  }
  if (t.dataset.suggest) {
    const s = SUGGESTIONS.find((x) => x.id === t.dataset.suggest);
    if (s) {
      state.habits.push({ id: s.id, name: s.name, icon: s.icon, schedule: structuredClone(s.schedule) });
      save(); render(); toast(`Added “${s.name}”`);
    }
    return;
  }

  switch (t.dataset.action) {
    case 'prev-day': cursor = addDays(cursor, -1); render(); break;
    case 'next-day': if (cursor < today()) { cursor = addDays(cursor, 1); render(); } break;
    case 'go-today': cursor = today(); render(); break;
    case 'prev-week': weekCursor = addDays(weekCursor, -7); render(); break;
    case 'next-week': if (weekCursor < weekStart(today())) { weekCursor = addDays(weekCursor, 7); render(); } break;
    case 'add': openDialog(null); break;
    case 'export': exportData(); break;
    case 'import': document.getElementById('import-file').click(); break;
    case 'reset':
      if (confirm('Delete all habits and history and start over with the default list?')) {
        state = freshState(); save(); render(); toast('Reset to defaults');
      }
      break;
  }
});

app.addEventListener('change', (e) => {
  if (e.target.id === 'import-file' && e.target.files[0]) importData(e.target.files[0]);
});

// Roll over to the new day if the app is left open past midnight.
let lastToday = dateKey(today());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const t = dateKey(today());
  if (t === lastToday) return;
  if (dateKey(cursor) === lastToday) cursor = today();
  if (dateKey(weekCursor) === dateKey(weekStart(parseKey(lastToday)))) weekCursor = weekStart(today());
  lastToday = t;
  render();
});

/* ---------------- Boot ---------------- */

try {
  const v = sessionStorage.getItem('daily-habits.view');
  if (v === 'today' || v === 'progress' || v === 'manage') view = v;
} catch (_) {}

render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
