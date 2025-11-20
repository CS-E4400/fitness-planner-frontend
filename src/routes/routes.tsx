import App from "@/App";
import About from "@/pages/About";
import TodayMenu from "@/components/layouts/TodayMenu";
import SessionMenu from "@/components/layouts/SessionMenu";
import AccountMenu from "@/components/layouts/AccountMenu";
import NutritionMenu from "@/components/layouts/NutritionMenu";
import ProgressMenu from "@/components/layouts/ProgressMenu";
import ProfileSettings from "@/components/layouts/ProfileSettingsMenu";
import AppSettings from "@/components/layouts/AppSettingsMenu";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      { 
        index: true, 
        element: <TodayMenu /> 
      },
      { 
        path: "session", 
        element: <SessionMenu onFinish={() => {}} /> 
      },
      { 
        path: "account", 
        element: <AccountMenu /> 
      },
      {
        path: "nutrition",
        element: <NutritionMenu onAddFood={() => {}} onFinish={() => {}} />
      },
      {
        path: "progress",
        element: <ProgressMenu />
      },
      {
        path: "profile-settings",
        element: <ProfileSettings />
      },
      { path: "about", element: <About /> },
      {
        path: "app-settings",
        element: <AppSettings />
      },
    ],
  },
]);

export default router;
