const canvas = document.getElementById("seasonCanvas");
const ctx = canvas.getContext("2d");

// Canvasサイズを画面に合わせる
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// 季節管理
let seasonIndex = 0;
const seasons = ["春", "夏", "秋", "冬"];
let autoMode = false;

// パーティクル配列（花びら・葉・雪）
let particles = [];
let wind = 0; // 冬の風
let snowPhase = 0;

// 春の桜木用
let sakuraBranches = [];
let sakuraFlowers = [];

// 夏の雲
let summerClouds = [];

// 秋の枯れ木用
let autumnTreeBranches = [];

// 季節ごとの設定
const seasonSettings = {
  春: { 
    bgColor: "#aee1f9",
    particleCount: 15,
    colors: ["rgba(252,228,236,0.8)","rgba(248,187,208,0.8)","rgba(244,143,177,0.8)"]
  },
  夏: {
    bgColor: "#8cd3ff",
    particleCount: 5,
    colors: ["rgba(255,255,255,0.9)"]
  },
  秋: {
    bgColor: "#d9a066",
    particleCount: 10,
    colors: ["rgba(227,197,101,0.8)","rgba(192,139,48,0.8)","rgba(181,137,41,0.8)"]
  },
  冬: {
    bgColor: "#cfd8dc",
    particleCount: 40,
    colors: ["rgba(255,255,255,0.9)"]
  }
};

/** パーティクル初期化 */
function initParticles() {
  particles = [];
  const season = seasons[seasonIndex];
  const set = seasonSettings[season];

  // パーティクル生成
  for (let i = 0; i < set.particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 5 + Math.random() * 10,
      speed: season === "冬" ? 1 + Math.random()*1.5 : 0.2 + Math.random()*0.8,
      color: set.colors[Math.floor(Math.random() * set.colors.length)],
      angle: Math.random() * Math.PI * 2
    });
  }

  // 春の桜木用に枝と花を生成（初回のみ）
  if (season === "春" && sakuraBranches.length === 0) {
    for (let i = 0; i < 6; i++) {
      sakuraBranches.push({
        x: Math.random() * 80 - 40,
        y: -150 - Math.random() * 50
      });
    }

    for (let i = 0; i < 150; i++) {
      sakuraFlowers.push({
        x: Math.random() * 150 - 75,
        y: -150 - Math.random() * 100,
        color: ["rgba(252,228,236,0.8)","rgba(248,187,208,0.8)","rgba(244,143,177,0.8)"][Math.floor(Math.random()*3)],
        size: 3 + Math.random() * 3
      });
    }
  }

  // 夏の雲初期化
  if (season === "夏" && summerClouds.length === 0) {
    for (let i = 0; i < 8; i++) {
      summerClouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        size: 50 + Math.random() * 50,
        speed: 0.2 + Math.random() * 0.3,
        layer: Math.random() * 2 + 1
      });
    }
  }

  // 秋の枯れ木初回生成
  if (season === "秋" && autumnTreeBranches.length === 0) {
    generateAutumnTree();
  }
}

