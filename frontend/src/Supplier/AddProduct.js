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
  Textarea,
} from '@chakra-ui/react';

const AddProduct = ({ isOpen, onClose, addNewProduct }) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    batchNo: '',
    quantity: '',
    expiryDate: '',
    rate: '',
    cgst: '',
    sgst: '',
    manufacturedBy: '',
    address: '',
    total: '',
  });

  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  useEffect(() => {
    const calculateTotal = () => {
      const rate = parseFloat(newProduct.rate) || 0;
      const cgst = parseFloat(newProduct.cgst) || 0;
      const sgst = parseFloat(newProduct.sgst) || 0;
      const total = rate + (rate * cgst / 100) + (rate * sgst / 100);
      setNewProduct({ ...newProduct, total: total.toFixed(2) });
    };

    calculateTotal();
  }, [newProduct.rate, newProduct.cgst, newProduct.sgst]);

  const handleSubmit = () => {
    if (newProduct.name && newProduct.batchNo && newProduct.quantity && newProduct.expiryDate && newProduct.rate && newProduct.cgst && newProduct.sgst && newProduct.manufacturedBy && newProduct.address) {
      addNewProduct(newProduct);
      setNewProduct({
        name: '',
        batchNo: '',
        quantity: '',
        expiryDate: '',
        rate: '',
        cgst: '',
        sgst: '',
        manufacturedBy: '',
        address: '',
        total: '',
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
        <ModalHeader>Add New Product</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="name" mb={3}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
            />
          </FormControl>
          <FormControl id="batchNo" mb={3}>
            <FormLabel>Batch Number</FormLabel>
            <Input
              type="text"
              name="batchNo"
              value={newProduct.batchNo}
              onChange={handleInputChange}
              placeholder="Enter batch number"
            />
          </FormControl>
          <FormControl id="quantity" mb={3}>
            <FormLabel>Quantity</FormLabel>
            <Input
              type="number"
              name="quantity"
              value={newProduct.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
            />
          </FormControl>
          <FormControl id="rate" mb={3}>
            <FormLabel>Rate</FormLabel>
            <Input
              type="number"
              name="rate"
              value={newProduct.rate}
              onChange={handleInputChange}
              placeholder="Enter rate"
            />
          </FormControl>
          <FormControl id="cgst" mb={3}>
            <FormLabel>CGST (%)</FormLabel>
            <Input
              type="number"
              name="cgst"
              value={newProduct.cgst}
              onChange={handleInputChange}
              placeholder="Enter CGST percentage"
            />
          </FormControl>
          <FormControl id="sgst" mb={3}>
            <FormLabel>SGST (%)</FormLabel>
            <Input
              type="number"
              name="sgst"
              value={newProduct.sgst}
              onChange={handleInputChange}
              placeholder="Enter SGST percentage"
            />
          </FormControl>
          <FormControl id="expiryDate" mb={3}>
            <FormLabel>Expiration Date</FormLabel>
            <Input
              type="date"
              name="expiryDate"
              value={newProduct.expiryDate}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl id="manufacturedBy" mb={3}>
            <FormLabel>Manufactured By</FormLabel>
            <Input
              type="text"
              name="manufacturedBy"
              value={newProduct.manufacturedBy}
              onChange={handleInputChange}
              placeholder="Enter manufacturer name"
            />
          </FormControl>
          <FormControl id="address" mb={3}>
            <FormLabel>Address</FormLabel>
            <Textarea
              name="address"
              value={newProduct.address}
              onChange={handleInputChange}
              placeholder="Enter address"
            />
          </FormControl>
          <FormControl id="total" mb={3}>
            <FormLabel>Total</FormLabel>
            <Input
              type="number"
              name="total"
              value={newProduct.total}
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

export default AddProduct;
