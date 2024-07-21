import React from "react";
import { Flex, useColorModeValue } from "@chakra-ui/react";
import { HSeparator } from "components/separator/Separator";
import logo from '../../../assets/img/logo.png'; 
export function SidebarBrand({ logoColor }) {


  return (
    <Flex align='center' direction='column'>
      <img
        src={logo} 
        alt="Local Logo"
        style={{ marginBottom: '25px', marginTop:'21px', color: useColorModeValue(logoColor, 'white') }} 
        width='90px'
        height='60px'
      />
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;
