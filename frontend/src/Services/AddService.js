import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
} from '@chakra-ui/react';

const AddService = ({ isOpen, onClose, addNewService }) => {
  const [newService, setNewService] = useState({
    name: '',
    price: '',
  });

  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService({ ...newService, [name]: value });
  };

  const handleSubmit = () => {
    if (newService.name  && newService.price) {
      addNewService(newService);
      setNewService({
        name: '',
        price: '',
      });
      onClose();
    } else {
      toast({
        title: 'Error.',
        description: 'Please fill out all fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Service</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="name" mb={3}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={newService.name}
              onChange={handleInputChange}
              placeholder="Enter service name"
            />
          </FormControl>
         
          <FormControl id="price" mb={3}>
            <FormLabel>Price</FormLabel>
            <Input
              type="text"
              name="price"
              value={newService.price}
              onChange={handleInputChange}
              placeholder="Enter service price"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddService;
