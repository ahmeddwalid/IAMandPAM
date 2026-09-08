import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'IAM & PAM Reference',
  tagline:
    'Identity and access management, privileged access management, and the security career track',
  favicon: 'img/favicon.svg',

  // Placeholder until the site has a production URL (see PROGRESS.md).
  url: 'https://ahmeddwalid.me',
  baseUrl: '/',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: (brokenLink) => {
        throw new Error(
          `Broken markdown link: ${brokenLink.sourceFilePath} -> ${brokenLink.url}`,
        );
      },
    },
  },

  plugins: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        docsRouteBasePath: '/docs',
        indexPages: false,
        hashed: false,
      },
    ],
    [
      'drawio',
      {
        lib: '/lib/viewer.min.js',
      },
    ],
    function drawioViewer(context, options) {
      return {
        name: 'drawio-viewer',
        injectHtmlTags() {
          return {
            headTags: [
              {tagName: 'script', attributes: {src: '/lib/viewer.min.js'}},
              {tagName: 'script', attributes: {src: '/lib/drawio-boot.js'}},
            ],
          };
        },
      };
    },
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    mermaid: {
      theme: {
        light: 'base',
        dark: 'dark',
      },
      options: {
        themeVariables: {
          primaryColor: '#f7ead9',
          primaryBorderColor: '#94541f',
          primaryTextColor: '#3d352a',
          lineColor: '#7a6e5f',
          secondaryColor: '#f5f3ef',
          tertiaryColor: '#eae8e4',
          noteBkgColor: '#f7ead9',
          noteTextColor: '#3d352a',
          actorBkg: '#f5f3ef',
          actorBorder: '#b76e2e',
          actorTextColor: '#3d352a',
          signalColor: '#3d352a',
          signalTextColor: '#3d352a',
          labelBoxBkgColor: '#eae8e4',
          labelBoxBorderColor: '#b5aa9a',
          labelTextColor: '#3d352a',
          loopTextColor: '#3d352a',
          activationBkgColor: '#eae8e4',
          sequenceNumberColor: '#3d352a',
          fontSize: '14px',
        },
      },
    },
    navbar: {
      title: 'IAM & PAM Reference',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'learn',
          position: 'left',
          label: 'Learn',
        },
        {
          type: 'html',
          position: 'right',
          value: '<a href="/pdf/iam-pam-reference.pdf" class="navbar__link pdf-download-btn" download title="Download the entire site as a PDF">Download PDF</a>',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Sections',
          items: [
            {label: 'IAM Fundamentals', to: '/docs/fundamentals'},
            {label: 'Identity Protocols & IGA', to: '/docs/protocols-iga'},
            {label: 'PAM Core', to: '/docs/pam-core'},
            {label: 'Vendor Landscape', to: '/docs/vendors'},
            {label: 'Scenarios & Troubleshooting', to: '/docs/scenarios'},
            {label: 'Interview Preparation', to: '/docs/interviews'},
            {label: 'Certifications & Career', to: '/docs/careers'},
            {label: 'Hands-On Labs & Projects', to: '/docs/labs'},
            {label: 'Glossary', to: '/docs/reference/glossary'},
            {label: 'Cheat Sheets', to: '/docs/reference/cheat-sheets'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} IAM & PAM Reference. Built as a personal learning project.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;