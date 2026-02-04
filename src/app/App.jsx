import { withProviders } from "./providers";
import { AppRoutes } from "../pages";

export const App = () => {
  return <AppRoutes />;
};

export default withProviders(App);
