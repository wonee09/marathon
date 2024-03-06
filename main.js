/** 게임종료 시 컴포넌트 */
const restartButton = document.getElementById("restartButton");
const gameoverDiv = document.getElementById("gameover");

/** 캔버스 */
const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 500;
const ctx = canvas.getContext("2d");

/** 캔버스 배경 이미지 */
const BG_MOVING_SPEED = 5;
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
const CACTUS_WIDTH = 30; // 장애물 너비
const CACTUS_HEIGHT = 30; // 장애물 높이
const CACTUS_FREQUENCY = 50; // 장애물 생성 빈도

/** 게임 변수 */
let timer = 0; // 장애물 생성 시간
let cactusArray = []; // 장애물 배열(*장애물이 여러개일 수 있기 때문에 배열로 관리함)
let gameOver = false; // 게임 종료 여부
let jump = false; // 점프 여부

/**
 * 게임을 재시작하는 함수
 */
function restartGame() {
  gameOver = false;
  cactusArray = [];
  timer = 0;
  score = 0;
  animate();
}

// 게임 재시작 버튼 클릭 이벤트
restartButton.addEventListener("click", function () {
  restartButton.style.display = "none";
  scoreText.innerHTML = "현재점수: " + 0;
  restartGame();
});

// 르탄이 객체
const rtan = {
  x: RTAN_INITIAL_X_POSITION,
  y: RTAN_INITIAL_Y_POSITION,
  width: RTAN_WIDTH,
  height: RTAN_HEIGHT,
  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  },
};

// 장애물 객체 생성을 위한 클래스
class Cactus {
  constructor() {
    this.x = canvas.width;
    this.y = Math.floor(Math.random() * (canvas.height - CACTUS_HEIGHT));
    this.width = CACTUS_WIDTH;
    this.height = CACTUS_HEIGHT;
  }
  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

/**
 * 게임 애니메이션 함수
 */
function animate() {
  if (gameOver) {
    return;
  }

  // 배경 이미지 그리기
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, bgX + canvas.width, 0, canvas.width, canvas.height);

  bgX -= BG_MOVING_SPEED;
  if (bgX < -canvas.width) bgX = 0;

  timer++;

  if (timer % CACTUS_FREQUENCY === 0) {
    var cactus = new Cactus();
    cactusArray.push(cactus);
  }

  cactusArray.forEach((a) => {
    // x가 0보다 작아지면 화면 밖으로 나가는 것이므로 삭제
    if (a.x < -CACTUS_WIDTH) {
      cactusArray.shift();
      score += 10;
      scoreText.innerHTML = "현재점수: " + score;
    }

    a.x -= 7; // 한 프레임이 지날 때마다 장애물을 왼쪽으로 7씩 이동

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

/**
 * 충돌 체크 함수
 */
function collision(first, second) {
  return !(
    first.x > second.x + second.width ||
    first.x + first.width < second.x ||
    first.y > second.y + second.height ||
    first.y + first.height < second.y
  );
}

document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    jump = true;
  }
});
