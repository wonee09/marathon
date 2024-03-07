/** 최초 게임 시작 판단 */
let gameStarted = false;

/** 캔버스 */
const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 500;
const ctx = canvas.getContext("2d");

/** 캔버스 관련 이미지 */
const BG_MOVING_SPEED = 5;
let bgX = 0;

/** 점수 */
let scoreText = document.getElementById("score");
let score = 0;

/** 르탄이 */
const RTAN_WIDTH = 100;
const RTAN_HEIGHT = 100;
const RTAN_INITIAL_X_POSITION = 10;
const RTAN_INITIAL_Y_POSITION = 400;

/** 장애물 */
const OBSTACLE_WIDTH = 30; // 장애물 너비
const OBSTACLE_HEIGHT = 30; // 장애물 높이
const OBSTACLE_FREQUENCY = 50; // 장애물 생성 빈도

/** 게임 변수 */
let timer = 0; // 장애물 생성 시간
let obstacleArray = []; // 장애물 배열(*장애물이 여러개일 수 있기 때문에 배열로 관리함)
let gameOver = false; // 게임 종료 여부
let jump = false; // 점프 여부

/** 오디오 객체 */
const jumpSound = new Audio();
jumpSound.src = "./assets/sounds/jump.mp3";
const bgmSound = new Audio();
bgmSound.src = "./assets/sounds/bgm.mp3";
const scoreSound = new Audio();
scoreSound.src = "./assets/sounds/score.mp3";
const defeatSound = new Audio();
defeatSound.src = "./assets/sounds/defeat2.mp3";

/** 이미지 */
// (1) 배경
const bgImage = new Image();
bgImage.src = "./assets/rtan_background.png";
// (2) 게임 시작
const startImage = new Image();
startImage.src = "./assets/rtan_start.png";
// (3) 게임 오버
const gameoverImage = new Image();
gameoverImage.src = "./assets/rtan_gameover.png";
// (4) 게임 재시작
const restartImage = new Image();
restartImage.src = "./assets/rtan_restart.png";
// (5) 달리는 르탄이 A
const rtanAImage = new Image();
rtanAImage.src = "./assets/rtan_running_a.png";
// (6) 달리는 르탄이 B
const rtanBImage = new Image();
rtanBImage.src = "./assets/rtan_running_b.png";
// (7) 게임 오버 르탄이
const rtanCrashImage = new Image();
rtanCrashImage.src = "./assets/rtan_crash.png";
// (8) 장애물
const rtan_obstacle = new Image();
rtan_obstacle.src = "./assets/rtan_obstacle.png";

/**
 * 게임 시작 화면을 그리는 함수
 */
function drawStartScreen() {
  // 배경 이미지 그리기
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

  const imageWidth = 473;
  const imageHeight = 316;
  const imageX = canvas.width / 2 - imageWidth / 2;
  const imageY = canvas.height / 2 - imageHeight / 2;

  ctx.drawImage(startImage, imageX, imageY, imageWidth, imageHeight);
}

/**
 * 게임을 재시작하는 함수
 */
function restartGame() {
  gameOver = false;
  obstacleArray = [];
  timer = 0;
  score = 0;
  scoreText.innerHTML = "현재점수: " + score;
  animate();
}

// 르탄이 객체
const rtan = {
  x: RTAN_INITIAL_X_POSITION,
  y: RTAN_INITIAL_Y_POSITION,
  width: RTAN_WIDTH,
  height: RTAN_HEIGHT,
  draw() {
    // when rtan crashes, draw crash image
    if (gameOver) {
      ctx.drawImage(rtanCrashImage, this.x, this.y, this.width, this.height);
      return;
    } else {
      if (timer % 20 > 10) {
        ctx.drawImage(rtanAImage, this.x, this.y, this.width, this.height);
      } else {
        ctx.drawImage(rtanBImage, this.x, this.y, this.width, this.height);
      }
    }
  },
};

// 장애물 객체 생성을 위한 클래스
class Obstacle {
  constructor() {
    this.x = canvas.width;
    this.y = Math.floor(Math.random() * (canvas.height - OBSTACLE_HEIGHT));
    this.width = OBSTACLE_WIDTH;
    this.height = OBSTACLE_HEIGHT;
  }
  draw() {
    ctx.drawImage(rtan_obstacle, this.x, this.y, this.width, this.height);
  }
}

