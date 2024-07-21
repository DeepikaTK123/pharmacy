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

const AddMedicine = ({ isOpen, onClose, addNewMedicine }) => {
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    batchNo: '', // Adding Batch Number field
    quantity: '',
    expiryDate: '',
    mrp: '', // Adding MRP field
    manufacturedBy: '', // Adding Manufactured By field
  });

  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedicine({ ...newMedicine, [name]: value });
  };

  const handleSubmit = () => {
    if (newMedicine.name && newMedicine.batchNo && newMedicine.quantity && newMedicine.expiryDate && newMedicine.mrp && newMedicine.manufacturedBy) {
      addNewMedicine(newMedicine);
      setNewMedicine({
        name: '',
        batchNo: '',
        quantity: '',
        expiryDate: '',
        mrp: '', // Resetting MRP field after submission
        manufacturedBy: '', // Resetting Manufactured By field after submission
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
        <ModalHeader>Add New Medicine</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="name" mb={3}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={newMedicine.name}
              onChange={handleInputChange}
              placeholder="Enter medicine name"
            />
          </FormControl>
          <FormControl id="batchNo" mb={3}>
            <FormLabel>Batch Number</FormLabel>
            <Input
              type="text"
              name="batchNo"
              value={newMedicine.batchNo}
              onChange={handleInputChange}
              placeholder="Enter batch number"
            />
          </FormControl>
          <FormControl id="quantity" mb={3}>
            <FormLabel>Quantity</FormLabel>
            <Input
              type="number"
              name="quantity"
              value={newMedicine.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
            />
          </FormControl>
          <FormControl id="mrp" mb={3}>
            <FormLabel>MRP</FormLabel>
            <Input
              type="number"
              name="mrp"
              value={newMedicine.mrp}
              onChange={handleInputChange}
              placeholder="Enter MRP"
            />
          </FormControl>
          <FormControl id="expiryDate" mb={3}>
            <FormLabel>Expiration Date</FormLabel>
            <Input
              type="date"
              name="expiryDate"
              value={newMedicine.expiryDate}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl id="manufacturedBy" mb={3}>
            <FormLabel>Manufactured By</FormLabel>
            <Input
              type="text"
              name="manufacturedBy"
              value={newMedicine.manufacturedBy}
              onChange={handleInputChange}
              placeholder="Enter manufacturer name"
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

export default AddMedicine;
