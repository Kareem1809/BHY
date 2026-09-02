export type Lang = "he" | "ar";

export type Slide = {
  title: string;
  place: string;
  description: string;
};

export type Step = { title: string; body: string };
export type Pillar = { title: string; body: string };

export type SiteStrings = {
  brandLatin: string;
  taglineLatin: string;
  langToggle: string;
  seo: { title: string; description: string };
  nav: {
    about: string;
    portfolio: string;
    services: string;
    process: string;
    contact: string;
    menu: string;
    close: string;
  };
  hero: { lines: [string, string, string]; body: string; cta: string };
  about: {
    eyebrow: string;
    title: string;
    body: string;
    link: string;
    pillars: [Pillar, Pillar, Pillar];
  };
  ribbon: string[];
  portfolio: { eyebrow: string; title: string; prev: string; next: string; slides: Slide[] };
  services: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    items: [string, string, string, string];
    caption: string;
  };
  process: { eyebrow: string; title: string; body: string; steps: [Step, Step, Step, Step] };
  contact: {
    eyebrow: string;
    title: string;
    body: string;
    name: string;
    phone: string;
    email: string;
    message: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
    required: string;
    invalidEmail: string;
    whatsappLead: string;
    whatsappCta: string;
    whatsappText: string;
    instagramLead: string;
  };
  footer: {
    menu: string;
    follow: string;
    socials: { label: string; href: string }[];
    rights: string;
    top: string;
  };
  notFound: { title: string; body: string; home: string };
};

// One definition per destination. The language blocks below only carry
// labels, so a URL can never drift between Hebrew and Arabic.
export const SITE_URL = "https://basma-haj-yahia.vercel.app";
export const INSTAGRAM_HANDLE = "bhy__design";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}`;
export const EMAIL_ADDRESS = "basmahaj99@gmail.com";
// 054-822-0962 in international form: wa.me refuses the leading zero and wants
// the country code with no plus or dashes.
export const PHONE_INTL = "972548220962";
const WHATSAPP_URL = `https://wa.me/${PHONE_INTL}`;

