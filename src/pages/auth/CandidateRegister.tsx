import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Lock, Phone, MapPin, Linkedin, Globe, ArrowLeft, Eye, EyeOff, Upload } from "lucide-react";
import auth from "@/lib/shared/kliv-auth.js";
import db from "@/lib/shared/kliv-database.js";
import { toast } from "sonner";
import { content } from "@/lib/shared/kliv-content.js";

const CandidateRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    // Account Info
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    
    // Personal Info
    phone: "",
    city: "",
    country: "",
    linkedinUrl: "",
    portfolioUrl: "",
    bio: "",
    
    // Professional Info
    yearsExperience: "",
    expectedSalaryMin: "",
    expectedSalaryMax: "",
    skills: "",
    
    // Preferences
    preferredDepartment: "",
    preferredLocation: "",
    employmentType: ""
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      toast.error("Yalnız PDF və Word faylları qəbul olunur");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fayl ölçüsü 5MB-dan böyük ola bilməz");
      return;
    }

    setCvFile(file);
    toast.success("CV faylı seçildi: " + file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Create user account
      const user = await auth.signUp(
        formData.email,
        formData.password,
        `${formData.firstName} ${formData.lastName}`
      );

      // Step 2: Upload CV if provided
      let cvPath = null;
      if (cvFile) {
        try {
          const result = await content.uploadFile(cvFile, "/content/uploads/cvs/");
          cvPath = result.path;
        } catch (uploadError) {
          console.error("CV upload error:", uploadError);
          toast.error("CV yüklənmədi, lakin hesab yaradıldı");
        }
      }

      // Step 3: Create candidate profile
      const candidateData = {
        user_uuid: user.userUuid,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || null,
        city: formData.city || null,
        country: formData.country || null,
        linkedin_url: formData.linkedinUrl || null,
        portfolio_url: formData.portfolioUrl || null,
        years_experience: parseInt(formData.yearsExperience) || 0,
        expected_salary_min: parseInt(formData.expectedSalaryMin) || null,
        expected_salary_max: parseInt(formData.expectedSalaryMax) || null,
        skills: JSON.stringify(formData.skills.split(",").map(s => s.trim()).filter(s => s)),
        bio: formData.bio || null,
        cv_path: cvPath,
        job_preferences: JSON.stringify({
          preferred_department: formData.preferredDepartment,
          preferred_location: formData.preferredLocation,
          employment_type: formData.employmentType
        }),
        is_active: true
      };

      await db.insert("candidates", candidateData);

      toast.success("Qeydiyyat uğurla tamamlandı! Profilinizə yönləndirilirsiniz...");
      
      setTimeout(() => {
        navigate("/candidate/dashboard");
      }, 1500);

    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.message?.includes("email_exists")) {
        setError("Bu e-poçt ünvanı artıq qeydiyyatdan keçib");
      } else if (err.message?.includes("insufficient_password_complexity")) {
        setError("Şifrə ən az 8 simvol olmalıdır");
      } else {
        setError("Qeydiyyat zamanı xəta baş verdi. Yenidən cəhd edin.");
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.email || !formData.password || !formData.firstName || !formData.lastName)) {
      toast.error("Zəhmət olmasa bütün məcburi xanaları doldurun");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri qayıt
        </Button>

        <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Namizəd Qeydiyyatı</CardTitle>
            <CardDescription>
              Karyeranız üçün profil yaradın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Progress indicator */}
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      s <= step ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              {/* Step 1: Account Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Ad *</Label>
                      <Input
                        id="firstName"
                        placeholder="Əli"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Soyad *</Label>
                      <Input
                        id="lastName"
                        placeholder="Əliyev"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-poçt *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="ali@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Şifrə *</Label>
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="button" onClick={nextStep} className="w-full">
                    Davam et
                  </Button>
                </div>
              )}

              {/* Step 2: Professional Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="phone"
                          placeholder="+994 50 123 45 67"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Şəhər</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="city"
                          placeholder="Bakı"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Ölkə</Label>
                    <Input
                      id="country"
                      placeholder="Azərbaycan"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="linkedinUrl"
                        placeholder="linkedin.com/in/username"
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolioUrl">Portfel / Sayt</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="portfolioUrl"
                        placeholder="www.example.com"
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearsExperience">Təcrübə (il)</Label>
                      <Input
                        id="yearsExperience"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.yearsExperience}
                        onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentType">İş növü</Label>
                      <Select value={formData.employmentType} onValueChange={(value) => setFormData({ ...formData, employmentType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Tam zaman</SelectItem>
                          <SelectItem value="part-time">Yarım zaman</SelectItem>
                          <SelectItem value="contract">Müqavilə</SelectItem>
                          <SelectItem value="remote">Uzaqdan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expectedSalaryMin">Min maaş (AZN)</Label>
                      <Input
                        id="expectedSalaryMin"
                        type="number"
                        placeholder="1000"
                        value={formData.expectedSalaryMin}
                        onChange={(e) => setFormData({ ...formData, expectedSalaryMin: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expectedSalaryMax">Max maaş (AZN)</Label>
                      <Input
                        id="expectedSalaryMax"
                        type="number"
                        placeholder="3000"
                        value={formData.expectedSalaryMax}
                        onChange={(e) => setFormData({ ...formData, expectedSalaryMax: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                      Geri
                    </Button>
                    <Button type="button" onClick={nextStep} className="flex-1">
                      Davam et
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Skills & CV */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="skills">Bacarıqlar (vergül ilə ayrın)</Label>
                    <Input
                      id="skills"
                      placeholder="JavaScript, React, Node.js, Python"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredDepartment">Ümid etdiyi şöbə</Label>
                    <Input
                      id="preferredDepartment"
                      placeholder="IT, Marketinq, Satış"
                      value={formData.preferredDepartment}
                      onChange={(e) => setFormData({ ...formData, preferredDepartment: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredLocation">Ümid etdiyi yer</Label>
                    <Input
                      id="preferredLocation"
                      placeholder="Bakı, Remote"
                      value={formData.preferredLocation}
                      onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Qısa bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Özünüz haqqında qısa məlumat..."
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cv">CV (PDF və ya Word)</Label>
                    <div className="relative">
                      <Input
                        id="cv"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="cv" className="cursor-pointer">
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {cvFile ? cvFile.name : "CV-nizi yükləyin (PDF, Word, max 5MB)"}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                      Geri
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "Qeydiyyat edilir..." : "Qeydiyyatdan keç"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidateRegister;
