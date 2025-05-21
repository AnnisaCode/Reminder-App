# Sophisticated Reminder Application

A beautiful, secure, and user-friendly web application for managing reminders with real-time notifications. This application helps users track important deadlines and never miss an important event.

## Features

- 🕒 **Real-time Reminders**: Set reminders with precise date and time
- 🔔 **Instant Notifications**: Receive alert notifications when reminders are due
- 🔒 **Secure Storage**: All reminders are encrypted before storing in the browser's local storage
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🌙 **Dark Mode Support**: Automatically adapts to system preferences
- 🎨 **Beautiful UI**: Modern design with animations and visual feedback
- 🛡️ **Security Measures**: Protection against XSS attacks, input sanitization, and rate limiting

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 4.5.2
- **Icons**: Font Awesome 5.15.3
- **Alerts & Notifications**: SweetAlert2
- **Storage**: Encrypted Local Storage
- **Animation**: CSS3 Transitions & Keyframes

## Security Features

The application includes several security measures:

1. **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
2. **Content Security Policy**: Restricts script sources to trusted domains
3. **Data Encryption**: Simple encryption for local storage data (XOR + Base64)
4. **Rate Limiting**: Prevents rapid submission of multiple reminders
5. **Time Validation**: Ensures reminders are set for future times
6. **Error Handling**: Secure error handling to prevent data leakage
7. **Suspicious Pattern Detection**: Blocks attempts to inject malicious code

## Installation

This is a client-side application that runs entirely in the browser. No server-side installation is required.

1. Clone the repository:

   ```bash
   git clone https://github.com/annisacode/reminder-app.git
   ```

2. Navigate to the project directory:

   ```bash
   cd reminder-app
   ```

3. Open `index.html` in your web browser:
   ```bash
   open index.html
   ```

Alternatively, you can host the files on any static web server.

## Usage Guide

### Adding a Reminder

1. Enter a description for your reminder in the "Reminder Description" field
2. Select the date and time for the reminder
3. Click the "Add Reminder" button

### Managing Reminders

- View all your upcoming reminders in the list below the form
- Each reminder shows:
  - Description text
  - Scheduled date and time
  - Time remaining until the reminder
- To delete a reminder, click the "Remove" button

### Notifications

- When a reminder is due, a notification will appear on the screen
- The notification includes:
  - The reminder description
  - A sound alert
  - Visual highlight in the reminders list

## Browser Compatibility

The application is compatible with:

- Google Chrome (latest 2 versions)
- Mozilla Firefox (latest 2 versions)
- Microsoft Edge (latest 2 versions)
- Safari (latest 2 versions)
- Opera (latest version)

## Development

### Project Structure

```
reminder-application/
├── index.html          # Main HTML structure
├── style.css           # CSS styling
├── script.js           # Application logic
└── README.md           # Documentation
```

### Extending the Application

To add new features to the application:

1. **Custom Reminder Categories**: Add category selection to the form and update the styling accordingly
2. **Recurring Reminders**: Implement logic for daily, weekly, or monthly recurring reminders
3. **Priority Levels**: Add priority selection and color-coding
4. **User Accounts**: Implement user authentication and cloud storage

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Bootstrap](https://getbootstrap.com/) - UI framework
- [Font Awesome](https://fontawesome.com/) - Icons
- [SweetAlert2](https://sweetalert2.github.io/) - Beautiful alert boxes
- [jQuery](https://jquery.com/) - JavaScript library

---

Made with ❤️ by AnnisaCode | &copy; 2025
