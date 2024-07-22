import React, { useState } from "react";
import {
  Box,
  Flex,
  Drawer,
  DrawerBody,
  Icon,
  useColorModeValue,
  DrawerOverlay,
  useDisclosure,
  DrawerContent,
  DrawerCloseButton,
  Image,
} from "@chakra-ui/react";
import {
  renderThumb,
  renderTrack,
  renderView,
} from "components/scrollbar/Scrollbar";
import { Scrollbars } from "react-custom-scrollbars-2";
import PropTypes from "prop-types";
import { IoMenuOutline } from "react-icons/io5";
import SidebarLinks from "Sidebar/Sidebar_items";
import logo from 'assets/img/logo3.png';
import SidebarRoutes from "./Sidebar_routes";
import Routes from "routes"
// FUNCTIONS
function Sidebar(props) {

  let variantChange = "0.2s linear";
  let shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.08)",
    "unset"
  );
  // Chakra Color Mode
  let sidebarBg = useColorModeValue("white", "navy.800");
  let sidebarMargins = "0px";
  // SIDEBAR
  const isLoggedIn = sessionStorage.getItem("login") === "true";
  const marginLeft = { sm: "0px", xl: isLoggedIn ? "300px" : "0px" };
  return (
    <>
      <Box display={{ sm: "none", xl: "block" }} w="100%" position='fixed' minH='100%'  
      // backgroundImage={backgroudimage} backgroundRepeat={"no-repeat"} backgroundPosition={"cover"} backgroundSize={"cover"}
    bgGradient='linear(to-r, white, #56CCF2)'
    >
        <Box
          // bg={sidebarBg}
          transition={variantChange}
          w='300px'
          h='100vh'
          m={sidebarMargins}
          minH='100%'
          paddingInlineStart={"16px"}
          paddingInlineEnd={"16px"}
          overflowX='hidden'
          backdropFilter="blur(10px)"
          boxShadow={shadow}
          borderRight= "3px solid #a4a5a5"
          borderRadius="63px"
          >
            
          <Scrollbars
            autoHide
            renderTrackVertical={renderTrack}
            renderThumbVertical={renderThumb}
            renderView={renderView}>
            <Flex align='center' direction='column' paddingTop={"25px"}>
              <Image
                src={logo} // Use the imported local logo image
                alt="Local Logo"
                style={{ marginBottom: '0px', marginTop: '21px', color: 'white' }} // Adjust color mode for logoColor
                width='120px'
                height='120px'
              />
            </Flex>
            <Flex h='1px' w='100%' bg='rgba(135, 140, 189, 0.3)' marginBottom={"30px"}  ></Flex >

            <SidebarLinks></SidebarLinks>
          </Scrollbars>
        </Box>


      </Box>
      <Flex marginLeft={marginLeft} justifyContent={"center"}  >
        <Box width={"100%"} margin={"2%"} borderRadius={20} bg={"#f4f7fe"} borderWidth={0} >
          <Routes />
        </Box>
      </Flex>
    </>
  );

}
// FUNCTIONS
export function SidebarResponsive(props) {
  let sidebarBackgroundColor = useColorModeValue("white", "navy.800");
  let menuColor = useColorModeValue("gray.400", "white");
  // // SIDEBAR
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  const routes = SidebarRoutes;
  // let isWindows = navigator.platform.startsWith("Win");
  //  BRAND

  return (
    <Flex display={{ sm: "flex", xl: "none" }} alignItems='center'>

      <Flex ref={btnRef} w='max-content' h='max-content' onClick={onOpen}>
        <Icon
          as={IoMenuOutline}
          color={menuColor}
          my='auto'
          w='20px'
          h='20px'
          me='10px'
          _hover={{ cursor: "pointer" }}
        />
      </Flex>

      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement={document.documentElement.dir === "rtl" ? "right" : "left"}
        finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent w='285px' maxW='285px' bg={sidebarBackgroundColor}>
          <DrawerCloseButton
            zIndex='3'
            onClose={onClose}
            _focus={{ boxShadow: "none" }}
            _hover={{ boxShadow: "none" }}
          />
          <DrawerBody maxW='285px' px='0rem' pb='0'>
            <Scrollbars
              autoHide
              renderTrackVertical={renderTrack}
              renderThumbVertical={renderThumb}
              renderView={renderView}>
              <Flex align='center' direction='column' paddingTop={"25px"}>
                <Image
                  src={logo} // Use the imported local logo image
                  alt="Local Logo"
                  style={{ marginBottom: '25px', marginTop: '21px', color: 'white' }} // Adjust color mode for logoColor
                  width='90px'
                  height='65px'
                />
              </Flex>
              <Flex h='1px' w='100%' bg='rgba(135, 140, 189, 0.3)' marginBottom={"30px"} ></Flex>

              <SidebarLinks></SidebarLinks>
            </Scrollbars>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  )
}
// PROPS

Sidebar.propTypes = {
  logoText: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  variant: PropTypes.string,
};
export default Sidebar;

