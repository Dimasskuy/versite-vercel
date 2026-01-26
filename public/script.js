document.addEventListener('DOMContentLoaded', () => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', storedTheme);
    updateVisitorCounter();
    showElements();
});

function toggleTheme() {
    const html = document.documentElement;
    const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function sharePage() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            text: 'Check out my personal links!',
            url: window.location.href
        }).catch(err => {
            console.log('Error sharing:', err);
        });
    } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Link copied!');
        });
    }
}

function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateVisitorCounter() {
    let count = parseInt(localStorage.getItem('visitor_count') || '0') + 1;
    localStorage.setItem('visitor_count', count);
    const el = document.getElementById('counter-value');
    if (el) el.textContent = count;
}

function showElements() {
    const c = document.getElementById('container');
    const links = document.querySelectorAll('.link-container');
    const vc = document.getElementById('visitor-counter');
    setTimeout(() => c.classList.add('show'), 100);
    links.forEach((l, i) => setTimeout(() => l.classList.add('show'), 300 + i * 100));
    setTimeout(() => vc && vc.classList.add('show'), 300 + links.length * 100);
}
