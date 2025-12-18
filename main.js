document.addEventListener('DOMContentLoaded', () => {
	const gameGrid = document.querySelector('.game-grid');
	const SIZE = 4;
	
	let board = [];
	let currentScore = 0;
	const currentScoreElement = document.querySelector('.current-score');
	const highScoreElement = document.querySelector('.high-score');

	let highScore = parseInt(localStorage.getItem('2048-highScore')) || 0;
	highScoreElement.textContent = highScore;

	const gameOverElement = document.querySelector('.game-over');

	function updateScore(points) {
		currentScore += points;
		currentScoreElement.textContent = currentScore;
		if (currentScore > highScore) {
			highScore = currentScore;
			highScoreElement.textContent = highScore;
			localStorage.setItem('2048-highScore', highScore);
		}
	}
	function restartGame() {
		currentScore = 0;
		currentScoreElement.textContent = '0';
		gameOverElement.style.display = 'none';
		initializeGame();
	}
	function initializeGame() {
		board = [...Array(SIZE)].map(() => Array(SIZE).fill(0));
		placeRandom();
		placeRandom();
		renderBoard();
	}
	function renderBoard() {
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
				const prevValue = cell.dataset.value;
				const currentValue = board[i][j];
				if (currentValue !== 0) {
					cell.dataset.value = currentValue;
					cell.textContent = currentValue;
					if (parseInt(prevValue) !== currentValue && !cell.classList.contains('new-tile')) {
						cell.classList.add('merged-tile')
					}
				} else {
					cell.textContent = '';
					delete cell.dataset.value;
					cell.classList.remove('merged-tile', 'new-tile');
				}
			}
		}
		setTimeout(() => {
			const cells = document.querySelectorAll('.game-grid div');
			cells.forEach(cell => {
				cell.classList.remove('merged-tile', 'new-tile');
			})
		}, 300);
	}
	function placeRandom() {
		const available = [];
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				if (board[i][j] === 0) {
					available.push({i, j })
				}
			}
		}
		if (available.length > 0) {
			const randomCell = available[Math.floor(Math.random() * available.length)];
			board[randomCell.i][randomCell.j] = Math.random() < 0.9 ? 2 : 4;
			const cell = document.querySelector(`[data-row="${randomCell.i}"][data-col="${randomCell.j}"]`);
			cell.classList.add('new-tile');
		}
	}
	function move(direction) {
		let hasChanged = false;
		if (direction === 'ArrowUp' || direction === 'ArrowDown') {
			for (let j = 0; j < SIZE; j++) {
				const column = [...Array(SIZE)].map((_, i) => board[i][j]);
				const newColumn = transform(column, direction === 'ArrowUp');
				for (let i = 0; i < SIZE; i++) {
					if (board[i][j] !== newColumn[i]) {
						hasChanged = true;
						board[i][j] = newColumn[i];
					}
				}
			}
		} else if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
			for (let i = 0; i < SIZE; i++) {
				const row = board[i];
				const newRow = transform(row, direction === 'ArrowLeft');
					if (row.join(',') !== newRow.join(',')) {
						hasChanged = true;
						board[i] = newRow;
					}
			}
		}
		if (hasChanged) {
			placeRandom();
			renderBoard();
			checkGameOver();
		}
	}
	function transform(line, moveTowardsStart) {
		let newLine = line.filter(cell => cell !== 0);
		if (!moveTowardsStart) {
			newLine.reverse();
		}
		for (let i = 0; i < newLine.length - 1; i++) {
			if (newLine[i] === newLine[i + 1]) {
				newLine[i] *= 2;
				updateScore(newLine[i]);
				newLine.splice(i + 1, 1);
			}
		}
		while (newLine.length < SIZE) {
			newLine.push(0);
		}
		if (!moveTowardsStart) {
			newLine.reverse();
		}
		return newLine;
	}
	function checkGameOver() {
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				if (board[i][j] === 0) {
					return;
				}
				if (j < SIZE - 1 && board[i][j] === board[i][j + 1]) {
					return;
				}
				if (i < SIZE - 1 && board[i][j] === board[i + 1][j]) {
					return;
				}
		  }
	  }
		gameOverElement.style.display = 'flex';
  }
	document.addEventListener('keydown', event => {
		if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
			move(event.key);
		}
	})
	document.querySelector('.restart-game').addEventListener('click', restartGame);
	initializeGame();

// Обработка свайпов для мобильных устройств

  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  const swipeThreshold = 50;
    document.addEventListener('touchstart', (e) => {
  const touch = e.changedTouches[0];
    touchStartX = touch.screenX;
    touchStartY = touch.screenY;
  });
  document.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    touchEndX = touch.screenX;
    touchEndY = touch.screenY;
    handleSwipe();
  });
  function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    if (Math.abs(deltaX) < swipeThreshold && Math.abs(deltaY) < swipeThreshold) {
        // Свайп слишком короткий — игнорируем
        return;
    }
   if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // горизонтальный свайп
        if (deltaX > 0) move('ArrowRight');
        else move('ArrowLeft');
   } else {
        // вертикальный свайп
        if (deltaY > 0) move('ArrowDown');
        else move('ArrowUp');
    }
}
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
});
