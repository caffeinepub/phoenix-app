import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { SyncProvider } from "./contexts/SyncContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import PrivacyPolicyScreen from "./screens/PrivacyPolicyScreen";
import ProfileScreen from "./screens/ProfileScreen";
import RegisterScreen from "./screens/RegisterScreen";

type Screen = "login" | "register" | "home" | "profile" | "privacy";

function AppInner() {
  const [screen, setScreen] = useState<Screen>("login");
  const [prevScreen, setPrevScreen] = useState<Screen>("login");

  const navigate = (to: Screen) => {
    setPrevScreen(screen);
    setScreen(to);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen relative overflow-hidden">
      {screen === "login" && (
        <LoginScreen
          onNavigateRegister={() => navigate("register")}
          onLoginSuccess={() => navigate("home")}
          onPrivacyPolicy={() => navigate("privacy")}
        />
      )}
      {screen === "register" && (
        <RegisterScreen
          onBack={() => navigate("login")}
          onRegisterSuccess={() => navigate("home")}
          onPrivacyPolicy={() => navigate("privacy")}
        />
      )}
      {screen === "home" && (
        <HomeScreen
          onLogout={() => navigate("login")}
          onNavigateProfile={() => navigate("profile")}
        />
      )}
      {screen === "profile" && (
        <ProfileScreen
          onBack={() => navigate("home")}
          onLogout={() => navigate("login")}
          onPrivacyPolicy={() => navigate("privacy")}
        />
      )}
      {screen === "privacy" && (
        <PrivacyPolicyScreen onBack={() => setScreen(prevScreen)} />
      )}

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SyncProvider>
          <AppInner />
        </SyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
