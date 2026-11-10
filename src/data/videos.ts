export interface SeriesVideo {
  slug: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  duration: string;
  language: 'en' | 'ar';
  section: {label: string; labelAr: string; to: string};
}

// Videos are release assets, not site files. The Pages deployment times out
// syncing an artifact that carries several hundred megabytes of media, so the
// MP4s live on the `video-series-v1` release and only the posters ship with the
// site. Rebuild them with scripts/encode-series.sh, publish with
// scripts/publish-series.sh.
export const VIDEO_BASE =
  'https://github.com/ahmeddwalid/IAMandPAM/releases/download/video-series-v1';

export const SERIES: SeriesVideo[] = [
  {
    slug: 'iam-enterprise-scale',
    title: 'IAM at Enterprise Scale',
    titleAr: 'إدارة الهوية على نطاق المؤسسة',
    description:
      'What changes between one directory and an estate of many applications, clouds, and tenants, and why the identity layer becomes the control plane.',
    descriptionAr:
      'ما يتغير بين دليل واحد وبيئة تضم تطبيقات وسحابات ومستأجرين متعددين، ولماذا تصبح طبقة الهوية مستوى التحكم.',
    duration: '8:37',
    language: 'en',
    section: {
      label: 'IAM Architecture',
      labelAr: 'بنية إدارة الهوية',
      to: '/docs/protocols-iga/iam-architecture/',
    },
  },
  {
    slug: 'iam-stack',
    title: 'The IAM Stack',
    titleAr: 'طبقات منصة الهوية',
    description:
      'The layers a working identity platform is built from: directory, federation, provisioning, governance, and privileged access.',
    descriptionAr:
      'الطبقات التي تُبنى منها منصة الهوية العاملة: الدليل، والاتحاد، والتزويد، والحوكمة، والوصول المميّز.',
    duration: '8:05',
    language: 'en',
    section: {label: 'Identity Protocols & IGA', labelAr: 'بروتوكولات الهوية وحوكمتها', to: '/docs/protocols-iga/'},
  },
  {
    slug: 'zero-trust',
    title: 'Zero Trust Architecture',
    titleAr: 'بنية الثقة المعدومة',
    description:
      'Where identity sits in a zero trust design, and what continuous verification changes about the decision to allow access.',
    descriptionAr:
      'موقع الهوية في تصميم الثقة المعدومة، وما يغيّره التحقق المستمر في قرار السماح بالوصول.',
    duration: '10:40',
    language: 'en',
    section: {label: 'Zero Trust IAM', labelAr: 'الثقة المعدومة', to: '/docs/pam-core/zero-trust-iam/'},
  },
  {
    slug: 'vendor-fit',
    title: 'Choosing an Identity Stack',
    titleAr: 'اختيار منظومة الهوية',
    description:
      'What separates the vendors covered on this site, and how to match a platform to an environment rather than to a feature list.',
    descriptionAr:
      'ما يميز الموردين الذين يغطيهم هذا المرجع، وكيف تُطابق المنصة مع بيئة العمل لا مع قائمة الميزات.',
    duration: '7:22',
    language: 'en',
    section: {label: 'Vendor Landscape', labelAr: 'منظومة الموردين', to: '/docs/vendors/'},
  },
  {
    slug: 'identity-blueprint',
    title: 'Matching the Stack to the Role',
    titleAr: 'مطابقة المنظومة مع الدور',
    description:
      'How the right identity stack differs across roles and environments, from a solo administrator to a regulated enterprise.',
    descriptionAr:
      'كيف تختلف منظومة الهوية المناسبة باختلاف الأدوار والبيئات، من مسؤول واحد إلى مؤسسة منظمة.',
    duration: '6:11',
    language: 'en',
    section: {label: 'Certifications & Career', labelAr: 'الشهادات والمسار المهني', to: '/docs/careers/'},
  },
  {
    slug: 'iam-workflow',
    title: 'The IAM Workflow',
    titleAr: 'مسار عمل الهوية',
    description:
      'Where identity work actually lands: requests, approvals, provisioning, review, and the handoffs between them.',
    descriptionAr:
      'أين تستقر أعمال الهوية فعلاً: الطلبات، والموافقات، والتزويد، والمراجعة، والتسليم بينها.',
    duration: '6:44',
    language: 'en',
    section: {label: 'Identity Governance', labelAr: 'حوكمة الهوية', to: '/docs/protocols-iga/iga/'},
  },
  {
    slug: 'scenarios-troubleshooting',
    title: 'Scenarios and Troubleshooting',
    titleAr: 'السيناريوهات واستكشاف الأخطاء',
    description:
      'The failure modes that generate most identity tickets, and how the playbooks on this site work through them.',
    descriptionAr:
      'أعطال الهوية التي تولّد معظم التذاكر، وكيف تتعامل الأدلة التشغيلية في هذا المرجع معها.',
    duration: '6:07',
    language: 'en',
    section: {label: 'Scenarios & Troubleshooting', labelAr: 'السيناريوهات واستكشاف الأخطاء', to: '/docs/scenarios/'},
  },
  {
    slug: 'hands-on-labs',
    title: 'Hands-On Labs',
    titleAr: 'المعامل التطبيقية',
    description:
      'What the lab track builds and in what order, from Active Directory and Keycloak through Vault, Teleport, and the incident response simulation.',
    descriptionAr:
      'ما يبنيه مسار المعامل وبأي ترتيب، من Active Directory وKeycloak إلى Vault وTeleport ومحاكاة الاستجابة للحوادث.',
    duration: '5:09',
    language: 'en',
    section: {label: 'Hands-On Labs', labelAr: 'المعامل التطبيقية', to: '/docs/labs/'},
  },
  {
    slug: 'interview-preparation',
    title: 'Interview Preparation',
    titleAr: 'التحضير للمقابلات',
    description:
      'How the answer frameworks on this site are meant to be used, and what an interviewer is listening for in each part.',
    descriptionAr:
      'كيف تُستخدم أطر الإجابة في هذا المرجع، وما يستمع إليه المحاور في كل جزء.',
    duration: '4:26',
    language: 'en',
    section: {label: 'Interview Preparation', labelAr: 'التحضير للمقابلات', to: '/docs/interviews/'},
  },
  {
    slug: 'identity-security-ar',
    title: 'Identity Security Overview (Arabic)',
    titleAr: 'فك شفرة أمن الهوية',
    description:
      'An Arabic overview of the discipline: authentication, authorization, the identity lifecycle, and what changes when the account is privileged.',
    descriptionAr:
      'نظرة عامة بالعربية على التخصص: المصادقة، والترخيص، ودورة حياة الهوية، وما يتغير عندما يكون الحساب مميّزاً.',
    duration: '8:04',
    language: 'ar',
    section: {label: 'IAM Fundamentals', labelAr: 'أساسيات إدارة الهوية', to: '/docs/fundamentals/'},
  },
];
