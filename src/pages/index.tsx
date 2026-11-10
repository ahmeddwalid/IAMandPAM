import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Drawio from '../components/Drawio';
import LearningTrack from '../components/LearningTrack';
import topicMap from '!!raw-loader!../../static/diagrams/topic-map.drawio';

const path = [
  {
    to: '/docs/fundamentals/',
    title: 'IAM Fundamentals',
    time: '6-8 evenings',
    why: 'The vocabulary and models every later section assumes: AAA, the identity lifecycle, least privilege, zero trust.',
  },
  {
    to: '/docs/protocols-iga/',
    title: 'Identity Protocols & IGA',
    time: '3-4 weeks',
    why: 'The heaviest section. LDAP, SAML, OAuth, OIDC, and SCIM are the machinery every vendor and every interview question builds on.',
  },
  {
    to: '/docs/pam-core/',
    title: 'PAM Core',
    time: '2-3 weeks',
    why: 'Privileged access sits on top of IAM concepts: vaulting, session management, JIT, and the full PAM architecture.',
  },
  {
    to: '/docs/vendors/',
    title: 'Vendor Landscape',
    time: '1-2 weeks',
    why: 'Evaluation only makes sense once you know what the products do underneath; this section assumes the first three.',
  },
  {
    to: '/docs/scenarios/',
    title: 'Scenarios & Troubleshooting',
    time: '2 weeks',
    why: 'Concrete failure modes tie the theory back to operations, and the interview answers draw on these cases.',
  },
  {
    to: '/docs/labs/',
    title: 'Hands-On Labs',
    time: '2-4 weeks, in parallel',
    why: 'Seventeen projects that prove the material on free and open-source tools. Run these alongside the reading; the evidence is worth more than the notes.',
  },
  {
    to: '/docs/interviews/',
    title: 'Interview Preparation',
    time: '2-4 weeks, at the end',
    why: 'Question banks with full answers, grounded in everything above, plus STAR templates for the behavioral round.',
  },
  {
    to: '/docs/careers/',
    title: 'Certifications & Career',
    time: 'A weekend to plan; exam prep separately',
    why: 'Verified certification facts and the two career tracks, with an honest look at the Middle East and Egypt markets.',
  },
];

const sections = [
  {
    to: '/docs/fundamentals/',
    title: 'IAM Fundamentals',
    desc: 'What IAM is, the AAA model, the identity lifecycle, authentication and authorization mechanics.',
  },
  {
    to: '/docs/protocols-iga/',
    title: 'Identity Protocols & IGA',
    desc: 'LDAP, SAML, OAuth, OIDC, SCIM, and the governance machinery around them.',
  },
  {
    to: '/docs/pam-core/',
    title: 'PAM Core',
    desc: 'Privileged access: vaulting, session management, just-in-time access, and the complete PAM architecture.',
  },
  {
    to: '/docs/vendors/',
    title: 'Vendor Landscape',
    desc: 'CyberArk, Delinea, BeyondTrust, the Microsoft stack, cloud IAM, and governance tools.',
  },
  {
    to: '/docs/scenarios/',
    title: 'Scenarios & Troubleshooting',
    desc: 'Real workflows, failure modes, and incident response for identity systems.',
  },
  {
    to: '/docs/interviews/',
    title: 'Interview Preparation',
    desc: 'Conceptual, protocol, scenario, and architecture questions with full answers.',
  },
  {
    to: '/docs/careers/',
    title: 'Certifications & Career',
    desc: 'Verified certification facts and the IAM and PAM career tracks.',
  },
  {
    to: '/docs/labs/',
    title: 'Hands-On Labs & Projects',
    desc: 'A home lab with Active Directory, Keycloak, and cloud IAM, built on free and trial tools.',
  },
];

const pathAr = [
  {
    to: '/docs/fundamentals/',
    title: 'أساسيات إدارة الهوية والوصول (IAM)',
    time: '6–8 فترات مسائية',
    why: 'المصطلحات والمفاهيم التي تبنى عليها بقية الأقسام: نموذج AAA، دورة حياة الهوية، مبدأ الامتياز الأقل، وبنية الثقة المعدومة.',
  },
  {
    to: '/docs/protocols-iga/',
    title: 'بروتوكولات الهوية وحوكمتها (IGA)',
    time: '3–4 أسابيع',
    why: 'القسم الأهم فنياً: LDAP و SAML و OAuth و OIDC و SCIM هي المحركات الأساسية لكافة الأنظمة والمقابلات المهنية.',
  },
  {
    to: '/docs/pam-core/',
    title: 'أساسيات إدارة الوصول المميّز (PAM)',
    time: '2–3 أسابيع',
    why: 'الحسابات ذات الامتيازات العالية: الخزائن الرقمية، إدارة الجلسات، الوصول في الوقت المناسب (JIT)، وبنية PAM الشاملة.',
  },
  {
    to: '/docs/vendors/',
    title: 'منظومة الموردين والتقنيات',
    time: '1–2 أسابيع',
    why: 'فهم الفروقات التقنية بين CyberArk و Delinea و BeyondTrust ومنظومة Microsoft وحلول السحابة بعد فهم الأساسيات.',
  },
  {
    to: '/docs/scenarios/',
    title: 'السيناريوهات العملية واستكشاف الأخطاء',
    time: '2 أسبوعان',
    why: 'ربط المعرفة النظرية بالتشغيل الفعلي وحوادث الاختراق واستكشاف أخطاء الشهادات والبروتوكولات.',
  },
  {
    to: '/docs/labs/',
    title: 'المختبرات والمشاريع التطبيقية',
    time: '2–4 أسابيع بالتوازي',
    why: 'مشاريع عملية مثبتة بأدوات مجانية ومفتوحة المصدر تثبت المعرفة العملية وتبني معرض أعمالك التقني.',
  },
  {
    to: '/docs/interviews/',
    title: 'التحضير للمقابلات المهنية',
    time: '2–4 أسابيع في الختام',
    why: 'بنك أسئلة شامل مع إجابات نموذجية معللة، ونماذج STAR للمقابلات السلوكية.',
  },
  {
    to: '/docs/careers/',
    title: 'الشهادات والمسار المهني',
    time: 'عطلة نهاية أسبوع للتخطيط',
    why: 'بيانات موثقة للشهادات الاحترافية ومسارات التطور الوظيفي مع تركيز خاص على سوق الخليج العربي ومصر.',
  },
];

