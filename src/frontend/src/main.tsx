import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "./index.css";

// Import manifest assets explicitly so the build pipeline includes them
import _icon192 from "/assets/generated/phonex-icon-192.dim_192x192.png";
import _icon512 from "/assets/generated/phonex-icon-512.dim_512x512.png";
import _screenshotChats from "/assets/generated/screenshot-chats.dim_390x844.png";
import _screenshotLogin from "/assets/generated/screenshot-login.dim_390x844.png";
import _screenshotMobile2 from "/assets/generated/screenshot-mobile-2.dim_390x844.png";
// Suppress unused variable warnings
void _icon192;
void _icon512;
void _screenshotLogin;
void _screenshotChats;
void _screenshotMobile2;

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <App />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
