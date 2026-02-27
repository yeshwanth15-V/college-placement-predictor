/* ============================================================
   ELIGIBILITY.JS — Scoring Engine & Recommendation System
   ============================================================ */

function calculateEligibility(profile, company) {
    const weights = {
        cgpa: 30,
        skills: 25,
        projects: 15,
        internship: 10,
        communication: 12,
        certifications: 8
    };

    const scores = {};
    let totalScore = 0;
    let totalWeight = 0;

    // CGPA Score
    if (company.criteria.minCGPA > 0) {
        const cgpaRatio = Math.min(profile.cgpa / company.criteria.minCGPA, 1);
        scores.cgpa = {
            score: Math.round(cgpaRatio * 100),
            met: profile.cgpa >= company.criteria.minCGPA,
            studentValue: profile.cgpa,
            required: company.criteria.minCGPA
        };
        totalScore += cgpaRatio * weights.cgpa;
        totalWeight += weights.cgpa;
    }

    // Skills Score
    const requiredSkills = company.criteria.skills || [];
    if (requiredSkills.length > 0) {
        const studentSkillsLower = (profile.skills || []).map(s => s.toLowerCase());
        const matchedSkills = requiredSkills.filter(skill =>
            studentSkillsLower.some(ss =>
                ss.includes(skill.toLowerCase()) || skill.toLowerCase().includes(ss)
            )
        );
        const skillRatio = matchedSkills.length / requiredSkills.length;
        scores.skills = {
            score: Math.round(skillRatio * 100),
            met: skillRatio >= 0.7,
            matched: matchedSkills,
            missing: requiredSkills.filter(s => !matchedSkills.includes(s)),
            studentSkills: profile.skills || [],
            required: requiredSkills
        };
        totalScore += skillRatio * weights.skills;
        totalWeight += weights.skills;
    }

    // Projects Score
    if (company.criteria.minProjects > 0) {
        const projRatio = Math.min(profile.projects / company.criteria.minProjects, 1);
        scores.projects = {
            score: Math.round(projRatio * 100),
            met: profile.projects >= company.criteria.minProjects,
            studentValue: profile.projects,
            required: company.criteria.minProjects
        };
        totalScore += projRatio * weights.projects;
        totalWeight += weights.projects;
    }

    // Internship Score
    const internRequired = company.criteria.internshipRequired;
    scores.internship = {
        score: internRequired ? (profile.internships > 0 ? 100 : 0) : 100,
        met: internRequired ? profile.internships > 0 : true,
        studentValue: profile.internships,
        required: internRequired
    };
    totalScore += (scores.internship.score / 100) * weights.internship;
    totalWeight += weights.internship;

    // Communication Score
    if (company.criteria.minCommunication > 0) {
        const commRatio = Math.min(profile.communication / company.criteria.minCommunication, 1);
        scores.communication = {
            score: Math.round(commRatio * 100),
            met: profile.communication >= company.criteria.minCommunication,
            studentValue: profile.communication,
            required: company.criteria.minCommunication
        };
        totalScore += commRatio * weights.communication;
        totalWeight += weights.communication;
    }

    // Certifications Score
    if (company.criteria.certifications > 0) {
        const certRatio = Math.min(profile.certifications / company.criteria.certifications, 1);
        scores.certifications = {
            score: Math.round(certRatio * 100),
            met: profile.certifications >= company.criteria.certifications,
            studentValue: profile.certifications,
            required: company.criteria.certifications
        };
        totalScore += certRatio * weights.certifications;
        totalWeight += weights.certifications;
    } else {
        scores.certifications = {
            score: 100,
            met: true,
            studentValue: profile.certifications,
            required: 0
        };
    }

    const overallScore = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
    const isEligible = overallScore >= 65;

    return {
        overallScore,
        isEligible,
        scores,
        company,
        profile
    };
}

function getRecommendedCompanies(profile) {
    const companies = getCompanies();
    const results = companies.map(company => {
        const result = calculateEligibility(profile, company);
        return { company, score: result.overallScore, isEligible: result.isEligible };
    });

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Return top eligible companies
    return results.filter(r => r.isEligible).slice(0, 5);
}

function getImprovementSuggestions(eligibilityResult) {
    const suggestions = [];
    const { scores, company } = eligibilityResult;

    if (scores.cgpa && !scores.cgpa.met) {
        const gap = (company.criteria.minCGPA - scores.cgpa.studentValue).toFixed(1);
        suggestions.push({
            icon: '📊',
            title: 'Improve CGPA',
            description: `Your CGPA is ${scores.cgpa.studentValue}, but ${company.name} requires ${company.criteria.minCGPA}. Focus on improving by ${gap} points through better academic performance.`,
            priority: 'high'
        });
    }

    if (scores.skills && scores.skills.missing && scores.skills.missing.length > 0) {
        suggestions.push({
            icon: '🛠️',
            title: `Learn: ${scores.skills.missing.join(', ')}`,
            description: `You're missing ${scores.skills.missing.length} required skill(s). Consider online courses on platforms like Coursera, Udemy, or practice on LeetCode/HackerRank.`,
            priority: 'high'
        });
    }

    if (scores.projects && !scores.projects.met) {
        const need = company.criteria.minProjects - scores.projects.studentValue;
        suggestions.push({
            icon: '💻',
            title: `Build ${need} More Project(s)`,
            description: `${company.name} expects at least ${company.criteria.minProjects} projects. Build real-world projects using the required tech stack to strengthen your portfolio.`,
            priority: 'medium'
        });
    }

    if (scores.internship && !scores.internship.met) {
        suggestions.push({
            icon: '🏢',
            title: 'Complete an Internship',
            description: `${company.name} requires internship experience. Apply for internships on platforms like Internshala, LinkedIn, or your college placement cell.`,
            priority: 'high'
        });
    }

    if (scores.communication && !scores.communication.met) {
        suggestions.push({
            icon: '🗣️',
            title: 'Improve Communication Skills',
            description: `Your communication level is ${scores.communication.studentValue}/5, but ${company.name} needs ${company.criteria.minCommunication}/5. Join a public speaking club, practice mock interviews, or take communication courses.`,
            priority: 'medium'
        });
    }

    if (scores.certifications && !scores.certifications.met) {
        const need = company.criteria.certifications - scores.certifications.studentValue;
        suggestions.push({
            icon: '📜',
            title: `Earn ${need} More Certification(s)`,
            description: `Get certified in relevant technologies. Consider NPTEL, Google, AWS, or Microsoft certifications to boost your profile.`,
            priority: 'low'
        });
    }

    if (suggestions.length === 0) {
        suggestions.push({
            icon: '🎉',
            title: 'You\'re Well Prepared!',
            description: `Your profile meets all the criteria for ${company.name}. Focus on interview preparation, DSA practice, and mock interviews.`,
            priority: 'info'
        });
    }

    return suggestions;
}
