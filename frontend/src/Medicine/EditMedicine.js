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
  Tooltip,
  IconButton,
  Box,
  Text
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

const EditMedicine = ({ isOpen, onClose, updateMedicineProp, updateMedicine }) => {
  const [medicine, setMedicine] = useState({
    id: '',
    batchNo: '',
    expiry_date: '',
    manufacturedBy: '',
    mrp: '',
    name: '',
    quantity: '0', // Initialize quantity as '0'
    rate: '0', // Initialize rate as '0'
    cgst: '',
    sgst: '',
    total: '',
    profitLoss: '0' // Initialize profitLoss as '0'
  });
  const toast = useToast();

  useEffect(() => {
    if (updateMedicineProp) {
      setMedicine({
        id: updateMedicineProp.id || '',
        batchNo: updateMedicineProp.batch_no || '',
        expiry_date: new Date(updateMedicineProp.expiry_date).toISOString().split('T')[0] || '', // Convert to YYYY-MM-DD format
        manufacturedBy: updateMedicineProp.manufactured_by || '',
        mrp: updateMedicineProp.mrp || '',
        name: updateMedicineProp.name || '',
        quantity: updateMedicineProp.quantity || '0',
        rate: updateMedicineProp.rate !== null ? updateMedicineProp.rate : '0', // Convert to string, default to '0'
        cgst: updateMedicineProp.cgst || '',
        sgst: updateMedicineProp.sgst || '',
        total: updateMedicineProp.total || '',
        profitLoss: updateMedicineProp.profitLoss !== null ? updateMedicineProp.profitLoss : '0' // Convert to string, default to '0'
      });
    }
  }, [updateMedicineProp]);

  useEffect(() => {
    const calculateTotal = () => {
      const mrp = parseFloat(medicine.mrp) || 0;
      const cgst = parseFloat(medicine.cgst) || 0;
      const sgst = parseFloat(medicine.sgst) || 0;
      const total = mrp + (mrp * cgst / 100) + (mrp * sgst / 100);
      setMedicine(prevMedicine => ({ ...prevMedicine, total: total.toFixed(2) }));
    };

    calculateTotal();
  }, [medicine.mrp, medicine.cgst, medicine.sgst]);

  useEffect(() => {
    const calculateProfitLoss = () => {
      const rate = parseFloat(medicine.rate) || 0;
      const mrp = parseFloat(medicine.mrp) || 0;
      if (rate > 0) {
        const profitLoss = (mrp - rate).toFixed(2);
        setMedicine(prevMedicine => ({ ...prevMedicine, profitLoss }));
      } else {
        setMedicine(prevMedicine => ({ ...prevMedicine, profitLoss: '0' }));
      }
    };

    calculateProfitLoss();
  }, [medicine.rate, medicine.mrp]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedicine(prevMedicine => ({ ...prevMedicine, [name]: value }));
  };

  const handleSubmit = () => {
    if (medicine.name && medicine.batchNo && medicine.expiry_date && medicine.mrp && medicine.cgst && medicine.sgst && medicine.manufacturedBy) {
      const updatedMedicine = {
        ...medicine,
        rate: medicine.rate === '' ? '0' : medicine.rate, // Set rate to '0' if it's an empty string
        profitLoss: medicine.profitLoss === '' ? '0' : medicine.profitLoss // Set profitLoss to '0' if it's an empty string
      };
      updateMedicine(updatedMedicine);
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
          <FormControl id="rate" mb={3}>
            <FormLabel>
              Rate
              <Tooltip label="Rate per unit of medicine. This is the cost of purchase from the supplier and it can be used to track profit and loss." aria-label="Rate tooltip">
                <IconButton
                  aria-label="Rate Information"
                  icon={<InfoIcon />}
                  variant="link"
                  ml={2}
                  size="sm"
                />
              </Tooltip>
            </FormLabel>
            <Input
              type="number"
              name="rate"
              value={medicine.rate} // Use value directly
              onChange={handleInputChange}
              placeholder="Enter rate"
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
          <FormControl id="profitLoss" mb={3}>
           
            {parseFloat(medicine.rate) > 0 && (
              <Box mt={4}>
                <Text
                  fontSize="lg"
                  color={parseFloat(medicine.profitLoss) >= 0 ? 'green.500' : 'red.500'}
                >
                  {parseFloat(medicine.profitLoss) >= 0 ? `Profit: ${medicine.profitLoss} per unit` : `Loss: ${Math.abs(medicine.profitLoss)} per unit`}
                </Text>
              </Box>
            )}
          </FormControl>
          <FormControl id="cgst" mb={3}>
            <FormLabel>CGST (%)</FormLabel>
            <Input
              type="number"
              name="cgst"
              value={medicine.cgst}
              onChange={handleInputChange}
              placeholder="Enter CGST percentage"
            />
          </FormControl>
          <FormControl id="sgst" mb={3}>
            <FormLabel>SGST (%)</FormLabel>
            <Input
              type="number"
              name="sgst"
              value={medicine.sgst}
              onChange={handleInputChange}
              placeholder="Enter SGST percentage"
            />
          </FormControl>
          <FormControl id="expiry_date" mb={3}>
            <FormLabel>Expiration Date</FormLabel>
            <Input
              type="date"
              name="expiry_date"
              value={medicine.expiry_date}
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
          <FormControl id="total" mb={3}>
            <FormLabel>Total</FormLabel>
            <Input
              type="number"
              name="total"
              value={medicine.total}
              isReadOnly
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
