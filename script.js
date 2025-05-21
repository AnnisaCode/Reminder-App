document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reminder-form');
    const reminderList = document.getElementById('reminder-list');
    const reminderText = document.getElementById('reminder-text');
    const reminderTime = document.getElementById('reminder-time');

    // Security measure: Set default time to current time + 5 minutes
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const defaultTime = now.toISOString().slice(0, 16);
    reminderTime.value = defaultTime;
    reminderTime.min = defaultTime; // Prevent selecting past dates

    // Load reminders from local storage on page load
    loadReminders();

    // Security measure: Input sanitization function
    function sanitizeInput(input) {
        const temp = document.createElement('div');
        temp.textContent = input;
        return temp.innerHTML;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission

        const reminderTextValue = reminderText.value.trim(); // Trim whitespace
        const reminderTimeValue = reminderTime.value;

        // Security measure: Input validation
        if (!reminderTextValue) {
            showAlert('Error', 'Please enter a reminder description.', 'error');
            return;
        }
        if (!reminderTimeValue) {
            showAlert('Error', 'Please select a date and time for the reminder.', 'error');
            return;
        }

        // Security measure: Check for XSS attempts in reminder text
        if (containsScriptTags(reminderTextValue)) {
            showAlert('Security Error', 'Invalid characters detected in reminder text.', 'error');
            reminderText.value = '';
            return;
        }

        // Security measure: Rate limiting to prevent DoS
        if (isRateLimited()) {
            showAlert('Error', 'Please wait a moment before adding another reminder.', 'warning');
            return;
        }

        const reminderDateTime = new Date(reminderTimeValue);
        const currentTime = new Date();

        if (reminderDateTime <= currentTime) {
            showAlert('Error', 'Reminder time must be in the future.', 'error');
            return;
        }

        // Security measure: Set time threshold (e.g., 1 year in advance)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        if (reminderDateTime > maxDate) {
            showAlert('Error', 'Reminder cannot be set more than 1 year in advance.', 'error');
            return;
        }

        // Security measure: Sanitize input before using
        const sanitizedText = sanitizeInput(reminderTextValue);

        addReminder(sanitizedText, reminderTimeValue);
        form.reset(); // Clear the form after submission

        // Reset time to default (now + 5 minutes)
        const newNow = new Date();
        newNow.setMinutes(newNow.getMinutes() + 5);
        reminderTime.value = newNow.toISOString().slice(0, 16);

        saveReminders(); // Save reminders to local storage

        // Record last submission time for rate limiting
        localStorage.setItem('lastSubmissionTime', new Date().getTime());
    });

    // Security measure: Rate limiting implementation
    function isRateLimited() {
        const lastSubmissionTime = localStorage.getItem('lastSubmissionTime');
        if (!lastSubmissionTime) return false;

        const timeSinceLastSubmission = new Date().getTime() - parseInt(lastSubmissionTime);
        return timeSinceLastSubmission < 1000; // 1-second cooldown
    }

    // Security measure: Check for script tags or suspicious patterns
    function containsScriptTags(text) {
        const suspicious = /<script|javascript:|onerror=|onclick=|onload=|eval\(|alert\(|document\.cookie|window\.location/i;
        return suspicious.test(text);
    }

    function showAlert(title, message, icon) {
        Swal.fire({
            title: title,
            text: message,
            icon: icon,
            confirmButtonColor: '#6a11cb',
            timer: icon === 'error' ? 5000 : 3000,
            timerProgressBar: true
        });
    }

    function addReminder(text, time, isLoaded = false) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center reminder-item';

        // Add animation class for new reminders
        if (!isLoaded) {
            li.classList.add('new-reminder');
        }

        // Create a unique ID for this reminder for easier manipulation
        const reminderId = 'reminder-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        li.setAttribute('data-id', reminderId);

        // Store the original time value as a data attribute
        li.setAttribute('data-time', time);

        const reminderDateTime = new Date(time);
        const timeUntil = getTimeUntil(reminderDateTime);

        const spanContent = document.createElement('div');
        spanContent.innerHTML = `
            <strong>${text}</strong><br>
            <small>${reminderDateTime.toLocaleString()}</small><br>
            <span class="badge badge-pill badge-primary time-until">${timeUntil}</span>
        `;

        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';

        const removeButton = document.createElement('button');
        removeButton.className = 'btn btn-danger btn-sm remove-btn';
        removeButton.innerHTML = '<i class="fas fa-trash"></i> Remove';
        removeButton.addEventListener('click', () => {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Animation for removal
                    li.style.opacity = '0';
                    li.style.transform = 'translateX(100px)';
                    li.style.transition = 'all 0.3s ease';

                    setTimeout(() => {
                        reminderList.removeChild(li);
                        saveReminders(); // Update local storage after removal

                        showAlert('Deleted!', 'Your reminder has been deleted.', 'success');
                    }, 300);
                }
            });
        });

        buttonGroup.appendChild(removeButton);
        li.appendChild(spanContent);
        li.appendChild(buttonGroup);
        reminderList.appendChild(li);

        // Schedule notification only if reminder is newly added, not loaded from storage
        if (!isLoaded) {
            scheduleNotification(text, time, reminderId);
        } else {
            // If loading from storage, reschedule if still in future
            const now = new Date().getTime();
            const reminderTime = new Date(time).getTime();
            if (reminderTime > now) {
                scheduleNotification(text, time, reminderId);
            }
        }

        // Update time-until display every minute
        updateTimeUntilDisplay();
    }

    // Function to get formatted time until reminder
    function getTimeUntil(reminderDate) {
        const now = new Date();
        const diff = reminderDate - now;

        if (diff <= 0) return "Now!";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days}d ${hours}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    // Update all time-until displays
    function updateTimeUntilDisplay() {
        document.querySelectorAll('.reminder-item').forEach(item => {
            const timeElement = item.querySelector('.time-until');
            const originalTime = item.getAttribute('data-time');
            const reminderDate = new Date(originalTime);
            timeElement.textContent = getTimeUntil(reminderDate);

            // Add visual indicator if reminder is close (less than 1 hour)
            const diff = reminderDate - new Date();
            if (diff <= 1000 * 60 * 60 && diff > 0) { // Less than 1 hour
                timeElement.classList.add('badge-warning');
                timeElement.classList.remove('badge-primary');
            } else if (diff <= 0) { // Overdue
                timeElement.classList.add('badge-danger');
                timeElement.classList.remove('badge-primary', 'badge-warning');
                timeElement.textContent = "Overdue!";
            }
        });
    }

    // Run timer update every minute
    setInterval(updateTimeUntilDisplay, 60000);

    function scheduleNotification(text, time, reminderId) {
        const now = new Date().getTime();
        const reminderTime = new Date(time).getTime();
        const delay = reminderTime - now;

        if (delay > 0) {
            // Store ID of setTimeout to allow cancellation if reminder is deleted
            const timerId = setTimeout(() => {
                Swal.fire({
                    title: 'Reminder!',
                    text: text,
                    icon: 'info',
                    confirmButtonText: 'Got It!',
                    timer: 20000, // Notification disappears after 20 seconds
                    timerProgressBar: true
                });

                // Play notification sound
                playNotificationSound();

                // Add completed class to reminder
                const reminderElement = document.querySelector(`[data-id="${reminderId}"]`);
                if (reminderElement) {
                    reminderElement.classList.add('completed');
                    reminderElement.style.backgroundColor = '#d4edda';
                    reminderElement.style.borderColor = '#c3e6cb';

                    // Update time-until badge
                    const timeUntilElement = reminderElement.querySelector('.time-until');
                    if (timeUntilElement) {
                        timeUntilElement.textContent = "Completed!";
                        timeUntilElement.classList.remove('badge-primary', 'badge-warning');
                        timeUntilElement.classList.add('badge-success');
                    }
                }
            }, delay);

            // Store timer ID in localStorage to retrieve after page reload
            const timers = JSON.parse(localStorage.getItem('reminderTimers') || '{}');
            timers[reminderId] = { timerId, reminderTime };
            localStorage.setItem('reminderTimers', JSON.stringify(timers));
        }
    }

    // Function to play notification sound
    function playNotificationSound() {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-alert-2573.mp3');
        audio.volume = 0.5; // 50% volume

        // Check if audio playback is allowed
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Audio playback was prevented by the browser', error);
            });
        }
    }

    // Local Storage Functions with encryption
    function saveReminders() {
        const reminders = [];
        reminderList.querySelectorAll('.reminder-item').forEach(item => {
            const text = item.querySelector('strong').textContent;
            const originalTime = item.getAttribute('data-time');
            reminders.push({ text, time: originalTime, id: item.getAttribute('data-id') });
        });

        // Security measure: Simple encryption
        const encryptedData = encryptData(JSON.stringify(reminders));
        localStorage.setItem('encryptedReminders', encryptedData);
    }

    function loadReminders() {
        const encryptedReminders = localStorage.getItem('encryptedReminders');
        if (encryptedReminders) {
            try {
                // Security measure: Decrypt data
                const decryptedData = decryptData(encryptedReminders);
                const reminders = JSON.parse(decryptedData);

                reminders.forEach(reminder => {
                    // Ensure the time is still in the future when loading
                    addReminder(reminder.text, reminder.time, true); // Pass true to indicate it's loaded
                });
            } catch (error) {
                console.error('Error loading reminders:', error);
                showAlert('Error', 'Could not load saved reminders.', 'error');
                // Clear potentially corrupted data
                localStorage.removeItem('encryptedReminders');
            }
        }
    }

    // Very basic encryption (XOR with a key) - for demonstration purposes
    // In a production app, use a proper encryption library
    function encryptData(data) {
        const key = "ReminderApp2025"; // Simple key
        let encrypted = '';

        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            encrypted += String.fromCharCode(charCode);
        }

        // Use btoa for base64 encoding (more secure storage)
        return btoa(encrypted);
    }

    function decryptData(encryptedData) {
        const key = "ReminderApp2025";
        // Decode base64
        const data = atob(encryptedData);
        let decrypted = '';

        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            decrypted += String.fromCharCode(charCode);
        }

        return decrypted;
    }

    // Add a welcome notification
    setTimeout(() => {
        Swal.fire({
            title: 'Welcome to Reminder App!',
            text: 'Add your important reminders and never miss a deadline.',
            icon: 'success',
            confirmButtonColor: '#6a11cb',
        });
    }, 1000);
});