import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Clock, CheckCircle2, XCircle, TrendingUp, BrainCircuit,
  Video, Download, FileText, AlertCircle, ArrowLeft, Star
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import db from "@/lib/shared/kliv-database.js";
import auth from "@/lib/shared/kliv-auth.js";
import { toast } from "sonner";
import functions from "@/lib/shared/kliv-functions.js";
import { useLanguage } from "@/contexts/LanguageContext";

const ApplicationDetail = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [application, setApplication] = useState<any>(null);
  const [cvAnalysis, setCvAnalysis] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // Parse application ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setApplicationId(parseInt(id));
    }
  }, []);

  // Fetch application details
  useEffect(() => {
    if (!applicationId) return;

    const fetchApplicationDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch application
        const appResult = await db.query("applications", {
          _row_id: `eq.${applicationId}`
        });

        if (appResult.length === 0) {
          toast.error(t('applicationNotFound') || 'Müraciət tapılmadı');
          navigate("/candidate/dashboard");
          return;
        }

        setApplication(appResult[0]);

        // Fetch candidate profile
        const candidateResult = await db.query("candidates", {
          _row_id: `eq.${appResult[0].candidate_id}`
        });

        if (candidateResult.length > 0 && candidateResult[0].cv_path) {
          // Analyze CV with AI
          setAnalyzing(true);
          try {
            const cvAnalysisResult = await functions.post('ai-cv-analyzer', {
              action: "analyze_cv",
              candidate_id: appResult[0].candidate_id,
              vacancy_id: appResult[0].vacancy_id,
              cv_text: "CV content would be extracted here" // In real implementation, parse the CV file
            });
            setCvAnalysis(cvAnalysisResult);
          } catch (error) {
            console.error("CV analysis error:", error);
          } finally {
            setAnalyzing(false);
          }
        }

        // Fetch interview if exists
        const interviewResult = await db.query("interviews", {
          application_id: `eq.${applicationId}`
        });

        if (interviewResult.length > 0) {
          setInterview(interviewResult[0]);
        }

      } catch (error) {
        console.error("Error fetching application details:", error);
        toast.error("Məlumatlar yüklənərkən xəta baş verdi");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [applicationId, navigate, t]);

  const handleScheduleInterview = async () => {
    if (!application) return;

    try {
      // Navigate to interview scheduling page
      navigate(`/candidate/interview/schedule?application_id=${applicationId}`);
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error("Müsahibə təyin edilərkən xəta baş verdi");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "under_review": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "shortlisted": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "hired": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "scheduled": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Aktiv";
      case "pending": return "Gözləmədə";
      case "under_review": return "Baxışda";
      case "shortlisted": return "Qısa Siyahı";
      case "rejected": return "Rədd Edilib";
      case "hirmed": return "Qəbul Edilib";
      case "hired": return "Qəbul Edilib";
      case "scheduled": return "Təyin Edilib";
      case "completed": return "Bitirilib";
      default: return status;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{t('loading') || 'Yüklənir...'}</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('applicationNotFound') || 'Müraciət tapılmadı'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate("/candidate/dashboard")}
              className="text-slate-700 dark:text-slate-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back') || 'Geri'}
            </Button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('applicationDetails') || 'Müraciət Təfərruatları'}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Application Status Card */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                  {t('applicationStatus') || 'Müraciət Statusu'}
                </CardTitle>
                <Badge className={getStatusColor(application.status)}>
                  {getStatusLabel(application.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>{t('appliedOn') || 'Müraciət tarixi:'}:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {new Date(application.applied_date * 1000).toLocaleDateString('az-AZ')}
                </span>
              </div>
              
              {application.ai_score && (
                <div className="flex items-center gap-2 text-sm">
                  <BrainCircuit className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600 dark:text-slate-400">{t('aiScore') || 'AI Balı:'}</span>
                  <span className={`text-2xl font-bold ${getScoreColor(application.ai_score)}`}>
                    {application.ai_score}%
                  </span>
                </div>
              )}

              {application.ai_feedback && (
                <div className="p-4 bg-blue-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong className="text-blue-800 dark:text-blue-200">{t('aiFeedback') || 'AI Rəyi:'}</strong>
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    {application.ai_feedback}
                  </p>
                </div>
              )}

              {application.cover_letter && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>{t('coverLetter') || 'Əriz Məktub:'}</strong>
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 line-clamp-3">
                    {application.cover_letter}
                  </p>
                </div>
              )}

              {application.status === "shortlisted" && !interview && (
                <Button
                  onClick={handleScheduleInterview}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Video className="w-4 h-4 mr-2" />
                  {t('scheduleInterview') || 'Müsahibə Təyin Et'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* AI CV Analysis Card */}
          {analyzing ? (
            <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <BrainCircuit className="w-12 h-12 text-blue-600 animate-pulse" />
                  <div>
                    <p className="text-lg font-medium text-slate-900 dark:text-white">
                      {t('analyzingCV') || 'CV-nizi AI təhlil edilir...'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('pleaseWait') || 'Zəhmət olmasa gözləyin...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : cvAnalysis ? (
            <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-blue-600" />
                  {t('aiCVAnalysis') || 'AI CV Təhlili'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('overallScore') || 'Ümumi Bal:'}</p>
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      {cvAnalysis.score}%
                    </div>
                  </div>
                  <Badge className={cvAnalysis.score >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : cvAnalysis.score >= 60 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}>
                    {cvAnalysis.score >= 80 ? "Əla Uyğun" : cvAnalysis.score >= 60 ? "Yaxşı Uyğun" : "Zəif Uyğun"}
                  </Badge>
                </div>

                {cvAnalysis.strengths && cvAnalysis.strengths.length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      {t('strengths') || 'Güclü Tərəflər:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cvAnalysis.strengths.map((strength: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {cvAnalysis.weaknesses && cvAnalysis.weaknesses.length > 0 && (
                  <div className="p-4 bg-yellow-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                      {t('areasToImprove') || 'İnkişafat Tələb Olunan Sahələr:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cvAnalysis.weaknesses.map((weakness: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs border-yellow-300 dark:border-yellow-700">
                          {weakness}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {cvAnalysis.recommendations && cvAnalysis.recommendations.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      {t('recommendations') || 'Tövsiyyələr:'}
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {cvAnalysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-slate-700 dark:text-slate-300 ml-4">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {cvAnalysis.analysis && (
                  <div className="text-sm text-slate-700 dark:text-slate-300 italic">
                    {cvAnalysis.analysis}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  {t('noCVAnalysis') || 'CV təhlili hələ olunmayıb'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Interview Card */}
          {interview && (
            <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  {t('interviewDetails') || 'Müsahibə Məlumatları'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {t('date') || 'Tarix:'}
                    </p>
                    <p className="text-base font-medium text-slate-900 dark:text-white">
                      {new Date(interview.scheduled_date * 1000).toLocaleDateString('az-AZ')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {t('time') || 'Vaxt:'}
                    </p>
                    <p className="text-base font-medium text-slate-900 dark:text-white">
                      {interview.scheduled_time}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    {t('duration') || 'Müddət:'}
                  </p>
                  <p className="text-base font-medium text-slate-900 dark:text-white">
                    {interview.duration} dəqiqə
                  </p>
                </div>

                {interview.meeting_link && (
                  <div className="p-4 bg-purple-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      {t('meetingLink') || 'Video konfrans linki:'}
                    </p>
                    <a 
                      href={interview.meeting_link}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {interview.meeting_link}
                    </a>
                  </div>
                )}

                {interview.meeting_password && (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('meetingPassword') || 'Konfrans şifrəsi:'}
                    </p>
                    <code className="text-base font-mono">{interview.meeting_password}</code>
                  </div>
                )}

                {interview.interviewer_notes && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('interviewerNotes') || 'HR Qeydləri:'}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                      {interview.interviewer_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Integration Info Card */}
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                {t('aiIntegration') || 'AI İnteqrasiyası'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {t('automaticScoring') || 'Avtomatik Qiymətləndirmə'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('automaticScoringDesc') || 'Siz müraciət etdikdə dərhal AI balı veririk.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-sanalyze900 dark:text-white">
                    {t('cvAnalysis') || 'CV Təhlili'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('cvAnalysisDesc') || 'CV-nizi oxuyur və vakansiya tələblərinə uyğunluğunuzu analiz edir.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Video className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {t('interviewQuestions') || 'AI Sualları'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('interviewQuestionsDesc') || 'Vakansiyaya uyğun suallar AI tərəfində edilir.'}
                  </p>
                </div>
              </div>

              {application.status === "shortlisted" && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {t('interviewInvitation') || 'Video Müsahibə Dəvəti'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('interviewInvitationDesc') || 'Video konfrans linki təklif edilir və dəvətnam göndərilir.'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps Card */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                {t('nextSteps') || 'Növbə Addımlar'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.status === "pending" && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{t('waitingReview') || 'Müraciətiniz HR tərəfində baxılır...'}</span>
                </div>
              )}

              {application.status === "under_review" && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t('aiAnalyzing') || 'AI sistemi CV-nizi analiz edir...'}</span>
                </div>
              )}

              {application.status === "shortlisted" && !interview && (
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('readyForInterview') || 'Siz müsahibə üçün seçildiniz!'}</span>
                </div>
              )}

              {application.status === "scheduled" && interview && (
                <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                  <Video className="w-4 h-4" />
                  <span>{t('interviewReady') || 'Müsahibə təyin edilmişdir!'}</span>
                </div>
              )}

              {application.status === "completed" && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{t('waitingResult') || 'Nəticə gözlənilir...'}</span>
                </div>
              )}

              {application.status === "hired" && (
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('congratulations') || 'Təbrik edir, siz qəbul edildiniz!'}</span>
                </div>
              )}

              {application.status === "rejected" && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <XCircle className="w-4 h-4" />
                  <span>{t('notSelected') || 'Bu dəfər üçün seçilməmisiniz.'}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;