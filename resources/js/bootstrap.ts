import Echo from 'laravel-echo';

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
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'X-Requested-With': 'XMLHttpRequest',
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

// Add type declaration for global Echo
declare global {
    interface Window {
        Echo: Echo;
    }
}
