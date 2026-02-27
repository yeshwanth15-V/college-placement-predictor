/* ============================================================
   ADMIN.JS — Admin Dashboard Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth('admin')) return;
    initAdminDashboard();
});

function initAdminDashboard() {
    renderStats();
    renderCompanyTable();
}

function renderStats() {
    const companies = getCompanies();
    const avgCGPA = companies.reduce((sum, c) => sum + c.criteria.minCGPA, 0) / companies.length;
    const withInternship = companies.filter(c => c.criteria.internshipRequired).length;

    document.getElementById('statTotalCompanies').textContent = companies.length;
    document.getElementById('statAvgCGPA').textContent = avgCGPA.toFixed(1);
    document.getElementById('statInternshipReq').textContent = withInternship;
    document.getElementById('statTotalRoles').textContent = companies.reduce((sum, c) => sum + c.roles.length, 0);
}

function renderCompanyTable() {
    const companies = getCompanies();
    const tbody = document.getElementById('companyTableBody');
    tbody.innerHTML = '';

    companies.forEach(company => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>
        <div class="flex" style="align-items:center; gap:10px;">
          <div style="width:36px;height:36px;border-radius:8px;background:${company.color}15;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">
            ${company.logo}
          </div>
          <div>
            <strong style="color:var(--gray-900);">${company.name}</strong>
            <div style="font-size:0.78rem;color:var(--gray-500);">${company.fullName}</div>
          </div>
        </div>
      </td>
      <td>${company.type}</td>
      <td><span class="badge badge-gold">${company.criteria.minCGPA}</span></td>
      <td>
        <div class="flex flex-wrap gap-sm">
          ${company.criteria.skills.slice(0, 3).map(s => `<span class="skill-tag" style="font-size:0.72rem;padding:3px 8px;">${s}</span>`).join('')}
          ${company.criteria.skills.length > 3 ? `<span class="skill-tag" style="font-size:0.72rem;padding:3px 8px;">+${company.criteria.skills.length - 3}</span>` : ''}
        </div>
      </td>
      <td>${company.criteria.minProjects}</td>
      <td>${company.criteria.internshipRequired ? '<span class="badge badge-success">Yes</span>' : '<span class="badge badge-warning">No</span>'}</td>
      <td>${company.criteria.minCommunication}/5</td>
      <td>${company.package}</td>
      <td>
        <div class="flex gap-sm">
          <button class="btn btn-sm btn-primary" onclick="editCompany('${company.id}')" title="Edit">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="confirmDeleteCompany('${company.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    `;
        tbody.appendChild(tr);
    });
}

// ── Add / Edit Company ──
let editingCompanyId = null;

function showAddCompanyForm() {
    editingCompanyId = null;
    document.getElementById('companyFormTitle').textContent = '➕ Add New Company';
    clearCompanyForm();
    document.getElementById('companyFormCard').style.display = 'block';
    document.getElementById('companyFormCard').scrollIntoView({ behavior: 'smooth' });
}

function editCompany(id) {
    const company = getCompanyById(id);
    if (!company) return;

    editingCompanyId = id;
    document.getElementById('companyFormTitle').textContent = '✏️ Edit Company — ' + company.name;

    document.getElementById('companyName').value = company.name;
    document.getElementById('companyFullName').value = company.fullName;
    document.getElementById('companyType').value = company.type;
    document.getElementById('companyColor').value = company.color;
    document.getElementById('companyPackage').value = company.package;
    document.getElementById('companyRoles').value = company.roles.join(', ');
    document.getElementById('companyMinCGPA').value = company.criteria.minCGPA;
    document.getElementById('companySkills').value = company.criteria.skills.join(', ');
    document.getElementById('companyMinProjects').value = company.criteria.minProjects;
    document.getElementById('companyInternship').checked = company.criteria.internshipRequired;
    document.getElementById('companyCommunication').value = company.criteria.minCommunication;
    document.getElementById('companyCertifications').value = company.criteria.certifications;

    document.getElementById('companyFormCard').style.display = 'block';
    document.getElementById('companyFormCard').scrollIntoView({ behavior: 'smooth' });
}

function clearCompanyForm() {
    document.getElementById('companyName').value = '';
    document.getElementById('companyFullName').value = '';
    document.getElementById('companyType').value = '';
    document.getElementById('companyColor').value = '#3b42a0';
    document.getElementById('companyPackage').value = '';
    document.getElementById('companyRoles').value = '';
    document.getElementById('companyMinCGPA').value = '';
    document.getElementById('companySkills').value = '';
    document.getElementById('companyMinProjects').value = '';
    document.getElementById('companyInternship').checked = false;
    document.getElementById('companyCommunication').value = 3;
    document.getElementById('companyCertifications').value = 0;
}

function cancelCompanyForm() {
    document.getElementById('companyFormCard').style.display = 'none';
    editingCompanyId = null;
}

function saveCompanyForm() {
    const name = document.getElementById('companyName').value.trim();
    const fullName = document.getElementById('companyFullName').value.trim();
    const type = document.getElementById('companyType').value.trim();
    const color = document.getElementById('companyColor').value;
    const pkg = document.getElementById('companyPackage').value.trim();
    const roles = document.getElementById('companyRoles').value.split(',').map(r => r.trim()).filter(Boolean);
    const minCGPA = parseFloat(document.getElementById('companyMinCGPA').value) || 0;
    const skills = document.getElementById('companySkills').value.split(',').map(s => s.trim()).filter(Boolean);
    const minProjects = parseInt(document.getElementById('companyMinProjects').value) || 0;
    const internshipRequired = document.getElementById('companyInternship').checked;
    const minCommunication = parseInt(document.getElementById('companyCommunication').value) || 3;
    const certifications = parseInt(document.getElementById('companyCertifications').value) || 0;

    if (!name || !fullName) {
        showToast('Please fill in at least Company Name and Full Name', 'warning');
        return;
    }

    const logoEmojis = ['🔷', '🔵', '🟣', '💜', '🔴', '🔹', '🌐', '📦', '🟢', '🔶', '⭐', '🏢'];
    const logo = logoEmojis[Math.floor(Math.random() * logoEmojis.length)];

    const companyData = {
        name,
        fullName,
        type: type || 'IT Services',
        color,
        logo,
        package: pkg || 'Competitive',
        roles: roles.length ? roles : ['Software Engineer'],
        criteria: {
            minCGPA,
            skills: skills.length ? skills : ['Programming'],
            minProjects,
            internshipRequired,
            minCommunication,
            certifications
        }
    };

    if (editingCompanyId) {
        updateCompany(editingCompanyId, companyData);
        showToast(`${name} updated successfully!`, 'success');
    } else {
        addCompany(companyData);
        showToast(`${name} added successfully!`, 'success');
    }

    cancelCompanyForm();
    renderStats();
    renderCompanyTable();
}

function confirmDeleteCompany(id) {
    const company = getCompanyById(id);
    if (confirm(`Are you sure you want to remove ${company.name}?`)) {
        deleteCompany(id);
        showToast(`${company.name} removed`, 'info');
        renderStats();
        renderCompanyTable();
    }
}

function resetAllCompanies() {
    if (confirm('Reset all companies to default list? This will remove any custom additions.')) {
        resetCompanies();
        showToast('Companies reset to defaults', 'info');
        renderStats();
        renderCompanyTable();
    }
}
