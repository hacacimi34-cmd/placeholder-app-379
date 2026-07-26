import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const languages = [
  { code: 'az' as const, name: 'AZ', flag: '🇦🇿' },
  { code: 'en' as const, name: 'EN', flag: '🇬🇧' },
  { code: 'ru' as const, name: 'RU', flag: '🇷🇺' }
];

export const LanguageSelectorSimple = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage(lang.code)}
          className={`min-w-[60px] gap-1 ${language === lang.code ? "" : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300"}`}
        >
          <span>{lang.flag}</span>
          <span className="text-xs font-semibold">{lang.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default LanguageSelectorSimple;
