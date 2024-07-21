import React, { useContext, useEffect, useState } from "react";
import { Box, SimpleGrid, Button, Text } from "@chakra-ui/react";
import axios from "axios";
import { columnsDataDevelopment } from "marketplace/variables/tableColumnsTopCreators";
import KeycloakContext from "auth/KeycloakContext";
import { device_list } from "networks";
import DevelopmentAssets from "./components/DevelopmentAssets";
import AddDevice from "solution/AddDevice";
import CreateDevice from "solution/CreateDevice1";
import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import SolutionToDeviceMapping from "solution/SolutionToDeviceMapping1";

export default function DeviceManagement() {
  const [deviceList, setDeviceList] = useState([]);
  const { userProfile } = useContext(KeycloakContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpen1, onOpen: onOpenModal1, onClose: onCloseModal1 } = useDisclosure();
  const { isOpen: isOpen2, onOpen: onOpenModal2, onClose: onCloseModal2 } = useDisclosure();
  const { isOpen: isOpen7, onOpen: onOpenModal7, onClose: onCloseModal7 } = useDisclosure();

  useEffect(() => {
    fetchDeviceList();
  }, [userProfile]);

  const fetchDeviceList = () => {
    axios
      .get(device_list(userProfile?.attributes?.tenant_id[0]))
      .then((response) => {
        setDeviceList(response.data);
      })
      .catch((error) => {
        console.error("Error fetching uploaded files:", error);
      });
  };

  const handleAddDeviceSchema = () => {
    console.log("Add device schema logic");
  };

  const handleAddDevice = () => {
    console.log("Add device logic");
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Box display="flex" justifyContent="center" mt="10px" marginLeft="800px">
        <Button
          variant="darkBrand"
          color="white"
          fontSize="md" // Adjusted button font size to be smaller
          fontWeight="500"
          borderRadius="8px"
          px="20px" // Reduced horizontal padding
          py="8px" // Reduced vertical padding
          onClick={onOpenModal2}
          mr="10px"
        >
          Create Device Schema
        </Button>
        <Button
          variant="darkBrand"
          color="white"
          fontSize="md" // Adjusted button font size to be smaller
          fontWeight="500"
          borderRadius="8px"
          px="20px" // Reduced horizontal padding
          py="8px" // Reduced vertical padding
          onClick={onOpenModal1}
          mr="10px"
        >
          Add Devices
        </Button>
        <Button
          variant="darkBrand"
          color="white"
          fontSize="md" // Adjusted button font size to be smaller
          fontWeight="500"
          borderRadius="8px"
          px="20px" // Reduced horizontal padding
          py="8px" // Reduced vertical padding
          onClick={onOpenModal7}
        >
          Devices to Schema Mapping
        </Button>
      </Box>
      <SimpleGrid columns={{ base: 1, md: 0 }} spacing="4">
        <Text gridColumn="1 / -1" fontSize="2xl" fontWeight="bold" mb="10px">
          Device List
        </Text>
        <DevelopmentAssets
          columnsData={columnsDataDevelopment}
          tableData={deviceList}
          gridColumn="1 / -1"
          width="100%"
          height="500px"
          overflow="auto"
        />
      </SimpleGrid>
      <Modal isOpen={isOpen1} onClose={onCloseModal1} closeOnOverlayClick={false} size="3xl">
        <ModalOverlay />
        <ModalContent style={{ overflow: "auto", height: "90vh" }} noScroll>
          <ModalHeader>Add device form</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AddDevice />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpen2} onClose={onCloseModal2} closeOnOverlayClick={false} size="6xl">
        <ModalOverlay />
        <ModalContent style={{ overflow: "auto", height: "90vh" }} noScroll>
          <ModalHeader>Add device Schema form</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CreateDevice />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpen7} onClose={onCloseModal7} closeOnOverlayClick={false} size="3xl">
        <ModalOverlay />
        <ModalContent style={{ overflow: "auto", height: "90vh" }} noScroll>
          <ModalHeader>Adding Devices to Soluion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SolutionToDeviceMapping />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}