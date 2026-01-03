import { create } from "zustand";
import api, { getTelegramUserId } from "@/lib/api";
import axios from "axios";

interface User {
  _id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: "admin" | "seller";
  isActive: boolean;
  assignedProducts?: string[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const telegramId = getTelegramUserId();
      console.log("Fetching user with Telegram ID:", telegramId);

      if (!telegramId) {
        throw new Error("Telegram ID topilmadi");
      }

      const response = await api.get("/auth/me");
      console.log("User fetched:", response.data.user);

      set({ user: response.data.user, loading: false });
    } catch (error: unknown) {
      console.error("Error fetching user:", error);
      let errorMessage = "Foydalanuvchi ma'lumotlarini yuklashda xatolik";

      if (axios.isAxiosError(error)) {
        errorMessage =
          (error.response?.data as { error?: string })?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        error: errorMessage,
        loading: false,
      });
    }
  },
  setUser: (user) => set({ user }),
}));
