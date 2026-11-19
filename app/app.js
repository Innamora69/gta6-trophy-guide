// GTA VI Trophy Guide & Tracker — a static, offline checklist over app/data/trophies.json.
// Progress lives in localStorage under 'gta6-trophy-checklist' (trophy ids) and the spoiler
// setting under 'gta6-trophy-spoilers'. Nothing is fetched from the network: the only fetch
// is the local data file, and source links open only when the reader clicks them.
const CHECKLIST_KEY = 'gta6-trophy-checklist';
const SPOILER_KEY = 'gta6-trophy-spoilers';
const DEMO_IDS = [2, 3, 8, 15, 16, 17, 21, 32, 35, 42, 52, 53];

const params = new URLSearchParams(location.search);
const demoMode = params.get('demo') === '1';
const demoSet = new Set(demoMode ? DEMO_IDS : []);

const KIND_LABELS = [
  ['all', 'All'], ['story', 'Story'], ['missable', 'Missable'],
  ['collectibles', 'Collectibles'], ['activities', 'Activities'],
  ['robbery', 'Robberies'], ['side', 'Side quests'], ['other', 'Other'],
  ['online', 'Online'],
];
const KIND_NAMES = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', robbery: 'Robbery', side: 'Side quest', other: 'Other' };

const cardsEl = document.getElementById('cards');
const emptyEl = document.getElementById('emptyMsg');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoilers');
const chipsEl = document.getElementById('kindChips');
const detailEl = document.getElementById('detail');
const detailBody = document.getElementById('detailBody');

let trophies = [];
let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(CHECKLIST_KEY) ?? '[]'));
} catch { earned = new Set(); }
let spoilers = localStorage.getItem(SPOILER_KEY) === 'on';
if (params.get('spoilers') === 'on') spoilers = true;
let kindFilter = 'all';
if (params.get('kind') && KIND_LABELS.some(([v]) => v === params.get('kind'))) kindFilter = params.get('kind');

function isEarned(t) { return earned.has(t.id) || demoSet.has(t.id); }
// Spoiler mode hides the 12 hidden story trophies until they are earned.
function isHiddenBySpoiler(t) { return spoilers && t.kind === 'story' && !isEarned(t); }

function save() {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeCount(grade) {
  return trophies.filter((t) => t.grade === grade && isEarned(t)).length;
}

function updateProgress() {
  const total = trophies.length;
  const got = trophies.filter(isEarned).length;
  document.getElementById('progressCount').textContent = `${got} / ${total}`;
  document.getElementById('toolbarProgress').textContent = `${got} / ${total} earned`;
  document.getElementById('progressPct').textContent = total ? `${Math.round((got / total) * 100)}% earned` : '';
  const bar = document.getElementById('progressBar');
  bar.style.width = total ? `${(got / total) * 100}%` : '0%';
  document.getElementById('progressBarWrap').setAttribute('aria-valuenow', String(got));
  document.getElementById('gradeCounts').innerHTML = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `<li><b>${gradeCount(g)}</b> / ${trophies.filter((t) => t.grade === g).length} ${g}</li>`)
    .join('');
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kindFilter === 'online') return false;
    if (kindFilter === 'missable' && !t.missable) return false;
    if (kindFilter !== 'all' && kindFilter !== 'missable' && t.kind !== kindFilter) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function cardFor(t) {
  const hidden = isHiddenBySpoiler(t);
  const card = document.createElement('article');
  card.className = 'card' + (isEarned(t) ? ' earned' : '');
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', hidden ? 'Hidden trophy' : t.name);

  const top = document.createElement('div');
  top.className = 'card-top';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned(t);
  box.setAttribute('aria-label', `Mark ${hidden ? 'hidden trophy' : t.name} as earned`);
  box.addEventListener('click', (e) => e.stopPropagation());
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    save();
    render();
  });
  const title = document.createElement('h3');
  title.textContent = hidden ? 'Hidden trophy' : t.name;
  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = t.grade;
  top.append(box, title, badge);

  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = hidden ? 'Hidden trophy — earn it to reveal.' : t.description;

  const flags = document.createElement('div');
  flags.className = 'flags';
  const kindFlag = document.createElement('span');
  kindFlag.className = 'flag';
  kindFlag.textContent = KIND_NAMES[t.kind] ?? t.kind;
  flags.append(kindFlag);
  if (t.hidden) {
    const f = document.createElement('span');
    f.className = 'flag hidden-flag';
    f.textContent = 'Hidden on PS5';
    flags.append(f);
  }
  if (t.missable) {
    const f = document.createElement('span');
    f.className = 'flag missable';
    f.textContent = '⚠ Missable';
    flags.append(f);
  }
  if (t.count != null) {
    const f = document.createElement('span');
    f.className = 'flag count';
    f.textContent = `Target: ${t.count.toLocaleString('en-US')}`;
    flags.append(f);
  }
  if (t.chapter) {
    const f = document.createElement('span');
    f.className = 'flag';
    f.textContent = t.chapter;
    flags.append(f);
  }

  const teaser = document.createElement('p');
  teaser.className = 'guide-teaser';
  teaser.textContent = hidden ? 'Spoiler-free mode is on. Tick it earned to reveal this story trophy.' : t.guide;

  card.append(top, desc, flags, teaser);
  const open = () => openDetail(t);
  card.addEventListener('click', open);
  card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  return card;
}

