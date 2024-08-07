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
  Textarea,
  useToast,
  Box,
  Flex,
  Text,
  Divider,
  Radio,
  RadioGroup,
  Stack,
  Checkbox,
  CheckboxGroup,
  Select,
} from '@chakra-ui/react';
import ReactSelect from 'react-select';
import { getMedicines, getServices } from 'networks';

const EditPrescription = ({ isOpen, onClose, updatePrescription, initialPrescription }) => {
  console.log(initialPrescription)
  const [prescription, setPrescription] = useState({
    id: '',
    doctorName: '',
    patientName: '',
    phoneNumber: '',
    patientId: '',
    patientDob: '',
    patientGender: '',
    bloodPressure: '',
    temperature: '',
    heartBeat: '',
    spo2: '',
    diagnosis: '',
    medications: [],
    services: [],
  });
  const [medicationOptions, setMedicationOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const toast = useToast();
console.log(initialPrescription)
  useEffect(() => {
    const doctorName = JSON.parse(sessionStorage.getItem('data')).username;
    if (doctorName) {
      setPrescription((prevState) => ({
        ...prevState,
        doctorName,
      }));
    }

    if (initialPrescription) {
      setPrescription({
        id: initialPrescription.id,
        doctorName: initialPrescription.doctor_name,
        patientName: initialPrescription.patient_name,
        phoneNumber: initialPrescription.phone_number,
        patientId: initialPrescription.patient_id || '',
        patientDob: initialPrescription.patient_dob ? new Date(initialPrescription.patient_dob).toISOString().split('T')[0] : '',
        patientGender: initialPrescription.patient_gender,
        bloodPressure: initialPrescription.blood_pressure || '',
        temperature: initialPrescription.temperature || '',
        heartBeat: initialPrescription.heart_beat || '',
        spo2: initialPrescription.spo2 || '',
        diagnosis: initialPrescription.diagnosis || '',
        medications: initialPrescription.medication.map(med => ({
          value: med.value,
          label: med.label,
          dosage: med.dosage,
          instructions: med.instructions,
          timing: med.timing,
          timesOfDay: med.timesOfDay,
        })) || [],
        services: initialPrescription.services ? initialPrescription.services.map(service => ({
          value: service.value,
          label: service.label,
        })) : [],
      });
    }

    const fetchMedications = async () => {
      try {
        const response = await getMedicines();
        const medications = response.data.data.map(med => ({
          value: med.id,
          label: med.name,
        }));
        setMedicationOptions(medications);
      } catch (error) {
        toast({
          title: 'Error fetching medications.',
          description: 'An error occurred while fetching medications.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    const fetchServices = async () => {
      try {
        const response = await getServices();
        const services = response.data.data.map(service => ({
          value: service.id,
          label: service.name,
        }));
        setServiceOptions(services);
      } catch (error) {
        toast({
          title: 'Error fetching services.',
          description: 'An error occurred while fetching services.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchMedications();
    fetchServices();
  }, [toast, initialPrescription]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrescription({ ...prescription, [name]: value });
  };

  const handleMedicationsChange = (selectedOptions) => {
    setPrescription({ 
      ...prescription, 
      medications: selectedOptions.map(option => ({
        ...option,
        dosage: '',
        instructions: '',
        timing: '',
        timesOfDay: [],
      })) || [] 
    });
  };

  const handleServicesChange = (selectedOptions) => {
    setPrescription({
      ...prescription,
      services: selectedOptions || [],
    });
  };

  const handleMedicationDetailChange = (index, field, value) => {
    const updatedMedications = prescription.medications.map((medication, medIndex) => 
      medIndex === index ? { ...medication, [field]: value } : medication
    );
    setPrescription({ ...prescription, medications: updatedMedications });
  };

  const handleTimesOfDayChange = (index, value) => {
    const updatedMedications = prescription.medications.map((medication, medIndex) => 
      medIndex === index ? { ...medication, timesOfDay: value } : medication
    );
    setPrescription({ ...prescription, medications: updatedMedications });
  };

  const handleSubmit = () => {
    if (
      prescription.doctorName &&
      prescription.patientName &&
      prescription.phoneNumber &&
      prescription.patientDob &&
      prescription.patientGender &&
      prescription.bloodPressure &&
      prescription.temperature &&
      prescription.heartBeat &&
      prescription.spo2 &&
      prescription.diagnosis &&
      prescription.medications.length > 0 &&
      prescription.medications.every(med => med.dosage && med.instructions && med.timing && med.timesOfDay.length > 0)
    ) {
      updatePrescription(prescription);
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
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Prescription</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box maxW="1000px" mx="auto">
            <FormControl id="doctorName" mb={5}>
              <FormLabel>Doctor Name</FormLabel>
              <Input
                type="text"
                name="doctorName"
                value={prescription.doctorName}
                readOnly
              />
            </FormControl>
            <Flex mb={5}>
              <FormControl id="phoneNumber" mr={5}>
                <FormLabel>Patient Phone Number</FormLabel>
                <Input
                  type="text"
                  name="phoneNumber"
                  value={prescription.phoneNumber}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl id="patientName">
                <FormLabel>Patient Name</FormLabel>
                <Input
                  type="text"
                  name="patientName"
                  value={prescription.patientName}
                  onChange={handleInputChange}
                />
              </FormControl>
            </Flex>
            <Flex mb={5}>
              <FormControl id="patientId" mr={5}>
                <FormLabel>Patient ID (Optional)</FormLabel>
                <Input
                  type="text"
                  name="patientId"
                  value={prescription.patientId}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl id="patientDob" mr={5}>
                <FormLabel>Patient Date of Birth</FormLabel>
                <Input
                  type="date"
                  name="patientDob"
                  value={prescription.patientDob}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl id="patientGender">
                <FormLabel>Patient Gender</FormLabel>
                <Select
                  name="patientGender"
                  value={prescription.patientGender}
                  onChange={(e) => setPrescription({ ...prescription, patientGender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>
            </Flex>
            <Flex mb={5}>
              <FormControl id="bloodPressure" mr={5}>
                <FormLabel>Blood Pressure (mmHg)</FormLabel>
                <Input
                  type="text"
                  name="bloodPressure"
                  value={prescription.bloodPressure}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl id="temperature" mr={5}>
                <FormLabel>Temperature (°C)</FormLabel>
                <Input
                  type="text"
                  name="temperature"
                  value={prescription.temperature}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl id="heartBeat" mr={5}>
                <FormLabel>Heart Beat (bpm)</FormLabel>
                <Input
                  type="text"
                  name="heartBeat"
                  value={prescription.heartBeat}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl id="spo2">
                <FormLabel>SpO2 (%)</FormLabel>
                <Input
                  type="text"
                  name="spo2"
                  value={prescription.spo2}
                  onChange={handleInputChange}
                />
              </FormControl>
            </Flex>
            <FormControl id="services" mb={5}>
              <FormLabel>Services</FormLabel>
              <ReactSelect
                isMulti
                name="services"
                options={serviceOptions}
                value={prescription.services}
                onChange={handleServicesChange}
              />
            </FormControl>
            <FormControl id="diagnosis" mb={5}>
              <FormLabel>Diagnosis</FormLabel>
              <Textarea
                name="diagnosis"
                value={prescription.diagnosis}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl id="medications" mb={5}>
              <FormLabel>Medications</FormLabel>
              <ReactSelect
                isMulti
                name="medications"
                options={medicationOptions}
                value={prescription.medications}
                onChange={handleMedicationsChange}
              />
            </FormControl>
            {prescription.medications && prescription.medications.length > 0 && prescription.medications.map((medication, index) => (
              <Box key={medication.value} mb={5}>
                <Text fontWeight="bold" mb={2}>{medication.label}</Text>
                <Flex mb={5} direction="column">
                  <FormControl id={`dosage-${medication.value}`} mb={2}>
                    <FormLabel fontSize="sm">Dosage (mg)</FormLabel>
                    <Input
                      type="number"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationDetailChange(index, 'dosage', e.target.value)}
                    />
                  </FormControl>
                  <Flex mb={3}>
                    <FormControl id={`timing-${medication.value}`} mr={5}>
                      <FormLabel fontSize="sm">Timing</FormLabel>
                      <RadioGroup
                        onChange={(value) => handleMedicationDetailChange(index, 'timing', value)}
                        value={medication.timing}
                      >
                        <Stack direction="row">
                          <Radio value="beforeFood" fontSize="sm">Before Food</Radio>
                          <Radio value="afterFood" fontSize="sm">After Food</Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>
                    <FormControl id={`timesOfDay-${medication.value}`}>
                      <FormLabel fontSize="sm">Times of Day</FormLabel>
                      <CheckboxGroup
                        value={medication.timesOfDay}
                        onChange={(value) => handleTimesOfDayChange(index, value)}
                      >
                        <Stack direction="row">
                          <Checkbox value="morning" fontSize="sm">Morning</Checkbox>
                          <Checkbox value="afternoon" fontSize="sm">Afternoon</Checkbox>
                          <Checkbox value="night" fontSize="sm">Night</Checkbox>
                        </Stack>
                      </CheckboxGroup>
                    </FormControl>
                  </Flex>
                  <FormControl id={`instructions-${medication.value}`}>
                    <FormLabel fontSize="sm">Additional Instructions</FormLabel>
                    <Textarea
                      value={medication.instructions}
                      onChange={(e) => handleMedicationDetailChange(index, 'instructions', e.target.value)}
                    />
                  </FormControl>
                </Flex>
                {index < prescription.medications.length - 1 && (
                  <Divider my={4} borderWidth="2px" borderColor="gray.500" />
                )}
              </Box>
            ))}
          </Box>
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

export default EditPrescription;
