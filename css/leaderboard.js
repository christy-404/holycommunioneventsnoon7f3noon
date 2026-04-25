/**
 * Full Quiz Leaderboard
 * Standalone page for viewing complete quiz standings
 */

(function() {
  'use strict';

  const leaderboardList = document.getElementById('fullLeaderboardList');
  const leaderboardEmpty = document.getElementById('leaderboardEmpty');
  const leaderboardStats = document.getElementById('leaderboardStats');
  const entryCountEl = document.getElementById('entryCount');
  const topScoreEl = document.getElementById('topScore');

  if (!leaderboardList) return;

  const LS_ENTRIES = 'emmanuelQuizEntries';
  const LS_PLAYER = 'emmanuelQuizPlayerName';

  function getEntries() {
    try {
      return JSON.parse(localStorage.getItem(LS_ENTRIES)) || [];
    } catch (e) {
      return [];
    }
  }

  function getSavedPlayerName() {
    return localStorage.getItem(LS_PLAYER) || '';
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

  function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderLeaderboard() {
    const board = getLeaderboard();
    const currentPlayer = getSavedPlayerName().toLowerCase().trim();

    if (board.length === 0) {
      leaderboardList.style.display = 'none';
      leaderboardEmpty.style.display = 'block';
      if (leaderboardStats) leaderboardStats.style.display = 'none';
      return;
    }

    leaderboardList.style.display = 'flex';
    leaderboardEmpty.style.display = 'none';
    if (leaderboardStats) leaderboardStats.style.display = 'flex';

    if (entryCountEl) entryCountEl.textContent = board.length;
    if (topScoreEl) topScoreEl.textContent = `${board[0].score} / ${board[0].totalQuestions || 10}`;

    leaderboardList.innerHTML = '';

    board.forEach((entry, index) => {
      const rank = index + 1;
      const isCurrent = currentPlayer && entry.name.toLowerCase().trim() === currentPlayer;
      const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : 'rank-default';
      const totalQuestions = entry.totalQuestions || 10;
      const timeText = formatDate(entry.date);

      const item = document.createElement('div');
      item.className = `full-leaderboard-item ${rankClass} ${isCurrent ? 'is-current' : ''}`;
      item.style.animationDelay = `${Math.min(index * 0.04, 1.5)}s`;

      item.innerHTML = `
        <div class="lb-rank-col">
          <span class="lb-rank-number">#${rank}</span>
        </div>
        <div class="lb-info-col">
          <div class="lb-name">${escapeHtml(entry.name)}${isCurrent ? ' <span class="you-badge">You</span>' : ''}</div>
          <div class="lb-time">${timeText}</div>
        </div>
        <div class="lb-score-col">
          <span class="lb-score">${entry.score}</span>
          <span class="lb-total">/ ${totalQuestions}</span>
        </div>
      `;

      leaderboardList.appendChild(item);
    });
  }

  // ---- Initialize ----
  renderLeaderboard();

  // Refresh on storage changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === LS_ENTRIES) {
      renderLeaderboard();
    }
  });
})();

