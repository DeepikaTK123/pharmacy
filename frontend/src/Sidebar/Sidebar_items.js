import {
  Box,
  Flex,
  HStack,
  Text,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuItem
} from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";
import React, { useState } from "react";

import SidebarRoutes from "Sidebar/Sidebar_routes";

export function SidebarLinks() {
  //   Chakra color mode
  let location = useLocation();
  let activeColor = useColorModeValue("black", "white");
  let inactiveColor = useColorModeValue("white", "secondaryGray.600");
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
            {!isCollapsed && (
              <div style={{ backgroundColor: "transparent", width: "20rem" }}>
                {route.children.map((childRoute, childIndex) => (
                  <NavLink key={childIndex} to={childRoute.layout + childRoute.path}>
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
          <React.Fragment key={index}>
            <Text
              fontSize={"md"}
              color={activeColor}
              fontWeight="bold"
              mx="auto"
              ps={{ sm: "10px", xl: "16px" }}
              pt="18px"
              pb="12px"
            >
              {route.name}
            </Text>
            {createLinks(route.items)}
          </React.Fragment>
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

      // Always return a value from map
      return null;
    });
  };

  //  BRAND
  return <div>{createLinks(routes)}</div>;
}

export default SidebarLinks;
