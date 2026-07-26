import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, Trophy, ChevronLeft } from "lucide-react";
import { useGameProgress } from "@/hooks/useGameProgress";

interface GameHUDProps {
  chapterId: number;
  chapterTitle: string;
}

export default function GameHUD({ chapterId, chapterTitle }: GameHUDProps) {
  const navigate = useNavigate();
  const { progress } = useGameProgress();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
      <button
        onClick={() => navigate("/map")}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all text-sm text-white/80 hover:text-white"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Missiyalar</span>
      </button>

      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
            Missiya {chapterId}
          </span>
        </div>
        <span className="hidden md:block text-white/60 text-sm max-w-[200px] truncate">
          {chapterTitle}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 text-sm font-bold">{progress.couragePoints}</span>
        </div>
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all"
        >
          <HomeIcon className="w-4 h-4 text-white/60" />
        </button>
      </div>
    </div>
  );
}
