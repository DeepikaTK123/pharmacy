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

const EditMedicine = ({ isOpen, onClose, updateMedicineProp, updateMedicine }) => {
  const [medicine, setMedicine] = useState(updateMedicineProp);
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedicine({ ...medicine, [name]: value });
  };

  const handleSubmit = () => {
    if (medicine.name && medicine.batchNo && medicine.quantity && medicine.expiry_date && medicine.mrp && medicine.manufacturedBy) {
      medicine.expiry_date = new Date(medicine.expiry_date);
      updateMedicine(medicine);
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

  const formatDate = (date) => {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    setMedicine({ ...updateMedicineProp });
  }, [updateMedicineProp]);

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(null)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Medicine</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="name" mb={3}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={medicine.name}
              onChange={handleInputChange}
              placeholder="Enter medicine name"
            />
          </FormControl>
          <FormControl id="batchNo" mb={3}>
            <FormLabel>Batch Number</FormLabel>
            <Input
              type="text"
              name="batchNo"
              value={medicine.batchNo}
              onChange={handleInputChange}
              placeholder="Enter batch number"
            />
          </FormControl>
          <FormControl id="quantity" mb={3}>
            <FormLabel>Quantity</FormLabel>
            <Input
              type="number"
              name="quantity"
              value={medicine.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
            />
          </FormControl>
          <FormControl id="mrp" mb={3}>
            <FormLabel>MRP</FormLabel>
            <Input
              type="number"
              name="mrp"
              value={medicine.mrp}
              onChange={handleInputChange}
              placeholder="Enter MRP"
            />
          </FormControl>
          <FormControl id="expiry_date" mb={3}>
            <FormLabel>Expiration Date</FormLabel>
            <Input
              type="date"
              name="expiry_date"
              value={formatDate(medicine.expiry_date)}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl id="manufacturedBy" mb={3}>
            <FormLabel>Manufactured By</FormLabel>
            <Input
              type="text"
              name="manufacturedBy"
              value={medicine.manufacturedBy}
              onChange={handleInputChange}
              placeholder="Enter manufacturer name"
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

export default EditMedicine;
