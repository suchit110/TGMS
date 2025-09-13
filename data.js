// Data management for the Student-Teacher Portal
class DataManager {
    constructor() {
        this.data = this.loadData();
        this.initializeData();
    }

    // Load data from localStorage or create default structure
    loadData() {
        const storedData = localStorage.getItem('studentTeacherPortal');
        if (storedData) {
            return JSON.parse(storedData);
        }
        return {
            users: [],
            students: [],
            teachers: [],
            progressReports: [],
            notices: [],
            assignments: [], // student-teacher assignments
            attendance: [], // daily attendance records
            messages: [], // communication between users
            events: [], // calendar events
            grades: [], // detailed grade history
            analytics: {}, // system analytics
            settings: { // system settings
                schoolName: "Demo School",
                academicYear: new Date().getFullYear(),
                gradingScale: "A-F",
                maxStudentsPerTeacher: 20
            }
        };
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem('studentTeacherPortal', JSON.stringify(this.data));
    }

    // Initialize with sample data if empty
    initializeData() {
        if (this.data.users.length === 0) {
            // Add sample admin user
            this.addUser('admin', 'admin123', 'admin', {
                name: 'System Administrator',
                email: 'admin@school.com'
            });
        }
    }

    // User management
    addUser(username, password, role, profile = {}) {
        const user = {
            id: this.generateId(),
            username,
            password, // In real app, this would be hashed
            role,
            profile,
            createdAt: new Date().toISOString()
        };
        
        this.data.users.push(user);
        
        if (role === 'student') {
            this.data.students.push({
                ...user,
                studentId: this.generateStudentId(),
                assignedTeacher: null,
                isProfileComplete: false
            });
        } else if (role === 'teacher') {
            this.data.teachers.push({
                ...user,
                teacherId: this.generateTeacherId(),
                isProfileComplete: false,
                maxStudents: 20
            });
        }
        
        this.saveData();
        return user;
    }

    // Authenticate user
    authenticateUser(username, password, role) {
        const user = this.data.users.find(u => 
            u.username === username && 
            u.password === password && 
            u.role === role
        );
        return user;
    }

    // Get user by ID
    getUserById(userId) {
        return this.data.users.find(u => u.id === userId);
    }

    // Get student by user ID
    getStudentByUserId(userId) {
        return this.data.students.find(s => s.id === userId);
    }

    // Get teacher by user ID
    getTeacherByUserId(userId) {
        return this.data.teachers.find(t => t.id === userId);
    }

    // Update student profile
    updateStudentProfile(userId, profileData) {
        const student = this.getStudentByUserId(userId);
        if (student) {
            student.profile = { ...student.profile, ...profileData };
            student.isProfileComplete = true;
            
            // Auto-assign teacher if not assigned
            if (!student.assignedTeacher) {
                this.assignStudentToTeacher(student.id);
            }
            
            this.saveData();
            return student;
        }
        return null;
    }

    // Update teacher profile
    updateTeacherProfile(userId, profileData) {
        const teacher = this.getTeacherByUserId(userId);
        if (teacher) {
            teacher.profile = { ...teacher.profile, ...profileData };
            teacher.isProfileComplete = true;
            this.saveData();
            return teacher;
        }
        return null;
    }

    // Assign student to teacher
    assignStudentToTeacher(studentId) {
        const student = this.data.students.find(s => s.id === studentId);
        if (!student || student.assignedTeacher) return;

        // Find teacher with least students
        const teacher = this.data.teachers
            .filter(t => t.isProfileComplete)
            .map(t => ({
                ...t,
                studentCount: this.getStudentsByTeacher(t.id).length
            }))
            .sort((a, b) => a.studentCount - b.studentCount)[0];

        if (teacher && teacher.studentCount < teacher.maxStudents) {
            student.assignedTeacher = teacher.id;
            this.saveData();
        }
    }

    // Get students assigned to a teacher
    getStudentsByTeacher(teacherId) {
        return this.data.students.filter(s => s.assignedTeacher === teacherId);
    }

    // Add progress report
    addProgressReport(teacherId, studentId, reportData) {
        const report = {
            id: this.generateId(),
            teacherId,
            studentId,
            ...reportData,
            createdAt: new Date().toISOString()
        };
        
        this.data.progressReports.push(report);
        this.saveData();
        return report;
    }

