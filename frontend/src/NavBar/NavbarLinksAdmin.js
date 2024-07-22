// Chakra Imports
import {
  Avatar,
  Link as ChakraLink,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { SidebarResponsive } from "Sidebar/sidebar";
import routes from "routes.js";

export default function HeaderLinks(props) {
  const { secondary } = props;
  let navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('data'));
    if (userData) {
      setUserProfile(userData);
    }
  }, []);

  let menuBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("#E6ECFA", "rgba(135, 140, 189, 0.3)");
  const ethBg = useColorModeValue("secondaryGray.300", "navy.900");
  const shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.18)",
    "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
  );

  const handleLogout = async () => {
    try {
      sessionStorage.clear();
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <Flex
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap={secondary ? { base: "wrap", md: "nowrap" } : "unset"}
      p="10px"
      borderRadius="30px"
      boxShadow={shadow}
      justifyContent={"flex-end"}
    >
      {/* <SearchBar
        mb={secondary ? { base: "10px", md: "unset" } : "unset"}
        me="10px"
        borderRadius="30px"
      /> */}
      <Flex
        bg={ethBg}
        display={secondary ? "flex" : "none"}
        borderRadius="30px"
        ms="auto"
        p="6px"
        align="center"
        me="6px"
      ></Flex>
      <SidebarResponsive routes={routes} />

      <Menu>
        <MenuButton p="0px">
          <Avatar
            _hover={{ cursor: "pointer" }}
            color="white"
            name={userProfile?.username}
            bg="#3d94cf"
            size="sm"
            w="40px"
            h="40px"
          />
        </MenuButton>
        <MenuList
          boxShadow={shadow}
          p="0px"
          mt="10px"
          borderRadius="20px"
          bg={menuBg}
          border="none"
        >
          <Flex w="100%" mb="0px" flexDirection="column">
            <Text
              ps="20px"
              pt="16px"
              pb="10px"
              w="100%"
              borderBottom="1px solid"
              borderColor={borderColor}
              fontSize="sm"
              fontWeight="700"
              color={textColor}
            >
              👋&nbsp; Hey, {userProfile?.username}
            </Text>

            <Text
              ps="20px"
              w="100%"
              fontSize="sm"
              fontWeight="700"
              color={textColor}
            >
              {userProfile?.company_name}
            </Text>
            <Text
              ps="20px"
              w="100%"
              fontSize="sm"
              fontWeight="700"
              color={textColor}
            >
              {userProfile?.phonenumber}
            </Text>
            <Text
              ps="20px"
              w="100%"
              borderBottom="1px solid"
              borderColor={borderColor}
              fontSize="sm"
              fontWeight="700"
              color={textColor}
            >
              {userProfile?.email}
            </Text>
          </Flex>
          <Flex flexDirection="column" p="10px">
            <MenuItem
              _hover={{ bg: "none" }}
              _focus={{ bg: "none" }}
              borderRadius="8px"
              px="14px"
            >
              <ChakraLink>
                <Text
                  fontSize="sm"
                  as={Link}
                  to={{
                    pathname: `/admin/profileSettings`,
                  }}
                >
                  Profile Settings
                </Text>
              </ChakraLink>
            </MenuItem>
            <MenuItem
              _hover={{ bg: "none" }}
              _focus={{ bg: "none" }}
              color="red.400"
              borderRadius="8px"
              px="14px"
            >
              <Text fontSize="sm" onClick={handleLogout}>
                Log out
              </Text>
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};
