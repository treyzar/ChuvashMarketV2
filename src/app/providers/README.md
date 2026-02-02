# 📋 Providers

Глобальные провайдеры приложения.

## Назначение

Файл `index.js` объединяет все провайдеры в одну функцию или компонент для использования в корневом App.

## Примеры провайдеров

```jsx
// providers/index.js
export const withProviders = (Component) => {
  return (props) => (
    <ReduxProvider>
      <ThemeProvider>
        <QueryClientProvider>
          <RouterProvider>
            <Component {...props} />
          </RouterProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
};
```

Или для функциональных компонентов:

```jsx
// providers/index.js
export const Providers = ({ children }) => (
  <ReduxProvider>
    <ThemeProvider>
      <QueryClientProvider>
        <RouterProvider>{children}</RouterProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ReduxProvider>
);
```

## Типичные провайдеры

- Redux / Zustand (State Management)
- React Query / SWR (Data Fetching)
- Theme Provider (Themes)
- Router Provider (Routing)
- i18n Provider (Internationalization)
