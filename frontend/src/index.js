import "./assets/css/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router
} from "react-router-dom";
import { ChakraProvider} from "@chakra-ui/react";
import React from "react";
import Routes from "routes";
import Sidebar from "Sidebar/sidebar";
import AdminNavbar from "NavBar/NavbarAdmin";
function App() {
  const isLoggedIn = sessionStorage.getItem("login") === "true";
  return (
    <ChakraProvider >
      <Router>
        {isLoggedIn && (
          <>
            <Sidebar />
            <AdminNavbar/>
            
          </>
        )}
        {!isLoggedIn && (
          <>
            <Routes />
            
            
          </>
        )}
      </Router>
    </ChakraProvider>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
