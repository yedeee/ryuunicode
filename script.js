/* Elements */
const charEl = document.getElementById("char");
const codeEl = document.getElementById("code");
const hexEl = document.getElementById("hex");
const blockEl = document.getElementById("block");
const newBtn = document.getElementById("new");
const favBtn = document.getElementById("favBtn");
const copyBtn = document.getElementById("copyBtn");
const historyList = document.getElementById("historyList");
const favoritesList = document.getElementById("favoritesList");
const panel = document.getElementById("settingsPanel");
const cornerBtn = document.getElementById("cornerBtn");
const content = document.getElementById("content");
const modeToggle = document.getElementById("modeToggle");
const rareToggle = document.getElementById("rareToggle");
const blurOverlay = document.getElementById("blurOverlay");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

let history = [];
let favorites = [];

/* Unicode block table */
let blockTable = [];
let blockTableLoaded = false;

fetch("./blocks.json")
  .then(data => {
    blockTable = data;
    blockTableLoaded = true;
    updateGlyph(); // Only call once the table is ready
  })
  .catch(() => {
    blockEl.textContent = "Block: (unavailable)";
  });

function findBlock(cp) {
  const hex = cp.toString(16).toUpperCase().padStart(4,"0");
  const num = parseInt(hex, 16);

  for (const b of blockTable) {
    const start = parseInt(b.start, 16);
    const end = parseInt(b.end, 16);
    if (num >= start && num <= end) return b.name;
  }
  return "(Unknown Block)";
}

const NORMAL_RANGES = [
  [0x0020,0x024F],[0x0370,0x03FF],[0x0400,0x04FF],
  [0x0590,0x05FF],[0x0600,0x06FF],[0x0900,0x097F],
  [0x0E00,0x0E7F],[0x3040,0x309F],[0x30A0,0x30FF],
  [0xAC00,0xD7AF],[0x2000,0x206F],[0x20A0,0x20CF],
  [0x2100,0x214F],[0x2190,0x21FF],[0x2600,0x26FF],
  [0x1F300,0x1F5FF],[0x1F600,0x1F64F],[0x1F900,0x1F9FF]
];

const RARE_RANGES = [
  [0x12000,0x123FF],
  [0x13000,0x1342F],
  [0x1B000,0x1B0FF],
  [0x10300,0x1034F]
];

function randFrom(ranges) {
  const [start,end] = ranges[Math.floor(Math.random()*ranges.length)];
  return start + Math.floor(Math.random()*(end-start+1));
}

function toHex6(cp) {
  return cp.toString(16).toUpperCase().padStart(6,"0");
}

function updateGlyph() {
  charEl.classList.add("fade-out");

  setTimeout(() => {
    const cp = rareToggle.checked ? randFrom(RARE_RANGES) : randFrom(NORMAL_RANGES);
    const hex6 = toHex6(cp);

    charEl.textContent = String.fromCodePoint(cp);
    codeEl.textContent = "0x" + hex6;
    hexEl.textContent = "Hex: " + hex6;
    blockEl.textContent = "Block: " + findBlock(cp);

    history.unshift(cp);
    if (history.length > 20) history.pop();
    renderHistory();

    charEl.classList.remove("fade-out");
    charEl.classList.add("fade-in");
    setTimeout(() => charEl.classList.remove("fade-in"), 250);
  }, 180);
}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(cp => {
    const hex6 = toHex6(cp);
    const div = document.createElement("div");
    div.textContent = String.fromCodePoint(cp) + " — 0x" + hex6 + " — " + findBlock(cp);
    div.onclick = () => {
      charEl.textContent = String.fromCodePoint(cp);
      codeEl.textContent = "0x" + hex6;
      hexEl.textContent = "Hex: " + hex6;
      blockEl.textContent = "Block: " + findBlock(cp);
    };
    historyList.appendChild(div);
  });
}

clearHistoryBtn.onclick = () => { history = []; renderHistory(); };

favBtn.onclick = () => {
  const cp = parseInt(codeEl.textContent.slice(2), 16);
  if (!favorites.includes(cp)) favorites.push(cp);
  renderFavorites();
};

function renderFavorites() {
  favoritesList.innerHTML = "";
  favorites.forEach(cp => {
    const hex6 = toHex6(cp);
    const div = document.createElement("div");
    div.textContent = String.fromCodePoint(cp) + " — 0x" + hex6 + " — " + findBlock(cp);
    div.onclick = () => {
      charEl.textContent = String.fromCodePoint(cp);
      codeEl.textContent = "0x" + hex6;
      hexEl.textContent = "Hex: " + hex6;
      blockEl.textContent = "Block: " + findBlock(cp);
    };
    favoritesList.appendChild(div);
  });
}

copyBtn.onclick = () => {
  navigator.clipboard.writeText(charEl.textContent + " " + codeEl.textContent);
};

cornerBtn.onclick = () => {
  panel.classList.toggle("open");
  blurOverlay.classList.toggle("active", panel.classList.contains("open"));
  content.classList.toggle("blurred", panel.classList.contains("open"));
  cornerBtn.classList.toggle("spin");
};

blurOverlay.onclick = () => {
  panel.classList.remove("open");
  blurOverlay.classList.remove("active");
  content.classList.remove("blurred");
  cornerBtn.classList.remove("spin");
};

modeToggle.onchange = () => {
  document.body.classList.toggle("light", modeToggle.checked);
};

rareToggle.onchange = () => {
  document.body.classList.toggle("rare-theme", rareToggle.checked);
};

newBtn.onclick = updateGlyph;

document.addEventListener("keydown", e => {
  if (e.code === "Space") { 
    e.preventDefault(); 
    updateGlyph(); 
  }
});

updateGlyph();
