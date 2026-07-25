export type Language = 'az' | 'en' | 'ru';

export interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  // App & Navigation
  appName: {
    az: 'HR Pro',
    en: 'HR Pro',
    ru: 'HR Pro'
  },
  appTagline: {
    az: 'Premium HR & İşə Qəbul Platforması',
    en: 'Premium HR & Recruitment Platform',
    ru: 'Премиальная HR-платформа'
  },
  hrPortal: {
    az: 'HR Portalı',
    en: 'HR Portal',
    ru: 'HR Портал'
  },
  candidatePortal: {
    az: 'Namizəd Paneli',
    en: 'Candidate Portal',
    ru: 'Панель кандидата'
  },
  
  // Hero & Features
  smartHiring: {
    az: 'Ağıllı İşə Qəbul,',
    en: 'Smart Hiring,',
    ru: 'Умный найм,'
  },
  betterResults: {
    az: 'Daha Yaxşı Nəticələr',
    en: 'Better Results',
    ru: 'Лучшие результаты'
  },
  heroDescription: {
    az: 'Video müsahibələr, ağıllı namizəd uyğunluğu və müasir şirkətlər üçün ətraflı işə qəbul idarəetməsi ilə AI ilə gücləndirilmiş qabaqcıl platforma.',
    en: 'Advanced AI-powered recruitment platform with video interviews, smart candidate matching, and comprehensive hiring management for modern businesses.',
    ru: 'Продвинутая платформа рекрутинга на базе ИИ с видеособеседованиями, умным подбором кандидатов и комплексным управлением наймом для современных компаний.'
  },
  forHRManagers: {
    az: 'HR Menecerlər Üçün',
    en: 'For HR Managers',
    ru: 'Для HR-менеджеров'
  },
  forCandidates: {
    az: 'Namizədlər Üçün',
    en: 'For Candidates',
    ru: 'Для кандидатов'
  },
  aiMatching: {
    az: 'AI-namizəd uyğunluğu',
    en: 'AI-powered Candidate Matching',
    ru: 'AI-подбор кандидатов'
  },
  aiMatchingDesc: {
    az: 'Qabaqcıl AI namizədləri analiz edir və mükəmməl vakansiyalarla uyğunlaşdırır',
    en: 'Advanced AI analyzes candidates and matches them with perfect vacancies',
    ru: 'Продвинутый ИИ анализирует кандидатов и подбирает идеальные вакансии'
  },
  videoInterview: {
    az: 'Video Müsahibə Platforması',
    en: 'Video Interview Platform',
    ru: 'Платформа видеособеседований'
  },
  videoInterviewDesc: {
    az: 'Səlis uzaqdan müsahibələr üçün qurulmuş video konfrans',
    en: 'Built-in video conferencing for seamless remote interviews',
    ru: 'Встроенная видеоконференция для бесшовных удаленных собеседований'
  },
  smartCandidate: {
    az: 'Ağıllı Namizəd İdarəçiliyi',
    en: 'Smart Candidate Management',
    ru: 'Умное управление кандидатами'
  },
  smartCandidateDesc: {
    az: 'İşə qəbul prosesi boyu namizədləri izləyin, qiymətləndirin və idarə edin',
    en: 'Track, score, and manage candidates throughout the hiring process',
    ru: 'Отслеживайте, оценивайте и управляйте кандидатами на протяжении всего процесса найма'
  },
  analyticsDashboard: {
    az: 'Analitika Paneli',
    en: 'Analytics Dashboard',
    ru: 'Панель аналитики'
  },
  analyticsDashboardDesc: {
    az: 'İşə qəbul prosesi və namizəd boru haqqında ətraflı məlumatlar',
    en: 'Comprehensive insights on your hiring process and candidate pipeline',
    ru: 'Комплексная информация о вашем процессе найма и воронке кандидатов'
  },
  howItWorks: {
    az: 'Bu Necə İşləyir',
    en: 'How It Works',
    ru: 'Как это работает'
  },
  createVacancy: {
    az: 'Vakansiya Yarat',
    en: 'Create Vacancy',
    ru: 'Создать вакансию'
  },
  createVacancyDesc: {
    az: 'Ətraflı tələblər və AI bacarıqları ilə işinizi dərc edin',
    en: 'Post your job with detailed requirements and AI skills',
    ru: 'Опубликуйте вакансию с детальными требованиями и навыками ИИ'
  },
  aiMatches: {
    az: 'AI Uyğunluqları',
    en: 'AI Matches',
    ru: 'AI совпадения'
  },
  aiMatchesDesc: {
    az: 'Bizim AI ən yaxşı namizədləri avtomatik tapır və qiymətləndirir',
    en: 'Our AI finds and scores the best candidates automatically',
    ru: 'Наш ИИ автоматически находит и оценивает лучших кандидатов'
  },
  interviewHire: {
    az: 'Müsahibə & İşə Al',
    en: 'Interview & Hire',
    ru: 'Собеседование и найм'
  },
  interviewHireDesc: {
    az: 'Video müsahibələr aparın və mükəmməl işə qəbul edin',
    en: 'Conduct video interviews and make the perfect hire',
    ru: 'Проводите видеособеседования и сделайте идеальный наем'
  },
  
  // Navigation
  home: {
    az: 'Ana Səhifə',
    en: 'Home',
    ru: 'Главная'
  },
  vacancies: {
    az: 'Vakansiyalar',
    en: 'Vacancies',
    ru: 'Вакансии'
  },
  candidates: {
    az: 'Namizədlər',
    en: 'Candidates',
    ru: 'Кандидаты'
  },
  applications: {
    az: 'Müraciətlər',
    en: 'Applications',
    ru: 'Заявки'
  },
  interviews: {
    az: 'Müsahibələr',
    en: 'Interviews',
    ru: 'Собеседования'
  },
  
  // Buttons
  apply: {
    az: 'Müraciət Et',
    en: 'Apply',
    ru: 'Подать заявку'
  },
  login: {
    az: 'Daxil Ol',
    en: 'Login',
    ru: 'Войти'
  },
  logout: {
    az: 'Çıxış',
    en: 'Logout',
    ru: 'Выйти'
  },
  register: {
    az: 'Qeydiyyat',
    en: 'Register',
    ru: 'Регистрация'
  },
  create: {
    az: 'Yarat',
    en: 'Create',
    ru: 'Создать'
  },
  save: {
    az: 'Yadda Saxla',
    en: 'Save',
    ru: 'Сохранить'
  },
  cancel: {
    az: 'Ləğv Et',
    en: 'Cancel',
    ru: 'Отмена'
  },
  edit: {
    az: 'Redaktə Et',
    en: 'Edit',
    ru: 'Редактировать'
  },
  delete: {
    az: 'Sil',
    en: 'Delete',
    ru: 'Удалить'
  },
  view: {
    az: 'Bax',
    en: 'View',
    ru: 'Просмотр'
  },
  search: {
    az: 'Axtarış...',
    en: 'Search...',
    ru: 'Поиск...'
  },
  filter: {
    az: 'Filtr',
    en: 'Filter',
    ru: 'Фильтр'
  },
  
  // Status
  active: {
    az: 'Aktiv',
    en: 'Active',
    ru: 'Активный'
  },
  pending: {
    az: 'Gözləmədə',
    en: 'Pending',
    ru: 'Ожидает'
  },
  underReview: {
    az: 'Baxışda',
    en: 'Under Review',
    ru: 'На рассмотрении'
  },
  shortlisted: {
    az: 'Qısa Siyahı',
    en: 'Shortlisted',
    ru: 'В списке'
  },
  rejected: {
    az: 'Rədd Edilib',
    en: 'Rejected',
    ru: 'Отклонено'
  },
  hired: {
    az: 'Qəbul Edilib',
    en: 'Hired',
    ru: 'Принят'
  },
  scheduled: {
    az: 'Təyin Edilib',
    en: 'Scheduled',
    ru: 'Назначен'
  },
  completed: {
    az: 'Bitirilib',
    en: 'Completed',
    ru: 'Завершен'
  },
  closed: {
    az: 'Bağlı',
    en: 'Closed',
    ru: 'Закрыт'
  },
  draft: {
    az: 'Qaralama',
    en: 'Draft',
    ru: 'Черновик'
  },
  all: {
    az: 'Bütün',
    en: 'All',
    ru: 'Все'
  },
  
  // Auth
  email: {
    az: 'E-poçt',
    en: 'Email',
    ru: 'Email'
  },
  password: {
    az: 'Şifrə',
    en: 'Password',
    ru: 'Пароль'
  },
  firstName: {
    az: 'Ad',
    en: 'First Name',
    ru: 'Имя'
  },
  lastName: {
    az: 'Soyad',
    en: 'Last Name',
    ru: 'Фамилия'
  },
  phone: {
    az: 'Telefon',
    en: 'Phone',
    ru: 'Телефон'
  },
  city: {
    az: 'Şəhər',
    en: 'City',
    ru: 'Город'
  },
  country: {
    az: 'Ölkə',
    en: 'Country',
    ru: 'Страна'
  },
  experience: {
    az: 'Təcrübə',
    en: 'Experience',
    ru: 'Опыт'
  },
  skills: {
    az: 'Bacarıqlar',
    en: 'Skills',
    ru: 'Навыки'
  },
  education: {
    az: 'Təhsil',
    en: 'Education',
    ru: 'Образование'
  },
  bio: {
    az: 'Qısa Bio',
    en: 'Short Bio',
    ru: 'Краткая био'
  },
  
  // HR Dashboard
  hrDashboard: {
    az: 'HR Paneli',
    en: 'HR Dashboard',
    ru: 'HR Панель'
  },
  totalVacancies: {
    az: 'Ümumi Vakansiyalar',
    en: 'Total Vacancies',
    ru: 'Всего вакансий'
  },
  totalCandidates: {
    az: 'Ümumi Namizədlər',
    en: 'Total Candidates',
    ru: 'Всего кандидатов'
  },
  aiHighScores: {
    az: 'AI Yüksək Ballı',
    en: 'AI High Scores',
    ru: 'AI Высокие баллы'
  },
  upcomingInterviews: {
    az: 'Gələn Müsahibələr',
    en: 'Upcoming Interviews',
    ru: 'Предстоящие собеседования'
  },
  newVacancy: {
    az: 'Yeni Vakansiya',
    en: 'New Vacancy',
    ru: 'Новая вакансия'
  },
  interview: {
    az: 'Müsahibə',
    en: 'Interview',
    ru: 'Собеседование'
  },
  scheduleInterview: {
    az: 'Müsahibə Təyin Et',
    en: 'Schedule Interview',
    ru: 'Назначить собеседование'
  },
  
  // Candidate Dashboard
  candidateDashboard: {
    az: 'Namizəd Paneli',
    en: 'Candidate Dashboard',
    ru: 'Панель кандидата'
  },
  myApplications: {
    az: 'Müraciətlərim',
    en: 'My Applications',
    ru: 'Мои заявки'
  },
  myInterviews: {
    az: 'Müsahibələrim',
    en: 'My Interviews',
    ru: 'Мои собеседования'
  },
  aiScore: {
    az: 'AI Balı',
    en: 'AI Score',
    ru: 'AI Балл'
  },
  aiFeedback: {
    az: 'AI Rəyi',
    en: 'AI Feedback',
    ru: 'AI Отзыв'
  },
  
  // Vacancy
  vacancyTitle: {
    az: 'Vakansiya Adı',
    en: 'Vacancy Title',
    ru: 'Название вакансии'
  },
  vacancyDescription: {
    az: 'Vakansiya Təsviri',
    en: 'Vacancy Description',
    ru: 'Описание вакансии'
  },
  requirements: {
    az: 'Tələblər',
    en: 'Requirements',
    ru: 'Требования'
  },
  department: {
    az: 'Şöbə',
    en: 'Department',
    ru: 'Отдел'
  },
  location: {
    az: 'Mövqe',
    en: 'Location',
    ru: 'Местоположение'
  },
  employmentType: {
    az: 'İş Növü',
    en: 'Employment Type',
    ru: 'Тип занятости'
  },
  salary: {
    az: 'Maaş',
    en: 'Salary',
    ru: 'Зарплата'
  },
  salaryRange: {
    az: 'Maaş Aralığı',
    en: 'Salary Range',
    ru: 'Диапазон зарплаты'
  },
  fullTime: {
    az: 'Tam Zaman',
    en: 'Full Time',
    ru: 'Полный день'
  },
  partTime: {
    az: 'Yarım Zaman',
    en: 'Part Time',
    ru: 'Частичная занятость'
  },
  contract: {
    az: 'Müqavilə',
    en: 'Contract',
    ru: 'Контракт'
  },
  remote: {
    az: 'Uzaqdan',
    en: 'Remote',
    ru: 'Удаленно'
  },
  it: {
    az: 'IT',
    en: 'IT',
    ru: 'IT'
  },
  marketing: {
    az: 'Marketinq',
    en: 'Marketing',
    ru: 'Маркетинг'
  },
  sales: {
    az: 'Satış',
    en: 'Sales',
    ru: 'Продажи'
  },
  baku: {
    az: 'Bakı',
    en: 'Baku',
    ru: 'Баку'
  },
  
  // Messages & States
  noVacanciesFound: {
    az: 'Vakansiya Tapılmadı',
    en: 'No Vacancies Found',
    ru: 'Вакансии не найдены'
  },
  noCandidatesFound: {
    az: 'Namizəd Tapılmadı',
    en: 'No Candidates Found',
    ru: 'Кандидаты не найдены'
  },
  noApplicationsFound: {
    az: 'Müraciət Tapılmadı',
    en: 'No Applications Found',
    ru: 'Заявки не найдены'
  },
  loading: {
    az: 'Yüklənir...',
    en: 'Loading...',
    ru: 'Загрузка...'
  },
  createdSuccessfully: {
    az: 'Uğurla Yaradıldı',
    en: 'Created Successfully',
    ru: 'Успешно создано'
  },
  updatedSuccessfully: {
    az: 'Uğurla Yeniləndi',
    en: 'Updated Successfully',
    ru: 'Успешно обновлено'
  },
  deletedSuccessfully: {
    az: 'Uğurla Silindi',
    en: 'Deleted Successfully',
    ru: 'Успешно удалено'
  },
  applicationSent: {
    az: 'Müraciət Göndərildi',
    en: 'Application Sent',
    ru: 'Заявка отправлена'
  },
  interviewScheduled: {
    az: 'Müsahibə Təyin Edildi',
    en: 'Interview Scheduled',
    ru: 'Собеседование назначено'
  },
  joinVideoCall: {
    az: 'Video Zəngə Qoşul',
    en: 'Join Video Call',
    ru: 'Присоединиться к видеозвонку'
  },
  
  // Stats & Labels
  fasterHiring: {
    az: 'Sürətli İşə Qəbul',
    en: 'Faster Hiring',
    ru: 'Быстрый наем'
  },
  betterMatches: {
    az: 'Daha Yaxşı Uyğunluq',
    en: 'Better Matches',
    ru: 'Лучшие совпадения'
  },
  userRating: {
    az: 'İstifadəçi Reytinqi',
    en: 'User Rating',
    ru: 'Рейтинг пользователей'
  },
  activeUsers: {
    az: 'Aktiv İstifadəçilər',
    en: 'Active Users',
    ru: 'Активные пользователи'
  },
  yearsExperience: {
    az: 'İl Təcrübə',
    en: 'Years Experience',
    ru: 'Лет опыта'
  },
  expectedSalary: {
    az: 'Gözlənilən Maaş',
    en: 'Expected Salary',
    ru: 'Ожидаемая зарплата'
  },
  min: {
    az: 'Min',
    en: 'Min',
    ru: 'Мин'
  },
  max: {
    az: 'Max',
    en: 'Max',
    ru: 'Макс'
  },
  
  // Additional labels
  back: {
    az: 'Geri',
    en: 'Back',
    ru: 'Назад'
  },
  submit: {
    az: 'Göndər',
    en: 'Submit',
    ru: 'Отправить'
  },
  continue: {
    az: 'Davam Et',
    en: 'Continue',
    ru: 'Продолжить'
  },
  next: {
    az: 'Növbəti',
    en: 'Next',
    ru: 'Следующий'
  },
  previous: {
    az: 'Əvvəlki',
    en: 'Previous',
    ru: 'Предыдущий'
  },
  details: {
    az: 'Təfərruatlar',
    en: 'Details',
    ru: 'Детали'
  },
  required: {
    az: 'Tələb Olunur',
    en: 'Required',
    ru: 'Обязательно'
  },
  optional: {
    az: 'İstəyə Bağlı',
    en: 'Optional',
    ru: 'Опционально'
  },
  select: {
    az: 'Seçin',
    en: 'Select',
    ru: 'Выбрать'
  },
  uploadCV: {
    az: 'CV Yükləyin',
    en: 'Upload CV',
    ru: 'Загрузить CV'
  },
  chooseFile: {
    az: 'Fayl Seçin',
    en: 'Choose File',
    ru: 'Выбрать файл'
  },
  maxFileSize: {
    az: 'Max fayl ölçüsü',
    en: 'Max file size',
    ru: 'Макс. размер файла'
  },
  supportedFormats: {
    az: 'Dəstəklənən formatlar',
    en: 'Supported formats',
    ru: 'Поддерживаемые форматы'
  },
  uploadYourCV: {
    az: 'CV-nizi yükləyin',
    en: 'Upload your CV',
    ru: 'Загрузите ваше CV'
  },
  uploadDescription: {
    az: 'PDF və ya Word formatında (max 5MB)',
    en: 'PDF or Word format (max 5MB)',
    ru: 'PDF или Word формат (макс 5MB)'
  }
};

export const getTranslation = (key: string, lang: Language): string => {
  return translations[key]?.[lang] || key;
};

export const useTranslation = (lang: Language) => {
  const t = (key: string): string => getTranslation(key, lang);
  return { t };
};
