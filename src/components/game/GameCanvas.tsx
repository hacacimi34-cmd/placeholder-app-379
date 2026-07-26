import { useRef, useEffect, useCallback } from "react";

// ============================================================
//  Oyun Tipləri
// ============================================================
interface Vec { x: number; y: number; }

interface Player {
  pos: Vec;
  vel: Vec;
  size: number;
  health: number;
  maxHealth: number;
  speed: number;
  lastShot: number;
  fireRate: number;
  invincibleUntil: number;
}

interface Enemy {
  pos: Vec;
  vel: Vec;
  size: number;
  health: number;
  maxHealth: number;
  type: "grunt" | "shooter" | "tank";
  lastShot: number;
  fireRate: number;
  points: number;
  color: string;
}

interface Bullet {
  pos: Vec;
  vel: Vec;
  size: number;
  damage: number;
  friendly: boolean;
}

interface Particle {
  pos: Vec;
  vel: Vec;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface PowerUp {
  pos: Vec;
  vel: Vec;
  type: "health" | "rapid";
  size: number;
}

export interface HudData {
  score: number;
  health: number;
  maxHealth: number;
  wave: number;
  totalWaves: number;
  enemiesLeft: number;
}

interface GameCanvasProps {
  running: boolean;
  paused: boolean;
  onHudUpdate: (hud: HudData) => void;
  onGameOver: (score: number, wave: number) => void;
  onVictory: (score: number, wave: number) => void;
  difficulty: number; // 1-6 (missiya nömrəsi)
}

const TOTAL_WAVES = 5;

export default function GameCanvas({
  running,
  paused,
  onHudUpdate,
  onGameOver,
  onVictory,
  difficulty,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Oyun vəziyyəti (ref — performans üçün)
  const stateRef = useRef({
    player: null as Player | null,
    enemies: [] as Enemy[],
    bullets: [] as Bullet[],
    particles: [] as Particle[],
    powerups: [] as PowerUp[],
    score: 0,
    wave: 0,
    enemiesToSpawn: 0,
    spawnTimer: 0,
    waveActive: false,
    rapidFireUntil: 0,
    keys: { left: false, right: false, up: false, down: false },
    touch: { active: false, x: 0, y: 0 },
    width: 0,
    height: 0,
    over: false,
    won: false,
    flashTimer: 0,
    screenShake: 0,
  });

  // HUD callback ref (yenidən render etmədən)
  const onHudUpdateRef = useRef(onHudUpdate);
  const onGameOverRef = useRef(onGameOver);
  const onVictoryRef = useRef(onVictory);
  onHudUpdateRef.current = onHudUpdate;
  onGameOverRef.current = onGameOver;
  onVictoryRef.current = onVictory;

  // ============================================================
  //  OYUN BAŞLATICI
  // ============================================================
  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;
    s.width = canvas.width;
    s.height = canvas.height;

    s.player = {
      pos: { x: s.width / 2, y: s.height - 80 },
      vel: { x: 0, y: 0 },
      size: 28,
      health: 100,
      maxHealth: 100,
      speed: 350,
      lastShot: 0,
      fireRate: 180,
      invincibleUntil: 0,
    };
    s.enemies = [];
    s.bullets = [];
    s.particles = [];
    s.powerups = [];
    s.score = 0;
    s.wave = 0;
    s.over = false;
    s.won = false;
    s.flashTimer = 0;
    s.screenShake = 0;
    startNextWave();
  }, []);

  const startNextWave = useCallback(() => {
    const s = stateRef.current;
    s.wave++;
    if (s.wave > TOTAL_WAVES) {
      s.won = true;
      return;
    }
    // Çətinlik faktoru: hər missiya + hər dalğa daha çox düşmən
    s.enemiesToSpawn = 4 + s.wave * 2 + difficulty * 2;
    s.spawnTimer = 0.5;
    s.waveActive = true;
  }, [difficulty]);

