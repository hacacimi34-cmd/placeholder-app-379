import { useState } from "react";
import { MapPin, Calendar, ChevronRight } from "lucide-react";
import { GameScene, GameChoice } from "@/lib/gameData";
import TypewriterText from "./TypewriterText";

interface SceneViewProps {
  scene: GameScene;
  onChoice: (choice: GameChoice) => void;
  onTextDone?: () => void;
}

export default function SceneView({ scene, onChoice, onTextDone }: SceneViewProps) {
  const [textDone, setTextDone] = useState(false);
  const [feedback, setFeedback] = useState<GameChoice | null>(null);

  const handleChoice = (choice: GameChoice) => {
    if (choice.feedback && !feedback) {
      setFeedback(choice);
      return;
    }
    onChoice(choice);
  };

  return (
    <div key={scene.id} className="min-h-screen w-full relative animate-scene-fade">
      {/* Fon şəkli */}
      <div className="fixed inset-0 z-0">
        <img
          src={scene.image}
          alt="Səhnə"
          className="w-full h-full object-cover animate-slow-zoom"
          style={{ width: "100%" }}
        />
        <div className="absolute inset-0 bg-overlay-dark" />
      </div>

      {/* Məzmun */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end pb-20 pt-20 px-4 sm:px-8 max-w-3xl mx-auto">
        {/* Yer və tarix */}
        {(scene.location || scene.date) && (
          <div className="flex flex-wrap items-center gap-3 mb-4 animate-text-rise" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
            {scene.location && (
              <div className="flex items-center gap-1.5 text-sky-300/90 text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {scene.location}
              </div>
            )}
            {scene.date && (
              <div className="flex items-center gap-1.5 text-white/50 text-sm">
                <Calendar className="w-3.5 h-3.5" />
                {scene.date}
              </div>
            )}
          </div>
        )}

        {/* Danışan */}
        {scene.speaker && (
          <div className="mb-2 animate-text-rise" style={{ animationDelay: "0.5s", opacity: 0, animationFillMode: "forwards" }}>
            <span className="text-amber-400/80 text-xs font-bold uppercase tracking-widest">
              {scene.speaker}
            </span>
          </div>
        )}

        {/* Əsas mətn */}
        <div className="text-base sm:text-lg md:text-xl leading-relaxed text-white/95 text-shadow-lg mb-6 animate-text-rise" style={{ animationDelay: "0.6s", opacity: 0, animationFillMode: "forwards" }}>
          <TypewriterText text={scene.text} onDone={() => { setTextDone(true); onTextDone?.(); }} />
        </div>

        {/* Feedback (seçim nəticəsi) */}
        {feedback && feedback.feedback && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-text-rise">
            <p className="text-amber-200/90 text-sm leading-relaxed">💬 {feedback.feedback}</p>
            {feedback.courage && (
              <p className="mt-2 text-amber-400 text-sm font-bold">⚡ +{feedback.courage} Şücaət Xalı</p>
            )}
          </div>
        )}

        {/* Seçimlər */}
        {textDone && scene.choices && (
          <div className="space-y-3">
            {scene.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoice(choice)}
                className="animate-choice group flex items-center justify-between w-full px-5 py-4 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 backdrop-blur-md transition-all text-left"
                style={{ animationDelay: `${0.15 * i + 0.2}s` }}
              >
                <span className="text-white/90 text-sm sm:text-base font-medium pr-3 group-hover:text-white">
                  {choice.text}
                </span>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-amber-400 flex-shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Davam et göstərici */}
        {textDone && !scene.choices && (
          <div className="flex justify-center items-center gap-2 text-white/40 text-sm animate-pulse mt-4">
            <span className="animate-ping inline-block w-2 h-2 rounded-full bg-amber-400/60" />
          </div>
        )}

        {/* Feedback-dən sonra davam */}
        {feedback && (
          <div className="mt-4">
            <button
              onClick={() => onChoice(feedback)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all animate-choice"
            >
              Davam et
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
