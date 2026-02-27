/* ============================================================
   COMPARISON.JS — Builds the comparison view & suggestions
   ============================================================ */

function renderComparison(result) {
    const { overallScore, isEligible, scores, company, profile } = result;

    // Title
    document.getElementById('comparisonTitle').textContent =
        `Your Profile vs ${company.name} Requirements`;
    document.getElementById('comparisonSubtitle').textContent =
        `${company.fullName} · Overall Score: ${overallScore}% · ${isEligible ? '✓ Eligible' : '✕ Not Eligible'}`;

    // Comparison Table
    const tbody = document.getElementById('comparisonTableBody');
    tbody.innerHTML = '';

    const commLabels = ['', 'Basic', 'Fair', 'Good', 'Very Good', 'Excellent'];

    const rows = [
        {
            criteria: '📊 CGPA',
            required: `≥ ${company.criteria.minCGPA}`,
            student: `${profile.cgpa}`,
            met: scores.cgpa?.met
        },
        {
            criteria: '💻 Projects',
            required: `≥ ${company.criteria.minProjects}`,
            student: `${profile.projects}`,
            met: scores.projects?.met
        },
        {
            criteria: '🏢 Internship',
            required: company.criteria.internshipRequired ? 'Required' : 'Not Required',
            student: profile.internships > 0 ? `${profile.internships} completed` : 'None',
            met: scores.internship?.met
        },
        {
            criteria: '🗣️ Communication',
            required: `Level ${company.criteria.minCommunication}/5 (${commLabels[company.criteria.minCommunication]})`,
            student: `Level ${profile.communication}/5 (${commLabels[profile.communication]})`,
            met: scores.communication?.met
        },
        {
            criteria: '📜 Certifications',
            required: `≥ ${company.criteria.certifications || 0}`,
            student: `${profile.certifications || 0}`,
            met: scores.certifications?.met
        }
    ];

    rows.forEach(row => {
        const tr = document.createElement('tr');
        const statusClass = row.met ? 'pass' : 'fail';
        const statusIcon = row.met ? '✓' : '✕';
        const textClass = row.met ? 'match' : 'no-match';

        tr.innerHTML = `
      <td class="criteria-name">${row.criteria}</td>
      <td>${row.required}</td>
      <td class="${textClass}">${row.student}</td>
      <td>
        <span class="status-icon ${statusClass}">${statusIcon}</span>
      </td>
    `;
        tbody.appendChild(tr);
    });

    // Skills Comparison
    const skillsGrid = document.getElementById('skillsComparisonGrid');
    const requiredSkills = company.criteria.skills || [];
    const studentSkills = profile.skills || [];
    const studentSkillsLower = studentSkills.map(s => s.toLowerCase());
    const matchedSkills = requiredSkills.filter(s =>
        studentSkillsLower.some(ss => ss.includes(s.toLowerCase()) || s.toLowerCase().includes(ss))
    );
    const missingSkills = requiredSkills.filter(s => !matchedSkills.includes(s));

    skillsGrid.innerHTML = `
    <div>
      <h4 style="color:var(--gray-700); margin-bottom:var(--space-md); font-size:0.9rem;">
        Required by ${company.name} (${requiredSkills.length})
      </h4>
      <div class="skills-display">
        ${requiredSkills.map(s => {
        const matched = matchedSkills.includes(s);
        return `<span class="skill-tag" style="background:${matched ? 'var(--success-light)' : 'var(--danger-light)'}; color:${matched ? '#065f46' : '#991b1b'}; border-color:${matched ? '#a7f3d0' : '#fecaca'};">
            ${matched ? '✓' : '✕'} ${s}
          </span>`;
    }).join('')}
      </div>
    </div>
    <div>
      <h4 style="color:var(--gray-700); margin-bottom:var(--space-md); font-size:0.9rem;">
        Your Skills (${studentSkills.length})
      </h4>
      <div class="skills-display">
        ${studentSkills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        ${studentSkills.length === 0 ? '<span style="color:var(--gray-400); font-size:0.85rem;">No skills detected</span>' : ''}
      </div>
    </div>
  `;

    // Improvement Suggestions
    const suggestions = getImprovementSuggestions(result);
    const sugGrid = document.getElementById('suggestionsGrid');
    sugGrid.innerHTML = '';

    suggestions.forEach(sug => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        card.innerHTML = `
      <div class="suggestion-icon">${sug.icon}</div>
      <h4>${sug.title}</h4>
      <p>${sug.description}</p>
    `;
        sugGrid.appendChild(card);
    });
}
