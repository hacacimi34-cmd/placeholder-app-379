import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Video, Mic, MicOff, VideoOff, BrainCircuit, CheckCircle2,
  ArrowRight, ArrowLeft, Clock, Award, AlertCircle, Sparkles, Send
} from "lucide-react";
import db from "@/lib/shared/kliv-database.js";
import auth from "@/lib/shared/kliv-auth.js";
import functions from "@/lib/shared/kliv-functions.js";
import { toast } from "sonner";

type Phase = "loading" | "intro" | "interview" | "feedback" | "complete";

const InterviewRoom = () => {
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>("loading");
  const [interview, setInterview] = useState<any>(null);
  const [vacancy, setVacancy] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [finalReport, setFinalReport] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInterview();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const loadInterview = async () => {
    try {
      const user = await auth.getUser();
      if (!user) {
        toast.error("Müsahibəyə başlamaq üçün daxil olun");
        navigate("/auth/candidate-register");
        return;
      }

      const interviews = await db.query("interviews", {
        _row_id: `eq.${interviewId}`,
      });

      if (interviews.length === 0) {
        setError("Müsahibə tapılmadı");
        setPhase("intro");
        return;
      }

      const intData = interviews[0];
      setInterview(intData);

      const vacancies = await db.query("vacancies", {
        _row_id: `eq.${intData.vacancy_id}`,
      });
      if (vacancies.length > 0) setVacancy(vacancies[0]);

      // AI suallarını yüklə
      try {
        const result = await functions.post("ai-interview-generator", {
          action: "generate_questions",
          vacancy_id: String(intData.vacancy_id),
          question_count: 7,
        });
        if (result.questions && result.questions.length > 0) {
          setQuestions(result.questions);
        } else {
          setQuestions(getFallbackQuestions());
        }
      } catch (err) {
        console.error("AI question generation failed:", err);
        setQuestions(getFallbackQuestions());
      }

      setPhase("intro");
    } catch (err) {
      console.error("Load interview error:", err);
      setError("Müsahibə məlumatları yüklənə bilmədi");
      setQuestions(getFallbackQuestions());
      setPhase("intro");
    }
  };

  const getFallbackQuestions = () => [
    { type: "behavioral", difficulty: "easy", question: "Özünüz haqqında qısa məlumat verin. Təhsil və təcrübəniz barədə danışın.", expected_points: 10 },
    { type: "technical", difficulty: "medium", question: "Bu vəzifə üçün ən vacib bacarıqlar hansılardır və sizdə hansılar mövcuddur?", expected_points: 10 },
    { type: "behavioral", difficulty: "medium", question: "Komanda işində bir münaqişəni necə həll etdiyinizi nümunə ilə izah edin.", expected_points: 10 },
    { type: "technical", difficulty: "medium", question: "Son layihənizdə qarşılaşdığınız ən böyük texniki probleminizi necə həll etdiniz?", expected_points: 10 },
    { type: "behavioral", difficulty: "easy", question: "Nişansız işləmək və ya sıx deadline altında işləmək - hansını üstün tutursunuz və niyə?", expected_points: 10 },
    { type: "practical", difficulty: "hard", question: "Şirkətimizə qoşulsanız, ilk 90 gündə nələr edərdiniz?", expected_points: 10 },
    { type: "behavioral", difficulty: "medium", question: "Karyera hədəfləriniz nələrdir və bu vəzifə ona necə uyğun gəlir?", expected_points: 10 },
  ];

  const toggleCamera = async () => {
    if (cameraOn) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraOn(false);
      setMicOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraOn(true);
        toast.success("Kamera aktivləşdirildi");
      } catch (err) {
        toast.error("Kamera aktivləşdirilə bilmədi. Brauzer icazəsini yoxlayın.");
        console.error("Camera error:", err);
      }
    }
  };

  const toggleMic = async () => {
    if (micOn) {
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
      }
      setMicOn(false);
    } else {
      try {
        if (!cameraOn) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
          setCameraOn(true);
        } else if (streamRef.current) {
          streamRef.current.getAudioTracks().forEach((t) => (t.enabled = true));
        }
        setMicOn(true);
        toast.success("Mikrofon aktivləşdirildi");
      } catch (err) {
        toast.error("Mikrofon aktivləşdirilə bilmədi");
      }
    }
  };

  const startInterview = () => {
    setPhase("interview");
    setCurrentQ(0);
    setCurrentAnswer("");
    setAnswers([]);
  };

  const submitAnswer = async () => {
    if (currentAnswer.trim().length < 10) {
      toast.error("Zəhmət olmasa daha ətraflı cavab yazın (minimum 10 simvol)");
      return;
    }

    setSubmitting(true);
    const question = questions[currentQ];

    try {
      const result = await functions.post("ai-interview-generator", {
        action: "answer_evaluation",
        question: question.question,
        answer: currentAnswer,
        expected_points: question.expected_points || 10,
      });

      const evaluation = result.evaluation || {
        score: Math.floor((question.expected_points || 10) * 0.5),
        maxScore: question.expected_points || 10,
        percentage: 50,
        feedback: "Cavabınız qeydə alındı.",
        answer_quality: "satisfactory",
      };

      setFeedback(evaluation);
      setPhase("feedback");
    } catch (err) {
      console.error("Evaluation error:", err);
      setFeedback({
        score: Math.floor((question.expected_points || 10) * 0.5),
        maxScore: question.expected_points || 10,
        percentage: 50,
        feedback: "Cavabınız qeydə alındı.",
        answer_quality: "satisfactory",
      });
      setPhase("feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = async () => {
    const newAnswers = [...answers, { ...questions[currentQ], ...feedback, given_answer: currentAnswer }];
    setAnswers(newAnswers);
    setFeedback(null);
    setCurrentAnswer("");

    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
      setPhase("interview");
    } else {
      await finishInterview(newAnswers);
    }
  };

  const finishInterview = async (allAnswers: any[]) => {
    try {
      const totalScore = allAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
      const maxScore = allAnswers.reduce((sum, a) => sum + (a.maxScore || 10), 0);
      const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

      let decision = "Réjeitée";
      if (percentage >= 80) decision = "Qəbul Edildi";
      else if (percentage >= 60) decision = "Nəzərdən Keçirilir";

      const report = {
        total_score: totalScore,
        max_score: maxScore,
        percentage,
        decision,
        answers: allAnswers,
      };
      setFinalReport(report);

      // Müsahibə status-unu yenilə
      try {
        await db.update("interviews", { _row_id: `eq.${interviewId}` }, {
          status: "completed",
          notes: JSON.stringify({ score: percentage, decision, answers: allAnswers }),
        });
      } catch (e) {
        console.error("Update interview error:", e);
      }

      setPhase("complete");
    } catch (err) {
      console.error("Finish interview error:", err);
      setPhase("complete");
    }
  };

  // === LOADING ===
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-blue-300">AI müsahibə hazırlanır...</p>
        </div>
      </div>
    );
  }

  // === ERROR ===
  if (error && phase === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
        <Card className="max-w-md bg-slate-900/90 border-slate-800">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-white mb-4">{error}</p>
            <p className="text-slate-400 text-sm mb-6">Yenə də nümayiş müsahibəsi keçə bilərsiniz</p>
            <Button onClick={startInterview} className="bg-blue-600 hover:bg-blue-700">
              Nümayiş Müsahibəsinə Başla
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // === INTRO ===
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 flex items-center justify-center">
        <div className="max-w-3xl w-full">
          <Card className="bg-slate-900/90 border-slate-800 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <BrainCircuit className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl text-white font-bold">AI Müsahibə</CardTitle>
              <p className="text-blue-300 mt-2">{vacancy?.title || "Vakansiya"} üçün ağıllı müsahibə</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Kamera preview */}
              <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-video max-w-md mx-auto border-2 border-slate-700">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {!cameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                    <VideoOff className="w-12 h-12 text-slate-600" />
                    <p className="text-slate-500 text-sm">Kamera deaktiv</p>
                  </div>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <Button
                    size="sm"
                    variant={cameraOn ? "default" : "secondary"}
                    onClick={toggleCamera}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant={micOn ? "default" : "secondary"}
                    onClick={toggleMic}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-400">{questions.length}</p>
                  <p className="text-xs text-slate-400">Suallar</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-purple-400">~{questions.length * 3}</p>
                  <p className="text-xs text-slate-400">Dəqiqə</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-400">AI</p>
                  <p className="text-xs text-slate-400">Qiymətləndirici</p>
                </div>
              </div>

              <div className="bg-blue-950/50 border border-blue-800/50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-blue-200 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Necə işləyir?
                </p>
                <ul className="text-sm text-slate-300 space-y-1 ml-6 list-disc">
                  <li>AI hər sualı sıra ilə təqdim edəcək</li>
                  <li>Sualı diqqətlə oxuyun və cavabınızı yazın</li>
                  <li>AI cavabınızı dərhal qiymətləndirəcək</li>
                  <li>Sonunda ümumi bal və nəticə alacaqsınız</li>
                </ul>
              </div>

              <Button
                onClick={startInterview}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-6 text-lg"
              >
                <BrainCircuit className="w-5 h-5 mr-2" />
                Müsahibəyə Başla
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/candidate/dashboard")}
                className="w-full text-slate-400"
              >
                Geri qayıt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // === INTERVIEW ===
  if (phase === "interview") {
    const q = questions[currentQ];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-300">
                Sual {currentQ + 1} / {questions.length}
              </span>
              <Badge variant="secondary" className="capitalize">
                {q.type === "technical" ? "Texniki" : q.type === "behavioral" ? "Davranış" : "Praktiki"}
              </Badge>
            </div>
            <Progress value={((currentQ) / questions.length) * 100} className="h-2" />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Sol: Kamera */}
            <div className="md:col-span-1">
              <div className="sticky top-4 space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-video border-2 border-slate-700">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {!cameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <VideoOff className="w-10 h-10 text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant={cameraOn ? "default" : "secondary"} onClick={toggleCamera} className="rounded-full">
                    {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant={micOn ? "default" : "secondary"} onClick={toggleMic} className="rounded-full">
                    {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Sağ: Sual və cavab */}
            <div className="md:col-span-2 space-y-4">
              <Card className="bg-slate-900/90 border-slate-800">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-purple-300 text-sm font-medium">AI Müsahibəçi</span>
                  </div>
                  <CardTitle className="text-xl text-white leading-relaxed">{q.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Cavabınızı diqqətlə yazın. AI dərhal qiymətləndirəcək.
                  </p>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Cavabınızı buraya yazın..."
                    rows={6}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    autoFocus
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-500">{currentAnswer.length} simvol</span>
                    <Button
                      onClick={submitAnswer}
                      disabled={submitting || currentAnswer.trim().length < 10}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Qiymətləndirilir...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Cavabı Təqdim Et
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === FEEDBACK ===
  if (phase === "feedback" && feedback) {
    const qualityColors: Record<string, string> = {
      good: "text-green-400 bg-green-950/50 border-green-800",
      satisfactory: "text-yellow-400 bg-yellow-950/50 border-yellow-800",
      needs_improvement: "text-orange-400 bg-orange-950/50 border-orange-800",
    };
    const qualityLabels: Record<string, string> = {
      good: "Yaxşı cavab!",
      satisfactory: "Kafi cavab",
      needs_improvement: "İnkişafa ehtiyac var",
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <Card className="bg-slate-900/90 border-slate-800">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${qualityColors[feedback.answer_quality] || qualityColors.satisfactory}`}>
                  <Award className="w-8 h-8" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">{qualityLabels[feedback.answer_quality] || "Cavab qiymətləndirildi"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score */}
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-400">{feedback.percentage || 0}%</p>
                  <p className="text-xs text-slate-400">{feedback.score || 0}/{feedback.maxScore || 10} bal</p>
                </div>
              </div>

              {/* Progress bar */}
              <Progress value={feedback.percentage || 0} className="h-3" />

              {/* Feedback */}
              <div className={`rounded-lg p-4 border ${qualityColors[feedback.answer_quality] || qualityColors.satisfactory}`}>
                <p className="text-sm">{feedback.feedback || "Cavabınız qeydə alındı."}</p>
              </div>

              <Button
                onClick={nextQuestion}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-6 text-lg"
              >
                {currentQ + 1 < questions.length ? (
                  <>
                    Növbəti Sual
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Müsahibəni Bitir
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // === COMPLETE ===
  if (phase === "complete" && finalReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <Card className="bg-slate-900/90 border-slate-800">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  finalReport.percentage >= 80 ? "bg-green-950 border-2 border-green-600" :
                  finalReport.percentage >= 60 ? "bg-yellow-950 border-2 border-yellow-600" :
                  "bg-orange-950 border-2 border-orange-600"
                }`}>
                  <Award className={`w-10 h-10 ${
                    finalReport.percentage >= 80 ? "text-green-400" :
                    finalReport.percentage >= 60 ? "text-yellow-400" : "text-orange-400"
                  }`} />
                </div>
              </div>
              <CardTitle className="text-3xl text-white font-bold">Müsahibə Tamamlandı!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Final score */}
              <div className="text-center">
                <p className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {finalReport.percentage}%
                </p>
                <p className="text-slate-400 mt-2">{finalReport.total_score} / {finalReport.max_score} bal</p>
              </div>

              {/* Decision */}
              <div className={`text-center py-4 rounded-xl border ${
                finalReport.percentage >= 80 ? "bg-green-950/50 border-green-800 text-green-300" :
                finalReport.percentage >= 60 ? "bg-yellow-950/50 border-yellow-800 text-yellow-300" :
                "bg-orange-950/50 border-orange-800 text-orange-300"
              }`}>
                <p className="text-xl font-bold">{finalReport.decision}</p>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-300 mb-2">Sual-Cavab Xülasəsi:</p>
                {finalReport.answers.map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">Sual {i + 1}: {a.question?.substring(0, 60)}...</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <Progress value={a.percentage || 0} className="w-16 h-2" />
                      <span className="text-xs text-slate-400 w-10 text-right">{a.percentage || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate("/candidate/dashboard")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6"
              >
                Dashboard-a Qayıt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default InterviewRoom;
