import { lesson2Arabic, lesson2English } from './lessons/phase1Lesson2.js';

/*
 * Rich Lesson Content Data
 * ─────────────────────────
 * Each lesson maps to a structured content object with typed sections.
 * Lesson 1-1 contains the official content for "What Is Cybersecurity?"
 * Lesson 1-2 contains the official content for "Why Cybersecurity Matters".
 * Remaining lessons use generic placeholders until real content is added.
 *
 * Supported section types:
 *   objectives, keyTerms, explanation, diagram, toolCard,
 *   example, mistakes, practice, quiz, summary
 */

/**
 * Returns the rich content for a given lesson.
 * 
 * TRANSLATION ARCHITECTURE:
 * - English content is ALWAYS the source of truth.
 * - Arabic is only a translation overlay stored separately.
 * - If Arabic translation exists AND is complete, return it.
 * - If Arabic translation is missing or incomplete, return English.
 * - Never show partial translations. Never remove sections.
 * 
 * @param {number} phaseId
 * @param {number} lessonId
 * @param {string} lang - 'en' or 'ar'
 * @returns {{ content: object, isTranslated: boolean }}
 */
export function getLessonContent(phaseId, lessonId, lang = 'en') {
  const key = `${phaseId}-${lessonId}`;
  const englishContent = lessonContents[key] || createPlaceholderContent(phaseId, lessonId);

  // If Arabic is requested, check if a complete Arabic translation exists
  if (lang === 'ar') {
    const arabicContent = lessonContentsAr[key];
    // Only serve Arabic if it has overview AND non-empty sections (i.e. it's complete)
    if (arabicContent && arabicContent.overview && arabicContent.sections && arabicContent.sections.length > 0) {
      return { ...arabicContent, _isTranslated: true };
    }
    // Fallback to English with flag
    return { ...englishContent, _isTranslated: false };
  }

  return { ...englishContent, _isTranslated: false };
}
/**
 * Placeholder for future backend translation service.
 * 
 * BACKEND ENDPOINT (not yet implemented):
 *   POST /api/translate
 *   Body: { sourceLang: "en", targetLang: "ar", content: lessonContent }
 *   Response: { translatedContent: { ...arabicVersion } }
 * 
 * DO NOT expose API keys in frontend.
 * The real implementation will call a backend proxy that holds the
 * Google Translate API key securely.
 */
export async function requestTranslation(phaseId, lessonId, targetLang = 'ar') {
  const key = `${phaseId}-${lessonId}`;
  const cacheKey = `translation:${key}:${targetLang}`;
  
  // Check cache first
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }
  
  // TODO: Replace with real backend call
  // const response = await fetch('/api/translate', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     sourceLang: 'en',
  //     targetLang,
  //     content: getLessonContent(phaseId, lessonId, 'en')
  //   })
  // });
  // const { translatedContent } = await response.json();
  // localStorage.setItem(cacheKey, JSON.stringify(translatedContent));
  // return translatedContent;
  
  // Mock: return null (no translation available)
  return null;
}

/* ── Placeholder generator for lessons without real content ── */
function createPlaceholderContent(phaseId, lessonId) {
  void phaseId;
  void lessonId;
  return {
    overview:
      'Content placeholder. Real lesson content will be added later. This lesson will cover key concepts related to cybersecurity fundamentals.',
    objectives: [
      'Understand the core concepts covered in this lesson',
      'Identify key terms and definitions',
      'Apply knowledge through practical examples',
    ],
    keyTerms: [
      { term: 'Placeholder Term 1', definition: 'Definition will be added with real content.' },
      { term: 'Placeholder Term 2', definition: 'Definition will be added with real content.' },
      { term: 'Placeholder Term 3', definition: 'Definition will be added with real content.' },
    ],
    sections: [
      {
        type: 'explanation',
        title: 'Main Concept',
        content: [
          { type: 'paragraph', text: 'Content placeholder. Real lesson content will be added later.' },
          {
            type: 'note',
            text: 'This is a placeholder note. Real educational content will replace this text.',
          },
        ],
      },
      {
        type: 'diagram',
        title: 'Concept Overview',
        nodes: ['Concept A', 'Concept B', 'Concept C', 'Result'],
      },
      {
        type: 'example',
        title: 'Real World Example',
        scenario: 'Placeholder scenario description.',
        whatHappened: 'Placeholder event description.',
        securityLesson: 'Placeholder lesson learned.',
      },
      {
        type: 'summary',
        takeaways: [
          'Key takeaway 1 — placeholder.',
          'Key takeaway 2 — placeholder.',
          'Key takeaway 3 — placeholder.',
        ],
      },
    ],
  };
}

/* ══════════════════════════════════════════════════════════════
   PHASE 1 — Introduction to Cybersecurity
   ══════════════════════════════════════════════════════════════ */

