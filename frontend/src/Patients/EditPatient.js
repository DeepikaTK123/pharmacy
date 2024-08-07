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
  Select,
} from '@chakra-ui/react';

const EditPatient = ({ isOpen, onClose, updatePatientProp, updatePatient }) => {
  const [patient, setPatient] = useState({
    id: '',
    patientNo: '',
    name: '',
    phoneNumber: '',
    dob: '',
    gender: '',
  });

  const toast = useToast();

  useEffect(() => {
    console.log(updatePatientProp)
    if (updatePatientProp) {
      setPatient({
        id: updatePatientProp.id || '',
        patientNo: updatePatientProp.patient_no || '',
        name: updatePatientProp.name || '',
        phoneNumber: updatePatientProp.phone_number || '',
        dob: new Date(parseInt(updatePatientProp.dob)).toISOString().split('T')[0] || '', // Convert timestamp to YYYY-MM-DD format
        gender: updatePatientProp.gender || '',
      });
    }
  }, [updatePatientProp]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatient(prevPatient => ({ ...prevPatient, [name]: value }));
  };

  const handleSubmit = () => {
    if (patient.name && patient.phoneNumber && patient.dob && patient.gender) {
      updatePatient(patient);
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
        <ModalHeader>Update Patient</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="patientNo" mb={3}>
            <FormLabel>Patient No (optional)</FormLabel>
            <Input
              type="text"
              name="patientNo"
              value={patient.patientNo}
              onChange={handleInputChange}
              placeholder="Enter patient number"
            />
          </FormControl>
          <FormControl id="name" mb={3}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={patient.name}
              onChange={handleInputChange}
              placeholder="Enter patient's name"
            />
          </FormControl>
          <FormControl id="phoneNumber" mb={3}>
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="text"
              name="phoneNumber"
              value={patient.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </FormControl>
          <FormControl id="dob" mb={3}>
            <FormLabel>Date of Birth</FormLabel>
            <Input
              type="date"
              name="dob"
              value={patient.dob}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl id="gender" mb={3}>
            <FormLabel>Gender</FormLabel>
            <Select
              name="gender"
              value={patient.gender}
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

export default EditPatient;
