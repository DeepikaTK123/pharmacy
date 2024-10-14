import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Radio,
  RadioGroup,
  Stack,
  Input,
  Flex,
  Textarea,
  Box,
  SimpleGrid,
} from "@chakra-ui/react";
import { getMedicines, getServices } from "networks"; // Import your API calls here
import HumanBodySVG from "assets/img/humanbody";
import { addPatientRecord } from "networks";

const CreateRecordModal = ({ isOpen, onClose,patientId }) => {
  const [formData, setFormData] = useState({
    diagnosis: "",
    bloodPressure: null,
    heartRate: null,
    temperature: null,
    spo2: null,
    prescription: [],
    services: [],
    additionalInstructions: "", // Additional instructions field
  });
const doctorName=JSON.parse(sessionStorage.getItem("data")).username
  const [medicines, setMedicines] = useState([]);
  const [services, setServices] = useState([]);
  const toast = useToast();
  const [marksList, setMarksList] = useState([]);
  // Fetch medicines and services when the modal is opened
  useEffect(() => {
    if (isOpen) {
      const fetchMedicinesAndServices = async () => {
        try {
          // Fetch medicines
          const medicinesResponse = await getMedicines();
          const medicinesData = medicinesResponse.data.data.map((med) => ({
            value: med.id,
            label: med.name,
            quantityAvailable: med.quantity,
            originalQuantity: med.quantity,
            mrp: med.mrp,
            batchNo: med.batch_no,
            expiryDate: new Date(med.expiry_date).toLocaleDateString("en-US"),
            manufacturedBy: med.manufactured_by,
            cgst: med.cgst,
            sgst: med.sgst,
            rate: med.rate,
            total: med.total,
          }));
          setMedicines(medicinesData);

          // Fetch services
          const servicesResponse = await getServices();
          const servicesData = servicesResponse.data.data.map((service) => ({
            value: service.id,
            label: service.name,
            price: service.price,
          }));
          setServices(servicesData);
        } catch (error) {
          toast({
            title: "Error fetching data.",
            description: "Unable to fetch medicines or services. Please try again later.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      };

      fetchMedicinesAndServices();
    }
  }, [isOpen, toast]);

  const handlePrescriptionChange = (selectedOptions) => {
    const updatedPrescriptions = selectedOptions.map((medicine) => ({
      ...medicine,
      quantity: 0, // Set initial quantity to 0
      food: "after", // Default to after food
      timings: { morning: 0, afternoon: 0, evening: 0 }, // Set timings to 0
    }));
    setFormData({
      ...formData,
      prescription: updatedPrescriptions,
    });
  };

  const handleServiceChange = (selectedOptions) => {
    setFormData({
      ...formData,
      services: selectedOptions,
    });
  };

  const handleQuantityChange = (index, value) => {
    const updatedPrescription = [...formData.prescription];
    updatedPrescription[index].quantity = value;
    setFormData({ ...formData, prescription: updatedPrescription });
  };

  const handleFoodChange = (index, value) => {
    const updatedPrescription = [...formData.prescription];
    updatedPrescription[index].food = value;
    setFormData({ ...formData, prescription: updatedPrescription });
  };

  const handleTimingChange = (index, timing, value) => {
    const updatedPrescription = [...formData.prescription];
    updatedPrescription[index].timings[timing] = value;
    setFormData({ ...formData, prescription: updatedPrescription });
  };

  const handleSubmit = () => {
    // Prepare the payload
    const payload = {
      ...formData,
      doctorName, // Add doctor name
      marksList,  // Add marks list
      patientId,
    };

    addPatientRecord(payload)

    // Close the modal
    onClose();
  };
  
  const handleBodyClick = (x, y) => {
    setMarksList((prevMarks) => [...prevMarks, { markx: x, marky: y, markcolor: "red" }]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl"> {/* Increased modal size */}
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Record</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Doctor Name Field */}
          <SimpleGrid columns={[1, null, 2]} spacing="40px" mb={5}>
          <Box>
          <FormControl mb={4}>
            <FormLabel>Doctor Name</FormLabel>
            <Input
              value={doctorName}
              isReadOnly
              placeholder="Doctor's Name"
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Diagnosis</FormLabel>
            <Input
              name="diagnosis"
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
              placeholder="Enter diagnosis"
            />
          </FormControl>
          </Box>
          <Box
              d="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <FormLabel textAlign="center">Mark Body Parts</FormLabel>
              <Flex justifyContent={"center"}>
              <Flex justifyContent={"center"} > 
              <HumanBodySVG marks={marksList} onBodyClick={handleBodyClick} />
              </Flex>
              </Flex>
            </Box>
          </SimpleGrid>
            <Flex>
          <FormControl mb={4}>
            <FormLabel>Blood Pressure</FormLabel>
            <Input
              name="bloodPressure"
              value={formData.bloodPressure}
              type="number"
              onChange={(e) =>
                setFormData({ ...formData, bloodPressure: e.target.value })
              }
              placeholder="Enter blood pressure"
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Heart Rate</FormLabel>
            <Input
              name="heartRate"
              value={formData.heartRate}
              type="number"
              onChange={(e) =>
                setFormData({ ...formData, heartRate: e.target.value })
              }
              placeholder="Enter heart rate"
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Temperature (°F)</FormLabel>
            <Input
              name="temperature"
              value={formData.temperature}
              type="number"
              onChange={(e) =>
                setFormData({ ...formData, temperature: e.target.value })
              }
              placeholder="Enter temperature"
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>SpO2 (%)</FormLabel>
            <Input
              name="spo2"
              value={formData.spo2}
              type="number"
              onChange={(e) =>
                setFormData({ ...formData, spo2: e.target.value })
              }
              placeholder="Enter SpO2"
            />
          </FormControl>
          </Flex>
          <FormControl mb={4}>
          <FormLabel>Services</FormLabel>
            <Select
              isMulti
              name="services"
              value={formData.services}
              onChange={handleServiceChange}
              options={services}
              placeholder="Select services"
            />
          </FormControl>

          {/* Medicines Dropdown */}
          <FormControl mb={4}>
            <FormLabel>Medicines</FormLabel>
            <Select
              isMulti
              name="prescription"
              value={formData.prescription}
              onChange={handlePrescriptionChange}
              options={medicines}
              placeholder="Select medicines"
            />
          </FormControl>

          {/* Render selected medicines */}
          {formData.prescription.map((med, index) => (
            <FormControl key={index} mb={4} w={800}>
                <Flex>
              <FormLabel mr={20} fontWeight={"bold"}>{med.label}</FormLabel>

              <FormControl mb={2}>
                <FormLabel>Quantity</FormLabel>
                <NumberInput
                  step={1}
                  min={0}
                  value={med.quantity}
                  onChange={(value) => handleQuantityChange(index, value)}
                  width="100px"
                  max={med.quantityAvailable} // Set the maximum to available quantity
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl mb={2}>
                <FormLabel>Before/After Food</FormLabel>
                <RadioGroup
                  onChange={(value) => handleFoodChange(index, value)}
                  value={med.food}
                >
                  <Stack direction="row">
                    <Radio value="after">After Food</Radio>
                    <Radio value="before">Before Food</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl mb={2}>
                <FormLabel>Timings</FormLabel>
                <Flex>
                  <NumberInput
                    step={1}
                    defaultValue={15}
                    min={0}
                    max={60}
                    onChange={(value) =>
                      handleTimingChange(index, "morning", value)
                    }
                    value={med.timings.morning}
                    width="80px"
                    mr={2}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>

                  <NumberInput
                    step={1}
                    defaultValue={15}
                    min={0}
                    max={60}
                    onChange={(value) =>
                      handleTimingChange(index, "afternoon", value)
                    }
                    value={med.timings.afternoon}
                    width="80px"
                    mr={2}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>

                  <NumberInput
                    step={1}
                    defaultValue={15}
                    min={0}
                    max={60}
                    onChange={(value) =>
                      handleTimingChange(index, "evening", value)
                    }
                    value={med.timings.evening}
                    width="80px"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Flex>
              </FormControl>
              </Flex>
            </FormControl>
            
          ))}

          {/* Services Dropdown */}
          
         
          {/* Additional Instructions */}
          <FormControl mb={4}>
            <FormLabel>Additional Instructions</FormLabel>
            <Textarea
              value={formData.additionalInstructions}
              onChange={(e) =>
                setFormData({ ...formData, additionalInstructions: e.target.value })
              }
              placeholder="Enter any additional instructions for the patient"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Save Record
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateRecordModal;
