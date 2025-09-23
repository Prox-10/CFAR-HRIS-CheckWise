import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Set Pusher globally for Laravel Echo
window.Pusher = Pusher;

// Get CSRF token more reliably
const getCSRFToken = () => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!token) {
        console.warn('CSRF token not found, broadcasting authentication may fail');
    }
    return token || '';
};

// Initialize Echo with Reverb
try {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY || 'your-reverb-key',
        wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
        wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
        wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
        authEndpoint: '/broadcasting/auth',
        withCredentials: true,
        auth: {
            headers: {
                'X-CSRF-TOKEN': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
            },
        },
    });

    console.log('Echo initialized successfully with Reverb');
    console.log('Echo config:', {
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY || 'your-reverb-key',
        wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
        wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    });
} catch (error) {
    console.error('Failed to initialize Echo:', error);
}

// Echo is now available globally on window.Echo
