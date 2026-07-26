import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, Video, BrainCircuit, Sparkles, TrendingUp, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelectorSimple } from "@/components/LanguageSelectorSimple";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleGetStarted = (type: "hr" | "candidate") => {
    if (type === "hr") {
      navigate("/auth/hr-login");
    } else {
      navigate("/auth/candidate-register");
    }
  };

  const features = [
    {
      icon: BrainCircuit,
      title: t('aiMatching') || "AI-powered Candidate Matching",
      description: t('aiMatchingDesc') || "Advanced AI analyzes candidates and matches them with perfect vacancies"
    },
    {
      icon: Video,
      title: t('videoInterview') || "Video Interview Platform",
      description: t('videoInterviewDesc') || "Built-in video conferencing for seamless remote interviews"
    },
    {
      icon: Users,
      title: t('smartCandidate') || "Smart Candidate Management",
      description: t('smartCandidateDesc') || "Track, score, and manage candidates throughout the hiring process"
    },
    {
      icon: TrendingUp,
      title: t('analyticsDashboard') || "Analytics Dashboard",
      description: t('analyticsDashboardDesc') || "Comprehensive insights on your hiring process and candidate pipeline"
    }
  ];

  const stats = [
    { value: "85%", label: t('fasterHiring') || "Faster Hiring" },
    { value: "92%", label: t('betterMatches') || "Better Matches" },
    { value: "4.8/5", label: t('userRating') || "User Rating" },
    { value: "10K+", label: t('activeUsers') || "Active Users" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {t('appName') || 'HR Pro'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelectorSimple />
              <Button
                variant="ghost"
                onClick={() => handleGetStarted("hr")}
                className="text-blue-700 dark:text-blue-300 font-medium"
              >
                {t('hrPortal') || 'HR Portal'}
              </Button>
              <Button
                onClick={() => handleGetStarted("candidate")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('apply') || 'Apply Now'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800 px-4 py-2">
              <Globe className="w-3 h-3 mr-1" />
              {t('appTagline') || 'Premium HR Platform'}
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-blue-900 dark:text-white mb-6 leading-tight">
              {t('smartHiring') || 'Smart Hiring,'}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> {t('betterResults') || 'Better Results'}</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              {t('heroDescription') || 'Advanced AI-powered recruitment platform with video interviews, smart candidate matching, and comprehensive hiring management for modern businesses.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => handleGetStarted("hr")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-6 font-semibold shadow-xl"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                {t('forHRManagers') || 'For HR Managers'}
              </Button>
              <Button
                size="lg"
                onClick={() => handleGetStarted("candidate")}
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold"
              >
                <Users className="w-5 h-5 mr-2" />
                {t('forCandidates') || 'For Candidates'}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">{stat.value}</div>
                <div className="text-base font-medium text-slate-600 dark:text-slate-300">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {features.map((feature, index) => (
              <Card key={index} className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4 shadow-md">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-blue-800 dark:text-blue-200">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How It Works */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-blue-900 dark:text-white mb-12">
              {t('howItWorks') || 'How It Works'}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: 1, title: t('createVacancy') || "Create Vacancy", description: t('createVacancyDesc') || "Post your job with detailed requirements and AI skills" },
                { step: 2, title: t('aiMatches') || "AI Matches", description: t('aiMatchesDesc') || "Our AI finds and scores the best candidates automatically" },
                { step: 3, title: t('interviewHire') || "Interview & Hire", description: t('interviewHireDesc') || "Conduct video interviews and make the perfect hire" }
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full text-white text-2xl font-bold mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            © 2026 HR Pro - {t('appTagline') || 'Premium HR & İşə Qəbul Platforması'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
