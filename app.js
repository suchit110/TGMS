// Main application logic for Student-Teacher Portal
class StudentTeacherPortal {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
    }

    bindEvents() {
        // Authentication events
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());

        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') this.closeModal();
        });

        // Profile editing
        document.getElementById('edit-profile-btn')?.addEventListener('click', () => this.editStudentProfile());
        document.getElementById('edit-teacher-profile-btn')?.addEventListener('click', () => this.editTeacherProfile());

        // Notice form
        document.getElementById('notice-form')?.addEventListener('submit', (e) => this.handleNoticeSubmit(e));

        // Search functionality
        document.getElementById('student-search')?.addEventListener('input', (e) => this.searchStudents(e.target.value));
        document.getElementById('user-search')?.addEventListener('input', (e) => this.searchUsers(e.target.value));
        document.getElementById('message-search')?.addEventListener('input', (e) => this.searchMessages(e.target.value));
        document.getElementById('admin-message-search')?.addEventListener('input', (e) => this.searchMessages(e.target.value));

        // Grade filtering
        document.getElementById('grade-subject-filter')?.addEventListener('change', (e) => this.filterGrades(e.target.value));

        // Settings form
        document.getElementById('settings-form')?.addEventListener('submit', (e) => this.handleSettingsSubmit(e));

        // User role filtering
        document.getElementById('user-role-filter')?.addEventListener('change', (e) => this.filterUsersByRole(e.target.value));
    }

    // Authentication methods
    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const role = document.getElementById('login-role').value;

        const user = dataManager.authenticateUser(username, password, role);
        if (user) {
            this.currentUser = user;
            this.currentRole = role;
            this.showDashboard();
            this.showMessage('Login successful!', 'success');
        } else {
            this.showMessage('Invalid credentials. Please try again.', 'error');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        const role = document.getElementById('signup-role').value;

        // Check if username already exists
        const existingUser = dataManager.data.users.find(u => u.username === username);
        if (existingUser) {
            this.showMessage('Username already exists. Please choose another.', 'error');
            return;
        }

        const user = dataManager.addUser(username, password, role);
        if (user) {
            this.currentUser = user;
            this.currentRole = role;
            this.showDashboard();
            this.showMessage('Account created successfully!', 'success');
        }
    }

    logout() {
        this.currentUser = null;
        this.currentRole = null;
        this.showAuthSection();
        this.showMessage('Logged out successfully', 'success');
    }

    checkAuth() {
        // Check if user is already logged in (for page refresh)
        const storedUser = localStorage.getItem('currentUser');
        const storedRole = localStorage.getItem('currentRole');
        
        if (storedUser && storedRole) {
            this.currentUser = JSON.parse(storedUser);
            this.currentRole = storedRole;
            this.showDashboard();
        } else {
            this.showAuthSection();
        }
    }

    // UI Navigation
    showAuthSection() {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('student-dashboard').classList.add('hidden');
        document.getElementById('teacher-dashboard').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('nav-menu').classList.add('hidden');
        
        // Clear forms
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
    }

    showDashboard() {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('nav-menu').classList.remove('hidden');
        
        // Store current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        localStorage.setItem('currentRole', this.currentRole);

        if (this.currentRole === 'student') {
            this.showStudentDashboard();
        } else if (this.currentRole === 'teacher') {
            this.showTeacherDashboard();
        } else if (this.currentRole === 'admin') {
            this.showAdminDashboard();
        }
    }

    showStudentDashboard() {
        document.getElementById('student-dashboard').classList.remove('hidden');
        document.getElementById('teacher-dashboard').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        
        this.loadStudentProfile();
        this.loadStudentProgress();
        this.loadStudentNotices();
    }

    showTeacherDashboard() {
        document.getElementById('teacher-dashboard').classList.remove('hidden');
        document.getElementById('student-dashboard').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        
        this.loadTeacherProfile();
        this.loadTeacherStudents();
    }

    showAdminDashboard() {
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('student-dashboard').classList.add('hidden');
        document.getElementById('teacher-dashboard').classList.add('hidden');
        
        this.loadAllStudents();
        this.loadAllTeachers();
        this.addAdminControls();
    }

    addAdminControls() {
        const usersSection = document.querySelector('.users-section');
        if (!usersSection.querySelector('.admin-controls')) {
            const adminControls = document.createElement('div');
            adminControls.className = 'admin-controls';
            adminControls.innerHTML = `
                <h3>Admin Controls</h3>
                <div class="action-buttons">
                    <button class="btn btn-success" onclick="app.exportAllData()">Export Data</button>
                    <button class="btn btn-danger" onclick="app.clearAllData()">Clear All Data</button>
                </div>
            `;
            usersSection.appendChild(adminControls);
        }
    }

    // Student methods
    loadStudentProfile() {
        const student = dataManager.getStudentByUserId(this.currentUser.id);
        const profileDiv = document.getElementById('student-profile');
        
        if (student && student.isProfileComplete) {
            profileDiv.innerHTML = `
                <div class="student-card">
                    <h4>${student.profile.name || 'N/A'}</h4>
                    <p><strong>Student ID:</strong> ${student.studentId}</p>
                    <p><strong>Class:</strong> ${student.profile.class || 'N/A'}</p>
                    <p><strong>Age:</strong> ${student.profile.age || 'N/A'}</p>
                    <p><strong>Contact:</strong> ${student.profile.contact || 'N/A'}</p>
                    <p><strong>Email:</strong> ${student.profile.email || 'N/A'}</p>
                </div>
            `;
        } else {
            profileDiv.innerHTML = `
                <div class="message error">
                    Profile incomplete. Please complete your profile to continue.
                </div>
            `;
        }
    }

    loadStudentProgress() {
        const student = dataManager.getStudentByUserId(this.currentUser.id);
        const progressDiv = document.getElementById('progress-reports');
        
        if (!student) {
            progressDiv.innerHTML = '<p>Student not found.</p>';
            return;
        }

        const reports = dataManager.getProgressReportsForStudent(student.id);
        
        if (reports.length === 0) {
            progressDiv.innerHTML = '<p>No progress reports available yet.</p>';
            return;
        }

        progressDiv.innerHTML = `
            <div class="action-buttons mb-20">
                <button class="btn btn-success" onclick="app.downloadProgressReport()">
                    Download Progress Report
                </button>
            </div>
            ${reports.map(report => `
                <div class="progress-report">
                    <h4>Report - ${new Date(report.createdAt).toLocaleDateString()}</h4>
                    <div class="marks">
                        <span class="mark-item">Math: ${report.math || 'N/A'}</span>
                        <span class="mark-item">Science: ${report.science || 'N/A'}</span>
                        <span class="mark-item">English: ${report.english || 'N/A'}</span>
                        <span class="mark-item">Attendance: ${report.attendance || 'N/A'}%</span>
                    </div>
                    <p><strong>Behavior:</strong> ${report.behavior || 'N/A'}</p>
                    <p><strong>Remarks:</strong> ${report.remarks || 'N/A'}</p>
                </div>
            `).join('')}
        `;
    }

    loadStudentNotices() {
        const student = dataManager.getStudentByUserId(this.currentUser.id);
        const noticesDiv = document.getElementById('student-notices');
        
        if (!student || !student.assignedTeacher) {
            noticesDiv.innerHTML = '<p>No notices available.</p>';
            return;
        }

        const notices = dataManager.getNoticesForStudents(student.assignedTeacher);
        
        if (notices.length === 0) {
            noticesDiv.innerHTML = '<p>No notices available.</p>';
            return;
        }

        noticesDiv.innerHTML = notices.map(notice => `
            <div class="notice">
                <h4>${notice.title}</h4>
                <div class="notice-date">${new Date(notice.createdAt).toLocaleDateString()}</div>
                <p>${notice.content}</p>
            </div>
        `).join('');
    }

    editStudentProfile() {
        const student = dataManager.getStudentByUserId(this.currentUser.id);
        const modal = this.openModal('Edit Student Profile', `
            <form id="student-profile-form">
                <div class="form-group">
                    <label for="profile-name">Full Name:</label>
                    <input type="text" id="profile-name" value="${student?.profile?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="profile-class">Class:</label>
                    <input type="text" id="profile-class" value="${student?.profile?.class || ''}" required>
                </div>
                <div class="form-group">
                    <label for="profile-age">Age:</label>
                    <input type="number" id="profile-age" value="${student?.profile?.age || ''}" required>
                </div>
                <div class="form-group">
                    <label for="profile-contact">Contact Number:</label>
                    <input type="tel" id="profile-contact" value="${student?.profile?.contact || ''}" required>
                </div>
                <div class="form-group">
                    <label for="profile-email">Email:</label>
                    <input type="email" id="profile-email" value="${student?.profile?.email || ''}" required>
                </div>
                <button type="submit" class="btn btn-primary">Save Profile</button>
            </form>
        `);

        document.getElementById('student-profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const profileData = {
                name: document.getElementById('profile-name').value,
                class: document.getElementById('profile-class').value,
                age: document.getElementById('profile-age').value,
                contact: document.getElementById('profile-contact').value,
                email: document.getElementById('profile-email').value
            };

            dataManager.updateStudentProfile(this.currentUser.id, profileData);
            this.closeModal();
            this.loadStudentProfile();
            this.showMessage('Profile updated successfully!', 'success');
        });
    }

    // Teacher methods
    loadTeacherProfile() {
        const teacher = dataManager.getTeacherByUserId(this.currentUser.id);
        const profileDiv = document.getElementById('teacher-profile');
        
        if (teacher && teacher.isProfileComplete) {
            profileDiv.innerHTML = `
                <div class="teacher-card">
                    <h4>${teacher.profile.name || 'N/A'}</h4>
                    <p><strong>Teacher ID:</strong> ${teacher.teacherId}</p>
                    <p><strong>Subject:</strong> ${teacher.profile.subject || 'N/A'}</p>
                    <p><strong>Experience:</strong> ${teacher.profile.experience || 'N/A'} years</p>
                    <p><strong>Email:</strong> ${teacher.profile.email || 'N/A'}</p>
                </div>
            `;
        } else {
            profileDiv.innerHTML = `
                <div class="message error">
                    Profile incomplete. Please complete your profile to continue.
                </div>
            `;
        }
    }

    loadTeacherStudents() {
        const students = dataManager.getStudentsByTeacher(this.currentUser.id);
        const studentsDiv = document.getElementById('students-list');
        
        if (students.length === 0) {
            studentsDiv.innerHTML = '<p>No students assigned yet.</p>';
            return;
        }

        studentsDiv.innerHTML = students.map(student => `
            <div class="student-card">
                <h4>${student.profile.name || 'N/A'}</h4>
                <p><strong>Student ID:</strong> ${student.studentId}</p>
                <p><strong>Class:</strong> ${student.profile.class || 'N/A'}</p>
                <p><strong>Contact:</strong> ${student.profile.contact || 'N/A'}</p>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="app.updateStudentProgress('${student.id}')">
                        Update Progress
                    </button>
                </div>
            </div>
        `).join('');
    }

    editTeacherProfile() {
        const teacher = dataManager.getTeacherByUserId(this.currentUser.id);
        const modal = this.openModal('Edit Teacher Profile', `
            <form id="teacher-profile-form">
                <div class="form-group">
                    <label for="teacher-name">Full Name:</label>
                    <input type="text" id="teacher-name" value="${teacher?.profile?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="teacher-subject">Subject:</label>
                    <input type="text" id="teacher-subject" value="${teacher?.profile?.subject || ''}" required>
                </div>
                <div class="form-group">
                    <label for="teacher-experience">Experience (years):</label>
                    <input type="number" id="teacher-experience" value="${teacher?.profile?.experience || ''}" required>
                </div>
                <div class="form-group">
                    <label for="teacher-email">Email:</label>
                    <input type="email" id="teacher-email" value="${teacher?.profile?.email || ''}" required>
                </div>
                <button type="submit" class="btn btn-primary">Save Profile</button>
            </form>
        `);

        document.getElementById('teacher-profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const profileData = {
                name: document.getElementById('teacher-name').value,
                subject: document.getElementById('teacher-subject').value,
                experience: document.getElementById('teacher-experience').value,
                email: document.getElementById('teacher-email').value
            };

            dataManager.updateTeacherProfile(this.currentUser.id, profileData);
            this.closeModal();
            this.loadTeacherProfile();
            this.showMessage('Profile updated successfully!', 'success');
        });
    }

    updateStudentProgress(studentId) {
        const student = dataManager.data.students.find(s => s.id === studentId);
        if (!student) return;

        const modal = this.openModal(`Update Progress - ${student.profile.name}`, `
            <form id="progress-form">
                <div class="form-group">
                    <label for="progress-math">Math Score:</label>
                    <input type="number" id="progress-math" min="0" max="100">
                </div>
                <div class="form-group">
                    <label for="progress-science">Science Score:</label>
                    <input type="number" id="progress-science" min="0" max="100">
                </div>
                <div class="form-group">
                    <label for="progress-english">English Score:</label>
                    <input type="number" id="progress-english" min="0" max="100">
                </div>
                <div class="form-group">
                    <label for="progress-attendance">Attendance %:</label>
                    <input type="number" id="progress-attendance" min="0" max="100">
                </div>
                <div class="form-group">
                    <label for="progress-behavior">Behavior:</label>
                    <select id="progress-behavior">
                        <option value="">Select Behavior</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Average">Average</option>
                        <option value="Needs Improvement">Needs Improvement</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="progress-remarks">Remarks:</label>
                    <textarea id="progress-remarks" rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Save Progress</button>
            </form>
        `);

        document.getElementById('progress-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const progressData = {
                math: document.getElementById('progress-math').value,
                science: document.getElementById('progress-science').value,
                english: document.getElementById('progress-english').value,
                attendance: document.getElementById('progress-attendance').value,
                behavior: document.getElementById('progress-behavior').value,
                remarks: document.getElementById('progress-remarks').value
            };

            dataManager.addProgressReport(this.currentUser.id, studentId, progressData);
            this.closeModal();
            this.showMessage('Progress updated successfully!', 'success');
        });
    }

    handleNoticeSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('notice-title').value;
        const content = document.getElementById('notice-content').value;

        dataManager.addNotice(this.currentUser.id, { title, content });
        document.getElementById('notice-form').reset();
        this.showMessage('Notice posted successfully!', 'success');
    }

    // Admin methods
    loadAllStudents() {
        const students = dataManager.getAllStudents();
        const studentsDiv = document.getElementById('students-list-admin');
        
        studentsDiv.innerHTML = students.map(student => {
            const teacher = dataManager.data.teachers.find(t => t.id === student.assignedTeacher);
            return `
                <div class="student-card">
                    <h4>${student.profile.name || 'N/A'}</h4>
                    <p><strong>Student ID:</strong> ${student.studentId}</p>
                    <p><strong>Class:</strong> ${student.profile.class || 'N/A'}</p>
                    <p><strong>Assigned Teacher:</strong> ${teacher?.profile?.name || 'Not assigned'}</p>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" onclick="app.reassignStudent('${student.id}')">
                            Reassign Teacher
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadAllTeachers() {
        const teachers = dataManager.getAllTeachers();
        const teachersDiv = document.getElementById('teachers-list-admin');
        
        teachersDiv.innerHTML = teachers.map(teacher => {
            const studentCount = dataManager.getStudentsByTeacher(teacher.id).length;
            return `
                <div class="teacher-card">
                    <h4>${teacher.profile.name || 'N/A'}</h4>
                    <p><strong>Teacher ID:</strong> ${teacher.teacherId}</p>
                    <p><strong>Subject:</strong> ${teacher.profile.subject || 'N/A'}</p>
                    <p><strong>Students:</strong> ${studentCount}/${teacher.maxStudents}</p>
                </div>
            `;
        }).join('');
    }

    reassignStudent(studentId) {
        const student = dataManager.data.students.find(s => s.id === studentId);
        const availableTeachers = dataManager.data.teachers
            .filter(t => t.isProfileComplete)
            .map(t => ({
                ...t,
                studentCount: dataManager.getStudentsByTeacher(t.id).length
            }))
            .filter(t => t.studentCount < t.maxStudents);

        if (availableTeachers.length === 0) {
            this.showMessage('No available teachers with capacity.', 'error');
            return;
        }

        const modal = this.openModal(`Reassign ${student.profile.name}`, `
            <form id="reassign-form">
                <div class="form-group">
                    <label for="new-teacher">Select New Teacher:</label>
                    <select id="new-teacher" required>
                        <option value="">Select Teacher</option>
                        ${availableTeachers.map(teacher => 
                            `<option value="${teacher.id}">${teacher.profile.name} (${teacher.studentCount}/${teacher.maxStudents} students)</option>`
                        ).join('')}
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Reassign</button>
            </form>
        `);

        document.getElementById('reassign-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const newTeacherId = document.getElementById('new-teacher').value;
            
            if (dataManager.reassignStudent(studentId, newTeacherId)) {
                this.closeModal();
                this.loadAllStudents();
                this.showMessage('Student reassigned successfully!', 'success');
            } else {
                this.showMessage('Failed to reassign student.', 'error');
            }
        });
    }

    // Utility methods
    switchTab(e) {
        const tabName = e.target.dataset.tab;
        
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        e.target.classList.add('active');
        
        // Show corresponding content
        if (tabName === 'login') {
            document.getElementById('login-form').classList.add('active');
            document.getElementById('signup-form').classList.remove('active');
        } else if (tabName === 'signup') {
            document.getElementById('signup-form').classList.add('active');
            document.getElementById('login-form').classList.remove('active');
        } else if (tabName === 'all-students') {
            document.getElementById('all-students').classList.add('active');
            document.getElementById('all-teachers').classList.remove('active');
        } else if (tabName === 'all-teachers') {
            document.getElementById('all-teachers').classList.add('active');
            document.getElementById('all-students').classList.remove('active');
        }
    }

    openModal(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal-overlay').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    }

    showMessage(message, type) {
        // Remove existing messages
        document.querySelectorAll('.message').forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        document.querySelector('.container').insertBefore(messageDiv, document.querySelector('main'));
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Download progress report as HTML file
    downloadProgressReport() {
        const student = dataManager.getStudentByUserId(this.currentUser.id);
        if (!student) return;

        const reports = dataManager.getProgressReportsForStudent(student.id);
        const teacher = dataManager.data.teachers.find(t => t.id === student.assignedTeacher);
        
        let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Progress Report - ${student.profile.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .report { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
        .marks { display: flex; gap: 20px; margin: 10px 0; }
        .mark-item { background: #f0f0f0; padding: 5px 10px; border-radius: 3px; }
        .footer { margin-top: 30px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Progress Report</h1>
        <h2>${student.profile.name}</h2>
        <p>Student ID: ${student.studentId} | Class: ${student.profile.class}</p>
        <p>Teacher: ${teacher?.profile?.name || 'Not assigned'}</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
    </div>
`;

        reports.forEach(report => {
            htmlContent += `
    <div class="report">
        <h3>Report - ${new Date(report.createdAt).toLocaleDateString()}</h3>
        <div class="marks">
            <span class="mark-item">Math: ${report.math || 'N/A'}</span>
            <span class="mark-item">Science: ${report.science || 'N/A'}</span>
            <span class="mark-item">English: ${report.english || 'N/A'}</span>
            <span class="mark-item">Attendance: ${report.attendance || 'N/A'}%</span>
        </div>
        <p><strong>Behavior:</strong> ${report.behavior || 'N/A'}</p>
        <p><strong>Remarks:</strong> ${report.remarks || 'N/A'}</p>
    </div>
`;
        });

        htmlContent += `
    <div class="footer">
        <p>This report was generated from the Student-Teacher Portal</p>
    </div>
</body>
</html>`;

        // Create and download the file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `progress-report-${student.studentId}-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('Progress report downloaded successfully!', 'success');
    }

    // Export all data (for admin backup)
    exportAllData() {
        const data = dataManager.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student-teacher-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('Data exported successfully!', 'success');
    }

    // Clear all data (for testing/reset)
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            dataManager.clearData();
            this.logout();
            this.showMessage('All data cleared successfully!', 'success');
        }
    }

    // Enhanced Student Features
    loadStudentGrades(subject = null) {
        const student = dataManager.getStudentByUserId(this.currentUser.id);
        if (!student) return;

        const grades = dataManager.getGradesForStudent(student.id, subject);
        const gradesDiv = document.getElementById('grades-list');
        
        if (grades.length === 0) {
            gradesDiv.innerHTML = '<p>No grades available yet.</p>';
            return;
        }

        const averageGrade = dataManager.getGradeAverage(student.id, subject);
        
        gradesDiv.innerHTML = `
            <div class="grade-summary">
                <h4>Average Grade: ${averageGrade}%</h4>
            </div>
            ${grades.map(grade => `
                <div class="grade-card">
                    <h4>${grade.subject} - ${grade.gradeType}</h4>
                    <div class="grade-details">
                        <span class="grade-item">Score: ${grade.grade}/${grade.maxGrade}</span>
                        <span class="grade-item">Percentage: ${grade.percentage}%</span>
                        <span class="grade-item">Date: ${new Date(grade.createdAt).toLocaleDateString()}</span>
                    </div>
                    ${grade.remarks ? `<p><strong>Remarks:</strong> ${grade.remarks}</p>` : ''}
                </div>
            `).join('')}
        `;
    }

    loadStudentAttendance() {
        const student = dataManager.getStudentByUserId(this.currentUser.id);
        if (!student) return;

        const stats = dataManager.getAttendanceStats(student.id);
        const attendanceDiv = document.getElementById('attendance-stats');
        
        attendanceDiv.innerHTML = `
            <div class="attendance-stats">
                <div class="attendance-stat">
                    <h4>Total Days</h4>
                    <div class="stat-value">${stats.total}</div>
                </div>
                <div class="attendance-stat">
                    <h4>Present</h4>
                    <div class="stat-value">${stats.present}</div>
                </div>
                <div class="attendance-stat">
                    <h4>Absent</h4>
                    <div class="stat-value">${stats.absent}</div>
                </div>
                <div class="attendance-stat">
                    <h4>Late</h4>
                    <div class="stat-value">${stats.late}</div>
                </div>
                <div class="attendance-stat">
                    <h4>Percentage</h4>
                    <div class="stat-value">${stats.percentage}%</div>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${stats.percentage}%"></div>
            </div>
        `;

        this.loadAttendanceCalendar();
    }

    loadAttendanceCalendar() {
        const calendarDiv = document.getElementById('attendance-calendar');
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        let calendarHTML = `
            <div class="calendar-header">
                <h4>${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
            </div>
            <div class="attendance-calendar">
        `;
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            calendarHTML += `<div class="attendance-day" style="font-weight: bold; background: #f8f9fa;">${day}</div>`;
        });
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += '<div class="attendance-day"></div>';
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateString = date.toISOString().split('T')[0];
            const student = dataManager.getStudentByUserId(this.currentUser.id);
            const attendance = dataManager.data.attendance.find(a => 
                a.studentId === student.id && a.date === dateString
            );
            
            let statusClass = '';
            if (attendance) {
                statusClass = attendance.status;
            }
            
            calendarHTML += `
                <div class="attendance-day ${statusClass}" title="${dateString}">
                    ${day}
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        calendarDiv.innerHTML = calendarHTML;
    }

    loadStudentMessages() {
        const messages = dataManager.getMessagesForUser(this.currentUser.id);
        const messagesDiv = document.getElementById('messages-list');
        
        if (messages.length === 0) {
            messagesDiv.innerHTML = '<p>No messages available.</p>';
            return;
        }

        messagesDiv.innerHTML = messages.map(message => {
            const sender = dataManager.getUserById(message.fromUserId);
            const isUnread = !message.isRead && message.toUserId === this.currentUser.id;
            
            return `
                <div class="message-card ${isUnread ? 'unread' : ''}" onclick="app.openMessage('${message.id}')">
                    <h4>${message.subject}</h4>
                    <div class="message-meta">
                        <span>From: ${sender?.profile?.name || sender?.username}</span>
                        <span>${new Date(message.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="message-preview">${message.content.substring(0, 100)}...</div>
                </div>
            `;
        }).join('');
    }

    loadStudentCalendar() {
        const calendarDiv = document.getElementById('calendar-view');
        const today = new Date();
        const events = dataManager.getEventsForDate(today);
        
        calendarDiv.innerHTML = `
            <div class="calendar-header">
                <h4>Today's Events</h4>
            </div>
            <div class="events-list">
                ${events.length === 0 ? '<p>No events for today.</p>' : 
                    events.map(event => `
                        <div class="calendar-event">
                            <h5>${event.title}</h5>
                            <p>${event.description}</p>
                            <small>${new Date(event.startDate).toLocaleTimeString()}</small>
                        </div>
                    `).join('')
                }
            </div>
        `;
    }

    // Enhanced Teacher Features
    loadTeacherStudents() {
        const students = dataManager.getStudentsByTeacher(this.currentUser.id);
        const studentsDiv = document.getElementById('students-list');
        
        if (students.length === 0) {
            studentsDiv.innerHTML = '<p>No students assigned yet.</p>';
            return;
        }

        studentsDiv.innerHTML = students.map(student => {
            const attendanceStats = dataManager.getAttendanceStats(student.id);
            const averageGrade = dataManager.getGradeAverage(student.id);
            
            return `
                <div class="student-card">
                    <h4>${student.profile.name || 'N/A'}</h4>
                    <p><strong>Student ID:</strong> ${student.studentId}</p>
                    <p><strong>Class:</strong> ${student.profile.class || 'N/A'}</p>
                    <p><strong>Contact:</strong> ${student.profile.contact || 'N/A'}</p>
                    <p><strong>Attendance:</strong> ${attendanceStats.percentage}%</p>
                    <p><strong>Average Grade:</strong> ${averageGrade}%</p>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="app.updateStudentProgress('${student.id}')">
                            Update Progress
                        </button>
                        <button class="btn btn-secondary" onclick="app.manageStudentGrades('${student.id}')">
                            Manage Grades
                        </button>
                        <button class="btn btn-success" onclick="app.markAttendance('${student.id}')">
                            Mark Attendance
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadTeacherMessages() {
        const messages = dataManager.getMessagesForUser(this.currentUser.id);
        const messagesDiv = document.getElementById('teacher-messages-list');
        
        if (messages.length === 0) {
            messagesDiv.innerHTML = '<p>No messages available.</p>';
            return;
        }

        messagesDiv.innerHTML = messages.map(message => {
            const sender = dataManager.getUserById(message.fromUserId);
            const isUnread = !message.isRead && message.toUserId === this.currentUser.id;
            
            return `
                <div class="message-card ${isUnread ? 'unread' : ''}" onclick="app.openMessage('${message.id}')">
                    <h4>${message.subject}</h4>
                    <div class="message-meta">
                        <span>From: ${sender?.profile?.name || sender?.username}</span>
                        <span>${new Date(message.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="message-preview">${message.content.substring(0, 100)}...</div>
                </div>
            `;
        }).join('');
    }

    loadTeacherCalendar() {
        const calendarDiv = document.getElementById('teacher-calendar-view');
        const today = new Date();
        const events = dataManager.getEventsForDate(today);
        
        calendarDiv.innerHTML = `
            <div class="calendar-header">
                <h4>Today's Events</h4>
            </div>
            <div class="events-list">
                ${events.length === 0 ? '<p>No events for today.</p>' : 
                    events.map(event => `
                        <div class="calendar-event">
                            <h5>${event.title}</h5>
                            <p>${event.description}</p>
                            <small>${new Date(event.startDate).toLocaleTimeString()}</small>
                        </div>
                    `).join('')
                }
            </div>
        `;
    }

    loadTeacherAnalytics() {
        const analyticsDiv = document.getElementById('analytics-charts');
        const students = dataManager.getStudentsByTeacher(this.currentUser.id);
        
        if (students.length === 0) {
            analyticsDiv.innerHTML = '<p>No students assigned for analytics.</p>';
            return;
        }

        const gradeData = students.map(student => {
            const averageGrade = dataManager.getGradeAverage(student.id);
            return {
                name: student.profile.name,
                grade: averageGrade
            };
        });

        const attendanceData = students.map(student => {
            const stats = dataManager.getAttendanceStats(student.id);
            return {
                name: student.profile.name,
                attendance: stats.percentage
            };
        });

        analyticsDiv.innerHTML = `
            <div class="analytics-grid">
                <div class="chart-container">
                    <h4>Student Performance</h4>
                    <div class="performance-chart">
                        ${gradeData.map(data => `
                            <div class="performance-item">
                                <span>${data.name}</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${data.grade}%"></div>
                                </div>
                                <span>${data.grade}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="chart-container">
                    <h4>Attendance Overview</h4>
                    <div class="attendance-chart">
                        ${attendanceData.map(data => `
                            <div class="attendance-item">
                                <span>${data.name}</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${data.attendance}%"></div>
                                </div>
                                <span>${data.attendance}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Enhanced Admin Features
    loadAdminOverview() {
        const analytics = dataManager.updateAnalytics();
        
        document.getElementById('total-students').textContent = analytics.totalStudents;
        document.getElementById('total-teachers').textContent = analytics.totalTeachers;
        document.getElementById('avg-attendance').textContent = analytics.averageAttendance + '%';
        document.getElementById('unread-messages').textContent = dataManager.getUnreadMessageCount(this.currentUser.id);
        
        this.loadRecentActivity();
    }

    loadRecentActivity() {
        const activities = dataManager.getRecentActivity(10);
        const activityDiv = document.getElementById('recent-activity-list');
        
        if (activities.length === 0) {
            activityDiv.innerHTML = '<p>No recent activity.</p>';
            return;
        }

        activityDiv.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">📊</div>
                <div class="activity-content">
                    <h5>${activity.description}</h5>
                    <p>By ${activity.user} • ${new Date(activity.date).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
    }

    loadAdminAnalytics() {
        const analyticsDiv = document.getElementById('analytics-charts');
        const analytics = dataManager.updateAnalytics();
        
        analyticsDiv.innerHTML = `
            <div class="analytics-grid">
                <div class="chart-container">
                    <h4>Grade Distribution</h4>
                    <div id="grade-distribution-chart">
                        <p>Grade distribution chart would go here</p>
                    </div>
                </div>
                <div class="chart-container">
                    <h4>Attendance Trends</h4>
                    <div id="attendance-trends-chart">
                        <p>Attendance trends chart would go here</p>
                    </div>
                </div>
                <div class="chart-container">
                    <h4>Top Performing Students</h4>
                    <div id="top-students-list">
                        ${analytics.topPerformingStudents.map((student, index) => `
                            <div class="top-student-item">
                                <span class="rank">${index + 1}</span>
                                <span class="name">${student.profile.name}</span>
                                <span class="grade">${student.averageGrade}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    loadAdminSettings() {
        const settings = dataManager.getSettings();
        
        document.getElementById('school-name').value = settings.schoolName;
        document.getElementById('academic-year').value = settings.academicYear;
        document.getElementById('grading-scale').value = settings.gradingScale;
        document.getElementById('max-students').value = settings.maxStudentsPerTeacher;
    }

    loadAdminMessages() {
        const messages = dataManager.getMessagesForUser(this.currentUser.id);
        const messagesDiv = document.getElementById('admin-messages-list');
        
        if (messages.length === 0) {
            messagesDiv.innerHTML = '<p>No messages available.</p>';
            return;
        }

        messagesDiv.innerHTML = messages.map(message => {
            const sender = dataManager.getUserById(message.fromUserId);
            const isUnread = !message.isRead && message.toUserId === this.currentUser.id;
            
            return `
                <div class="message-card ${isUnread ? 'unread' : ''}" onclick="app.openMessage('${message.id}')">
                    <h4>${message.subject}</h4>
                    <div class="message-meta">
                        <span>From: ${sender?.profile?.name || sender?.username}</span>
                        <span>${new Date(message.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="message-preview">${message.content.substring(0, 100)}...</div>
                </div>
            `;
        }).join('');
    }

    // New Feature Methods
    openComposeMessage() {
        const modal = this.openModal('Compose Message', `
            <form id="compose-message-form">
                <div class="form-group">
                    <label for="message-to">To:</label>
                    <select id="message-to" required>
                        <option value="">Select Recipient</option>
                        ${this.getRecipientsList()}
                    </select>
                </div>
                <div class="form-group">
                    <label for="message-subject">Subject:</label>
                    <input type="text" id="message-subject" required>
                </div>
                <div class="form-group">
                    <label for="message-content">Message:</label>
                    <textarea id="message-content" rows="6" required></textarea>
                </div>
                <div class="form-group">
                    <label for="message-type">Type:</label>
                    <select id="message-type">
                        <option value="general">General</option>
                        <option value="urgent">Urgent</option>
                        <option value="announcement">Announcement</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Send Message</button>
            </form>
        `);

        document.getElementById('compose-message-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const toUserId = document.getElementById('message-to').value;
            const subject = document.getElementById('message-subject').value;
            const content = document.getElementById('message-content').value;
            const messageType = document.getElementById('message-type').value;

            dataManager.sendMessage(this.currentUser.id, toUserId, subject, content, messageType);
            this.closeModal();
            this.showMessage('Message sent successfully!', 'success');
            
            // Refresh messages
            if (this.currentRole === 'student') {
                this.loadStudentMessages();
            } else if (this.currentRole === 'teacher') {
                this.loadTeacherMessages();
            } else if (this.currentRole === 'admin') {
                this.loadAdminMessages();
            }
        });
    }

    getRecipientsList() {
        let recipients = '';
        
        if (this.currentRole === 'student') {
            const student = dataManager.getStudentByUserId(this.currentUser.id);
            if (student.assignedTeacher) {
                const teacher = dataManager.getUserById(student.assignedTeacher);
                recipients += `<option value="${teacher.id}">${teacher.profile.name} (Teacher)</option>`;
            }
        } else if (this.currentRole === 'teacher') {
            const students = dataManager.getStudentsByTeacher(this.currentUser.id);
            students.forEach(student => {
                recipients += `<option value="${student.id}">${student.profile.name} (Student)</option>`;
            });
        } else if (this.currentRole === 'admin') {
            dataManager.data.users.forEach(user => {
                if (user.id !== this.currentUser.id) {
                    recipients += `<option value="${user.id}">${user.profile.name || user.username} (${user.role})</option>`;
                }
            });
        }
        
        return recipients;
    }

    openMessage(messageId) {
        const message = dataManager.data.messages.find(m => m.id === messageId);
        if (!message) return;

        dataManager.markMessageAsRead(messageId);
        const sender = dataManager.getUserById(message.fromUserId);
        
        const modal = this.openModal('Message', `
            <div class="message-detail">
                <h4>${message.subject}</h4>
                <div class="message-meta">
                    <p><strong>From:</strong> ${sender?.profile?.name || sender?.username}</p>
                    <p><strong>Date:</strong> ${new Date(message.createdAt).toLocaleString()}</p>
                    <p><strong>Type:</strong> ${message.messageType}</p>
                </div>
                <div class="message-content">
                    <p>${message.content}</p>
                </div>
            </div>
        `);
    }

    markAttendance(studentId) {
        const student = dataManager.data.students.find(s => s.id === studentId);
        if (!student) return;

        const today = new Date().toISOString().split('T')[0];
        const existingAttendance = dataManager.data.attendance.find(a => 
            a.studentId === studentId && a.date === today
        );

        const modal = this.openModal(`Mark Attendance - ${student.profile.name}`, `
            <form id="attendance-form">
                <div class="form-group">
                    <label for="attendance-date">Date:</label>
                    <input type="date" id="attendance-date" value="${today}" required>
                </div>
                <div class="form-group">
                    <label for="attendance-status">Status:</label>
                    <select id="attendance-status" required>
                        <option value="present" ${existingAttendance?.status === 'present' ? 'selected' : ''}>Present</option>
                        <option value="absent" ${existingAttendance?.status === 'absent' ? 'selected' : ''}>Absent</option>
                        <option value="late" ${existingAttendance?.status === 'late' ? 'selected' : ''}>Late</option>
                        <option value="excused" ${existingAttendance?.status === 'excused' ? 'selected' : ''}>Excused</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="attendance-remarks">Remarks:</label>
                    <textarea id="attendance-remarks" rows="3">${existingAttendance?.remarks || ''}</textarea>
                </div>
                <button type="submit" class="btn btn-primary">Save Attendance</button>
            </form>
        `);

        document.getElementById('attendance-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const date = document.getElementById('attendance-date').value;
            const status = document.getElementById('attendance-status').value;
            const remarks = document.getElementById('attendance-remarks').value;

            dataManager.markAttendance(studentId, date, status, remarks);
            this.closeModal();
            this.showMessage('Attendance marked successfully!', 'success');
            
            // Refresh attendance data
            if (this.currentRole === 'teacher') {
                this.loadTeacherStudents();
            }
        });
    }

    createEvent() {
        const modal = this.openModal('Create Event', `
            <form id="event-form">
                <div class="form-group">
                    <label for="event-title">Event Title:</label>
                    <input type="text" id="event-title" required>
                </div>
                <div class="form-group">
                    <label for="event-description">Description:</label>
                    <textarea id="event-description" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label for="event-start-date">Start Date:</label>
                    <input type="datetime-local" id="event-start-date" required>
                </div>
                <div class="form-group">
                    <label for="event-end-date">End Date:</label>
                    <input type="datetime-local" id="event-end-date" required>
                </div>
                <div class="form-group">
                    <label for="event-type">Event Type:</label>
                    <select id="event-type">
                        <option value="general">General</option>
                        <option value="exam">Exam</option>
                        <option value="holiday">Holiday</option>
                        <option value="meeting">Meeting</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Create Event</button>
            </form>
        `);

        document.getElementById('event-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('event-title').value;
            const description = document.getElementById('event-description').value;
            const startDate = document.getElementById('event-start-date').value;
            const endDate = document.getElementById('event-end-date').value;
            const eventType = document.getElementById('event-type').value;

            dataManager.createEvent(this.currentUser.id, title, description, startDate, endDate, eventType);
            this.closeModal();
            this.showMessage('Event created successfully!', 'success');
        });
    }

    // Search and Filter Methods
    searchStudents(query) {
        const students = dataManager.getStudentsByTeacher(this.currentUser.id);
        const filteredStudents = students.filter(student => 
            student.profile.name.toLowerCase().includes(query.toLowerCase()) ||
            student.studentId.toLowerCase().includes(query.toLowerCase())
        );
        
        this.displayStudents(filteredStudents);
    }

    searchUsers(query) {
        const role = document.getElementById('user-role-filter')?.value;
        const users = dataManager.searchUsers(query, role);
        
        if (role === 'student' || !role) {
            this.displayStudents(users.filter(u => u.role === 'student'));
        }
        if (role === 'teacher' || !role) {
            this.displayTeachers(users.filter(u => u.role === 'teacher'));
        }
    }

    searchMessages(query) {
        const messages = dataManager.searchMessages(query, this.currentUser.id);
        const messagesDiv = document.getElementById('messages-list') || 
                          document.getElementById('teacher-messages-list') || 
                          document.getElementById('admin-messages-list');
        
        if (!messagesDiv) return;
        
        if (messages.length === 0) {
            messagesDiv.innerHTML = '<p>No messages found.</p>';
            return;
        }

        messagesDiv.innerHTML = messages.map(message => {
            const sender = dataManager.getUserById(message.fromUserId);
            const isUnread = !message.isRead && message.toUserId === this.currentUser.id;
            
            return `
                <div class="message-card ${isUnread ? 'unread' : ''}" onclick="app.openMessage('${message.id}')">
                    <h4>${message.subject}</h4>
                    <div class="message-meta">
                        <span>From: ${sender?.profile?.name || sender?.username}</span>
                        <span>${new Date(message.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="message-preview">${message.content.substring(0, 100)}...</div>
                </div>
            `;
        }).join('');
    }

    filterGrades(subject) {
        this.loadStudentGrades(subject);
    }

    filterUsersByRole(role) {
        this.searchUsers(document.getElementById('user-search')?.value || '');
    }

    // Settings Management
    handleSettingsSubmit(e) {
        e.preventDefault();
        const settings = {
            schoolName: document.getElementById('school-name').value,
            academicYear: parseInt(document.getElementById('academic-year').value),
            gradingScale: document.getElementById('grading-scale').value,
            maxStudentsPerTeacher: parseInt(document.getElementById('max-students').value)
        };

        dataManager.updateSettings(settings);
        this.showMessage('Settings updated successfully!', 'success');
    }

    // Enhanced Tab Switching
    switchTab(e) {
        const tabName = e.target.dataset.tab;
        
        // Remove active class from all tabs and content
        const allTabs = e.target.closest('.dashboard-tabs') || e.target.closest('.tabs');
        if (allTabs) {
            allTabs.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            allTabs.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        }
        
        // Add active class to clicked tab
        e.target.classList.add('active');
        
        // Show corresponding content
        const contentId = tabName.replace('-', '-');
        const contentElement = document.getElementById(contentId);
        if (contentElement) {
            contentElement.classList.add('active');
        }

        // Load content based on tab
        this.loadTabContent(tabName);
    }

    loadTabContent(tabName) {
        switch(tabName) {
            case 'student-grades':
                this.loadStudentGrades();
                break;
            case 'student-attendance':
                this.loadStudentAttendance();
                break;
            case 'student-messages':
                this.loadStudentMessages();
                break;
            case 'student-calendar':
                this.loadStudentCalendar();
                break;
            case 'teacher-students':
                this.loadTeacherStudents();
                break;
            case 'teacher-grades':
                // Load grade management
                break;
            case 'teacher-attendance':
                // Load attendance management
                break;
            case 'teacher-messages':
                this.loadTeacherMessages();
                break;
            case 'teacher-calendar':
                this.loadTeacherCalendar();
                break;
            case 'teacher-analytics':
                this.loadTeacherAnalytics();
                break;
            case 'admin-overview':
                this.loadAdminOverview();
                break;
            case 'admin-users':
                this.loadAllStudents();
                this.loadAllTeachers();
                break;
            case 'admin-analytics':
                this.loadAdminAnalytics();
                break;
            case 'admin-settings':
                this.loadAdminSettings();
                break;
            case 'admin-messages':
                this.loadAdminMessages();
                break;
        }
    }

    // Display helper methods
    displayStudents(students) {
        const studentsDiv = document.getElementById('students-list') || document.getElementById('students-list-admin');
        if (!studentsDiv) return;

        if (students.length === 0) {
            studentsDiv.innerHTML = '<p>No students found.</p>';
            return;
        }

        studentsDiv.innerHTML = students.map(student => {
            const attendanceStats = dataManager.getAttendanceStats(student.id);
            const averageGrade = dataManager.getGradeAverage(student.id);
            
            return `
                <div class="student-card">
                    <h4>${student.profile.name || 'N/A'}</h4>
                    <p><strong>Student ID:</strong> ${student.studentId}</p>
                    <p><strong>Class:</strong> ${student.profile.class || 'N/A'}</p>
                    <p><strong>Contact:</strong> ${student.profile.contact || 'N/A'}</p>
                    <p><strong>Attendance:</strong> ${attendanceStats.percentage}%</p>
                    <p><strong>Average Grade:</strong> ${averageGrade}%</p>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="app.updateStudentProgress('${student.id}')">
                            Update Progress
                        </button>
                        <button class="btn btn-secondary" onclick="app.manageStudentGrades('${student.id}')">
                            Manage Grades
                        </button>
                        <button class="btn btn-success" onclick="app.markAttendance('${student.id}')">
                            Mark Attendance
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    displayTeachers(teachers) {
        const teachersDiv = document.getElementById('teachers-list-admin');
        if (!teachersDiv) return;

        if (teachers.length === 0) {
            teachersDiv.innerHTML = '<p>No teachers found.</p>';
            return;
        }

        teachersDiv.innerHTML = teachers.map(teacher => {
            const studentCount = dataManager.getStudentsByTeacher(teacher.id).length;
            return `
                <div class="teacher-card">
                    <h4>${teacher.profile.name || 'N/A'}</h4>
                    <p><strong>Teacher ID:</strong> ${teacher.teacherId}</p>
                    <p><strong>Subject:</strong> ${teacher.profile.subject || 'N/A'}</p>
                    <p><strong>Students:</strong> ${studentCount}/${teacher.maxStudents}</p>
                </div>
            `;
        }).join('');
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${type.toUpperCase()}</strong>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize the application
const app = new StudentTeacherPortal();
