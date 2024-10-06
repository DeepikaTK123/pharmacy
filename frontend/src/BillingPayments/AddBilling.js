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
import { getMedicines, getPatientName, addService, getServices } from 'networks';

const AddBilling = ({ isOpen, onClose, addNewBilling }) => {
  const today = new Date().toISOString().split('T')[0];

  const [newBilling, setNewBilling] = useState({
    patientName: '',
    patientNumber: '',
    phoneNumber: '',
    dob: '', // Date of Birth
    ageYear: null,
    ageMonth: null,
    gender: '',
    items: [],
    date: today,
    status: 'Paid',
    discount: 0,
  });

  const [medicines, setMedicines] = useState([]);
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', price: '' });
  const [isAddingService, setIsAddingService] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await getMedicines();
        const medicinesData = response.data.data.map(med => ({
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
      } catch (error) {
        toast({
          title: 'Error fetching medicines.',
          description: 'Unable to fetch medicines. Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    const fetchServices = async () => {
      try {
        const response = await getServices();
        const servicesData = response.data.data.map(service => ({
          value: service.id,
          label: service.name,
          price: service.price,
          total: service.price,
        }));
        setServices(servicesData);
      } catch (error) {
        toast({
          title: 'Error fetching services.',
          description: 'Unable to fetch services. Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchMedicines();
    fetchServices();
  }, [toast]);

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (age < 0 || (age === 0 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
      age = 0;
    }

    const months = (monthDiff < 0 ? 12 + monthDiff : monthDiff) + (dayDiff < 0 ? -1 : 0);

    return { years: age, months };
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber' && value.length >= 10) {
      try {
        const response = await getPatientName(value);
        if (response.data.status === 'success' && response.data.data.length > 0) {
          const patient = response.data.data[0];
          const dobDate = new Date(patient.dob);
          const dobString = dobDate.toISOString().split('T')[0];
          const { years, months } = calculateAge(dobDate);
          setNewBilling(prev => ({
            ...prev,
            patientName: patient.name,
            patientNumber: patient.patient_no,
            phoneNumber: patient.phone_number,
            dob: dobString,
            ageYear: years,
            ageMonth: months,
            gender: patient.gender,
          }));
        } else {
          setNewBilling(prev => ({
            ...prev,
            [name]: value,
            patientName: '',
            patientNumber: '',
            dob: '',
            ageYear: null,
            ageMonth: null,
            gender: '',
          }));
        }
      } catch (error) {
        setNewBilling(prev => ({
          ...prev,
          [name]: value,
          patientName: '',
          patientNumber: '',
          dob: '',
          ageYear: null,
          ageMonth: null,
          gender: '',
        }));
      }
    } else if (name === 'dob') {
      const { years, months } = calculateAge(value);
      setNewBilling(prev => ({ ...prev, [name]: value, ageYear: years || 0, ageMonth: months || 0 }));
    } else {
      setNewBilling(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (selectedOptions, type) => {
    const updatedItems = selectedOptions.map(option => {
      const existingItem = newBilling.items.find(item => item.value === option.value && item.type === type);
      const itemData = type === 'medicine' ? medicines.find(med => med.value === option.value) : services.find(serv => serv.value === option.value);
      return existingItem || {
        ...option,
        type,
        quantity: type === 'medicine' ? 0 : 1, 
        quantityAvailable: itemData?.quantityAvailable || 1,
        originalQuantity: itemData?.originalQuantity || 1,
        price: itemData?.mrp || itemData?.price,
        total: itemData?.total,
        cgst: itemData?.cgst || 0,
        sgst: itemData?.sgst || 0,
        item_id: itemData?.value 
      };
    });

    const otherItems = newBilling.items.filter(item => item.type !== type);
    setNewBilling(prev => ({ ...prev, items: [...otherItems, ...updatedItems] }));
  };

  const handleQuantityChange = (item, change) => {
    const updatedItems = newBilling.items.map(it => {
      if (it.value === item.value && it.type === item.type) {
        const newQuantity = it.quantity + change;
        const updatedQuantityAvailable = it.originalQuantity - newQuantity;
        return {
          ...it,
          quantity: Math.max(0, newQuantity),
          quantityAvailable: updatedQuantityAvailable,
        };
      }
      return it;
    });

    setNewBilling(prev => ({ ...prev, items: updatedItems }));
  };

  const handleAddNewService = async () => {
    if (newService.name && newService.price) {
      await addService(newService);
      const service = {
        label: newService.name,
        value: newService.name,
        price: parseFloat(newService.price),
        total: parseFloat(newService.price),
      };

      const updatedServices = [...newBilling.items, { ...service, type: 'service', quantity: 1 }];

      setNewBilling(prev => ({ ...prev, items: updatedServices }));

      setNewService({ name: '', price: '' });
      setIsAddingService(false);
    } else {
      toast({
        title: 'Error.',
        description: 'Please fill out the service name and price.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const calculateSubtotal = () => {
    const subtotal = newBilling.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
    return subtotal.toFixed(2);
  };

  const calculateGST = (subtotal, rate) => {
    return ((subtotal * rate) / 100).toFixed(2);
  };

  const calculateDiscountAmount = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const discount = parseFloat(newBilling.discount || 0);
    return ((subtotal * discount) / 100).toFixed(2);
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const sgstRate = calculateAverageGST('sgst');
    const cgstRate = calculateAverageGST('cgst');
    const sgstAmount = parseFloat(calculateGST(subtotal, sgstRate));
    const cgstAmount = parseFloat(calculateGST(subtotal, cgstRate));
    const discountAmount = parseFloat(calculateDiscountAmount());
    return (subtotal + sgstAmount + cgstAmount - discountAmount).toFixed(2);
  };

  const calculateAverageGST = (type) => {
    const totalGST = newBilling.items.reduce((total, item) => {
      return total + (type === 'sgst' ? item.sgst : item.cgst);
    }, 0);
    return (totalGST / newBilling.items.length) || 0;
  };

  const handleSubmit = () => {
    if (newBilling.patientName && newBilling.phoneNumber && newBilling.items.length) {
      const subtotal = calculateSubtotal();
      const sgstRate = calculateAverageGST('sgst');
      const cgstRate = calculateAverageGST('cgst');
      const sgstAmount = (subtotal * sgstRate) / 100;
      const cgstAmount = (subtotal * cgstRate) / 100;
      const total = calculateTotal();
      const discount = parseFloat(newBilling.discount || 0);

      const billingPayload = {
        ...newBilling,
        subtotal: subtotal,
        cgst: sgstAmount.toFixed(2),
        sgst: cgstAmount.toFixed(2),
        discount: discount.toFixed(2),
        total: total,
      };

      addNewBilling(billingPayload);

      setNewBilling({
        patientName: '',
        patientNumber: '',
        phoneNumber: '',
        dob: '',
        ageYear: 0,
        ageMonth: 0,
        gender: '',
        items: [],
        date: today,
        status: 'Paid',
        discount: 0,
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
          <FormControl id="phoneNumber" mb={3}>
            <FormLabel>Phone Number</FormLabel>
            <Input
              name="phoneNumber"
              value={newBilling.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
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
          <FormControl id="patientNumber" mb={3}>
            <FormLabel>Patient Number</FormLabel>
            <Input
              name="patientNumber"
              value={newBilling.patientNumber}
              onChange={handleInputChange}
              placeholder="Enter patient number"
            />
          </FormControl>
          <FormControl id="dob" mb={3}>
            <FormLabel>Date of Birth</FormLabel>
            <Input
              type="date"
              name="dob"
              value={newBilling.dob}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl id="age" mb={3}>
            <FormLabel>Age</FormLabel>
            <HStack>
              <Box>
                <FormLabel fontSize="sm">Year</FormLabel>
                <Input
                  name="ageYear"
                  value={newBilling.ageYear || ''}
                  readOnly
                  placeholder="Years"
                  size="sm"
                />
              </Box>
              <Box>
                <FormLabel fontSize="sm">Month</FormLabel>
                <Input
                  name="ageMonth"
                  value={newBilling.ageMonth || ''}
                  readOnly
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
          <FormControl id="services" mb={3}>
            <FormLabel>Services</FormLabel>
            <Select
              isMulti
              name="services"
              value={newBilling.items.filter(item => item.type === 'service')}
              onChange={(selectedOptions) => handleItemChange(selectedOptions, 'service')}
              options={services}
              placeholder="Select services"
            />
            {isAddingService ? (
              <Box mt={2}>
                <Flex alignItems="center">
                  <Input
                    placeholder="Service Name"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    mr={2}
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    mr={2}
                    width="200px"
                  />
                  <Button colorScheme="teal" onClick={handleAddNewService} size="md">
                    Add Service
                  </Button>
                </Flex>
              </Box>
            ) : (
              <Button mt={2} colorScheme="teal" onClick={() => setIsAddingService(true)}>
                Add New Service
              </Button>
            )}
          </FormControl>
          <FormControl id="medicines" mb={3}>
            <FormLabel>Medicines</FormLabel>
            <Select
              isMulti
              name="medicines"
              value={newBilling.items.filter(item => item.type === 'medicine')}
              onChange={(selectedOptions) => handleItemChange(selectedOptions, 'medicine')}
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
                  <Th width="12%">Name</Th>
                  <Th width="10%">Batch No</Th>
                  <Th width="10%">Expiry Date</Th>
                  <Th width="10%">Manufactured By</Th>
                  <Th width="8%">Quantity</Th>
                  <Th width="8%">MRP (₹)</Th>
                  <Th width="8%">CGST (%)</Th>
                  <Th width="8%">SGST (%)</Th>
                  <Th width="8%">Total (₹)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {newBilling.items.map(item => (
                  <Tr key={item.value}>
                    <Td>{item.label} ({item.quantityAvailable} available)</Td>
                    <Td>{item.batchNo || 'N/A'}</Td>
                    <Td>{item.expiryDate || 'N/A'}</Td>
                    <Td>{item.manufacturedBy || 'N/A'}</Td>
                    <Td>
                      <Flex alignItems="center">
                        <IconButton
                          icon={<FaMinus />}
                          onClick={() => handleQuantityChange(item, -1)}
                          aria-label="Decrease quantity"
                          size="sm"
                          mr={2}
                          isDisabled={item.quantity <= 0}
                        />
                        <Input
                          type="number"
                          value={item.quantity}
                          readOnly
                          width="70px"
                          textAlign="center"
                        />
                        <IconButton
                          icon={<FaPlus />}
                          onClick={() => handleQuantityChange(item, 1)}
                          aria-label="Increase quantity"
                          size="sm"
                          ml={2}
                          isDisabled={item.quantity >= item.originalQuantity}
                        />
                      </Flex>
                    </Td>
                    <Td>{item.price.toFixed(2)}</Td>
                    <Td>{item.cgst}</Td>
                    <Td>{item.sgst}</Td>
                    <Td>{(item.price * item.quantity).toFixed(2)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Table variant="simple" mt={4}>
            <Tbody>
              <Tr>
                <Td colSpan="9">
                  <Divider />
                </Td>
              </Tr>
              <Tr>
                <Td colSpan="8" fontWeight="bold">Subtotal (₹)</Td>
                <Td fontWeight="bold" textAlign={'end'}>
                  {calculateSubtotal()}
                </Td>
              </Tr>
              <Tr fontSize="sm">
                <Td colSpan="8" fontWeight="bold">Average SGST ({calculateAverageGST('sgst').toFixed(2)}%)</Td>
                <Td textAlign={'end'} fontWeight="bold">
                  {calculateGST(parseFloat(calculateSubtotal()), calculateAverageGST('sgst'))}
                </Td>
              </Tr>
              <Tr fontSize="sm">
                <Td colSpan="8" fontWeight="bold">Average CGST ({calculateAverageGST('cgst').toFixed(2)}%)</Td>
                <Td textAlign={'end'} fontWeight="bold">
                  {calculateGST(parseFloat(calculateSubtotal()), calculateAverageGST('cgst'))}
                </Td>
              </Tr>
              <Tr>
                <Td colSpan="8" fontWeight="bold">
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
                <Td colSpan="8" fontWeight="bold" fontSize="xl">Total (₹)</Td>
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
