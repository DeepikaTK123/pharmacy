import {
  Box,
  Flex,
  HStack,
  Text,
  useColorModeValue,
  Stack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
} from "@chakra-ui/react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useContext, useState } from "react";

import KeycloakContext from "auth/KeycloakContext";
// chakra imports
import { Icon } from "@chakra-ui/react";
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdDashboard, // New icon for System Health
  MdSupervisorAccount, // New icon for Role Management
  MdPeople,
  MdSchema, // New icon for User Management
  MdAccountBalanceWallet,
  MdLogout, // Icon for logout
} from "react-icons/md";
import SidebarRoutes from "Sidebar/Sidebar_routes";
export function SidebarLinks(props) {
  //   Chakra color mode
  let location = useLocation();
  let navigate = useNavigate();
  let activeColor = useColorModeValue("black", "white");
  let bgactiveColor = useColorModeValue("#3d94cf", "white");
  let inactiveColor = useColorModeValue(
    "white",
    "secondaryGray.600"
  );
  let activeIcon = useColorModeValue("blue", "white");
  let textColor = useColorModeValue("black", "white");
  let brandColor = useColorModeValue("#3d94cf", "brand.400");

  const routes = SidebarRoutes;
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  const [isCollapsed, setIsCollapsed] = useState(true);

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
    window.location.reload();
  };
  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (!route.name) {
        // Skip rendering this route if it doesn't have a name
        return null;
      }
      if (route.children && route.children.length > 0) {
        // If route has children, render dropdown menu
        return (
          <Menu key={index}>
            <MenuButton
              fontSize="md"
              color={
                activeRoute(route.path.toLowerCase()) ? activeColor : textColor
              }
              fontWeight={
                activeRoute(route.path.toLowerCase()) ? "bold" : "normal"
              }
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
                    // me="auto"
                    color={
                      activeRoute(route.path.toLowerCase())
                        ? activeColor
                        : textColor
                    }
                    backgroundColor={
                      activeRoute(route.path.toLowerCase())
                        ? activeColor
                        : textColor
                    }
                    fontWeight={
                      activeRoute(route.path.toLowerCase()) ? "bold" : "normal"
                    }
                  >
                    {route.name}
                  </Text>
                </Flex>
              </NavLink>
            </MenuButton>
            {/* <NavLink key={index} to={route.layout + route.path} onClick={toggleCollapse}>
  <MenuButton
    fontSize="md"
    color={activeRoute(route.path.toLowerCase()) ? activeColor : textColor}
    fontWeight={activeRoute(route.path.toLowerCase()) ? "bold" : "normal"}
    mx="auto"
    ps={{ sm: "10px", xl: "12px" }}

  
    _hover={{ cursor: "pointer" }}
    _focus={{ outline: "none" }}
  >
    {route.icon ? (
      <Box   me="18px">
        <HStack
          spacing={activeRoute(route.path.toLowerCase()) ? "22px" : "26px"}
          py="5px"
          ps="10px"
        >
          <Flex >
            <Box
              color={activeRoute(route.path.toLowerCase()) ? activeIcon : textColor}
              me="18px"
            >
              {route.icon}
            </Box>
            <Text
              me="auto"
              color={activeRoute(route.path.toLowerCase()) ? activeColor : textColor}
              fontWeight={activeRoute(route.path.toLowerCase()) ? "bold" : "normal"}
            >
              {route.name}
            </Text>
          </Flex>
          <Box
            h="36px"
            w="4px"
            bg={activeRoute(route.path.toLowerCase()) ? brandColor : "transparent"}
            borderRadius="5px"
          />
        </HStack>
      </Box>
    ) : (
      <Box>
        <HStack
          spacing={activeRoute(route.path.toLowerCase()) ? "22px" : "26px"}
          py="5px"
          ps="10px"
        >
          <Text
            me="auto"
            color={activeRoute(route.path.toLowerCase()) ? activeColor : inactiveColor}
            fontWeight={activeRoute(route.path.toLowerCase()) ? "bold" : "normal"}
          >
            {route.name}
          </Text>
          <Box h="36px" w="4px" bg="brand.400" borderRadius="5px" />
        </HStack>
      </Box>
    )}
  </MenuButton>
</NavLink> */}
            {!isCollapsed && (
              <div style={{ backgroundColor: "transparent", width: "20rem" }}>
                {route.children.map((childRoute, childIndex) => (
                  <NavLink to={childRoute.layout + childRoute.path}>
                    <MenuItem ml={46}>
                      <Text
                        fontSize="sm"
                        borderColor="gray.200"
                        color="gray.400"
                      >
                        {childRoute.name}
                      </Text>
                    </MenuItem>
                  </NavLink>
                ))}
              </div>
            )}
          </Menu>
        );
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
          <NavLink key={index} to={route.path}>
            {route.icon ? (
              <Box>
                <HStack
                  spacing={
                    activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
                  }
                  py="5px"
                  ps="10px"
                >
                  <Flex
                    w="100%"
                    alignItems="flex-start"
                    justifyContent="center"
                  >
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
                      // backgroundColor={
                      //   activeRoute(route.path.toLowerCase())
                      //     ? bgactiveColor
                      //     : "tr"
                      // }
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
  //  BRAND
  return <div>{createLinks(routes)}</div>;
}

export default SidebarLinks;
