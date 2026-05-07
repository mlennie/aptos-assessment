import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import Loadable from "../components/loadable/Loadable";

const Layout = Loadable(lazy(() => import("../components/layout/Layout")));
const Dashboard = Loadable(lazy(() => import("../views/dashboard/Dashboard")));
const Sell = Loadable(lazy(() => import("../views/sell/Sell")));
const Login = Loadable(lazy(() => import("../views/login/Login")));
const NotesList = Loadable(lazy(() => import("../views/notes/NotesList")));
const NoteCreate = Loadable(lazy(() => import("../views/notes/NoteCreate")));
const NoteDetail = Loadable(lazy(() => import("../views/notes/NoteDetail")));
const NoteEdit = Loadable(lazy(() => import("../views/notes/NoteEdit")));
const Notfound = Loadable(
  lazy(() => import("../components/errorboundary/404"))
);

const Router = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" /> },
      { path: "/dashboard", exact: true, element: <Dashboard /> },
      { path: "/sell", exact: true, element: <Sell /> },
      { path: "/login", exact: true, element: <Login /> },
      { path: "/notes", element: <NotesList /> },
      { path: "/notes/new", element: <NoteCreate /> },
      { path: "/notes/:id", element: <NoteDetail /> },
      { path: "/notes/:id/edit", element: <NoteEdit /> },
      { path: "/auth/404", exact: true, element: <Notfound /> },
      { path: "*", element: <Navigate to="/auth/404" /> }
    ]
  }
];

export default Router;
