import { Provider } from "../components/ui/provider";
import { type AppType } from "next/app";

import "../styles/Calendar.css";
import "../styles/globals.css";
import "../styles/Spinner.css";
import { api } from "~/utils/api";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  );
};

export default api.withTRPC(MyApp);
