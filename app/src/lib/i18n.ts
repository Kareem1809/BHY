export type Lang = "he" | "ar";

export type Slide = {
  title: string;
  place: string;
  description: string;
};

export type SiteStrings = {
  brandLatin: string;
  taglineLatin: string;
  langToggle: string;
  nav: { about: string; portfolio: string; services: string; journal: string; contact: string };
  hero: { lines: [string, string, string]; body: string; cta: string };
  about: { eyebrow: string; title: string; body: string; link: string };
  portfolio: { eyebrow: string; title: string; prev: string; next: string; slides: Slide[] };
  services: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    items: [string, string, string, string];
    caption: string;
  };
  journal: { eyebrow: string; title: string; items: [string, string, string, string] };
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
  };
  footer: {
    menu: string;
    follow: string;
    socials: { label: string; href: string }[];
    rights: string;
  };
};

// One definition per destination — the language blocks below only carry labels,
// so a URL can never drift between Hebrew and Arabic.
const INSTAGRAM_URL = "https://www.instagram.com/basma.hajyahia.design";
const EMAIL_ADDRESS = "basmahaj99@gmail.com";
// 054-822-0962 in international form: wa.me refuses the leading zero and wants
// the country code with no plus or dashes.
const WHATSAPP_NUMBER = "054-822-0962";
const WHATSAPP_URL = "https://wa.me/972548220962";

export const STRINGS: Record<Lang, SiteStrings> = {
  he: {
    brandLatin: "Basma Haj Yahia",
    taglineLatin: "architecture & interior design",
    langToggle: "العربية",
    nav: {
      about: "אודות",
      portfolio: "פרויקטים",
      services: "שירותים",
      journal: "יומן",
      contact: "צרו קשר",
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
      link: "עוד עלינו",
    },
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
          title: "וילה פרטית",
          place: "",
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
    journal: {
      eyebrow: "יומן",
      title: "רשימות מהסטודיו",
      items: ["חללים שנושמים", "מרקמים של שקט", "אור כחומר גלם", "היופי שבאיפוק"],
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
    },
    footer: {
      menu: "תפריט",
      follow: "עקבו אחרינו",
      socials: [
        { label: "אינסטגרם", href: INSTAGRAM_URL },
        { label: `וואטסאפ ${WHATSAPP_NUMBER}`, href: WHATSAPP_URL },
        { label: EMAIL_ADDRESS, href: `mailto:${EMAIL_ADDRESS}` },
      ],
      rights: "© 2026 בסמה חאג' יחיא. כל הזכויות שמורות.",
    },
  },
  ar: {
    brandLatin: "Basma Haj Yahia",
    taglineLatin: "architecture & interior design",
    langToggle: "עברית",
    nav: {
      about: "من نحن",
      portfolio: "مشاريعنا",
      services: "خدماتنا",
      journal: "يوميات",
      contact: "تواصلوا معنا",
    },
    hero: {
      lines: ["الخامة.", "المعنى.", "الأجواء."],
      body: "ستوديو بسمة حاج يحيى للعمارة والتصميم الداخلي يبتكر مساحات غامرة بالضوء، بحضور عاطفي وبنية وعمق.",
      cta: "تواصلوا معنا",
    },
    about: {
      eyebrow: "من نحن",
      title: "تصميم بنية",
      body: "نؤمن أن التصميم الداخلي ليس شكل المساحة فحسب، بل ما تشعرون به فيها. كل مشروع يبنى طبقات من الضوء والشكل والغاية، حيث يلتقي الوضوح بالجمال الهادئ.",
      link: "المزيد عنا",
    },
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
          title: "فيلا خاصة",
          place: "",
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
    journal: {
      eyebrow: "يوميات",
      title: "ملاحظات من الاستوديو",
      items: ["مساحات تتنفس", "ملامس السكينة", "الضوء كمادة خام", "جمال الاقتضاب"],
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
    },
    footer: {
      menu: "القائمة",
      follow: "تابعونا",
      socials: [
        { label: "إنستغرام", href: INSTAGRAM_URL },
        { label: `واتساب ${WHATSAPP_NUMBER}`, href: WHATSAPP_URL },
        { label: EMAIL_ADDRESS, href: `mailto:${EMAIL_ADDRESS}` },
      ],
      rights: "© 2026 بسمة حاج يحيى. جميع الحقوق محفوظة.",
    },
  },
};
