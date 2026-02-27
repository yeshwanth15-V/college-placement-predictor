/* ============================================================
   RESUME-PARSER.JS — Client-Side Resume Text Extraction
   Uses pdf.js via CDN for PDF parsing, manual fallback for DOC
   ============================================================ */

// pdf.js CDN
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfJsLoaded = false;

function loadPdfJs() {
    return new Promise((resolve, reject) => {
        if (pdfJsLoaded) { resolve(); return; }
        const script = document.createElement('script');
        script.src = PDFJS_CDN;
        script.onload = () => {
            pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
            pdfJsLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load PDF.js'));
        document.head.appendChild(script);
    });
}

// ── Extract text from PDF ──
async function extractTextFromPDF(file) {
    await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        text += pageText + '\n';
    }

    return text;
}

// ── Parse extracted text into structured profile ──
function parseResumeText(text) {
    const profile = {
        cgpa: extractCGPA(text),
        projects: extractProjectCount(text),
        skills: extractSkills(text),
        internships: extractInternshipCount(text),
        certifications: extractCertificationCount(text),
        communication: estimateCommunicationLevel(text),
        rawText: text
    };
    return profile;
}

function extractCGPA(text) {
    // Look for CGPA/GPA patterns
    const patterns = [
        /(?:CGPA|C\.G\.P\.A|GPA|SGPA)\s*[:\-–]?\s*(\d+\.?\d*)\s*(?:\/\s*10)?/gi,
        /(?:CGPA|GPA)\s*(\d+\.?\d*)/gi,
        /(\d+\.\d+)\s*(?:\/\s*10\s*)?(?:CGPA|GPA)/gi,
        /(?:aggregate|overall|cumulative)\s*[:\-–]?\s*(\d+\.?\d*)/gi
    ];

    for (const pattern of patterns) {
        const match = pattern.exec(text);
        if (match) {
            const val = parseFloat(match[1]);
            if (val >= 1 && val <= 10) return val;
            if (val > 10 && val <= 100) return (val / 10).toFixed(1) * 1;
        }
    }
    return 0;
}

function extractProjectCount(text) {
    const lower = text.toLowerCase();

    // Count project-like sections
    const projectHeaders = lower.match(/(?:project|capstone|mini[\s-]?project|major[\s-]?project|academic[\s-]?project)/gi);
    if (projectHeaders) return Math.min(projectHeaders.length, 8);

    // Look for numbered lists under projects
    const projectSection = lower.match(/projects?\s*[:\-–]?\s*([\s\S]*?)(?=\n\s*(?:skill|education|experience|certification|achievement|hobby)|$)/i);
    if (projectSection) {
        const bullets = projectSection[1].match(/(?:^|\n)\s*(?:[\-•●▪]|\d+[\.\)])\s/g);
        if (bullets) return Math.min(bullets.length, 8);
    }

    return 0;
}

function extractSkills(text) {
    const knownSkills = [
        'Java', 'Python', 'C', 'C++', 'JavaScript', 'TypeScript', 'HTML', 'CSS',
        'HTML/CSS', 'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django',
        'Flask', 'Spring', 'Spring Boot', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB',
        'Firebase', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git',
        'Machine Learning', 'Deep Learning', 'AI', 'Data Science', 'NLP',
        'Data Structures', 'Algorithms', 'Problem Solving', 'Communication',
        'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'R', 'MATLAB',
        'Power BI', 'Tableau', 'Excel', 'Linux', 'Agile', 'Scrum',
        'REST API', 'GraphQL', 'Microservices', 'Cloud', 'Testing',
        'Selenium', 'JUnit', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
        'System Design', 'OOP', 'DBMS', 'OS', 'Networking', 'Cyber Security',
        '.NET', 'Figma', 'UI/UX', 'Photoshop', 'Illustrator',
        'Android', 'iOS', 'Flutter', 'React Native', 'Bootstrap', 'Tailwind'
    ];

    const foundSkills = [];
    const upperText = text.toUpperCase();

    for (const skill of knownSkills) {
        const regex = new RegExp('\\b' + skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        if (regex.test(text)) {
            foundSkills.push(skill);
        }
    }

    return [...new Set(foundSkills)];
}

function extractInternshipCount(text) {
    const lower = text.toLowerCase();
    const internPatterns = lower.match(/(?:intern(?:ship)?s?|industrial training|work experience|working at|worked at)/gi);
    if (internPatterns) return Math.min(internPatterns.length, 5);
    return 0;
}

function extractCertificationCount(text) {
    const lower = text.toLowerCase();
    const certPatterns = lower.match(/(?:certific(?:ation|ate)|certified|credential|badge|course completed|completed course|nptel|coursera|udemy|edx|linkedin learning)/gi);
    if (certPatterns) return Math.min(certPatterns.length, 10);
    return 0;
}

function estimateCommunicationLevel(text) {
    const lower = text.toLowerCase();
    let score = 2; // Base

    // Check for communication-related keywords
    const commKeywords = ['communication', 'public speaking', 'presentation', 'debate',
        'leadership', 'team lead', 'team player', 'collaborated', 'mentored',
        'organized', 'conducted', 'coordinated', 'facilitated',
        'wrote', 'published', 'blog', 'article', 'paper'];

    let matches = 0;
    for (const kw of commKeywords) {
        if (lower.includes(kw)) matches++;
    }

    if (matches >= 5) score = 5;
    else if (matches >= 3) score = 4;
    else if (matches >= 1) score = 3;

    return score;
}

// ── Manual profile entry (fallback for DOC or failed parsing) ──
function getManualProfileTemplate() {
    return {
        cgpa: 0,
        projects: 0,
        skills: [],
        internships: 0,
        certifications: 0,
        communication: 3,
        rawText: ''
    };
}
