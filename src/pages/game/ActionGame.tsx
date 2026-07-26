import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Heart,
  Zap,
  Trophy,
  Skull,
  ChevronLeft,
  RotateCcw,
  Map as MapIcon,
  Target,
  Crosshair,
} from "lucide-react";
import GameCanvas, { HudData } from "@/components/game/GameCanvas";

type GameState = "menu" | "playing" | "gameover" | "victory";

const difficultyNames: Record<number, { name: string; desc: string }> = {
  1: { name: "Təlim", desc: "Asan səviyyə — hərbi təlim" },
  2: { name: "Əsgər", desc: "Orta səviyyə — real xidmət" },
  3: { name: "Çavuş", desc: "Çətin — döyüş hazırlığı" },
  4: { name: "Gizir", desc: "Çox çətin — cəbhə xətti" },
  5: { name: "Döyüş", desc: "Ekstremal — son döyüş" },
  6: { name: "Qəhrəman", desc: "Maksimum — igidlik sınağı" },
};

export default function ActionGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("menu");
  const [hud, setHud] = useState<HudData>({
    score: 0,
    health: 100,
    maxHealth: 100,
    wave: 1,
    totalWaves: 5,
    enemiesLeft: 0,
  });
  const [difficulty, setDifficulty] = useState(1);
  const [finalScore, setFinalScore] = useState(0);
  const [finalWave, setFinalWave] = useState(0);

  const handleHudUpdate = useCallback((data: HudData) => {
    setHud(data);
  }, []);

  const handleGameOver = useCallback((score: number, wave: number) => {
    setFinalScore(score);
    setFinalWave(wave);
    setGameState("gameover");
  }, []);

  const handleVictory = useCallback((score: number, wave: number) => {
    setFinalScore(score);
    setFinalWave(wave);
    setGameState("victory");
  }, []);

  const startGame = () => {
    setHud({
      score: 0,
      health: 100,
      maxHealth: 100,
      wave: 1,
      totalWaves: 5,
      enemiesLeft: 0,
    });
    setGameState("playing");
  };

  return (
    <div className="fixed inset-0 bg-[#070a12] overflow-hidden select-none">
      {/* --- OYUN CANVAS --- */}
      {(gameState === "playing") && (
        <GameCanvas
          key={`game-${difficulty}-${gameState}`}
          running={true}
          paused={false}
          onHudUpdate={handleHudUpdate}
          onGameOver={handleGameOver}
          onVictory={handleVictory}
          difficulty={difficulty}
        />
      )}

      {/* --- HUD (oyun zamanı) --- */}
      {gameState === "playing" && (
        <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
          {/* Üst panel */}
          <div className="flex items-center justify-between px-3 sm:px-6 py-3">
            {/* Geri */}
            <button
              onClick={() => navigate("/map")}
              className="pointer-events-auto flex items-center gap-1 px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Çıx</span>
            </button>

            {/* Xal və dalğa */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 backdrop-blur-sm border border-amber-500/30">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-bold text-sm sm:text-base tabular-nums">{hud.score}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500/15 backdrop-blur-sm border border-sky-500/30">
                <Target className="w-4 h-4 text-sky-400" />
                <span className="text-sky-400 font-bold text-sm">Dalğa {hud.wave}/{hud.totalWaves}</span>
              </div>
            </div>

            {/* Sağlamlıq */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/15 backdrop-blur-sm border border-red-500/30">
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              <span className="text-red-400 font-bold text-sm tabular-nums">{hud.health}</span>
            </div>
          </div>

          {/* Sağlamlıq çubuğu */}
          <div className="px-3 sm:px-6 mt-1">
            <div className="max-w-xs mx-auto h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  hud.health / hud.maxHealth > 0.5
                    ? "bg-green-500"
                    : hud.health / hud.maxHealth > 0.25
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${(hud.health / hud.maxHealth) * 100}%` }}
              />
            </div>
          </div>

          {/* Mobil nəzarət göstərici */}
          <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs text-center animate-pulse pointer-events-none">
            👆 Hərəkət üçün toxunub sürüşdür
          </div>
        </div>
      )}

      {/* --- MENYU (başlama ekranı) --- */}
      {gameState === "menu" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 overflow-y-auto py-8">
          {/* Fon effekti */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0d1421] to-[#070a12]" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "radial-gradient(circle at 30% 20%, rgba(34,197,94,0.15), transparent 50%), radial-gradient(circle at 70% 80%, rgba(239,68,68,0.15), transparent 50%)"
          }} />

          <div className="relative z-10 w-full max-w-lg text-center">
            {/* Bayraq */}
            <div className="text-4xl mb-2">🇦🇿</div>

            <h1 className="text-3xl sm:text-5xl font-black text-white mb-1">
              CƏBHƏ MÜDAFİƏSİ
            </h1>
            <p className="text-amber-400 text-sm sm:text-base font-semibold mb-1">
              ⚔️ Döyüş Oyunu
            </p>
            <p className="text-white/40 text-xs sm:text-sm mb-8 max-w-sm mx-auto">
              Vətən torpaqlarını müdafiə et! 5 dalğanı sağ qalaraq keç və qəhrəman ol!
            </p>

            {/* Çətinlik seçimi */}
            <div className="mb-6 text-left">
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">
                Missiya Çətinliyi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-2 py-3 rounded-xl border text-center transition-all ${
                      difficulty === d
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300 scale-105"
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-xs font-bold">{difficultyNames[d].name}</div>
                    <div className="flex justify-center gap-0.5 mt-1">
                      {Array.from({ length: d }).map((_, i) => (
                        <span key={i} className="w-1 h-1 rounded-full bg-current opacity-60" />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-white/40 text-xs mt-2 text-center">
                {difficultyNames[difficulty].desc}
              </p>
            </div>

            {/* Başla */}
            <button
              onClick={startGame}
              className="group flex items-center justify-center gap-3 w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-lg shadow-2xl transition-all hover:scale-105 animate-glow"
            >
              <Play className="w-6 h-6 fill-black" />
              DÖYÜŞƏ BAŞLA
            </button>

            {/* İdarəetmə göstəricisi */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white/80 text-sm font-bold mb-1">
                  <Crosshair className="w-4 h-4 text-sky-400" />
                  PC
                </div>
                <p className="text-white/40 text-xs">WASD / Ox düymələri ilə hərəkət. Atış avtomatikdir.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white/80 text-sm font-bold mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Mobil
                </div>
                <p className="text-white/40 text-xs">Ekrana toxunub sürüşdürərək hərəkət et.</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/map")}
              className="mt-4 text-white/40 hover:text-white/70 text-sm flex items-center gap-1 mx-auto transition-colors"
            >
              <MapIcon className="w-4 h-4" />
              Hekayə missiyalarına qayıt
            </button>
          </div>
        </div>
      )}

      {/* --- OYUN BİTDİ --- */}
      {gameState === "gameover" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
              <Skull className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">MƏĞLUB OLDUN</h2>
            <p className="text-white/50 text-sm mb-6">
              {finalWave > 1
                ? `${finalWave}. dalğada dayandın. Yenidən cəhd et!`
                : "İlk dalğanı keçə bilmədiniz. Təkrar cəhd et!"}
            </p>

            {/* Nəticə */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <div className="text-amber-400 text-2xl font-black">{finalScore}</div>
                <div className="text-amber-300/50 text-xs">Xal</div>
              </div>
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
                <Target className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                <div className="text-sky-400 text-2xl font-black">{finalWave}/5</div>
                <div className="text-sky-300/50 text-xs">Dalğa</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                Yenidən
              </button>
              <button
                onClick={() => setGameState("menu")}
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-semibold transition-all"
              >
                Menyu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- QƏLƏBƏ --- */}
      {gameState === "victory" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm text-center">
            <div className="text-5xl mb-3 animate-bounce">🏆</div>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center animate-glow">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-3xl font-black text-gold mb-2">QƏLƏBƏ!</h2>
            <p className="text-white/60 text-sm mb-6">
              Bütün 5 dalğanı keçdiniz! Vətən torpaqları müdafiə olundu! 🇦🇿
            </p>

            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
              <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-amber-400 text-4xl font-black">{finalScore}</div>
              <div className="text-amber-300/50 text-sm">Toplam Xal</div>
            </div>

            <p className="text-white/50 text-sm italic mb-6">
              «Mübariz İbrahimov kimi vətənini qoruyan hər bir igid qəhrəmandır.»
            </p>

            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                Təkrar Oyna
              </button>
              <button
                onClick={() => navigate("/memorial")}
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-semibold transition-all"
              >
                Memorial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
