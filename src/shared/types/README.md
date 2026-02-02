# 📝 TypeScript Types

Глобальные типы TypeScript для всего приложения.

## Структура

```
types/
├── common.ts        # Общие типы
├── api.ts          # Типы API ответов
└── index.ts        # Barrel export
```

## Файлы

### common.ts

Общие типы, используемые по всему приложению:

```ts
// Общие типы
export type AsyncStatus = "idle" | "pending" | "success" | "error";

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
```

### api.ts

Типы для API ответов и запросов:

```ts
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}
```

## Экспорт

```ts
// types/index.ts
export * from "./common";
export * from "./api";
```

## Использование

```ts
import type { ApiResponse, AsyncStatus } from "@shared/types";

interface UserData {
  id: string;
  name: string;
}

const response: ApiResponse<UserData> = {
  data: { id: "1", name: "John" },
  status: 200,
  message: "Success",
};
```
