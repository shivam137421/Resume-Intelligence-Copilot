import { ResumeData, ResumeVersion } from '../types/resume';

export const createInitialResume = (): ResumeData => {
  return {
    id: 'res-default-1',
    title: 'Alex Vance - Master Resume',
    templateId: 'ats-minimal',
    header: {
      fullName: 'Alex Vance',
      email: 'alex.vance@example.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      headline: 'Senior Full Stack & AI Systems Engineer',
      links: [
        { id: 'l1', platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/alexvance', enabled: true },
        { id: 'l2', platform: 'github', label: 'GitHub', url: 'https://github.com/alexvance', enabled: true },
        { id: 'l3', platform: 'leetcode', label: 'LeetCode', url: 'https://leetcode.com/alexvance', enabled: true },
        { id: 'l4', platform: 'portfolio', label: 'Portfolio', url: 'https://alexvance.dev', enabled: true }
      ]
    },
    summary: 'Driven Full Stack Engineer with 4+ years of experience architecting high-concurrency Node.js and React applications, AI copilot engines, and scalable microservices. Proven track record of reducing latency by 45% and leading cross-functional teams to deploy cloud-native software serving 500k+ monthly active users.',
    skills: [
      {
        id: 'sk-1',
        category: 'Languages & Core',
        skills: ['TypeScript', 'JavaScript (ES6+)', 'Python', 'Go', 'HTML5/CSS3', 'SQL']
      },
      {
        id: 'sk-2',
        category: 'Frameworks & Frontend',
        skills: ['React.js', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'Redux Toolkit', 'GraphQL']
      },
      {
        id: 'sk-3',
        category: 'Databases & Cloud',
        skills: ['PostgreSQL', 'Supabase', 'MongoDB', 'Redis', 'Docker', 'AWS (S3, EC2, Lambda)', 'Git/GitHub Actions']
      }
    ],
    experience: [
      {
        id: 'exp-1',
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
        id: 'exp-2',
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
        id: 'edu-1',
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
        id: 'proj-1',
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
        id: 'proj-2',
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
        id: 'cert-1',
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services (AWS)',
        date: '2023-05',
        credentialId: 'AWS-ASA-99201',
        credentialUrl: 'https://aws.amazon.com/verification'
      }
    ],
    customSections: [
      {
        id: 'cs-1',
        title: 'Honors & Achievements',
        enabled: true,
        items: [
          {
            id: 'csi-1',
            title: '1st Place Winner – CalHacks 2021',
            subtitle: 'Built real-time audio transcript summarizer using NLP models.',
            date: '2021-10',
            bullets: ['Awarded top overall hackathon prize out of 300+ competing teams.']
          }
        ]
      }
    ],
    styling: {
      fontFamily: 'sans',
      fontSize: 'md',
      margins: 'normal',
      primaryColor: '#0c8ee9',
      showIcons: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const createInitialVersions = (baseResume: ResumeData): ResumeVersion[] => {
  const version1: ResumeVersion = {
    id: 'ver-1',
    resumeId: baseResume.id,
    versionName: 'Alex Vance - Master Resume',
    targetCompany: 'General / Master',
    targetRole: 'Senior Full Stack & AI Systems Engineer',
    resumeData: JSON.parse(JSON.stringify(baseResume)),
    score: 87,
    createdAt: '2026-10-01T10:00:00.000Z'
  };

  const version2Data: ResumeData = JSON.parse(JSON.stringify(baseResume));
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

  const version3Data: ResumeData = JSON.parse(JSON.stringify(baseResume));
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
