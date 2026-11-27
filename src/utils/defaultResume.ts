import {
  ResumeData,
  ResumeVersion,
  ResumeStyling,
  HeaderData,
  ResumeTemplateId,
  CreateResumeOptions,
  TemplateMetadata,
  SkillCategory,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  CertificationItem,
  CustomSection
} from '../types/resume';

/**
 * Standard RFC4122 v4 UUID generator for unique entity identifiers
 */
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Professional resume template definitions and styling configurations
 */
export const RESUME_TEMPLATES: TemplateMetadata[] = [
  {
    id: 'ats-minimal',
    name: 'ATS Minimalist',
    description: 'Single-column text-focused format engineered for 99%+ ATS parser pass rates.',
    badge: 'Standard Industry',
    recommendedFor: 'Enterprise Tech, Big Tech, General Engineering & Classic ATS',
    styling: {
      fontFamily: 'sans',
      fontSize: 'md',
      margins: 'normal',
      primaryColor: '#0c8ee9',
      showIcons: true
    }
  },
  {
    id: 'modern-engineering',
    name: 'Modern Engineering',
    description: 'Technical highlight styling emphasizing tech stacks, repositories, and impact metrics.',
    badge: 'Developer Choice',
    recommendedFor: 'Full-Stack, Cloud Architects, Distributed Systems, AI Engineers',
    styling: {
      fontFamily: 'mono',
      fontSize: 'md',
      margins: 'compact',
      primaryColor: '#10b981',
      showIcons: true
    }
  },
  {
    id: 'executive',
    name: 'Executive Leadership',
    description: 'Sophisticated typography and structured layout for Directors, Staff+, and Tech Leads.',
    badge: 'Staff+ & Leadership',
    recommendedFor: 'Engineering Managers, Staff/Principal Engineers, VP/Directors',
    styling: {
      fontFamily: 'serif',
      fontSize: 'md',
      margins: 'spacious',
      primaryColor: '#6366f1',
      showIcons: false
    }
  },
  {
    id: 'one-page-clean',
    name: 'One-Page Clean',
    description: 'High-density compact layout engineered to fit dense multi-year experience onto 1 page.',
    badge: 'Single Page Density',
    recommendedFor: 'Startups, New Grads, Concise career overviews',
    styling: {
      fontFamily: 'sans',
      fontSize: 'sm',
      margins: 'compact',
      primaryColor: '#0270c7',
      showIcons: true
    }
  }
];

/**
 * Retrieve template metadata and styling for a given template ID
 */
export const getTemplateMetadata = (templateId: ResumeTemplateId = 'ats-minimal'): TemplateMetadata => {
  const found = RESUME_TEMPLATES.find((t) => t.id === templateId);
  return found || RESUME_TEMPLATES[0];
};

/**
 * Creates default styling configuration for a specified template layout
 */
export const createDefaultStyling = (templateId: ResumeTemplateId = 'ats-minimal'): ResumeStyling => {
  return { ...getTemplateMetadata(templateId).styling };
};

/**
 * Performs a deep clone of any serializable object to guarantee immutability
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Specialized deep clone for ResumeData ensuring strict typing and detached references
 */
export const deepCloneResume = (resume: ResumeData): ResumeData => {
  return deepClone<ResumeData>(resume);
};

/**
 * Factory for creating an empty resume with standard industry sections ready for customization.
 * Supports createEmptyResume(title, templateId) as well as legacy createEmptyResume(id, title).
 */
