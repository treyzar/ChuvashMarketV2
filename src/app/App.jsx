import { withProviders } from "./providers";
import { APP_CONFIG } from "./config";

export const App = () => {
  return (
    <div>
      <h1>ChuvashMarket</h1>
      <p>App initialized with FSD architecture</p>
    </div>
  );
};

export default withProviders(App);