// The chat opens with a greeting already typed, in the reader's language.
export const whatsappUrl = (text: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;

export const STRINGS: Record<Lang, SiteStrings> = {
  he: {
    brandLatin: "Basma Haj Yahia",
    taglineLatin: "architecture & interior design",
    langToggle: "العربية",
    seo: {
      title: "בסמה חאג' יחיא | אדריכלות ועיצוב פנים",
      description:
        "סטודיו לאדריכלות ועיצוב פנים. תכנון, עיצוב, סטיילינג וליווי ביצוע לבתים פרטיים, וילות ומבני ציבור בטייבה, חיפה, קצרין ובכל הארץ. חללים שטופי אור, חומר ומשמעות.",
    },
    nav: {
      about: "אודות",
      portfolio: "פרויקטים",
      services: "שירותים",
      process: "תהליך",
      contact: "צרו קשר",
      menu: "תפריט",
      close: "סגירה",
    },
    hero: {
      lines: ["חומר.", "משמעות.", "אווירה."],
      body: "הסטודיו של בסמה חאג' יחיא לאדריכלות ועיצוב פנים יוצר חללים שטופי אור, עם נוכחות רגשית, כוונה ועומק.",
      cta: "צרו קשר",
    },
    about: {
      eyebrow: "אודות",
      title: "עיצוב עם כוונה",
      body: "אנחנו מאמינות שעיצוב פנים הוא לא רק איך שחלל נראה, אלא איך שהוא מרגיש. כל פרויקט נבנה כשכבות של אור, צורה ותכלית, במפגש שבין בהירות ליופי שקט.",
      link: "לצפייה בפרויקטים",
      pillars: [
        {
          title: "אור",
          body: "האור הטבעי הוא נקודת המוצא של כל תוכנית. אנחנו מתכננות סביבו, לא למרות זאת.",
        },
        {
          title: "חומר",
          body: "עץ, אבן, בד וגוון נבחרים ביד, בעין ובמגע, כדי שהחלל ירגיש אמיתי גם אחרי שנים.",
        },
        {
          title: "פרופורציה",
          body: "המידות הנכונות עושות את השקט: כל קו, כל מרווח וכל גובה נמדדים ביחס לאדם שיחיה בהם.",
        },
      ],
    },
    ribbon: [
      "אדריכלות",
      "עיצוב פנים",
      "תכנון",
      "איתור ורכש",
      "סטיילינג",
      "ליווי ופיקוח",
      "חומר",
      "משמעות",
      "אווירה",
    ],
    portfolio: {
      eyebrow: "פרויקטים",
      title: "רשמים שנשארים",
      prev: "הפרויקט הקודם",
      next: "הפרויקט הבא",
      slides: [
        {
          title: "בית פרטי",
          place: "טייבה",
          description:
            "עיצוב פנים מודרני בגווני בז׳, אפור וחום, עם נגיעות ירוק זית ושילוב של עץ טבעי ואבן. תאורה חמה, בדים רכים ופרטים מוקפדים יוצרים אווירה ביתית, אלגנטית ומזמינה.",
        },
        {
          title: "ספרייה עירונית",
          place: "קצרין",
          description:
            "ספרייה עירונית המתוכננת על מגרש פינתי בשטח של כ־2 דונם, בין הרחובות זוויתן ודליות בקצרין. הפרויקט משלב עיצוב מודרני בהשראת ספרים, תוך תשומת לב לפרטים הקטנים ויצירת חללי קריאה מזמינים לחוויה ייחודית ומהנה.",
        },
        {
          title: "בית פרטי",
          place: "חיפה",
          description:
            "עיצוב פנים מודרני המשלב גוונים אפורים, עץ בהיר ונגיעות שחורות ליצירת מראה אלגנטי ומאוזן. המטבח, פינת האוכל והסלון משתלבים בחלל פתוח בעל שפה עיצובית אחידה. חיפויי קיר, מראות אנכיות וטקסטיל רך מעניקים עומק וחמימות, בעוד האור הטבעי מדגיש את מרקמי החומרים ויוצר אווירה נעימה ומזמינה.",
        },
        {
          title: "בית דו משפחתי",
          place: "טייבה",
          description:
            "עיצוב חם בגווני קרם וטרוורטין עם עץ אלון טבעי. קשתות רכות, גופי תאורה פיסוליים ותאורה נסתרת עוטפים את הסלון, המטבח וחדר השינה בשפה אחת רגועה ומדויקת.",
        },
      ],
    },
    services: {
      eyebrow: "שירותים",
      title: "עיצוב שמהדהד",
      body: "אנחנו מציעות יותר מעיצוב: אנחנו יוצרות חוויה דרך בהירות, מרקם, כוונה ונוכחות מדויקת.",
      cta: "צרו קשר",
      items: ["תכנון ועיצוב", "איתור ורכש", "סטיילינג והלבשה", "ליווי ופיקוח"],
      caption: "שירותי עיצוב שנבנו סביב חיים רגועים, מכוונים ומלאי משמעות.",
    },
    process: {
      eyebrow: "התהליך",
      title: "מרעיון לבית",
      body: "ארבעה שלבים ברורים, מהשיחה הראשונה ועד הרגע שבו נכנסים הביתה. בכל שלב אתם יודעים בדיוק איפה אנחנו, ומה קורה הלאה.",
      steps: [
        {
          title: "היכרות והקשבה",
          body: "פגישה ראשונה בחלל או בסטודיו. מקשיבות לאיך אתם חיים, מה חסר ומה חשוב, ומגדירות יחד את המסגרת, את התקציב ואת לוח הזמנים.",
        },
        {
          title: "קונספט ותכנון",
          body: "רעיון אחד ברור מוביל את כל ההחלטות: תוכניות, חלוקת חללים, הדמיות ופרטים, עד שהתמונה השלמה מדויקת ומורגשת.",
        },
        {
          title: "חומר, אור וגוון",
          body: "בחירת החומרים, גופי התאורה והטקסטיל שיהפכו את התוכנית לחוויה. דוגמאות ביד, מפגשים עם ספקים, והחלטות שנלקחות בעיניים פקוחות.",
        },
        {
          title: "ליווי עד המסירה",
          body: "פיקוח על הביצוע, תיאום בין בעלי המקצוע ופתרון בעיות בזמן אמת, עד שהבית מוכן ונראה בדיוק כפי שדמיינו אותו יחד.",
        },
      ],
    },
    contact: {
      eyebrow: "צור קשר",
      title: "בואו נתחיל שיחה",
      body: "ספרו לנו על החלל שלכם, על הרעיונות ועל השאיפות. אנחנו נלווה אתכם בצעדים הבאים בתשומת לב ובכוונה.",
      name: "שם מלא",
      phone: "טלפון",
      email: "אימייל",
      message: "הודעה",
      submit: "שליחת פנייה",
      sending: "שולחת...",
      success: "הפנייה נשלחה. נחזור אליכם בקרוב.",
      error: "משהו השתבש בשליחה. נסו שוב בעוד רגע.",
      required: "שדה חובה",
      invalidEmail: "כתובת אימייל לא תקינה",
      whatsappLead: "מעדיפים לכתוב? שלחו לנו הודעה בוואטסאפ ונחזור אליכם.",
      whatsappCta: "לשיחה בוואטסאפ",
      whatsappText: "שלום בסמה, הגעתי דרך האתר ואשמח לשוחח על פרויקט.",
      instagramLead: "פרויקטים חדשים מתפרסמים קודם באינסטגרם",
    },
    footer: {
      menu: "תפריט",
      follow: "עקבו אחרינו",
      socials: [
        { label: "אינסטגרם", href: INSTAGRAM_URL },
        { label: "וואטסאפ", href: WHATSAPP_URL },
        { label: EMAIL_ADDRESS, href: `mailto:${EMAIL_ADDRESS}` },
      ],
      rights: "© 2026 בסמה חאג' יחיא. כל הזכויות שמורות.",
      top: "חזרה למעלה",
    },
    notFound: {
      title: "העמוד לא נמצא",
      body: "הכתובת שהגעתם אליה לא קיימת, אבל הבית תמיד כאן.",
      home: "חזרה לעמוד הבית",
    },
  },
  ar: {
    brandLatin: "Basma Haj Yahia",
    taglineLatin: "architecture & interior design",
    langToggle: "עברית",
    seo: {
      title: "بسمة حاج يحيى | إعمار وتصميم داخلي",
      description:
        "ستوديو للإعمار والتصميم الداخلي. تخطيط وتصميم وتنسيق ومرافقة تنفيذ للبيوت الخاصة والفلل والمباني العامة في الطيبة وحيفا وكتسرين وكل البلاد. مساحات غامرة بالضوء والخامة والمعنى.",
    },
    nav: {
      about: "من نحن",
      portfolio: "مشاريعنا",
      services: "خدماتنا",
      process: "كيف نعمل",
      contact: "تواصلوا معنا",
      menu: "القائمة",
      close: "إغلاق",
    },
    hero: {
      lines: ["خامة.", "المعنى.", "الأجواء."],
      body: "ستوديو بسمة حاج يحيى للإعمار والتصميم الداخلي يبتكر مساحات غامرة بالضوء، بحضور عاطفي وبنية وعمق.",
      cta: "تواصلوا معنا",
    },
    about: {
      eyebrow: "من نحن",
      title: "تصميم بنية",
      body: "نؤمن أن التصميم الداخلي ليس شكل المساحة فحسب، بل ما تشعرون به فيها. كل مشروع يبنى طبقات من الضوء والشكل والغاية، حيث يلتقي الوضوح بالجمال الهادئ.",
      link: "إلى المشاريع",
      pillars: [
        {
          title: "الضوء",
          body: "الضوء الطبيعي هو نقطة انطلاق كل مخطط. نصمم حوله، لا رغماً عنه.",
        },
        {
          title: "خامة",
          body: "الخشب والحجر والقماش واللون تُختار باليد والعين واللمس، ليبقى المكان حقيقياً بعد سنوات.",
        },
        {
          title: "التناسب",
          body: "المقاسات الصحيحة تصنع الهدوء: كل خط وكل فراغ وكل ارتفاع يُقاس بالنسبة للإنسان الذي سيعيش فيه.",
        },
      ],
    },
    ribbon: [
      "إعمار",
      "تصميم داخلي",
      "تخطيط",
      "توريد واقتناء",
      "تنسيق",
      "إشراف ومتابعة",
      "خامة",
      "المعنى",
      "الأجواء",
    ],
    portfolio: {
      eyebrow: "مشاريعنا",
      title: "انطباعات تدوم",
      prev: "المشروع السابق",
      next: "المشروع التالي",
      slides: [
        {
          title: "بيت خاص",
          place: "الطيبة",
          description:
            "تصميم داخلي عصري بدرجات البيج والرمادي والبني مع لمسات زيتونية ومزيج من الخشب الطبيعي والحجر. إضاءة دافئة وأقمشة ناعمة وتفاصيل مدروسة تخلق أجواء بيتية أنيقة ومرحّبة.",
        },
        {
          title: "مكتبة بلدية",
          place: "كتسرين",
          description:
            "مكتبة بلدية مخططة على قطعة زاوية بمساحة نحو دونمين، بين شارعي زويتان ودليوت في كتسرين. المشروع يجمع تصميماً عصرياً مستوحى من الكتب، مع عناية بأدق التفاصيل وخلق زوايا قراءة جذابة لتجربة فريدة وممتعة.",
        },
        {
          title: "بيت خاص",
          place: "حيفا",
          description:
            "تصميم داخلي عصري يجمع الدرجات الرمادية والخشب الفاتح ولمسات سوداء لمظهر أنيق ومتوازن. المطبخ وركن الطعام والصالون يندمجون في فضاء مفتوح بلغة تصميم موحّدة. كسوات الجدران والمرايا العمودية والنسيج الناعم تمنح عمقاً ودفئاً، بينما يبرز الضوء الطبيعي ملمس الخامات ويخلق أجواء مريحة.",
        },
        {
          title: "بيت ثنائي العائلة",
          place: "الطيبة",
          description:
            "تصميم دافئ بدرجات الكريمي والترافرتين مع خشب البلوط الطبيعي. أقواس ناعمة وقطع إضاءة منحوتة وإضاءة مخفية تلفّ الصالون والمطبخ وغرفة النوم بلغة واحدة هادئة ودقيقة.",
        },
      ],
    },
    services: {
      eyebrow: "خدماتنا",
      title: "تصميم يتردد صداه",
      body: "نقدم أكثر من تصميم: نصنع تجربة عبر الوضوح والملمس والنية والحضور المدروس.",
      cta: "تواصلوا معنا",
      items: ["تخطيط وتصميم", "توريد واقتناء", "تنسيق وإكساء", "إشراف ومتابعة"],
      caption: "خدمات تصميم بنيت حول حياة هادئة ومقصودة وذات معنى.",
    },
    process: {
      eyebrow: "طريقة العمل",
      title: "من الفكرة إلى البيت",
      body: "أربع مراحل واضحة، من أول حديث حتى لحظة الدخول إلى البيت. في كل مرحلة تعرفون تماماً أين نحن وما الخطوة التالية.",
      steps: [
        {
          title: "تعارف وإصغاء",
          body: "لقاء أول في المكان أو في الاستوديو. نصغي لطريقة عيشكم، لما ينقص ولما يهمّ، ونحدد معاً الإطار والميزانية والجدول الزمني.",
        },
        {
          title: "الفكرة والتخطيط",
          body: "فكرة واحدة واضحة تقود كل القرارات: مخططات، توزيع الفراغات، تصورات ثلاثية الأبعاد وتفاصيل، حتى تصبح الصورة الكاملة دقيقة ومحسوسة.",
        },
        {
          title: "خامة وضوء ولون",
          body: "اختيار الخامات وقطع الإضاءة والأقمشة التي تحوّل المخطط إلى تجربة. عيّنات في اليد، لقاءات مع الموردين، وقرارات تُتخذ بعينين مفتوحتين.",
        },
        {
          title: "مرافقة حتى التسليم",
          body: "إشراف على التنفيذ، تنسيق بين أصحاب المهن وحلّ المشكلات في وقتها، حتى يكون البيت جاهزاً ويبدو تماماً كما تخيلناه معاً.",
        },
      ],
    },
    contact: {
      eyebrow: "تواصل",
      title: "لنبدأ حديثا",
      body: "أخبرونا عن مساحتكم وأفكاركم وطموحاتكم، ونرافقكم في الخطوات التالية بعناية ونية.",
      name: "الاسم الكامل",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      message: "الرسالة",
      submit: "إرسال الطلب",
      sending: "جار الإرسال...",
      success: "تم إرسال طلبكم. سنعود إليكم قريبا.",
      error: "حدث خطأ في الإرسال. حاولوا مجددا بعد قليل.",
      required: "حقل إلزامي",
      invalidEmail: "بريد إلكتروني غير صالح",
      whatsappLead: "تفضلون الكتابة؟ ابعثوا لنا رسالة واتساب ونعود إليكم.",
      whatsappCta: "حديث عبر واتساب",
      whatsappText: "مرحباً بسمة، وصلت من خلال الموقع وأحب أن نتحدث عن مشروع.",
      instagramLead: "المشاريع الجديدة تُنشر أولاً على إنستغرام",
    },
    footer: {
      menu: "القائمة",
      follow: "تابعونا",
      socials: [
        { label: "إنستغرام", href: INSTAGRAM_URL },
        { label: "واتساب", href: WHATSAPP_URL },
        { label: EMAIL_ADDRESS, href: `mailto:${EMAIL_ADDRESS}` },
      ],
      rights: "© 2026 بسمة حاج يحيى. جميع الحقوق محفوظة.",
      top: "العودة إلى الأعلى",
    },
    notFound: {
      title: "الصفحة غير موجودة",
      body: "العنوان الذي وصلتم إليه غير موجود، لكن البيت هنا دائماً.",
      home: "العودة إلى الصفحة الرئيسية",
    },
  },
};
