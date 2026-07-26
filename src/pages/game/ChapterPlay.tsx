import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Award, Star } from "lucide-react";
import { chapters, scenes, getChapter, GameChoice } from "@/lib/gameData";
import { useGameProgress } from "@/hooks/useGameProgress";
import SceneView from "@/components/game/SceneView";
import GameHUD from "@/components/game/GameHUD";

export default function ChapterPlay() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { completeChapter, addCourage, recordChoice, isChapterUnlocked } = useGameProgress();

  const numChapterId = parseInt(chapterId || "1", 10);
  const chapter = getChapter(numChapterId);

  const [currentSceneId, setCurrentSceneId] = useState(chapter?.startScene || "1_1");
  const [transitioning, setTransitioning] = useState(false);

  // Chapter dəyişəndə ilk səhnəyə qayıt
  useEffect(() => {
    const ch = getChapter(numChapterId);
    if (ch) {
      setCurrentSceneId(ch.startScene);
    }
  }, [numChapterId]);

  const currentScene = scenes[currentSceneId];

  const handleChoice = useCallback(
    (choice: GameChoice) => {
      // Şücaət xalı əlavə et
      if (choice.courage) {
        addCourage(choice.courage);
      }

      recordChoice(currentSceneId, choice.nextScene);

      // Xüsusi marşrutlar
      if (choice.nextScene === "HOME") {
        navigate("/");
        return;
      }
      if (choice.nextScene === "MAP") {
        navigate("/map");
        return;
      }

      // Missiya keçidi — başqa missiyaya
      const nextScene = scenes[choice.nextScene];
      if (nextScene && nextScene.chapterId !== numChapterId) {
        // Cari missiyanı tamamla
        completeChapter(numChapterId);
        // Yeni missiyaya keçid ekranı göstər
        setTransitioning(true);
        setTimeout(() => {
          navigate(`/play/${nextScene.chapterId}`);
        }, 100);
        return;
      }

      // Eyni missiya daxilində keçid
      if (nextScene?.isChapterEnd) {
        completeChapter(nextScene.chapterId);
      }

      setTransitioning(true);
      setTimeout(() => {
        setCurrentSceneId(choice.nextScene);
        setTransitioning(false);
      }, 150);
    },
    [currentSceneId, numChapterId, addCourage, recordChoice, completeChapter, navigate]
  );

  // Yararsız missiya və ya kilidli
  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-white/60 mb-4">Missiya tapılmadı</p>
          <button
            onClick={() => navigate("/map")}
            className="px-6 py-3 rounded-xl bg-amber-500 text-black font-bold"
          >
            Missiya Xəritəsinə Qayıt
          </button>
        </div>
      </div>
    );
  }

  if (!isChapterUnlocked(numChapterId)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <Award className="w-12 h-12 text-amber-500/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Missiya Kilidlidir</h2>
          <p className="text-white/50 mb-6">Bu missiyanı açmaq üçün əvvəlki missiyanı tamamla</p>
          <button
            onClick={() => navigate("/map")}
            className="px-6 py-3 rounded-xl bg-amber-500 text-black font-bold"
          >
            Missiya Xəritəsinə Qayıt
          </button>
        </div>
      </div>
    );
  }

  if (!currentScene) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60">
        Səhnə yüklənir...
      </div>
    );
  }

  const isLastChapter = numChapterId === chapters.length;
  const isChapterComplete = currentScene.isChapterEnd;

  return (
    <div className={`min-h-screen transition-opacity duration-150 ${transitioning ? "opacity-0" : "opacity-100"}`}>
      <GameHUD chapterId={numChapterId} chapterTitle={chapter.title} />
      <SceneView scene={currentScene} onChoice={handleChoice} />

      {/* Missiya tamamlandı overlay */}
      {isChapterComplete && currentScene.isGameEnd && (
        <div className="fixed bottom-0 left-0 right-0 z-40 pb-8 pt-20 bg-gradient-to-t from-black via-black/60 to-transparent">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/30">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 text-sm font-bold">OYUN TAMAMLANDI</span>
            </div>
          </div>
        </div>
      )}

      {/* Missiya tamamlandı — son deyil */}
      {isChapterComplete && !currentScene.isGameEnd && (
        <div className="fixed bottom-0 left-0 right-0 z-40 pb-6 pt-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/30">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Missiya {numChapterId} tamamlandı
              </span>
            </div>
            {!isLastChapter && (
              <p className="text-white/40 text-xs mt-2">
                Missiya {numChapterId + 1} açıldı 🎖️
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
