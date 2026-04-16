const attemptCountElement = document.getElementById("attempt-count");
const scoreCountElement = document.getElementById("score-count");
const resetButton = document.getElementById("reset-button");
const gameBoardElement = document.getElementById("game-board");
const guideTextElement = document.getElementById("guide-text");

let attemptCount = 0;
let score = 0;
let board = [];
let selectedCards = [];
let isBusy = false;

// 카드에 사용할 그림 목록입니다.
// 각 그림은 2장씩 만들어서 짝을 맞추는 퍼즐에 사용합니다.
const cardSymbols = ["🍎", "🍋", "🍇", "🥝", "🍒", "🍉"];

function createCardData(symbol, pairId, indexInPair) {
  return {
    id: `${pairId}-${indexInPair}`,
    symbol,
    pairId,
    isFlipped: false,
    isMatched: false,
  };
}

function createCardPairs() {
  const cards = [];

  cardSymbols.forEach((symbol, index) => {
    const pairId = index + 1;

    // 같은 그림 카드 2장을 배열에 넣습니다.
    cards.push(createCardData(symbol, pairId, 1));
    cards.push(createCardData(symbol, pairId, 2));
  });

  return cards;
}

function shuffleCards(cards) {
  const shuffledCards = [...cards];

  // Fisher-Yates 방식으로 카드 순서를 섞습니다.
  for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffledCards[index], shuffledCards[randomIndex]] = [
      shuffledCards[randomIndex],
      shuffledCards[index],
    ];
  }

  return shuffledCards;
}

function createBoard() {
  const cardPairs = createCardPairs();
  return shuffleCards(cardPairs);
}

function updateAttemptCount() {
  attemptCountElement.textContent = attemptCount;
}

function updateScore() {
  scoreCountElement.textContent = score;
}

function isGameCleared() {
  return board.every((card) => card.isMatched);
}

function showClearMessage() {
  guideTextElement.textContent = `게임 클리어! 총 ${attemptCount}번 만에 모든 카드를 맞췄고, 점수는 ${score}점입니다.`;
}

function checkForMatch() {
  const firstCard = selectedCards[0];
  const secondCard = selectedCards[1];

  if (firstCard.symbol === secondCard.symbol) {
    firstCard.isMatched = true;
    secondCard.isMatched = true;
    score += 10;
    selectedCards = [];
    isBusy = false;
    updateScore();
    guideTextElement.textContent =
      "같은 카드 2장을 찾았습니다. 점수가 올라가고, 맞춘 카드는 계속 열린 상태로 유지됩니다.";
    renderBoard();

    if (isGameCleared()) {
      showClearMessage();
    }

    return;
  }

  guideTextElement.textContent =
    "서로 다른 카드입니다. 잠깐 보여준 뒤 다시 닫습니다.";

  setTimeout(() => {
    firstCard.isFlipped = false;
    secondCard.isFlipped = false;
    selectedCards = [];
    isBusy = false;
    renderBoard();
    guideTextElement.textContent =
      "카드가 다시 닫혔습니다. 다른 카드 조합을 다시 선택해보세요.";
  }, 800);
}

function handleTileClick(event) {
  const clickedCardId = event.currentTarget.dataset.cardId;
  const clickedCard = board.find((card) => card.id === clickedCardId);

  // 카드 비교 중일 때는 새로운 클릭을 잠시 막습니다.
  if (isBusy) {
    return;
  }

  // 이미 뒤집힌 카드나 맞춘 카드는 다시 처리하지 않습니다.
  if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) {
    return;
  }

  clickedCard.isFlipped = true;
  selectedCards.push(clickedCard);

  attemptCount += 1;
  updateAttemptCount();
  renderBoard();

  guideTextElement.textContent = `카드 ${clickedCardId} 를 뒤집었습니다.`;

  if (selectedCards.length === 2) {
    isBusy = true;
    checkForMatch();
  }
}

function createTileElement(card) {
  const tileElement = document.createElement("button");

  tileElement.type = "button";
  let tileClassName = "tile";

  if (!card.isFlipped) {
    tileClassName += " is-hidden";
  }

  if (card.isMatched) {
    tileClassName += " is-matched";
  }

  tileElement.className = tileClassName;
  tileElement.textContent = card.isFlipped ? card.symbol : "?";

  // 화면에 그린 버튼이 어떤 카드 데이터와 연결되는지 저장합니다.
  tileElement.dataset.cardId = card.id;
  tileElement.dataset.pairId = String(card.pairId);
  tileElement.dataset.symbol = card.symbol;
  tileElement.setAttribute(
    "aria-label",
    card.isFlipped ? `뒤집힌 카드 ${card.symbol}` : "숨겨진 퍼즐 카드"
  );

  tileElement.addEventListener("click", handleTileClick);

  return tileElement;
}

function renderBoard() {
  gameBoardElement.innerHTML = "";

  // board 배열에 있는 카드 데이터를 읽어서
  // 게임판에 버튼 형태의 카드를 하나씩 그립니다.
  board.forEach((card) => {
    const tileElement = createTileElement(card);
    gameBoardElement.appendChild(tileElement);
  });
}

function resetGame() {
  attemptCount = 0;
  score = 0;
  board = createBoard();
  selectedCards = [];
  isBusy = false;
  updateAttemptCount();
  updateScore();
  renderBoard();
  guideTextElement.textContent =
    "모든 카드를 다시 섞었습니다. 지금은 카드 내용이 보이지 않는 상태로 시작합니다.";
}

resetButton.addEventListener("click", resetGame);

board = createBoard();
console.table(board);

updateAttemptCount();
updateScore();
renderBoard();
guideTextElement.textContent =
  "카드 배열을 기준으로 게임판을 만들었습니다. 카드는 처음에 숨겨져 있고, 클릭할 수 있습니다.";
