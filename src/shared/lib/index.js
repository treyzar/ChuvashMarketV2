// Shared utilities and helpers
// Утилиты и помощники приложения

export const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(price);
};
