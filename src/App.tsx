import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import HRLogin from "./pages/auth/HRLogin";
import CandidateRegister from "./pages/auth/CandidateRegister";
import Dashboard from "./pages/hr/Dashboard";
import CreateVacancy from "./pages/hr/CreateVacancy";
import CandidateDashboard from "./pages/candidate/Dashboard";
import ApplicationDetail from "./pages/candidate/ApplicationDetail";
import InterviewSchedule from "./pages/candidate/InterviewSchedule";
import InterviewRoom from "./pages/candidate/InterviewRoom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/hr-login" element={<HRLogin />} />
            <Route path="/auth/candidate-register" element={<CandidateRegister />} />
            <Route path="/hr/dashboard" element={<Dashboard />} />
            <Route path="/hr/vacancies/create" element={<CreateVacancy />} />
            <Route path="/hr/interviews/schedule/:applicationId" element={<InterviewSchedule />} />
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate/application" element={<ApplicationDetail />} />
            <Route path="/candidate/interview/schedule" element={<InterviewSchedule />} />
            <Route path="/interview/:interviewId" element={<InterviewRoom />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