function render() {
  // Rebuild the kind chips so the active one is always marked.
  chipsEl.replaceChildren();
  for (const [value, label] of KIND_LABELS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = label;
    chip.setAttribute('aria-pressed', String(kindFilter === value));
    chip.addEventListener('click', () => { kindFilter = value; render(); });
    chipsEl.append(chip);
  }

  const list = visibleTrophies();
  cardsEl.replaceChildren(...list.map(cardFor));
  if (kindFilter === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'GTA 6 has no online trophies — all 55 trophies are earned in single-player. There is nothing to track here.';
  } else if (list.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No trophies match these filters. Try clearing the search or choosing another kind or grade.';
  } else {
    emptyEl.hidden = true;
  }
  updateProgress();
}

function openDetail(t) {
  const hidden = isHiddenBySpoiler(t);
  detailEl.hidden = false;
  detailBody.replaceChildren();
  const title = document.createElement('h3');
  title.textContent = hidden ? 'Hidden trophy' : t.name;
  detailBody.append(title);
  if (hidden) {
    const p = document.createElement('p');
    p.textContent = 'Hidden trophy — earn it to reveal. Spoiler-free mode hides the 12 hidden story trophies (their names, descriptions and guides) until you tick them earned.';
    detailBody.append(p);
    detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  const meta = document.createElement('p');
  const metaParts = [`Grade: ${t.grade}`, `Kind: ${KIND_NAMES[t.kind] ?? t.kind}`];
  if (t.chapter) metaParts.push(`Chapter: ${t.chapter}`);
  if (t.count != null) metaParts.push(`Target: ${t.count.toLocaleString('en-US')}`);
  if (t.hidden) metaParts.push('Hidden on PS5 until earned');
  meta.textContent = metaParts.join(' · ');
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = `Official description: ${t.description}`;
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  detailBody.append(meta, desc, guide);
  if (t.missable) {
    const warn = document.createElement('p');
    warn.className = 'warning';
    warn.textContent = '⚠ Missable: this is the only trophy in the game that may be missable. In Chapter 1, after “Down to Earth”, follow Lucia to the balcony of Jason’s house in the morning and choose Accept — do it the first time it is offered.';
    detailBody.append(warn);
  }
  const stepsTitle = document.createElement('h4');
  stepsTitle.textContent = 'Steps';
  const steps = document.createElement('ol');
  for (const s of t.steps) {
    const li = document.createElement('li');
    li.textContent = s;
    steps.append(li);
  }
  detailBody.append(stepsTitle, steps);
  const srcTitle = document.createElement('h4');
  srcTitle.textContent = 'Sources';
  const srcList = document.createElement('ul');
  srcList.className = 'sources';
  for (const s of t.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = s.name;
    li.append(a);
    srcList.append(li);
  }
  detailBody.append(srcTitle, srcList);
  detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.getElementById('detailClose').addEventListener('click', () => { detailEl.hidden = true; });
searchEl.addEventListener('input', render);
gradeEl.addEventListener('change', render);
spoilerEl.checked = spoilers;
spoilerEl.addEventListener('change', () => {
  spoilers = spoilerEl.checked;
  localStorage.setItem(SPOILER_KEY, spoilers ? 'on' : 'off');
  render();
});
document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('not a progress file');
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(id)));
    save();
    render();
  } catch {
    alert('That file is not a valid trophy progress export.');
  }
  e.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies? This cannot be undone.')) {
    earned.clear();
    save();
    render();
  }
});

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
render();

// URL parameters are for screenshots and deep links only; they never change stored progress.
if (params.get('trophy')) {
  const t = trophies.find((x) => String(x.id) === params.get('trophy'));
  if (t) openDetail(t);
}
if (params.get('view') === 'roadmap') {
  document.getElementById('roadmap').scrollIntoView();
}
