import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Video, Mic, MicOff, VideoOff, BrainCircuit, CheckCircle2,
  ArrowRight, Clock, Award, AlertCircle, Sparkles, Send,
  Square, Radio, Eye, TrendingUp, MessageSquare, Target
} from "lucide-react";

// AI Personası - qadın və kişi müsahibəçilər
const AI_PERSONAS = [
  { name: "Aysel", gender: "female", title: "HR Direktor", seed: "Aysel" },
  { name: "Leyla", gender: "female", title: "HR Menecer", seed: "Leyla" },
  { name: "Nərminə", gender: "female", title: "Talent Acquisition", seed: "Nermine" },
  { name: "Rəşad", gender: "male", title: "HR Direktor", seed: "Reshad" },
  { name: "Tural", gender: "male", title: "HR Menecer", seed: "Tural" },
  { name: "Elçin", gender: "male", title: "Talent Acquisition", seed: "Elchin" },
];

// Qadın/Kşi avatarı - DiceBear API
const getAvatarUrl = (seed: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=c0aede,b6e3f4,d1f4c0,ffd5dc,ffdfbf`;
import db from "@/lib/shared/kliv-database.js";
import auth from "@/lib/shared/kliv-auth.js";
import functions from "@/lib/shared/kliv-functions.js";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { toast } from "sonner";

type Phase = "loading" | "intro" | "interview" | "feedback" | "complete";
type InputMode = "voice" | "text";

const InterviewRoom = () => {
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase, setPhase] = useState<Phase>("loading");
  const [vacancy, setVacancy] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [finalReport, setFinalReport] = useState<any>(null);
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("voice");
  const [interviewSeconds, setInterviewSeconds] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [persona] = useState(() => AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)]);

  const speech = useSpeechRecognition();

  // Brauzer səslərini yüklə - neyral səsləri avtomatik tap
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const trVoices = voices.filter(v => v.lang?.startsWith("tr") || v.lang?.startsWith("az"));
        const neural = trVoices.filter(v => /natural|neural|online/i.test(v.name));
        console.log(`[TTS] ${voices.length} səs yükləndi, ${trVoices.length} Türk, ${neural.length} neyral`);
        if (neural.length > 0) {
          console.log("[TTS] Neyral səslər:", neural.map(v => `${v.name} (${v.lang})`));
        }
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    // Chrome gec yükləyir
    const interval = setInterval(loadVoices, 1000);
    setTimeout(() => clearInterval(interval), 10000);
    return () => clearInterval(interval);
  }, []);

  // Timer
  useEffect(() => {
    if (phase === "interview") {
      timerRef.current = setInterval(() => {
        setInterviewSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // AI feedback-i səslə bildir
  useEffect(() => {
    if (phase === "feedback" && feedback) {
      const qualityReactions: Record<string, string> = {
        excellent: "Çox əla cavab verdiniz. Həqiqətən təsir etdiniz.",
        good: "Yaxşı cavab idi. Təşəkkür edirəm.",
        satisfactory: "Cavabınız kafi səviyyədədir. Davam edək.",
        needs_improvement: "Bu mövzunu bir az daha geniş izah edə bilərdiniz. Amma yaxşıdır.",
      };
      const reaction = qualityReactions[feedback.quality] || "Cavabınız qeydə alındı.";
      const fullFeedback = `${reaction} ${feedback.feedback || ""}`;
      setTimeout(() => speakText(fullFeedback), 300);
    }
  }, [phase, feedback]);

  // Update transcript to answer
  useEffect(() => {
    if (inputMode === "voice" && (speech.transcript || speech.interimTranscript)) {
      setCurrentAnswer((speech.transcript + " " + speech.interimTranscript).trim());
    }
  }, [speech.transcript, speech.interimTranscript, inputMode]);

  // Cleanup
  useEffect(() => {
    loadInterview();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (speech.isListening) speech.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      // Audio və TTS dayandır
      ttsAbortRef.current = true;
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (edgeWsRef.current) { try { edgeWsRef.current.close(); } catch {} edgeWsRef.current = null; }
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Kamera aktivləşdirilə bilmədi. Brauzer icazəsini yoxlayın.");
    }
  }, [speech]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortRef = useRef(false);
  const edgeWsRef = useRef<WebSocket | null>(null);

  // BRAUZERDƏN birbaşa Microsoft Edge Neyral TTS
  // Server IP bloklanır (403), amma brauzer IP-si keçir!
  const speakWithEdgeBrowser = (text: string, isFemale: boolean): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
      const voice = isFemale ? "tr-TR-EmelNeural" : "tr-TR-AhmetNeural";
      const connId = crypto.randomUUID().replace(/-/g, "");
      const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TOKEN}&ConnectionId=${connId}`;

      const audioChunks: ArrayBuffer[] = [];
      let settled = false;

      const cleanup = () => {
        if (edgeWsRef.current) {
          edgeWsRef.current.onmessage = null;
          edgeWsRef.current.onerror = null;
          edgeWsRef.current.onclose = null;
          try { edgeWsRef.current.close(); } catch {}
          edgeWsRef.current = null;
        }
      };

      const timeout = setTimeout(() => {
        if (!settled) { settled = true; cleanup(); resolve(null); }
      }, 10000);

      try {
        const ws = new WebSocket(wsUrl);
        edgeWsRef.current = ws;
        ws.binaryType = "arraybuffer";

        ws.onopen = () => {
          console.log(`[EdgeBrowser] Connected! Voice: ${voice}`);

          const config = JSON.stringify({
            context: {
              synthesis: {
                audio: {
                  metadataOptions: { sentenceBoundaryEnabled: "false", wordBoundaryEnabled: "false" },
                  outputFormat: "audio-24khz-48kbitrate-mono-mp3",
                },
              },
            },
          });
          ws.send(`X-Timestamp:${new Date().toISOString()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n${config}`);

          const reqId = crypto.randomUUID().replace(/-/g, "");
          const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
          const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='tr-TR'><voice name='${voice}'><prosody rate='-10%'>${escaped}</prosody></voice></speak>`;

          setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(`X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${new Date().toISOString()}\r\nPath:ssml\r\n\r\n${ssml}`);
              console.log("[EdgeBrowser] SSML sent");
            }
          }, 200);
        };

        ws.onmessage = (event) => {
          if (typeof event.data === "string") {
            if (event.data.includes("Path:turn.end")) {
              console.log("[EdgeBrowser] turn.end!");
              clearTimeout(timeout);
              if (!settled) {
                settled = true;
                cleanup();
                if (audioChunks.length > 0) {
                  resolve(new Blob(audioChunks, { type: "audio/mpeg" }));
                } else {
                  resolve(null);
                }
              }
            }
          } else if (event.data instanceof ArrayBuffer) {
            const data = new Uint8Array(event.data);
            if (data.length < 3) return;
            const headerLen = (data[0] << 8) | data[1];
            if (headerLen > 0 && headerLen < data.length) {
              try {
                const header = new TextDecoder().decode(data.slice(2, headerLen));
                if (header.includes("Path:audio")) {
                  const audioData = data.slice(headerLen);
                  if (audioData.length > 0) {
                    audioChunks.push(audioData.buffer.slice(audioData.byteOffset, audioData.byteOffset + audioData.byteLength));
                    console.log(`[EdgeBrowser] Audio chunk: ${audioData.length} bytes`);
                  }
                }
              } catch {}
            }
          }
        };

        ws.onerror = (e) => {
          console.warn("[EdgeBrowser] WS error:", e);
          clearTimeout(timeout);
          if (!settled) { settled = true; cleanup(); resolve(null); }
        };

        ws.onclose = () => {
          clearTimeout(timeout);
          if (!settled) {
            settled = true;
            if (audioChunks.length > 0) {
              resolve(new Blob(audioChunks, { type: "audio/mpeg" }));
            } else {
              resolve(null);
            }
          }
        };
      } catch (err) {
        console.warn("[EdgeBrowser] Init error:", err);
        clearTimeout(timeout);
        resolve(null);
      }
    });
  };

  // Mətni cümlələrə böl (neyral TTS üçün 300 simvol)
  const splitIntoChunks = (text: string, maxLen = 280): string[] => {
    const clean = text
      .replace(/[*#_`]/g, "")
      .replace(/\.{2,}/g, ".")
      .replace(/\s+/g, " ")
      .trim();
    const sentences = clean.split(/(?<=[.!?])\s+/).filter((s: string) => s.trim());
    const chunks: string[] = [];
    let current = "";
    for (const sentence of sentences) {
      if (sentence.length > maxLen) {
        const parts = sentence.split(/(?<=[,;:])\s+/);
        current = "";
        for (const part of parts) {
          if ((current + " " + part).length > maxLen) {
            if (current.trim()) chunks.push(current.trim());
            current = part.trim();
          } else { current += (current ? " " : "") + part; }
        }
        if (current.trim()) chunks.push(current.trim());
        current = "";
      } else if ((current + " " + sentence).length > maxLen) {
        if (current.trim()) chunks.push(current.trim());
        current = sentence.trim();
      } else { current += (current ? " " : "") + sentence; }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.length > 0 ? chunks : [clean.substring(0, maxLen)];
  };

  // ƏSAS danışıq - ən təbii səs
  const speakText = async (text: string, isFemale?: boolean) => {
    if (!text || text.trim().length === 0) return;

    ttsAbortRef.current = true;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (edgeWsRef.current) { try { edgeWsRef.current.close(); } catch {} edgeWsRef.current = null; }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    await new Promise(r => setTimeout(r, 200));
    ttsAbortRef.current = false;

    const isF = isFemale ?? persona.gender === "female";
    setAiSpeaking(true);

    // 1. BRAUZERDƏN Microsoft Edge Neyral TTS - İNSAN KİMİ
    const chunks = splitIntoChunks(text);
    console.log(`[TTS] ${chunks.length} hissə, Edge Neyral brauzer`);

    try {
      const blobs = await Promise.all(
        chunks.map((chunk) => speakWithEdgeBrowser(chunk, isF))
      );
      const validBlobs = blobs.filter((b): b is Blob => b !== null && b.size > 100);

      if (validBlobs.length > 0 && !ttsAbortRef.current) {
        const combined = new Blob(validBlobs, { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(combined);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => { URL.revokeObjectURL(audioUrl); setAiSpeaking(false); };
        audio.onerror = () => { URL.revokeObjectURL(audioUrl); setAiSpeaking(false); };
        await audio.play();
        console.log("[TTS] Edge Neyral oxunur!");
        return;
      }
    } catch (err) {
      console.warn("[TTS] Edge browser uğursuz:", err);
    }

    // 2. Fallback: Edge function (Google TTS)
    console.log("[TTS] Edge browser alınmadı, Google TTS istifadə olunur");
    const ttsVoice = isF ? "Emel" : "Ahmet";
    try {
      const resp = await fetch("/api/v2/function/tts-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.substring(0, 195), voice: ttsVoice }),
      });
      if (resp.ok) {
        const blob = await resp.blob();
        if (blob.size > 100) {
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.onended = () => { URL.revokeObjectURL(audioUrl); setAiSpeaking(false); };
          audio.onerror = () => { URL.revokeObjectURL(audioUrl); setAiSpeaking(false); };
          await audio.play();
          return;
        }
      }
    } catch {}

    setAiSpeaking(false);
  };

  const loadInterview = async () => {
    try {
      const user = await auth.getUser();
      if (!user) {
        toast.error("Müsahibəyə başlamaq üçün daxil olun");
        navigate("/auth/candidate-register");
        return;
      }

      const interviews = await db.query("interviews", { _row_id: `eq.${interviewId}` });
      if (interviews.length === 0) {
        setError("Müsahibə tapılmadı. Nümayiş müsahibəsi keçə bilərsiniz.");
        setQuestions(getFallbackQuestions());
        setPhase("intro");
        return;
      }

      const intData = interviews[0];
      const vacancies = await db.query("vacancies", { _row_id: `eq.${intData.vacancy_id}` });
      if (vacancies.length > 0) setVacancy(vacancies[0]);

      try {
        const result = await functions.post("ai-interview-engine", {
          action: "generate_questions",
          vacancy_id: String(intData.vacancy_id),
          language: "az",
        });
        if (result.questions && result.questions.length > 0) {
          setQuestions(result.questions);
        } else {
          setQuestions(getFallbackQuestions());
        }
      } catch (err: any) {
        console.error("AI question generation failed:", err);
        // Edge function bəzən 500 qaytarır amma məlumat valid olur
        if (err?.details?.questions?.length > 0) {
          setQuestions(err.details.questions);
        } else {
          setQuestions(getFallbackQuestions());
        }
      }

      setPhase("intro");
    } catch (err) {
      console.error("Load interview error:", err);
      setQuestions(getFallbackQuestions());
      setPhase("intro");
    }
  };

  const getFallbackQuestions = () => [
    { id: 0, type: "intro", difficulty: "easy", question: "Zəhmət olmasa, özünüzü təqdim edin. Təhsiliniz, təcrübəniz və peşəkar arxa planınız haqqında qısaca danışın.", expected_keywords: ["təcrübə", "experience", "təhsil", "education"], time_limit: 120 },
    { id: 1, type: "technical", difficulty: "medium", question: "React və Node.js ilə bağlı təcrübəniz haqqında danışın. Hansı layihələrdə istifadə etmisiniz?", expected_keywords: ["react", "component", "node", "server", "api"], time_limit: 180 },
    { id: 2, type: "experience", difficulty: "medium", question: "Ən çətin texniki probleminizi necə həll etdiniz? Bu prosesi bir az detallı izah edin.", expected_keywords: ["problem", "həll", "solve", "debug", "layihə"], time_limit: 180 },
    { id: 3, type: "behavioral", difficulty: "medium", question: "Komandada hər hansı münaqişə ilə qarşılaşdığınız zaman, onu necə həll etdiniz?", expected_keywords: ["komanda", "team", "həll", "resolve", "ünsiyyət"], time_limit: 120 },
    { id: 4, type: "behavioral", difficulty: "easy", question: "Bu vəzifə niyə sizi maraqlandırır? Özünüzü bu vəzifəyə necə uyğun görürsünüz?", expected_keywords: ["vacansiya", "position", "bacarıq", "skill", "şirkət"], time_limit: 120 },
    { id: 5, type: "self_awareness", difficulty: "medium", question: "Əsas güclü tərəfləriniz hansılardır? Və inkişaf etdirməli olduğunuz sahələr?", expected_keywords: ["güclü", "strong", "zəif", "inkişaf", "improve"], time_limit: 120 },
    { id: 6, type: "closing", difficulty: "easy", question: "Vəzifə və ya şirkət haqqında bizə sualınız var? Sizin üçün hansı məqamlar önəmlidir?", expected_keywords: ["sual", "question", "maraq"], time_limit: 90 },
  ];

  const startInterview = () => {
    setPhase("interview");
    setCurrentQ(0);
    setCurrentAnswer("");
    setAnswers([]);
    setInterviewSeconds(0);

    // Insan kimi təbii salamlama - qısa cümlələrlə təbii fasilələr
    const greeting = `Salam. Xoş gəlmisiniz. Mənim adım ${persona.name}. Bu gün, sizinlə tanış olmaq, mənim üçün çox xoşdur. ${vacancy?.title || "Vakansiya"} vəzifəsi üçün, qısa bir müsahibə aparacağıq. Zəhmət olmasa, rahat olun. Özünüzü, tam azad şəkildə ifadə edin. İlk sualım belədir. ${questions[0]?.question || ""}`;
    setTimeout(() => speakText(greeting), 600);
  };

  const toggleListening = () => {
    if (speech.isListening) {
      speech.stop();
    } else {
      if (!speech.isSupported) {
        toast.error("Səs tanıma dəstəklənmir. Mətn rejiminə keçin.");
        setInputMode("text");
        return;
      }
      if (!cameraOn) startCamera();
      speech.start("az");
      toast.info("Danışın... AI səsinizi dinləyir");
    }
  };

  const submitAnswer = async () => {
    const answerText = currentAnswer.trim();
    if (answerText.length < 10) {
      toast.error("Zəhmət olmasa daha ətraflı cavab verin (minimum 10 simvol)");
      return;
    }

    if (speech.isListening) speech.stop();
    setSubmitting(true);
    const question = questions[currentQ];

    try {
      const result = await functions.post("ai-interview-engine", {
        action: "evaluate_answer",
        question: question.question,
        answer: answerText,
        vacancy_id: String(vacancy?._row_id || 1),
        question_type: question.type,
        expected_keywords: question.expected_keywords || [],
      });

      setFeedback(result.evaluation || {
        score: 50, maxScore: 100, percentage: 50, quality: "satisfactory",
        feedback: "Cavabınız qeydə alındı.",
      });
      setPhase("feedback");
    } catch (err: any) {
      console.error("Evaluation error:", err);
      // Edge function bəzən 500 qaytarır amma məlumat correct
      if (err?.details?.evaluation) {
        setFeedback(err.details.evaluation);
        setPhase("feedback");
      } else {
        setFeedback({
          score: 50, maxScore: 100, percentage: 50, quality: "satisfactory",
          feedback: "Cavabınız qeydə alındı. Texniki qiymətləndirmə müvəqqəti olaraq əlçatan deyil.",
          breakdown: { relevance: 15, depth: 15, structure: 8, communication: 8, vacancy_fit: 4 },
          word_count: answerText.split(/\s+/).length,
        });
        setPhase("feedback");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = async () => {
    const answerRecord = {
      question: questions[currentQ].question,
      question_type: questions[currentQ].type,
      given_answer: currentAnswer,
      score: feedback?.score || 0,
      maxScore: feedback?.maxScore || 100,
      percentage: feedback?.percentage || 0,
    };
    const newAnswers = [...answers, answerRecord];
    setAnswers(newAnswers);
    setFeedback(null);
    setCurrentAnswer("");
    speech.reset();

    if (currentQ + 1 < questions.length) {
      const nextIdx = currentQ + 1;
      setCurrentQ(nextIdx);
      setPhase("interview");

      // Insan kimi təbii keçid ifadələri
      const transitions = [
        "Təşəkkür edirəm. İndi isə, növbəti sualı verim.",
        "Çox yaxşı. Gəlin, bir az da dərindən danışaq.",
        "Anlaşılan. Növbəti mövzuya keçək bilərik.",
        "Təşəkkürlər. İndi isə, bu barədə danışın.",
        "Yaxşı cavab idi. Növbəti sualım belədir.",
        "Əla. İndi isə, fərqli bir sualım var.",
      ];
      const transition = transitions[Math.floor(Math.random() * transitions.length)];
      const fullText = `${transition} ${questions[nextIdx]?.question || ""}`;
      setTimeout(() => speakText(fullText), 300);
    } else {
      await finishInterview(newAnswers);
    }
  };

  const finishInterview = async (allAnswers: any[]) => {
    try {
      let reportData: any = null;
      try {
        const result = await functions.post("ai-interview-engine", {
          action: "final_report",
          answers: allAnswers,
          vacancy_id: String(vacancy?._row_id || 1),
        });
        reportData = result.report;
      } catch (e) {
        console.error("Report generation failed:", e);
      }

      const avgScore = reportData?.overall_score || Math.round(
        allAnswers.reduce((s, a) => s + (a.percentage || 0), 0) / Math.max(allAnswers.length, 1)
      );

      let decision = "Rədd edildi";
      if (avgScore >= 75) decision = "Qəbul Edildi ✅";
      else if (avgScore >= 55) decision = "Nəzərdən Keçirilir ⏳";

      setFinalReport({
        percentage: avgScore,
        decision,
        recommendation: reportData?.recommendation || "",
        category_scores: reportData?.category_scores || {},
        answers: allAnswers,
        total_questions: questions.length,
      });

      try {
        await db.update("interviews", { _row_id: `eq.${interviewId}` }, {
          status: "completed",
          notes: JSON.stringify({ score: avgScore, decision, answers: allAnswers }),
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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // ===== LOADING =====
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-purple-600 rounded-full animate-ping opacity-20" />
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500 mx-auto mb-2">
              <img src={getAvatarUrl(persona.seed)} className="w-full h-full object-cover bg-purple-900" />
            </div>
            <p className="text-purple-300 text-sm font-medium">{persona.name} • AI Müsahibəçi</p>
          </div>
          <p className="text-blue-300 text-lg">AI Müsahibə Sistemi Hazırlanır...</p>
          <p className="text-slate-500 text-sm mt-2">Vakansiya tələbləri analiz edilir</p>
        </div>
      </div>
    );
  }

  // ===== INTRO =====
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 flex items-center justify-center">
        <div className="max-w-3xl w-full">
          <Card className="bg-slate-900/90 border-slate-800 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {aiSpeaking && <div className="absolute inset-0 bg-purple-600 rounded-2xl animate-ping opacity-30" />}
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-purple-500">
                    <img src={getAvatarUrl(persona.seed)} className="w-full h-full object-cover bg-purple-900" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl text-white font-bold">AI Müsahibə Otağı</CardTitle>
              <p className="text-blue-300 mt-1 text-sm">{persona.name} • {persona.title}</p>
              <p className="text-slate-400 mt-2 text-base">{vacancy?.title || "Vakansiya"} üçün ağıllı müsahibə</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-video max-w-lg mx-auto border-2 border-slate-700">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <VideoOff className="w-16 h-16 text-slate-600" />
                    <p className="text-slate-500">Kameranı aktivləşdirin</p>
                  </div>
                )}
                {cameraOn && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-950/80 px-2 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-red-300 font-medium">CANLI</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                  <Button
                    size="sm"
                    variant={cameraOn ? "default" : "secondary"}
                    onClick={cameraOn ? stopCamera : startCamera}
                    className="rounded-full px-4"
                  >
                    {cameraOn ? <><Video className="w-4 h-4 mr-1" /> Kamera Açıq</> : <><VideoOff className="w-4 h-4 mr-1" /> Kameranı Aç</>}
                  </Button>
                </div>
              </div>

              {!speech.isSupported && (
                <div className="bg-orange-950/50 border border-orange-800 rounded-lg p-3 text-center">
                  <p className="text-orange-300 text-sm">⚠️ Sizin brauzer səs tanımanı dəstəkləmir. Mətn rejimi ilə cavab verə bilərsiniz.</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <MessageSquare className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{questions.length}</p>
                  <p className="text-xs text-slate-400">Suallar</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <Clock className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">~{questions.length * 3}</p>
                  <p className="text-xs text-slate-400">Dəqiqə</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <BrainCircuit className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">AI</p>
                  <p className="text-xs text-slate-400">Qiymətləndirici</p>
                </div>
              </div>

              <div className="bg-blue-950/50 border border-blue-800/50 rounded-lg p-4">
                <p className="text-sm text-blue-200 font-medium flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4" /> Necə işləyir?
                </p>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">1.</span>
                    <span>AI müsahibəçi sualı <strong>səslə</strong> və yazılı təqdim edəcək</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">2.</span>
                    <span>Siz <strong>danışaraq</strong> və ya <strong>yazaraq</strong> cavab verirsiniz</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">3.</span>
                    <span>AI cavabınızı <strong>5 kriteriya</strong> üzrə qiymətləndirir</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">4.</span>
                    <span>Sonda ümumi bal və işə qəbul qərarı alırsınız</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={startInterview}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-6 text-lg"
              >
                <BrainCircuit className="w-5 h-5 mr-2" />
                Müsahibəyə Başla
              </Button>
              <Button variant="ghost" onClick={() => navigate("/candidate/dashboard")} className="w-full text-slate-400">
                Geri qayıt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== INTERVIEW =====
  if (phase === "interview") {
    const q = questions[currentQ];
    const typeLabels: Record<string, string> = {
      intro: "Tanışlıq", technical: "Texniki", experience: "Təcrübə",
      behavioral: "Davranış", self_awareness: "Özünüqiymətləndirmə", closing: "Yekun",
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4">
        <div className="max-w-5xl mx-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-blue-300 font-medium">
                Sual {currentQ + 1} / {questions.length}
              </span>
              <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 border-purple-700">
                {typeLabels[q.type] || q.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(interviewSeconds)}</span>
            </div>
          </div>

          <Progress value={((currentQ) / questions.length) * 100} className="h-1.5 mb-6" />

          <div className="grid md:grid-cols-5 gap-4">
            {/* LEFT: Camera + AI */}
            <div className="md:col-span-2 space-y-4">
              {/* Candidate Camera */}
              <div>
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Namizəd
                </p>
                <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-video border-2 border-slate-700">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {!cameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <VideoOff className="w-10 h-10 text-slate-600" />
                    </div>
                  )}
                  {cameraOn && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-red-300">REC</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Interviewer */}
              <div>
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                  <BrainCircuit className="w-3 h-3" /> {persona.name} • AI Müsahibəçi
                </p>
                <div className="relative rounded-xl bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-2 border-purple-800/50 aspect-video flex flex-col items-center justify-center gap-2">
                  {aiSpeaking && <div className="absolute inset-0 bg-purple-600/10 animate-pulse rounded-xl" />}
                  <div className="relative">
                    {aiSpeaking && <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20" />}
                    <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 border-purple-400 transition-transform ${aiSpeaking ? "scale-110" : "scale-100"}`}>
                      <img src={getAvatarUrl(persona.seed)} className="w-full h-full object-cover bg-purple-900" />
                    </div>
                  </div>
                  <p className="text-purple-300 text-sm font-medium">
                    {aiSpeaking ? `${persona.name} danışır...` : `${persona.name}`}
                  </p>
                  {aiSpeaking && (
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-4 bg-purple-400 rounded-full"
                          style={{ animation: `pulse 0.6s ${i * 0.15}s infinite alternate` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Question + Answer */}
            <div className="md:col-span-3 space-y-4">
              {/* Question */}
              <Card className="bg-slate-900/90 border-purple-800/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Button size="sm" variant="ghost" onClick={() => speakText(q.question)} className="text-purple-300 hover:text-purple-200 h-7">
                      <Sparkles className="w-3 h-3 mr-1" /> {persona.name} səsləndirsin
                    </Button>
                  </div>
                  <CardTitle className="text-lg text-white leading-relaxed">{q.question}</CardTitle>
                </CardHeader>
              </Card>

              {/* Input mode toggle */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={inputMode === "voice" ? "default" : "outline"}
                  onClick={() => { setInputMode("voice"); speech.stop(); }}
                  className={inputMode === "voice" ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  <Mic className="w-3 h-3 mr-1" /> Səslə Cavab
                </Button>
                <Button
                  size="sm"
                  variant={inputMode === "text" ? "default" : "outline"}
                  onClick={() => { setInputMode("text"); speech.stop(); }}
                  className={inputMode === "text" ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  <MessageSquare className="w-3 h-3 mr-1" /> Yazılı Cavab
                </Button>
              </div>

              {/* Voice input */}
              {inputMode === "voice" ? (
                <Card className="bg-slate-900/90 border-slate-800">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-center">
                      <button
                        onClick={toggleListening}
                        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                          speech.isListening
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-purple-600 hover:bg-purple-700"
                        }`}
                      >
                        {speech.isListening && <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-30" />}
                        {speech.isListening ? <Square className="w-7 h-7 text-white" /> : <Mic className="w-8 h-8 text-white" />}
                      </button>
                    </div>
                    <p className="text-center text-sm text-slate-400">
                      {speech.isListening ? "🔴 Dinlənilir... Danışın" : "Mikrofonu açın və danışın"}
                    </p>

                    {/* Real-time transcript */}
                    <div className="bg-slate-800/50 rounded-lg p-3 min-h-[100px] border border-slate-700">
                      {currentAnswer ? (
                        <p className="text-sm text-slate-200">
                          {speech.transcript}
                          {speech.interimTranscript && <span className="text-slate-500 italic"> {speech.interimTranscript}</span>}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-600 text-center py-4">
                          {speech.isListening ? "Danışmağa başlayın..." : "Cavabınız burada görünəcək"}
                        </p>
                      )}
                    </div>

                    {speech.error && (
                      <div className="bg-red-950/50 border border-red-800 rounded-lg p-2">
                        <p className="text-xs text-red-300">{speech.error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-slate-900/90 border-slate-800">
                  <CardContent className="p-4">
                    <Textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Cavabınızı buraya yazın..."
                      rows={5}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                      autoFocus
                    />
                  </CardContent>
                </Card>
              )}

              {/* Submit */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{currentAnswer.length} simvol • {currentAnswer.trim().split(/\s+/).filter(Boolean).length} söz</span>
                <Button
                  onClick={submitAnswer}
                  disabled={submitting || currentAnswer.trim().length < 10}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      AI Qiymətləndirir...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Cavabı Göndər
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== FEEDBACK =====
  if (phase === "feedback" && feedback) {
    const qualityConfig: Record<string, { color: string; label: string }> = {
      excellent: { color: "text-green-400 border-green-600 bg-green-950/50", label: "Əla cavab! 🎉" },
      good: { color: "text-blue-400 border-blue-600 bg-blue-950/50", label: "Yaxşı cavab 👍" },
      satisfactory: { color: "text-yellow-400 border-yellow-600 bg-yellow-950/50", label: "Kafi cavab" },
      needs_improvement: { color: "text-orange-400 border-orange-600 bg-orange-950/50", label: "İnkişafa ehtiyac var" },
    };
    const q = qualityConfig[feedback.quality] || qualityConfig.satisfactory;
    const breakdown = feedback.breakdown || {};
    const breakdownItems = [
      { label: "Mövzu uyğunluğu", value: breakdown.relevance || 0, max: 35, icon: Target },
      { label: "Dərinlik və detal", value: breakdown.depth || 0, max: 25, icon: TrendingUp },
      { label: "Struktur və aydınlıq", value: breakdown.structure || 0, max: 15, icon: Sparkles },
      { label: "Ünsiyyət və inam", value: breakdown.communication || 0, max: 15, icon: MessageSquare },
      { label: "Vakansiyaya uyğunluq", value: breakdown.vacancy_fit || 0, max: 10, icon: BrainCircuit },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <Card className="bg-slate-900/90 border-slate-800">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${q.color.split(" ")[0]}`}>
                  <img src={getAvatarUrl(persona.seed)} className="w-full h-full object-cover bg-purple-900" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-purple-300 font-medium">{persona.name}</p>
                  <p className="text-xs text-slate-500">{persona.title}</p>
                </div>
              </div>
              <CardTitle className="text-2xl text-white">{q.label}</CardTitle>
              <div className="mt-2">
                <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {feedback.percentage}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Feedback text */}
              <div className={`rounded-lg p-4 border ${q.color}`}>
                <p className="text-sm">{feedback.feedback || "Cavabınız qiymətləndirildi."}</p>
              </div>

              {/* Detailed breakdown */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-blue-300">Detallı Qiymətləndirmə:</p>
                {breakdownItems.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <item.icon className="w-3 h-3" /> {item.label}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">{item.value}/{item.max}</span>
                    </div>
                    <Progress value={(item.value / item.max) * 100} className="h-1.5" />
                  </div>
                ))}
              </div>

              {/* Found keywords */}
              {feedback.found_keywords && feedback.found_keywords.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">Açar sözlər tapıldı:</p>
                  <div className="flex flex-wrap gap-1">
                    {feedback.found_keywords.map((kw: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-green-950/50 text-green-300 border-green-800">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center text-xs text-slate-500">
                {feedback.word_count || currentAnswer.split(/\s+/).length} söz
              </div>

              <Button
                onClick={nextQuestion}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-5 text-lg"
              >
                {currentQ + 1 < questions.length ? (
                  <><ArrowRight className="w-5 h-5 mr-2" /> Növbəti Sual</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5 mr-2" /> Müsahibəni Bitir</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== COMPLETE =====
  if (phase === "complete" && finalReport) {
    const score = finalReport.percentage;
    const colorClass = score >= 75 ? "text-green-400 border-green-600" : score >= 55 ? "text-yellow-400 border-yellow-600" : "text-orange-400 border-orange-600";
    const bgClass = score >= 75 ? "bg-green-950/50 border-green-800 text-green-300" : score >= 55 ? "bg-yellow-950/50 border-yellow-800 text-yellow-300" : "bg-orange-950/50 border-orange-800 text-orange-300";

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <Card className="bg-slate-900/90 border-slate-800">
            <CardHeader className="text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 mx-auto mb-4 ${colorClass}`}>
                <Award className="w-12 h-12" />
              </div>
              <CardTitle className="text-3xl text-white font-bold">Müsahibə Tamamlandı!</CardTitle>
              <p className="text-slate-400 mt-1">{finalReport.total_questions} sual cavablandı</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="text-center">
                <p className="text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  {score}%
                </p>
              </div>

              <div className={`text-center py-4 rounded-xl border ${bgClass}`}>
                <p className="text-xl font-bold">{finalReport.decision}</p>
                {finalReport.recommendation && <p className="text-sm mt-1 opacity-80">{finalReport.recommendation}</p>}
              </div>

              {/* Category scores */}
              {finalReport.category_scores && Object.keys(finalReport.category_scores).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-300">Kateqoriya üzrə nəticələr:</p>
                  {Object.entries(finalReport.category_scores).map(([cat, val]: [string, any]) => (
                    <div key={cat} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                      <span className="text-sm text-slate-300 capitalize">{cat}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={val} className="w-20 h-1.5" />
                        <span className="text-xs text-slate-400 w-10 text-right">{val}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Answer summary */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-300">Sual-Cavab Xülasəsi:</p>
                {finalReport.answers.map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                    <span className="text-sm text-slate-300 truncate flex-1">Sual {i + 1}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={a.percentage || 0} className="w-16 h-1.5" />
                      <span className="text-xs text-slate-400 w-10 text-right">{a.percentage || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate("/candidate/dashboard")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-5"
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
