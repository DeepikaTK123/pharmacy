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
  Box,
} from '@chakra-ui/react';
import Tesseract from 'tesseract.js';  // Import Tesseract.js for OCR

const UploadInvoice = ({ isOpen, onClose, uploadInvoice }) => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [invoiceData, setInvoiceData] = useState({});
  const toast = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      extractText(selectedFile);
    }
  };

  const extractText = (file) => {
    Tesseract.recognize(
      file,
      'eng',
      { logger: info => console.log(info) }  // Optional: log progress
    ).then(({ data: { text } }) => {
      setText(text);
      parseText(text);  // Parse the recognized text to extract fields
    }).catch(error => {
      console.error('Error recognizing text:', error);
      toast({
        title: 'Error',
        description: 'Error recognizing text from the image.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  };
  const parseText = (text) => {
    const lines = text.split('\n');
    const data = {};
  
    // Extract Address
    const addressMatch = text.match(/(\d+ [\w\s,]+Bangalore - \d{6})/);
    if (addressMatch) {
      data.address = addressMatch[0].trim();
    }
  
    // Extract Invoice ID
    const invoiceIdMatch = text.match(/Invoice ID:\s*(\d+)/);
    if (invoiceIdMatch) {
      data.invoiceId = invoiceIdMatch[1].trim();
    }
  
    // Extract Expiry Date
    const expiryDateMatch = text.match(/EXPIRY\s+(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (expiryDateMatch) {
      data.expirationDate = expiryDateMatch[1].trim();
    }
  
    // Extract Name
    const nameMatch = text.match(/NAME\s+([^\n]+)/);
    if (nameMatch) {
      data.name = nameMatch[1].trim().split(' ')[0];  // Extracting 'Dolo'
    }
  
    // Extract Batch Number
    const batchNumberMatch = text.match(/BATCH\s+([^\n]+)/);
    if (batchNumberMatch) {
      data.batchNumber = batchNumberMatch[1].trim().split(' ')[0];  // Extracting '3'
    }
  
    // Extract Quantity
    const quantityMatch = text.match(/QUANTITY\s+(\d+)/);
    if (quantityMatch) {
      data.quantity = quantityMatch[1].trim();
    }
  
    // Extract Rate
    const rateMatch = text.match(/MRP\s+([\d.]+)/);
    if (rateMatch) {
      data.rate = rateMatch[1].trim();
    }
  
    // Extract CGST
    const cgstMatch = text.match(/CGST:\s*([\d.]+)/);
    if (cgstMatch) {
      data.cgst = cgstMatch[1].trim();
    }
  
    // Extract SGST
    const sgstMatch = text.match(/SGST:\s*([\d.]+)/);
    if (sgstMatch) {
      data.sgst = sgstMatch[1].trim();
    }
  
    // Extract Manufactured By
    const manufacturedByMatch = text.match(/MANUFACTURED\s+BY\s+([^\n]+)/);
    if (manufacturedByMatch) {
      data.manufacturedBy = manufacturedByMatch[1].trim();
    }
  
    // Extract Total
    const totalMatch = text.match(/Total:\s*([\d.]+)/);
    if (totalMatch) {
      data.total = totalMatch[1].trim();
    }
  
    // Handle cases where data might be on different lines or formats
    // Adjust based on your specific text format
  
    setInvoiceData(data);
  };
  
  const handleSubmit = async () => {
    if (file && Object.keys(invoiceData).length > 0) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('data', JSON.stringify(invoiceData));  // Send extracted data as JSON

      try {
        await uploadInvoice(formData);
        setFile(null);
        setText('');
        setInvoiceData({});
        toast({
          title: 'Success.',
          description: 'File uploaded and data recognized successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: 'Error.',
          description: 'Error uploading file.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: 'Error.',
        description: 'Please capture an image and ensure text is recognized.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload Invoice</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="file" mb={3}>
            <FormLabel>Capture Invoice</FormLabel>
            <Input
              type="file"
              accept="image/*"
              capture="environment"  // Use 'user' for front camera, 'environment' for rear camera
              onChange={handleFileChange}
            />
          </FormControl>
          {file && (
            <Box>
              <Box mt={4}>
                <strong>Recognized Text:</strong>
                <pre>{text}</pre>
              </Box>
              <Box mt={4}>
                <strong>Extracted Data:</strong>
                <pre>{JSON.stringify(invoiceData, null, 2)}</pre>
              </Box>
            </Box>
          )}
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

export default UploadInvoice;
