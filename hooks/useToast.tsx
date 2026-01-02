"use client";

import React, { useState, useCallback } from "react";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  const ToastComponent = () => {
    if (!toast) return null;

    const bgColor =
      toast.type === "success"
        ? "bg-green-50 border-green-200 text-green-800"
        : toast.type === "error"
        ? "bg-red-50 border-red-200 text-red-800"
        : "bg-blue-50 border-blue-200 text-blue-800";

    return (
      <div
        className={`fixed top-4 right-4 z-50 p-4 rounded-md border ${bgColor} shadow-lg`}
      >
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    );
  };

  return { showToast, ToastComponent };
};
