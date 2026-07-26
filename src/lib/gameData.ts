// ============================================================
//  MÜBARİZ İBRAHİMOV — MİLLİ QƏHRƏMAN
//  Oyun datası: Missiyalar, Səhnələr və Seçimlər
//  Bu oyun Milli Qəhrəmanımızın xatirəsinə hörmətlə hazırlanmışdır.
// ============================================================

export interface GameChoice {
  text: string;
  nextScene: string;
  correct?: boolean;
  feedback?: string;
  courage?: number; // Şücaət xalı mükafatı
}

export interface GameScene {
  id: string;
  chapterId: number;
  image: string;
  location?: string;
  date?: string;
  speaker?: string;
  text: string;
  choices?: GameChoice[];
  isChapterEnd?: boolean;
  isGameEnd?: boolean;
  chapterTitle?: string;
}

export interface GameChapter {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  icon: string;
  startScene: string;
  badgeImage: string;
  accent: string; // tailwind color hint
}

// --- Şəkillər ---
const IMG = {
  villageDawn:
    "https://images.pexels.com/photos/18536593/pexels-photo-18536593.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  classroom:
    "https://images.pexels.com/photos/8423043/pexels-photo-8423043.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  soldierSilhouette:
    "https://images.pexels.com/photos/876344/pexels-photo-876344.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  soldiersTraining:
    "https://images.pexels.com/photos/876343/pexels-photo-876343.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  soldiersCamouflage:
    "https://images.pexels.com/photos/10854147/pexels-photo-10854147.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  combatBoots:
    "https://images.pexels.com/photos/7468216/pexels-photo-7468216.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  mountainFog:
    "https://images.pexels.com/photos/15146773/pexels-photo-15146773.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  mountainMist:
    "https://images.pexels.com/photos/30186406/pexels-photo-30186406.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  soldierFlag:
    "https://images.pexels.com/photos/34061739/pexels-photo-34061739.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  candles:
    "https://images.pexels.com/photos/29190192/pexels-photo-29190192.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  candlesWarm:
    "https://images.pexels.com/photos/29190201/pexels-photo-29190201.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  azFlag:
    "https://images.pexels.com/photos/33168056/pexels-photo-33168056.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  azFlagDark:
    "https://images.pexels.com/photos/34673587/pexels-photo-34673587.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

// ============================================================
//  MISSİYALAR
// ============================================================

export const chapters: GameChapter[] = [
  {
    id: 1,
    slug: "usagliq",
    title: "Uşaqlıq",
    subtitle: "Əliabad Kəndi",
    description:
      "Biləsuvarın kiçik kəndində dünyaya gələn Mübarizin ilk illəri və qəhrəmanlığın toxumları.",
    date: "7 fevral 1988",
    icon: "Baby",
    startScene: "1_1",
    badgeImage: IMG.villageDawn,
    accent: "emerald",
  },
  {
    id: 2,
    slug: "mekteb-illeri",
    title: "Məktəb İlləri",
    subtitle: "Təhsil və Hazırlıq",
    description:
      "Əliabad kənd məktəbində təhsil, fiziki hazırlıq və gələcək qəhrəmanın formalaşması.",
    date: "1994 – 2005",
    icon: "GraduationCap",
    startScene: "2_1",
    badgeImage: IMG.classroom,
    accent: "sky",
  },
  {
    id: 3,
    slug: "ilk-xidmet",
    title: "İlk Hərbi Xidmət",
    subtitle: "Əsgərlik Təlimləri",
    description:
      "Hərbi çağırış, sərt təlimlər və Xidməti Çavuş rütbəsinə qədər yüksəliş.",
    date: "2005 – 2007",
    icon: "Shield",
    startScene: "3_1",
    badgeImage: IMG.soldiersTraining,
    accent: "amber",
  },
  {
    id: 4,
    slug: "donus",
    title: "Orduya Qayıdış",
    subtitle: "Könüllü Cəbhəyə",
    description:
      "Mülki həyatı tərk edib könüllü olaraq cəbhəyə — vətən sevgisinin gücü ilə.",
    date: "2009",
    icon: "Swords",
    startScene: "4_1",
    badgeImage: IMG.combatBoots,
    accent: "orange",
  },
  {
    id: 5,
    slug: "son-doyus",
    title: "Son Döyüş",
    subtitle: "Cəbhə Xətti",
    description:
      "18–19 iyun 2010. Cəbhədə göstərilən misilsiz qəhrəmanlıq və əbədi şəhidlik.",
    date: "18–19 iyun 2010",
    icon: "Flame",
    startScene: "5_1",
    badgeImage: IMG.mountainFog,
    accent: "red",
  },
  {
    id: 6,
    slug: "milli-qehreman",
    title: "Milli Qəhrəman",
    subtitle: "Əbədi Xatirə",
    description:
      "22 iyun 2010. Azərbaycanın Milli Qəhrəmanı adı və əbədiyyətə qovuşan igidlik.",
    date: "22 iyun 2010",
    icon: "Award",
    startScene: "6_1",
    badgeImage: IMG.azFlag,
    accent: "yellow",
  },
];

// ============================================================
//  SƏHNƏLƏR
// ============================================================

export const scenes: Record<string, GameScene> = {
  // ═══════════════════════════════════════════════════════
  //  MISSİYA 1 — USAĞLIQ
  // ═══════════════════════════════════════════════════════
  "1_1": {
    id: "1_1",
    chapterId: 1,
    image: IMG.villageDawn,
    location: "Biləsuvar rayonu, Əliabad kəndi",
    date: "7 fevral 1988",
    text: "Qışın ortası. Biləsuvar rayonunun mehriban Əliabad kəndində yeni bir həyat başlayır. İbrahimov ailəsində oğlan uşaq dünyaya gəlir. Ona «Mübariz» adını qoyurlar — yəni «mübarizə aparan», «vuruşan». Elə həmin gün taleyindəki böyük missiyanın ilk səhifəsi açılır...",
    choices: [
      {
        text: "Səhər işığına doğru irəlilə...",
        nextScene: "1_2",
      },
    ],
  },
  "1_2": {
    id: "1_2",
    chapterId: 1,
    image: IMG.villageDawn,
    location: "Əliabad kəndi",
    date: "Uşaqlıq illəri",
    text: "Mübariz kəndin təmiz havasında, geniş tarlalar arasında böyüyür. O, həmyaşıdlarından fərqlənir: həmişə bir addım irli, həmişə cəsarətli. Kəndin uşaqları onun ətrafında toplaşır, çünki Mübariz hər kəsi qoruyan, hər kəsə qayğı göstərən uşaqdır.",
    speaker: "Kənd sakinlərinin xatirələrindən",
    choices: [
      {
        text: "Mübarizin xarakterini yaxından tanı...",
        nextScene: "1_3",
      },
    ],
  },
  "1_3": {
    id: "1_3",
    chapterId: 1,
    image: IMG.villageDawn,
    location: "Əliabad kəndi",
    date: "Uşaqlıq illəri",
    text: "Kiçik yaşlarından Mübarizdə ədalət hissi və qorxmazlıq görünür. Zəifləri müdafiə edir, haqsızlığa susmaz. Ailəsinə bağlı, anasına hörmətli, atasına itaətli bir övlad kəndin darıxdırıcı günlərini mənalı keçirir. O, hələ uşaq ikən belə, bir gün böyük iş görəcəyinə inanır.",
    choices: [
      {
        text: "Hekayəni davam etdir...",
        nextScene: "1_end",
      },
    ],
  },
  "1_end": {
    id: "1_end",
    chapterId: 1,
    image: IMG.villageDawn,
    location: "Əliabad kəndi",
    isChapterEnd: true,
    chapterTitle: "Uşaqlıq missiyası tamamlandı",
    text: "Vaxt tez keçir. Mübariz artıq məktəb yaşına çatır. Əliabad kənd məktəbinin qapıları onun qarşısında açılır. Bilik və hazırlıq yolculuğu başlayır...",
    choices: [
      {
        text: "Missiya 2: Məktəb İlləri",
        nextScene: "2_1",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  //  MISSİYA 2 — MƏKTƏB İLLƏRİ
  // ═══════════════════════════════════════════════════════
  "2_1": {
    id: "2_1",
    chapterId: 2,
    image: IMG.classroom,
    location: "Əliabad Kənd Məktəbi",
    date: "1994",
    text: "6 yaşlı Mübariz məktəbə gedir. Kənd məktəbində ilk zəngi çalır, ilk dərsini dinləyir. Dərslərində diqqətli, dostlarına sadiq bir şagird kimi tanınır. Lakin onu yalnız kitablar maraqlandırmır — fiziki güc və idman da onun həyatının ayrılmaz hissəsidir.",
    choices: [
      {
        text: "Fiziki hazırlığını gör...",
        nextScene: "2_2",
      },
    ],
  },
  "2_2": {
    id: "2_2",
    chapterId: 2,
    image: IMG.classroom,
    location: "Əliabad Kənd Məktəbi",
    date: "Məktəb illəri",
    speaker: "Seçim vaxtı",
    text: "Mübariz özünü fiziki cəhətdən hazırlamaq istəyir. Sən hansı yolu seçərdin?",
    choices: [
      {
        text: "💪 Güc və güləş təlimi",
        nextScene: "2_3",
        correct: true,
        feedback: "Mübariz də məhz güc və mərdlik yolunu seçdi. Bu, onun gələcək döyüş hazırlığının əsasını qoydu.",
        courage: 10,
      },
      {
        text: "📚 Yalnız dərs oxumaq",
        nextScene: "2_3",
        feedback: "Bilik vacibdir, lakin Mübariz həm zehni, həm də fiziki cəhətdən güclü olmağı seçdi.",
        courage: 5,
      },
      {
        text: "🏃 İdman və qaçış təlimi",
        nextScene: "2_3",
        correct: true,
        feedback: "Sürət və dözümlülük — əsgər üçün həyati bacarıqlardır. Mübariz hər ikisinə sahib idi.",
        courage: 8,
      },
    ],
  },
  "2_3": {
    id: "2_3",
    chapterId: 2,
    image: IMG.classroom,
    location: "Əliabad Kənd Məktəbi",
    date: "1994 – 2005",
    text: "İllər keçdikcə Mübariz kənd məktəbində tanınmış şagirdə çevrilir. O, sadəcə fiziki cəhətdən güclü deyil — vətənə sevgi, ədalət və məsuliyyət hissi də onun xarakterini təşkil edir. Müəllimləri onun gələcəyində böyük işlər görəcəyinə inanırlar.",
    speaker: "Məktəb müəllimlərinin xatirələrindən",
    choices: [
      {
        text: "Məktəb illərinin sonuna yaxınlaş...",
        nextScene: "2_end",
      },
    ],
  },
  "2_end": {
    id: "2_end",
    chapterId: 2,
    image: IMG.classroom,
    location: "Əliabad Kənd Məktəbi",
    date: "2005",
    isChapterEnd: true,
    chapterTitle: "Məktəb missiyası tamamlandı",
    text: "2005-ci il. Mübariz məktəbi bitirir. Artıq o, gənc, güclü və vətənpərvər bir oğlandır. Vətənə xidmət vaxtı gəlib çatıb...",
    choices: [
      {
        text: "Missiya 3: İlk Hərbi Xidmət",
        nextScene: "3_1",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  //  MISSİYA 3 — İLK HƏRBİ XİDMƏT
  // ═══════════════════════════════════════════════════════
  "3_1": {
    id: "3_1",
    chapterId: 3,
    image: IMG.soldiersTraining,
    location: "Hərbi Hisse",
    date: "2005",
    text: "2005-ci il. Mübariz hərbi çağırışla Azərbaycan Ordusuna qoşulur. Hərbi hissənin qapıları ona açılanda, o artıq hazırdır. Sərt hərbi intizam, gündəlik təlimlər və fizioloji sınaqlar onu gözləyir.",
    choices: [
      {
        text: "Əsgərlik təlimlərinə qatıl...",
        nextScene: "3_2",
      },
    ],
  },
  "3_2": {
    id: "3_2",
    chapterId: 3,
    image: IMG.soldiersTraining,
    location: "Təlim meydançası",
    date: "Hərbi xidmət illəri",
    speaker: "Seçim vaxtı",
    text: "Sərt hərbi təlim zamanı komandir sənə müraciət edir: «Əsgər! Çətin təlim şəraitində nə etmək lazımdır?» Sənin cavabın?",
    choices: [
      {
        text: "🛡️ «Heç vaxt təslim olmayacağam, komandirim!»",
        nextScene: "3_3",
        correct: true,
        feedback: "Mübarizin də tam belə bir münasibəti vardı. O, çətinlikləri dəf etməyi, heç vaxt pesimist olmamağı seçdi.",
        courage: 15,
      },
      {
        text: "😴 «Yoruldum, fasilə istəyirəm»",
        nextScene: "3_3",
        feedback: "Həqiqi əsgər yorğunluğu dəf edə bilməlidir. Mübariz heç vaxt geri çəkilmədi.",
        courage: 3,
      },
    ],
  },
  "3_3": {
    id: "3_3",
    chapterId: 3,
    image: IMG.soldiersTraining,
    location: "Hərbi hissə",
    date: "2005 – 2007",
    text: "Təlimlərini müvəffəqiyyətlə başa vuran Mübariz, fərqlənmə nişanları ilə xidmətini davam etdirir. Onun intizamı, cəsarəti və liderlik bacarığı yoldaşları və komandirləri tərəfindən fərqləndirilir. O, Xidməti Çavuş rütbəsinə yüksəlir.",
    speaker: "Hərbi arayış",
    choices: [
      {
        text: "Xidmətin sonuna yaxınlaş...",
        nextScene: "3_end",
      },
    ],
  },
  "3_end": {
    id: "3_end",
    chapterId: 3,
    image: IMG.soldiersTraining,
    location: "Hərbi hissə",
    date: "2007",
    isChapterEnd: true,
    chapterTitle: "Hərbi xidmət missiyası tamamlandı",
    text: "2007-ci il. Mübariz Xidməti Çavuş rütbəsi ilə hərbi xidmətini başa vurur. Vətənə xidmət etməyin şərəfini dadan oğlan kəndinə qayıdır. Amma içindəki odlu arzu — vətən uğrunda yenidən xidmət — sönmək bilmir...",
    choices: [
      {
        text: "Missiya 4: Orduya Qayıdış",
        nextScene: "4_1",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  //  MISSİYA 4 — ORDUYA QAYIDIŞ
  // ═══════════════════════════════════════════════════════
  "4_1": {
    id: "4_1",
    chapterId: 4,
    image: IMG.combatBoots,
    location: "Əliabad kəndi",
    date: "2009",
    text: "İki il keçir. Mübariz mülki həyat yaşayır — işləyir, ailəsilə vaxt keçirir. Lakin ürəyində hər an cəbhə, hər an vətən eşqiyanı var. Torpaqlarımızın işğal altında olduğunu bilmək ona rahatlıq vermir...",
    choices: [
      {
        text: "Mübarizin qərarını yaşa...",
        nextScene: "4_2",
      },
    ],
  },
  "4_2": {
    id: "4_2",
    chapterId: 4,
    image: IMG.combatBoots,
    location: "Əliabad kəndi",
    date: "2009",
    speaker: "Seçim vaxtı",
    text: "Mübariz qərar qarşısındadır. Könüllü olaraq yenidən orduya, cəbhə xəttinə qayıtmalıdır. Sən onun yerində olsaydın nə edərdin?",
    choices: [
      {
        text: "🫡 «Vətən çağırır! Qayıdıram!»",
        nextScene: "4_3",
        correct: true,
        feedback: "Mübariz də məhz belə etdi. Vətən sevgisi onu rahat həyatdan qoyub cəbhəyə — təhlükənin mərkəzinə apardı. Bu, əsl qəhrəmanlıqdır.",
        courage: 20,
      },
      {
        text: "🏠 «Mənim ailəm var, bura ehtiyacım var»",
        nextScene: "4_3",
        feedback: "Ailə sevgisi müqəddəsdir, lakin Mübariz daha böyük bir ailəni — Vətəni seçdi.",
        courage: 5,
      },
    ],
  },
  "4_3": {
    id: "4_3",
    chapterId: 4,
    image: IMG.soldiersCamouflage,
    location: "Cəbhə xətti",
    date: "2009",
    text: "2009-cu il. Mübariz könüllü olaraq Azərbaycan Ordusuna qayıdır. Bu dəfə o, Gizir rütbəsi ilə birbaşa cəbhə xəttinə — döyüş zonasına göndərilir. Ailəsinə belə demədən, gizlicə cəbhəyə yollanır. Vətən uğrunda cansındırıcı bir missiya başlayır.",
    speaker: "Tarixi qeyd",
    choices: [
      {
        text: "Cəbhə həyatına baş çək...",
        nextScene: "4_4",
      },
    ],
  },
  "4_4": {
    id: "4_4",
    chapterId: 4,
    image: IMG.mountainMist,
    location: "Cəbhə xətti — Dağlar",
    date: "2009 – 2010",
    text: "Cəbhədə həyat çətindir. Sərt qışlar, gərgin gecə növbələri, daimi təhlükə. Amma Mübariz burada da özünü göstərir. O, ən təhlükəli postlarda xidmət edir, yoldaşlarına qayğı göstərir və heç vaxt qorxmur. Onun cəsarəti bütün bölüyə ilham verir.",
    speaker: "Silah yoldaşlarının xatirələrindən",
    choices: [
      {
        text: "Son missiyaya hazırlaş...",
        nextScene: "4_end",
      },
    ],
  },
  "4_end": {
    id: "4_end",
    chapterId: 4,
    image: IMG.mountainMist,
    location: "Cəbhə xətti",
    date: "Yaz 2010",
    isChapterEnd: true,
    chapterTitle: "Qayıdış missiyası tamamlandı",
    text: "2010-cu ilin yazı. Mübariz cəbhədədir. Aylar keçir, gərginlik artır. İyun ayı yaxınlaşır — tarixin ən vacib günləri qapıda...",
    choices: [
      {
        text: "Missiya 5: Son Döyüş",
        nextScene: "5_1",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  //  MISSİYA 5 — SON DÖYÜŞ
  // ═══════════════════════════════════════════════════════
  "5_1": {
    id: "5_1",
    chapterId: 5,
    image: IMG.mountainFog,
    location: "Cəbhə xətti — Təpə postu",
    date: "18 iyun 2010",
    text: "18 iyun 2010. Gecə. Cəbhə xəttində gərginlik pik həddə çatıb. Düşmən atəşkəs rejimini pozaraq hücuma keçir. Mübarizin postu hücumun əsas hədəfinə çevrilir. Qarşı tərəfdən sayca üstün qüvvələr irəliləyir...",
    choices: [
      {
        text: "Mübarizin addımını gör...",
        nextScene: "5_2",
      },
    ],
  },
  "5_2": {
    id: "5_2",
    chapterId: 5,
    image: IMG.mountainFog,
    location: "Cəbhə xətti — Döyüş zonası",
    date: "18 iyun 2010",
    text: "Düşmən postu ələ keçirməyə çalışır. Yoldaşları tərəddüd edir. Lakin Mübariz bir an belə düşünmür. O, tək başına qarşı tərəfə — düşmənin üstünə irəliləyir. Bir əsgəri qarşıdan, birini yandan, digərini isə arxadan vurmaqla düşmənə ağır zərbələr vurur.",
    speaker: "Tarixi faktlara əsaslanan məlumat",
    choices: [
      {
        text: "Qəhrəmanlığı davam et...",
        nextScene: "5_3",
      },
    ],
  },
  "5_3": {
    id: "5_3",
    chapterId: 5,
    image: IMG.soldierSilhouette,
    location: "Cəbhə xətti",
    date: "19 iyun 2010",
    text: "Mübariz şəxsən düşmənin mövqelərini dağıdır, onların planını pozur və yoldaşlarının postu müdafiə etməsinə şərait yaradır. Lakin bu döyüşdə o, ağır yaralanır. Qan itirə-itirə də o, geri çəkilmir, döyüşə davam edir. O, son nəfəsinədək vətən torpaqlarını qoruyur...",
    speaker: "Döyüş şahidlərinin xatirələrindən",
    choices: [
      {
        text: "Son anı yad et...",
        nextScene: "5_end",
      },
    ],
  },
  "5_end": {
    id: "5_end",
    chapterId: 5,
    image: IMG.candles,
    location: "Əliabad kəndi",
    date: "19 iyun 2010",
    isChapterEnd: true,
    chapterTitle: "Son Döyüş missiyası tamamlandı",
    text: "18–19 iyun 2010. Mübariz İbrahimov cəbhədə göstərdiyi misilsiz qəhrəmanlıqla şəhidlik zirvəsinə yüksəlir. O, tək başına düşmənin böyük qüvvəsinin qarşısını alaraq yoldaşlarını xilas etdi. Onun igidliyi bütün Azərbaycana yayılır...",
    choices: [
      {
        text: "Missiya 6: Milli Qəhrəman",
        nextScene: "6_1",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  //  MISSİYA 6 — MİLLİ QƏHRƏMAN
  // ═══════════════════════════════════════════════════════
  "6_1": {
    id: "6_1",
    chapterId: 6,
    image: IMG.azFlag,
    location: "Azərbaycan Respublikası",
    date: "22 iyun 2010",
    text: "22 iyun 2010. Azərbaycan Respublikasının Prezidenti tərəfindən imzalanmış sərəncamla Mübariz İbrahimova ölümündən sonra «Azərbaycanın Milli Qəhrəmanı» adı verilir. Bu, vətən uğrunda canını fəda edən igidlərimizin ən yüksək mükafatıdır.",
    speaker: "Dövlət sənədi",
    choices: [
      {
        text: "Onun mirasını tanı...",
        nextScene: "6_2",
      },
    ],
  },
  "6_2": {
    id: "6_2",
    chapterId: 6,
    image: IMG.azFlag,
    location: "Biləsuvar rayonu",
    date: "İndi və həmişə",
    text: "Mübariz İbrahimovun adı Əliabad kəndindəki parkda, məktəbdə, küçələrdə əbədi yaşayır. Onun xatirəsinə abidələr ucaldılıb, filmlər çəkilib, kitablar yazılıb. Lakin ən böyük abidə — Azərbaycan xalqının qəlbindəki yerdəyişməz məhəbbətdir.",
    speaker: "Xalqın yaddaşından",
    choices: [
      {
        text: "Son mesaja qulaq as...",
        nextScene: "6_end",
      },
    ],
  },
  "6_end": {
    id: "6_end",
    chapterId: 6,
    image: IMG.candlesWarm,
    location: "Azərbaycan",
    date: "Əbədiyyət",
    isChapterEnd: true,
    isGameEnd: true,
    chapterTitle: "Oyun tamamlandı",
    text: "Mübariz İbrahimov sadəcə bir şəhid deyil — o, bir xalqın qürurudur. Onun həyatı bizə öyrədir ki, vətən sevgisi hər şeydən üstündür. Hər bir Mübariz, hər bir şəhidimiz bizə azad Azərbaycanı miras qoyub.\n\nAllah bütün şəhidlərimizə rəhmət eləsin. Biz onları heç vaxt unutmayacağıq.\n\n🇦🇿 Vətən sağ olsun!",
    choices: [
      {
        text: "🏠 Ana səhifəyə qayıt",
        nextScene: "HOME",
      },
      {
        text: "🗺️ Missiyaları yenidən yaşa",
        nextScene: "MAP",
      },
    ],
  },
};

// Yardımcı funksiyalar
export function getChapter(id: number): GameChapter | undefined {
  return chapters.find((c) => c.id === id);
}

export function getScene(id: string): GameScene | undefined {
  return scenes[id];
}

export function getFirstSceneId(): string {
  return chapters[0].startScene;
}