  // ============================================================
  //  DÜŞMƏN YARAT
  // ============================================================
  const spawnEnemy = useCallback(() => {
    const s = stateRef.current;
    if (!s.player) return;

    const waveMult = 1 + s.wave * 0.1 + difficulty * 0.15;
    const roll = Math.random();
    let type: Enemy["type"] = "grunt";
    let health = 2;
    let speed = 60 + difficulty * 10 + s.wave * 8;
    let size = 26;
    let color = "#dc2626";
    let points = 10;
    let fireRate = 0;

    if (s.wave >= 2 && roll < 0.3 + difficulty * 0.05) {
      type = "shooter";
      health = 3;
      speed = 45 + difficulty * 8;
      color = "#ea580c";
      points = 20;
      fireRate = 1500 + Math.random() * 1000;
      size = 28;
    } else if (s.wave >= 3 && roll < 0.15 + difficulty * 0.03) {
      type = "tank";
      health = 6 + difficulty;
      speed = 30 + difficulty * 5;
      color = "#7c2d12";
      points = 40;
      size = 40;
    }

    health = Math.ceil(health * waveMult);

    s.enemies.push({
      pos: {
        x: 40 + Math.random() * (s.width - 80),
        y: -40,
      },
      vel: { x: (Math.random() - 0.5) * 30, y: speed },
      size,
      health,
      maxHealth: health,
      type,
      lastShot: performance.now() + Math.random() * 2000,
      fireRate,
      points,
      color,
    });
  }, [difficulty]);

  // ============================================================
  //  MƏRMİ YARAT
  // ============================================================
  const fireBullet = useCallback((x: number, y: number, vx: number, vy: number, friendly: boolean, damage: number) => {
    stateRef.current.bullets.push({
      pos: { x, y },
      vel: { x: vx, y: vy },
      size: friendly ? 6 : 5,
      damage,
      friendly,
    });
  }, []);

