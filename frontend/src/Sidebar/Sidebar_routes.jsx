import React, { Children, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@chakra-ui/react";
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdDashboard,
  MdSupervisorAccount,
  MdPeople,
  MdSchema,
  MdAccountBalanceWallet,
  MdLocalHospital, // New icon for Medical Records
  MdPayment, // New icon for Billing and Payments
  MdLocalPharmacy, // New icon for Inventory Management
  MdReport, // New icon for Reports and Analytics
  MdSupport, // New icon for Feedback and Support
  MdCalendarToday, // New icon for Scheduling and Rostering
  MdSchool, // New icon for Health Programs and Education
  MdVerifiedUser, // New icon for Compliance and Accreditation
  MdPhoneInTalk, // New icon for Telemedicine
  MdBiotech, // New icon for Laboratory Management
} from "react-icons/md";
import { FaBed } from "react-icons/fa";

const SidebarRoutes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "/dashboard",
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    sidebar: true,
  },
 
  {
    name: "Medicines",
    layout: "/admin",
    path: "/medicines",
    icon: <Icon as={MdLocalPharmacy} width="20px" height="20px" color="inherit" />,
    sidebar: true,
  },
  
  {
    name: "Billing",
    layout: "/admin",
    path: "/billing-payments",
    icon: <Icon as={MdPayment} width="20px" height="20px" color="inherit" />,
    sidebar: true,
  },
 
];

const storedUserDataString = sessionStorage.getItem('userData');
let filteredRoutes = SidebarRoutes;

if (storedUserDataString) {
    const storedUserData = JSON.parse(storedUserDataString);

    // Get enabled routes from user data features
    const enabledRoutes = storedUserData.features.map(feature => feature.label);

    // Filter SidebarRoutes based on enabled routes from user data
    filteredRoutes = SidebarRoutes.filter(route => {
        return enabledRoutes.includes(route.name);
    }).map(route => ({
        ...route,
        features: storedUserData.features.find(feature => feature.label === route.name)
    }));
}

export default filteredRoutes;
