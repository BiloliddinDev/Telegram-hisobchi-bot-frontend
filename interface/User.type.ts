export interface User {
  _id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: "admin" | "seller";
  isActive: boolean;
}