/** 春：桜の木描画 */
function drawSakuraTree() {
  ctx.save();
  ctx.translate(canvas.width * 0.2, canvas.height * 0.8);

  // 幹
  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(-10, -150, 20, 150);

  // 枝
  ctx.strokeStyle = "#8b5a2b";
  ctx.lineWidth = 6;
  sakuraBranches.forEach(b => {
    ctx.beginPath();
    ctx.moveTo(0, -150);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  });

  // 花・葉（静止）
  sakuraFlowers.forEach(f => {
    ctx.beginPath();
    ctx.fillStyle = f.color;
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/** 夏：明るい日差し＋雲 */
function drawSummerScene() {
  const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grd.addColorStop(0, "#9ad0ff");
  grd.addColorStop(1, "#8cd3ff");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 太陽
  const sunX = canvas.width * 0.8;
  const sunY = canvas.height * 0.2;
  const sunRadius = 60;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
  sunGrad.addColorStop(0, "rgba(255,255,200,0.9)");
  sunGrad.addColorStop(1, "rgba(255,255,200,0)");
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI*2);
  ctx.fill();

  // 雲描画
  summerClouds.forEach(c => {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.size * c.layer * 0.8, c.size * 0.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    c.x += c.speed * c.layer;
    if (c.x - c.size * 0.8 > canvas.width) c.x = -c.size * 0.8;
  });
}

/** 秋の枯れ木生成（再帰的） */
function generateAutumnTree() {
  autumnTreeBranches = [];

  function addBranch(x, y, length, angle, depth) {
    if (depth === 0) return;
    const x2 = x + Math.cos(angle) * length;
    const y2 = y - Math.sin(angle) * length;
    autumnTreeBranches.push({x1:x, y1:y, x2:x2, y2:y2, width: Math.max(1, depth)});

    const branches = 2 + Math.floor(Math.random()*2);
    for (let i = 0; i < branches; i++) {
      const newAngle = angle + (Math.random()*0.6 - 0.3);
      const newLength = length * (0.6 + Math.random()*0.2);
      addBranch(x2, y2, newLength, newAngle, depth-1);
    }
  }

  addBranch(0, 0, 80, Math.PI/2, 5);
}

/** 秋：背景 + 枯れ木描画 */
function drawAutumnScene() {
  const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grd.addColorStop(0, "#dcb36a");
  grd.addColorStop(1, "#8b5e3c");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 枯れ木描画（画面右寄り）
  ctx.save();
  ctx.translate(canvas.width * 0.75, canvas.height * 0.85);
  ctx.strokeStyle = "#5A3A1B";
  autumnTreeBranches.forEach(b => {
    ctx.lineWidth = b.width;
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(b.x2, b.y2);
    ctx.stroke();
  });
  ctx.restore();
}

/** 冬：夜空＋雪 */
function drawWinterScene() {
  ctx.fillStyle = "#233";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 月
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 40, 0, Math.PI*2);
  ctx.fill();
}

/** 描画ループ */
function draw() {
  const season = seasons[seasonIndex];
  const set = seasonSettings[season];

  // 背景
  ctx.fillStyle = set.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 季節別描画
  if (season === "春") drawSakuraTree();
  else if (season === "夏") drawSummerScene();
  else if (season === "秋") drawAutumnScene();
  else if (season === "冬") drawWinterScene();

  // パーティクル描画
  particles.forEach(p => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.sin(p.angle) * 0.5);

    if (season === "春") {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size/2, 0, 0, Math.PI*2);
      ctx.fill();
    } else if (season === "秋") {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.quadraticCurveTo(p.size*0.8, -p.size/2, 0, -p.size);
      ctx.quadraticCurveTo(-p.size*0.8, -p.size/2, 0, 0);
      ctx.fill();
    } else if (season === "冬") {
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(0,0,p.size/2,0,Math.PI*2);
      ctx.fill();
    }

    ctx.restore();

    // 位置更新
    if (season === "冬") {
      snowPhase += 0.004;
      wind = 0;
      p.x += wind;
      p.y += p.speed;
      if (p.y > canvas.height) p.y = -10;
    } else if (season === "秋") {
      p.x += Math.sin(p.angle) * 0.3;
      p.y += p.speed;
    } else {
      p.x += Math.sin(p.angle) * 0.5;
      p.y += p.speed;
    }

    if (p.x > canvas.width) p.x = 0;
    if (p.x < 0) p.x = canvas.width;
  });

  requestAnimationFrame(draw);
}

// ボタン操作
document.getElementById("prev").onclick = () => changeSeason(seasonIndex - 1);
document.getElementById("next").onclick = () => changeSeason(seasonIndex + 1);
document.getElementById("auto").onclick = () => {
  autoMode = !autoMode;
  if (autoMode) autoChange();
};

// 季節切替
function changeSeason(index) {
  seasonIndex = (index + seasons.length) % seasons.length;
  document.getElementById("seasonLabel").textContent =
    `${seasons[seasonIndex]} - ${["Spring","Summer","Autumn","Winter"][seasonIndex]}`;
  initParticles();
}

// 自動切替
function autoChange() {
  if (!autoMode) return;
  changeSeason(seasonIndex + 1);
  setTimeout(autoChange, 15000);
}

// 初期化
changeSeason(0);
draw();
