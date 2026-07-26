import { useState, useEffect, useCallback } from "react";
import { chapters } from "@/lib/gameData";

const STORAGE_KEY = "mubbariz_game_progress_v1";

export interface GameProgress {
  completedChapters: number[]; // tamamlanmış missiya ID-ləri
  currentChapter: number; // cari missiya
  couragePoints: number; // şücaət xalı
  choicesMade: Record<string, string>; // səhnə ID -> seçilmiş scene
  startedAt: string; // oyun başlama tarixi
}

const defaultProgress: GameProgress = {
  completedChapters: [],
  currentChapter: 1,
  couragePoints: 0,
  choicesMade: {},
  startedAt: new Date().toISOString(),
};

export function useGameProgress() {
  const [progress, setProgress] = useState<GameProgress>(defaultProgress);
  const [loaded, setLoaded] = useState(false);

  // localStorage-dən yüklə
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProgress({ ...defaultProgress, ...parsed });
      }
    } catch {
      console.log("Proqres tapılmadı, yenidən başlanğıc");
    }
    setLoaded(true);
  }, []);

  // localStorage-a saxla
  const save = useCallback((data: GameProgress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      console.log("Proqres saxlanmadı");
    }
  }, []);

  const completeChapter = useCallback(
    (chapterId: number) => {
      setProgress((prev) => {
        const updated: GameProgress = {
          ...prev,
          completedChapters: prev.completedChapters.includes(chapterId)
            ? prev.completedChapters
            : [...prev.completedChapters, chapterId],
          currentChapter: Math.max(prev.currentChapter, chapterId + 1),
        };
        save(updated);
        return updated;
      });
    },
    [save]
  );

  const addCourage = useCallback(
    (amount: number) => {
      setProgress((prev) => {
        const updated = { ...prev, couragePoints: prev.couragePoints + amount };
        save(updated);
        return updated;
      });
    },
    [save]
  );

  const recordChoice = useCallback(
    (sceneId: string, nextScene: string) => {
      setProgress((prev) => {
        const updated = {
          ...prev,
          choicesMade: { ...prev.choicesMade, [sceneId]: nextScene },
        };
        save(updated);
        return updated;
      });
    },
    [save]
  );

  const isChapterUnlocked = useCallback(
    (chapterId: number) => {
      if (chapterId === 1) return true;
      return progress.completedChapters.includes(chapterId - 1);
    },
    [progress.completedChapters]
  );

  const resetProgress = useCallback(() => {
    const fresh: GameProgress = {
      ...defaultProgress,
      startedAt: new Date().toISOString(),
    };
    setProgress(fresh);
    save(fresh);
  }, [save]);

  const completionPercent = Math.round(
    (progress.completedChapters.length / chapters.length) * 100
  );

  return {
    progress,
    loaded,
    completeChapter,
    addCourage,
    recordChoice,
    isChapterUnlocked,
    resetProgress,
    completionPercent,
  };
}
