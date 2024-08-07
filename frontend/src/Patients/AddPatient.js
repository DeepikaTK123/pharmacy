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
  Select,
} from '@chakra-ui/react';

const AddPatient = ({ isOpen, onClose, addNewPatient }) => {
  const [newPatient, setNewPatient] = useState({
    patientNo: '',
    name: '',
    phoneNumber: '',
    dob: '',
    gender: '',
  });

  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient({ ...newPatient, [name]: value });
  };

  const handleSubmit = () => {
    if (newPatient.name && newPatient.phoneNumber && newPatient.dob && newPatient.gender) {
      addNewPatient(newPatient);
      setNewPatient({
        patientNo: '',
        name: '',
        phoneNumber: '',
        dob: '',
        gender: '',
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
        <ModalHeader>Add New Patient</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="patientNo" mb={3}>
            <FormLabel>Patient No (optional)</FormLabel>
            <Input
              type="text"
              name="patientNo"
              value={newPatient.patientNo}
              onChange={handleInputChange}
              placeholder="Enter patient number"
            />
          </FormControl>
          <FormControl id="name" mb={3}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={newPatient.name}
              onChange={handleInputChange}
              placeholder="Enter patient's name"
            />
          </FormControl>
          <FormControl id="phoneNumber" mb={3}>
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="text"
              name="phoneNumber"
              value={newPatient.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </FormControl>
          <FormControl id="dob" mb={3}>
            <FormLabel>Date of Birth</FormLabel>
            <Input
              type="date"
              name="dob"
              value={newPatient.dob}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl id="gender" mb={3}>
            <FormLabel>Gender</FormLabel>
            <Select
              name="gender"
              value={newPatient.gender}
              onChange={handleInputChange}
              placeholder="Select gender"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
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

export default AddPatient;
