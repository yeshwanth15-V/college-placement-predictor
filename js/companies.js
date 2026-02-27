/* ============================================================
   COMPANIES.JS — Company Data Store & Eligibility Criteria
   ============================================================ */

const DEFAULT_COMPANIES = [
    {
        id: 'tcs',
        name: 'TCS',
        fullName: 'Tata Consultancy Services',
        type: 'IT Services & Consulting',
        color: '#1a73e8',
        logo: '🔷',
        criteria: {
            minCGPA: 7.0,
            skills: ['Java', 'SQL', 'Python', 'Problem Solving'],
            minProjects: 2,
            internshipRequired: false,
            minCommunication: 3, // out of 5
            certifications: 0
        },
        package: '3.6 - 7 LPA',
        roles: ['Software Developer', 'Systems Engineer']
    },
    {
        id: 'infosys',
        name: 'Infosys',
        fullName: 'Infosys Limited',
        type: 'IT Services & Digital',
        color: '#007cc3',
        logo: '🔵',
        criteria: {
            minCGPA: 6.5,
            skills: ['Java', 'Python', 'HTML/CSS', 'JavaScript'],
            minProjects: 2,
            internshipRequired: false,
            minCommunication: 3,
            certifications: 0
        },
        package: '3.6 - 8 LPA',
        roles: ['Software Engineer', 'Technology Analyst']
    },
    {
        id: 'wipro',
        name: 'Wipro',
        fullName: 'Wipro Technologies',
        type: 'IT Services',
        color: '#44286e',
        logo: '🟣',
        criteria: {
            minCGPA: 6.0,
            skills: ['Java', 'C++', 'SQL', 'Communication'],
            minProjects: 1,
            internshipRequired: false,
            minCommunication: 2,
            certifications: 0
        },
        package: '3.5 - 6 LPA',
        roles: ['Project Engineer', 'Software Developer']
    },
    {
        id: 'accenture',
        name: 'Accenture',
        fullName: 'Accenture Solutions',
        type: 'Consulting & Technology',
        color: '#a100ff',
        logo: '💜',
        criteria: {
            minCGPA: 6.5,
            skills: ['Problem Solving', 'Communication', 'SQL', 'Python'],
            minProjects: 1,
            internshipRequired: false,
            minCommunication: 4,
            certifications: 0
        },
        package: '4.5 - 8 LPA',
        roles: ['Associate Software Engineer', 'Analyst']
    },
    {
        id: 'zoho',
        name: 'Zoho',
        fullName: 'Zoho Corporation',
        type: 'Product Development',
        color: '#e42527',
        logo: '🔴',
        criteria: {
            minCGPA: 7.5,
            skills: ['Data Structures', 'Algorithms', 'Java', 'C++', 'Problem Solving'],
            minProjects: 3,
            internshipRequired: true,
            minCommunication: 4,
            certifications: 1
        },
        package: '6 - 14 LPA',
        roles: ['Member Technical Staff', 'Software Developer']
    },
    {
        id: 'cognizant',
        name: 'Cognizant',
        fullName: 'Cognizant Technology Solutions',
        type: 'IT Services & Consulting',
        color: '#1e3a8a',
        logo: '🔹',
        criteria: {
            minCGPA: 6.5,
            skills: ['Java', 'SQL', 'Python', 'Testing'],
            minProjects: 2,
            internshipRequired: false,
            minCommunication: 3,
            certifications: 0
        },
        package: '4 - 7 LPA',
        roles: ['Programmer Analyst', 'Software Engineer']
    },
    {
        id: 'capgemini',
        name: 'Capgemini',
        fullName: 'Capgemini India',
        type: 'IT Services & Engineering',
        color: '#0070ad',
        logo: '🌐',
        criteria: {
            minCGPA: 6.0,
            skills: ['Java', 'Python', 'Cloud', 'Agile'],
            minProjects: 1,
            internshipRequired: false,
            minCommunication: 3,
            certifications: 0
        },
        package: '3.8 - 6.5 LPA',
        roles: ['Software Engineer', 'Analyst']
    },
    {
        id: 'amazon',
        name: 'Amazon',
        fullName: 'Amazon Development Centre',
        type: 'Product & Cloud',
        color: '#ff9900',
        logo: '📦',
        criteria: {
            minCGPA: 8.0,
            skills: ['Data Structures', 'Algorithms', 'System Design', 'Java', 'Python', 'AWS'],
            minProjects: 4,
            internshipRequired: true,
            minCommunication: 4,
            certifications: 2
        },
        package: '14 - 28 LPA',
        roles: ['SDE-1', 'Software Development Engineer']
    }
];

// ── Company Management Functions ──
function getCompanies() {
    const stored = Store.get('companies');
    if (!stored || stored.length === 0) {
        Store.set('companies', DEFAULT_COMPANIES);
        return DEFAULT_COMPANIES;
    }
    return stored;
}

function saveCompanies(companies) {
    Store.set('companies', companies);
}

function addCompany(company) {
    const companies = getCompanies();
    company.id = company.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    companies.push(company);
    saveCompanies(companies);
    return company;
}

function updateCompany(id, updated) {
    const companies = getCompanies();
    const index = companies.findIndex(c => c.id === id);
    if (index !== -1) {
        companies[index] = { ...companies[index], ...updated };
        saveCompanies(companies);
        return companies[index];
    }
    return null;
}

function deleteCompany(id) {
    let companies = getCompanies();
    companies = companies.filter(c => c.id !== id);
    saveCompanies(companies);
}

function getCompanyById(id) {
    const companies = getCompanies();
    return companies.find(c => c.id === id);
}

function resetCompanies() {
    Store.set('companies', DEFAULT_COMPANIES);
}
