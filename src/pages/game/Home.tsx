import { useNavigate } from "react-router-dom";
import { Play, ChevronDown, Star, Award, Flame } from "lucide-react";
import { useGameProgress } from "@/hooks/useGameProgress";

export default function Home() {
  const navigate = useNavigate();
  const { progress, loaded, completionPercent } = useGameProgress();

  const handleStart = () => {
    if (progress.completedChapters.length > 0) {
      navigate("/map");
    } else {
      navigate("/play/1");
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Fon */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/876344/pexels-photo-876344.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
          alt=""
          className="w-full h-full object-cover animate-slow-zoom"
          style={{ width: "100%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </div>

      {/* Məzmun */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Üst bayraq zolağı */}
        <div className="h-1.5 az-stripe" />

        {/* Əsas hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto py-16">
          {/* Bayraq emoji */}
          <div className="mb-6 text-5xl animate-flicker">🇦🇿</div>

          {/* Tarixlər */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-amber-500/50" />
            <span className="text-amber-400/90 text-sm font-semibold tracking-widest uppercase">
              Milli Qəhrəman
            </span>
            <div className="h-px w-12 bg-amber-500/50" />
          </div>

          {/* Ad */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black mb-2 text-shimmer leading-tight">
            MÜBARİZ
          </h1>
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-black mb-6 text-white/95 leading-tight text-shadow-lg">
            İBRAHİMOV
          </h2>

          {/* Tarix */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-white/60 text-lg font-medium">7 fevral 1988</span>
            <span className="text-amber-500/60">—</span>
            <span className="text-white/60 text-lg font-medium">19 iyun 2010</span>
          </div>

          {/* Təsvir */}
          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed mb-3">
            Bir ömrün, bir qəhrəmanın və bir xalqın qürurunun hekayəsi.
          </p>
          <p className="text-sm sm:text-base text-white/50 max-w-xl leading-relaxed mb-10">
            Bu oyun Mübariz İbrahimovun həyat yolunu 6 missiya şəklində canlandırır.
            Onun uşaqlığından başlayaraq əbədi şəhidliyinə qədər olan igidlik yolculuğunu yaşa.
          </p>

          {/* Başla düyməsi */}
          <button
            onClick={handleStart}
            className="group flex items-center gap-3 px-8 sm:px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-base sm:text-lg shadow-2xl transition-all hover:scale-105 animate-glow"
          >
            <Play className="w-5 h-5 fill-black" />
            {loaded && progress.completedChapters.length > 0
              ? "Davam Et"
              : "Oyuna Başla"}
          </button>

          {/* Proqres göstəricisi */}
          {loaded && progress.completedChapters.length > 0 && (
            <div className="mt-8 w-full max-w-md">
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>Missiya tərəqqisi</span>
                <span>{completionPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-amber-500 to-red-500 transition-all duration-1000"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Şücaət xalı */}
          {loaded && progress.couragePoints > 0 && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-semibold">
                {progress.couragePoints} Şücaət Xalı topladın
              </span>
            </div>
          )}
        </div>

        {/* Aşağı xüsusiyyətlər */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto px-4 pb-8 w-full">
          <Feature icon={<Star className="w-5 h-5" />} title="6 Missiya" subtitle="Həyat yolculuğu" />
          <Feature icon={<Flame className="w-5 h-5" />} title="İnteraktiv" subtitle="Seçimlər və qərarlar" />
          <Feature icon={<Award className="w-5 h-5" />} title="Xatirə" subtitle="Əbədi yaşayır" />
        </div>

        {/* Aşağı ox */}
        <div className="flex justify-center pb-4">
          <ChevronDown className="w-6 h-6 text-white/30 animate-bounce" />
        </div>

        {/* Böyük şəhid yazısı */}
        <div className="text-center py-8 px-4 border-t border-white/5">
          <p className="text-white/40 text-sm">
            🤲 Allah bütün şəhidlərimizə rəhmət eləsin
          </p>
          <p className="text-amber-500/50 text-xs mt-1 font-medium tracking-wider">
            VƏTƏN SAĞ OLSUN 🇦🇿
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
      <div className="text-amber-400">{icon}</div>
      <span className="text-white/80 text-xs sm:text-sm font-bold">{title}</span>
      <span className="text-white/40 text-[10px] sm:text-xs">{subtitle}</span>
    </div>
  );
}
