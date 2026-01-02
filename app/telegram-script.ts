// Telegram WebApp script to be included in the HTML
export const initTelegramWebApp = () => {
	if (typeof window !== 'undefined') {
		const script = document.createElement('script');
		script.src = 'https://telegram.org/js/telegram-web-app.js';
		script.async = true;
		document.head.appendChild(script);
	}
};


