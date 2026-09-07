import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Drawio from '../components/Drawio';
import topicMap from '!!raw-loader!../../static/diagrams/topic-map.drawio';

const path = [
  {
    to: '/docs/fundamentals',
    title: 'IAM Fundamentals',
    time: '6-8 evenings',
    why: 'The vocabulary and models every later section assumes: AAA, the identity lifecycle, least privilege, zero trust.',
  },
  {
    to: '/docs/protocols-iga',
    title: 'Identity Protocols & IGA',
    time: '3-4 weeks',
    why: 'The heaviest section. LDAP, SAML, OAuth, OIDC, and SCIM are the machinery every vendor and every interview question builds on.',
  },
  {
    to: '/docs/pam-core',
    title: 'PAM Core',
    time: '2-3 weeks',
    why: 'Privileged access sits on top of IAM concepts: vaulting, session management, JIT, and the full PAM architecture.',
  },
  {
    to: '/docs/vendors',
    title: 'Vendor Landscape',
    time: '1-2 weeks',
    why: 'Evaluation only makes sense once you know what the products do underneath; this section assumes the first three.',
  },
  {
    to: '/docs/scenarios',
    title: 'Scenarios & Troubleshooting',
    time: '2 weeks',
    why: 'Concrete failure modes tie the theory back to operations, and the interview answers draw on these cases.',
  },
  {
    to: '/docs/labs',
    title: 'Hands-On Labs',
    time: '2-4 weeks, in parallel',
    why: 'Six projects that prove the material on free tools. Run these alongside the reading; the evidence is worth more than the notes.',
  },
  {
    to: '/docs/interviews',
    title: 'Interview Preparation',
    time: '2-4 weeks, at the end',
    why: 'Question banks with full answers, grounded in everything above, plus STAR templates for the behavioral round.',
  },
  {
    to: '/docs/careers',
    title: 'Certifications & Career',
    time: 'A weekend to plan; exam prep separately',
    why: 'Verified certification facts and the two career tracks, with an honest look at the Middle East and Egypt markets.',
  },
];

const sections = [
  {
    to: '/docs/fundamentals',
    title: 'IAM Fundamentals',
    desc: 'What IAM is, the AAA model, the identity lifecycle, authentication and authorization mechanics.',
  },
  {
    to: '/docs/protocols-iga',
    title: 'Identity Protocols & IGA',
    desc: 'LDAP, SAML, OAuth, OIDC, SCIM, and the governance machinery around them.',
  },
  {
    to: '/docs/pam-core',
    title: 'PAM Core',
    desc: 'Privileged access: vaulting, session management, just-in-time access, and the complete PAM architecture.',
  },
  {
    to: '/docs/vendors',
    title: 'Vendor Landscape',
    desc: 'CyberArk, Delinea, BeyondTrust, the Microsoft stack, cloud IAM, and governance tools.',
  },
  {
    to: '/docs/scenarios',
    title: 'Scenarios & Troubleshooting',
    desc: 'Real workflows, failure modes, and incident response for identity systems.',
  },
  {
    to: '/docs/interviews',
    title: 'Interview Preparation',
    desc: 'Conceptual, protocol, scenario, and architecture questions with full answers.',
  },
  {
    to: '/docs/careers',
    title: 'Certifications & Career',
    desc: 'Verified certification facts and the IAM and PAM career tracks.',
  },
  {
    to: '/docs/labs',
    title: 'Hands-On Labs & Projects',
    desc: 'A home lab with Active Directory, Keycloak, and cloud IAM, built on free and trial tools.',
  },
];

export default function Home() {
  return (
    <Layout
      title="Home"
      description="A working reference on identity and access management, privileged access management, and the security career track, built section by section."
    >
      <main className="home-main">
        <div className="home-intro">
          <h1>IAM &amp; PAM Reference</h1>
          <p className="home-lede">
            A working reference on identity and access management, written out in
            full rather than skimmed: the fundamentals, the protocols, privileged
            access, the vendor landscape, real-world troubleshooting, interview
            preparation, certifications, and hands-on labs. Built as a learning
            system, so every page assumes the reader is a practitioner or a
            candidate, not a browser.
          </p>
        </div>

        <section aria-labelledby="path-heading">
          <h2 id="path-heading" className="home-block-heading">
            Suggested learning path
          </h2>
          <p className="home-block-lede">
            The sections build on each other, so this order minimizes backtracking.
            The time estimates are rough, based on part-time evening study at a
            reading-plus-note-taking pace; they are not survey data. Go slower on
            the protocols section, faster on the vendor section.
          </p>
          <ol className="home-path">
            {path.map((step, i) => (
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
            How the sections fit together
          </h2>
          <p className="home-block-lede">
            Fundamentals feed everything; the protocols and PAM sections are the
            engine; scenarios and the labs convert that into defensible answers;
            the career section is where it pays off. The labs run in parallel with
            the reading and feed the interview answers with evidence.
          </p>
          <Drawio content={topicMap} />
          <p className="diagram-caption">
            The site topic map: how each section depends on the ones before it.
            Edit or download this diagram:{' '}
            <a href="/diagrams/topic-map.drawio">topic-map.drawio</a>.
          </p>
        </section>

        <section aria-labelledby="video-heading">
          <h2 id="video-heading" className="home-block-heading">
            The series in two minutes
          </h2>
          <p className="home-block-lede">
            A narrated walkthrough of the whole discipline, animated from the
            same diagrams the site uses. The full series covers protocols, PAM,
            vendors, scenarios, compliance, labs, and the career track.
          </p>
          <video
            className="video-embed"
            controls
            preload="none"
            poster="/videos/part1-poster.png"
          >
            <source src="/videos/part1-what-is-iam-pam.mp4" type="video/mp4" />
          </video>
        </section>

        <section aria-labelledby="sections-heading">
          <h2 id="sections-heading" className="home-block-heading">
            What the site covers
          </h2>
          <nav className="home-sections" aria-label="Site sections">
            {sections.map((section) => (
              <Link className="home-section" to={section.to} key={section.to}>
                <h3>{section.title}</h3>
                <p>{section.desc}</p>
              </Link>
            ))}
          </nav>
        </section>

        <section className="home-career" aria-labelledby="career-heading">
          <h2 id="career-heading" className="home-block-heading">
            Where this leads
          </h2>
          <p>
            If the point is employment, start with the{' '}
            <Link to="/docs/careers">
              certifications and career section
            </Link>
            : verified exam facts, the IAM and PAM tracks, and an honest read on
            the Gulf and Egyptian markets. The{' '}
            <Link to="/docs/interviews">interview preparation</Link> section then
            turns the rest of the site into answers.
          </p>
        </section>
      </main>
    </Layout>
  );
}