  // ============================================================
  //  PARTİKUL YARAT (partikul effektləri)
  // ============================================================
  const spawnExplosion = useCallback((x: number, y: number, color: string, count: number) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      s.particles.push({
        pos: { x, y },
        vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }, []);

  // ============================================================
  //  GÜNCƏLLƏMƏ (UPDATE)
  // ============================================================
  const update = useCallback((dt: number) => {
    const s = stateRef.current;
    if (!s.player || s.over || s.won) return;
    const now = performance.now();

    // --- İdarəetmə ---
    const p = s.player;
    let mx = 0, my = 0;
    if (s.keys.left) mx -= 1;
    if (s.keys.right) mx += 1;
    if (s.keys.up) my -= 1;
    if (s.keys.down) my += 1;

    // Touch nəzarəti — oyunçunu toxunma nöqtəsinə doğru hərəkət et
    if (s.touch.active) {
      const dx = s.touch.x - p.pos.x;
      const dy = s.touch.y - p.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 5) {
        mx = dx / dist;
        my = dy / dist;
      }
    }

    // Dioqonal hərəkəti normallaşdır
    const mag = Math.hypot(mx, my);
    if (mag > 0) { mx /= mag; my /= mag; }

    p.vel.x = mx * p.speed;
    p.vel.y = my * p.speed;
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;

    // Sərhədləri tətbiq et — oyunçu alt hissədə qalır
    const minY = s.height * 0.45;
    p.pos.x = Math.max(p.size, Math.min(s.width - p.size, p.pos.x));
    p.pos.y = Math.max(minY, Math.min(s.height - p.size, p.pos.y));

    // --- Oyunçu atışı (avtomatik) ---
    const fireRate = now < s.rapidFireUntil ? 70 : p.fireRate;
    if (now - p.lastShot > fireRate) {
      p.lastShot = now;
      // İkiqat atış (dalğa 3+) 
      fireBullet(p.pos.x, p.pos.y - p.size, 0, -600, true, 1);
      if (s.wave >= 3) {
        fireBullet(p.pos.x - 10, p.pos.y - p.size + 5, 0, -600, true, 1);
        fireBullet(p.pos.x + 10, p.pos.y - p.size + 5, 0, -600, true, 1);
      }
      // Lülə partikulu
      spawnExplosion(p.pos.x, p.pos.y - p.size, "#fbbf24", 3);
    }

    // --- Dalğa idarəetməsi ---
    if (s.waveActive && s.enemiesToSpawn > 0) {
      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        spawnEnemy();
        s.enemiesToSpawn--;
        s.spawnTimer = Math.max(0.4, 1.2 - s.wave * 0.1 - difficulty * 0.05);
      }
    }

    // --- Düşmən güncəlləməsi ---
    for (let i = s.enemies.length - 1; i >= 0; i--) {
      const e = s.enemies[i];
      e.pos.x += e.vel.x * dt;
      e.pos.y += e.vel.y * dt;

      // Yana hərəkət əks istiqamət
      if (e.pos.x < e.size || e.pos.x > s.width - e.size) {
        e.vel.x *= -1;
      }

      // Düşmən atışı
      if (e.type === "shooter" && now - e.lastShot > e.fireRate) {
        e.lastShot = now;
        const dx = p.pos.x - e.pos.x;
        const dy = p.pos.y - e.pos.y;
        const d = Math.hypot(dx, dy) || 1;
        fireBullet(e.pos.x, e.pos.y + e.size, (dx / d) * 250, (dy / d) * 250, false, 10);
      }

      // Düşmən aşağıya çatırsa — oyunçuya zərər
      if (e.pos.y > s.height + 20) {
        s.enemies.splice(i, 1);
        p.health -= 8;
        s.flashTimer = 0.3;
        s.screenShake = 8;
        if (p.health <= 0) { p.health = 0; s.over = true; }
      }

      // Düşmən oyunçuya toxunursa
      const dx = e.pos.x - p.pos.x;
      const dy = e.pos.y - p.pos.y;
      if (Math.hypot(dx, dy) < e.size + p.size && now > p.invincibleUntil) {
        p.health -= 15;
        p.invincibleUntil = now + 800;
        s.flashTimer = 0.4;
        s.screenShake = 12;
        spawnExplosion(e.pos.x, e.pos.y, "#ef4444", 15);
        s.enemies.splice(i, 1);
        if (p.health <= 0) { p.health = 0; s.over = true; }
      }
    }

    // --- Mərmi güncəlləməsi və toqquşma ---
    for (let i = s.bullets.length - 1; i >= 0; i--) {
      const b = s.bullets[i];
      b.pos.x += b.vel.x * dt;
      b.pos.y += b.vel.y * dt;

      // Ekrandan çıxan mərmiləri sil
      if (b.pos.y < -20 || b.pos.y > s.height + 20 || b.pos.x < -20 || b.pos.x > s.width + 20) {
        s.bullets.splice(i, 1);
        continue;
      }

      if (b.friendly) {
        // Oyunçu mərmisi -> düşmən toqquşması
        for (let j = s.enemies.length - 1; j >= 0; j--) {
          const e = s.enemies[j];
          const ddx = b.pos.x - e.pos.x;
          const ddy = b.pos.y - e.pos.y;
          if (Math.hypot(ddx, ddy) < e.size + b.size) {
            e.health -= b.damage;
            s.bullets.splice(i, 1);
            spawnExplosion(b.pos.x, b.pos.y, "#fbbf24", 4);
            if (e.health <= 0) {
              s.score += e.points;
              spawnExplosion(e.pos.x, e.pos.y, e.color, 20);
              s.screenShake = Math.min(15, s.screenShake + 4);
              // Güc-artırıcı düşmə ehtimalı
              if (Math.random() < 0.12) {
                s.powerups.push({
                  pos: { x: e.pos.x, y: e.pos.y },
                  vel: { x: 0, y: 80 },
                  type: Math.random() < 0.5 ? "health" : "rapid",
                  size: 18,
                });
              }
              s.enemies.splice(j, 1);
            }
            break;
          }
        }
      } else {
        // Düşmən mərmisi -> oyunçu toqquşması
        const ddx = b.pos.x - p.pos.x;
        const ddy = b.pos.y - p.pos.y;
        if (Math.hypot(ddx, ddy) < p.size + b.size && now > p.invincibleUntil) {
          p.health -= b.damage;
          p.invincibleUntil = now + 500;
          s.flashTimer = 0.25;
          s.bullets.splice(i, 1);
          spawnExplosion(b.pos.x, b.pos.y, "#ef4444", 8);
          if (p.health <= 0) { p.health = 0; s.over = true; }
        }
      }
    }

    // --- Güc-artırıcı güncəlləməsi ---
    for (let i = s.powerups.length - 1; i >= 0; i--) {
      const pu = s.powerups[i];
      pu.pos.y += pu.vel.y * dt;
      if (pu.pos.y > s.height + 20) {
        s.powerups.splice(i, 1);
        continue;
      }
      const ddx = pu.pos.x - p.pos.x;
      const ddy = pu.pos.y - p.pos.y;
      if (Math.hypot(ddx, ddy) < p.size + pu.size) {
        if (pu.type === "health") {
          p.health = Math.min(p.maxHealth, p.health + 30);
        } else {
          s.rapidFireUntil = now + 5000;
        }
        spawnExplosion(pu.pos.x, pu.pos.y, pu.type === "health" ? "#22c55e" : "#06b6d4", 15);
        s.powerups.splice(i, 1);
      }
    }

    // --- Partikul güncəlləməsi ---
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const pt = s.particles[i];
      pt.pos.x += pt.vel.x * dt;
      pt.pos.y += pt.vel.y * dt;
      pt.vel.x *= 0.95;
      pt.vel.y *= 0.95;
      pt.life -= dt;
      if (pt.life <= 0) s.particles.splice(i, 1);
    }

