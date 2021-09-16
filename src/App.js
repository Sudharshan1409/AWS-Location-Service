import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./Routes";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://kit.fontawesome.com/cb6c6127de.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return (
    <>
      <center>
        <h1>Amazon Location Services</h1>
      </center>
      <Router>
        <AppRoutes />
      </Router>
    </>
  );
}

export default App;
