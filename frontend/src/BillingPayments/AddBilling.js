import React, { useState, useEffect } from 'react';
import Select from 'react-select';
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
  Box,
  Text,
  IconButton,
  Flex,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Divider,
  HStack,
  Select as ChakraSelect,
} from '@chakra-ui/react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { getMedicines } from 'networks';

const AddBilling = ({ isOpen, onClose, addNewBilling }) => {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  const [newBilling, setNewBilling] = useState({
    patientName: '',
    phoneNumber: '',
    ageYear: '',
    ageMonth: '',
    gender: '',
    medicines: [],
    date: today,
    status: 'Paid',
    discount: 0,
    sgstRate: 9, // Adding sgstRate to state
    cgstRate: 9, // Adding cgstRate to state
  });

  const [medicines, setMedicines] = useState([]);
  const toast = useToast();

  useEffect(() => {
    // Fetch medicines when the component mounts
    const fetchMedicines = async () => {
      try {
        const response = await getMedicines();
        const medicinesData = response.data.data.map(med => ({
          value: med.id,
          label: med.name,
          quantityAvailable: med.quantity,
          mrp: med.mrp,
          batchNo: med.batch_no,
          expiryDate: new Date(med.expiry_date).toLocaleDateString("en-US"),
          manufacturedBy: med.manufactured_by,
        }));
        setMedicines(medicinesData);
      } catch (error) {
        console.error('Error fetching medicines:', error);
        toast({
          title: 'Error fetching medicines.',
          description: 'Unable to fetch medicines. Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchMedicines();
  }, [toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBilling({ ...newBilling, [name]: value });
  };

  const handleMedicineChange = (selectedOptions) => {
    const updatedMedicines = selectedOptions.map(option => ({
      ...option,
      quantity: 1,
    }));
    setNewBilling({ ...newBilling, medicines: updatedMedicines });
  };

  const handleQuantityChange = (medicine, change) => {
    const updatedMedicines = newBilling.medicines.map(med => {
      if (med.value === medicine.value) {
        const newQuantity = med.quantity + change;
        return {
          ...med,
          quantity: Math.max(1, newQuantity),
          quantityAvailable: med.quantityAvailable - change,
        };
      }
      return med;
    });
    setNewBilling({ ...newBilling, medicines: updatedMedicines });
  };

  const calculateSubtotal = () => {
    return newBilling.medicines.reduce((total, medicine) => {
      return total + (medicine.mrp * medicine.quantity);
    }, 0).toFixed(2);
  };

  const calculateGST = (subtotal, rate) => {
    return (subtotal * rate / 100).toFixed(2);
  };

  const calculateDiscountAmount = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const discount = parseFloat(newBilling.discount || 0);
    return ((subtotal * discount) / 100).toFixed(2);
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const sgstAmount = parseFloat(calculateGST(subtotal, newBilling.sgstRate));
    const cgstAmount = parseFloat(calculateGST(subtotal, newBilling.cgstRate));
    const discountAmount = parseFloat(calculateDiscountAmount());
    return (subtotal + sgstAmount + cgstAmount - discountAmount).toFixed(2);
  };

  const handleSubmit = () => {
    if (newBilling.patientName && newBilling.phoneNumber && newBilling.medicines.length) {
      const subtotal = calculateSubtotal();
      const sgstAmount = (subtotal * newBilling.sgstRate / 100).toFixed(2);
      const cgstAmount = (subtotal * newBilling.cgstRate / 100).toFixed(2);
      const total = calculateTotal();
      const discount = parseFloat(newBilling.discount || 0);

      const billingPayload = {
        ...newBilling,
        subtotal: subtotal,
        cgst: cgstAmount,
        sgst: sgstAmount,
        discount: discount,
        total: total,
      };

      addNewBilling(billingPayload);

      setNewBilling({
        patientName: '',
        phoneNumber: '',
        ageYear: '',
        ageMonth: '',
        gender: '',
        medicines: [],
        date: today,
        status: 'Paid',
        discount: 0,
        sgstRate: 9,
        cgstRate: 9,
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
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Billing</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="date" mb={3}>
            <FormLabel>Date</FormLabel>
            <Input
              type="date"
              name="date"
              value={newBilling.date}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl id="patientName" mb={3}>
            <FormLabel>Name</FormLabel>
            <Input
              name="patientName"
              value={newBilling.patientName}
              onChange={handleInputChange}
              placeholder="Enter patient name"
            />
          </FormControl>
          <FormControl id="phoneNumber" mb={3}>
            <FormLabel>Phone Number</FormLabel>
            <Input
              name="phoneNumber"
              value={newBilling.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </FormControl>
          <FormControl id="age" mb={3}>
            <FormLabel>Age</FormLabel>
            <HStack>
              <Box>
                <FormLabel fontSize="sm">Year</FormLabel>
                <Input
                  name="ageYear"
                  value={newBilling.ageYear}
                  onChange={handleInputChange}
                  placeholder="Years"
                  size="sm"
                />
              </Box>
              <Box>
                <FormLabel fontSize="sm">Month</FormLabel>
                <Input
                  name="ageMonth"
                  value={newBilling.ageMonth}
                  onChange={handleInputChange}
                  placeholder="Months"
                  size="sm"
                />
              </Box>
            </HStack>
          </FormControl>
          <FormControl id="gender" mb={3}>
            <FormLabel>Gender</FormLabel>
            <ChakraSelect
              name="gender"
              value={newBilling.gender}
              onChange={(e) => handleInputChange({ target: { name: 'gender', value: e.target.value } })}
              placeholder="Select gender"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </ChakraSelect>
          </FormControl>
          <FormControl id="medicines" mb={3}>
            <FormLabel>Medicines</FormLabel>
            <Select
              isMulti
              name="medicines"
              value={newBilling.medicines}
              onChange={handleMedicineChange}
              options={medicines}
              placeholder="Select medicines"
            />
          </FormControl>
          <Box
            maxHeight="300px"
            overflowY="scroll"
            mb={3}
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            p={2}
          >
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th width="20%">Medicine</Th>
                  <Th width="15%">Batch No</Th>
                  <Th width="15%">Expiry Date</Th>
                  <Th width="15%">Manufactured By</Th>
                  <Th width="10%">Quantity</Th>
                  <Th width="10%">MRP (₹)</Th>
                  <Th width="15%">Total (₹)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {newBilling.medicines.map(medicine => (
                  <Tr key={medicine.value}>
                    <Td>{medicine.label} ({medicine.quantityAvailable} available)</Td>
                    <Td>{medicine.batchNo || 'N/A'}</Td>
                    <Td>{medicine.expiryDate || 'N/A'}</Td>
                    <Td>{medicine.manufacturedBy || 'N/A'}</Td>
                    <Td>
                      {medicine.quantityAvailable > 0 ? (
                        <Flex alignItems="center">
                          <IconButton
                            icon={<FaMinus />}
                            onClick={() => handleQuantityChange(medicine, -1)}
                            aria-label="Decrease quantity"
                            size="sm"
                            mr={2}
                          />
                          <Input
                            type="number"
                            value={medicine.quantity}
                            readOnly
                            width="70px"
                            textAlign="center"
                          />
                          <IconButton
                            icon={<FaPlus />}
                            onClick={() => handleQuantityChange(medicine, 1)}
                            aria-label="Increase quantity"
                            size="sm"
                            ml={2}
                          />
                        </Flex>
                      ) : (
                        <Text color="red.500">Out of Stock</Text>
                      )}
                    </Td>
                    <Td>{medicine.mrp.toFixed(2)}</Td>
                    <Td>{(medicine.mrp * medicine.quantity).toFixed(2)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Table variant="simple" mt={4}>
            <Tbody>
              <Tr>
                <Td colSpan="7">
                  <Divider />
                </Td>
              </Tr>
              <Tr>
                <Td colSpan="6" fontWeight="bold">Subtotal (₹)</Td>
                <Td fontWeight="bold" textAlign={'end'}>
                  {calculateSubtotal()}
                </Td>
              </Tr>
              <Tr fontSize="sm">
                <Td colSpan="6" fontWeight="bold">
                  SGST (%) (₹)
                  <Input
                    type="number"
                    name="sgstRate"
                    value={newBilling.sgstRate}
                    onChange={handleInputChange}
                    placeholder="SGST Rate"
                    width="70px"
                    ml={2}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    textAlign="center"
                  />
                </Td>
                <Td textAlign={'end'} fontWeight="bold">
                  {calculateGST(parseFloat(calculateSubtotal()), newBilling.sgstRate)}
                </Td>
              </Tr>
              <Tr fontSize="sm">
                <Td colSpan="6" fontWeight="bold">
                  CGST (%) (₹)
                  <Input
                    type="number"
                    name="cgstRate"
                    value={newBilling.cgstRate}
                    onChange={handleInputChange}
                    placeholder="CGST Rate"
                    width="70px"
                    ml={2}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    textAlign="center"
                  />
                </Td>
                <Td textAlign={'end'} fontWeight="bold">
                  {calculateGST(parseFloat(calculateSubtotal()), newBilling.cgstRate)}
                </Td>
              </Tr>
              <Tr>
                <Td colSpan="6" fontWeight="bold">
                  Discount (%)
                  <Input
                    type="number"
                    name="discount"
                    value={newBilling.discount}
                    onChange={handleInputChange}
                    placeholder="0"
                    width="70px"
                    ml={2}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    textAlign="center"
                  />
                </Td>
                <Td fontWeight="bold" textAlign={'end'}>
                  {calculateDiscountAmount()}
                </Td>
              </Tr>
              <Tr>
                <Td colSpan="6" fontWeight="bold" fontSize="xl">Total (₹)</Td>
                <Td textAlign={'end'} fontWeight="bold" bg="yellow.100" borderRadius="md" fontSize="xl">
                  {calculateTotal()} INR
                </Td>
              </Tr>
            </Tbody>
          </Table>
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

export default AddBilling;
