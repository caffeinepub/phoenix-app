import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import RegisterScreen from "./screens/RegisterScreen";

type Screen = "login" | "register" | "home" | "profile";

function AppInner() {
  const [screen, setScreen] = useState<Screen>("login");

  return (
    <div className="max-w-md mx-auto min-h-screen relative overflow-hidden">
      {screen === "login" && (
        <LoginScreen
          onNavigateRegister={() => setScreen("register")}
          onLoginSuccess={() => setScreen("home")}
        />
      )}
      {screen === "register" && (
        <RegisterScreen
          onBack={() => setScreen("login")}
          onRegisterSuccess={() => setScreen("home")}
        />
      )}
      {screen === "home" && (
        <HomeScreen
          onLogout={() => setScreen("login")}
          onNavigateProfile={() => setScreen("profile")}
        />
      )}
      {screen === "profile" && (
        <ProfileScreen onBack={() => setScreen("home")} />
      )}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}
