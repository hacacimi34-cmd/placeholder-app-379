import { useNavigate } from "react-router-dom";
import {
  Baby,
  GraduationCap,
  Shield,
  Swords,
  Flame,
  Award,
  Lock,
  Check,
  ChevronRight,
  Trophy,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { chapters } from "@/lib/gameData";
import { useGameProgress } from "@/hooks/useGameProgress";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Baby,
  GraduationCap,
  Shield,
  Swords,
  Flame,
  Award,
};

const accentMap: Record<string, string> = {
  emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400",
  sky: "from-sky-500/20 to-sky-600/5 border-sky-500/30 text-sky-400",
  amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
  orange: "from-orange-500/20 to-orange-600/5 border-orange-500/30 text-orange-400",
  red: "from-red-500/20 to-red-600/5 border-red-500/30 text-red-400",
  yellow: "from-yellow-400/20 to-yellow-500/5 border-yellow-400/30 text-yellow-400",
};

export default function ChapterSelect() {
  const navigate = useNavigate();
  const { progress, isChapterUnlocked, completionPercent, resetProgress } =
    useGameProgress();
  const couragePoints = progress.couragePoints;

  const handlePlay = (chapterId: number) => {
    if (isChapterUnlocked(chapterId)) {
      navigate(`/play/${chapterId}`);
    }
  };

  const handleReset = () => {
    if (confirm("Bütün tərəqqini sıfırlamaq istədiyinə əminsən?")) {
      resetProgress();
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Fon */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/15146773/pexels-photo-15146773.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
          alt=""
          className="w-full h-full object-cover"
          style={{ width: "100%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/95" />
      </div>

      {/* Məzmun */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-5">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Ana Səhifə</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-bold">{couragePoints}</span>
            </div>
            {progress.completedChapters.length > 0 && (
              <button
                onClick={handleReset}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 transition-all"
                title="Tərəqqini sıfırla"
              >
                <RotateCcw className="w-4 h-4 text-white/50 hover:text-red-400" />
              </button>
            )}
          </div>
        </div>

        {/* Başlıq */}
        <div className="text-center px-4 pt-4 pb-10 max-w-3xl mx-auto">
          <div className="h-1.5 az-stripe w-24 mx-auto rounded-full mb-4" />
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-2">
            MISSİYA XƏRİTƏSİ
          </h1>
          <p className="text-white/50 text-sm sm:text-base">
            Mübariz İbrahimovun həyat yolunu missiya-missiya yaşa
          </p>

          {/* Ümumi proqres */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-xs text-white/40 mb-2">
              <span>Ümumi tərəqqi</span>
              <span>{progress.completedChapters.length} / {chapters.length} missiya</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-amber-500 to-red-500 transition-all duration-700"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Missiya siyahısı */}
        <div className="max-w-3xl mx-auto px-4 pb-16 space-y-4">
          {chapters.map((chapter) => {
            const unlocked = isChapterUnlocked(chapter.id);
            const completed = progress.completedChapters.includes(chapter.id);
            const Icon = iconMap[chapter.icon] || Shield;
            const accent = accentMap[chapter.accent] || accentMap.amber;

            return (
              <button
                key={chapter.id}
                onClick={() => handlePlay(chapter.id)}
                disabled={!unlocked}
                className={`group relative w-full text-left overflow-hidden rounded-2xl border backdrop-blur-md transition-all ${
                  unlocked
                    ? "hover:scale-[1.02] cursor-pointer border-white/10 hover:border-white/20"
                    : "opacity-50 cursor-not-allowed border-white/5"
                }`}
              >
                {/* Fon şəkli */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={chapter.badgeImage}
                    alt=""
                    className={`w-full h-full object-cover ${unlocked ? "group-hover:scale-110" : ""} transition-transform duration-700`}
                    style={{ width: "100%" }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40`} />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${accent.split(" ")[0]} ${accent.split(" ")[1]} opacity-20`} />
                </div>

                {/* Məzmun */}
                <div className="relative z-10 flex items-center gap-4 p-5 sm:p-6">
                  {/* İkon / nömrə */}
                  <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center border bg-black/40 backdrop-blur-sm ${accent.split(" ").slice(2).join(" ")}`}>
                    {unlocked ? (
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                    ) : (
                      <Lock className="w-6 h-6 text-white/40" />
                    )}
                  </div>

                  {/* Mətn */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${accent.split(" ")[2]}`}>
                        Missiya {chapter.id}
                      </span>
                      {completed && (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          Tamamlandı
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5">
                      {chapter.title}
                    </h3>
                    <p className="text-white/50 text-xs sm:text-sm line-clamp-1">
                      {chapter.date} — {chapter.subtitle}
                    </p>
                  </div>

                  {/* Ox */}
                  {unlocked && (
                    <div className="flex-shrink-0">
                      <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Aşağı nota */}
        <div className="text-center px-4 pb-10">
          <p className="text-white/30 text-xs">
            Hər missiyanı tamamlayaraq növbətini aç 🎖️
          </p>
        </div>
      </div>
    </div>
  );
}
