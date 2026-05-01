import { createBrowserRouter } from "react-router-dom";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { UniversitiesListing } from "./components/UniversitiesListing";
import { UniversityDetails } from "./components/UniversityDetails";
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "universities", Component: UniversitiesListing },
      { path: "universities/:id", Component: UniversityDetails },
      { path: "admin", Component: AdminLogin },
      { path: "admin/login", Component: AdminLogin },
      { path: "admin/dashboard", Component: AdminDashboard },
      { path: "*", Component: NotFound },
    ],
  },
]);

