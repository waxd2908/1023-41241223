// 基本設置
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var ballRadius = 10;
var x, y;
var dx, dy;
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX;
var rightPressed = false;
var leftPressed = false;
var brickRowCount;
var brickColumnCount;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;
var score = 0;
var lives = 3;
var bricks = [];
var difficulty = "easy";
var gameOver = false;
var win = false; // 新增變數來標記獲勝狀態
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
var ballTrail = []; // 用於存儲球的歷史位置
var maxTrailLength = 15; // 最大尾跡長度
// 設置背景主題
var currentBackground = "night"; // 默認背景主題

// 背景主題選擇
function setBackground(theme) {
    currentBackground = theme; // 設置當前背景主題
}

// 繪製背景
function drawBackground() {
    if (currentBackground === "night") {
        // 夜空背景
        ctx.fillStyle = "#000022"; // 深藍色背景
        ctx.fillRect(0, 0, canvas.width, canvas.height);

    } else if (currentBackground === "forest") {
        // 森林背景
        ctx.fillStyle = "#228B22"; // 綠色背景
        ctx.fillRect(0, 0, canvas.width, canvas.height);

    }
}
// 初始化遊戲
function initGame() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    paddleX = (canvas.width - paddleWidth) / 2;
    score = 0;
    lives = 3;
    gameOver = false;
    win = false; // 重置獲勝狀態

    resetBricks();
}

// 磚塊動態生成
function resetBricks() {
    bricks = []; // 清空磚塊
    for (var c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (var r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, hits: 0 }; // 初始化hits為0
        }
    }

    // 在這裡根據難度重新設定磚塊的強度
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            if (difficulty === "easy") {
                bricks[c][r].hits = 1; // 磚塊只需一次擊打即可破壞
            } else if (difficulty === "medium") {
                bricks[c][r].hits = (Math.random() < 0.5) ? 1 : 2; // 隨機設定為1或2
            } else if (difficulty === "hard") {
                bricks[c][r].hits = (Math.random() < 0.5) ? 2 : 3; // 磚塊需要兩次或三次擊打才能破壞
            }
        }
    }
}



// 設置難度
function setDifficulty(level) {
    difficulty = level; // 設置難度
    if (level === "easy") {
        dx = 2.5; // 球速較慢
        dy = -2.5;
        brickRowCount = 3; // 磚塊數量少
        brickColumnCount = 5;
        brickWidth = 100;
        brickHeight = 20;
        brickOffsetTop = 30;
        brickOffsetLeft = 30;
    } else if (level === "medium") {
        dx = 3.5; // 球速中等
        dy = -3.5;
        brickRowCount = 5; // 磚塊數量較多
        brickColumnCount = 8;
        brickWidth = 60; 
        brickHeight = 20;
        brickOffsetTop = 30;
        brickOffsetLeft = 20; 
    } else if (level === "hard") {
        dx = 4.5; // 球速較快
        dy = -4.5;
        brickRowCount = 6; // 磚塊數量多
        brickColumnCount = 9; 
        brickWidth = 55; 
        brickHeight = 20;
        brickOffsetTop = 30;
        brickOffsetLeft = 20; 
    }

    resetBricks(); // 生成磚塊
    initGame(); // 初始化遊戲
    document.getElementById("difficulty-buttons").style.display = "none"; // 隱藏難度按鈕
    draw(); // 開始繪製遊戲
}


// 畫球和尾跡
function drawBall() {
    // 繪製尾跡
    for (let i = 0; i < ballTrail.length; i++) { // 從最舊的尾跡開始繪製
        const trail = ballTrail[i];
        ctx.beginPath();
        const radius = ballRadius * (1 - (i / maxTrailLength)); // 尾跡的半徑
        ctx.arc(trail.x, trail.y, radius, Math.PI * 2, 0);
        
        // 設置漸變顏色
        const alpha = 1 - (i / maxTrailLength);
        ctx.fillStyle = `rgba(0, 149, 221, ${alpha})`; // 漸變透明度
        ctx.fill();
        ctx.closePath();
    }

    // 繪製當前球
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD"; // 當前球的顏色
    ctx.fill();
    ctx.closePath();
}

// 畫擋板
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// 畫磚塊
function drawBricks() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status > 0) {
                var brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                var brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                ctx.beginPath();
                // 根據hits值設定顏色
                if (bricks[c][r].hits === 1) {
                    ctx.fillStyle = "#0095DD"; // 單次擊打顏色
                } else if (bricks[c][r].hits === 2) {
                    ctx.fillStyle = "#FFAA00"; // 兩次擊打顏色
                } else if (bricks[c][r].hits === 3) {
                    ctx.fillStyle = "#FF0000"; // 三次擊打顏色
                }
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}


// 碰撞檢測
function collisionDetection() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            var b = bricks[c][r];
            if (b.status > 0) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy; // 反彈
                    b.hits--; // 減少擊打次數
                    if (b.hits === 0) {
                        b.status = 0; // 磚塊被打破
                        score++; // 獲得分數
                    }
                }
            }
        }
    }
}

// 畫分數
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

// 畫生命
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}
function keyDownHandler(event) {
    if (event.key === "Right" || event.key === "ArrowRight") {
        rightPressed = true;
    } else if (event.key === "Left" || event.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(event) {
    if (event.key === "Right" || event.key === "ArrowRight") {
        rightPressed = false;
    } else if (event.key === "Left" || event.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// 遊戲主要畫面
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 在尾跡數組中添加當前球的位置
    ballTrail.push({ x: x, y: y });
    if (ballTrail.length > maxTrailLength) {
        ballTrail.shift(); // 刪除最舊的位置
    }

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    // 邊界檢測
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            if (!lives) {
                gameOver = true; // 標記遊戲結束
                return; // 結束遊戲循環
            } else {
                // 重置球位置
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 3.5; // 根據難度設定速度
                dy = -Math.abs(dy); // 保持向上運動
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    // 擋板移動
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7; // 向右移動
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7; // 向左移動
    }

    // 更新球的位置
    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

// 設置難度按鈕的事件
document.getElementById("easy-button").addEventListener("click", function () {
    setDifficulty("easy");
});
document.getElementById("medium-button").addEventListener("click", function () {
    setDifficulty("medium");
});
document.getElementById("hard-button").addEventListener("click", function () {
    setDifficulty("hard");
});

// 設置背景主題
var currentBackground = "night"; // 默認背景主題

// 背景主題選擇
function setBackground(theme) {
    currentBackground = theme; // 設置當前背景主題
}

// 繪製背景
function drawBackground() {
    if (currentBackground === "night") {
        // 夜空背景
        ctx.fillStyle = "#000022"; // 深藍色背景
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        
    } else if (currentBackground === "forest") {
        // 森林背景
        ctx.fillStyle = "#228B22"; // 綠色背景
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        
    }
}

// 更新畫面時的球位置
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); // 在清空畫布後繪製背景

    // 其他繪製方法
    ballTrail.push({ x: x, y: y });
    if (ballTrail.length > maxTrailLength) {
        ballTrail.shift();
    }

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    // 邊界檢測
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            if (!lives) {
                gameOver = true;
                return;
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 3.5;
                dy = -Math.abs(dy);
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    // 擋板移動
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

// 設置背景按鈕的事件
document.getElementById("night-button").addEventListener("click", function () {
    setBackground("night");
});
document.getElementById("forest-button").addEventListener("click", function () {
    setBackground("forest");
});

// 開始遊戲
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("difficulty-buttons").style.display = "block"; // 顯示難度按鈕
    document.getElementById("background-buttons").style.display = "block"; // 顯示背景按鈕
});

