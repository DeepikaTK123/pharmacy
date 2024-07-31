import React from "react";

import { Icon } from "@chakra-ui/react";
import {
  MdHome,
  MdPayment,
  MdLocalPharmacy,
  MdStore
} from "react-icons/md";

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
  // {
  //   name: "Supplier",
  //   layout: "/admin",
  //   path: "/supplier",
  //   icon: <Icon as={MdStore} width="20px" height="20px" color="inherit" />,
  //   sidebar: true,
  // },
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
