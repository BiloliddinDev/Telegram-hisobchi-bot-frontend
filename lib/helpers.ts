export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (date: Date | string): string => {
  return new Date(date).toLocaleString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

