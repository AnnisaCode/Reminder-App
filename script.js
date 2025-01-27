document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reminder-form');
    const reminderList = document.getElementById('reminder-list');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const reminderText = document.getElementById('reminder-text').value;
        const reminderTime = document.getElementById('reminder-time').value;

        if (reminderText && reminderTime) {
            addReminder(reminderText, reminderTime);
            form.reset();
        }
    });

    function addReminder(text, time) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
    
        const spanText = document.createElement('span');
        spanText.textContent = `${text} - ${new Date(time).toLocaleString()}`;
    
        const button = document.createElement('button');
        button.className = 'btn btn-remove btn-sm';
        button.textContent = 'Remove';
    
        button.addEventListener('click', () => {
            reminderList.removeChild(li);
        });
    
        li.appendChild(spanText);
        li.appendChild(button);
        reminderList.appendChild(li);
    
        scheduleNotification(text, time);
    }
    

    function scheduleNotification(text, time) {
        const now = new Date().getTime();
        const reminderTime = new Date(time).getTime();
        const delay = reminderTime - now;

        if (delay > 0) {
            setTimeout(() => {
                Swal.fire({
                    title: 'Reminder',
                    text: text,
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
            }, delay);
        }
    }
});
