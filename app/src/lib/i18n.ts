export type Lang = "he" | "ar";

export type Slide = {
  title: string;
  place: string;
  year: string;
  description: string;
  swatch: string;
  note: string;
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
  footer: { menu: string; follow: string; socials: [string, string, string]; rights: string };
};

export const STRINGS: Record<Lang, SiteStrings> = {
  he: {
    brandLatin: "Basma Haj Yahia",
    taglineLatin: "interior & architecture design",
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
          title: "בית בין זיתים",
          place: "וילה פרטית, הגליל",
          year: "2025",
          description:
            "רוגע ים תיכוני פוגש חומריות פיסולית. גוונים רכים ומרקמים טבעיים יוצרים חלל אירוח שליו.",
          swatch: "פלטת הדגשה: אבן חול, זית ולבן פשתן",
          note: "קונספט עיצוב לחלל אירוח משפחתי.",
        },
        {
          title: "אור שקט",
          place: "דירת בוטיק, תל אביב",
          year: "2024",
          description:
            "בהירות ורוגע. גוונים ניטרליים וחומרים שקטים בונים פינת עבודה מוארת וממוקדת.",
          swatch: "פלטת הדגשה: עץ בהיר, בז' שיבולת ולבן שנהב",
          note: "קונספט עיצוב לדירת מגורים.",
        },
        {
          title: "בית המרחצאות",
          place: "ספא בוטיק, חיפה",
          year: "2025",
          description: "קשתות, אבן חמה ומים שקטים. חלל שנשען על איפוק, אור וחומר.",
          swatch: "פלטת הדגשה: טרוורטין, חימר ורוד וזית",
          note: "קונספט עיצוב לספא בוטיק.",
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
      socials: ["אינסטגרם", "פייסבוק", "פינטרסט"],
      rights: "© 2026 בסמה חאג' יחיא. כל הזכויות שמורות.",
    },
  },
  ar: {
    brandLatin: "Basma Haj Yahia",
    taglineLatin: "interior & architecture design",
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
          title: "بيت بين الزيتون",
          place: "فيلا خاصة، الجليل",
          year: "2025",
          description:
            "هدوء متوسطي يلتقي بحس نحتي. درجات ناعمة وملامس طبيعية تصنع مساحة ضيافة هادئة.",
          swatch: "لوحة الألوان: رمل، زيتوني وأبيض كتاني",
          note: "تصور تصميمي لمساحة ضيافة عائلية.",
        },
        {
          title: "نور هادئ",
          place: "شقة بوتيك، تل أبيب",
          year: "2024",
          description: "وضوح وسكينة. درجات محايدة وخامات هادئة تبني ركن عمل مضيئا ومركزا.",
          swatch: "لوحة الألوان: خشب فاتح، بيج وأبيض عاجي",
          note: "تصور تصميمي لشقة سكنية.",
        },
        {
          title: "بيت الحمام",
          place: "سبا بوتيك، حيفا",
          year: "2025",
          description: "أقواس وحجر دافئ وماء ساكن. مساحة تقوم على الاقتضاب والضوء والخامة.",
          swatch: "لوحة الألوان: ترافرتين، طين وردي وزيتوني",
          note: "تصور تصميمي لسبا بوتيك.",
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
      socials: ["إنستغرام", "فيسبوك", "بينترست"],
      rights: "© 2026 بسمة حاج يحيى. جميع الحقوق محفوظة.",
    },
  },
};
