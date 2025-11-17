document.addEventListener('DOMContentLoaded', () => {
    initializeVisitorCounter();
    initializeNavigation();
    initializeMiniCalendar();
    initializeGuestbook();
    initializeMoodTracker();
});

function initializeVisitorCounter() {
    try {
        const key = 'kuranie_visitors_v1';
        const prev = parseInt(localStorage.getItem(key) || '0', 10);
        const next = prev + 1;
        localStorage.setItem(key, String(next));
        const vc = document.getElementById('visitor-count');
        if (vc) vc.textContent = next.toLocaleString();
    } catch (e) { 
        console.warn('Visitor counter error:', e); 
    }
}

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.button-animated-menu a');
    const currentPage = getCurrentPage();
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').replace('.html', '');
        
        if (linkPage === currentPage || 
            (linkPage === 'index' && currentPage === '') ||
            (linkPage === '' && currentPage === 'index')) {
            link.classList.add('active');
        }
        
        link.addEventListener('click', (e) => {
            if (!link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                link.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    window.location.href = link.getAttribute('href');
                }, 150);
            }
        });
    });
}

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page.replace('.html', '');
}

function initializeMiniCalendar() {
    const el = document.getElementById('mini-calendar');
    if (!el) return;

    const now = new Date();
    const month = now.toLocaleString(undefined, { month: 'long' });
    const year = now.getFullYear();
    const first = new Date(year, now.getMonth(), 1);
    const startDow = first.getDay();
    const days = new Date(year, now.getMonth() + 1, 0).getDate();

    el.innerHTML = '';

    const caption = document.createElement('caption');
    caption.textContent = `${month} ${year}`;
    caption.style.fontWeight = '700';
    caption.style.marginBottom = '6px';
    caption.style.color = '#7b8fb2';
    el.appendChild(caption);

    const table = document.createElement('table');
    table.className = 'mini-table';
    
    const header = document.createElement('tr');
    ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        th.style.fontSize = '0.7rem';
        th.style.color = '#7b8fb2';
        th.style.padding = '4px';
        header.appendChild(th);
    });
    table.appendChild(header);

    let row = document.createElement('tr');
    
    for (let i = 0; i < startDow; i++) {
        const td = document.createElement('td');
        td.style.padding = '6px';
        row.appendChild(td);
    }

    for (let date = 1; date <= days; date++) {
        if (row.children.length === 7) {
            table.appendChild(row);
            row = document.createElement('tr');
        }
        
        const td = document.createElement('td');
        td.textContent = String(date);
        td.style.fontSize = '0.85rem';
        td.style.padding = '6px';
        td.style.textAlign = 'center';
        td.style.cursor = 'pointer';
        
        if (date === now.getDate() && now.getMonth() === new Date().getMonth() && year === new Date().getFullYear()) {
            td.style.background = 'linear-gradient(180deg,#d9edff,#cfe9ff)';
            td.style.borderRadius = '50%';
            td.style.fontWeight = '700';
            td.style.color = '#4a6fa5';
        }
        
        td.addEventListener('mouseover', () => {
            if (!td.style.background) {
                td.style.background = '#e8f0fe';
                td.style.borderRadius = '50%';
            }
        });
        
        td.addEventListener('mouseout', () => {
            if (td.textContent !== String(now.getDate())) {
                td.style.background = '';
            }
        });
        
        row.appendChild(td);
    }

    if (row.children.length > 0) {
        table.appendChild(row);
    }

    el.appendChild(table);
}

function initializeGuestbook() {
    const form = document.getElementById('gb-form');
    const entriesEl = document.getElementById('gb-entries');
    const clearBtn = document.getElementById('clear-gb');
    const storageKey = 'kuranie_guestbook_v1';

    if (!entriesEl) return;

    function loadEntries() {
        const raw = localStorage.getItem(storageKey);
        let entries = [];
        
        try { 
            entries = raw ? JSON.parse(raw) : []; 
        } catch(e) { 
            entries = []; 
        }
        
        renderEntries(entries);
    }

    function saveEntry(name, message) {
        const raw = localStorage.getItem(storageKey);
        let entries = [];
        
        try { 
            entries = raw ? JSON.parse(raw) : []; 
        } catch(e) { 
            entries = []; 
        }
        
        const newEntry = {
            name: name.trim() || 'Anonymous',
            message: message.trim(),
            date: new Date().toISOString(),
            id: Date.now().toString()
        };
        
        entries.unshift(newEntry);
        localStorage.setItem(storageKey, JSON.stringify(entries));
        renderEntries(entries);
        
        showNotification('Guestbook entry added!', 'success');
    }

    function renderEntries(entries) {
        entriesEl.innerHTML = '';
        
        if (!entries.length) {
            entriesEl.innerHTML = `
                <div class="muted" style="text-align: center; padding: 20px;">
                    No guestbook entries yet — be the first to sign!
                </div>
            `;
            return;
        }
        
        entries.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'gb-entry';
            entryDiv.innerHTML = `
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                    <strong style="color: #4a6fa5;">${escapeHtml(entry.name)}</strong>
                    <small style="color: #7b8fb2; margin-left: auto;">
                        ${new Date(entry.date).toLocaleDateString()} ${new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </small>
                </div>
                <p style="margin: 0; line-height: 1.4;">${escapeHtml(entry.message)}</p>
            `;
            entriesEl.appendChild(entryDiv);
        });
    }

    function clearGuestbook() {
        if (confirm('Are you sure you want to clear all guestbook entries? This cannot be undone.')) {
            localStorage.removeItem(storageKey);
            loadEntries();
            showNotification('Guestbook cleared!', 'info');
        }
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('gb-name');
            const messageInput = document.getElementById('gb-msg');
            
            const name = nameInput.value.trim();
            const message = messageInput.value.trim();
            
            if (!message) {
                showNotification('Please enter a message!', 'error');
                messageInput.focus();
                return;
            }
            
            saveEntry(name, message);
            form.reset();
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearGuestbook);
    }

    loadEntries();
}

function initializeMoodTracker() {
    const moodElements = document.querySelectorAll('.hits');
    
    moodElements.forEach(element => {
        if (element.textContent.includes('feeling:')) {
            const moods = ['happy', 'sad', 'okay', 'excited', 'tired', 'creative'];
            const randomMood = moods[Math.floor(Math.random() * moods.length)];
            
            const text = element.innerHTML;
            const updatedText = text.replace(/feeling: [a-zA-Z]+/, `feeling: ${randomMood}`);
            element.innerHTML = updatedText;
        }
    });
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    
    const colors = {
        success: '#4CAF50',
        error: '#F44336',
        info: '#2196F3',
        warning: '#FF9800'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initializeLazyLoading() {
    const images = document.querySelectorAll('img');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        if (img.complete) return;
        img.dataset.src = img.src;
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWNlY2VjIi8+PC9zdmc+';
        img.classList.add('lazy');
        imageObserver.observe(img);
    });
}

if ('IntersectionObserver' in window) {
    document.addEventListener('DOMContentLoaded', initializeLazyLoading);
}
