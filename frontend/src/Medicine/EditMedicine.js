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
  console.log(updateMedicineProp);
  const [medicine, setMedicine] = useState({
    batchNo: '',
    expiry_date: '',
    id: '',
    manufacturedBy: '',
    mrp: '',
    name: '',
    quantity: '',
    cgst: '',
    sgst: '',
    total: '',
  });
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedicine({ ...medicine, [name]: value });
  };

  useEffect(() => {
    const calculateTotal = () => {
      const mrp = parseFloat(medicine.mrp) || 0;
      const cgst = parseFloat(medicine.cgst) || 0;
      const sgst = parseFloat(medicine.sgst) || 0;
      const total = mrp + (mrp * cgst / 100) + (mrp * sgst / 100);
      setMedicine({ ...medicine, total: total.toFixed(2) });
    };

    calculateTotal();
  }, [medicine.mrp, medicine.cgst, medicine.sgst]);

  const handleSubmit = () => {
    if (medicine.name && medicine.batchNo && medicine.quantity && medicine.expiry_date && medicine.mrp && medicine.cgst && medicine.sgst && medicine.manufacturedBy) {
      const updatedMedicine = {
        ...medicine,
        expiry_date: medicine.expiry_date, // Convert date back to Unix timestamp
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

  const formatDate = (date) => {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    setMedicine({
      ...updateMedicineProp,
      batchNo: updateMedicineProp.batch_no,
      expiry_date: formatDate(updateMedicineProp.expiry_date),
      manufacturedBy: updateMedicineProp.manufactured_by,
      cgst: updateMedicineProp.cgst,
      sgst: updateMedicineProp.sgst,
      total: (parseFloat(updateMedicineProp.mrp) + (parseFloat(updateMedicineProp.mrp) * parseFloat(updateMedicineProp.cgst) / 100) + (parseFloat(updateMedicineProp.mrp) * parseFloat(updateMedicineProp.sgst) / 100)).toFixed(2),
    });
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
