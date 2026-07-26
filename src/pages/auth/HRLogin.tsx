import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Briefcase, Lock, Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import auth from "@/lib/shared/kliv-auth.js";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const HRLogin = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await auth.signIn(formData.email, formData.password);
      
      // Check if user has hr_managers role
      const hasHR = await auth.hasGroup("hr_managers");
      if (hasHR) {
        toast.success(t('welcomeHR') || "Xoş gəldiniz! HR panelinə yönləndirilirsiniz...");
        navigate("/hr/dashboard");
      } else {
        toast.error(t('noHRPermission') || "HR menecer icazəsi yoxdur. Zəhmət olmasa adminlə əlaqə saxlayın.");
        await auth.signOut();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message?.includes("bad_credentials")) {
        setError(t('invalidCredentials') || "E-poçt və ya şifrə yanlışdır");
      } else if (err.message?.includes("account_locked")) {
        setError(t('accountLocked') || "Hesab bloklanıb. Zəhmət olmasa adminlə əlaqə saxlayın.");
      } else {
        setError(t('loginError') || "Giriş zamanı xəta baş verdi. Yenidən cəhd edin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('back') || 'Geri'}
        </Button>

        <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-blue-900 dark:text-white">
              {t('hrPortalLogin') || 'HR Portal Girişi'}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('hrPortalDesc') || 'İnsan resursları panelinə daxil olun'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-blue-900 dark:text-white">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-700 dark:text-slate-300 font-medium">{t('email') || 'E-poçt ünvanı'}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="hr@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-700 dark:text-slate-300 font-medium">{t('password') || 'Şifrə'}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md"
                disabled={loading}
              >
                {loading ? (t('loggingIn') || "Giriş edilir...") : (t('login') || "Daxil ol")}
              </Button>

              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm"
                  onClick={() => navigate("/auth/forgot-password")}
                >
                  {t('forgotPassword') || 'Şifrəmi unuttum'}
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-slate-800/50 rounded-lg text-left">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  🔑 Demo HR Girişi:
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  E-poçt: <span className="font-mono font-medium">yegoxif905@aganseo.com</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Şifrə: <span className="font-mono font-medium">HrPro2026!</span>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setFormData({ email: "yegoxif905@aganseo.com", password: "HrPro2026!" })}
              >
                Demo məlumatları doldur
              </Button>
              <p className="text-sm text-blue-700 dark:text-slate-300">
                {t('notHRManager') || 'HR menecer deyilsiniz?'}
              </p>
              <Button
                variant="link"
                className="w-full"
                onClick={() => navigate("/auth/candidate-register")}
              >
                {t('registerCandidate') || 'Namizəd kimi qeydiyyatdan keçin'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HRLogin;
