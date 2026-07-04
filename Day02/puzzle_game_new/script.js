const fruitPool = ["🍇", "🍓", "🥝", "🍑", "🍎", "🍉", "🍒", "🍊", "🍋", "🍐", "🍍", "🥭", "🫐", "🍈", "🍌", "🍏", "🍅", "🥥", "🍇", "🍓", "🥝", "🍑"];

const levelConfig = {
  easy: { label: "쉬움", size: 3, timeLimit: 45 },
  normal1: { label: "보통1", size: 4, timeLimit: 75 },
  normal2: { label: "보통2", size: 5, timeLimit: 100 },
  hard: { label: "어려움", size: 6, timeLimit: 140 },
};

const levelOrder = ["easy", "normal1", "normal2", "hard"];

const boardElement = document.getElementById("board");
const attemptCountElement = document.getElementById("attemptCount");
const scoreCountElement = document.getElementById("scoreCount");
const timeCountElement = document.getElementById("timeCount");
const restartButton = document.getElementById("restartButton");
const startScreenElement = document.getElementById("startScreen");
const endScreenElement = document.getElementById("endScreen");
const endScreenTextElement = document.getElementById("endScreenText");
const startButtonElement = document.getElementById("startButton");
const playAgainButtonElement = document.getElementById("playAgainButton");
const gameAreaElement = document.getElementById("gameArea");
const messageElement = document.getElementById("message");

let firstCard = null;
let secondCard = null;
let boardLocked = false;
let attemptCount = 0;
let scoreCount = 0;
let matchedPairs = 0;
let mismatchTimerId = null;
let countdownTimerId = null;
let remainingSeconds = 0;
let isGameFinished = false;
let isLevelTransitionPending = false;
let activeEmojiList = [];
let currentLevelKey = "easy";
let hasGameStarted = false;

