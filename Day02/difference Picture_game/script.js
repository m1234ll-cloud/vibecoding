const stageConfigs = [
  {
    label: "1단계",
    title: "공원 탐험",
    subtitle: "큰 나무와 텐트가 있는 공원 장면에서 4개의 차이를 찾아보세요.",
    timeLimit: 75,
    totalDifferences: 4,
    imageSrc: "1.png",
    imageWidth: 299,
    imageHeight: 409,
    differences: [
      { id: "cloud-dot", label: "하늘의 점", x: 79, y: 25, size: "small", visual: { kind: "dot", color: "#ffffff", size: 10 } },
      { id: "ear-tip", label: "귀 끝", x: 50, y: 15, size: "small", visual: { kind: "triangle", color: "#ffd166", size: 18, rotate: 180 } },
      { id: "cheek-mark", label: "볼 표시", x: 59, y: 47, size: "medium", visual: { kind: "dot", color: "#ff6b81", size: 12 } },
      { id: "ball-mark", label: "공 표시", x: 77, y: 84, size: "small", visual: { kind: "square", color: "#2563eb", size: 16 } },
    ],
  },
  {
    label: "2단계",
    title: "바닷가 항구",
    subtitle: "파도와 배가 있는 항구에서 6개의 차이를 찾아보세요.",
    timeLimit: 90,
    totalDifferences: 6,
    imageSrc: "2.png",
    imageWidth: 562,
    imageHeight: 327,
    differences: [
      { id: "roof-cross", label: "지붕 장식", x: 50, y: 14, size: "small", visual: { kind: "cross", color: "#ff7b7b", size: 16 } },
      { id: "palm-leaf", label: "야자잎", x: 33, y: 28, size: "small", visual: { kind: "leaf", color: "#22c55e", size: 18, rotate: -20 } },
      { id: "window-dot", label: "창문 점", x: 69, y: 27, size: "small", visual: { kind: "dot", color: "#2563eb", size: 10 } },
      { id: "path-stone", label: "길 위 돌", x: 35, y: 66, size: "small", visual: { kind: "dot", color: "#f59e0b", size: 11 } },
      { id: "flower-bed", label: "꽃밭", x: 17, y: 77, size: "medium", visual: { kind: "square", color: "#ef4444", size: 14 } },
      { id: "tree-leaf", label: "나무 잎", x: 86, y: 69, size: "medium", visual: { kind: "triangle", color: "#15803d", size: 16, rotate: 30 } },
    ],
  },
  {
    label: "3단계",
    title: "우주 캠프",
    subtitle: "별과 로켓이 가득한 밤하늘에서 8개의 차이를 찾아보세요.",
    timeLimit: 110,
    totalDifferences: 8,
    imageSrc: "3.png",
    imageWidth: 517,
    imageHeight: 381,
    differences: [
      { id: "sparkle-1", label: "왼쪽 반짝임", x: 19, y: 23, size: "small", visual: { kind: "star", color: "#ffffff", size: 16 } },
      { id: "sparkle-2", label: "오른쪽 반짝임", x: 38, y: 34, size: "small", visual: { kind: "dot", color: "#93c5fd", size: 11 } },
      { id: "ear-tip", label: "귀 끝", x: 53, y: 16, size: "small", visual: { kind: "triangle", color: "#fde68a", size: 16, rotate: 180 } },
      { id: "eye-mark", label: "눈 점", x: 50, y: 58, size: "medium", visual: { kind: "dot", color: "#111827", size: 10 } },
      { id: "ring-mark", label: "고리", x: 72, y: 42, size: "medium", visual: { kind: "ring", color: "#a855f7", size: 18 } },
      { id: "tail-mark", label: "꼬리", x: 83, y: 64, size: "medium", visual: { kind: "leaf", color: "#fb923c", size: 20, rotate: -25 } },
      { id: "flag-mark", label: "깃발", x: 37, y: 74, size: "small", visual: { kind: "square", color: "#22c55e", size: 12 } },
      { id: "fur-mark", label: "털 끝", x: 62, y: 79, size: "medium", visual: { kind: "dot", color: "#facc15", size: 11 } },
    ],
  },
];

