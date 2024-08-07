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

const AddMedicine = ({ isOpen, onClose, addNewMedicine }) => {
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    batchNo: '',
    quantity: '',
    expiryDate: '',
    mrp: '',
    rate: '',
    cgst: '',
    sgst: '',
    manufacturedBy: '',
    total: '',
  });

  const [profit, setProfit] = useState(null);
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedicine({ ...newMedicine, [name]: value });
  };

  useEffect(() => {
    const calculateTotal = () => {
      const mrp = parseFloat(newMedicine.mrp) || 0;
      const cgst = parseFloat(newMedicine.cgst) || 0;
      const sgst = parseFloat(newMedicine.sgst) || 0;
      const total = mrp + (mrp * cgst / 100) + (mrp * sgst / 100);
      setNewMedicine({ ...newMedicine, total: total.toFixed(2) });
    };

    const calculateProfit = () => {
      const mrp = parseFloat(newMedicine.mrp) || 0;
      const rate = parseFloat(newMedicine.rate) || 0;
      const profit = rate !== 0 ? mrp - rate : 0;
      setProfit(profit);
    };

    calculateTotal();
    calculateProfit();
  }, [newMedicine.mrp, newMedicine.cgst, newMedicine.sgst, newMedicine.rate]);

  const handleSubmit = () => {
    if (newMedicine.name && newMedicine.batchNo && newMedicine.quantity && newMedicine.expiryDate && newMedicine.mrp && newMedicine.cgst && newMedicine.sgst && newMedicine.manufacturedBy) {
      const rate = newMedicine.rate && parseFloat(newMedicine.rate) !== 0 ? newMedicine.rate : newMedicine.mrp;

      const payload = {
        ...newMedicine,
        rate: rate,
        profit: rate !== null ? (parseFloat(newMedicine.mrp) - parseFloat(rate)).toFixed(2) : null,
      };
      addNewMedicine(payload);
      setNewMedicine({
        name: '',
        batchNo: '',
        quantity: '',
        expiryDate: '',
        mrp: '',
        rate: '',
        cgst: '',
        sgst: '',
        manufacturedBy: '',
        total: '',
      });
      setProfit(null);
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
            <FormLabel>Quantity (unit)</FormLabel>
            <Input
              type="number"
              name="quantity"
              value={newMedicine.quantity}
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
              value={newMedicine.rate}
              onChange={handleInputChange}
              placeholder="Enter rate (optional)"
            />
          </FormControl>
          <FormControl id="mrp" mb={3}>
            <FormLabel>
              MRP
              <Tooltip label="Maximum Retail Price. This is the price at which the medicine is sold to the end customer." aria-label="MRP tooltip">
                <IconButton
                  aria-label="MRP Information"
                  icon={<InfoIcon />}
                  variant="link"
                  ml={2}
                  size="sm"
                />
              </Tooltip>
            </FormLabel>
            <Input
              type="number"
              name="mrp"
              value={newMedicine.mrp}
              onChange={handleInputChange}
              placeholder="Enter MRP"
            />
          </FormControl>
          {newMedicine.rate && parseFloat(newMedicine.rate) !== 0 && profit !== null && (
            <Box mt={4}>
              <Text
                fontSize="lg"
                color={profit >= 0 ? 'green.500' : 'red.500'}
              >
                {profit >= 0 ? `Profit: ${profit.toFixed(2)} per unit` : `Loss: ${Math.abs(profit).toFixed(2)} per unit`}
              </Text>
            </Box>
          )}
          <FormControl id="cgst" mb={3}>
            <FormLabel>CGST (%)</FormLabel>
            <Input
              type="number"
              name="cgst"
              value={newMedicine.cgst}
              onChange={handleInputChange}
              placeholder="Enter CGST percentage"
            />
          </FormControl>
          <FormControl id="sgst" mb={3}>
            <FormLabel>SGST (%)</FormLabel>
            <Input
              type="number"
              name="sgst"
              value={newMedicine.sgst}
              onChange={handleInputChange}
              placeholder="Enter SGST percentage"
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
          <FormControl id="total" mb={3}>
            <FormLabel>Total</FormLabel>
            <Input
              type="number"
              name="total"
              value={newMedicine.total}
              isReadOnly
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
