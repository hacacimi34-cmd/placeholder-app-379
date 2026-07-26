import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Briefcase, ArrowLeft } from "lucide-react";

export const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="text-center px-4">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-7xl font-bold text-blue-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">Səhifə tapılmadı</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana səhifəyə qayıt
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
