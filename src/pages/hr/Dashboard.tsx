import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, Users, Video, TrendingUp, Plus, Search, 
  Calendar, CheckCircle, XCircle, AlertCircle, Star,
  MapPin, Eye, Edit, Trash2, Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import db from "@/lib/shared/kliv-database.js";
import auth from "@/lib/shared/kliv-auth.js";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("vacancies");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Check if user is authenticated and has HR role
  useEffect(() => {
    const checkAuth = async () => {
      const user = await auth.getUser();
      if (!user || !auth.hasGroup("hr_managers")) {
        toast.error("HR menecer icazəsi tələb olunur");
        navigate("/auth/hr-login");
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch vacancies
  const { data: vacancies = [], isLoading: vacanciesLoading } = useQuery({
    queryKey: ["vacancies"],
    queryFn: async () => {
      const result = await db.query("vacancies", {
        order: "_created_at.desc"
      });
      return result;
    }
  });

  // Fetch candidates with applications
  const { data: candidates = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      const result = await db.query("candidates", {
        is_active: "eq.true",
        order: "_created_at.desc"
      });
      return result;
    }
  });

  // Fetch applications with AI scores
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const result = await db.query("applications", {
        order: "ai_score.desc, applied_date.desc"
      });
      return result;
    }
  });

  // Fetch upcoming interviews
  const { data: interviews = [], isLoading: interviewsLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: async () => {
      const now = Math.floor(Date.now() / 1000);
      const result = await db.query("interviews", {
        scheduled_date: `gte.${now}`,
        status: "eq.scheduled",
        order: "scheduled_date.asc"
      });
      return result;
    }
  });

  // Stats calculations
  const stats = [
    {
      title: "Aktiv Vakansiyalar",
      value: vacancies.filter(v => v.status === "active").length,
      icon: Briefcase,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Ümumi Namizədlər",
      value: candidates.length,
      icon: Users,
      color: "from-green-500 to-green-600"
    },
    {
      title: "AI Yüksək Ballı",
      value: applications.filter(a => a.ai_score >= 80).length,
      icon: Star,
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: "Təyin Edilmiş Müsahibələr",
      value: interviews.length,
      icon: Video,
      color: "from-purple-500 to-purple-600"
    }
  ];

  const filteredVacancies = vacancies.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredApplications = applications.filter(a => {
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    return matchesStatus;
  });

  const handleCreateVacancy = () => {
    navigate("/hr/vacancies/create");
  };

  const handleViewCandidate = (candidateId: number) => {
    navigate(`/hr/candidates/${candidateId}`);
  };

  const handleScheduleInterview = (applicationId: number) => {
    navigate(`/hr/interviews/schedule/${applicationId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "shortlisted": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "hired": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "under_review": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "closed": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Aktiv";
      case "pending": return "Gözləmədə";
      case "shortlisted": return "Qısa siyahı";
      case "rejected": return "Rədd edilib";
      case "hired": return "Qəbul edilib";
      case "under_review": return "Baxışda";
      case "closed": return "Bağlı";
      default: return status;
    }
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900 dark:text-white">HR Dashboard</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">İnsan Resursları Paneli</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="vacancies">Vakansiyalar</TabsTrigger>
              <TabsTrigger value="candidates">Namizədlər</TabsTrigger>
              <TabsTrigger value="applications">Müraciətlər</TabsTrigger>
              <TabsTrigger value="interviews">Müsahibələr</TabsTrigger>
            </TabsList>

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
              {activeTab === "vacancies" && (
                <Button onClick={handleCreateVacancy} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Vakansiya
                </Button>
              )}
            </div>
          </div>

          {/* Vacancies Tab */}
          <TabsContent value="vacancies" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="closed">Bağlı</SelectItem>
                  <SelectItem value="draft">Qaralama</SelectItem>
                </SelectContent>
              </Select>
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
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Vakansiya tapılmadı</p>
                  <Button onClick={handleCreateVacancy} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Plus className="w-4 h-4 mr-2" />
                    İlk Vakansiyanı Yarat
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredVacancies.map((vacancy) => (
                  <Card key={vacancy._row_id} className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-white">{vacancy.title}</h3>
                            <Badge className={getStatusColor(vacancy.status)}>
                              {getStatusLabel(vacancy.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {vacancy.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400">
                        {vacancy.department && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {vacancy.department}
                          </span>
                        )}
                        {vacancy.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {vacancy.location}
                          </span>
                        )}
                        {vacancy.employment_type && (
                          <Badge variant="outline">{vacancy.employment_type}</Badge>
                        )}
                        {vacancy.salary_min && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {vacancy.salary_min} - {vacancy.salary_max} AZN
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-4">
            {candidatesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Yüklənir...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400">Namizəd tapılmadı</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredCandidates.map((candidate) => (
                  <Card key={candidate._row_id} className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer" onClick={() => handleViewCandidate(candidate._row_id)}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-900 dark:text-white">
                              {candidate.first_name} {candidate.last_name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{candidate.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {candidate.years_experience} il təcrübə
                          </div>
                          {candidate.expected_salary_min && (
                            <div className="text-sm font-medium text-blue-900 dark:text-white">
                              {candidate.expected_salary_min} - {candidate.expected_salary_max} AZN
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün</SelectItem>
                  <SelectItem value="pending">Gözləmədə</SelectItem>
                  <SelectItem value="under_review">Baxışda</SelectItem>
                  <SelectItem value="shortlisted">Qısa siyahı</SelectItem>
                  <SelectItem value="rejected">Rədd edilib</SelectItem>
                  <SelectItem value="hired">Qəbul edilib</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {applicationsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Yüklənir...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400">Müraciət tapılmadı</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredApplications.map((application) => (
                  <Card key={application._row_id} className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-blue-900 dark:text-white">Müraciət #{application._row_id}</h3>
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusLabel(application.status)}
                            </Badge>
                            {application.ai_score && (
                              <Badge variant="outline" className={`flex items-center gap-1 ${getAIScoreColor(application.ai_score)}`}>
                                <Star className="w-3 h-3" />
                                AI: {application.ai_score}%
                              </Badge>
                            )}
                          </div>
                          {application.ai_feedback && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              <strong>AI rəyi:</strong> {application.ai_feedback}
                            </p>
                          )}
                          {application.cover_letter && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                              {application.cover_letter}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {application.status === "pending" || application.status === "under_review" ? (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleScheduleInterview(application._row_id)}>
                                <Video className="w-4 h-4 mr-1" />
                                Müsahibə
                              </Button>
                              <Button size="sm" variant="outline">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {new Date(application.applied_date * 1000).toLocaleDateString('az-AZ')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews" className="space-y-4">
            {interviewsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Yüklənir...</p>
              </div>
            ) : interviews.length === 0 ? (
              <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
                <CardContent className="py-12 text-center">
                  <Video className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Təyin edilmiş müsahibə yoxdur</p>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Müsahibə Təyin Et
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {interviews.map((interview) => (
                  <Card key={interview._row_id} className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-blue-900 dark:text-white">
                              {new Date(interview.scheduled_date * 1000).toLocaleDateString('az-AZ')} - {interview.scheduled_time}
                            </h3>
                            <Badge className={getStatusColor(interview.status)}>
                              {getStatusLabel(interview.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Müddət: {interview.duration} dəqiqə
                          </p>
                          {interview.meeting_link && (
                            <a 
                              href={interview.meeting_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2"
                            >
                              <Video className="w-4 h-4" />
                              Video konfrans linki
                            </a>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-1" />
                          Redaktə et
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