export const createEmptyResume = (
  titleOrId: string = 'Untitled Resume',
  templateOrTitle: ResumeTemplateId | string = 'ats-minimal',
  authorName: string = '',
  targetRole: string = ''
): ResumeData => {
  const timestamp = new Date().toISOString();
  const isTemplate = ['ats-minimal', 'modern-engineering', 'executive', 'one-page-clean'].includes(
    templateOrTitle as ResumeTemplateId
  );

  const id = isTemplate
    ? `res-${generateUUID()}`
    : titleOrId.trim() || `res-${generateUUID()}`;
  const title = isTemplate
    ? titleOrId.trim() || 'Untitled Resume'
    : (templateOrTitle as string).trim() || 'Untitled Resume';
  const templateId: ResumeTemplateId = isTemplate
    ? (templateOrTitle as ResumeTemplateId)
    : 'ats-minimal';

  const styling = createDefaultStyling(templateId);

  return {
    id,
    title,
    templateId,
    header: {
      fullName: authorName.trim(),
      email: '',
      phone: '',
      location: '',
      headline: targetRole.trim(),
      links: [
        { id: `lnk-${generateUUID()}`, platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/', enabled: true },
        { id: `lnk-${generateUUID()}`, platform: 'github', label: 'GitHub', url: 'https://github.com/', enabled: true },
        { id: `lnk-${generateUUID()}`, platform: 'portfolio', label: 'Portfolio', url: 'https://', enabled: true }
      ]
    },
    summary: '',
    skills: [
      {
        id: `sk-${generateUUID()}`,
        category: 'Languages & Core',
        skills: []
      },
      {
        id: `sk-${generateUUID()}`,
        category: 'Frameworks & Libraries',
        skills: []
      },
      {
        id: `sk-${generateUUID()}`,
        category: 'Databases & Cloud Infrastructure',
        skills: []
      },
      {
        id: `sk-${generateUUID()}`,
        category: 'Developer Tools & DevOps',
        skills: []
      }
    ],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    customSections: [],
    styling,
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

/**
 * Factory for creating a pre-populated professional sample resume tailored to each template
 */
export const createSampleResume = (
  templateId: ResumeTemplateId = 'ats-minimal',
  customTitle?: string,
  authorName?: string,
  targetRole?: string
): ResumeData => {
  const timestamp = new Date().toISOString();
  const styling = createDefaultStyling(templateId);

  // Template 1: ATS Minimalist (Alex Vance - Full Stack & AI Systems)
  if (templateId === 'ats-minimal') {
    return {
      id: `res-${generateUUID()}`,
      title: customTitle?.trim() || 'Alex Vance - Master Resume',
      templateId: 'ats-minimal',
      header: {
        fullName: authorName?.trim() || 'Alex Vance',
        email: 'alex.vance@example.com',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        headline: targetRole?.trim() || 'Senior Full Stack & AI Systems Engineer',
        links: [
          { id: `lnk-${generateUUID()}`, platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/alexvance', enabled: true },
          { id: `lnk-${generateUUID()}`, platform: 'github', label: 'GitHub', url: 'https://github.com/alexvance', enabled: true },
          { id: `lnk-${generateUUID()}`, platform: 'leetcode', label: 'LeetCode', url: 'https://leetcode.com/alexvance', enabled: true },
          { id: `lnk-${generateUUID()}`, platform: 'portfolio', label: 'Portfolio', url: 'https://alexvance.dev', enabled: true }
        ]
      },
      summary: 'Driven Full Stack Engineer with 4+ years of experience architecting high-concurrency Node.js and React applications, AI copilot engines, and scalable microservices. Proven track record of reducing latency by 45% and leading cross-functional teams to deploy cloud-native software serving 500k+ monthly active users.',
      skills: [
        {
          id: `sk-${generateUUID()}`,
          category: 'Languages & Core',
          skills: ['TypeScript', 'JavaScript (ES6+)', 'Python', 'Go', 'HTML5/CSS3', 'SQL']
        },
        {
          id: `sk-${generateUUID()}`,
          category: 'Frameworks & Frontend',
          skills: ['React.js', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'Redux Toolkit', 'GraphQL']
        },
        {
          id: `sk-${generateUUID()}`,
          category: 'Databases & Cloud',
          skills: ['PostgreSQL', 'Supabase', 'MongoDB', 'Redis', 'Docker', 'AWS (S3, EC2, Lambda)', 'Git/GitHub Actions']
        }
      ],
      experience: [
        {
          id: `exp-${generateUUID()}`,
          company: 'Vanguard Software Technologies',
          position: 'Senior Software Engineer',
          location: 'San Francisco, CA',
          startDate: '2023-01',
          endDate: 'Present',
          current: true,
          bullets: [
            'Architected and deployed microservices infrastructure using Node.js, Express, and PostgreSQL, handling 2.5M+ daily requests with 99.98% uptime.',
            'Engineered real-time AI context management system with Google Gemini LLM, boosting document extraction accuracy by 38% and reducing user friction.',
            'Led a team of 4 engineers in migrating frontend applications to Next.js and React 19, improving PageSpeed performance scores from 62 to 98.',
            'Implemented Row Level Security (RLS) and OAuth 2.0 auth workflows via Supabase, safeguarding 500k+ sensitive user records.'
          ],
          technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Supabase', 'Docker']
        },
        {
          id: `exp-${generateUUID()}`,
          company: 'Apex Cloud Solutions',
          position: 'Software Developer',
          location: 'San Jose, CA',
          startDate: '2021-06',
          endDate: '2022-12',
          current: false,
          bullets: [
            'Developed responsive web interfaces using React, Redux, and Tailwind CSS, reducing user onboarding drop-off by 24%.',
            'Optimized database queries and added Redis caching layer, decreasing average API response latency from 420ms to 85ms.',
            'Integrated CI/CD pipelines with GitHub Actions for automated linting, unit testing, and zero-downtime deployment to AWS.'
          ],
          technologies: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Redis', 'AWS']
        }
      ],
      education: [
        {
          id: `edu-${generateUUID()}`,
          institution: 'University of California, Berkeley',
          degree: 'Bachelor of Science in Computer Science',
          fieldOfStudy: 'Computer Science & Artificial Intelligence',
          location: 'Berkeley, CA',
          startDate: '2017-08',
          endDate: '2021-05',
          gpa: '3.88/4.0',
          relevantCoursework: ['Data Structures & Algorithms', 'Operating Systems', 'Database Systems', 'Machine Learning', 'Computer Networks']
        }
      ],
      projects: [
        {
          id: `proj-${generateUUID()}`,
          title: 'Conversational Resume Workspace & LaTeX Compiler',
          description: 'Overleaf-style resume workspace powered by LLMs and client/server LaTeX compilation.',
          technologies: ['TypeScript', 'React', 'Node.js', 'Supabase', 'Tailwind CSS'],
          bullets: [
            'Built bi-directional JSON-to-LaTeX compiler enabling real-time preview and instant PDF export.',
            'Integrated conversational AI agent to optimize bullet points against job descriptions with 10-tier scoring breakdown.'
          ],
          githubUrl: 'https://github.com/alexvance/resume-workspace',
          liveUrl: 'https://resume-workspace-demo.vercel.app',
          startDate: '2024-02',
          endDate: '2024-04'
        },
        {
          id: `proj-${generateUUID()}`,
          title: 'Distributed Log Aggregator Engine',
          description: 'High-throughput distributed logging framework with real-time analytics streaming.',
          technologies: ['Go', 'Redis', 'Docker', 'PostgreSQL', 'Grafana'],
          bullets: [
            'Designed event-driven log ingestion pipeline capable of consuming 10,000 logs/sec with zero loss.',
            'Created intuitive dashboard for visualizing system metrics and memory usage.'
          ],
          githubUrl: 'https://github.com/alexvance/distributed-logger',
          startDate: '2023-08',
          endDate: '2023-11'
        }
      ],
      certifications: [
        {
          id: `cert-${generateUUID()}`,
          name: 'AWS Certified Solutions Architect – Associate',
          issuer: 'Amazon Web Services (AWS)',
          date: '2023-05',
          credentialId: 'AWS-ASA-99201',
          credentialUrl: 'https://aws.amazon.com/verification'
        }
      ],
      customSections: [
        {
          id: `cs-${generateUUID()}`,
          title: 'Honors & Achievements',
          enabled: true,
          items: [
            {
              id: `csi-${generateUUID()}`,
              title: '1st Place Winner – CalHacks 2021',
              subtitle: 'Built real-time audio transcript summarizer using NLP models.',
              date: '2021-10',
              bullets: ['Awarded top overall hackathon prize out of 300+ competing teams.']
            }
          ]
        }
      ],
      styling,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }

  // Template 2: Modern Engineering (Jordan Blake - Staff Cloud & AI Architect)
  if (templateId === 'modern-engineering') {
    return {
      id: `res-${generateUUID()}`,
      title: customTitle?.trim() || 'Jordan Blake - Modern Cloud & Systems Architect',
      templateId: 'modern-engineering',
      header: {
        fullName: authorName?.trim() || 'Jordan Blake',
        email: 'jordan.blake@engineer.io',
        phone: '+1 (555) 789-0123',
        location: 'Seattle, WA',
        headline: targetRole?.trim() || 'Staff Cloud Systems Architect & Distributed Infrastructure Lead',
        links: [
          { id: `lnk-${generateUUID()}`, platform: 'github', label: 'GitHub', url: 'https://github.com/jordanblake', enabled: true },
          { id: `lnk-${generateUUID()}`, platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/jordanblake', enabled: true },
          { id: `lnk-${generateUUID()}`, platform: 'portfolio', label: 'Systems Blog', url: 'https://systems.blake.dev', enabled: true }
        ]
      },
      summary: 'Systems Architect with 8+ years specializing in distributed computing, Kubernetes operators, multi-region database replication, and high-throughput streaming systems. Track record of scaling infrastructure to 50k RPS at 99.99% availability while reducing annual cloud spend by $1.8M.',
      skills: [
        {
          id: `sk-${generateUUID()}`,
          category: 'Core Systems & Languages',
          skills: ['Go', 'Rust', 'C++', 'Python', 'TypeScript', 'SQL', 'Bash']
        },
        {
          id: `sk-${generateUUID()}`,
          category: 'Cloud, Orchestration & DevOps',
          skills: ['Kubernetes (EKS/GKE)', 'Terraform', 'Helm', 'Docker', 'AWS', 'GCP', 'ArgoCD', 'Prometheus', 'Grafana']
        },
        {
          id: `sk-${generateUUID()}`,
          category: 'Distributed Data & Messaging',
          skills: ['Apache Kafka', 'PostgreSQL', 'Redis Cluster', 'CockroachDB', 'gRPC', 'RabbitMQ']
        }
      ],
      experience: [
        {
          id: `exp-${generateUUID()}`,
          company: 'HyperScale Cloud Networks',
          position: 'Staff Infrastructure Architect',
          location: 'Seattle, WA',
          startDate: '2022-03',
          endDate: 'Present',
          current: true,
          bullets: [
            'Spearheaded multi-region Kubernetes mesh across AWS and GCP, orchestrating 120+ microservices serving 40k sustained RPS.',
            'Authored custom Kubernetes operators in Go for automated zero-downtime canary database migrations across 300+ nodes.',
            'Engineered eBPF-based observability telemetry pipeline cutting MTTR from 45 minutes to under 4 minutes.'
          ],
          technologies: ['Go', 'Kubernetes', 'eBPF', 'Terraform', 'Kafka', 'AWS']
        },
        {
          id: `exp-${generateUUID()}`,
          company: 'Nexus Realtime Data',
          position: 'Senior Distributed Systems Engineer',
          location: 'Seattle, WA',
          startDate: '2019-04',
          endDate: '2022-02',
          current: false,
          bullets: [
            'Engineered Kafka event-stream processors in Rust and Go handling 12B daily events with p99 latency under 12ms.',
            'Redesigned Redis cluster topology, slashing memory footprint by 42% and eliminating intermittent cache stampedes.'
          ],
          technologies: ['Rust', 'Go', 'Kafka', 'Redis', 'Docker']
        }
      ],
      education: [
        {
          id: `edu-${generateUUID()}`,
          institution: 'University of Washington',
          degree: 'Master of Science in Computer Science',
          fieldOfStudy: 'Distributed Systems & Cloud Computing',
          location: 'Seattle, WA',
          startDate: '2017-09',
          endDate: '2019-03',
          gpa: '3.94/4.0',
          relevantCoursework: ['Distributed Algorithms', 'Advanced Computer Architecture', 'Cloud Infrastructure Design']
        }
      ],
      projects: [
        {
          id: `proj-${generateUUID()}`,
          title: 'KubeMesh: Lightweight Service Mesh Controller',
          description: 'Open-source Envoy-based service mesh controller with zero-configuration mTLS encryption.',
          technologies: ['Go', 'Kubernetes API', 'Envoy', 'gRPC'],
          bullets: [
            'Garnered 1,400+ GitHub stars and adopted by 12 production engineering teams globally.',
            'Maintained sub-millisecond proxy overhead under high synthetic load testing.'
          ],
          githubUrl: 'https://github.com/jordanblake/kubemesh',
          startDate: '2023-01',
          endDate: '2023-06'
        }
      ],
      certifications: [
        {
          id: `cert-${generateUUID()}`,
          name: 'Certified Kubernetes Administrator (CKA)',
          issuer: 'Cloud Native Computing Foundation (CNCF)',
          date: '2022-11',
          credentialId: 'CKA-884021'
        }
      ],
      customSections: [
        {
          id: `cs-${generateUUID()}`,
          title: 'Open Source & Patents',
          enabled: true,
          items: [
            {
              id: `csi-${generateUUID()}`,
              title: 'US Patent: Adaptive Connection Multiplexing for Geo-Distributed Clusters',
              subtitle: 'Co-inventor on patent granted for dynamic edge connection pooling.',
              date: '2024-01',
              bullets: ['Licensed across 3 enterprise SaaS networking platforms.']
            }
          ]
        }
      ],
      styling,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }

  // Template 3: Executive Leadership (Marcus Vance - VP / Director of Engineering)
  if (templateId === 'executive') {
    return {
      id: `res-${generateUUID()}`,
      title: customTitle?.trim() || 'Marcus Vance - Executive Tech Leadership',
      templateId: 'executive',
      header: {
        fullName: authorName?.trim() || 'Marcus Vance',
        email: 'marcus.vance@leadership.org',
        phone: '+1 (555) 456-7890',
        location: 'New York, NY',
        headline: targetRole?.trim() || 'Vice President of Engineering & Enterprise Technology Leader',
        links: [
          { id: `lnk-${generateUUID()}`, platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/marcusvance', enabled: true },
          { id: `lnk-${generateUUID()}`, platform: 'portfolio', label: 'Executive Portfolio', url: 'https://marcusvance.exec', enabled: true }
        ]
      },
      summary: 'Executive Engineering Leader with 14+ years scaling engineering organizations from early-stage to enterprise scale ($100M+ ARR). Managed multi-tier global teams of 80+ software engineers, data scientists, and DevOps architects with full $18M P&L responsibility. Champion of zero-trust security, engineering excellence, and customer-centric software delivery.',
      skills: [
        {
          id: `sk-${generateUUID()}`,
          category: 'Executive Leadership & Strategy',
          skills: ['Strategic Technology Roadmaps', 'P&L & Budget Management ($18M)', 'Global Team Scaling (15 to 80+)', 'Board & C-Suite Advisory', 'M&A Technical Due Diligence']
        },
        {
          id: `sk-${generateUUID()}`,
          category: 'Architecture & Governance',
          skills: ['Enterprise Cloud Migration', 'SOC 2 Type II & ISO 27001 Compliance', 'Agile & DevOps Transformation', 'Developer Velocity Engineering']
        }
      ],
      experience: [
        {
          id: `exp-${generateUUID()}`,
          company: 'Aegis Enterprise Platforms',
          position: 'Vice President of Engineering',
          location: 'New York, NY',
          startDate: '2021-08',
          endDate: 'Present',
          current: true,
          bullets: [
            'Scaled engineering organization from 28 to 85 engineers across 4 international hubs while reducing voluntary turnover to under 4%.',
            'Managed annual technology budget of $18.5M, optimizing cloud vendor contracts to capture $2.4M in recurring annual savings.',
            'Accelerated product release cadence from bi-monthly cycles to continuous daily deployments with 99.99% core platform SLA.'
          ],
          technologies: ['Executive Leadership', 'P&L Management', 'Cloud Strategy', 'Team Scaling']
        },
        {
          id: `exp-${generateUUID()}`,
          company: 'FinSphere Capital Technologies',
          position: 'Director of Software Engineering',
          location: 'New York, NY',
          startDate: '2017-03',
          endDate: '2021-07',
          current: false,
          bullets: [
            'Directed 4 engineering managers and 35 developers building institutional algorithmic trading analytics platform.',
            'Achieved full SOC 2 Type II certification 4 months ahead of schedule, enabling $45M in new enterprise contract conversions.'
          ],
          technologies: ['Fintech Infrastructure', 'Security Governance', 'Agile Leadership']
        }
      ],
      education: [
        {
          id: `edu-${generateUUID()}`,
          institution: 'Columbia University',
          degree: 'Master of Business Administration (MBA)',
          fieldOfStudy: 'Technology Strategy & Corporate Finance',
          location: 'New York, NY',
          startDate: '2014-08',
          endDate: '2016-05'
        },
        {
          id: `edu-${generateUUID()}`,
          institution: 'Cornell University',
          degree: 'Bachelor of Science in Computer Science',
          fieldOfStudy: 'Software Engineering',
          location: 'Ithaca, NY',
          startDate: '2008-08',
          endDate: '2012-05'
        }
      ],
      projects: [
        {
          id: `proj-${generateUUID()}`,
          title: 'Enterprise Architecture Modernization Blueprint',
          description: 'Authored multi-year organizational transition framework adopted by Fortune 500 financial institutions.',
          technologies: ['Enterprise Architecture', 'Cloud Governance', 'DevSecOps'],
          bullets: [
            'Delivered unified roadmap standardizing cloud governance across 14 business units.'
          ],
          startDate: '2022-01',
          endDate: '2022-12'
        }
      ],
      certifications: [
        {
          id: `cert-${generateUUID()}`,
          name: 'Executive Leadership Certificate',
          issuer: 'Harvard Business School Executive Education',
          date: '2020-09'
        }
      ],
      customSections: [
        {
          id: `cs-${generateUUID()}`,
          title: 'Advisory Roles & Keynotes',
          enabled: true,
          items: [
            {
              id: `csi-${generateUUID()}`,
              title: 'Keynote Speaker – QCon Global Software Conference',
              subtitle: 'Delivered keynote: "Scaling High-Performing Engineering Cultures During Hypergrowth"',
              date: '2023-11',
              bullets: ['Keynote attended by 2,200+ technology leaders and engineering directors.']
            }
          ]
        }
      ],
      styling,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }

  // Template 4: One-Page Clean (Elena Chen - Product & Frontend Systems)
  return {
    id: `res-${generateUUID()}`,
    title: customTitle?.trim() || 'Elena Chen - Frontend & Product Specialist',
    templateId: 'one-page-clean',
    header: {
      fullName: authorName?.trim() || 'Elena Chen',
      email: 'elena.chen@product.dev',
      phone: '+1 (555) 321-6540',
      location: 'Austin, TX',
      headline: targetRole?.trim() || 'Senior Product Engineer & Frontend Architect',
      links: [
        { id: `lnk-${generateUUID()}`, platform: 'github', label: 'GitHub', url: 'https://github.com/elenachen', enabled: true },
        { id: `lnk-${generateUUID()}`, platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/elenachen', enabled: true },
        { id: `lnk-${generateUUID()}`, platform: 'portfolio', label: 'Portfolio', url: 'https://elenachen.design', enabled: true }
      ]
    },
    summary: 'Product-minded Frontend Engineer with 5+ years crafting intuitive, high-performance web applications using React 19, TypeScript, and design systems. Specialized in web performance optimization, accessible UI/UX, and sub-100ms interactions for high-conversion e-commerce and SaaS products.',
    skills: [
      {
        id: `sk-${generateUUID()}`,
        category: 'Frontend & UI Architecture',
        skills: ['React 19', 'Next.js 15', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'Zustand', 'HTML5/Canvas', 'Figma']
      },
      {
        id: `sk-${generateUUID()}`,
        category: 'Full-Stack & Tooling',
        skills: ['Node.js', 'GraphQL', 'REST APIs', 'PostgreSQL', 'Vite', 'Jest', 'Playwright', 'Web Vitals']
      }
    ],
    experience: [
      {
        id: `exp-${generateUUID()}`,
        company: 'Lumina Product Studio',
        position: 'Lead Frontend Engineer',
        location: 'Austin, TX',
        startDate: '2022-08',
        endDate: 'Present',
        current: true,
        bullets: [
          'Engineered component design system adopted across 8 applications, cutting frontend development turnaround time by 35%.',
          'Optimized Core Web Vitals across critical conversion funnels, boosting mobile checkout conversion rate by 14.2%.'
        ],
        technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js']
      },
      {
        id: `exp-${generateUUID()}`,
        company: 'Veloce Commerce Technologies',
        position: 'Frontend Developer',
        location: 'Austin, TX',
        startDate: '2020-01',
        endDate: '2022-07',
        current: false,
        bullets: [
          'Rebuilt legacy storefront using Next.js and Tailwind CSS, reducing average initial page bundle size from 1.4MB to 210KB.',
          'Implemented WCAG 2.1 AA accessibility standards, earning state government vendor compliance eligibility.'
        ],
        technologies: ['React', 'JavaScript', 'Tailwind CSS', 'GraphQL']
      }
    ],
    education: [
      {
        id: `edu-${generateUUID()}`,
        institution: 'University of Texas at Austin',
        degree: 'Bachelor of Science in Electrical & Computer Engineering',
        fieldOfStudy: 'Software Engineering & Human-Computer Interaction',
        location: 'Austin, TX',
        startDate: '2016-08',
        endDate: '2020-05',
        gpa: '3.82/4.0'
      }
    ],
    projects: [
      {
        id: `proj-${generateUUID()}`,
        title: 'CanvasMotion: Interactive Web Animation Studio',
        description: 'Browser-based timeline keyframe animator exporting pure CSS and WebGL code.',
        technologies: ['TypeScript', 'React', 'WebGL', 'Tailwind CSS'],
        bullets: [
          'Featured on Product Hunt with 600+ upvotes and 15,000 monthly active users.'
        ],
        githubUrl: 'https://github.com/elenachen/canvasmotion',
        liveUrl: 'https://canvasmotion.app',
        startDate: '2023-04',
        endDate: '2023-09'
      }
    ],
    certifications: [
      {
        id: `cert-${generateUUID()}`,
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Meta',
        date: '2022-03'
      }
    ],
    customSections: [],
    styling,
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

/**
 * Master factory function supporting start from scratch or from pre-populated professional templates
 */
export const createNewResume = (options: CreateResumeOptions = {}): ResumeData => {
  const {
    title = 'Untitled Resume',
    templateId = 'ats-minimal',
    fromScratch = false,
    sampleData = true,
    authorName = '',
    targetRole = ''
  } = options;

  if (fromScratch || sampleData === false) {
    return createEmptyResume(title, templateId, authorName, targetRole);
  }

  return createSampleResume(templateId, title, authorName, targetRole);
};

/**
 * Switches template ID on an existing resume and applies the target template's default styling
 */
export const switchResumeTemplate = (resume: ResumeData, newTemplateId: ResumeTemplateId): ResumeData => {
  const cloned = deepCloneResume(resume);
  const newStyling = createDefaultStyling(newTemplateId);

  return {
    ...cloned,
    templateId: newTemplateId,
    styling: {
      ...newStyling,
      // Preserve custom primary color if user explicitly modified it
      primaryColor: cloned.styling?.primaryColor || newStyling.primaryColor
    },
    updatedAt: new Date().toISOString()
  };
};

/**
 * Creates pre-populated professional sample resume (Alex Vance - Master Resume)
 * Maintained for backward compatibility with existing tests and modules
 */
export const createInitialResume = (): ResumeData => {
  return createSampleResume('ats-minimal', 'Alex Vance - Master Resume');
};

/**
 * Creates multi-version snapshots for version manager demonstration
 */
export const createInitialVersions = (baseResume: ResumeData): ResumeVersion[] => {
  const version1: ResumeVersion = {
    id: 'ver-1',
    resumeId: baseResume.id,
    versionName: 'Alex Vance - Master Resume',
    targetCompany: 'General / Master',
    targetRole: 'Senior Full Stack & AI Systems Engineer',
    resumeData: deepCloneResume(baseResume),
    score: 87,
    createdAt: '2026-10-01T10:00:00.000Z'
  };

  const version2Data: ResumeData = deepCloneResume(baseResume);
  version2Data.id = 'res-ver-2';
  version2Data.title = 'Staff AI Infrastructure Engineer (Google)';
  version2Data.header.headline = 'Staff AI Infrastructure & Cloud Systems Engineer';

  const version2: ResumeVersion = {
    id: 'ver-2',
    resumeId: baseResume.id,
    versionName: 'Staff AI Infrastructure Engineer (Google)',
    targetCompany: 'Google Cloud / Brain',
    targetRole: 'Staff AI Infrastructure Engineer',
    resumeData: version2Data,
    score: 94,
    createdAt: '2026-10-05T14:30:00.000Z'
  };

  const version3Data: ResumeData = deepCloneResume(baseResume);
  version3Data.id = 'res-ver-3';
  version3Data.title = 'Lead Frontend & Next.js Architect (Stripe)';
  version3Data.header.headline = 'Lead Frontend Architect & UI Systems Lead';

  const version3: ResumeVersion = {
    id: 'ver-3',
    resumeId: baseResume.id,
    versionName: 'Lead Frontend & Next.js Architect (Stripe)',
    targetCompany: 'Stripe',
    targetRole: 'Lead Frontend Architect',
    resumeData: version3Data,
    score: 91,
    createdAt: '2026-10-08T09:15:00.000Z'
  };

  return [version1, version2, version3];
};

/**
 * Generate readable LaTeX markup for previewing state synchrony
 */
export const generateLatexFromResume = (resume: ResumeData): string => {
  return `%-------------------------
% Resume in LaTeX - Auto Generated by ResumeSync
% Document: ${resume.title}
% Candidate: ${resume.header.fullName}
% Updated: ${new Date(resume.updatedAt).toLocaleString()}
%-------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${resume.header.fullName}} \\\\ \\vspace{1pt}
    \\small ${resume.header.phone} $|$ \\href{mailto:${resume.header.email}}{\\underline{${resume.header.email}}} $|$ 
    ${resume.header.location} $|$ \\href{https://${resume.header.links[0]?.url || 'linkedin.com'}}{\\underline{${resume.header.links[0]?.label || 'LinkedIn'}}}
\\end{center}

%-----------SUMMARY-----------
\\section{Professional Summary}
${resume.summary}

%-----------EXPERIENCE-----------
\\section{Experience}
\\begin{itemize}[leftmargin=0.15in, label={}]
${resume.experience.map(exp => `  \\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{${exp.company}} & ${exp.startDate} -- ${exp.endDate} \\\\
      \\textit{\\small ${exp.position}} & \\textit{\\small ${exp.location}} \\\\
    \\end{tabular*}\\vspace{-5pt}
    \\begin{itemize}
${exp.bullets.map(b => `      \\item ${b}`).join('\n')}
    \\end{itemize}`).join('\n\n')}
\\end{itemize}

%-----------PROJECTS-----------
\\section{Projects}
\\begin{itemize}[leftmargin=0.15in, label={}]
${resume.projects.map(p => `  \\item
    \\textbf{${p.title}} $|$ \\emph{${p.technologies.join(', ')}} \\\\
    \\begin{itemize}
${p.bullets.map(b => `      \\item ${b}`).join('\n')}
    \\end{itemize}`).join('\n')}
\\end{itemize}

%-----------EDUCATION-----------
\\section{Education}
\\begin{itemize}[leftmargin=0.15in, label={}]
${resume.education.map(edu => `  \\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{${edu.institution}} & ${edu.startDate} -- ${edu.endDate} \\\\
      \\textit{\\small ${edu.degree}} & \\textit{\\small ${edu.location}} \\\\
    \\end{tabular*}`).join('\n')}
\\end{itemize}

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
${resume.skills.map(s => `  \\small{\\item{\\textbf{${s.category}}: ${s.skills.join(', ')}}}`).join('\n')}
\\end{itemize}

\\end{document}
`;
};
