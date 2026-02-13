const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const question = document.getElementById("question");
const afterYes = document.getElementById("afterYes");
const buttons = document.getElementById("buttons");

const photoWrap = document.getElementById("photoWrap");
const countdownWrap = document.getElementById("countdownWrap");
const countdownEl = document.getElementById("countdown");
const dateLine = document.getElementById("dateLine");

const hearts = document.getElementById("hearts");

// ---------- CONFIG (change these) ----------
const HER_NAME = "my love"; // change to her name if you want
// AU format assumed: 11/3 = 11 March 2026.
// Set your date time here (Melbourne local time in the user's browser).
const DATE_TIME_LOCAL = "2026-03-11T19:00:00"; // <-- change time if needed
// -------------------------------------------

// Runaway "No" (desktop hover + mobile touch)
function moveNoButton() {
  const pad = 20;
  const btnW = noBtn.offsetWidth || 100;
  const btnH = noBtn.offsetHeight || 50;

  const maxX = window.innerWidth - btnW - pad;
  const maxY = window.innerHeight - btnH - pad;

  const x = Math.max(pad, Math.random() * maxX);
  const y = Math.max(pad, Math.random() * maxY);

  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
}

noBtn.addEventListener("mouseover", moveNoButton);
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNoButton();
}, { passive: false });

// YES click
yesBtn.addEventListener("click", () => {
  question.innerHTML = `You’re my Valentine, ${HER_NAME} ❤️`;
  buttons.classList.add("hidden");

  afterYes.textContent =
    "Okay… now it’s official. I’m counting down to seeing you. 💘";
  afterYes.classList.remove("hidden");

  photoWrap.classList.remove("hidden");
  countdownWrap.classList.remove("hidden");

  startHearts();
  startCountdown();
  startFireworks(4500); // fireworks burst for 4.5 seconds + soft ongoing
});

// Hearts
function startHearts() {
  setInterval(() => {
    const heart = document.createElement("div");
    heart.textContent = "❤️";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.opacity = (0.6 + Math.random() * 0.4).toFixed(2);
    heart.style.fontSize = (18 + Math.random() * 14).toFixed(0) + "px";
    hearts.appendChild(heart);
    setTimeout(() => heart.remove(), 3200);
  }, 220);
}

// Countdown
function startCountdown() {
  const target = new Date(DATE_TIME_LOCAL);

  // Display exact date line (in her browser locale)
  dateLine.textContent = `Target: ${target.toLocaleString()}`;

  function tick() {
    const now = new Date();
    let diff = target - now;

    if (diff <= 0) {
      countdownEl.textContent = "IT’S TIME 💖";
      return;
    }

    const sec = Math.floor(diff / 1000);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;

    countdownEl.textContent =
      `${days}d ${String(hours).padStart(2, "0")}h ` +
      `${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  }

  tick();
  setInterval(tick, 1000);
}

// ---------- Fireworks (canvas) ----------
const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resizeCanvas);

let particles = [];
let animId = null;
let burstModeUntil = 0;

function rand(min, max) { return Math.random() * (max - min) + min; }

function makeExplosion(x, y, count) {
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(2.2, 6.0);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: rand(40, 80),
      maxLife: 80,
      size: rand(1.6, 3.2),
      // random bright-ish color using HSL
      hue: rand(0, 360),
      gravity: rand(0.03, 0.07),
      drag: rand(0.985, 0.992),
    });
  }
}

function stepFireworks() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // gentle fade trail
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  const now = Date.now();

  // bursts while in burst-mode, then occasional pops
  if (now < burstModeUntil) {
    if (Math.random() < 0.35) {
      makeExplosion(rand(80, window.innerWidth - 80), rand(80, window.innerHeight * 0.55), Math.floor(rand(70, 120)));
    }
  } else {
    if (Math.random() < 0.05) {
      makeExplosion(rand(80, window.innerWidth - 80), rand(80, window.innerHeight * 0.45), Math.floor(rand(50, 90)));
    }
  }

  // update particles
  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.life -= 1;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.vy += p.gravity;

    p.x += p.vx;
    p.y += p.vy;

    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${alpha})`;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  animId = requestAnimationFrame(stepFireworks);
}

function startFireworks(burstMs = 4000) {
  resizeCanvas();
  canvas.style.display = "block";
  burstModeUntil = Date.now() + burstMs;

  if (!animId) stepFireworks();

  // first big pop centered-ish
  makeExplosion(window.innerWidth * 0.5, window.innerHeight * 0.35, 140);
}
// ---------------------------------------
