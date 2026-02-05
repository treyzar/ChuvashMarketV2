// Global types and interfaces
// Глобальные типы TypeScript

export type AsyncStatus = "idle" | "pending" | "success" | "error";

export interface ApiResponse {
  status: number;
  message: string;
}
