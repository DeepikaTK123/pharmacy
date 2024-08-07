import React, { useState, useEffect } from 'react';
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

const EditService = ({ isOpen, onClose, updateServiceProp, updateService }) => {
  const [service, setService] = useState({
    id: '',
    name: '',
    price: '',
  });

  const toast = useToast();

  useEffect(() => {
    if (updateServiceProp) {
      setService({
        id: updateServiceProp.id || '',
        name: updateServiceProp.name || '',
        price: updateServiceProp.price || '',
      });
    }
  }, [updateServiceProp]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setService(prevService => ({ ...prevService, [name]: value }));
  };

  const handleSubmit = () => {
    if (service.name  && service.price) {
      updateService(service);
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
    <Modal isOpen={isOpen} onClose={() => onClose(null)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Service</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="name" mb={3}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={service.name}
              onChange={handleInputChange}
              placeholder="Enter service name"
            />
          </FormControl>
          
          <FormControl id="price" mb={3}>
            <FormLabel>Price</FormLabel>
            <Input
              type="text"
              name="price"
              value={service.price}
              onChange={handleInputChange}
              placeholder="Enter service price"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={() => onClose(null)}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditService;