function shuffleArray(array) {
  const shuffled = [...array];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function pickRandomItems(array, itemCount) {
  return shuffleArray(array).slice(0, itemCount);
}

function setMessage(text, isDone = false) {
  messageElement.textContent = text;
  messageElement.classList.toggle("done", isDone);
}

function updateAttemptCount() {
  attemptCountElement.textContent = attemptCount;
}

function updateScoreCount() {
  scoreCountElement.textContent = scoreCount;
}

function updateTimeCount() {
  timeCountElement.textContent = remainingSeconds;
}

function getCurrentLevelConfig() {
  return levelConfig[currentLevelKey];
}

function getCurrentLevelIndex() {
  return levelOrder.indexOf(currentLevelKey);
}

function setCurrentLevelKey(levelKey) {
  currentLevelKey = levelKey;
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

function showEndScreen(text) {
  gameAreaElement.hidden = true;
  startScreenElement.classList.remove("active");
  startScreenElement.setAttribute("aria-hidden", "true");
  endScreenTextElement.textContent = text;
  endScreenElement.classList.add("active");
  endScreenElement.setAttribute("aria-hidden", "false");
}

function stopCountdown() {
  if (countdownTimerId) {
    clearInterval(countdownTimerId);
    countdownTimerId = null;
  }
}

function freezeCurrentRound() {
  isGameFinished = true;
  boardLocked = true;
  stopCountdown();

  if (mismatchTimerId) {
    clearTimeout(mismatchTimerId);
    mismatchTimerId = null;
  }

  Array.from(boardElement.querySelectorAll(".card")).forEach((card) => {
    card.disabled = true;
  });
}

function endGame(isClear) {
  freezeCurrentRound();

  if (isClear) {
    setMessage(`축하합니다! ${attemptCount}번 만에 클리어했습니다.`, true);
    return;
  }

  setMessage("시간이 끝났습니다. 게임오버입니다.", false);
}

function isGameClear() {
  return matchedPairs === activeEmojiList.length;
}

function resetSelectedCards() {
  firstCard = null;
  secondCard = null;
  boardLocked = false;
}

function revealCard(cardElement) {
  cardElement.classList.add("flipped");
}

function hideCard(cardElement) {
  if (!cardElement) {
    return;
  }

  cardElement.classList.remove("flipped");
}

function compareCards() {
  return firstCard.dataset.value === secondCard.dataset.value;
}

function markCardsAsMatched(firstElement, secondElement) {
  firstElement.classList.add("matched");
  secondElement.classList.add("matched");
  firstElement.disabled = true;
  secondElement.disabled = true;
  matchedPairs += 1;
  scoreCount += 10;
  updateScoreCount();
}

function handleLevelClear() {
  const nextLevelKey = levelOrder[getCurrentLevelIndex() + 1];

  freezeCurrentRound();

  if (!nextLevelKey) {
    showEndScreen(`모든 단계를 완료했습니다.\n시도 ${attemptCount}회, 점수 ${scoreCount}점으로 마쳤습니다.`);
    return;
  }

  isLevelTransitionPending = true;
  setMessage(`${getCurrentLevelConfig().label} 클리어! 다음 단계로 이동합니다.`, true);

  setTimeout(() => {
    if (!isLevelTransitionPending) {
      return;
    }

    isLevelTransitionPending = false;
    setCurrentLevelKey(nextLevelKey);
    resetGame({ preserveProgress: true, autoStart: true });
  }, 1200);
}

function handleMatchedPair() {
  markCardsAsMatched(firstCard, secondCard);
  setMessage("잘 찾았어요! 같은 그림입니다.");
  resetSelectedCards();

  if (isGameClear()) {
    handleLevelClear();
  }
}

function handleMismatchedPair() {
  setMessage("다른 그림입니다. 잠깐 뒤에 다시 뒤집어요.");

  if (mismatchTimerId) {
    clearTimeout(mismatchTimerId);
  }

  mismatchTimerId = setTimeout(() => {
    if (isGameFinished) {
      mismatchTimerId = null;
      return;
    }

    hideCard(firstCard);
    hideCard(secondCard);
    setMessage("다시 같은 그림을 찾아보세요.");
    resetSelectedCards();
    mismatchTimerId = null;
  }, 700);
}

function handleSecondSelection(cardElement) {
  if (isGameFinished || isLevelTransitionPending) {
    return;
  }

  secondCard = cardElement;
  attemptCount += 1;
  updateAttemptCount();
  boardLocked = true;

  if (compareCards()) {
    handleMatchedPair();
    return;
  }

  handleMismatchedPair();
}

function handleCardClick(cardElement) {
  if (isGameFinished || isLevelTransitionPending || boardLocked || cardElement === firstCard || cardElement.classList.contains("matched")) {
    return;
  }

  revealCard(cardElement);

  if (!firstCard) {
    firstCard = cardElement;
    return;
  }

  handleSecondSelection(cardElement);
}

function createCardElement(emoji) {
  const cardElement = document.createElement("button");
  cardElement.type = "button";
  cardElement.className = "card";
  cardElement.dataset.value = emoji;
  cardElement.setAttribute("aria-label", "카드");

  const emojiElement = document.createElement("span");
  emojiElement.className = "emoji";
  emojiElement.textContent = emoji;

  cardElement.appendChild(emojiElement);
  cardElement.addEventListener("click", () => handleCardClick(cardElement));

  return cardElement;
}

function createEmptyCardElement() {
  const emptyCardElement = document.createElement("button");
  emptyCardElement.type = "button";
  emptyCardElement.className = "card empty";
  emptyCardElement.disabled = true;
  emptyCardElement.setAttribute("aria-hidden", "true");
  return emptyCardElement;
}

function renderBoard() {
  const { size } = getCurrentLevelConfig();
  const totalCells = size * size;
  const emptyCellCount = totalCells - activeEmojiList.length * 2;
  const cardValueList = shuffleArray([
    ...activeEmojiList,
    ...activeEmojiList,
    ...Array(emptyCellCount).fill(null),
  ]);

  boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  boardElement.innerHTML = "";

  cardValueList.forEach((emoji) => {
    const cardElement = emoji === null ? createEmptyCardElement() : createCardElement(emoji);
    boardElement.appendChild(cardElement);
  });
}

function startCountdown() {
  stopCountdown();

  countdownTimerId = setInterval(() => {
    if (isGameFinished) {
      stopCountdown();
      return;
    }

    remainingSeconds -= 1;
    updateTimeCount();

    if (remainingSeconds <= 0) {
      remainingSeconds = 0;
      updateTimeCount();
      endGame(false);
    }
  }, 1000);
}

function resetGame(options = {}) {
  const { preserveProgress = false, autoStart = true } = options;

  if (mismatchTimerId) {
    clearTimeout(mismatchTimerId);
    mismatchTimerId = null;
  }

  isLevelTransitionPending = false;
  stopCountdown();
  firstCard = null;
  secondCard = null;
  boardLocked = false;
  isGameFinished = false;

  if (!preserveProgress) {
    attemptCount = 0;
    scoreCount = 0;
  }

  matchedPairs = 0;

  const currentLevel = getCurrentLevelConfig();
  const { size, timeLimit, label } = currentLevel;
  remainingSeconds = timeLimit;
  const pairCount = Math.floor((size * size) / 2);
  activeEmojiList = pickRandomItems(fruitPool, pairCount);

  updateAttemptCount();
  updateScoreCount();
  updateTimeCount();
  setMessage(`${label} 단계입니다. 같은 그림을 찾아보세요.`);
  renderBoard();

  if (autoStart) {
    showGameArea();
    hasGameStarted = true;
    startCountdown();
  }
}

function startNewGame() {
  setCurrentLevelKey("easy");
  showGameArea();
  resetGame({ preserveProgress: false, autoStart: true });
}

restartButton.addEventListener("click", () => {
  if (!hasGameStarted) {
    return;
  }

  resetGame({ preserveProgress: false, autoStart: true });
});

startButtonElement.addEventListener("click", startNewGame);
playAgainButtonElement.addEventListener("click", () => {
  hasGameStarted = false;
  setCurrentLevelKey("easy");
  showStartScreen();
});

showStartScreen();
resetGame({ preserveProgress: false, autoStart: false });
