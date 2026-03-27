import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import MainHub from "./MainHub";

const path = window.location.pathname.replace(/\/+$/, "") || "/";

function RootRouter() {
  if (path === "/resume-builder") {
    return <App />;
  }

  return <MainHub />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>
);
