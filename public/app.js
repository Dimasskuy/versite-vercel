/**
 * App.js - Main application logic
 * Handles theme switching, sharing, animations, and visitor tracking
 */

// Initialize Feather Icons
document.addEventListener('DOMContentLoaded', function() {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    showElements();
    initializeVisitorCounter();
    loadTheme();
});

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'info'
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    
    // Remove all previous classes
    toast.className = 'toast show';
    toast.classList.add(type);
    toast.textContent = message;
    
    // Auto hide
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
    
    // Allow manual close on click
    toast.style.cursor = 'pointer';
    toast.onclick = function() {
        toast.classList.remove('show');
    };
}

/**
 * Share page with Web Share API or fallback to clipboard
 */
function sharePage() {
    const shareButton = document.getElementById('share-button');
    shareButton.style.pointerEvents = 'none';
    shareButton.style.opacity = '0.6';
    
    const shareData = {
        title: document.title,
        text: 'Kunjungi Profile Dimass - Akses semua link menarik!',
        url: window.location.href,
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => {
                showToast('✓ Halaman berhasil dibagikan!', 'success');
            })
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                    fallbackShare(shareData);
                }
            })
            .finally(() => {
                shareButton.style.pointerEvents = 'auto';
                shareButton.style.opacity = '1';
            });
    } else {
        fallbackShare(shareData);
        shareButton.style.pointerEvents = 'auto';
        shareButton.style.opacity = '1';
    }
}

/**
 * Fallback share using clipboard
 * @param {Object} shareData - Data to share
 */
function fallbackShare({ title, text, url }) {
    const shareMessage = `${text}\n${url}`;
    
    navigator.clipboard.writeText(shareMessage)
        .then(() => {
            showToast('✓ Link disalin ke clipboard!', 'success', 2500);
        })
        .catch(() => {
            showToast('✗ Gagal menyalin. Silakan coba lagi.', 'error', 3000);
        });
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Optional: Add animation feedback
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.style.transform = 'rotate(180deg)';
    setTimeout(() => {
        themeToggle.style.transform = 'scale(1.15)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 150);
    }, 150);
}

/**
 * Load saved theme from localStorage
 */
function loadTheme() {
    const storedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', storedTheme);
}

/**
 * Animate elements on page load
 */
function showElements() {
    const container = document.getElementById('container');
    const nameContainer = document.getElementById('name-container');
    const profile = document.getElementById('profile');
    const linkContainers = document.querySelectorAll('.link-container');

    // Animasi container
    setTimeout(() => {
        container?.classList.add('show');
    }, 100);

    // Animasi nama dan profil
    setTimeout(() => {
        nameContainer?.classList.add('show');
        profile?.classList.add('show');
    }, 300);

    // Animasi link sosial media dengan stagger
    linkContainers.forEach((link, index) => {
        setTimeout(() => {
            link.classList.add('show');
        }, 500 + index * 100);
    });
}

/**
 * Generate and download vCard
 * @param {Event} event - Click event
 */
function downloadVCard(event) {
    event.preventDefault();
    
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Dimass (DimasAjaa)
TEL:+62XXXXXXXXX
URL:https://github.com/dimasskuy
URL:https://youtube.com/@felizmunzz
NOTE:Content Creator & Developer
END:VCARD`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(vcard));
    element.setAttribute('download', 'dimass-contact.vcf');
    element.style.display = 'none';
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    showToast('✓ vCard berhasil diunduh!', 'success');
}

/**
 * Initialize visitor counter
 * Uses localStorage for simple counting (can be replaced with API call)
 */
function initializeVisitorCounter() {
    try {
        let visitorCount = localStorage.getItem('visitorCount');
        
        if (!visitorCount) {
            visitorCount = 0;
        }
        
        visitorCount = parseInt(visitorCount) + 1;
        localStorage.setItem('visitorCount', visitorCount);
        
        const visitorSpan = document.querySelector('#visitor-count span');
        if (visitorSpan) {
            visitorSpan.textContent = formatNumber(visitorCount);
            animateNumber(visitorSpan, 0, visitorCount, 500);
        }
    } catch (e) {
        console.error('Visitor counter error:', e);
    }
}

/**
 * Format number with thousand separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Animate number increment
 * @param {HTMLElement} element - Element to animate
 * @param {number} start - Start number
 * @param {number} end - End number
 * @param {number} duration - Duration in milliseconds
 */
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Add keyboard shortcut for theme toggle (Ctrl/Cmd + Shift + D)
 */
document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        toggleTheme();
    }
});

/**
 * Error handling for external resources
 */
window.addEventListener('error', function(event) {
    if (event.filename && event.filename.includes('telegra.ph')) {
        console.warn('Failed to load external resource:', event.filename);
        // Fallback background color if image fails
        document.body.style.backgroundColor = '#f5f5f5';
    }
});

/**
 * Handle network status
 */
window.addEventListener('offline', function() {
    showToast('⚠ Anda sedang offline', 'error');
});

window.addEventListener('online', function() {
    showToast('✓ Kembali online', 'success', 2000);
});

console.log('%c🎉 Welcome to Dimass Profile!', 'color: #007bff; font-size: 16px; font-weight: bold;');
console.log('%cTip: Press Ctrl+Shift+D to toggle theme', 'color: #666; font-size: 12px;');