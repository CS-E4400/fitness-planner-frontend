import App from "@/App";
import About from "@/pages/About";
import TodayMenu from "@/components/layouts/TodayMenu";
import SessionMenu from "@/components/layouts/SessionMenu";
import AccountMenu from "@/components/layouts/AccountMenu";
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
        element: <TodayMenu onAddMeal={() => {}} onLogWorkout={() => {}} /> 
      },
      { 
        path: "session", 
        element: <SessionMenu onFinish={() => {}} /> 
      },
      { 
        path: "account", 
        element: <AccountMenu onSignOut={() => {}} /> 
      },
      { path: "about", element: <About /> },
    ],
  },
]);

export default router;
