import React, { Suspense, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "Login/login";
import filteredRoutes from "Sidebar/Sidebar_routes";
import Pharmacy from "Medicine/MedicineManagement";
import Dashboard from "Dashboard/Dashboard";
import BillsAndPayments from "BillingPayments/BillingAndPayments";
import Prescription from "Prescription/Prescription";
import Services from "Services/Services";
import Patients from "Patients/Patients";
import PatientDetails from "PatientDetails/PatientDetail";

const LazyLoad = () => {
  useEffect(() => {
    // Your useEffect logic here
  }, []);

  const isLoggedIn = sessionStorage.getItem("login") === "true";
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Conditional rendering based on isLoggedIn */}
        {isLoggedIn ? (
          // Render the first route from filteredRoutes if isLoggedIn is true
          filteredRoutes.length > 0 && (
            <Route
              path="/"
              element={<Navigate to={filteredRoutes[0].path} replace />}
            />
          )
        ) : (
          <Route path="/" element={<Login />} />
        )}

        {filteredRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={getElementForRoute(route)}
          />
        ))}
      </Routes>
    </Suspense>
  );
};

// Function to get the component for each route
const getElementForRoute = (route) => {
  switch (route.path) {
    case "/medicines":
      return <Pharmacy />;
    case "/dashboard":
      return <Dashboard />;
    case "/billing-payments":
      return <BillsAndPayments />;
    case "/prescription":
      return <Prescription />;
    case "/services":
      return <Services />;
    case "/patients":
      return <Patients/>;
    case "/patientdetails/:id":
      return <PatientDetails/>;
    default:
      return null;
  }
};

export default LazyLoad;
