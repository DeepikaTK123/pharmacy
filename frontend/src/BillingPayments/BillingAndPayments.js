import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Flex,
  Text,
  useColorModeValue,
  useDisclosure,
  IconButton,
  Tooltip,
  Card,
  Link,
  Input,
  useToast,
  Spinner,
  useBreakpointValue,
} from "@chakra-ui/react";
import { MdAdd, MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import AddBilling from "./AddBilling";
import EditBilling from "./EditBilling";
import DeleteBilling from "./DeleteBilling";
import ViewBilling from "./ViewBilling";
import {
  addBillingRecord,
  getBillingRecords,
  updateBillingRecord,
  deleteBillingRecord,
} from "networks";

const PharmacyBilling = () => {
  const [billing, setBilling] = useState([]);
  const [filteredBilling, setFilteredBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const addBillingModal = useDisclosure();
  const editBillingModal = useDisclosure();
  const deleteBillingModal = useDisclosure();
  const viewBillingModal = useDisclosure();
  const [editBillingData, setEditBillingData] = useState(null);
  const [deleteBillingData, setDeleteBillingData] = useState(null);
  const [viewBillingData, setViewBillingData] = useState(null);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();
  const isSmallScreen = useBreakpointValue({ base: true, md: false });
  const [quickBillPhoneNumber, setQuickBillPhoneNumber] = useState(null); // State to hold phone number for quick bill

  const quickBillModal = useDisclosure(); // Use a separate disclosure for Quick Bill modal

  const fetchBillingRecords = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBillingRecords();
      const cleanedData = response.data.data.map((record) => ({
        ...record,
        billing_items: record.billing_items.filter((item) => item !== null), // Ensure items are filtered correctly
      }));
      setBilling(cleanedData);
      setFilteredBilling(cleanedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error fetching pharmacy billing records",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBillingRecords();
  }, [fetchBillingRecords]);

  useEffect(() => {
    const filtered = billing.filter((item) => {
      return (
        item.id.toString().includes(search) ||
        item.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        item.phone_number.toLowerCase().includes(search.toLowerCase())
      );
    });
    setFilteredBilling(filtered);
  }, [search, billing]);

  const handleAddBilling = async (newBilling) => {
    try {
      await addBillingRecord(newBilling);
      fetchBillingRecords();
      addBillingModal.onClose();
      toast({
        title: "Success",
        description: "Pharmacy billing record added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error adding pharmacy billing record",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateBilling = async (updatedBilling) => {
    try {
      await updateBillingRecord(updatedBilling);
      fetchBillingRecords();
      editBillingModal.onClose();
      toast({
        title: "Success",
        description: "Pharmacy billing record updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error updating pharmacy billing record",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteBilling = async (id) => {
    try {
      await deleteBillingRecord(id);
      fetchBillingRecords();
      deleteBillingModal.onClose();
      toast({
        title: "Success",
        description: "Pharmacy billing record deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error deleting pharmacy billing record",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const handleQuickBill = (phoneNumber) => {
    setQuickBillPhoneNumber(phoneNumber); // Set the phone number for Quick Bill
    quickBillModal.onOpen(); // Open the modal
  };
  const handleEditBilling = (item) => {
    setEditBillingData(item);
    editBillingModal.onOpen();
  };

  const handleDeleteBillingModal = (item) => {
    setDeleteBillingData(item);
    deleteBillingModal.onOpen();
  };

  const handleViewBilling = (item) => {
    setViewBillingData(item);
    viewBillingModal.onOpen();
  };

  return (
    <Box pt={{ base: "130px", md: "20px", xl: "35px" }} overflowY="auto">
      <Flex flexDirection="column">
        <Flex
          mt={{ base: "20px", md: "45px" }}
          mb="20px"
          flexDirection={{ base: "column", md: "row" }}
          justifyContent="space-between"
          align={{ base: "start", md: "center" }}
        >
          <Text
            color={textColor}
            fontSize={{ base: "lg", md: "2xl" }}
            ms="24px"
            fontWeight="700"
          >
            Billing Management
          </Text>
          <Button
            leftIcon={<MdAdd />}
            colorScheme="teal"
            onClick={addBillingModal.onOpen}
          >
            Generate Billing
          </Button>
        </Flex>

        <Flex justifyContent="center" mt={{ base: "20px", md: "30px" }}>
          <Card width={{ base: "100%", md: "97%" }} borderRadius="md">
            {loading ? (
              <Flex justify="center" align="center" height="10vh">
                <Spinner size="xl" />
              </Flex>
            ) : (
              <Box p={{ base: 3, md: 5 }}>
                <Input
                  placeholder="Search by ID, Name, or Phone Number"
                  mb={4}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Box overflowX="auto">
                  {isSmallScreen ? (
                    filteredBilling.map((item) => (
                      <Box
                        key={item.id}
                        mb={4}
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        overflow="hidden"
                      >
                        <Text mb={1}>
                          <strong>ID:</strong> {item.id}
                        </Text>
                        <Text mb={1}>
                          <strong>Name:</strong> {item.patient_name}
                        </Text>
                        <Text mb={1}>
                          <strong>Phone Number:</strong> {item.phone_number}
                        </Text>
                        <Tooltip
                          label={item.billing_items
                            .map((it) => `${it.label} (Qty: ${it.quantity})`)
                            .join(", ")}
                        >
                          <Link href="#" onClick={(e) => e.preventDefault()}>
                            Click Here for Items
                          </Link>
                        </Tooltip>
                        <Text mb={1}>
                          <strong>Subtotal:</strong> {item.subtotal}
                        </Text>
                        <Text mb={1}>
                          <strong>Total:</strong> {item.total}
                        </Text>
                        <Text mb={1}>
                          <strong>Date:</strong>{" "}
                          {new Date(item.date).toLocaleString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </Text>
                        <Flex mt={2} justifyContent="space-between">
                          <IconButton
                            icon={<MdAdd />}
                            onClick={() => handleQuickBill(item.phone_number)} // Pass phone number to Quick Bill
                            aria-label="Quick Billing"
                            colorScheme="green"
                            size="sm"
                          />
                          <IconButton
                            icon={<MdVisibility />}
                            onClick={() => handleViewBilling(item)}
                            aria-label="View Pharmacy Billing"
                            colorScheme="blue"
                            size="sm"
                          />
                          <IconButton
                            icon={<MdEdit />}
                            onClick={() => handleEditBilling(item)}
                            aria-label="Edit Pharmacy Billing"
                            colorScheme="teal"
                            size="sm"
                          />
                          <IconButton
                            icon={<MdDelete />}
                            onClick={() => handleDeleteBillingModal(item)}
                            aria-label="Delete Pharmacy Billing"
                            colorScheme="red"
                            size="sm"
                          />
                        </Flex>
                      </Box>
                    ))
                  ) : (
                    <Table variant="simple" size={{ base: "sm", md: "md" }}>
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Name</Th>
                          <Th>Phone Number</Th>
                          <Th>Items</Th>
                          <Th>Subtotal</Th>
                          <Th>Total</Th>
                          <Th>Date</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredBilling.map((item) => (
                          <Tr key={item.id}>
                            <Td>{item.id}</Td>
                            <Td>{item.patient_name}</Td>
                            <Td>{item.phone_number}</Td>
                            <Td>
                              <Tooltip
                                label={item.billing_items
                                  .map(
                                    (it) => `${it.label} (Qty: ${it.quantity})`
                                  )
                                  .join(", ")}
                              >
                                <Link
                                  href="#"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  Click Here
                                </Link>
                              </Tooltip>
                            </Td>
                            <Td>{item.subtotal}</Td>
                            <Td>{item.total}</Td>
                            <Td>
                              {new Date(item.date).toLocaleString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </Td>
                            <Td>
                              <Flex
                                flexDirection={{ base: "column", md: "row" }}
                              >
                                <IconButton
                                  icon={<MdAdd />}
                                  onClick={() =>
                                    handleQuickBill(item.phone_number)
                                  } // Pass phone number to Quick Bill
                                  aria-label="Quick Billing"
                                  mb={{ base: 1, md: 0 }}
                                  mr={{ base: 0, md: 2 }}
                                  colorScheme="green"
                                  size="sm"
                                />
                                <IconButton
                                  icon={<MdVisibility />}
                                  onClick={() => handleViewBilling(item)}
                                  aria-label="View Pharmacy Billing"
                                  mb={{ base: 1, md: 0 }}
                                  mr={{ base: 0, md: 2 }}
                                  colorScheme="blue"
                                  size="sm"
                                />
                                <IconButton
                                  icon={<MdEdit />}
                                  onClick={() => handleEditBilling(item)}
                                  aria-label="Edit Pharmacy Billing"
                                  mb={{ base: 1, md: 0 }}
                                  mr={{ base: 0, md: 2 }}
                                  colorScheme="teal"
                                  size="sm"
                                />
                                <IconButton
                                  icon={<MdDelete />}
                                  onClick={() => handleDeleteBillingModal(item)}
                                  aria-label="Delete Pharmacy Billing"
                                  colorScheme="red"
                                  size="sm"
                                />
                              </Flex>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </Box>
              </Box>
            )}
          </Card>
        </Flex>
      </Flex>

      {addBillingModal.isOpen && (
        <AddBilling
          isOpen={addBillingModal.isOpen}
          onClose={addBillingModal.onClose}
          addNewBilling={handleAddBilling}
        />
      )}
      {editBillingModal.isOpen && editBillingData && (
        <EditBilling
          isOpen={editBillingModal.isOpen}
          onClose={editBillingModal.onClose}
          updateBillingProp={editBillingData}
          updateBilling={handleUpdateBilling}
        />
      )}
      {deleteBillingModal.isOpen && deleteBillingData && (
        <DeleteBilling
          isOpen={deleteBillingModal.isOpen}
          onClose={deleteBillingModal.onClose}
          deleteBillingProp={deleteBillingData}
          deleteBilling={() => handleDeleteBilling(deleteBillingData.id)}
        />
      )}
      {viewBillingModal.isOpen && viewBillingData && (
        <ViewBilling
          isOpen={viewBillingModal.isOpen}
          onClose={viewBillingModal.onClose}
          billingData={viewBillingData}
        />
      )}
      {quickBillModal.isOpen && (
        <AddBilling
          isOpen={quickBillModal.isOpen}
          onClose={quickBillModal.onClose}
          addNewBilling={handleAddBilling}
          phoneNumber={quickBillPhoneNumber} // Pass the phone number as a prop
        />
      )}
    </Box>
  );
};

export default PharmacyBilling;
