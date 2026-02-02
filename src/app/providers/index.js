// Providers configuration
// Здесь подключаются глобальные провайдеры приложения

export const withProviders = (Component) => {
  return (props) => <Component {...props} />;
};
