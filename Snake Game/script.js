// Game Constants
const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const INITIAL_SPEED = 500;
const SPEED_INCREASE = 5;

// Game Variables
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let gameOver = false;
let gamePaused = false;
let gameRunning = false;
let speedMultiplier = 1;
let currentUser = null;

// Local Storage Keys
const STORAGE_KEY = 'snakeGameUsers';

// DOM Elements
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const changeUserBtn = document.getElementById('changeUserBtn');
const createUserBtn = document.getElementById('createUserBtn');
const modalCreateBtn = document.getElementById('modalCreateBtn');
const usernameInput = document.getElementById('usernameInput');
const modalUsernameInput = document.getElementById('modalUsernameInput');
const currentUserSpan = document.getElementById('currentUser');
const scoreSpan = document.getElementById('score');
const highScoreSpan = document.getElementById('highScore');
const levelSpan = document.getElementById('level');
const userList = document.getElementById('userList');
const modalUserList = document.getElementById('modalUserList');
const leaderboardContent = document.getElementById('leaderboardContent');
const userModal = document.getElementById('userModal');
const closeBtn = document.querySelector('.close');

let gameLoopId = null;
let currentSpeed = INITIAL_SPEED;

// ==================== USER MANAGEMENT ====================

class User {
    constructor(name) {
        this.name = name;
        this.highScore = 0;
        this.createdAt = new Date().toLocaleDateString();
    }
}

function loadUsers() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function createUser(username) {
    // Validate username
    if (username.length < 3 || username.length > 20) {
        alert('Username must be between 3 and 20 characters');
        return null;
    }

    const users = loadUsers();
    const userExists = users.some(u => u.name.toLowerCase() === username.toLowerCase());

    if (userExists) {
        alert('Username already exists!');
        return null;
    }

    const newUser = new User(username);
    users.push(newUser);
    saveUsers(users);
    updateUserDisplay();
    return newUser;
}

function deleteUser(username) {
    let users = loadUsers();
    users = users.filter(u => u.name !== username);
    saveUsers(users);
    if (currentUser && currentUser.name === username) {
        currentUser = null;
        currentUserSpan.textContent = 'Guest';
    }
    updateUserDisplay();
    updateLeaderboard();
}

function selectUser(user) {
    currentUser = user;
    currentUserSpan.textContent = user.name;
    updateHighScore();
    userModal.style.display = 'none';
    updateUserDisplay();
    resetGame();
}

