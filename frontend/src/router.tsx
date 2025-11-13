import { createBrowserRouter } from "react-router";
import Main from "./pages/Main";

export const router = createBrowserRouter([
  {
    path: "/:commune?/:section?",
    element: <Main />,
    errorElement: <div>ErrorPage</div>,
  },
]);