const sectionsAr = [
  {
    to: '/docs/fundamentals/',
    title: 'أساسيات إدارة الهوية والوصول (IAM)',
    desc: 'مفهوم IAM، نموذج AAA، دورة حياة الهوية، وآليات المصادقة والترخيص الحديثة.',
  },
  {
    to: '/docs/protocols-iga/',
    title: 'بروتوكولات الهوية وحوكمتها (IGA)',
    desc: 'دراسة متعمقة لـ LDAP و SAML و OAuth و OIDC و SCIM وآليات الحوكمة والفصل بين المهام.',
  },
  {
    to: '/docs/pam-core/',
    title: 'إدارة الوصول المميّز (PAM)',
    desc: 'حماية الحسابات الحساسة: الخزائن، إدارة الجلسات، الوصول الفوري، وبنية الثقة المعدومة.',
  },
  {
    to: '/docs/vendors/',
    title: 'منظومة الموردين والتقنيات',
    desc: 'مقارنات تقنية وبنى معمارية لـ CyberArk و Delinea و BeyondTrust و Microsoft وحلول السحابة.',
  },
  {
    to: '/docs/scenarios/',
    title: 'السيناريوهات العملية واستكشاف الأخطاء',
    desc: 'إجراءات التشغيل، الاستجابة للحوادث، واستكشاف أخطاء بروتوكولات الهوية عملياً.',
  },
  {
    to: '/docs/interviews/',
    title: 'التحضير للمقابلات المهنية',
    desc: 'أسئلة مفاهيمية وبروتوكولية وسيناريوهات معمارية مع إجابات فنية دقيقة.',
  },
  {
    to: '/docs/careers/',
    title: 'الشهادات والمسار المهني',
    desc: 'تحليل دقيق لشهادات الأمان ومسارات الترقي المهني في أسواق العمل الإقليمية والعالمية.',
  },
  {
    to: '/docs/labs/',
    title: 'المختبرات والمشاريع التطبيقية',
    desc: 'مختبرات متكاملة تشمل Active Directory و Keycloak والربط السحابي وإدارة الأسرار.',
  },
];