export const lessonContents = {

  /* ────────────────────────────────────────────────────────────
     LESSON 1: What Is Cybersecurity?
     Prepared by: JoeTech
     ──────────────────────────────────────────────────────────── */
  '1-1': {
    credit: 'Prepared by: JoeTech',

    overview:
      'Cybersecurity exists because modern life depends on digital systems. Phones, cloud storage, banking apps, school portals, hospital systems, delivery platforms, industrial devices, and business networks all store or process information that someone values. If those systems are exposed, altered, locked, or taken offline, the impact can range from inconvenience to financial loss, privacy harm, safety issues, and large-scale business disruption.\n\nThis lesson gives you the mental map you will use for the rest of the course. Instead of memorizing random security terms, you will learn the basic relationship between assets, threats, vulnerabilities, controls, and risk. You will also see why cybersecurity is not just an IT tool, but a combination of people, processes, and technology working together.',

    objectives: [
      'Explain cybersecurity in plain English and in technical terms',
      'Identify common digital assets that need protection',
      'Distinguish among a threat, a vulnerability, a security control, and a risk',
      'Describe the CIA triad and explain why it matters',
      'Explain why cybersecurity depends on people, processes, and technology',
      'Describe the defensive and ethical mindset expected in cybersecurity learning and work',
    ],

    keyTerms: [
      {
        term: 'Cybersecurity',
        definition: 'Protecting digital systems and information through prevention, detection, response, and recovery.',
      },
      {
        term: 'Asset',
        definition: 'Anything of value, including devices, data, software, services, business functions, reputation, and people.',
      },
      {
        term: 'Threat',
        definition: 'An event or condition that can cause loss or harmful impact.',
      },
      {
        term: 'Vulnerability',
        definition: 'A weakness that a threat can exploit or trigger.',
      },
      {
        term: 'Risk',
        definition: 'The potential harm associated with a threat, usually shaped by likelihood and impact.',
      },
      {
        term: 'Security Control',
        definition: 'A safeguard or countermeasure that reduces or manages risk.',
      },
      {
        term: 'Confidentiality',
        definition: 'Keeping information from unauthorized disclosure.',
      },
      {
        term: 'Integrity',
        definition: 'Keeping information accurate and protected from unauthorized change.',
      },
      {
        term: 'Availability',
        definition: 'Keeping information and services accessible to authorized users when needed.',
      },
    ],

    sections: [
      /* ── A Working Definition ── */
      {
        type: 'explanation',
        title: 'A Working Definition',
        content: [
          {
            type: 'paragraph',
            text: 'A useful beginner definition is: cybersecurity is the discipline of protecting digital value. That value may be a password, a customer database, an email account, a payment service, a design file, a cloud server, a hospital booking system, or the public trust attached to a brand.',
          },
          {
            type: 'paragraph',
            text: 'Beginners often think cybersecurity means only stopping hackers. That is too narrow. Cybersecurity also deals with misconfiguration, accidents, weak passwords, unpatched systems, poor access control, insider misuse, third-party risk, and recovery after incidents.',
          },
          {
            type: 'note',
            text: 'A strong beginner mental model is not only "Who is the hacker?" but also: What are we protecting, what could go wrong, and what can reduce the damage?',
          },
        ],
      },

      /* ── What Exactly Is Being Protected? ── */
      {
        type: 'explanation',
        title: 'What Exactly Is Being Protected?',
        content: [
          {
            type: 'paragraph',
            text: 'Before you can protect anything, you must identify the asset. An asset is any item of value. That can include laptops, company websites, cloud databases, customer records, source code, payment gateways, school portals, business processes, and organizational reputation.',
          },
          {
            type: 'paragraph',
            text: 'This is why cybersecurity is broader than device security. The thing that matters most is often not the hardware itself, but the information, service, or business function the hardware supports. For example, a stolen laptop is bad, but the deeper security question is whether it exposed sensitive files, authentication tokens, or access to internal systems.',
          },
        ],
      },

      /* ── Threats, Vulnerabilities, Controls, and Risk ── */
      {
        type: 'explanation',
        title: 'Threats, Vulnerabilities, Controls, and Risk',
        content: [
          {
            type: 'paragraph',
            text: 'Once you identify an asset, the next question is: What could go wrong? This is where four foundational ideas connect.',
          },
          {
            type: 'paragraph',
            text: 'A threat is a harmful event or condition with the potential to cause loss. A vulnerability is a weakness that makes harm easier. A security control is a safeguard that reduces or manages exposure. Risk is the overall potential for damage, usually understood through likelihood and impact.',
          },
          {
            type: 'heading',
            text: 'Beginner Example',
          },
          {
            type: 'bullets',
            items: [
              'Asset: employee email account',
              'Threat: phishing email',
              'Vulnerability: no security awareness training and no multi-factor authentication',
              'Control: phishing awareness training, MFA, and email filtering',
              'Risk: account takeover, data exposure, or business email fraud',
            ],
          },
          {
            type: 'note',
            text: 'Risk is not the threat alone. A threat may exist, but if the relevant vulnerability is removed or well controlled, the risk drops. A vulnerability may also exist, but the overall risk changes depending on the value of the asset, the exposure level, and the controls in place.',
          },
        ],
      },

      /* ── Diagram 1: Asset-to-Risk Flow ── */
      {
        type: 'diagram',
        title: 'Asset-to-Risk Flow',
        nodes: ['Valuable Assets', 'Threats', 'Vulnerabilities', 'Security Controls', 'Security Outcomes'],
      },

      /* ── Cybersecurity and Information Security ── */
      {
        type: 'explanation',
        title: 'Cybersecurity and Information Security',
        content: [
          {
            type: 'paragraph',
            text: 'Cybersecurity and information security overlap heavily, but they are not always used in exactly the same way. Information security focuses on protecting information and information systems so that confidentiality, integrity, and availability are preserved. Cybersecurity often emphasizes digital systems, cyberspace, attacks, and operational defense.',
          },
          {
            type: 'paragraph',
            text: 'A practical way to remember the distinction: information security asks, "How do we protect information in the right way?" Cybersecurity asks, "How do we protect digital systems and services from cyber-related harm?"',
          },
          {
            type: 'note',
            text: 'For a beginner, the most important point is not to force a rigid separation, but to understand that both disciplines care about trustworthy information, resilient systems, and appropriate access.',
          },
        ],
      },

      /* ── The CIA Triad ── */
      {
        type: 'explanation',
        title: 'The CIA Triad',
        content: [
          {
            type: 'paragraph',
            text: 'The most important introductory model in cybersecurity is the CIA triad: confidentiality, integrity, and availability.',
          },
          {
            type: 'paragraph',
            text: 'Confidentiality means only authorized people or systems should see the data. Integrity means data should remain accurate, authentic, and protected from unauthorized change. Availability means authorized users should be able to access data and services when needed.',
          },
          {
            type: 'heading',
            text: 'Examples of CIA Failures',
          },
          {
            type: 'bullets',
            items: [
              'If payroll data leaks to the public, confidentiality failed',
              'If a grade record is secretly changed, integrity failed',
              'If a hospital booking system goes offline during working hours, availability failed',
            ],
          },
          {
            type: 'note',
            text: 'Most incidents affect more than one goal at once. For example, ransomware commonly harms availability because files or systems become unusable, but it may also raise confidentiality and integrity concerns.',
          },
        ],
      },

      /* ── Diagram 2: CIA Triad ── */
      {
        type: 'diagram',
        title: 'The CIA Triad',
        nodes: ['Confidentiality', 'Integrity', 'Availability'],
        centerLabel: 'Information Security Goals',
      },

      /* ── Cybersecurity Is More Than Tools ── */
      {
        type: 'explanation',
        title: 'Cybersecurity Is More Than Tools',
        content: [
          {
            type: 'paragraph',
            text: 'One of the most common beginner misunderstandings is to think cybersecurity is a product category: antivirus, firewall, or VPN. Tools matter, but tools alone do not create security.',
          },
          {
            type: 'paragraph',
            text: 'A secure organization needs people who understand their roles, processes for access management and incident response, and technology that enforces protection. These three parts must work together.',
          },
          {
            type: 'note',
            text: 'A useful beginner phrase is defense-in-depth: do not rely on a single barrier. Use layers so that if one control fails, another still reduces damage.',
          },
        ],
      },

      /* ── Diagram 3: Cybersecurity Program Model ── */
      {
        type: 'diagram',
        title: 'Cybersecurity Program Model',
        nodes: ['People', 'Processes', 'Technology'],
        centerLabel: 'Identify → Protect → Detect → Respond → Recover',
      },

      /* ── The Defensive and Ethical Mindset ── */
      {
        type: 'explanation',
        title: 'The Defensive and Ethical Mindset',
        content: [
          {
            type: 'paragraph',
            text: 'Understanding how attacks work is meant to improve defense, awareness, and lawful testing, not to justify misuse.',
          },
          {
            type: 'paragraph',
            text: 'For a beginner, the right mindset is simple: learn to protect, not to harm; work only with authorization; treat systems and data as someone\'s property and responsibility; and focus on reducing risk and improving resilience.',
          },
          {
            type: 'note',
            text: 'This mindset is not a side note. It is part of professional behavior in cybersecurity.',
          },
        ],
      },

      /* ── Tool / Concept Card: Security Control ── */
      {
        type: 'toolCard',
        name: 'Security Control',
        category: 'Core Concept',
        description: 'A security control is a safeguard or countermeasure that reduces risk by preventing, limiting, detecting, or helping recover from harmful events.',
        whyItMatters: 'Cybersecurity becomes practical only when goals turn into controls. "Protect data" is too vague. "Require MFA for remote access," "restrict permissions," "maintain backups," and "log suspicious activity" are concrete controls.',
        beginnerNote: 'Do not think of a control as just a device or software product. A training policy, an approval workflow, a password rule, and a backup plan are also controls. Good security uses layers of controls, not a single magic solution.',
      },

      /* ── Real World Example: Medical Clinic ── */
      {
        type: 'example',
        title: 'Medical Clinic Cyber Incident',
        scenario: 'A neighborhood medical clinic uses a cloud booking platform, employee email, a shared drive for internal documents, and a local printer-scanner that stores copies of scanned files. One employee receives a fake invoice email, clicks a malicious attachment, and soon several internal files become unreadable. Appointments are delayed, staff cannot open some records, and the clinic must verify whether any sensitive information was exposed or altered.',
        whatHappened: 'This is a cybersecurity problem because multiple digital assets are involved: email, documents, services, and patient-related information. The likely threat is malicious email leading to malware or ransomware behavior. The likely vulnerabilities include weak user awareness, poor attachment controls, and weak endpoint or backup practices. The immediate business problem is not only that an attacker exists. The larger problem is that operations are disrupted and trust is at risk.',
        securityLesson: 'Applying the CIA triad: Confidentiality — were any patient-related files viewed or copied by unauthorized parties? Integrity — were records modified, corrupted, or replaced? Availability — can staff access systems and information on time to serve patients? This analysis shows why the CIA triad is not abstract theory. It gives a fast and disciplined way to assess incident impact.',
      },

      /* ── Common Mistakes ── */
      {
        type: 'mistakes',
        items: [
          {
            mistake: 'Thinking cybersecurity only means stopping hackers',
            whyRisky: 'It hides human error, weak processes, poor access control, and misconfiguration.',
            betterPractice: 'Analyze assets, threats, vulnerabilities, controls, and risk together.',
          },
          {
            mistake: 'Treating cybersecurity as a single tool purchase',
            whyRisky: 'One product cannot replace awareness, backups, access control, detection, response, and recovery.',
            betterPractice: 'Think in layers across people, processes, and technology.',
          },
          {
            mistake: 'Ignoring the CIA triad',
            whyRisky: 'You may focus only on data leaks and miss integrity or availability failures.',
            betterPractice: 'Ask whether data was exposed, changed, or made unavailable.',
          },
          {
            mistake: 'Confusing threat and vulnerability',
            whyRisky: 'It leads to poor risk reasoning and weak remediation priorities.',
            betterPractice: 'Remember: the threat is the harmful event; the vulnerability is the weakness.',
          },
          {
            mistake: 'Learning attack concepts without ethics',
            whyRisky: 'It normalizes curiosity without responsibility.',
            betterPractice: 'Keep all learning safe, authorized, legal, and defense-oriented.',
          },
        ],
      },

      /* ── Mini Practice ── */
      {
        type: 'practice',
        question: 'Task 1: A school stores student records in a web portal. A teacher account is protected only by a reused password. A phishing email steals the password and someone downloads student reports.\n\n1. What is the asset?\n2. What is the threat?\n3. What is the vulnerability?\n4. Which CIA property is most obviously affected first?\n\nTask 2: Choose the best control for this case: a company cannot recover quickly after files are encrypted by ransomware.\n\nTask 3: Write one sentence that explains cybersecurity to a non-technical friend.',
        hint: 'For Task 1, think about what has value, what caused the harm, what weakness was exploited, and which security goal was broken. For Task 2, think about what directly supports recovery. For Task 3, a strong answer should mention protecting digital systems or data from harmful access, change, disruption, or loss.',
      },

      /* ── Lesson Summary ── */
      {
        type: 'summary',
        takeaways: [
          'Cybersecurity protects digital assets such as data, devices, services, and business functions from harmful cyber events.',
          'The core mental model is: asset → threat → vulnerability → control → risk outcome.',
          'The CIA triad gives three essential security goals: confidentiality, integrity, and availability.',
          'Good cybersecurity is not just a tool; it is a coordinated system of people, processes, and technology.',
          'Ethical, authorized, defensive practice is part of cybersecurity professionalism from the very beginning.',
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────
     LESSON 2: Why Cybersecurity Matters
     Prepared by: JoeTech
     ──────────────────────────────────────────────────────────── */
  '1-2': {
    credit: 'Prepared by: JoeTech',

    overview:
      'Cybersecurity matters because digital systems are no longer optional. They are part of banking, education, healthcare, transportation, business operations, government services, communication, entertainment, and personal identity. When those systems work, people often do not notice them. When they fail, the consequences can be immediate, expensive, stressful, and sometimes dangerous.\n\nCybersecurity is not only about stopping hackers. It is about protecting trust. A student trusts a school portal to keep grades accurate. A patient trusts a clinic to keep medical records private. A customer trusts a payment system to process money safely. A business trusts its network to keep operations running. If security fails, that trust can be damaged even when the technical problem is later fixed.\n\nThis lesson explains why cybersecurity is important from several angles: personal safety, privacy, money, business continuity, national services, reputation, and legal responsibility. It also introduces the idea that cybersecurity is a risk-management discipline, not just a technical skill.',

    objectives: [
      'Explain why cybersecurity is important in modern life',
      'Describe the personal, organizational, financial, and social impact of cyber incidents',
      'Connect cybersecurity to privacy, trust, safety, and business continuity',
      'Explain why small weaknesses can create large consequences',
      'Understand cybersecurity as risk management, not only technical defense',
      'Recognize why people, processes, and technology must work together',
      'Identify real-world situations where cybersecurity failures can harm individuals and organizations',
    ],

    keyTerms: [
      { term: 'Cyber Risk', definition: 'The possibility that a digital event could cause harm, loss, disruption, exposure, or unauthorized change.' },
      { term: 'Privacy', definition: 'The protection of personal or sensitive information from unauthorized viewing, sharing, or misuse.' },
      { term: 'Trust', definition: 'The confidence that users, customers, employees, or citizens have in a system, organization, or service.' },
      { term: 'Business Continuity', definition: 'The ability of an organization to keep operating during and after a disruption.' },
      { term: 'Data Breach', definition: 'An incident where sensitive, confidential, or protected information is accessed, exposed, copied, or stolen by unauthorized parties.' },
      { term: 'Ransomware', definition: 'Malicious software that encrypts or blocks access to files or systems and demands payment or action before access is restored.' },
      { term: 'Financial Loss', definition: 'Money lost because of fraud, downtime, recovery costs, legal penalties, customer compensation, or lost business.' },
      { term: 'Reputation Damage', definition: 'Loss of public confidence after a security incident, often leading to customer loss, reduced trust, or brand harm.' },
      { term: 'Compliance', definition: 'Following rules, laws, standards, or policies that define how data and systems must be protected.' },
      { term: 'Incident Impact', definition: 'The damage caused by a cyber incident, including technical, financial, operational, legal, and human consequences.' },
    ],

    sections: [
      /* ── 1. Cybersecurity Protects Daily Life ── */
      {
        type: 'explanation',
        title: 'Cybersecurity Protects Daily Life',
        content: [
          { type: 'paragraph', text: 'Modern daily life depends on digital systems. A phone unlocks personal accounts. A banking app controls money. A school portal stores student data. A hospital system stores medical history. A delivery app tracks locations. A company network holds emails, files, payroll, and customer information.' },
          { type: 'paragraph', text: 'Because these systems are connected, one weak point can affect many people. A stolen password can expose private messages. A compromised school account can leak student records. A ransomware infection can stop a clinic from accessing patient schedules. A fake payment page can steal card details from hundreds of users.' },
          { type: 'paragraph', text: 'Cybersecurity matters because it protects the digital layer that supports real life. The harm is not limited to a computer screen. It can affect money, time, privacy, safety, and trust.' },
          { type: 'note', text: 'Cybersecurity is important because digital harm can become real-world harm.' },
        ],
      },

      /* ── 2. Cybersecurity Protects Personal Privacy ── */
      {
        type: 'explanation',
        title: 'Cybersecurity Protects Personal Privacy',
        content: [
          { type: 'paragraph', text: 'Privacy is one of the most important reasons cybersecurity exists. Personal information can include names, phone numbers, addresses, passwords, national IDs, medical records, grades, bank details, photos, messages, location data, and browsing behavior.' },
          { type: 'paragraph', text: 'If this information is exposed, attackers may use it for identity theft, fraud, blackmail, account takeover, social engineering, or targeted scams. Even information that seems harmless can become dangerous when combined with other details. For example, a name plus phone number plus school or workplace can help an attacker create a convincing phishing message.' },
          { type: 'paragraph', text: 'Privacy is not only about hiding secrets. It is about control. People should control who can access their personal information and how it is used.' },
          { type: 'note', text: 'If a student portal leaks names, emails, grades, and phone numbers, the damage is not only technical. Students may face embarrassment, scams, impersonation, or privacy violations.' },
        ],
      },

      /* ── 3. Cybersecurity Protects Money and Financial Systems ── */
      {
        type: 'explanation',
        title: 'Cybersecurity Protects Money and Financial Systems',
        content: [
          { type: 'paragraph', text: 'Money is one of the most common motivations behind cybercrime. Attackers may target individuals, companies, banks, online stores, payment gateways, cryptocurrency wallets, or payroll systems.' },
          { type: 'heading', text: 'Financial damage can happen in many ways' },
          { type: 'bullets', items: [
            'Stolen bank credentials',
            'Fake payment pages',
            'Business email compromise',
            'Online shopping fraud',
            'Ransomware payments',
            'Recovery costs',
            'Legal penalties',
            'Loss of customers',
            'Downtime that stops business operations',
          ]},
          { type: 'paragraph', text: 'The cost of a cyber incident is often much larger than the stolen amount. An organization may also pay for investigation, system recovery, legal support, customer notification, improved security, and reputation repair.' },
          { type: 'note', text: 'The financial impact of cybersecurity failure includes both direct theft and the cost of recovery.' },
        ],
      },

      /* ── 4. Cybersecurity Protects Business Continuity ── */
      {
        type: 'explanation',
        title: 'Cybersecurity Protects Business Continuity',
        content: [
          { type: 'paragraph', text: 'A business needs its systems to keep working. If email, websites, databases, payment systems, inventory systems, or internal networks stop working, the business may lose sales, delay services, miss deadlines, or fail customers.' },
          { type: 'paragraph', text: 'Business continuity means the organization can continue operating even when something goes wrong. Cybersecurity supports business continuity by reducing the chance of disruption and helping the organization recover faster.' },
          { type: 'paragraph', text: 'For example, ransomware does not only affect files. It can stop employees from working, prevent customers from using services, delay deliveries, interrupt payments, and damage trust.' },
        ],
      },

      /* ── Diagram 1: Business Continuity Flow ── */
      {
        type: 'diagram',
        title: 'Business Continuity Flow',
        nodes: ['Normal Operations', 'Cyber Incident', 'Response', 'Recovery', 'Improved Resilience'],
      },

      /* ── 5. Cybersecurity Protects Trust and Reputation ── */
      {
        type: 'explanation',
        title: 'Cybersecurity Protects Trust and Reputation',
        content: [
          { type: 'paragraph', text: 'Trust is difficult to build and easy to lose. A company may spend years building a trusted brand, but one major cyber incident can make customers question whether their information is safe.' },
          { type: 'paragraph', text: 'Reputation damage can happen even if the technical damage is fixed. Customers may still feel unsafe. Partners may reconsider contracts. Investors may lose confidence. Students, patients, or users may move to another service.' },
          { type: 'paragraph', text: 'Good cybersecurity shows responsibility. It tells users: "We understand the value of your information, and we are serious about protecting it."' },
          { type: 'note', text: 'If an online academy loses student names, emails, passwords, and progress data, students may stop trusting the platform even if the academy later resets passwords.' },
        ],
      },

      /* ── 6. Cybersecurity Protects Safety ── */
      {
        type: 'explanation',
        title: 'Cybersecurity Protects Safety',
        content: [
          { type: 'paragraph', text: 'Some systems affect physical safety. Hospitals, transportation systems, industrial control systems, smart buildings, power systems, and emergency services all depend on technology.' },
          { type: 'paragraph', text: 'If these systems are attacked or disrupted, the impact can go beyond data loss. Services may become unavailable. Medical care may be delayed. Traffic systems may fail. Factory equipment may stop or behave incorrectly.' },
          { type: 'paragraph', text: 'This is why cybersecurity is not only an IT issue. In some environments, cybersecurity is part of safety engineering.' },
          { type: 'note', text: 'When digital systems control physical services, cybersecurity becomes a safety requirement.' },
        ],
      },

      /* ── 7. Legal and Compliance ── */
      {
        type: 'explanation',
        title: 'Cybersecurity Protects from Legal and Compliance Problems',
        content: [
          { type: 'paragraph', text: 'Many organizations are responsible for protecting the data they collect. Depending on the industry and location, there may be legal, contractual, or policy requirements for how data should be stored, accessed, shared, and protected.' },
          { type: 'paragraph', text: 'If an organization fails to protect sensitive data, it may face investigations, penalties, lawsuits, contract loss, or forced security improvements. Even when no law is broken, poor security can violate customer expectations or internal policies.' },
          { type: 'paragraph', text: 'Compliance is not the same as security, but it is connected. Compliance asks: "Are we following required rules?" Security asks: "Are we actually reducing risk?" A mature organization needs both.' },
        ],
      },

      /* ── 8. Cybersecurity Is Risk Management ── */
      {
        type: 'explanation',
        title: 'Cybersecurity Is Risk Management',
        content: [
          { type: 'paragraph', text: 'A beginner may think cybersecurity is about making systems impossible to hack. In reality, no system can be perfectly secure. Cybersecurity is about reducing risk to an acceptable level.' },
          { type: 'heading', text: 'Risk depends on three major questions' },
          { type: 'bullets', items: [
            'What are we protecting?',
            'What could go wrong?',
            'What controls reduce the chance or impact of harm?',
          ]},
          { type: 'paragraph', text: 'A password policy, backup plan, security awareness training, network monitoring, MFA, patching, encryption, and incident response plan are all examples of controls that reduce risk.' },
        ],
      },

      /* ── Diagram 2: Risk Management Flow ── */
      {
        type: 'diagram',
        title: 'Risk Management Flow',
        nodes: ['Asset', 'Threat', 'Vulnerability', 'Impact', 'Control', 'Reduced Risk'],
      },

      /* ── 9. Small Weaknesses Can Create Big Consequences ── */
      {
        type: 'explanation',
        title: 'Small Weaknesses Can Create Big Consequences',
        content: [
          { type: 'paragraph', text: 'Cyber incidents often start with something small: one reused password, one unpatched system, one phishing email, one misconfigured database, one public storage bucket, or one careless click.' },
          { type: 'paragraph', text: 'The danger is that attackers can chain small weaknesses together. A weak password may lead to email access. Email access may lead to password resets. Password resets may lead to cloud storage access. Cloud storage access may expose business files. One small issue becomes a major breach.' },
          { type: 'paragraph', text: 'This is why cybersecurity requires layers. One control is not enough. Good security uses multiple controls so that if one fails, another still protects the system.' },
        ],
      },

      /* ── Diagram 3: Attack Chain ── */
      {
        type: 'diagram',
        title: 'Attack Chain Example',
        nodes: ['Weak Password', 'Email Access', 'Account Takeover', 'Data Exposure', 'Business Impact'],
      },

      /* ── 10. People, Processes, and Technology ── */
      {
        type: 'explanation',
        title: 'Cybersecurity Requires People, Processes, and Technology',
        content: [
          { type: 'paragraph', text: 'Cybersecurity is not only tools. Security tools are important, but they cannot protect an organization alone.' },
          { type: 'heading', text: 'A strong cybersecurity program needs' },
          { type: 'bullets', items: [
            'People who understand responsibilities and risks',
            'Processes that define secure ways of working',
            'Technology that enforces protection and detects problems',
          ]},
          { type: 'paragraph', text: 'For example, MFA is technology. Teaching users not to approve unknown login requests is people training. A policy for reporting suspicious access is process. All three must work together.' },
        ],
      },

      /* ── Diagram 4: Cybersecurity Program Model ── */
      {
        type: 'diagram',
        title: 'Cybersecurity Program Model',
        nodes: ['People', 'Processes', 'Technology'],
        centerLabel: 'Resilient Security',
      },

      /* ── Tool / Concept Card: Defense-in-Depth ── */
      {
        type: 'toolCard',
        name: 'Defense-in-Depth',
        category: 'Core Concept',
        description: 'Defense-in-depth means using multiple layers of protection instead of depending on one control. If one layer fails, another layer can still reduce the damage.',
        whyItMatters: 'A single password is not enough. A single antivirus tool is not enough. A single firewall is not enough. Real security uses layers such as MFA, access control, backups, monitoring, patching, awareness training, and incident response.',
        beginnerNote: 'Good cybersecurity assumes that something may fail, then designs additional layers to reduce harm. To protect an email account: use a strong password, enable MFA, watch for phishing emails, limit account permissions, monitor suspicious login attempts, and have a recovery process.',
      },

      /* ── Real World Example: Small Business Ransomware ── */
      {
        type: 'example',
        title: 'Small Business Ransomware Incident',
        scenario: 'A small accounting office stores client tax documents, invoices, payroll files, and contracts on a shared file server. Employees use email daily to receive invoices and client documents. One employee receives a fake email that looks like it came from a client. The attachment is opened, and malware begins encrypting files on the shared server. Within an hour, employees cannot open client documents. Payroll processing is delayed. Clients begin calling because their files are unavailable. The company discovers that its backups are connected to the same network and were encrypted too.',
        whatHappened: 'The issue was not just that malware existed. Several weaknesses made the impact worse: the employee was not trained to recognize phishing emails, email filtering did not block the malicious attachment, shared files had broad access permissions, backups were not isolated, and the company did not have a tested incident response plan.',
        securityLesson: 'This incident shows why cybersecurity matters. The company did not only lose file access. It lost time, client trust, operational continuity, and possibly money. A few controls could have reduced the damage: phishing training, stronger email filtering, least-privilege access, offline backups, endpoint protection, and an incident response process.',
      },

      /* ── Common Mistakes ── */
      {
        type: 'mistakes',
        items: [
          {
            mistake: 'Thinking cybersecurity is only for large companies',
            whyRisky: 'Small businesses, students, freelancers, schools, and individuals are also targets. Attackers often choose easy targets, not only famous targets.',
            betterPractice: 'Everyone who uses digital systems has cyber risk.',
          },
          {
            mistake: 'Thinking security is only about hackers',
            whyRisky: 'Many incidents involve weak passwords, misconfiguration, human error, missing backups, or poor processes.',
            betterPractice: 'Cybersecurity protects against mistakes, misuse, accidents, and attacks.',
          },
          {
            mistake: 'Thinking one tool solves everything',
            whyRisky: 'No single tool can provide complete security.',
            betterPractice: 'Use layered controls across people, processes, and technology.',
          },
          {
            mistake: 'Ignoring business impact',
            whyRisky: 'Some beginners focus only on the technical event and forget the real damage.',
            betterPractice: 'Always ask: who is affected, what is interrupted, what data is exposed, and what trust is damaged?',
          },
          {
            mistake: 'Treating backups as optional',
            whyRisky: 'Backups are often the difference between quick recovery and major disruption.',
            betterPractice: 'Backups must exist, be protected, and be tested.',
          },
        ],
      },

      /* ── Mini Practice ── */
      {
        type: 'practice',
        question: 'Task 1: A university portal stores student grades and personal information. A weak administrator password allows an attacker to download records.\n1. What type of impact happened?\n2. What was the likely vulnerability?\n3. What controls could reduce this risk?\n\nTask 2: A small online store goes offline for two days after a ransomware attack.\n1. Which business function was affected?\n2. Why is this more than a technical problem?\n3. What controls could help recovery?\n\nTask 3: Write one sentence explaining why cybersecurity matters to a non-technical person.',
        hint: 'For Task 1, the impact includes privacy damage, trust damage, and possible legal or compliance issues. The vulnerability is weak authentication. For Task 2, the affected function is service availability and sales operations — the store loses revenue, customer trust, and time. For Task 3, a strong answer mentions protecting systems, data, money, privacy, and trust.',
      },

      /* ── Lesson Summary ── */
      {
        type: 'summary',
        takeaways: [
          'Cybersecurity matters because digital systems support daily life, business, education, healthcare, finance, and communication.',
          'Cyber incidents can cause privacy damage, financial loss, service disruption, reputation damage, legal problems, and safety risks.',
          'Cybersecurity protects trust, not only computers.',
          'Small weaknesses can create large consequences when attackers chain them together.',
          'Cybersecurity is risk management: identify what matters, understand what could go wrong, and apply controls to reduce harm.',
          'Strong cybersecurity depends on people, processes, and technology working together.',
          'Defense-in-depth uses multiple layers of protection so one failure does not become a disaster.',
        ],
      },
    ],
  },
};

lessonContents['1-2'] = lesson2English;

const lessonContentsAr = {
  '1-1': {
    credit: 'تم الإعداد بواسطة: JoeTech',
    overview: 'الأمن السيبراني موجود لأن الحياة الحديثة تعتمد على الأنظمة الرقمية. الهواتف، التخزين السحابي، التطبيقات المصرفية، كلها تعالج بيانات قيمة. إذا تم اختراق هذه الأنظمة، قد يؤدي ذلك إلى خسائر مالية أو أضرار تتعلق بالخصوصية.\n\nهذا الدرس يمنحك الخريطة الذهنية التي ستستخدمها لبقية الدورة. ستتعلم العلاقة بين الأصول، التهديدات، الثغرات، الضوابط، والمخاطر.',
    objectives: [
      'شرح الأمن السيبراني بلغة بسيطة وتقنية',
      'تحديد الأصول الرقمية التي تحتاج إلى حماية',
      'التمييز بين التهديد، الثغرة، الضابط الأمني، والمخاطرة',
      'وصف ثالوث CIA وسبب أهميته',
      'فهم سبب اعتماد الأمن السيبراني على الأشخاص والعمليات والتكنولوجيا',
    ],
    keyTerms: [
      { term: 'الأمن السيبراني (Cybersecurity)', definition: 'حماية الأنظمة الرقمية والمعلومات من خلال الوقاية والاكتشاف والاستجابة والتعافي.' },
      { term: 'الأصل (Asset)', definition: 'أي شيء له قيمة، بما في ذلك الأجهزة والبيانات والبرامج.' },
      { term: 'التهديد (Threat)', definition: 'حدث أو حالة يمكن أن تسبب ضرراً.' },
      { term: 'الثغرة (Vulnerability)', definition: 'نقطة ضعف يمكن للتهديد استغلالها.' },
      { term: 'المخاطرة (Risk)', definition: 'الضرر المحتمل المرتبط بالتهديد، والذي يتشكل عادة من خلال الاحتمالية والتأثير.' },
      { term: 'السرية (Confidentiality)', definition: 'حفظ المعلومات من الكشف غير المصرح به.' },
      { term: 'النزاهة (Integrity)', definition: 'الحفاظ على دقة المعلومات وحمايتها من التغيير غير المصرح به.' },
      { term: 'التوافر (Availability)', definition: 'إبقاء المعلومات والخدمات متاحة للمستخدمين المصرح لهم.' },
    ],
    sections: [
      {
        type: 'explanation',
        title: 'تعريف عملي',
        content: [
          { type: 'paragraph', text: 'الأمن السيبراني هو تخصص حماية القيمة الرقمية. قد تكون هذه القيمة كلمة مرور، قاعدة بيانات عملاء، حساب بريد إلكتروني، إلخ.' },
          { type: 'note', text: 'لا يقتصر الأمن السيبراني على إيقاف المخترقين فقط، بل يشمل الحماية من الأخطاء، التكوين الخاطئ، الكوارث الطبيعية.' }
        ]
      },
      {
        type: 'diagram',
        title: 'تدفق الأصول إلى المخاطر',
        nodes: ['الأصول القيمة', 'التهديدات', 'الثغرات', 'الضوابط الأمنية', 'النتائج الأمنية'],
      },
      {
        type: 'summary',
        takeaways: [
          'يحمي الأمن السيبراني الأصول الرقمية من الحوادث السيبرانية الضارة.',
          'النموذج الذهني الأساسي هو: أصل ← تهديد ← ثغرة ← ضابط ← مخاطرة.',
          'يوفر ثالوث CIA ثلاثة أهداف أمنية أساسية: السرية والنزاهة والتوافر.'
        ]
      }
    ]
  }
};

lessonContentsAr['1-2'] = lesson2Arabic;

export const curatedLessonTranslations = {
  '1-2': lesson2Arabic,
};

void lessonContentsAr;
