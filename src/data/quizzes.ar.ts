import type { QuizQuestion } from '../components/SectionQuiz';

// Arabic mirror of QUIZZES in quizzes.ts. Same ids, same correct answers,
// explanations shortened to one sentence so the block stays scannable in RTL.

export const QUIZZES_AR: Record<string, { title: string; questions: QuizQuestion[] }> = {
  fundamentals: {
    title: 'أساسيات إدارة الهوية والوصول',
    questions: [
      {
        id: 'f1',
        question: 'ما هي المكونات الثلاثة لنموذج AAA؟',
        options: [
          { id: 'a', text: 'المصادقة، الترخيص، التدقيق والمحاسبة', isCorrect: true, explanation: 'AAA تعني المصادقة (إثبات الهوية)، والترخيص (تحديد ما يُسمح به)، والتدقيق والمحاسبة (تسجيل ما جرى).' },
          { id: 'b', text: 'المصادقة، الوصول، التدقيق', isCorrect: false, explanation: 'الوصول ليس جزءاً من نموذج AAA؛ الحرف الثالث يرمز إلى المحاسبة.' },
          { id: 'c', text: 'الترخيص، الوصول، التدقيق', isCorrect: false, explanation: 'الوصول ليس جزءاً من نموذج AAA؛ الحرف الأول يرمز إلى المصادقة.' },
          { id: 'd', text: 'المصادقة، الترخيص، الوصول', isCorrect: false, explanation: 'الوصول ليس جزءاً من نموذج AAA؛ الحرف الثالث يرمز إلى المحاسبة.' },
        ],
        takeaway: 'نموذج AAA هو أساس إدارة الهوية: أثبت الهوية، امنح الصلاحية، سجّل ما حدث.',
      },
      {
        id: 'f2',
        question: 'ما المقصود بدورة حياة المنضم والمتنقل والخارج (JML)؟',
        options: [
          { id: 'a', text: 'بروتوكول شبكي لمزامنة الأدلة', isCorrect: false, explanation: 'JML ليست بروتوكولاً شبكياً، بل نموذج دورة حياة الهوية.' },
          { id: 'b', text: 'دورة حياة الهوية: الانضمام وتغيّر الدور والخروج', isCorrect: true, explanation: 'تغطي JML التحولات الثلاثة الحاسمة: الانضمام (Joiner)، وتغيّر الدور (Mover)، والخروج (Leaver).' },
          { id: 'c', text: 'صيغة لتسجيل جلسات إدارة الوصول المميّز', isCorrect: false, explanation: 'JML لا علاقة لها بتسجيل جلسات PAM.' },
          { id: 'd', text: 'نوع من مزامنة LDAP', isCorrect: false, explanation: 'JML لا علاقة لها بمزامنة LDAP.' },
        ],
        takeaway: 'كل هوية تمر بتحولات JML، وكل تحول حدث أمني يستحق المراجعة.',
      },
      {
        id: 'f3',
        question: 'ما هو مبدأ الامتياز الأقل؟',
        options: [
          { id: 'a', text: 'منح المستخدم أقصى الصلاحيات التي قد يحتاجها يوماً', isCorrect: false, explanation: 'مبدأ الامتياز الأقل هو عكس ذلك تماماً.' },
          { id: 'b', text: 'منح المستخدم الصلاحيات اللازمة لأداء عمله فقط', isCorrect: true, explanation: 'الامتياز الأقل يعني منح الحد الأدنى من الصلاحيات المطلوبة لمهمة أو دور محدد.' },
          { id: 'c', text: 'إلغاء جميع صلاحيات المستخدمين افتراضياً', isCorrect: false, explanation: 'المبدأ لا يعني إلغاء كل شيء، بل منح ما تحتاجه المهمة فقط.' },
          { id: 'd', text: 'نوع من قواعد جدار الحماية', isCorrect: false, explanation: 'الامتياز الأقل مبدأ في إدارة الهوية، وليس قاعدة جدار حماية.' },
        ],
        takeaway: 'الامتياز الأقل يقلّص سطح الهجوم بتقييد ما يمكن لكل هوية الوصول إليه.',
      },
      {
        id: 'f4',
        question: 'ما الفرق بين RBAC وABAC؟',
        options: [
          { id: 'a', text: 'RBAC يعتمد على الأدوار، وABAC على السمات', isCorrect: true, explanation: 'RBAC يمنح الوصول حسب الدور، بينما ABAC يقرر حسب سمات المستخدم والمورد والبيئة.' },
          { id: 'b', text: 'RBAC أسرع وABAC أبطأ', isCorrect: false, explanation: 'السرعة ليست الفرق الجوهري؛ الفرق في نموذج الترخيص نفسه.' },
          { id: 'c', text: 'RBAC للسحابة وABAC للأنظمة المحلية', isCorrect: false, explanation: 'النموذجان قابلان للتطبيق في السحابة والمحلي على حد سواء.' },
          { id: 'd', text: 'لا يوجد فرق بينهما', isCorrect: false, explanation: 'RBAC وABAC نموذجان مختلفان جوهرياً في الترخيص.' },
        ],
        takeaway: 'RBAC يجيب عن «ماذا» عبر الأدوار، وABAC عن «متى» عبر السمات والسياق.',
      },
      {
        id: 'f5',
        question: 'ما المقصود بالمصادقة متعددة العوامل (MFA)؟',
        options: [
          { id: 'a', text: 'استخدام كلمتي مرور مختلفتين', isCorrect: false, explanation: 'MFA تتطلب عوامل من أنواع مختلفة، لا كلمتي مرور.' },
          { id: 'b', text: 'طلب عاملين مستقلين أو أكثر: ما تعرفه، وما تملكه، وما أنت عليه', isCorrect: true, explanation: 'تجمع MFA عوامل من فئات مختلفة: المعرفة (كلمة المرور)، والحيازة (الرمز)، والذات (السمة الحيوية).' },
          { id: 'c', text: 'نوع من تسجيل الدخول الموحّد', isCorrect: false, explanation: 'MFA ليست SSO؛ إنها إجراء لتقوية المصادقة.' },
          { id: 'd', text: 'سياسة لكلمات المرور', isCorrect: false, explanation: 'MFA آلية مصادقة وليست سياسة لكلمات المرور.' },
        ],
        takeaway: 'MFA تخفض بشكل ملموس خطر الاستيلاء على الحساب عند تسريب بيانات الاعتماد.',
      },
    ],
  },
  'protocols-iga': {
    title: 'بروتوكولات الهوية وحوكمتها',
    questions: [
      {
        id: 'p1',
        question: 'ما الفرق بين SAML وOIDC؟',
        options: [
          { id: 'a', text: 'SAML يستخدم XML وOIDC يستخدم JSON', isCorrect: true, explanation: 'تأكيدات SAML مبنية على XML، بينما رموز OIDC مبنية على JSON (JWT).' },
          { id: 'b', text: 'SAML أحدث من OIDC', isCorrect: false, explanation: 'SAML (2005) أقدم من OIDC (2014).' },
          { id: 'c', text: 'SAML لواجهات البرمجة وOIDC للمتصفحات', isCorrect: false, explanation: 'SAML مخصص أساساً لتسجيل الدخول الموحّد عبر المتصفح، وOIDC يخدم المتصفح وواجهات البرمجة معاً.' },
          { id: 'd', text: 'لا يوجد فرق بينهما', isCorrect: false, explanation: 'البروتوكولان مختلفان في التصميم والغرض.' },
        ],
        takeaway: 'SAML معيار تسجيل الدخول الموحّد في المؤسسات، وOIDC معيار الويب والجوال الحديث.',
      },
      {
        id: 'p2',
        question: 'ما هو OAuth 2.0؟',
        options: [
          { id: 'a', text: 'بروتوكول مصادقة', isCorrect: false, explanation: 'OAuth 2.0 إطار ترخيص وليس بروتوكول مصادقة.' },
          { id: 'b', text: 'إطار ترخيص للوصول المفوض', isCorrect: true, explanation: 'يتيح OAuth 2.0 للعميل الوصول إلى الموارد نيابة عن المستخدم دون مشاركة بيانات اعتماده.' },
          { id: 'c', text: 'خدمة دليل', isCorrect: false, explanation: 'OAuth 2.0 ليس خدمة دليل.' },
          { id: 'd', text: 'سياسة لكلمات المرور', isCorrect: false, explanation: 'OAuth 2.0 ليس سياسة لكلمات المرور.' },
        ],
        takeaway: 'OAuth 2.0 يجيب عن سؤال: هل يحق لهذا التطبيق الوصول إلى هذا المورد نيابة عن هذا المستخدم؟',
      },
      {
        id: 'p3',
        question: 'فيمَ يُستخدم SCIM؟',
        options: [
          { id: 'a', text: 'تسجيل الدخول الموحّد', isCorrect: false, explanation: 'SCIM ليس لتسجيل الدخول الموحّد، بل للتزويد.' },
          { id: 'b', text: 'تزويد المستخدمين وإلغاء تزويدهم آلياً', isCorrect: true, explanation: 'يدير SCIM تبادل معلومات الهوية بين الأنظمة آلياً.' },
          { id: 'c', text: 'تسجيل الجلسات', isCorrect: false, explanation: 'SCIM لا علاقة له بتسجيل الجلسات.' },
          { id: 'd', text: 'إدارة الشهادات الرقمية', isCorrect: false, explanation: 'SCIM لا علاقة له بإدارة الشهادات.' },
        ],
        takeaway: 'SCIM هو الجسر بين أنظمة الموارد البشرية وتطبيقات SaaS.',
      },
      {
        id: 'p4',
        question: 'ما هو LDAP؟',
        options: [
          { id: 'a', text: 'لغة برمجة', isCorrect: false, explanation: 'LDAP ليس لغة برمجة.' },
          { id: 'b', text: 'بروتوكول للوصول إلى خدمات الدليل', isCorrect: true, explanation: 'يُستخدم LDAP لاستعلام خدمات الدليل وتعديلها، مثل Active Directory وOpenLDAP.' },
          { id: 'c', text: 'نوع من قواعد البيانات', isCorrect: false, explanation: 'LDAP بروتوكول وليس قاعدة بيانات؛ إنه يصل إلى خدمة دليل.' },
          { id: 'd', text: 'طوبولوجيا شبكية', isCorrect: false, explanation: 'LDAP ليس طوبولوجيا شبكية.' },
        ],
        takeaway: 'LDAP هو البروتوكول الذي تستخدمه التطبيقات لمصادقة المستخدمين والاستعلام عن الدليل.',
      },
      {
        id: 'p5',
        question: 'ما المقصود بحوكمة الهوية وإدارتها (IGA)؟',
        options: [
          { id: 'a', text: 'نوع من جدران الحماية', isCorrect: false, explanation: 'IGA ليست جدار حماية.' },
          { id: 'b', text: 'طبقة الحوكمة: طلبات الوصول، والتصديقات، والتدقيق', isCorrect: true, explanation: 'تغطي IGA من ينبغي أن يملك الوصول، وكيف يطلبه، وكيف يُراجع.' },
          { id: 'c', text: 'لغة برمجة', isCorrect: false, explanation: 'IGA ليست لغة برمجة.' },
          { id: 'd', text: 'نوع من الشبكات الخاصة الافتراضية', isCorrect: false, explanation: 'IGA ليست VPN.' },
        ],
        takeaway: 'IGA هي طبقة القرار التي تقود التزويد وتضمن الامتثال.',
      },
    ],
  },
  'pam-core': {
    title: 'أساسيات إدارة الوصول المميّز',
    questions: [
      {
        id: 'pa1',
        question: 'ما الفرق بين IAM وPAM؟',
        options: [
          { id: 'a', text: 'IAM للمستخدمين وPAM للمسؤولين', isCorrect: true, explanation: 'IAM تدير وصول المستخدمين عامة، وPAM تدير الوصول المميّز (المسؤولون وجذر وحسابات الخدمة).' },
          { id: 'b', text: 'لا يوجد فرق بينهما', isCorrect: false, explanation: 'IAM وPAM تخصصان مترابطان لكنهما مختلفان.' },
          { id: 'c', text: 'IAM للسحابة وPAM للأنظمة المحلية', isCorrect: false, explanation: 'كلاهما ينطبق على السحابة والأنظمة المحلية.' },
          { id: 'd', text: 'IAM مجموعة فرعية من PAM', isCorrect: false, explanation: 'PAM هي المجموعة الفرعية من IAM، وليس العكس.' },
        ],
        takeaway: 'PAM هي التخصص الفرعي في IAM الذي يعنى بالوصول المميّز.',
      },
      {
        id: 'pa2',
        question: 'ما المقصود بخزن بيانات الاعتماد في خزنة؟',
        options: [
          { id: 'a', text: 'تخزين كلمات المرور في ملف نصي', isCorrect: false, explanation: 'الخزن تخزين آمن، وليس ملفاً نصياً.' },
          { id: 'b', text: 'تخزين بيانات الاعتماد المميّزة وإدارتها مركزياً في خزنة آمنة', isCorrect: true, explanation: 'تحفظ الخزنة بيانات الاعتماد المميّزة وتضبط الوصول إليها وتدير تدويرها آلياً.' },
          { id: 'c', text: 'نوع من قواعد البيانات', isCorrect: false, explanation: 'الخزنة ليست مجرد قاعدة بيانات؛ لها ضوابط وصول وتدوير وتدقيق.' },
          { id: 'd', text: 'بروتوكول شبكي', isCorrect: false, explanation: 'الخزن ليس بروتوكولاً شبكياً.' },
        ],
        takeaway: 'الخزنة قلب PAM: تُستعار بيانات الاعتماد وتُستخدم وتُدوّر آلياً.',
      },
      {
        id: 'pa3',
        question: 'ما المقصود بالوصول في الوقت المناسب (JIT)؟',
        options: [
          { id: 'a', text: 'وصول مميّز دائم متاح طوال الوقت', isCorrect: false, explanation: 'JIT عكس ذلك: يُمنح الوصول عند الحاجة فقط وينتهي تلقائياً.' },
          { id: 'b', text: 'وصول مميّز محدد زمنياً يُمنح عند الطلب ويُسحب بعد الاستخدام', isCorrect: true, explanation: 'يُمنح وصول JIT لمهمة محددة ولمدة محدودة، ثم يُسحب آلياً.' },
          { id: 'c', text: 'نوع من الشبكات الخاصة الافتراضية', isCorrect: false, explanation: 'JIT ليست VPN.' },
          { id: 'd', text: 'سياسة لكلمات المرور', isCorrect: false, explanation: 'JIT ليست سياسة لكلمات المرور.' },
        ],
        takeaway: 'JIT تلغي الصلاحيات الدائمة: لا وصول دائم، ورفع صلاحية عند طلب مُتحقق منه، وسحب تلقائي.',
      },
      {
        id: 'pa4',
        question: 'ما المقصود بإدارة الجلسات المميّزة (PSM)؟',
        options: [
          { id: 'a', text: 'نوع من مديري كلمات المرور', isCorrect: false, explanation: 'PSM ليست مدير كلمات مرور، بل وسيط جلسات وتسجيل لها.' },
          { id: 'b', text: 'وساطة الجلسات المميّزة وتسجيلها لمنع الوصول المباشر إلى الأنظمة الهدف', isCorrect: true, explanation: 'تعمل PSM كوسيط: يتصل المسؤول بها، وهي تتصل بالهدف، وتُسجَّل الجلسة كاملة.' },
          { id: 'c', text: 'بروتوكول شبكي', isCorrect: false, explanation: 'PSM ليست بروتوكولاً شبكياً.' },
          { id: 'd', text: 'نوع من جدران الحماية', isCorrect: false, explanation: 'PSM ليست جدار حماية.' },
        ],
        takeaway: 'تضمن PSM أن الجلسات المميّزة تُوسَّط وتُسجَّل وتخضع للتدقيق.',
      },
      {
        id: 'pa5',
        question: 'ما هو حساب الطوارئ (break-glass)؟',
        options: [
          { id: 'a', text: 'حساب مستخدم عادي', isCorrect: false, explanation: 'حساب الطوارئ حساب خاص للطوارئ، لا حساب عادي.' },
          { id: 'b', text: 'حساب طوارئ يُستخدم عند تعطّل الوصول الطبيعي، بضوابط ومراقبة صارمة', isCorrect: true, explanation: 'حسابات الطوارئ لانقطاع مزود الهوية أو تعطّل السياسات أو إغلاق حساب المسؤول؛ تُضبط وتُراقب بصرامة.' },
          { id: 'c', text: 'نوع من حسابات الخدمة', isCorrect: false, explanation: 'حسابات الطوارئ ليست حسابات خدمة، بل حسابات بشرية للطوارئ.' },
          { id: 'd', text: 'حساب مسؤول مشترك', isCorrect: false, explanation: 'حسابات الطوارئ فردية وليست مشتركة؛ الحسابات المشتركة نمط سيئ في PAM.' },
        ],
        takeaway: 'الطوارئ مخرج مُخطّط ومراقَب ومُختبَر عندما يفشل الوصول الطبيعي.',
      },
    ],
  },
  vendors: {
    title: 'منظومة الموردين',
    questions: [
      {
        id: 'v1',
        question: 'ما هي CyberArk؟',
        options: [
          { id: 'a', text: 'خدمة سحابية لإدارة الهوية', isCorrect: false, explanation: 'CyberArk متخصصة في PAM وليست خدمة IAM سحابية.' },
          { id: 'b', text: 'متخصصة في PAM: الخزنة وإدارة الجلسات والتدوير وتحليلات التهديد المميّز', isCorrect: true, explanation: 'CyberArk من أبرز موردي PAM بمنتجات مثل Vault وPSM وCPM وPTA.' },
          { id: 'c', text: 'خدمة دليل', isCorrect: false, explanation: 'CyberArk ليست خدمة دليل.' },
          { id: 'd', text: 'مورّد جدران حماية', isCorrect: false, explanation: 'CyberArk ليست مورّد جدران حماية.' },
        ],
        takeaway: 'CyberArk في صدارة سوق PAM: خزن، وإدارة جلسات، وتدوير، وتحليلات تهديد.',
      },
      {
        id: 'v2',
        question: 'ما الفرق بين Delinea وBeyondTrust؟',
        options: [
          { id: 'a', text: 'Delinea في PAM وBeyondTrust في IGA', isCorrect: false, explanation: 'كلتاهما من موردي PAM.' },
          { id: 'b', text: 'كلتاهما في PAM لكن بنقاط قوة مختلفة: Delinea (Secret Server) وBeyondTrust (Password Safe)', isCorrect: true, explanation: 'Delinea معروفة بـSecret Server، وBeyondTrust بـPassword Safe وإدارة امتيازات نقاط النهاية.' },
          { id: 'c', text: 'لا يوجد فرق بينهما', isCorrect: false, explanation: 'هما مورّدان مختلفان بمنتجات ونقاط قوة مختلفة.' },
          { id: 'd', text: 'Delinea سحابية فقط وBeyondTrust محلية فقط', isCorrect: false, explanation: 'كلتاهما تقدّم خيارات سحابية ومحلية.' },
        ],
        takeaway: 'كلتاهما في PAM؛ الاختيار يخضع لمتطلباتك لا لشهرة المنتج.',
      },
      {
        id: 'v3',
        question: 'ما هي Microsoft Entra ID؟',
        options: [
          { id: 'a', text: 'منتج PAM', isCorrect: false, explanation: 'Entra ID ليست منتج PAM، بل مزوّد هوية سحابي.' },
          { id: 'b', text: 'مزوّد الهوية السحابي لمايكروسوفت: SSO وMFA والوصول الشرطي وPIM', isCorrect: true, explanation: 'Entra ID (المعروفة سابقاً بـAzure AD) تقدّم SSO وMFA والوصول الشرطي وإدارة الهوية المميّزة.' },
          { id: 'c', text: 'خدمة دليل فقط', isCorrect: false, explanation: 'Entra ID ليست مجرد خدمة دليل، بل منصة هوية سحابية متكاملة.' },
          { id: 'd', text: 'جدار حماية', isCorrect: false, explanation: 'Entra ID ليست جدار حماية.' },
        ],
        takeaway: 'Entra ID هي مزوّد هوية مايكروسوفت السحابي: SSO وMFA ووصول شرطي وPIM.',
      },
      {
        id: 'v4',
        question: 'ما هو AWS IAM Identity Center؟',
        options: [
          { id: 'a', text: 'منتج PAM', isCorrect: false, explanation: 'IAM Identity Center ليست منتج PAM، بل خدمة SSO في AWS.' },
          { id: 'b', text: 'خدمة SSO في AWS: وصول مركزي إلى الحسابات والتطبيقات', isCorrect: true, explanation: 'توفّر IAM Identity Center (المعروفة سابقاً بـAWS SSO) وصولاً مركزياً إلى حسابات AWS وتطبيقات الأعمال.' },
          { id: 'c', text: 'خدمة دليل', isCorrect: false, explanation: 'IAM Identity Center ليست خدمة دليل.' },
          { id: 'd', text: 'نوع من الشبكات الخاصة الافتراضية', isCorrect: false, explanation: 'IAM Identity Center ليست VPN.' },
        ],
        takeaway: 'IAM Identity Center هي وجه إدارة الهوية في AWS: SSO مركزي ومجموعات صلاحيات.',
      },
      {
        id: 'v5',
        question: 'ما هي SailPoint؟',
        options: [
          { id: 'a', text: 'مورّد PAM', isCorrect: false, explanation: 'SailPoint مورّد IGA وليس PAM.' },
          { id: 'b', text: 'مورّد IGA: حوكمة الهوية وطلبات الوصول والتصديقات', isCorrect: true, explanation: 'SailPoint من أبرز موردي IGA بمنتجات مثل IdentityIQ وIdentityNow.' },
          { id: 'c', text: 'مورّد جدران حماية', isCorrect: false, explanation: 'SailPoint ليست مورّد جدران حماية.' },
          { id: 'd', text: 'خدمة IAM سحابية', isCorrect: false, explanation: 'SailPoint ليست خدمة IAM سحابية.' },
        ],
        takeaway: 'SailPoint في صدارة IGA: الحوكمة وطلبات الوصول والتصديقات.',
      },
    ],
  },
  scenarios: {
    title: 'السيناريوهات واستكشاف الأخطاء',
    questions: [
      {
        id: 's1',
        question: 'ما السبب الأكثر شيوعاً لفشل ربط LDAP (bind)؟',
        options: [
          { id: 'a', text: 'زمن استجابة الشبكة', isCorrect: false, explanation: 'زمن الاستجابة ليس السبب الأكثر شيوعاً لفشل الربط.' },
          { id: 'b', text: 'بيانات اعتماد غير صحيحة (الخطأ 49 والرمز الفرعي 52e)', isCorrect: true, explanation: 'أشهر سبب لفشل الربط هو بيانات اعتماد خاطئة: الخطأ 49 مع الرمز الفرعي 52e.' },
          { id: 'c', text: 'فشل تحليل DNS', isCorrect: false, explanation: 'فشل DNS يمنع الاتصال كلياً ولا يظهر كفشل ربط.' },
          { id: 'd', text: 'انتهاء صلاحية الشهادة', isCorrect: false, explanation: 'انتهاء الشهادة يسبب فشل LDAPS وليس الربط البسيط.' },
        ],
        takeaway: 'الخطأ 49 بالرمز 52e يعني بيانات اعتماد غير صحيحة؛ افحص DN الربط وكلمة المرور أولاً.',
      },
      {
        id: 's2',
        question: 'ما الخطوة الأولى في الخروج الطارئ للموظف؟',
        options: [
          { id: 'a', text: 'حذف حساب المستخدم', isCorrect: false, explanation: 'الحذف يمحو الأدلة؛ عطّل الحساب أولاً.' },
          { id: 'b', text: 'تعطيل الحساب وإبطال الجلسات النشطة', isCorrect: true, explanation: 'الخطوة الأولى تعطيل الحساب وإبطال كل الجلسات لمنع أي وصول إضافي.' },
          { id: 'c', text: 'تغيير كلمة مرور المستخدم', isCorrect: false, explanation: 'تغيير كلمة المرور لا يكفي؛ يجب تعطيل الحساب.' },
          { id: 'd', text: 'إبلاغ المدير', isCorrect: false, explanation: 'الإبلاغ مهم لكنه ليس الخطوة الأولى؛ الاحتواء أولاً.' },
        ],
        takeaway: 'الخروج الطارئ: عطّل أولاً، وأبطل الجلسات، ثم حقّق واستعد.',
      },
      {
        id: 's3',
        question: 'ما هو هجوم التفاف التوقيع في SAML (XSW)؟',
        options: [
          { id: 'a', text: 'هجوم على مستوى الشبكة يستهدف نقاط SAML', isCorrect: false, explanation: 'XSW ليس هجوماً شبكياً، بل تلاعب ببنية XML.' },
          { id: 'b', text: 'التلاعب ببنية XML لتأكيد موقّع لتمرير محتوى خبيث', isCorrect: true, explanation: 'يستغل XSW كون التوقيع يغطي جزءاً من المستند فقط، ما يسمح بإدخال محتوى غير موقّع.' },
          { id: 'c', text: 'نوع من التصيّد', isCorrect: false, explanation: 'XSW ليس تصيّداً، بل هجوم تقني على بنية التأكيد.' },
          { id: 'd', text: 'هجوم حجب خدمة', isCorrect: false, explanation: 'XSW ليس هجوم حجب خدمة.' },
        ],
        takeaway: 'تحقّق من بنية التأكيد لا من التوقيع وحده، واستخدم مكتبة تفحص XSW.',
      },
      {
        id: 's4',
        question: 'ما الغرض من حملة تصديق الوصول؟',
        options: [
          { id: 'a', text: 'منح وصول جديد', isCorrect: false, explanation: 'التصديق يراجع الوصول القائم ولا يمنح وصولاً جديداً.' },
          { id: 'b', text: 'مراجعة الوصول القائم دورياً والتصديق على استمرار مبرّريته', isCorrect: true, explanation: 'تضمن حملة التصديق أن منح الوصول ما زالت ضرورية ومناسبة.' },
          { id: 'c', text: 'تزويد مستخدمين جدد', isCorrect: false, explanation: 'التصديق ليس تزويداً، بل مراجعة.' },
          { id: 'd', text: 'تدوير كلمات المرور', isCorrect: false, explanation: 'التصديق لا علاقة له بتدوير كلمات المرور.' },
        ],
        takeaway: 'التصديق هو حلقة الحوكمة: كل منح وصول يُراجع دورياً.',
      },
      {
        id: 's5',
        question: 'ما أول مؤشر على اختراق حساب مميّز؟',
        options: [
          { id: 'a', text: 'تغيير كلمة المرور', isCorrect: false, explanation: 'تغيير كلمة المرور ليس بالضرورة مؤشر اختراق.' },
          { id: 'b', text: 'سلوك دخول شاذ: وقت أو موقع أو نمط غير معتاد', isCorrect: true, explanation: 'المؤشر الأول عادة نشاط شاذ: دخول في وقت أو من موقع أو بنمط غير معتاد.' },
          { id: 'c', text: 'إعادة تشغيل النظام', isCorrect: false, explanation: 'إعادة التشغيل ليست مؤشر اختراق حساب.' },
          { id: 'd', text: 'تحديث برمجي', isCorrect: false, explanation: 'التحديث البرمجي ليس مؤشر اختراق حساب.' },
        ],
        takeaway: 'كشف الشذوذ خط الدفاع الأول: وقت أو موقع أو سلوك غير معتاد.',
      },
    ],
  },
  labs: {
    title: 'المعامل التطبيقية',
    questions: [
      {
        id: 'l1',
        question: 'ما الغرض من إعداد المعمل المنزلي؟',
        options: [
          { id: 'a', text: 'تعلّم البرمجة', isCorrect: false, explanation: 'المعمل مخصص لممارسة إدارة الهوية، لا للبرمجة.' },
          { id: 'b', text: 'بناء بيئة تدريب فيها AD وKeycloak وهوية سحابية للممارسة العملية', isCorrect: true, explanation: 'يوفّر المعمل بيئة آمنة لممارسة مفاهيم إدارة الهوية بأدوات حقيقية.' },
          { id: 'c', text: 'استبدال أنظمة الإنتاج', isCorrect: false, explanation: 'المعمل للتعلم وليس للإنتاج.' },
          { id: 'd', text: 'تعلّم الشبكات', isCorrect: false, explanation: 'المعمل لإدارة الهوية لا للشبكات العامة.' },
        ],
        takeaway: 'المعمل بيئة تدريبك: آمن للكسر وآمن للتعلّم.',
      },
      {
        id: 'l2',
        question: 'ما هو Keycloak؟',
        options: [
          { id: 'a', text: 'منتج PAM', isCorrect: false, explanation: 'Keycloak ليس منتج PAM، بل مزوّد هوية مفتوح المصدر.' },
          { id: 'b', text: 'مزوّد هوية مفتوح المصدر: SSO والاتحاد ووساطة الهوية', isCorrect: true, explanation: 'Keycloak مزوّد هوية مجاني مفتوح المصدر يدعم SAML وOIDC واتحاد LDAP وغيرها.' },
          { id: 'c', text: 'خدمة دليل', isCorrect: false, explanation: 'Keycloak ليس خدمة دليل؛ إنه يتحد مع الأدلة.' },
          { id: 'd', text: 'جدار حماية', isCorrect: false, explanation: 'Keycloak ليس جدار حماية.' },
        ],
        takeaway: 'Keycloak أيسر مزوّد هوية مفتوح المصدر لتعلّم SSO والاتحاد.',
      },
      {
        id: 'l3',
        question: 'فيمَ يُستخدم HashiCorp Vault في المعامل؟',
        options: [
          { id: 'a', text: 'مراقبة الشبكة', isCorrect: false, explanation: 'Vault ليس أداة مراقبة شبكة.' },
          { id: 'b', text: 'إدارة الأسرار: بيانات اعتماد ديناميكية وتشفير وتدقيق', isCorrect: true, explanation: 'يوفّر Vault إدارة الأسرار وبيانات الاعتماد الديناميكية والتشفير كخدمة وسجلات تدقيق.' },
          { id: 'c', text: 'تسجيل الجلسات', isCorrect: false, explanation: 'Vault ليس أداة تسجيل جلسات.' },
          { id: 'd', text: 'إدارة الشهادات فقط', isCorrect: false, explanation: 'Vault يتجاوز إدارة الشهادات بكثير.' },
        ],
        takeaway: 'Vault معيار إدارة الأسرار: بيانات اعتماد ديناميكية وتشفير وتدقيق.',
      },
      {
        id: 'l4',
        question: 'فيمَ يُستخدم Teleport في المعامل؟',
        options: [
          { id: 'a', text: 'إدارة كلمات المرور', isCorrect: false, explanation: 'Teleport ليس مدير كلمات مرور.' },
          { id: 'b', text: 'وصول بلا صلاحيات دائمة: شهادات قصيرة العمر لـSSH وKubernetes', isCorrect: true, explanation: 'يمنح Teleport شهادات قصيرة العمر للوصول إلى البنية التحتية، ما يلغي الصلاحيات الدائمة.' },
          { id: 'c', text: 'مراقبة الشبكة', isCorrect: false, explanation: 'Teleport ليس أداة مراقبة شبكة.' },
          { id: 'd', text: 'إدارة قواعد البيانات', isCorrect: false, explanation: 'Teleport ليس أداة إدارة قواعد بيانات.' },
        ],
        takeaway: 'Teleport يجسّد نمط ZSP الحديث: شهادات مؤقتة بلا وصول دائم.',
      },
      {
        id: 'l5',
        question: 'ما الغرض من معمل محاكاة الاستجابة للحوادث؟',
        options: [
          { id: 'a', text: 'تعلّم البرمجة', isCorrect: false, explanation: 'المعمل للاستجابة للحوادث لا للبرمجة.' },
          { id: 'b', text: 'التدرّب على كشف الحساب المخترق واحتوائه واستئصاله والتعافي منه', isCorrect: true, explanation: 'يمرّ معمل المحاكاة بدورة الاستجابة كاملة على حساب خدمة مخترق.' },
          { id: 'c', text: 'تعلّم الشبكات', isCorrect: false, explanation: 'المعمل للاستجابة للحوادث لا للشبكات.' },
          { id: 'd', text: 'استبدال المراقبة الإنتاجية', isCorrect: false, explanation: 'المعمل للتعلم لا للمراقبة الإنتاجية.' },
        ],
        takeaway: 'تدرّب على الاستجابة في بيئة آمنة لتكون جاهزاً حين تحدث فعلاً.',
      },
    ],
  },
  interviews: {
    title: 'التحضير للمقابلات',
    questions: [
      {
        id: 'i1',
        question: 'ما طريقة STAR للإجابة عن الأسئلة السلوكية؟',
        options: [
          { id: 'a', text: 'إطار تقني لاستكشاف الأخطاء', isCorrect: false, explanation: 'STAR ليس إطاراً تقنياً، بل هيكل إجابة سلوكية.' },
          { id: 'b', text: 'الموقف والمهمة والإجراء والنتيجة: هيكل منظم للإجابة السلوكية', isCorrect: true, explanation: 'تنظّم STAR الإجابة: صف الموقف، ومهمتك، والإجراء الذي اتخذته، والنتيجة.' },
          { id: 'c', text: 'نوع من مخططات الشبكة', isCorrect: false, explanation: 'STAR ليس مخطط شبكة.' },
          { id: 'd', text: 'منهجية برمجية', isCorrect: false, explanation: 'STAR ليست منهجية برمجية.' },
        ],
        takeaway: 'STAR تنظّم إجابتك السلوكية: الموقف، المهمة، الإجراء، النتيجة.',
      },
      {
        id: 'i2',
        question: 'ما أهم ما يجب إظهاره في مقابلة إدارة الهوية؟',
        options: [
          { id: 'a', text: 'التعريفات المحفوظة', isCorrect: false, explanation: 'الحفظ وحده لا يكفي؛ الفهم والتطبيق أهم.' },
          { id: 'b', text: 'الفهم العملي: كيف تطبّق المفاهيم على سيناريوهات واقعية', isCorrect: true, explanation: 'يبحث المحاور عن قدرتك على التطبيق لا على التسميع.' },
          { id: 'c', text: 'معرفة كل الموردين', isCorrect: false, explanation: 'لا تحتاج معرفة كل الموردين؛ العمق في اثنين أفضل من السطحية في الجميع.' },
          { id: 'd', text: 'عدد الشهادات', isCorrect: false, explanation: 'الشهادات تساعد، لكن الفهم العملي أهم.' },
        ],
        takeaway: 'أظهر فهماً عملياً: كيف تطبّق المفاهيم على سيناريوهات حقيقية.',
      },
      {
        id: 'i3',
        question: 'كيف تجيب عن سؤال «ما الفرق بين IAM وPAM؟»',
        options: [
          { id: 'a', text: 'IAM للمستخدمين وPAM للمسؤولين', isCorrect: true, explanation: 'IAM تدير وصول المستخدمين عامة، وPAM تدير الوصول المميّز (المسؤولون وجذر وحسابات الخدمة).' },
          { id: 'b', text: 'لا يوجد فرق بينهما', isCorrect: false, explanation: 'IAM وPAM مترابطتان لكنهما مختلفتان.' },
          { id: 'c', text: 'IAM للسحابة وPAM للأنظمة المحلية', isCorrect: false, explanation: 'كلاهما ينطبق على السحابة والمحلي.' },
          { id: 'd', text: 'IAM مجموعة فرعية من PAM', isCorrect: false, explanation: 'PAM هي المجموعة الفرعية من IAM.' },
        ],
        takeaway: 'IAM التخصص الواسع، وPAM المجموعة الفرعية المتخصصة في الوصول المميّز.',
      },
      {
        id: 'i4',
        question: 'ما أفضل طريقة للتحضير لمقابلة تقنية؟',
        options: [
          { id: 'a', text: 'حفظ كل التعريفات', isCorrect: false, explanation: 'الحفظ لا يكفي؛ الفهم والتطبيق أهم.' },
          { id: 'b', text: 'التدرّب على الشرح بصوت مسموع، وحل السيناريوهات، وبناء معامل عملية', isCorrect: true, explanation: 'التدرّب النشط (الشرح والسيناريوهات والمعامل) أنفع بكثير من الحفظ السلبي.' },
          { id: 'c', text: 'قراءة الوثائق فقط', isCorrect: false, explanation: 'القراءة نشاط سلبي؛ التطبيق أنفع.' },
          { id: 'd', text: 'مشاهدة الفيديوهات فقط', isCorrect: false, explanation: 'المشاهدة نشاط سلبي؛ التطبيق أنفع.' },
        ],
        takeaway: 'التدرّب النشط يتغلب على الحفظ: اشرح بصوت مسموع، وحل سيناريوهات، وابنِ معاملاً.',
      },
      {
        id: 'i5',
        question: 'ماذا تفعل إذا لم تعرف إجابة سؤال في المقابلة؟',
        options: [
          { id: 'a', text: 'اختلاق إجابة', isCorrect: false, explanation: 'الاختلاق أسوأ من الاعتراف بعدم المعرفة.' },
          { id: 'b', text: 'كن صادقاً، واشرح ما تعرفه، ووضّح كيف ستصل إلى الإجابة', isCorrect: true, explanation: 'الصدق ومنهجية التفكير أنفع من تخمين.' },
          { id: 'c', text: 'تغيير الموضوع', isCorrect: false, explanation: 'تغيير الموضوع تهرب غير مفيد.' },
          { id: 'd', text: 'الصمت', isCorrect: false, explanation: 'الصمت لا يساعد؛ تفاعل مع السؤال.' },
        ],
        takeaway: 'الصدق ومنهجية الحل أفضل من التخمين؛ أظهر كيف ستصل إلى الإجابة.',
      },
    ],
  },
  careers: {
    title: 'الشهادات والمسار المهني',
    questions: [
      {
        id: 'c1',
        question: 'ما المسار المهني المعتاد في إدارة الهوية؟',
        options: [
          { id: 'a', text: 'محلل، ثم مهندس، ثم مهندس أول، ثم معماري، ثم مدير', isCorrect: true, explanation: 'السلّم المهني المعتاد: محلل، مهندس، مهندس أول، معماري، مدير.' },
          { id: 'b', text: 'مهندس، ثم محلل، ثم معماري', isCorrect: false, explanation: 'المسار يبدأ من المحلل إلى المهندس لا العكس.' },
          { id: 'c', text: 'مدير، ثم معماري، ثم مهندس', isCorrect: false, explanation: 'المسار تصاعدي لا تنازلي.' },
          { id: 'd', text: 'لا يوجد مسار معتاد', isCorrect: false, explanation: 'المسارات تختلف، لكن ثمة نمط تصاعدي شائع.' },
        ],
        takeaway: 'سلّم إدارة الهوية: محلل، مهندس، مهندس أول، معماري، مدير.',
      },
      {
        id: 'c2',
        question: 'ما أهم عامل في التفاوض على الراتب؟',
        options: [
          { id: 'a', text: 'التهديد بالاستقالة', isCorrect: false, explanation: 'التهديد يأتي بنتيجة عكسية؛ البيانات والقيمة أنفع.' },
          { id: 'b', text: 'البحث: معرفة سعر السوق لدورك وخبرتك وموقعك', isCorrect: true, explanation: 'التفاوض المبني على البيانات هو الأنفع؛ اعرف قيمتك السوقية.' },
          { id: 'c', text: 'قبول العرض الأول', isCorrect: false, explanation: 'قبول العرض الأول يترك مالاً على الطاولة.' },
          { id: 'd', text: 'طلب أعلى رقم ممكن', isCorrect: false, explanation: 'المبالغة بلا مبرر قد تنعكس سلباً.' },
        ],
        takeaway: 'البحث أساس التفاوض الفعّال: اعرف قيمتك السوقية.',
      },
      {
        id: 'c3',
        question: 'ما هي شهادة SC-300؟',
        options: [
          { id: 'a', text: 'شهادة PAM', isCorrect: false, explanation: 'SC-300 ليست شهادة PAM، بل شهادة مايكروسوفت لإدارة الهوية والوصول.' },
          { id: 'b', text: 'شهادة مايكروسوفت لمسؤول الهوية والوصول', isCorrect: true, explanation: 'تغطي SC-300 (Microsoft Identity and Access Administrator) Entra ID والهوية الهجينة وإدارة الوصول.' },
          { id: 'c', text: 'شهادة برمجة', isCorrect: false, explanation: 'SC-300 ليست شهادة برمجة.' },
          { id: 'd', text: 'شهادة شبكات', isCorrect: false, explanation: 'SC-300 ليست شهادة شبكات.' },
        ],
        takeaway: 'SC-300 هي شهادة مايكروسوفت لمسؤول الهوية والوصول.',
      },
      {
        id: 'c4',
        question: 'ما أفضل طريقة لبناء ملف أعمال لدور في إدارة الهوية؟',
        options: [
          { id: 'a', text: 'سرد كل الشهادات', isCorrect: false, explanation: 'الشهادات وحدها ليست ملف أعمال؛ المشاريع تُظهر المهارة.' },
          { id: 'b', text: 'بناء مشاريع عملية وتوثيقها على GitHub والكتابة عمّا تعلّمته', isCorrect: true, explanation: 'ملف الأعمال الموثّق يُظهر المهارات العملية أفضل من قائمة شهادات.' },
          { id: 'c', text: 'نسخ مشاريع الآخرين', isCorrect: false, explanation: 'النسخ لا يُظهر مهاراتك.' },
          { id: 'd', text: 'سرد الخبرة العملية فقط', isCorrect: false, explanation: 'الخبرة مهمة، لكن المشاريع تُظهر المبادرة والعمق.' },
        ],
        takeaway: 'ابنِ مشاريع ووثّقها واكتب عنها؛ ملف الأعمال يُظهر المهارة.',
      },
      {
        id: 'c5',
        question: 'ما أهم ما يجب تضمينه في سيرة ذاتية لدور إدارة الهوية؟',
        options: [
          { id: 'a', text: 'كل وظيفة عملتها يوماً', isCorrect: false, explanation: 'الصلة أهم من الاكتمال.' },
          { id: 'b', text: 'تقنيات محددة وأرقام حجم ونتائج مشاريع', isCorrect: true, explanation: 'التقنيات والأرقام والنتائج القابلة للقياس تجعل الادعاءات موثوقة.' },
          { id: 'c', text: 'صورة شخصية', isCorrect: false, explanation: 'الصورة غير ذات صلة وقد تُدخل تحيزاً.' },
          { id: 'd', text: 'الهوايات الشخصية', isCorrect: false, explanation: 'الهوايات غير ذات صلة بسيرة إدارة الهوية.' },
        ],
        takeaway: 'التقنيات والأرقام ونتائج المشاريع هي ما يجعل سيرتك موثوقة.',
      },
    ],
  },
};
