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
  useBreakpointValue,
} from '@chakra-ui/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ViewPharmacyBilling = ({ isOpen, onClose, billingData }) => {
  const invoiceRef = useRef();
  const [userData, setUserData] = useState({});
  const modalSize = useBreakpointValue({ base: 'full', md: '6xl' });
  const invoiceScale = useBreakpointValue({ base: 0.75, md: 1 });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const buttonfontSize = useBreakpointValue({ base: 11, md: 16 });

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('data'));
    setUserData(data);
  }, [billingData]);

  if (!billingData) return null;

  const handleDownloadInvoice = async () => {
    const invoice = invoiceRef.current;
    const canvas = await html2canvas(invoice, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('invoice.pdf');
  };

  const handlePrintInvoice = async () => {
    const invoice = invoiceRef.current;
    const canvas = await html2canvas(invoice, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Invoice</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: white;
      }
      .invoice-box {
        width: 210mm;
        height: 297mm;
        padding: 20mm;
        margin: auto;
        border: 1px solid #eee;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
        background-color: white;
        box-sizing: border-box;
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
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invoice</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH={{ base: '70vh', md: '80vh' }} overflowY="auto" bg="white">
          <Box
            ref={invoiceRef}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="md"
            className="invoice-box"
            style={{
              width: '210mm',
              height: '297mm',
              backgroundColor: 'white',
              boxSizing: 'border-box',
              margin: '0 auto',
              transform: `scale(${invoiceScale})`,
              transformOrigin: 'top left'
            }}
          >
            <Flex justify="center" mb={4} flexDirection="column" alignItems="center">
              <Text fontSize="xl"><strong>{userData.company_name}</strong></Text>
              <Text>{userData.address} - {userData.pincode}</Text>
              <Flex justify="space-between" width="100%">
                <Text><strong>GST:</strong> {userData.gst}</Text>
                {userData.druglicense_no && (
                  <Text>
                    {userData.druglicense_no.split(',').map((part, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <br />}
                        {part.trim()}
                      </React.Fragment>
                    ))}
                  </Text>
                )}
              </Flex>
            </Flex>
            <Divider my={4} />
            <Flex justify="space-between" mb={4}>
              <Box textAlign="left">
                <Text fontSize={20}><strong>{billingData.patient_name}</strong></Text>
                {(billingData.age_year !== null && billingData.age_year !== undefined) && (billingData.age_month !== null && billingData.age_month !== undefined) && (
                  <Text>{`${billingData.age_year} years, ${billingData.age_month} months`}</Text>
                )}
                <Text>{billingData.gender}</Text>
              </Box>
              <Box textAlign="right">
                <Text><strong>Invoice ID:</strong> {billingData.id}</Text>
                {billingData.ip_no && (
                  <Text><strong>IP No.:</strong> {billingData.ip_no}</Text>
                )}
                <Text><strong>Date:</strong> {new Date(billingData.date).toLocaleString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}</Text>
              </Box>
            </Flex>
            <Divider my={4} />
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
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
            </Box>
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
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleDownloadInvoice} fontSize={buttonfontSize} size={buttonSize}>
            Download PDF
          </Button>
          <Button colorScheme="green" onClick={handlePrintInvoice} ml={3} fontSize={buttonfontSize} size={buttonSize}>
            Print Invoice
          </Button>
          <Button colorScheme="gray" onClick={onClose} ml={3} fontSize={buttonfontSize} size={buttonSize}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ViewPharmacyBilling;