export default function Home() {
  const { i18n } = useDocusaurusContext();
  const isAr = i18n.currentLocale === 'ar';

  const currentPath = isAr ? pathAr : path;
  const currentSections = isAr ? sectionsAr : sections;

  return (
    <Layout
      title={isAr ? 'الرئيسية' : 'Home'}
      description={
        isAr
          ? 'مرجع تقني وهندسي متكامل في إدارة الهوية والوصول (IAM) وإدارة الوصول المميّز (PAM) والمسار المهني في الأمن السيبراني.'
          : 'A working reference on identity and access management, privileged access management, and the security career track, built section by section.'
      }
    >
      <main className="home-main">
        <div className="home-intro">
          <h1>{isAr ? 'مرجع إدارة الهوية والوصول (IAM & PAM)' : 'IAM & PAM Reference'}</h1>
          <p className="home-lede">
            {isAr
              ? 'دليل مرجعي وهندسي شامل في إدارة الهوية والوصول، مكتوب بأسلوب تطبيقي مباشر بعيداً عن العموميات: الأساسيات، البروتوكولات، الوصول المميّز، منظومة الموردين، استكشاف الأخطاء، المقابلات المهنية، الشهادات الاحترافية، والمختبرات العملية.'
              : 'A working reference on identity and access management, written out in full rather than skimmed: the fundamentals, the protocols, privileged access, the vendor landscape, real-world troubleshooting, interview preparation, certifications, and hands-on labs. Built as a learning system, so every page assumes the reader is a practitioner or a candidate, not a browser.'}
          </p>
        </div>

        {/* Role-Based Learning Tracks */}
        <section aria-labelledby="tracks-heading">
          <LearningTrack />
        </section>

        <section aria-labelledby="path-heading">
          <h2 id="path-heading" className="home-block-heading">
            {isAr ? 'المسار التعليمي المقترح' : 'Suggested learning path'}
          </h2>
          <p className="home-block-lede">
            {isAr
              ? 'تم بناء الأقسام لتتكامل تدريجياً، بحيث يقلل هذا الترتيب الحاجة للرجوع إلى الوراء. التقديرات الزمنية تقريبية للدراسة المسائية الجزئية.'
              : 'The sections build on each other, so this order minimizes backtracking. The time estimates are rough, based on part-time evening study at a reading-plus-note-taking pace; they are not survey data. Go slower on the protocols section, faster on the vendor section.'}
          </p>
          <ol className="home-path">
            {currentPath.map((step, i) => (
              <li key={step.to} className="home-path-step">
                <Link to={step.to}>
                  {i + 1}. {step.title}
                </Link>
                <span className="home-path-time">{step.time}</span>
                <p>{step.why}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="map-heading">
          <h2 id="map-heading" className="home-block-heading">
            {isAr ? 'خارطة ترابط مواضيع المرجع' : 'How the sections fit together'}
          </h2>
          <p className="home-block-lede">
            {isAr
              ? 'الأساسيات تدعم كافة المواضيع؛ وقسما البروتوكولات و PAM هما القلب النابض؛ والسيناريوهات والمختبرات تحول ذلك إلى إجابات وحلول دفاعية عملية؛ والمسار المهني هو الثمرة.'
              : 'Fundamentals feed everything; the protocols and PAM sections are the engine; scenarios and the labs convert that into defensible answers; the career section is where it pays off. The labs run in parallel with the reading and feed the interview answers with evidence.'}
          </p>
          <Drawio content={topicMap} />
          <p className="diagram-caption">
            {isAr ? (
              <>
                خارطة موضوعات الموقع: كيفية اعتماد كل قسم على الأقسام السابقة له. تحميل وتعديل المخطط:{' '}
                <a href="/diagrams/topic-map.drawio">topic-map.drawio</a>.
              </>
            ) : (
              <>
                The site topic map: how each section depends on the ones before it. Edit or download this diagram:{' '}
                <a href="/diagrams/topic-map.drawio">topic-map.drawio</a>.
              </>
            )}
          </p>
        </section>

        <section aria-labelledby="video-heading">
          <h2 id="video-heading" className="home-block-heading">
            {isAr ? 'الملخص المرئي للمرجع' : 'The series in two minutes'}
          </h2>
          <p className="home-block-lede">
            {isAr
              ? 'استعراض سردي شامل لتخصص إدارة الهوية والوصول، مستوحى من المخططات الهندسية المعتمدة في الموقع.'
              : 'A narrated walkthrough of the whole discipline, animated from the same diagrams the site uses. The full series covers protocols, PAM, vendors, scenarios, compliance, labs, and the career track.'}
          </p>
          <video
            className="video-embed"
            controls
            preload="none"
            poster="/videos/part1-poster.png"
          >
            <source src="/videos/part1-what-is-iam-pam.mp4" type="video/mp4" />
          </video>
          <p>
            <Link className="home-inline-link" to="/docs/videos/">
              {isAr ? 'استعرض السلسلة المرئية كاملة (عشر حلقات)' : 'Watch the ten-episode series'}
            </Link>
          </p>
        </section>

        <section aria-labelledby="sections-heading">
          <h2 id="sections-heading" className="home-block-heading">
            {isAr ? 'محتويات المرجع' : 'What the site covers'}
          </h2>
          <nav className="home-sections" aria-label="Site sections">
            {currentSections.map((section) => (
              <Link className="home-section" to={section.to} key={section.to}>
                <h3>{section.title}</h3>
                <p>{section.desc}</p>
              </Link>
            ))}
          </nav>
        </section>

        <section className="home-career" aria-labelledby="career-heading">
          <h2 id="career-heading" className="home-block-heading">
            {isAr ? 'الآفاق والمسار المهني' : 'Where this leads'}
          </h2>
          <p>
            {isAr ? (
              <>
                إذا كان هدفك التوظيف والانتقال المهني، ابدأ بـ{' '}
                <Link to="/docs/careers/">قسم الشهادات والمسار المهني</Link>: معلومات دقيقة ومحدثة عن الاختبارات، ومساري
                تطور IAM و PAM، وقراءة واقعية لسوق العمل في الخليج ومصر. بعد ذلك، يساعدك{' '}
                <Link to="/docs/interviews/">قسم التحضير للمقابلات</Link> في صياغة الإجابات بثقة واحترافية.
              </>
            ) : (
              <>
                If the point is employment, start with the{' '}
                <Link to="/docs/careers/">certifications and career section</Link>: verified exam facts, the IAM and PAM
                tracks, and an honest read on the Gulf and Egyptian markets. The{' '}
                <Link to="/docs/interviews/">interview preparation</Link> section then turns the rest of the site into
                answers.
              </>
            )}
          </p>
        </section>
      </main>
    </Layout>
  );
}