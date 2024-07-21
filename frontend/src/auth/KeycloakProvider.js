import React, { useEffect, useState } from "react";

import Keycloak from "keycloak-js";
import KeycloakContext from "./KeycloakContext";
import { Keycloak_URL } from "networks";
import { logOut } from "networks";
import {  toast } from 'react-toastify';
const KeycloakProvider = ({ children }) => {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Retrieve user profile from storage
    const storedUserProfile = JSON.parse(localStorage.getItem("userProfile"));
  
    // Set user profile state if data is available
    if (storedUserProfile) {
      setUserProfile(storedUserProfile);
    }
  }, []);

  const signInToKeycloak = (userData) => {
    // Assuming response.data contains user information
    
    setUserProfile(userData);
  
    // Save user profile to local storage
    localStorage.setItem("userProfile", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Send a request to your server to log the user out
      const response = await fetch(logOut(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: userProfile.username, // Include the username in the request
          tenant_id: userProfile.attributes
          .tenant_id[0] // Include the tenantId in the request
        })
      });

      if (response.ok) {
        // Clear user data on sign out
        setUserProfile(null);
        // Remove user profile from local storage
        localStorage.removeItem("userProfile");
        toast.success("Logout successful", { theme: "colored" });
      } else {
   
        toast.error('Failed to log out user:', response.statusText, { theme: "colored" })
      }
    } catch (error) {
    
      toast.error("An unexpected error occurred. Please try again later", { theme: "colored" })
    }
  };

  return (
    <>
        <KeycloakContext.Provider
        value={{
          logout,
          userProfile,
          signInToKeycloak,
        }}
      >
        {children}
      </KeycloakContext.Provider>
    </>
  );
};

export default KeycloakProvider;