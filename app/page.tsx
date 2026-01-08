"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { waitForTelegram, getTelegramUserId } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { fetchUser, user, loading, error } = useAuthStore();
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initTelegram = async () => {
      console.log("Initializing Telegram WebApp...");
      try {
        // Wait for Telegram WebApp to load
        const webApp = await waitForTelegram();
        console.log("WebApp result:", webApp ? "Loaded" : "Not loaded");

        if (webApp) {
          // Initialize Telegram WebApp
          webApp.ready();
          webApp.expand();

          // Set background color
          webApp.setHeaderColor("#ffffff");
          webApp.setBackgroundColor("#ffffff");

          // Get user ID
          const telegramId = getTelegramUserId();
          console.log("Telegram ID:", telegramId);

          if (!telegramId) {
            console.error("Telegram ID not found");
            setInitError(
              "Telegram ID topilmadi. Iltimos, Telegram orqali kirish.",
            );
            return;
          }

          // Fetch user data
          console.log("Fetching user...");
          await fetchUser();
          console.log("User fetch completed");
        } else {
          console.log(
            "Not in Telegram environment, window.location.href:",
            window.location.href,
          );
          const isTelegram =
            window.location.href.includes("t.me") ||
            window.location.href.includes("telegram.org");

          if (!isTelegram) {
            setInitError(
              "Bu ilova faqat Telegram orqali ishlaydi. Telegram bot orqali kirish.",
            );
          } else {
            setInitError(
              "Telegram WebApp yuklanmadi. Qaytadan urinib ko'ring.",
            );
          }
        }
      } catch (err: unknown) {
        console.error("Telegram initialization error:", err);
        setInitError(err instanceof Error ? err.message : "Xatolik yuz berdi");
      }
    };

    initTelegram();
  }, [fetchUser]);

  useEffect(() => {
    console.log("Auth state changed:", { user, loading, error });
    if (!loading && user) {
      console.log("User role:", user.role);
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "seller") {
        router.push("/seller");
      }
    }
  }, [user, loading, router, error]);

  if (loading) {
    console.log("Rendering loading state...");
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (initError || error) {
    console.log("Rendering error state:", initError || error);
    return (
      <div className="flex items-center justify-center min-h-screen mt-10 bg-background p-4 mt-10">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Xatolik</h2>
          <p className="text-muted-foreground mb-4">{initError || error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Qaytadan yuklash
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Kirish...</p>
      </div>
    </div>
  );
}
