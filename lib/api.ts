import axios, { AxiosError } from "axios";

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  };
  initData?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}


const getBaseURL = () => {
  const envURL = process.env.NEXT_PUBLIC_API_URL;
  if (envURL) {
    return envURL.endsWith('/') ? `${envURL}api` : `${envURL}/api`;
  }
  return "http://localhost:5000/api";
};

const API_URL = getBaseURL();

export const waitForTelegram = (): Promise<TelegramWebApp | null> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }
    if (window.Telegram?.WebApp) {
      resolve(window.Telegram.WebApp);
      return;
    }
    const checkTelegram = setInterval(() => {
      if (window.Telegram?.WebApp) {
        clearInterval(checkTelegram);
        resolve(window.Telegram.WebApp);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(checkTelegram);
      resolve(null);
    }, 3000);
  });
};

export const getTelegramData = (): TelegramWebApp | null => {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const getTelegramUserId = (): string | null => {
  const webApp = getTelegramData();
  return webApp?.initDataUnsafe?.user?.id?.toString() || null;
};

// Axios instance yaratish
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Bu muhim: Agar backend-da cookie ishlatilsa ruxsat beradi
  withCredentials: true
});

// Zapros yuborishdan oldin Telegram ID va InitData-ni headerga qo'shish
api.interceptors.request.use(
    (config) => {
      const webApp = getTelegramData();
      const telegramId = getTelegramUserId();

      if (telegramId) {
        config.headers["x-telegram-id"] = telegramId;
      }

      if (webApp?.initData) {
        config.headers["x-telegram-init-data"] = webApp.initData;
      }

      // DEBUG uchun: Qaysi URL-ga zapros ketayotganini ko'rish (Keyinchalik o'chirib tashlash mumkin)
      console.log(`Sending request to: ${config.baseURL}${config.url}`);

      return config;
    },
    (error) => Promise.reject(error)
);

// Kelgan javobni tekshirish va xatolarni ushlash
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 404) {
        console.error("❌ XATO 404: API manzili topilmadi. Hozirgi baseURL:", API_URL);
      }
      if (error.response?.status === 401) {
        console.error("❌ XATO 401: Avtorizatsiya xatosi.");
      }
      return Promise.reject(error);
    }
);

export default api;