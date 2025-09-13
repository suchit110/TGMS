# Student-Teacher Portal

A simple web application for student-teacher interaction built with HTML, CSS, and JavaScript. The application uses local JSON storage (localStorage) instead of a backend database.

## Features

### Authentication
- **Sign Up**: Students and teachers can create accounts with username, password, and role
- **Login**: Secure authentication with role-based access
- **No Default Credentials**: All users must create their own accounts

### Student Features
- **Profile Management**: Complete profile with name, class, age, contact information
- **Progress Reports**: View marks, attendance, behavior, and teacher remarks
- **Notices**: See announcements from assigned teacher
- **Report Download**: Download progress reports as HTML files

### Teacher Features
- **Profile Management**: Create teacher profile with subject and experience
- **Student Management**: View assigned students (up to 20 per teacher)
- **Progress Updates**: Add/update student marks, attendance, behavior, and remarks
- **Notices**: Post announcements visible to all assigned students
- **Auto Assignment**: Students are automatically assigned to teachers with available capacity

### Admin Features
- **User Management**: View all students and teachers
- **Student Reassignment**: Reassign students to different teachers
- **Data Export**: Export all data as JSON backup
- **Data Management**: Clear all data for testing/reset

## Getting Started

1. **Open the Application**
   - Simply open `index.html` in a web browser
   - No server setup required - runs entirely in the browser

2. **Create Admin Account** (Optional)
   - Use the default admin account: username `admin`, password `admin123`
   - Or create a new admin account through the signup form

3. **Create User Accounts**
   - Teachers: Sign up with role "Teacher"
   - Students: Sign up with role "Student"

## User Workflow

### For Students:
1. Sign up with student role
2. Complete profile information on first login
3. View progress reports and notices from assigned teacher
4. Download progress reports as needed

### For Teachers:
1. Sign up with teacher role
2. Complete teacher profile (subject, experience)
3. View assigned students
4. Update student progress and post notices
5. Monitor student performance

### For Admins:
1. Login with admin credentials
2. View all users and their assignments
3. Reassign students if needed
4. Export data for backup

## Technical Details

### Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser localStorage (simulates database)
- **No Backend**: Pure client-side application

### Data Structure
The application stores data in localStorage with the following structure:
```json
{
  "users": [],
  "students": [],
  "teachers": [],
  "progressReports": [],
  "notices": [],
  "assignments": []
}
```

### Key Features
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: Data persists between browser sessions
- **Role-Based Access**: Different interfaces for students, teachers, and admins
- **Auto Assignment**: Students automatically assigned to teachers with capacity
- **Data Export**: Backup functionality for data preservation

## File Structure
```
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── app.js             # Main application logic
├── data.js            # Data management and storage
└── README.md          # This file
```

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Data Persistence
- All data is stored in browser localStorage
- Data persists between browser sessions
- Data is specific to each browser/device
- Use export/import for data backup and transfer

## Security Notes
- Passwords are stored in plain text (for demo purposes)
- In production, implement proper password hashing
- Consider adding input validation and sanitization
- Add CSRF protection for forms

## Customization
- Modify `styles.css` for visual customization
- Update `data.js` for data structure changes
- Extend `app.js` for additional functionality
- Add new features by following the existing patterns

## Troubleshooting
- **Data not saving**: Check if localStorage is enabled in browser
- **Login issues**: Ensure username/password/role combination is correct
- **Profile not updating**: Complete all required fields in profile form
- **Students not assigned**: Check if teachers have completed their profiles

## Future Enhancements
- Password hashing and encryption
- Email notifications
- File upload for documents
- Advanced reporting and analytics
- Mobile app version
- Real-time notifications
- Integration with external systems

## License
This project is open source and available under the MIT License.
