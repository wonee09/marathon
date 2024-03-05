/** 게임종료 시 컴포넌트 */
const restartButton = document.getElementById("restartButton");
const gameoverDiv = document.getElementById("gameover");

/** 캔버스 */
const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 500;
const ctx = canvas.getContext("2d");

/** 캔버스 배경 이미지 */
const bgImage = new Image();
bgImage.src = "./assets/track.png";
let bgX = 0;

/** 점수 */
let scoreText = document.getElementById("score");
let score = 0;

/** 르탄이 변수 */
const RTAN_WIDTH = 100;
const RTAN_HEIGHT = 100;
const RTAN_INITIAL_X_POSITION = 10;
const RTAN_INITIAL_Y_POSITION = 400;

/** 장애물 변수 */
const CACTUS_WIDTH = 30;
const CACTUS_HEIGHT = 30;

function restartGame() {
  gameOver = false;
  cactusArray = [];
  timer = 0;
  score = 0;
  animate();
}

restartButton.addEventListener("click", function () {
  restartButton.style.display = "none";
  scoreText.innerHTML = "현재점수: " + 0;
  restartGame();
});

var rtan = {
  x: RTAN_INITIAL_X_POSITION,
  y: RTAN_INITIAL_Y_POSITION,
  width: RTAN_WIDTH,
  height: RTAN_HEIGHT,
  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  },
};

class Cactus {
  constructor() {
    this.x = canvas.width;
    this.y = Math.floor(Math.random() * 470);
    this.width = CACTUS_WIDTH;
    this.height = CACTUS_HEIGHT;
  }
  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

var timer = 0;
var cactusArray = [];
var gameOver = false;

function animate() {
  if (gameOver) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, bgX + canvas.width, 0, canvas.width, canvas.height);

  bgX -= 5;
  if (bgX < -canvas.width) bgX = 0;

  timer++;

  if (timer % 50 === 0) {
    var cactus = new Cactus();
    cactusArray.push(cactus);
  }

  cactusArray.forEach((a) => {
    // x가 0보다 작아지면 화면 밖으로 나가는 것이므로 삭제
    if (a.x < -30) {
      cactusArray.shift();
      score += 10;
      scoreText.innerHTML = "현재점수: " + score;
    }

    a.x -= 7;

    if (collision(rtan, a)) {
      timer = 0;
      gameOver = true;

      jump = false;

      ctx.fillStyle = "black";
      ctx.font = "30px Arial";
      ctx.fillText("Game Over", canvas.width / 2 - 65, canvas.height / 2 - 50);

      restartButton.style.display = "block";
      return;
    }

    a.draw();
  });

  if (jump) {
    rtan.y -= 4;
    timer++;
  } else {
    if (rtan.y < 400) {
      rtan.y += 4;
    }
  }
  if (timer > 100) {
    jump = false;
    timer = 0;
  }

  rtan.draw();
  if (!gameOver) {
    requestAnimationFrame(animate);
  }
}

animate();

// collision detection
// check if two objects are colliding
function collision(first, second) {
  return !(
    first.x > second.x + second.width ||
    first.x + first.width < second.x ||
    first.y > second.y + second.height ||
    first.y + first.height < second.y
  );
}

var jump = false;
document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    jump = true;
  }
});