    // --- Zamanlayıcılar ---
    if (s.flashTimer > 0) s.flashTimer -= dt;
    if (s.screenShake > 0) s.screenShake = Math.max(0, s.screenShake - dt * 40);

    // --- Dalğa tamamlandı? ---
    if (s.waveActive && s.enemiesToSpawn === 0 && s.enemies.length === 0) {
      s.waveActive = false;
      if (s.wave >= TOTAL_WAVES) {
        s.won = true;
      } else {
        // Növbəti dalğaya qısa fasilə
        setTimeout(() => startNextWave(), 1500);
      }
    }

    // --- Oyun bitdi? ---
    if (s.over) {
      onGameOverRef.current(s.score, s.wave);
      return;
    }
    if (s.won) {
      onVictoryRef.current(s.score, s.wave);
      return;
    }

    // --- HUD güncəllə ---
    onHudUpdateRef.current({
      score: s.score,
      health: Math.max(0, Math.ceil(p.health)),
      maxHealth: p.maxHealth,
      wave: Math.min(s.wave, TOTAL_WAVES),
      totalWaves: TOTAL_WAVES,
      enemiesLeft: s.enemies.length + s.enemiesToSpawn,
    });
  }, [spawnEnemy, fireBullet, spawnExplosion, startNextWave, difficulty]);

  // ============================================================
  //  ÇİZİM (RENDER)
  // ============================================================
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    const now = performance.now();

    ctx.save();

    // Ekran titrəməsi
    if (s.screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * s.screenShake,
        (Math.random() - 0.5) * s.screenShake
      );
    }

    // Fon
    const grad = ctx.createLinearGradient(0, 0, 0, s.height);
    grad.addColorStop(0, "#0a0e1a");
    grad.addColorStop(0.5, "#0d1421");
    grad.addColorStop(1, "#070a12");
    ctx.fillStyle = grad;
    ctx.fillRect(-20, -20, s.width + 40, s.height + 40);

    // Atmosfer ulduzları / nöqtələr
    ctx.fillStyle = "rgba(100, 150, 255, 0.15)";
    for (let i = 0; i < 30; i++) {
      const x = (i * 137.5) % s.width;
      const y = (i * 89.3 + now * 0.01) % s.height;
      ctx.fillRect(x, y, 2, 2);
    }

    // Cəbhə xətti (oyunçunun sərhədi)
    ctx.strokeStyle = "rgba(34, 197, 94, 0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, s.height * 0.45);
    ctx.lineTo(s.width, s.height * 0.45);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- Partikullar ---
    for (const pt of s.particles) {
      const alpha = pt.life / pt.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.pos.x, pt.pos.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // --- Güc-artırıcılar ---
    for (const pu of s.powerups) {
      const pulse = 1 + Math.sin(now * 0.005) * 0.15;
      const c = pu.type === "health" ? "#22c55e" : "#06b6d4";
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(pu.pos.x, pu.pos.y, pu.size * pulse * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = c;
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pu.type === "health" ? "+" : "⚡", pu.pos.x, pu.pos.y);
    }

    // --- Mərmilər ---
    for (const b of s.bullets) {
      if (b.friendly) {
        ctx.fillStyle = "#fde047";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 8;
        ctx.fillRect(b.pos.x - 2, b.pos.y - 6, 4, 12);
      } else {
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#dc2626";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(b.pos.x, b.pos.y, b.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;

    // --- Düşmənlər ---
    for (const e of s.enemies) {
      ctx.save();
      ctx.translate(e.pos.x, e.pos.y);

      // Bədən
      ctx.fillStyle = e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      if (e.type === "tank") {
        // Tank — kvadrat
        ctx.fillRect(-e.size, -e.size, e.size * 2, e.size * 2);
      } else if (e.type === "shooter") {
        // Atıcı — altıbucaqlı
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
          const px = Math.cos(a) * e.size;
          const py = Math.sin(a) * e.size;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Əsgər — üçbucaq (aşağı baxan)
        ctx.moveTo(0, e.size);
        ctx.lineTo(-e.size, -e.size * 0.7);
        ctx.lineTo(e.size, -e.size * 0.7);
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Sağlamlıq çubuğu
      if (e.health < e.maxHealth) {
        const barW = e.size * 1.8;
        const hp = e.health / e.maxHealth;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(-barW / 2, -e.size - 10, barW, 4);
        ctx.fillStyle = hp > 0.5 ? "#22c55e" : hp > 0.25 ? "#fbbf24" : "#ef4444";
        ctx.fillRect(-barW / 2, -e.size - 10, barW * hp, 4);
      }
      ctx.restore();
    }

    // --- Oyunçu ---
    const p = s.player;
    if (p) {
      const blink = now < p.invincibleUntil && Math.floor(now / 100) % 2 === 0;
      if (!blink) {
        ctx.save();
        ctx.translate(p.pos.x, p.pos.y);
        // Parıltı halqası
        const rapid = now < s.rapidFireUntil;
        ctx.shadowColor = rapid ? "#06b6d4" : "#22c55e";
        ctx.shadowBlur = 15;
        ctx.fillStyle = rapid ? "#06b6d4" : "#16a34a";
        // Üçbucaq (yuxarı baxan — əsgər)
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(-p.size * 0.8, p.size * 0.7);
        ctx.lineTo(0, p.size * 0.4);
        ctx.lineTo(p.size * 0.8, p.size * 0.7);
        ctx.closePath();
        ctx.fill();
        // Kontur
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#86efac";
        ctx.lineWidth = 2;
        ctx.stroke();
        // Mərkəz nöqtəsi
        ctx.fillStyle = "#bbf7d0";
        ctx.beginPath();
        ctx.arc(0, -4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Oyunçu sağlamlıq çubuğu (canvas-da)
      const barW = 50;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(p.pos.x - barW / 2, p.pos.y - p.size - 14, barW, 4);
      const hp = p.health / p.maxHealth;
      ctx.fillStyle = hp > 0.5 ? "#22c55e" : hp > 0.25 ? "#fbbf24" : "#ef4444";
      ctx.fillRect(p.pos.x - barW / 2, p.pos.y - p.size - 14, barW * hp, 4);
    }

    // --- Zədə flaşı ---
    if (s.flashTimer > 0) {
      ctx.fillStyle = `rgba(239, 68, 68, ${s.flashTimer * 0.6})`;
      ctx.fillRect(0, 0, s.width, s.height);
    }

    ctx.restore();
  }, []);

  // ============================================================
  //  OYUN DÖVRÜSÜ (GAME LOOP)
  // ============================================================
  useEffect(() => {
    if (!running) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      stateRef.current.width = canvas.width;
      stateRef.current.height = canvas.height;
      if (stateRef.current.player) {
        stateRef.current.player.pos.x = Math.min(
          stateRef.current.player.pos.x,
          canvas.width - stateRef.current.player.size
        );
      }
    };
    resize();
    window.addEventListener("resize", resize);

    initGame();
    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      if (!paused) {
        update(dt);
      }
      render();

      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [running, paused, initGame, update, render]);

  // ============================================================
  //  KLAVİATURA İDARƏETMƏSİ
  // ============================================================
  useEffect(() => {
    const handleKey = (e: KeyboardEvent, down: boolean) => {
      const s = stateRef.current;
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          s.keys.left = down; break;
        case "ArrowRight":
        case "d":
        case "D":
          s.keys.right = down; break;
        case "ArrowUp":
        case "w":
        case "W":
          s.keys.up = down; break;
        case "ArrowDown":
        case "s":
        case "S":
          s.keys.down = down; break;
      }
    };
    const kd = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
      }
      handleKey(e, true);
    };
    const ku = (e: KeyboardEvent) => handleKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, []);

  // ============================================================
  //  TOXUNMA İDARƏETMƏSİ (MOBIL)
  // ============================================================
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    stateRef.current.touch.active = true;
    stateRef.current.touch.x = t.clientX - rect.left;
    stateRef.current.touch.y = t.clientY - rect.top;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    stateRef.current.touch.x = t.clientX - rect.left;
    stateRef.current.touch.y = t.clientY - rect.top;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    stateRef.current.touch.active = false;
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
}