const startScreenElement = document.getElementById("startScreen");
const endScreenElement = document.getElementById("endScreen");
const endTitleElement = document.getElementById("endTitle");
const endTextElement = document.getElementById("endText");
const startButtonElement = document.getElementById("startButton");
const playAgainButtonElement = document.getElementById("playAgainButton");
const gameAreaElement = document.getElementById("gameArea");
const stageSubtitleElement = document.getElementById("stageSubtitle");
const stageCountElement = document.getElementById("stageCount");
const foundCountElement = document.getElementById("foundCount");
const timeCountElement = document.getElementById("timeCount");
const messageElement = document.getElementById("message");
const showAnswerButton = document.getElementById("showAnswerButton");
const changePictureButton = document.getElementById("changePictureButton");
const restartButton = document.getElementById("restartButton");
const leftSceneElement = document.getElementById("leftScene");
const rightSceneElement = document.getElementById("rightScene");

const sceneState = {
  stageIndex: 0,
  foundIds: new Set(),
  remainingSeconds: 0,
  timerId: null,
  answerRevealTimerId: null,
  isPlaying: false,
  isTransitioning: false,
  differenceSeed: 1,
};

function createRng(seed) {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function randRange(rng, min, max) {
  return min + (max - min) * rng();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getCurrentStage() {
  const stage = stageConfigs[sceneState.stageIndex];
  return stage ? { ...stage, differences: getActiveDifferences(stage) } : null;
}

function getStageNumberLabel() {
  return `${sceneState.stageIndex + 1} / ${stageConfigs.length}`;
}

function getActiveDifferences(stage) {
  const stageSeed = sceneState.differenceSeed + sceneState.stageIndex * 1000;

  return stage.differences.map((difference, index) => {
    const idSeed = difference.id
      .split("")
      .reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);
    const rng = createRng(stageSeed + idSeed + index * 97);
    const maxOffset = difference.size === "small" ? 3.25 : difference.size === "medium" ? 4.5 : 5.5;
    const x = clamp(difference.x + randRange(rng, -maxOffset, maxOffset), 6, 94);
    const y = clamp(difference.y + randRange(rng, -maxOffset, maxOffset), 6, 94);

    return {
      ...difference,
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
    };
  });
}

function setMessage(text, tone = "") {
  messageElement.textContent = text;
  messageElement.className = "message";
  if (tone) {
    messageElement.classList.add(tone);
  }
}

function showStartScreen() {
  gameAreaElement.hidden = true;
  startScreenElement.classList.add("active");
  startScreenElement.setAttribute("aria-hidden", "false");
  endScreenElement.classList.remove("active");
  endScreenElement.setAttribute("aria-hidden", "true");
}

function showGameArea() {
  gameAreaElement.hidden = false;
  startScreenElement.classList.remove("active");
  startScreenElement.setAttribute("aria-hidden", "true");
  endScreenElement.classList.remove("active");
  endScreenElement.setAttribute("aria-hidden", "true");
}

function showEndScreen(title, text) {
  gameAreaElement.hidden = true;
  startScreenElement.classList.remove("active");
  startScreenElement.setAttribute("aria-hidden", "true");
  endTitleElement.textContent = title;
  endTextElement.textContent = text;
  endScreenElement.classList.add("active");
  endScreenElement.setAttribute("aria-hidden", "false");
}

function stopTimer() {
  if (sceneState.timerId) {
    clearInterval(sceneState.timerId);
    sceneState.timerId = null;
  }
}

function stopAnswerRevealTimer() {
  if (sceneState.answerRevealTimerId) {
    clearTimeout(sceneState.answerRevealTimerId);
    sceneState.answerRevealTimerId = null;
  }
}

function updateStatus() {
  const stage = getCurrentStage();
  stageSubtitleElement.textContent = stage.subtitle;
  stageCountElement.textContent = getStageNumberLabel();
  foundCountElement.textContent = `${sceneState.foundIds.size} / ${stage.totalDifferences}`;
  timeCountElement.textContent = sceneState.remainingSeconds;
}

function getSceneMarkup(stage, side, seed) {
  const rng = createRng(seed + (side === "left" ? 11 : 29));
  const baseDecorations = stage.renderDecorations(seed);
  const differenceLayer = stage.renderDifferenceSvg(side);

  return `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="sky-${stage.label}-${side}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${stage.palette.skyTop}" />
          <stop offset="100%" stop-color="${stage.palette.skyBottom}" />
        </linearGradient>
        <linearGradient id="ground-${stage.label}-${side}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${stage.palette.hill}" />
          <stop offset="100%" stop-color="${stage.palette.hill2}" />
        </linearGradient>
        <radialGradient id="glow-${stage.label}-${side}">
          <stop offset="0%" stop-color="rgba(255,255,255,0.8)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#sky-${stage.label}-${side})"></rect>
      ${baseDecorations}
      ${differenceLayer}
      ${renderForeground(stage, side, rng)}
      <rect x="0" y="72" width="100" height="28" fill="url(#ground-${stage.label}-${side})"></rect>
    </svg>
  `;
}

function renderForeground(stage, side, rng) {
  const stars = [];
  for (let index = 0; index < 6; index += 1) {
    const cx = randRange(rng, 8, 92).toFixed(1);
    const cy = randRange(rng, 7, 45).toFixed(1);
    const size = randRange(rng, 0.35, 0.9).toFixed(2);
    stars.push(`<circle cx="${cx}" cy="${cy}" r="${size}" fill="rgba(255,255,255,0.55)"></circle>`);
  }

  if (stage.label === "3단계") {
    return `
      ${stars.join("")}
      <circle cx="82" cy="18" r="10" fill="rgba(255,255,255,0.08)"></circle>
      <circle cx="82" cy="18" r="4" fill="rgba(255,255,255,0.26)"></circle>
    `;
  }

  return `
    <circle cx="81" cy="16" r="10" fill="rgba(255, 209, 102, 0.22)"></circle>
    <circle cx="81" cy="16" r="5" fill="rgba(255, 209, 102, 0.48)"></circle>
    ${stars.join("")}
  `;
}

function renderForestDecorations(seed) {
  const rng = createRng(seed);
  const clouds = [];
  for (let index = 0; index < 3; index += 1) {
    const x = randRange(rng, 10, 78);
    const y = randRange(rng, 8, 28);
    clouds.push(`
      <g opacity="0.7" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <ellipse cx="0" cy="0" rx="7" ry="4" fill="rgba(255,255,255,0.82)"></ellipse>
        <ellipse cx="6" cy="-1" rx="6" ry="3.6" fill="rgba(255,255,255,0.72)"></ellipse>
        <ellipse cx="-5" cy="1" rx="5.5" ry="3.2" fill="rgba(255,255,255,0.7)"></ellipse>
      </g>
    `);
  }

  return `
    ${clouds.join("")}
    <path d="M0 67 Q18 59 35 66 T74 64 T100 68 L100 72 L0 72 Z" fill="rgba(255,255,255,0.08)"></path>
    <path d="M0 78 Q14 63 31 70 T69 67 T100 74 L100 100 L0 100 Z" fill="rgba(49,111,69,0.26)"></path>
    <path d="M0 82 Q19 69 37 76 T78 73 T100 82 L100 100 L0 100 Z" fill="rgba(30,90,48,0.36)"></path>
  `;
}

function renderParkDecorations(seed) {
  const rng = createRng(seed);
  const clouds = [];
  for (let index = 0; index < 4; index += 1) {
    const x = randRange(rng, 8, 84);
    const y = randRange(rng, 8, 26);
    clouds.push(`
      <g opacity="0.72" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <ellipse cx="0" cy="0" rx="7" ry="4.1" fill="rgba(255,255,255,0.86)"></ellipse>
        <ellipse cx="5.8" cy="-1" rx="5.8" ry="3.4" fill="rgba(255,255,255,0.72)"></ellipse>
        <ellipse cx="-4.8" cy="1" rx="5.2" ry="3.1" fill="rgba(255,255,255,0.68)"></ellipse>
      </g>
    `);
  }

  const grass = [];
  for (let index = 0; index < 12; index += 1) {
    const x = randRange(rng, 0, 100);
    const h = randRange(rng, 3.5, 8.5);
    const y = randRange(rng, 72, 81);
    grass.push(`<path d="M${x.toFixed(1)} ${y.toFixed(1)} l1 ${(-h).toFixed(1)} l1 ${h.toFixed(1)}" stroke="rgba(78,164,87,0.55)" stroke-width="0.7" stroke-linecap="round"></path>`);
  }

  return `
    ${clouds.join("")}
    <ellipse cx="23" cy="74" rx="18" ry="8" fill="rgba(88, 171, 91, 0.32)"></ellipse>
    <ellipse cx="69" cy="75" rx="24" ry="9" fill="rgba(88, 171, 91, 0.24)"></ellipse>
    <rect x="0" y="76" width="100" height="24" fill="rgba(73, 156, 76, 0.38)"></rect>
    ${grass.join("")}
    <path d="M34 74 l8 -41 c1.1 -6.6 8.2 -12 15 -12 h7 c6.8 0 13.4 5.3 15 12 l8 41" fill="none" stroke="${"rgba(122,81,53,0.98)"}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M36 36 c7 -11 18 -18 30 -18 c13 0 25 7 32 18 c-3 3 -8 5 -14 5 c-5 0 -8 -1 -12 -3 c-4 2 -9 3 -14 3 c-5 0 -8 -1 -12 -3 c-5 2 -9 3 -13 3 c-5 0 -9 -1 -17 -5z" fill="rgba(63,157,93,0.96)"></path>
    <path d="M18 67 q9 -8 19 0 v10 h-19 z" fill="rgba(255, 208, 102, 0.95)"></path>
    <path d="M18 67 l9 -10 l9 10" fill="none" stroke="rgba(240, 120, 96, 0.96)" stroke-width="3" stroke-linejoin="round"></path>
    <path d="M15 77 h25" stroke="rgba(140,94,62,0.75)" stroke-width="2.2" stroke-linecap="round"></path>
    <circle cx="11" cy="58" r="3.2" fill="#f7c0a0"></circle>
    <circle cx="14.5" cy="58" r="3.2" fill="#f7c0a0"></circle>
    <circle cx="22" cy="60" r="4.1" fill="#f1d4c8"></circle>
    <circle cx="67" cy="58" r="4.2" fill="#f0c6a4"></circle>
    <circle cx="72" cy="58" r="4.2" fill="#f0c6a4"></circle>
    <path d="M63 62 q4 -8 10 0 v7 h-10z" fill="#2563eb"></path>
    <path d="M52 50 q8 -9 17 0" fill="none" stroke="rgba(255, 226, 180, 0.9)" stroke-width="1.6" stroke-linecap="round"></path>
  `;
}

function renderHarborDecorations(seed) {
  const rng = createRng(seed);
  const waves = [];
  for (let index = 0; index < 5; index += 1) {
    const y = 72 + index * 4.5;
    const offset = randRange(rng, 0, 10);
    waves.push(`<path d="M-2 ${y + offset} Q6 ${y - 1 + offset} 14 ${y + offset} T30 ${y + offset} T46 ${y + offset} T62 ${y + offset} T78 ${y + offset} T94 ${y + offset} T110 ${y + offset}" stroke="rgba(255,255,255,0.45)" stroke-width="0.7" fill="none" opacity="0.5"></path>`);
  }

  return `
    <ellipse cx="22" cy="22" rx="6" ry="3.5" fill="rgba(255,255,255,0.76)"></ellipse>
    <ellipse cx="28" cy="20" rx="5" ry="3" fill="rgba(255,255,255,0.64)"></ellipse>
    <ellipse cx="72" cy="16" rx="8" ry="4" fill="rgba(255,255,255,0.72)"></ellipse>
    <ellipse cx="78" cy="18" rx="6" ry="3.2" fill="rgba(255,255,255,0.58)"></ellipse>
    ${waves.join("")}
  `;
}

function renderParkDifferenceSvg(side) {
  const isRight = side === "right";
  return `
    <path d="M22 25 l7 -7 l7 7 l-7 7 z" fill="${isRight ? "#fb7185" : "#fca5a5"}"></path>
    <path d="M22 25 l7 9 l7 -9" fill="none" stroke="${isRight ? "#f59e0b" : "rgba(255,255,255,0.18)"}" stroke-width="1.1" stroke-linejoin="round"></path>
    <path d="M42 56 v9" stroke="${isRight ? "#f59e0b" : "rgba(255,255,255,0.18)"}" stroke-width="2" stroke-linecap="round"></path>
    <path d="M49 56 h6" stroke="${isRight ? "#f59e0b" : "rgba(255,255,255,0.18)"}" stroke-width="2" stroke-linecap="round"></path>
    <circle cx="56" cy="56" r="${isRight ? 3.6 : 2.4}" fill="${isRight ? "#111827" : "rgba(255,255,255,0.24)"}"></circle>
    <circle cx="55.4" cy="55.7" r="0.7" fill="${isRight ? "#fff" : "transparent"}"></circle>
    <path d="M78 22 q2 -2 4 0 q-2 3 -4 0 z" fill="${isRight ? "#4b5563" : "rgba(255,255,255,0.18)"}"></path>
    <path d="M78 22 q2 -1 4 1" fill="none" stroke="${isRight ? "#111827" : "rgba(255,255,255,0.18)"}" stroke-width="1" stroke-linecap="round"></path>
  `;
}

function renderSpaceDecorations(seed) {
  const rng = createRng(seed);
  const stars = [];
  for (let index = 0; index < 24; index += 1) {
    const x = randRange(rng, 3, 97);
    const y = randRange(rng, 4, 48);
    const r = randRange(rng, 0.25, 0.9);
    stars.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="rgba(255,255,255,0.82)"></circle>`);
  }

  return `
    ${stars.join("")}
    <path d="M0 72 Q14 60 27 66 T55 64 T83 69 T100 66 L100 100 L0 100 Z" fill="rgba(10, 16, 31, 0.56)"></path>
    <path d="M0 80 Q17 68 34 74 T71 69 T100 78 L100 100 L0 100 Z" fill="rgba(18, 27, 48, 0.78)"></path>
  `;
}

function renderForestDifferenceSvg(side) {
  const isRight = side === "right";
  return `
    <circle cx="18" cy="15" r="${isRight ? 1.2 : 0.7}" fill="${isRight ? "#ffffff" : "rgba(255,255,255,0.35)"}"></circle>
    <path d="M24 ${isRight ? 21 : 20.3} q2 -3 4 0 q-2 2 -4 0 z" fill="${isRight ? "#4a5568" : "#6b7280"}"></path>
    <path d="M37 64 h12 l-2 10 h-9 z" fill="#c28c48"></path>
    <path d="M32 56 q6 -10 16 0 l-2 12 h-12 z" fill="${isRight ? "#e57a44" : "#f1b55d"}"></path>
    <path d="M70 52 l9 -7 v12 z" fill="${isRight ? "#fb7185" : "#fbbf24"}"></path>
    <path d="M78 31 q2 -2 4 0 q-2 3 -4 0 z" fill="${isRight ? "#f472b6" : "#fb7185"}"></path>
  `;
}

function renderHarborDifferenceSvg(side) {
  const isRight = side === "right";
  return `
    <path d="M11 24 q2 -3 4 0 q-2 2 -4 0 z" fill="${isRight ? "#ffffff" : "rgba(255,255,255,0.3)"}"></path>
    <path d="M44 50 l8 -5 v11 z" fill="#f59e0b"></path>
    <path d="M48 ${isRight ? 36 : 38} v17" stroke="#ffffff" stroke-width="${isRight ? 0.9 : 0.5}" stroke-linecap="round"></path>
    <rect x="75" y="33" width="10" height="22" rx="2" fill="#e2e8f0"></rect>
    <rect x="78" y="40" width="3" height="3" rx="0.6" fill="${isRight ? "#1d4ed8" : "#f8fafc"}"></rect>
    <circle cx="61" cy="77" r="${isRight ? 1.8 : 1.0}" fill="${isRight ? "#f59e0b" : "#d4d4d8"}"></circle>
    <circle cx="26" cy="81" r="${isRight ? 1.7 : 1.0}" fill="${isRight ? "#ffd166" : "#fcd34d"}"></circle>
    <ellipse cx="69" cy="18" rx="5" ry="${isRight ? 3.4 : 2.4}" fill="rgba(255,255,255,0.78)"></ellipse>
    <ellipse cx="76" cy="18" rx="4" ry="2.4" fill="rgba(255,255,255,0.68)"></ellipse>
  `;
}

function renderSpaceDifferenceSvg(side) {
  const isRight = side === "right";
  return `
    <circle cx="19" cy="18" r="${isRight ? 5.2 : 4.4}" fill="rgba(255, 238, 180, 0.9)"></circle>
    <circle cx="18" cy="17" r="0.8" fill="rgba(0,0,0,0.25)"></circle>
    <circle cx="28" cy="31" r="1.2" fill="${isRight ? "#ffffff" : "rgba(255,255,255,0.4)"}"></circle>
    <circle cx="83" cy="26" r="1.2" fill="${isRight ? "#ffffff" : "rgba(255,255,255,0.45)"}"></circle>
    <rect x="45" y="47" width="9" height="18" rx="4.5" fill="#f59e0b"></rect>
    <rect x="47" y="52" width="3.6" height="3.6" rx="1.8" fill="${isRight ? "#e0f2fe" : "#f8fafc"}"></rect>
    <path d="M64 42 q7 -5 15 0 q-8 3 -15 0 z" fill="${isRight ? "#8b5cf6" : "#a78bfa"}"></path>
    <path d="M71 42 l5 -5 l2 6" stroke="${isRight ? "#c4b5fd" : "#ddd6fe"}" stroke-width="1.2" fill="none" stroke-linecap="round"></path>
    <path d="M82 56 q4 -4 8 0 v5 q-4 4 -8 0 z" fill="${isRight ? "#cbd5e1" : "#94a3b8"}"></path>
    <circle cx="37" cy="74" r="${isRight ? 1.9 : 1.0}" fill="${isRight ? "#fde68a" : "#f8fafc"}"></circle>
    <circle cx="61" cy="79" r="${isRight ? 4.5 : 3.4}" fill="#22c55e"></circle>
    <circle cx="60" cy="78" r="1" fill="#052e16"></circle>
  `;
}

function buildMarkerMarkup(stage) {
  return stage.differences
    .filter((difference) => sceneState.foundIds.has(difference.id))
    .map((difference) => {
      return `
        <span class="marker" style="left: ${difference.x}%; top: ${difference.y}%;"></span>
      `;
    })
    .join("");
}

function getDifferenceGlyph(kind) {
  switch (kind) {
    case "triangle":
      return "▲";
    case "square":
      return "■";
    case "cross":
      return "✚";
    case "ring":
      return "◉";
    case "leaf":
      return "❖";
    case "star":
      return "✦";
    case "dot":
    default:
      return "●";
  }
}

function buildDifferenceVisualMarkup(stage) {
  return stage.differences
    .map((difference) => {
      const visual = difference.visual || {};
      const symbol = getDifferenceGlyph(visual.kind);
      const size = visual.size || 12;
      const color = visual.color || "#ffffff";
      const rotate = visual.rotate || 0;

      return `
        <span
          class="difference-visual"
          style="left: ${difference.x}%; top: ${difference.y}%; color: ${color}; font-size: ${size}px; transform: translate(-50%, -50%) rotate(${rotate}deg);"
          aria-hidden="true"
        >${symbol}</span>
      `;
    })
    .join("");
}

function buildGuessLayerMarkup(side) {
  return `
    <div class="guess-layer" data-side="${side}" aria-hidden="true"></div>
  `;
}

function buildSceneCanvasMarkup(stage, side) {
  const imageSrc = stage.imageSrc;
  const imageWidth = stage.imageWidth;
  const imageHeight = stage.imageHeight;

  return `
    <div class="scene-canvas" data-side="${side}" data-image-width="${imageWidth}" data-image-height="${imageHeight}" style="aspect-ratio: ${imageWidth} / ${imageHeight};">
      <img class="scene-image" src="${escapeAttr(imageSrc)}" alt="" draggable="false" />
      <div class="marker-layer">${buildMarkerMarkup(stage)}</div>
      ${side === "right" ? `<div class="difference-layer" aria-hidden="true">${buildDifferenceVisualMarkup(stage)}</div>` : ""}
      ${buildGuessLayerMarkup(side)}
    </div>
  `;
}

function renderScenes() {
  const stage = getCurrentStage();

  leftSceneElement.innerHTML = buildSceneCanvasMarkup(stage, "left");
  rightSceneElement.innerHTML = buildSceneCanvasMarkup(stage, "right");
}

function clearTimerAndState() {
  stopTimer();
  stopAnswerRevealTimer();
  sceneState.isTransitioning = false;
  sceneState.isPlaying = false;
}

function startTimer() {
  stopTimer();

  sceneState.timerId = setInterval(() => {
    if (!sceneState.isPlaying || sceneState.isTransitioning) {
      return;
    }

    sceneState.remainingSeconds -= 1;
    updateStatus();

    if (sceneState.remainingSeconds <= 0) {
      sceneState.remainingSeconds = 0;
      updateStatus();
      handleGameOver();
    }
  }, 1000);
}

function loadStage(options = {}) {
  const { resetTimer = true, resetFound = true, freshSeed = false } = options;
  const stage = getCurrentStage();

  stopAnswerRevealTimer();

  if (resetFound) {
    sceneState.foundIds = new Set();
  }

  if (freshSeed) {
    sceneState.differenceSeed = Math.floor(Math.random() * 1_000_000) + 1;
  }

  if (resetTimer) {
    sceneState.remainingSeconds = stage.timeLimit;
  }

  updateStatus();
  renderScenes();
}

function beginGame() {
  clearTimerAndState();
  sceneState.stageIndex = 0;
  sceneState.differenceSeed = Math.floor(Math.random() * 1_000_000) + 1;
  sceneState.isPlaying = true;
  showGameArea();
  loadStage({ resetTimer: true, resetFound: true });
  setMessage("차이점을 찾아서 동그라미가 생기는지 확인해 보세요.");
  startTimer();
}

function restartGame() {
  beginGame();
}

function revealAnswerTemporarily() {
  if (!sceneState.isPlaying || sceneState.isTransitioning) {
    return;
  }

  const stage = getCurrentStage();
  stopAnswerRevealTimer();

  sceneState.foundIds = new Set(stage.differences.map((difference) => difference.id));
  updateStatus();
  renderScenes();
  setMessage("정답을 모두 표시했습니다. 5초 뒤 초기화됩니다.", "good");

  sceneState.answerRevealTimerId = window.setTimeout(() => {
    sceneState.answerRevealTimerId = null;
    sceneState.foundIds = new Set();
    updateStatus();
    renderScenes();
    setMessage("초기화되었습니다. 다시 차이를 찾아보세요.");
  }, 5000);
}

function handleStageClear() {
  const currentStage = getCurrentStage();
  sceneState.isTransitioning = true;
  stopTimer();
  setMessage(`${currentStage.label}를 완료했습니다. 다음 단계로 이동합니다.`, "good");

  window.setTimeout(() => {
    if (!sceneState.isTransitioning) {
      return;
    }

    sceneState.stageIndex += 1;
    sceneState.differenceSeed = Math.floor(Math.random() * 1_000_000) + 1;
    sceneState.isTransitioning = false;

    if (sceneState.stageIndex >= stageConfigs.length) {
      sceneState.isPlaying = false;
      showEndScreen("축하합니다", "모든 단계를 완료했습니다. 다시 하기 버튼으로 한 번 더 도전해 보세요.");
      return;
    }

    loadStage({ resetTimer: true, resetFound: true, freshSeed: true });
    setMessage(`${getCurrentStage().label} 시작! 남은 차이를 찾아보세요.`, "good");
    startTimer();
  }, 1200);
}

function handleGameOver() {
  if (sceneState.isTransitioning) {
    return;
  }

  clearTimerAndState();
  setMessage("시간이 모두 끝났습니다. 다시 시작해 보세요.", "bad");
  showEndScreen("게임오버", "시간이 모두 끝났습니다. 다시 하기 버튼으로 처음부터 다시 도전할 수 있습니다.");
}

function markFoundDifference(differenceId, side) {
  if (sceneState.isTransitioning || !sceneState.isPlaying) {
    return;
  }

  if (sceneState.foundIds.has(differenceId)) {
    return;
  }

  const stage = getCurrentStage();
  const difference = stage.differences.find((item) => item.id === differenceId);
  if (!difference) {
    return;
  }

  sceneState.foundIds.add(differenceId);
  updateStatus();
  renderScenes();
  setMessage(`${side === "left" ? "왼쪽" : "오른쪽"} 그림의 ${difference.label}을 찾았습니다.`, "good");

  if (sceneState.foundIds.size === stage.totalDifferences) {
    handleStageClear();
  }
}

function getStageThreshold(difference) {
  if (typeof difference.hitRadius === "number") {
    return difference.hitRadius;
  }

  if (difference.size === "small") {
    return 7.5;
  }

  if (difference.size === "medium") {
    return 9.5;
  }

  return 12;
}

function getPointFromEvent(event, element) {
  const rect = element.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  return { x, y };
}

function getClosestDifference(stage, x, y) {
  let closest = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  stage.differences.forEach((difference) => {
    if (sceneState.foundIds.has(difference.id)) {
      return;
    }

    const dx = x - difference.x;
    const dy = y - difference.y;
    const distance = Math.hypot(dx, dy);
    const threshold = getStageThreshold(difference);

    if (distance <= threshold && distance < closestDistance) {
      closest = difference;
      closestDistance = distance;
    }
  });

  return closest;
}

function getFoundDifferenceAtPoint(stage, x, y) {
  for (const difference of stage.differences) {
    if (!sceneState.foundIds.has(difference.id)) {
      continue;
    }

    const dx = x - difference.x;
    const dy = y - difference.y;
    const distance = Math.hypot(dx, dy);
    const threshold = getStageThreshold(difference);

    if (distance <= threshold) {
      return difference;
    }
  }

  return null;
}

function createFloatingMark(side, x, y, type) {
  const frame = side === "left" ? leftSceneElement : rightSceneElement;
  const mark = document.createElement("span");
  mark.className = `feedback-mark ${type}`;
  if (type === "wrong") {
    mark.textContent = "×";
  }
  mark.style.left = `${x}%`;
  mark.style.top = `${y}%`;
  frame.appendChild(mark);

  window.setTimeout(() => {
    mark.remove();
  }, type === "wrong" ? 700 : 900);
}

function handleSceneClick(event) {
  const side = event.currentTarget.dataset.side || (event.currentTarget.id === "leftScene" ? "left" : "right");
  const canvas = event.currentTarget.querySelector(".scene-canvas");
  if (!canvas) {
    return;
  }

  const frameRect = canvas.getBoundingClientRect();
  const clickX = event.clientX - frameRect.left;
  const clickY = event.clientY - frameRect.top;

  if (clickX < 0 || clickY < 0 || clickX > frameRect.width || clickY > frameRect.height) {
    return;
  }

  const stage = getCurrentStage();
  const { x, y } = {
    x: (clickX / frameRect.width) * 100,
    y: (clickY / frameRect.height) * 100,
  };
  const alreadyFoundDifference = getFoundDifferenceAtPoint(stage, x, y);
  if (alreadyFoundDifference) {
    setMessage(`${alreadyFoundDifference.label}은 이미 찾았습니다.`, "good");
    return;
  }

  const difference = getClosestDifference(stage, x, y);

  if (!difference) {
    createFloatingMark(side, x, y, "wrong");
    setMessage(`${side === "left" ? "왼쪽" : "오른쪽"} 그림에서 맞는 차이를 찾지 못했습니다.`, "bad");
    return;
  }

  createFloatingMark(side, difference.x, difference.y, "right");
  markFoundDifference(difference.id, side);
}

changePictureButton.addEventListener("click", () => {
  if (!sceneState.isPlaying || sceneState.isTransitioning) {
    return;
  }

  stopAnswerRevealTimer();
  sceneState.differenceSeed = Math.floor(Math.random() * 1_000_000) + 1;
  sceneState.foundIds = new Set();
  updateStatus();
  renderScenes();
  setMessage("같은 그림의 차이 위치를 다시 배치했습니다. 새 위치를 찾아보세요.", "good");
});

showAnswerButton.addEventListener("click", revealAnswerTemporarily);
restartButton.addEventListener("click", restartGame);
startButtonElement.addEventListener("click", beginGame);
playAgainButtonElement.addEventListener("click", () => {
  stopAnswerRevealTimer();
  beginGame();
});

leftSceneElement.addEventListener("click", handleSceneClick);
rightSceneElement.addEventListener("click", handleSceneClick);

showStartScreen();
sceneState.remainingSeconds = stageConfigs[0].timeLimit;
updateStatus();
setMessage("시작 버튼을 눌러 게임을 시작하세요.");
