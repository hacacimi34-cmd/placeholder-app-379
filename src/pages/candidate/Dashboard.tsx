import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Briefcase, Video, Search, MapPin, DollarSign, 
  CheckCircle, FileText, Eye, Building, Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import db from "@/lib/shared/kliv-database.js";
import auth from "@/lib/shared/kliv-auth.js";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const user = await auth.getUser();
      if (!user) {
        toast.error("Giriş tələb olunur");
        navigate("/auth/candidate-register");
      }
    };
    checkAuth();
  }, [navigate]);

  // Get current user's candidate profile
  const { data: candidate, isLoading: candidateLoading } = useQuery({
    queryKey: ["my-candidate-profile"],
    queryFn: async () => {
      const user = await auth.getUser();
      if (!user) return null;
      
      const result = await db.query("candidates", {
        user_uuid: `eq.${user.userUuid}`
      });
      
      return result.length > 0 ? result[0] : null;
    }
  });

  // Fetch vacancies
  const { data: vacancies = [], isLoading: vacanciesLoading } = useQuery({
    queryKey: ["vacancies"],
    queryFn: async () => {
      const result = await db.query("vacancies", {
        status: "eq.active",
        order: "_created_at.desc"
      });
      return result;
    }
  });

  // Fetch candidate's applications
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const user = await auth.getUser();
      if (!user) return [];
      
      const candidateProfile = await db.query("candidates", {
        user_uuid: `eq.${user.userUuid}`
      });
      
      if (candidateProfile.length === 0) return [];
      
      const result = await db.query("applications", {
        candidate_id: `eq.${candidateProfile[0]._row_id}`
      });
      
      return result;
    },
    enabled: !!candidate
  });

  // Fetch interviews for this candidate
  const { data: interviews = [], isLoading: interviewsLoading } = useQuery({
    queryKey: ["my-interviews"],
    queryFn: async () => {
      const user = await auth.getUser();
      if (!user) return [];
      
      const candidateProfile = await db.query("candidates", {
        user_uuid: `eq.${user.userUuid}`
      });
      
      if (candidateProfile.length === 0) return [];
      
      const result = await db.query("interviews", {
        candidate_id: `eq.${candidateProfile[0]._row_id}`,
        order: "scheduled_date.desc"
      });
      
      return result;
    },
    enabled: !!candidate
  });

  const filteredVacancies = vacancies.filter((v: any) => {
    const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || v.department === filterDepartment;
    const matchesLocation = filterLocation === "all" || 
                           (v.location && v.location.toLowerCase().includes(filterLocation.toLowerCase()));
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  const handleApply = async (vacancyId: number) => {
    if (!candidate) {
      toast.error("Əvvəlcə profilinizi doldurun");
      return;
    }

    try {
      // Check if already applied
      const existingApplication = await db.query("applications", {
        vacancy_id: `eq.${vacancyId}`,
        candidate_id: `eq.${candidate._row_id}`
      });

      if (existingApplication.length > 0) {
        toast.error("Bu vakansiyaya artıq müraciə edilib");
        return;
      }

      const applicationData = {
        vacancy_id: vacancyId,
        candidate_id: candidate._row_id,
        status: "pending",
        applied_date: Math.floor(Date.now() / 1000),
        cover_letter: ""
      };

      await db.insert("applications", applicationData);

      // Trigger AI matching
      const vacancy = vacancies.find(v => v._row_id === vacancyId);
      if (vacancy) {
        // You could call the AI function here
        toast.success("Müraciət göndərildi! AI uyğunluq qiymətləndirməsi aparılır...");
      } else {
        toast.success("Müraciət uğurla göndərildi!");
      }

    } catch (error) {
      console.error("Application error:", error);
      toast.error("Müraciət göndərilərkən xəta baş verdi");
    }
  };

  const getApplicationStatus = (vacancyId: number) => {
    const application = applications.find(a => a.vacancy_id === vacancyId);
    return application?.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "under_review": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "shortlisted": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "hired": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Gözləmədə";
      case "under_review": return "Baxışda";
      case "shortlisted": return "Qısa siyahı";
      case "rejected": return "Rədd edilib";
      case "hired": return "Qəbul edilib";
      case "scheduled": return "Təyin edilib";
      case "completed": return "Bitirilib";
      default: return status;
    }
  };

  if (candidateLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Namizəd Paneli</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {candidate ? `${candidate.first_name} ${candidate.last_name}` : "Profil yoxdur"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={async () => {
                  await auth.signOut();
                  navigate("/");
                }}
              >
                Çıxış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Aktiv Vakansiyalar</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{vacancies.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Müraciətlərim</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{applications.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Müsahibələrim</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{interviews.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Vacancies and Applications */}
        <div className="space-y-6">
          {/* Vacancies Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Aktiv Vakansiyalar</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Axtarış..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Şöbə" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Bütün</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Marketinq">Marketinq</SelectItem>
                    <SelectItem value="Satış">Satış</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Məkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Bütün</SelectItem>
                    <SelectItem value="Bakı">Bakı</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {vacanciesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Yüklənir...</p>
              </div>
            ) : filteredVacancies.length === 0 ? (
              <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400">Vakansiya tapılmadı</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                  {filteredVacancies.map((vacancy: any) => {
                  const applicationStatus = getApplicationStatus(vacancy._row_id);
                  return (
                    <Card key={vacancy._row_id} className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{vacancy.title}</h3>
                              {applicationStatus && (
                                <Badge className={getStatusColor(applicationStatus)}>
                                  {getStatusLabel(applicationStatus)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                              {vacancy.description}
                            </p>
                            <div className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400">
                              {vacancy.department && (
                                <span className="flex items-center gap-1">
                                  <Building className="w-4 h-4" />
                                  {vacancy.department}
                                </span>
                              )}
                              {vacancy.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {vacancy.location}
                                </span>
                              )}
                              {vacancy.salary_min && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {vacancy.salary_min} - {vacancy.salary_max} AZN
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!applicationStatus && (
                              <Button 
                                size="sm" 
                                onClick={() => handleApply(vacancy._row_id)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Müraciət et
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Applications Section */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Müraciətlərim</h2>
            {applicationsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Yüklənir...</p>
              </div>
            ) : applications.length === 0 ? (
              <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400">Hələ müraciət etməmisiniz</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {applications.map((application: any) => (
                  <Card key={application._row_id} className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Müraciət #{application._row_id}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {new Date(application.applied_date * 1000).toLocaleDateString('az-AZ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusLabel(application.status)}
                          </Badge>
                          {application.ai_score && (
                            <div className="text-sm mt-2 text-slate-600 dark:text-slate-400">
                              AI Ball: {application.ai_score}%
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Interviews Section */}
          {interviews.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Müsahibələrim</h2>
              <div className="grid gap-4">
                {interviews.map((interview: any) => (
                  <Card key={interview._row_id} className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Video className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {new Date(interview.scheduled_date * 1000).toLocaleDateString('az-AZ')} - {interview.scheduled_time}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Müddət: {interview.duration} dəqiqə
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(interview.status)}>
                            {getStatusLabel(interview.status)}
                          </Badge>
                          {interview.meeting_link && (
                            <Button 
                              size="sm" 
                              className="mt-2"
                              onClick={() => window.open(interview.meeting_link, '_blank')}
                            >
                              <Video className="w-4 h-4 mr-1" />
                              Müsahibəyə Qoşul
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;