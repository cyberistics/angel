function generateCalendar() {
    const container = document.getElementById('calendar-container');
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthName = now.toLocaleString('default', { month: 'long' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = `<h3><span>${monthName}</span></h3><div class="calendar-grid">`
    
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = (day === now.getDate()) ? 'today' : '';
        html += `<div class="day ${isToday}"><span>${day}</span></div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}

generateCalendar();