function updateUserDisplay() {
    const users = loadUsers();
    
    // Update main user list
    userList.innerHTML = '';
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item' + (currentUser && currentUser.name === user.name ? ' selected' : '');
        userItem.innerHTML = `
            <div>
                <div class="user-item-name">${user.name}</div>
                <small style="color: #999;">High Score: ${user.highScore}</small>
            </div>
            <div class="user-item-score">${user.highScore}</div>
        `;
        userItem.onclick = () => selectUser(user);
        userList.appendChild(userItem);
    });

    // Update modal user list
    modalUserList.innerHTML = '';
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div>
                <div class="user-item-name">${user.name}</div>
                <small style="color: #999;">High Score: ${user.highScore}</small>
            </div>
            <div class="user-item-score">${user.highScore}</div>
        `;
        userItem.onclick = () => selectUser(user);
        modalUserList.appendChild(userItem);
    });

    if (users.length === 0) {
        userList.innerHTML = '<div class="empty-message">No users yet. Create one to get started!</div>';
        modalUserList.innerHTML = '<div class="empty-message">No users yet. Create one to get started!</div>';
    }
}

function updateLeaderboard() {
    const users = loadUsers();
    const sortedUsers = [...users].sort((a, b) => b.highScore - a.highScore);

    leaderboardContent.innerHTML = '';

    if (sortedUsers.length === 0) {
        leaderboardContent.innerHTML = '<div class="empty-message">No scores yet. Create a user and play!</div>';
        return;
    }

    sortedUsers.forEach((user, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
        const leaderboardItem = document.createElement('div');
        const topClass = rank <= 3 ? `leaderboard-item top-${rank}` : 'leaderboard-item';
        leaderboardItem.className = topClass;
        leaderboardItem.innerHTML = `
            <span class="leaderboard-rank">${medal} #${rank}</span>
            <span class="leaderboard-name">${user.name}</span>
            <span class="leaderboard-score">${user.highScore}</span>
        `;
        leaderboardContent.appendChild(leaderboardItem);
    });
}

// ==================== GAME LOGIC ====================

function generateFood() {
    let newFood;
    let onSnake = true;

    while (onSnake) {
        newFood = {
            x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
        };
        onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }

    food = newFood;
}

function update() {
    if (gameOver || gamePaused) return;

    // Update direction
    direction = nextDirection;

    // Calculate new head
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check wall collision
    if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || 
        head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
        endGame();
        return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    // Add new head
    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10 * speedMultiplier;
        generateFood();
    } else {
        snake.pop();
    }

    scoreSpan.textContent = score;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid (optional but nice for visibility)
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
        } else {
            // Body
            ctx.fillStyle = '#00cc00';
            ctx.shadowColor = 'none';
            ctx.shadowBlur = 0;
        }
        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
    });
    ctx.shadowColor = 'none';

    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 1,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowColor = 'none';

    // Draw pause message
    if (gamePaused && gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    }

    // Draw game over message
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 20);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 20);
    }
}

function gameLoop() {
    update();
    draw();
}

function startGame() {
    if (!currentUser) {
        openUserModal();
        return;
    }

    if (gameRunning) return;

    gameRunning = true;
    gameOver = false;
    gamePaused = false;
    score = 0;
    speedMultiplier = 1;
    currentSpeed = INITIAL_SPEED;
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    generateFood();

    scoreSpan.textContent = '0';
    levelSpan.textContent = '1';

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;

    if (gameLoopId) clearInterval(gameLoopId);
    gameLoopId = setInterval(() => {
        gameLoop();
    }, currentSpeed);
}

function pauseGame() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
    draw();
}

function endGame() {
    gameOver = true;
    gameRunning = false;
    clearInterval(gameLoopId);

    // Save high score
    if (currentUser) {
        let users = loadUsers();
        const userIndex = users.findIndex(u => u.name === currentUser.name);
        if (userIndex !== -1) {
            if (score > users[userIndex].highScore) {
                users[userIndex].highScore = score;
                currentUser.highScore = score;
            }
            saveUsers(users);
            updateLeaderboard();
            updateUserDisplay();
            updateHighScore();
        }
    }

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    draw();
}

function resetGame() {
    gameRunning = false;
    gameOver = false;
    gamePaused = false;
    clearInterval(gameLoopId);

    score = 0;
    speedMultiplier = 1;
    currentSpeed = INITIAL_SPEED;
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    generateFood();

    scoreSpan.textContent = '0';
    levelSpan.textContent = '1';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';

    draw();
}

function updateHighScore() {
    if (currentUser) {
        highScoreSpan.textContent = currentUser.highScore || '0';
    } else {
        highScoreSpan.textContent = '0';
    }
}

// ==================== EVENT LISTENERS ====================

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) return;

    switch (e.key) {
        case 'ArrowUp':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
        case ' ':
            pauseGame();
            e.preventDefault();
            break;
    }
});

// Button Event Listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);
changeUserBtn.addEventListener('click', openUserModal);

createUserBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        const newUser = createUser(username);
        if (newUser) {
            usernameInput.value = '';
            selectUser(newUser);
        }
    }
});

modalCreateBtn.addEventListener('click', () => {
    const username = modalUsernameInput.value.trim();
    if (username) {
        const users = loadUsers();
        let user = users.find(u => u.name.toLowerCase() === username.toLowerCase());
        if (!user) {
            user = createUser(username);
        } else {
            user = users.find(u => u.name === user.name);
        }
        if (user) {
            modalUsernameInput.value = '';
            selectUser(user);
        }
    }
});

// Modal Functions
function openUserModal() {
    userModal.style.display = 'block';
}

closeBtn.addEventListener('click', () => {
    userModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === userModal) {
        userModal.style.display = 'none';
    }
});

// Input validation
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        createUserBtn.click();
    }
});

modalUsernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        modalCreateBtn.click();
    }
});

// ==================== INITIALIZATION ====================

function init() {
    resetGame();
    updateUserDisplay();
    updateLeaderboard();
    updateHighScore();

    // Load last selected user if available
    const users = loadUsers();
    if (users.length > 0) {
        // Select first user by default
        selectUser(users[0]);
    }
}

// Start the game
init();