/**
 * 게임 애니메이션 함수
 */
function animate() {
  if (!gameStarted) {
    drawStartScreen();
    return;
  }

  if (gameOver) {
    return;
  }

  bgmSound.play();

  // 배경 이미지 그리기
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, bgX + canvas.width, 0, canvas.width, canvas.height);

  bgX -= BG_MOVING_SPEED;
  if (bgX < -canvas.width) bgX = 0;

  timer++;

  if (timer % OBSTACLE_FREQUENCY === 0) {
    const obstacle = new Obstacle();
    obstacleArray.push(obstacle);
  }

  obstacleArray.forEach((a) => {
    // x가 0보다 작아지면 화면 밖으로 나가는 것이므로 삭제
    if (a.x < -OBSTACLE_WIDTH) {
      obstacleArray.shift();
      score += 10;
      scoreText.innerHTML = "현재점수: " + score;
      scoreSound.play();
      setTimeout(() => {
        scoreSound.pause(); // 일정 시간 후에 오디오 일시정지
        scoreSound.currentTime = 0; // 오디오 재생 위치를 시작으로 재설정
      }, 350); // 200ms 후에 오디오 일시정지
    }

    a.x -= 7; // 한 프레임이 지날 때마다 장애물을 왼쪽으로 7씩 이동

    if (collision(rtan, a)) {
      timer = 0;
      gameOver = true;

      jump = false;

      ctx.drawImage(
        gameoverImage,
        canvas.width / 2 - 100,
        canvas.height / 2 - 50,
        200,
        100
      );
      ctx.drawImage(
        restartImage,
        canvas.width / 2 - 50,
        canvas.height / 2 + 50,
        100,
        50
      );

      bgmSound.pause();
      defeatSound.play();

      return;
    }

    a.draw();
  });

  if (jump) {
    if (rtan.y < 0) {
      jump = false;
    } else {
      rtan.y -= 3;
    }
    timer++;
  } else {
    if (rtan.y < 400) {
      rtan.y += 3;
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

/**
 * 키보드 이벤트
 */
document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    jump = true;
    jumpSound.play(); // 점프 소리 재생
    setTimeout(() => {
      jumpSound.pause(); // 일정 시간 후에 오디오 일시정지
      jumpSound.currentTime = 0; // 오디오 재생 위치를 시작으로 재설정
    }, 200); // 200ms 후에 오디오 일시정지
  }
});

/**
 * 마우스 이벤트
 */
canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (
    !gameStarted &&
    x >= 0 &&
    x <= canvas.width &&
    y >= 0 &&
    y <= canvas.height
  ) {
    gameStarted = true;
    animate();
  }

  if (
    gameOver &&
    x >= canvas.width / 2 - 50 &&
    x <= canvas.width / 2 + 50 &&
    y >= canvas.height / 2 + 50 &&
    y <= canvas.height / 2 + 100
  ) {
    restartGame();
  }
});

canvas.addEventListener("mousemove", function (e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 게임오버 상태에서만 마우스 커서를 변경한다.
  if (
    gameOver &&
    x >= canvas.width / 2 - 50 &&
    x <= canvas.width / 2 + 50 &&
    y >= canvas.height / 2 + 50 &&
    y <= canvas.height / 2 + 100
  ) {
    canvas.style.cursor = "pointer";
  } else if (
    !gameStarted &&
    x >= 0 &&
    x <= canvas.width &&
    y >= 0 &&
    y <= canvas.height
  ) {
    canvas.style.cursor = "pointer";
  } else {
    canvas.style.cursor = "default";
  }
});

/**
 * 두 개의 이미지가 모두 로드되면 게임 시작 화면을 그린다.
 */
let bgImageLoaded = new Promise((resolve) => {
  bgImage.onload = resolve;
});

let startImageLoaded = new Promise((resolve) => {
  startImage.onload = resolve;
});

Promise.all([bgImageLoaded, startImageLoaded]).then(drawStartScreen);
