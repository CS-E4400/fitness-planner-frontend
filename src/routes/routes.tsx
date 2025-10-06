import App from "@/App";
import About from "@/pages/About";
import Home from "@/pages/Home";
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
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
    ],
  },
]);
export default router;
