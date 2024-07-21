import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Divider,
  Flex,
} from '@chakra-ui/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ViewPharmacyBilling = ({ isOpen, onClose, billingData }) => {
  const invoiceRef = useRef();
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('data'));
    setUserData(data);
  }, [billingData]);

  if (!billingData) return null;

  const handleDownloadInvoice = async () => {
    const invoice = invoiceRef.current;
    const canvas = await html2canvas(invoice);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProperties = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('invoice.pdf');
  };

  const handlePrintInvoice = async () => {
    const invoice = invoiceRef.current;
    const printWindow = window.open('', '', 'width=800,height=600');
    const canvas = await html2canvas(invoice);
    const imgData = canvas.toDataURL('image/png');
    printWindow.document.write('<html><head><title>Invoice</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body {
        font-family: Arial, sans-serif;
      }
      .invoice-box {
        width: 100%;
        margin: auto;
        padding: 20px;
        border: 1px solid #eee;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
      }
      .invoice-box table {
        width: 100%;
        line-height: inherit;
        text-align: left;
      }
      .invoice-box table td {
        padding: 5px;
        vertical-align: top;
      }
      .invoice-box table tr td:nth-child(2) {
        text-align: right;
      }
      .invoice-box table tr.top table td {
        padding-bottom: 20px;
      }
      .invoice-box table tr.top table td.title {
        font-size: 45px;
        line-height: 45px;
        color: #333;
      }
      .invoice-box table tr.information table td {
        padding-bottom: 40px;
      }
      .invoice-box table tr.heading td {
        background: #eee;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
      }
      .invoice-box table tr.details td {
        padding-bottom: 20px;
      }
      .invoice-box table tr.item td {
        border-bottom: 1px solid #eee;
      }
      .invoice-box table tr.item.last td {
        border-bottom: none;
      }
      .invoice-box table tr.total td:nth-child(2) {
        border-top: 2px solid #eee;
        font-weight: bold;
      }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<div class="invoice-box">');
    printWindow.document.write(`<img src="${imgData}" style="width: 100%;"/>`);
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invoice</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box ref={invoiceRef} mb={4} p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" className="invoice-box">
            <Flex justify="center" mb={4} flexDirection="column" alignItems="center">
              <Text fontSize="xl"><strong>{userData.company_name}</strong></Text>
              <Text>{userData.address} - {userData.pincode}</Text>
              <Text><strong>GST:</strong> {userData.gst}</Text>
            </Flex>
            <Divider my={4} />
            <Flex justify="space-between" mb={4}>
              <Box textAlign="left">
                <Text><strong>Invoice ID:</strong> {billingData.id}</Text>
                <Text><strong>Date:</strong> {new Date(billingData.date).toLocaleString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}</Text>
              </Box>
            </Flex>
            <Divider my={4} />
            <Box>
              <Text mb={2}>{billingData.patient_name}</Text>
              <Text mb={2}>{billingData.phone_number}</Text>
              <Text mb={2}>{billingData.age_year} Years, {billingData.age_month} Months /  {billingData.gender}</Text>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Medicine Name</Th>
                    <Th>Batch No</Th>
                    <Th>Expiry Date</Th>
                    <Th>Manufactured By</Th>
                    <Th>Quantity</Th>
                    <Th>MRP (₹)</Th>
                    <Th>Total (₹)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {billingData.medicines.map((med, index) => (
                    <Tr key={index}>
                      <Td>{med.label}</Td>
                      <Td>{med.batchNo || 'N/A'}</Td>
                      <Td>{med.expiryDate || 'N/A'}</Td>
                      <Td>{med.manufacturedBy || 'N/A'}</Td>
                      <Td>{med.quantity}</Td>
                      <Td>{`₹${med.mrp}`}</Td>
                      <Td>{`₹${(med.mrp * med.quantity).toFixed(2)}`}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <Divider my={4} />
              <Flex justify="flex-end">
                <Box textAlign="right">
                  <Text><strong>Subtotal:</strong> {`₹${billingData.subtotal}`}</Text>
                  <Text><strong>CGST:</strong> {`₹${billingData.cgst}`}</Text>
                  <Text><strong>SGST:</strong> {`₹${billingData.sgst}`}</Text>
                  <Text><strong>Discount:</strong> {`${billingData.discount}%`}</Text>
                  <Text fontSize="lg" fontWeight="bold"><strong>Total:</strong> {`₹${billingData.total}`}</Text>
                </Box>
              </Flex>
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleDownloadInvoice}>
            Download Invoice
          </Button>
          <Button colorScheme="green" onClick={handlePrintInvoice} ml={3}>
            Print Invoice
          </Button>
          <Button colorScheme="gray" onClick={onClose} ml={3}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ViewPharmacyBilling;
