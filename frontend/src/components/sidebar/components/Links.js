import { Box, Flex, HStack, Text, useColorModeValue, Stack, Menu, MenuButton, MenuItem } from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";
import React, { useState } from "react";

import { Icon } from "@chakra-ui/react";
import {
  MdPerson,
  MdDashboard,
  MdSupervisorAccount, 
} from "react-icons/md";
export function SidebarLinks() {
  let location = useLocation();
  let activeColor = useColorModeValue("gray.700", "white");
  let inactiveColor = useColorModeValue(
    "secondaryGray.600",
    "secondaryGray.600"
  );
  let activeIcon = useColorModeValue("brand.500", "white");
  let textColor = useColorModeValue("secondaryGray.500", "white");
  let brandColor = useColorModeValue("brand.500", "brand.400");
  
  const routes = [

  
    {
      name: "Tenant Management"   ,    
      layout: "/admin",
       path: "/superadmin",          
      icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
      // component: Superadmin,
      sidebar:true
    },
      {
      layout: "/admin",
      // name: "Profile Settings",
      path: "/profileSettings",
      // component: ProfileSettings,
      sidebar:false
    },
      {
      name: "User Management", // name: "RTL Admin",
      layout: "/admin",
      path: "/rolemanagement",
      icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
      // component: UserManangement,
      sidebar:true
    },
    {
      name: "Role Management", 
      layout: "/admin",
      path: "/usermanangement", 
      icon: <Icon as={MdSupervisorAccount} width="20px" height="20px" color="inherit" />,
      // component: RoleManagement,
      sidebar:true
    },
    {
      name: "System Health", 
      layout: "/admin",
      path: "/systemhealth", 
      icon: <Icon as={MdDashboard} width="20px" height="20px" color="inherit" />,
      // component: SystemHealth,
      sidebar:true
    },
   
    {
      // name: "Sign In",
      layout: "/auth",
      path: "/sign-in",
      // icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
      // component: SignInCentered,
      sidebar:false
    },
  ];
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  const [isCollapsed, setIsCollapsed] = useState(true);
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (!route.name) {
        return null;
      }
      if (route.children && route.children.length > 0) {
        return (
          <Menu key={index}>
            <MenuButton
              fontSize="md"
              color={activeRoute(route.path.toLowerCase()) ? activeColor : textColor}
              fontWeight={activeRoute(route.path.toLowerCase()) ? "bold" : "normal"}
              mx="auto"
              ps={{ sm: "10px", xl: "12px" }}
              pt="18px"
              pb="12px"
              _hover={{ cursor: "pointer" }}
              _focus={{ outline: "none" }}
              onClick={toggleCollapse}
            >
               <NavLink key={index} to={route.layout + route.path}>
              <Flex alignItems="center" justifyContent="center">
                <Box
                  color={
                    activeRoute(route.path.toLowerCase())
                      ? activeIcon
                      : textColor
                  }
                  me="18px"
                >
                  {route.icon}
                </Box>
                <Text
                  me="auto"
                  color={
                    activeRoute(route.path.toLowerCase())
                      ? activeColor
                      : textColor
                  }
                  fontWeight={
                    activeRoute(route.path.toLowerCase())
                      ? "bold"
                      : "normal"
                  }
                >
                  {route.name}
                </Text>
              </Flex>
              </NavLink>
            </MenuButton>
    
            {!isCollapsed && (
              <div style={{ backgroundColor: 'transparent', width: "20rem" }}>
                {route.children.map((childRoute, childIndex) => (
                  <NavLink to={childRoute.layout + childRoute.path}>
                    <MenuItem ml={46}>
                      <Text fontSize="sm" borderColor="gray.200" color="gray.400">{childRoute.name}</Text>
                    </MenuItem></NavLink>
                ))}
              </div>
            )}
          </Menu>
        )
      }
      if (route.category) {
        return (
          <>
            <Text
              fontSize={"md"}
              color={activeColor}
              fontWeight="bold"
              mx="auto"
              ps={{
                sm: "10px",
                xl: "16px",
              }}
              pt="18px"
              pb="12px"
              key={index}
            >
              {route.name}
            </Text>
            {createLinks(route.items)}
          </>
        );
      } else if (
        route.layout === "/admin" ||
        route.layout === "/auth" ||
        route.layout === "/rtl"
      ) {
        return (
          <NavLink key={index} to={route.layout + route.path}>
            {route.icon ? (
              <Box>
                <HStack
                  spacing={
                    activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
                  }
                  py="5px"
                  ps="10px"
                >
                  <Flex w="100%" alignItems="center" justifyContent="center">
                    <Box
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeIcon
                          : textColor
                      }
                      me="18px"
                    >
                      {route.icon}
                    </Box>
                    <Text
                      me="auto"
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeColor
                          : textColor
                      }
                      fontWeight={
                        activeRoute(route.path.toLowerCase())
                          ? "bold"
                          : "normal"
                      }
                    >
                      {route.name}
                    </Text>
                  </Flex>
                  <Box
                    h="36px"
                    w="4px"
                    bg={
                      activeRoute(route.path.toLowerCase())
                        ? brandColor
                        : "transparent"
                    }
                    borderRadius="5px"
                  />
                </HStack>
              </Box>
            ) : (
              <Box>
                <HStack
                  spacing={
                    activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
                  }
                  py="5px"
                  ps="10px"
                >
                  <Text
                    me="auto"
                    color={
                      activeRoute(route.path.toLowerCase())
                        ? activeColor
                        : inactiveColor
                    }
                    fontWeight={
                      activeRoute(route.path.toLowerCase()) ? "bold" : "normal"
                    }
                  >
                    {route.name}
                  </Text>
                  <Box h="36px" w="4px" bg="brand.400" borderRadius="5px" />
                </HStack>
              </Box>
            )}
          </NavLink>
        );
      }
    });
  };
  return createLinks(routes);
}

export default SidebarLinks;
