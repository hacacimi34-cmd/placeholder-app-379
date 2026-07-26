import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Heart, BookOpen } from "lucide-react";
import { useGameProgress } from "@/hooks/useGameProgress";

const timeline = [
  { date: "7 fevral 1988", event: "Biləsuvar rayonunun Əliabad kəndində anadan oldu", icon: "👶" },
  { date: "1994 – 2005", event: "Əliabad kənd məktəbində təhsil aldı", icon: "📚" },
  { date: "2005", event: "Hərbi çağırışla Azərbaycan Ordusuna qoşuldu", icon: "🪖" },
  { date: "2007", event: "Xidməti Çavuş rütbəsi ilə xidməti başa vurdu", icon: "🎖️" },
  { date: "2009", event: "Könüllü olaraq yenidən orduya, cəbhəyə qayıtdı (Gizir)", icon: "⚔️" },
  { date: "18–19 iyun 2010", event: "Cəbhədə qəhrəmanlıq göstərərək şəhid oldu", icon: "🤲" },
  { date: "22 iyun 2010", event: "Azərbaycanın Milli Qəhrəmanı adına layiq görüldü", icon: "🏆" },
];

export default function Memorial() {
  const navigate = useNavigate();
  const { progress, completionPercent } = useGameProgress();
  const couragePoints = progress.couragePoints;

  return (
    <div className="min-h-screen w-full relative">
      {/* Fon */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/29190201/pexels-photo-29190201.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
          alt=""
          className="w-full h-full object-cover"
          style={{ width: "100%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/95" />
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="px-4 sm:px-8 py-5">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Ana Səhifə</span>
          </button>
        </div>

        {/* Başlıq */}
        <div className="text-center px-4 pt-8 pb-12 max-w-3xl mx-auto">
          <div className="text-4xl mb-4">🕯️</div>
          <div className="h-1.5 az-stripe w-24 mx-auto rounded-full mb-6" />
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-2">XATİRƏ</h1>
          <p className="text-gold text-lg sm:text-2xl font-bold mb-4">Mübariz İbrahimov</p>
          <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            7 fevral 1988 — 19 iyun 2010 · Azərbaycanın Milli Qəhrəmanı
          </p>
        </div>

        {/* Nailiyyətlər */}
        {couragePoints > 0 && (
          <div className="max-w-2xl mx-auto px-4 mb-12">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <Flame className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-amber-400 text-xl font-black">{couragePoints}</div>
                  <div className="text-amber-300/60 text-xs">Şücaət Xalı</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <Heart className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-emerald-400 text-xl font-black">{completionPercent}%</div>
                  <div className="text-emerald-300/60 text-xs">Missiya Tərəqqisi</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Həyat xronologiyası */}
        <div className="max-w-2xl mx-auto px-4 pb-16">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-bold text-white">Həyat Xronologiyası</h2>
          </div>

          <div className="space-y-1">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-4 group">
                {/* Şaquli xətt */}
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-white/20 to-transparent min-h-[40px]" />
                  )}
                </div>

                {/* Mətn */}
                <div className="flex-1 pb-6">
                  <div className="text-amber-400/80 text-xs font-bold uppercase tracking-wider mb-1">
                    {item.date}
                  </div>
                  <div className="text-white/80 text-sm sm:text-base">
                    {item.event}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Son dua */}
        <div className="max-w-2xl mx-auto px-4 pb-16">
          <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-amber-500/20 text-center">
            <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4">
              «Şəhidlər ölməz, vətən bölünməz!»
            </p>
            <p className="text-gold text-base sm:text-lg font-bold mb-4">
              Allah Mübariz İbrahimova və bütün şəhidlərimizə rəhmət eləsin 🤲
            </p>
            <p className="text-white/40 text-xs tracking-wider">
              VƏTƏN SAĞ OLSUN 🇦🇿
            </p>
          </div>
        </div>

        {/* Düymələr */}
        <div className="flex items-center justify-center gap-3 px-4 pb-16">
          <button
            onClick={() => navigate("/map")}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-sm font-semibold transition-all"
          >
            Missiyaları Yenidən Yaşa
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-all"
          >
            Ana Səhifə
          </button>
        </div>
      </div>
    </div>
  );
}
