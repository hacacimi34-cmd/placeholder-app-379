import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, Calendar, Clock, ArrowLeft, CheckCircle2, AlertCircle,
  Download, Mail, Phone, MapPin, Info, Play, BrainCircuit
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import db from "@/lib/shared/kliv-database.js";
import auth from "@/lib/shared/kliv-auth.js";
import { toast } from "sonner";
import functions from "@/lib/shared/kliv-functions.js";
import { useLanguage } from "@/contexts/LanguageContext";

const InterviewSchedule = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeParams = useParams();
  const { t } = useLanguage();
  
  // Support both route param (HR) and query param (candidate)
  const applicationId = routeParams.applicationId || searchParams.get('application_id') || "";
  const isHR = !!routeParams.applicationId;
  const [application, setApplication] = useState<any>(null);
  const [vacancy, setVacancy] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    duration: "60"
  });

  useEffect(() => {
    const loadInterviewData = async () => {
      if (!applicationId) return;

      try {
        setLoading(true);

        // Fetch application
        const appResult = await db.query("applications", {
          _row_id: `eq.${applicationId}`
        });

        if (appResult.length === 0) {
          toast.error(t('applicationNotFound') || 'Müraciət tapılmadı');
          navigate(isHR ? "/hr/dashboard" : "/candidate/dashboard");
          return;
        }

        setApplication(appResult[0]);

        // Fetch vacancy
        const vacancyResult = await db.query("vacancies", {
          _row_id: `eq.${appResult[0].vacancy_id}`
        });

        if (vacancyResult.length > 0) {
          setVacancy(vacancyResult[0]);
        }

        // Fetch candidate
        const candidateResult = await db.query("candidates", {
          _row_id: `eq.${appResult[0].candidate_id}`
        });

        if (candidateResult.length > 0) {
          setCandidate(candidateResult[0]);
        }

      } catch (error) {
        console.error("Error loading interview data:", error);
        toast.error("Məlumatlar yüklənərkən xəta baş verdi");
        navigate(isHR ? "/hr/dashboard" : "/candidate/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadInterviewData();
  }, [applicationId, navigate, t]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduling(true);

    try {
      const user = await auth.getUser();
      if (!user) {
        toast.error(t('loginRequired') || 'Giriş tələb olunur');
        setScheduling(false);
        return;
      }

      const timestamp = Math.floor(new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).getTime() / 1000);

      // Create meeting link (with fallback if edge function fails)
      let meetingLink = `https://meet.jit.si/hrpro-${applicationId}-${Date.now()}`;
      let meetingPassword = "";

      try {
        const meetingResult = await functions.post('video-conference', {
          action: "create_meeting",
          interview_id: applicationId,
          candidate_name: `${candidate.first_name} ${candidate.last_name}`,
          hr_name: "HR Team",
          scheduled_date: timestamp,
          scheduled_time: formData.scheduledTime,
          candidate_email: candidate.email
        });
        if (meetingResult.meeting_link) meetingLink = meetingResult.meeting_link;
        if (meetingResult.meeting_password) meetingPassword = meetingResult.meeting_password;
      } catch (err) {
        console.log("Video conference service unavailable, using fallback link");
      }

      // Create interview record in database
      const interviewData = {
        application_id: parseInt(applicationId as string),
        vacancy_id: application.vacancy_id,
        candidate_id: application.candidate_id,
        scheduled_date: timestamp,
        scheduled_time: formData.scheduledTime,
        duration: parseInt(formData.duration),
        interview_type: "video",
        status: "scheduled",
        meeting_link: meetingLink,
        meeting_password: meetingPassword,
        team_uuid: user.teamUuid
      };

      await db.insert("interviews", interviewData);

      // Update application status
      await db.update("applications", {
        _row_id: `eq.${applicationId}`
      }, {
        status: "scheduled"
      });

      // Try to send notifications (non-blocking)
      try {
        await functions.post('notification-service', {
          action: "interview_confirmation",
          candidate_email: candidate.email,
          candidate_name: `${candidate.first_name} ${candidate.last_name}`,
          vacancy_title: vacancy?.title || 'Position',
          interview_date: formData.scheduledDate,
          interview_time: formData.scheduledTime,
          location: "Video Meeting",
          meeting_link: meetingLink,
          company_name: "HR Pro"
        });
      } catch (err) {
        console.log("Notification service unavailable");
      }

      try {
        await functions.post('whatsapp-service', {
          action: "send_interview_invitation",
          candidate_phone: candidate.phone,
          candidate_name: `${candidate.first_name} ${candidate.last_name}`,
          vacancy_title: vacancy?.title || 'Position',
          interview_date: formData.scheduledDate,
          interview_time: formData.scheduledTime,
          location: "Video Meeting",
          company_name: "HR Pro"
        });
      } catch (err) {
        console.log("WhatsApp service unavailable");
      }

      setScheduled(true);
      toast.success(t('interviewScheduled') || 'Müsahibə uğurla təyin edildi!');

    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error(t('scheduleError') || 'Müsahibə təyin edilərkən xəta baş verdi');
      setScheduling(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

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

  if (scheduled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-slate-950 dark:via-green-950 dark:to-emerald-950 flex items-center justify-center">
        <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur max-w-md">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900 dark:text-white mb-2">
              {t('interviewScheduled') || 'Müsahibə Təyin Edildi!'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t('interviewScheduledDesc') || 'Müsahibə üçün dəvətnam göndərildi. Video konfrans linki sizin Email və WhatsApp-a göndəriləcək.'}
            </p>
            <Button
              onClick={() => navigate(isHR ? "/hr/dashboard" : "/candidate/dashboard")}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              {t('backToDashboard') || 'Dashboard-a qayıt'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate(isHR ? "/hr/dashboard" : "/candidate/dashboard")}
              className="text-blue-700 dark:text-slate-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back') || 'Geri'}
            </Button>
            <h1 className="text-xl font-bold text-blue-900 dark:text-white">
              {t('scheduleInterview') || 'Müsahibə Təyin Et'}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Interview Info Card */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" />
                {t('interviewInfo') || 'Müsahibə Məlumatları'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {t('candidate') || 'Namizəd:'}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {candidate?.first_name?.[0]}{candidate?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-white">
                        {candidate?.first_name} {candidate?.last_name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {candidate?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {t('vacancy') || 'Vakansiya:'}
                  </p>
                  <p className="font-medium text-blue-900 dark:text-white">
                    {vacancy?.title}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {vacancy?.department} • {vacancy?.location}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm text-blue-700 dark:text-slate-300 mb-3">
                  <Info className="w-4 h-4 inline mr-1" />
                  {t('interviewMode') || 'Müsahibə Modu:'}
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-slate-300">
                  <Video className="w-4 h-4 text-purple-600" />
                  {t('videoCall') || 'Video zəng'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Interview Questions Card */}
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-900 dark:text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-600" />
                {t('aiPowered') || 'AI ilə Video Müsahibə'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-blue-700 dark:text-slate-300 mb-4">
                {t('aiQuestionsDesc') || 'AI vakansiya üçün xüsusi suallar yaradacaq və müsahibə zamanı sizin performansın qiymətləndirəcək.'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-24">
                  <Info className="w-4 h-4 mr-2" />
                  {t('howItWorks') || 'Necə işləyir?'}
                </Button>
                <Button variant="outline" className="h-24">
                  <Download className="w-4 h-4 mr-2" />
                  {t('sampleQuestions') || 'Nümunə suallar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling Form */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-900 dark:text-white">
                {t('scheduleTime') || 'Vaxt Təyin Et'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSchedule} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">{t('date') || 'Tarix'}</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      min={tomorrow.toISOString().split('T')[0]}
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">{t('time') || 'Vaxt'}</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">{t('duration') || 'Müddət (dəqiqə)'}</Label>
                  <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select') || 'Seçin'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 dəqiqə</SelectItem>
                      <SelectItem value="45">45 dəqiqə</SelectItem>
                      <SelectItem value="60">60 dəqikə</SelectItem>
                      <SelectItem value="90">90 dəqikə</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md"
                    disabled={scheduling}
                  >
                    {scheduling ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                        {t('scheduling') || 'Təyin edilir...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {t('confirmSchedule') || 'Təsdiq et'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="border-slate-200 dark:border-slate-800 bg-blue-50 dark:bg-slate-800/50 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700 dark:text-slate-300">
                    <strong>{t('tips') || 'Məsləhəmə hazırlaşın haqqında məlumat:'}</strong>
                  <br />
                    {t('tipsContent') || 'Stabil internet, qəbul etmək üçün öz hazırlaşın. Sualarınızı öncədən yazın və ya sözlüklən CV-nizi daxil edin.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewSchedule;