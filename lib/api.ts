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
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    setText: (text: string) => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
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
    // If environment URL is set, use it
    if (envURL.startsWith("/")) {
      // Relative path (e.g., "/api" for same-domain deployment)
      return envURL;
    } else {
      // Full URL (e.g., "http://localhost:5000" or "https://domain.com")
      return envURL.endsWith("/") ? `${envURL}api` : `${envURL}/api`;
    }
  }

  // Fallback based on environment
  if (process.env.NODE_ENV === "production") {
    return "/api"; // Relative path for production
  } else {
    return "http://localhost:5000/api"; // Local development
  }
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
  if (process.env.NODE_ENV === "development" && process.env.ADMIN_ID) {
    return process.env.ADMIN_ID;
  }
  return webApp?.initDataUnsafe?.user?.id?.toString() || null;
};

// Axios instance yaratish
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

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


    if (
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_DEBUG === "true"
    ) {
      console.log(
        `🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      );
      if (telegramId) {
        console.log(`👤 Telegram ID: ${telegramId}`);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Kelgan javobni tekshirish va xatolarni ushlash
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Enhanced error logging with environment awareness
    const isDev =
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_DEBUG === "true";

    if (error.response?.status === 404) {
      console.error(
        "❌ XATO 404: API manzili topilmadi.",
        isDev ? `Hozirgi baseURL: ${API_URL}` : "",
      );
      if (isDev) {
        console.error("🔧 Tekshiring: Backend server ishlaydimi?");
        console.error("🔧 Environment:", process.env.NODE_ENV);
      }
    }
    if (error.response?.status === 401) {
      console.error("❌ XATO 401: Avtorizatsiya xatosi.");
      if (isDev) {
        console.error("🔧 Telegram initData tekshiring");
      }
    }
    if (error.response?.status === 500) {
      console.error("❌ XATO 500: Server xatosi.");
    }
    if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK") {
      console.error("❌ Tarmoq xatosi: Backend serverga ulanib bo'lmadi.");
      if (isDev) {
        console.error(`🔧 Backend URL tekshiring: ${API_URL}`);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