    // Get progress reports for a student
    getProgressReportsForStudent(studentId) {
        return this.data.progressReports
            .filter(r => r.studentId === studentId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Update progress report
    updateProgressReport(reportId, reportData) {
        const report = this.data.progressReports.find(r => r.id === reportId);
        if (report) {
            Object.assign(report, reportData);
            this.saveData();
            return report;
        }
        return null;
    }

    // Add notice
    addNotice(teacherId, noticeData) {
        const notice = {
            id: this.generateId(),
            teacherId,
            ...noticeData,
            createdAt: new Date().toISOString()
        };
        
        this.data.notices.push(notice);
        this.saveData();
        return notice;
    }

    // Get notices for students of a teacher
    getNoticesForStudents(teacherId) {
        return this.data.notices
            .filter(n => n.teacherId === teacherId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Get all students
    getAllStudents() {
        return this.data.students;
    }

    // Get all teachers
    getAllTeachers() {
        return this.data.teachers;
    }

    // Reassign student to different teacher
    reassignStudent(studentId, newTeacherId) {
        const student = this.data.students.find(s => s.id === studentId);
        const newTeacher = this.data.teachers.find(t => t.id === newTeacherId);
        
        if (student && newTeacher) {
            const currentStudentCount = this.getStudentsByTeacher(newTeacherId).length;
            if (currentStudentCount < newTeacher.maxStudents) {
                student.assignedTeacher = newTeacherId;
                this.saveData();
                return true;
            }
        }
        return false;
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Generate student ID
    generateStudentId() {
        const year = new Date().getFullYear();
        const count = this.data.students.length + 1;
        return `STU${year}${count.toString().padStart(4, '0')}`;
    }

    // Generate teacher ID
    generateTeacherId() {
        const count = this.data.teachers.length + 1;
        return `TCH${count.toString().padStart(3, '0')}`;
    }

    // Export data as JSON (for backup)
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    // Import data from JSON (for restore)
    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            this.data = importedData;
            this.saveData();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all data (for testing)
    clearData() {
        this.data = {
            users: [],
            students: [],
            teachers: [],
            progressReports: [],
            notices: [],
            assignments: [],
            attendance: [],
            messages: [],
            events: [],
            grades: [],
            analytics: {},
            settings: {
                schoolName: "Demo School",
                academicYear: new Date().getFullYear(),
                gradingScale: "A-F",
                maxStudentsPerTeacher: 20
            }
        };
        this.saveData();
    }

    // Attendance Management
    markAttendance(studentId, date, status, remarks = '') {
        const attendance = {
            id: this.generateId(),
            studentId,
            date,
            status, // 'present', 'absent', 'late', 'excused'
            remarks,
            markedBy: this.currentUser?.id,
            createdAt: new Date().toISOString()
        };
        
        // Remove existing attendance for this date
        this.data.attendance = this.data.attendance.filter(a => 
            !(a.studentId === studentId && a.date === date)
        );
        
        this.data.attendance.push(attendance);
        this.saveData();
        return attendance;
    }

    getAttendanceForStudent(studentId, startDate, endDate) {
        return this.data.attendance
            .filter(a => a.studentId === studentId)
            .filter(a => {
                const attDate = new Date(a.date);
                return attDate >= new Date(startDate) && attDate <= new Date(endDate);
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    getAttendanceStats(studentId) {
        const allAttendance = this.data.attendance.filter(a => a.studentId === studentId);
        const total = allAttendance.length;
        const present = allAttendance.filter(a => a.status === 'present').length;
        const absent = allAttendance.filter(a => a.status === 'absent').length;
        const late = allAttendance.filter(a => a.status === 'late').length;
        
        return {
            total,
            present,
            absent,
            late,
            percentage: total > 0 ? Math.round((present / total) * 100) : 0
        };
    }

    // Messaging System
    sendMessage(fromUserId, toUserId, subject, content, messageType = 'general') {
        const message = {
            id: this.generateId(),
            fromUserId,
            toUserId,
            subject,
            content,
            messageType, // 'general', 'urgent', 'announcement'
            isRead: false,
            createdAt: new Date().toISOString()
        };
        
        this.data.messages.push(message);
        this.saveData();
        return message;
    }

    getMessagesForUser(userId) {
        return this.data.messages
            .filter(m => m.toUserId === userId || m.fromUserId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    getUnreadMessageCount(userId) {
        return this.data.messages.filter(m => m.toUserId === userId && !m.isRead).length;
    }

    markMessageAsRead(messageId) {
        const message = this.data.messages.find(m => m.id === messageId);
        if (message) {
            message.isRead = true;
            this.saveData();
        }
    }

    // Calendar Events
    createEvent(createdBy, title, description, startDate, endDate, eventType = 'general') {
        const event = {
            id: this.generateId(),
            createdBy,
            title,
            description,
            startDate,
            endDate,
            eventType, // 'general', 'exam', 'holiday', 'meeting'
            participants: [],
            createdAt: new Date().toISOString()
        };
        
        this.data.events.push(event);
        this.saveData();
        return event;
    }

    getEventsForDate(date) {
        const targetDate = new Date(date).toDateString();
        return this.data.events.filter(event => {
            const startDate = new Date(event.startDate).toDateString();
            const endDate = new Date(event.endDate).toDateString();
            return targetDate >= startDate && targetDate <= endDate;
        });
    }

    // Grade Management
    addGrade(studentId, subject, grade, maxGrade, gradeType = 'assignment', remarks = '') {
        const gradeRecord = {
            id: this.generateId(),
            studentId,
            subject,
            grade,
            maxGrade,
            percentage: Math.round((grade / maxGrade) * 100),
            gradeType, // 'assignment', 'quiz', 'exam', 'project'
            remarks,
            addedBy: this.currentUser?.id,
            createdAt: new Date().toISOString()
        };
        
        this.data.grades.push(gradeRecord);
        this.saveData();
        return gradeRecord;
    }

    getGradesForStudent(studentId, subject = null) {
        let grades = this.data.grades.filter(g => g.studentId === studentId);
        if (subject) {
            grades = grades.filter(g => g.subject.toLowerCase() === subject.toLowerCase());
        }
        return grades.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    getGradeAverage(studentId, subject = null) {
        const grades = this.getGradesForStudent(studentId, subject);
        if (grades.length === 0) return 0;
        
        const totalPercentage = grades.reduce((sum, grade) => sum + grade.percentage, 0);
        return Math.round(totalPercentage / grades.length);
    }

    // Analytics
    updateAnalytics() {
        const analytics = {
            totalStudents: this.data.students.length,
            totalTeachers: this.data.teachers.length,
            totalMessages: this.data.messages.length,
            totalEvents: this.data.events.length,
            averageAttendance: this.calculateAverageAttendance(),
            topPerformingStudents: this.getTopPerformingStudents(),
            recentActivity: this.getRecentActivity(),
            lastUpdated: new Date().toISOString()
        };
        
        this.data.analytics = analytics;
        this.saveData();
        return analytics;
    }

    calculateAverageAttendance() {
        const students = this.data.students;
        if (students.length === 0) return 0;
        
        const totalPercentage = students.reduce((sum, student) => {
            const stats = this.getAttendanceStats(student.id);
            return sum + stats.percentage;
        }, 0);
        
        return Math.round(totalPercentage / students.length);
    }

    getTopPerformingStudents(limit = 5) {
        return this.data.students
            .map(student => ({
                ...student,
                averageGrade: this.getGradeAverage(student.id)
            }))
            .sort((a, b) => b.averageGrade - a.averageGrade)
            .slice(0, limit);
    }

    getRecentActivity(limit = 10) {
        const activities = [];
        
        // Add recent progress reports
        this.data.progressReports
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit)
            .forEach(report => {
                activities.push({
                    type: 'progress_report',
                    description: 'Progress report updated',
                    date: report.createdAt,
                    user: this.getUserById(report.teacherId)?.username
                });
            });
        
        // Add recent messages
        this.data.messages
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit)
            .forEach(message => {
                activities.push({
                    type: 'message',
                    description: `Message: ${message.subject}`,
                    date: message.createdAt,
                    user: this.getUserById(message.fromUserId)?.username
                });
            });
        
        return activities
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // Search functionality
    searchUsers(query, role = null) {
        let users = this.data.users;
        if (role) {
            users = users.filter(u => u.role === role);
        }
        
        return users.filter(user => 
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            (user.profile?.name && user.profile.name.toLowerCase().includes(query.toLowerCase()))
        );
    }

    searchMessages(query, userId) {
        return this.data.messages
            .filter(m => m.toUserId === userId || m.fromUserId === userId)
            .filter(m => 
                m.subject.toLowerCase().includes(query.toLowerCase()) ||
                m.content.toLowerCase().includes(query.toLowerCase())
            )
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Settings management
    updateSettings(newSettings) {
        this.data.settings = { ...this.data.settings, ...newSettings };
        this.saveData();
        return this.data.settings;
    }

    getSettings() {
        return this.data.settings;
    }
}

// Create global data manager instance
window.dataManager = new DataManager();
