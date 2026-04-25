/**
 * Quiz About Emmanuel
 * Multiple choice quiz with leaderboard system
 */

(function() {
  'use strict';

  // ---- DOM Elements ----
  const nameEntryScreen = document.getElementById('nameEntryScreen');
  const alreadyPlayedScreen = document.getElementById('alreadyPlayedScreen');
  const quizContainer = document.getElementById('quizContainer');
  const resultScreen = document.getElementById('resultScreen');
  const questionText = document.getElementById('questionText');
  const answersGrid = document.getElementById('answersGrid');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const resultScore = document.getElementById('resultScore');
  const resultMessage = document.getElementById('resultMessage');
  const resultRank = document.getElementById('resultRank');
  const personalRankDisplay = document.getElementById('personalRankDisplay');
  const leaderboardList = document.getElementById('leaderboardList');
  const personalRankOutside = document.getElementById('personalRankOutside');
  const reviewList = document.getElementById('reviewList');
  const playerNameInput = document.getElementById('playerNameInput');
  const startQuizBtn = document.getElementById('startQuizBtn');
  const nameError = document.getElementById('nameError');

  // Already played elements
  const playedScore = document.getElementById('playedScore');
  const playedMessage = document.getElementById('playedMessage');
  const playedRankBadge = document.getElementById('playedRankBadge');
  const playedPersonalRank = document.getElementById('playedPersonalRank');
  const playedLeaderboardList = document.getElementById('playedLeaderboardList');
  const playedPersonalRankOutside = document.getElementById('playedPersonalRankOutside');
  const playedReviewList = document.getElementById('playedReviewList');

  if (!quizContainer) return;

  // ---- localStorage Keys ----
  const LS_ENTRIES = 'emmanuelQuizEntries';
  const LS_PLAYED = 'emmanuelQuizPlayed';
  const LS_PLAYER = 'emmanuelQuizPlayerName';

  // ---- Questions Data ----
  const questions = [
    {
      question: 'What is Emmanuel\'s favorite food?',
      answers: ['Pizza', 'Biriyani', 'Burgers', 'Pasta'],
      correct: 1
    },
    {
      question: 'What is Emmanuel\'s funniest habit?',
      answers: ['Talking in his sleep', 'Sleeping at the most random places', 'Dancing when no one is watching', 'Singing off-key on purpose'],
      correct: 1
    },
    {
      question: 'What was Emmanuel\'s favorite subject in school?',
      answers: ['Mathematics', 'Science', 'Physical Education', 'Art'],
      correct: 0
    },
    {
      question: 'What does Emmanuel want to be when he grows up?',
      answers: ['Engineer', 'Commercial Pilot', 'Teacher', 'Doctor'],
      correct: 1
    },
    {
      question: 'Which sport does Emmanuel enjoy the most?',
      answers: ['Football', 'Basketball', 'Swimming', 'Roller Skating'],
      correct: 3
    },
    {
      question: 'What is Emmanuel\'s favorite color?',
      answers: ['Blue', 'Red', 'Green', 'Gold'],
      correct: 2
    },
    {
      question: 'What is the name of Emmanuel\'s favorite video game?',
      answers: ['FIFA', 'Minecraft', 'Fortnite', 'Roblox'],
      correct: 3
    },
    {
      question: 'Where is Emmanuel\'s dream vacation destination?',
      answers: ['THE USA', 'ENGLAND', 'SAO PAULO(BRAZIL)', 'ITALY'],
      correct: 3
    },
    {
      question: 'Who named Emmanuel?',
      answers: ['His Mom', 'His brother', 'His Appa', 'His Grandparents'],
      correct: 0
    },
    {
      question: 'What is one thing Emmanuel always says?',
      answers: ['"I am hungry"', '"That is not fair"', '"Can we play a game?"', '"Family is everything"'],
      correct: 0
    }
  ];

  let currentQuestion = 0;
  let score = 0;
  let shuffledQuestions = [];
  let answered = false;
  let playerName = '';
  let userAnswers = [];

  // ---- localStorage Helpers ----
  function getEntries() {
    try {
      return JSON.parse(localStorage.getItem(LS_ENTRIES)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveEntry(entry) {
    const entries = getEntries();
    entries.push(entry);
    localStorage.setItem(LS_ENTRIES, JSON.stringify(entries));
  }

  function hasPlayed() {
    return localStorage.getItem(LS_PLAYED) === 'true';
  }

  function markPlayed(name) {
    localStorage.setItem(LS_PLAYED, 'true');
    localStorage.setItem(LS_PLAYER, name);
  }

  function getSavedPlayerName() {
    return localStorage.getItem(LS_PLAYER) || '';
  }

  function isDuplicateName(name) {
    const entries = getEntries();
    return entries.some(e => e.name.toLowerCase().trim() === name.toLowerCase().trim());
  }

  function getLeaderboard() {
    const entries = getEntries();
    return entries
      .map((e, index) => ({ ...e, originalIndex: index }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.date) - new Date(b.date);
      });
  }

  function getPlayerRank(name) {
    const board = getLeaderboard();
    const idx = board.findIndex(e => e.name.toLowerCase().trim() === name.toLowerCase().trim());
    return idx >= 0 ? idx + 1 : null;
  }

  function getPlayerEntry(name) {
    const entries = getEntries();
    return entries.find(e => e.name.toLowerCase().trim() === name.toLowerCase().trim()) || null;
  }

  // ---- Page Load: Check if Already Played ----
  function initPage() {
    if (hasPlayed()) {
      const savedName = getSavedPlayerName();
      const entry = getPlayerEntry(savedName);
      if (entry) {
        showAlreadyPlayed(entry);
      } else {
        // Edge case: flag set but no entry found
        showNameEntry();
      }
    } else {
      showNameEntry();
    }
  }

  function showNameEntry() {
    nameEntryScreen.style.display = 'block';
    alreadyPlayedScreen.style.display = 'none';
    quizContainer.style.display = 'none';
    resultScreen.style.display = 'none';
    playerNameInput.value = '';
    nameError.style.display = 'none';
    playerNameInput.focus();
  }

  function showAlreadyPlayed(entry) {
    nameEntryScreen.style.display = 'none';
    alreadyPlayedScreen.style.display = 'block';
    quizContainer.style.display = 'none';
    resultScreen.style.display = 'none';

    const total = entry.totalQuestions || questions.length;
    const percentage = (entry.score / total) * 100;

    playedScore.textContent = `${entry.score} / ${total}`;
    playedMessage.textContent = getRankMessage(percentage);
    playedRankBadge.textContent = getRankTitle(percentage);

    const rank = getPlayerRank(entry.name);
    if (rank) {
      playedPersonalRank.textContent = `Your Rank: #${rank}`;
      playedPersonalRank.style.display = 'block';
    } else {
      playedPersonalRank.style.display = 'none';
    }

    renderLeaderboard(playedLeaderboardList, playedPersonalRankOutside, entry.name);
    renderReview(playedReviewList, entry);
  }

  // ---- Name Entry ----
  function handleStartQuiz() {
    const rawName = playerNameInput.value.trim();
    if (rawName.length < 2 || rawName.length > 30) {
      nameError.style.display = 'block';
      return;
    }
    if (isDuplicateName(rawName)) {
      nameError.textContent = 'This name has already been used. Please use a different name.';
      nameError.style.display = 'block';
      return;
    }
    nameError.style.display = 'none';
    playerName = rawName;
    startQuiz();
  }

  startQuizBtn.addEventListener('click', handleStartQuiz);
  playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleStartQuiz();
  });
  playerNameInput.addEventListener('input', () => {
    nameError.style.display = 'none';
    nameError.textContent = 'Please enter a valid name (2-30 characters).';
  });

  // ---- Initialize Quiz ----
  function startQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    userAnswers = [];
    shuffledQuestions = shuffleArray(questions).map(q => ({
      ...q,
      answers: [...q.answers]
    }));

    nameEntryScreen.style.display = 'none';
    alreadyPlayedScreen.style.display = 'none';
    quizContainer.style.display = 'block';
    resultScreen.style.display = 'none';

    showQuestion();
  }

  // ---- Show Question ----
  function showQuestion() {
    answered = false;
    const q = shuffledQuestions[currentQuestion];

    // Update progress
    const progress = ((currentQuestion) / shuffledQuestions.length) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = `Question ${currentQuestion + 1} of ${shuffledQuestions.length}`;

    // Animate out old content
    const card = document.getElementById('questionCard');
    card.style.opacity = '0';
    card.style.transform = 'translateX(-20px)';

    setTimeout(() => {
      questionText.textContent = q.question;
      answersGrid.innerHTML = '';

      q.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerHTML = `<span class="answer-letter">${String.fromCharCode(65 + index)}</span><span class="answer-text">${answer}</span>`;
        btn.addEventListener('click', () => handleAnswer(index, btn));
        answersGrid.appendChild(btn);
      });

      // Animate in
      card.style.opacity = '1';
      card.style.transform = 'translateX(0)';
    }, 250);
  }

  // ---- Handle Answer ----
  function handleAnswer(selectedIndex, btnElement) {
    if (answered) return;
    answered = true;

    const q = shuffledQuestions[currentQuestion];
    const isCorrect = selectedIndex === q.correct;
    const allButtons = answersGrid.querySelectorAll('.answer-btn');

    userAnswers.push({
      question: q.question,
      selectedAnswer: q.answers[selectedIndex],
      selectedIndex: selectedIndex,
      correctAnswer: q.answers[q.correct],
      correctIndex: q.correct,
      isCorrect: isCorrect
    });

    if (isCorrect) {
      score++;
      btnElement.classList.add('correct');
      playTone(660, 0.3, 0.15);
      setTimeout(() => playTone(880, 0.3, 0.15), 100);
    } else {
      btnElement.classList.add('wrong');
      allButtons[q.correct].classList.add('correct');
      playTone(300, 0.4, 0.1);
    }

    // Disable all buttons
    allButtons.forEach(btn => btn.disabled = true);

    // Next question delay
    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < shuffledQuestions.length) {
        showQuestion();
      } else {
        finishQuiz();
      }
    }, 1500);
  }

  // ---- Finish Quiz ----
  function finishQuiz() {
    const total = shuffledQuestions.length;
    const percentage = (score / total) * 100;

    const entry = {
      name: playerName,
      score: score,
      totalQuestions: total,
      answers: userAnswers,
      date: new Date().toISOString()
    };

    saveEntry(entry);
    markPlayed(playerName);

    showResults(entry, percentage);
  }

  // ---- Show Results ----
  function showResults(entry, percentage) {
    quizContainer.style.display = 'none';
    resultScreen.style.display = 'block';

    resultScore.textContent = `${entry.score} / ${entry.totalQuestions}`;
    resultMessage.textContent = getRankMessage(percentage);
    resultRank.textContent = getRankTitle(percentage);

    const rank = getPlayerRank(entry.name);
    if (rank) {
      personalRankDisplay.textContent = `Your Rank: #${rank}`;
      personalRankDisplay.style.display = 'block';
    } else {
      personalRankDisplay.style.display = 'none';
    }

    renderReview(reviewList, entry);
    renderLeaderboard(leaderboardList, personalRankOutside, entry.name);

    // Confetti effect
    if (percentage >= 60) {
      createConfetti();
    }
  }

  // ---- Rank Helpers ----
  function getRankMessage(percentage) {
    if (percentage === 100) return 'Perfection! You know Emmanuel better than anyone. Truly a family legend!';
    if (percentage >= 80) return 'Outstanding! You clearly pay attention. Emmanuel is lucky to have you!';
    if (percentage >= 60) return 'Great effort! You know Emmanuel quite well. A few more gatherings and you will be an expert!';
    if (percentage >= 40) return 'Not bad! There is always more to learn about the people we love.';
    return 'Time to spend more quality time with Emmanuel! Every moment is a chance to learn something new.';
  }

  function getRankTitle(percentage) {
    if (percentage === 100) return 'Family Champion';
    if (percentage >= 80) return 'Expert';
    if (percentage >= 60) return 'Family Friend';
    if (percentage >= 40) return 'Acquaintance';
    return 'Need More Family Time';
  }

  // ---- Render Leaderboard ----
  function renderLeaderboard(container, outsideContainer, currentName) {
    const board = getLeaderboard();
    const top10 = board.slice(0, 10);
    const currentNameLower = currentName.toLowerCase().trim();
    const playerRank = getPlayerRank(currentName);

    container.innerHTML = '';

    if (top10.length === 0) {
      container.innerHTML = '<div class="leaderboard-empty">No entries yet. Be the first!</div>';
      outsideContainer.style.display = 'none';
      return;
    }

    top10.forEach((entry, index) => {
      const rank = index + 1;
      const isCurrent = entry.name.toLowerCase().trim() === currentNameLower;
      const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : 'rank-default';
      const item = document.createElement('div');
      item.className = `leaderboard-item ${rankClass} ${isCurrent ? 'is-current' : ''}`;
      item.innerHTML = `
        <div class="leaderboard-rank">#${rank}</div>
        <div class="leaderboard-name">${escapeHtml(entry.name)}${isCurrent ? ' <span class="you-badge">You</span>' : ''}</div>
        <div class="leaderboard-score">${entry.score} / ${entry.totalQuestions || questions.length}</div>
      `;
      container.appendChild(item);
    });

    if (playerRank && playerRank > 10) {
      outsideContainer.innerHTML = `<div class="personal-rank-outside-text">Your Rank: <strong>#${playerRank}</strong></div>`;
      outsideContainer.style.display = 'block';
    } else {
      outsideContainer.style.display = 'none';
    }
  }

  // ---- Render Review ----
  function renderReview(container, entry) {
    container.innerHTML = '';
    const answers = entry.answers || [];

    answers.forEach((a, index) => {
      const item = document.createElement('div');
      item.className = `review-item ${a.isCorrect ? 'review-correct' : 'review-wrong'}`;
      item.innerHTML = `
        <div class="review-header">
          <span class="review-number">${index + 1}</span>
          <span class="review-status">${a.isCorrect ? 'Correct' : 'Incorrect'}</span>
        </div>
        <div class="review-question">${escapeHtml(a.question)}</div>
        <div class="review-answers">
          <div class="review-selected ${a.isCorrect ? 'review-selected-correct' : 'review-selected-wrong'}">
            <span class="review-label">Your answer:</span> ${escapeHtml(a.selectedAnswer)}
          </div>
          ${!a.isCorrect ? `<div class="review-correct-answer"><span class="review-label">Correct answer:</span> ${escapeHtml(a.correctAnswer)}</div>` : ''}
        </div>
      `;
      container.appendChild(item);
    });
  }

  // ---- Utility ----
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ---- Confetti ----
  function createConfetti() {
    const colors = ['#d4af37', '#f0d878', '#a08020', '#ffffff', '#cbd5e1'];
    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: ${Math.random() * 8 + 4}px;
        height: ${Math.random() * 8 + 4}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        opacity: ${Math.random() * 0.5 + 0.5};
        animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
        animation-delay: ${Math.random() * 2}s;
        z-index: 1000;
        pointer-events: none;
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }
  }

  // ---- Sound ----
  function playTone(freq, duration, volume) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  // ---- Start ----
  initPage();
})();

