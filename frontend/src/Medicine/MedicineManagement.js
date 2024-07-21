import React, { useState, useEffect } from 'react';
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
  IconButton,
  Spinner,
  useToast,
  Card,
  useDisclosure,
  TableContainer,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { MdAddShoppingCart, MdEdit, MdDelete } from 'react-icons/md';
import AddMedicine from './AddMedicine';
import EditMedicine from './EditMedicine';
import DeleteMedicine from './DeleteMedicine';
import Loading from 'Utils/Loading/Loading';
import { getMedicines, addMedicine, updateMedicine, deleteMedicine } from 'networks';
import { SearchIcon } from '@chakra-ui/icons';

const MedicineManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMedicineData, setEditMedicineData] = useState(null);
  const [deleteMedicineData, setDeleteMedicineData] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();
  const addMedicineModal = useDisclosure();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await getMedicines();
      setMedicines(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching medicines", error);
      setLoading(false);
    }
  };

  const handleAddMedicine = async (newMedicine) => {
    try {
      const response = await addMedicine(newMedicine);
      fetchMedicines();
      toast({
        title: "Medicine added.",
        description: "The medicine has been added successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      addMedicineModal.onClose();
    } catch (error) {
      console.error("Error adding medicine", error);
      toast({
        title: "Error adding medicine.",
        description: "An error occurred while adding the medicine.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateMedicine = async (updatedMedicine) => {
    try {
      await updateMedicine(updatedMedicine);
      fetchMedicines();
      toast({
        title: "Medicine updated.",
        description: "The medicine has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating medicine", error);
      toast({
        title: "Error updating medicine.",
        description: "An error occurred while updating the medicine.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteMedicine = async (id) => {
    try {
      await deleteMedicine(id);
      fetchMedicines();
      toast({
        title: "Medicine deleted.",
        description: "The medicine has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting medicine", error);
      toast({
        title: "Error deleting medicine.",
        description: "An error occurred while deleting the medicine.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditMedicine = (medicine) => {
    setEditMedicineData(medicine);
  };

  const handleDeleteMedicineModal = (medicine) => {
    setDeleteMedicineData(medicine);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedMedicines = [...medicines].sort((a, b) => {
    if (sortConfig.direction === 'ascending') {
      if (a[sortConfig.key] < b[sortConfig.key]) return -1;
      if (a[sortConfig.key] > b[sortConfig.key]) return 1;
      return 0;
    } else {
      if (a[sortConfig.key] < b[sortConfig.key]) return 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return -1;
      return 0;
    }
  });

  // Filtered medicines based on search term
  const filteredMedicines = sortedMedicines.filter((medicine) =>
    (medicine.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medicine.manufacturedBy || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medicine.batchNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box pt={{ base: '130px', md: '20px', xl: '35px' }} overflowY={{ sm: 'scroll', lg: 'hidden' }}>
      <Flex flexDirection="column">
        <Flex mt="45px" mb="20px" justifyContent="space-between" align={{ base: 'start', md: 'center' }}>
          <Text color={textColor} fontSize="2xl" ms="24px" fontWeight="700">
            Medicine Management
          </Text>
          <Flex justifyContent="flex-end" gap="10px">
            <Button
              leftIcon={<MdAddShoppingCart />}
              colorScheme="teal"
              onClick={addMedicineModal.onOpen}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontFamily="inherit"
              fontWeight="500"
              fontSize="13px"
              textTransform="uppercase"
              letterSpacing="0.4px"
              color="white"
              backgroundColor="#3d94cf"
              border="2px solid rgba(255, 255, 255, 0.333)"
              borderRadius="40px"
              padding="16px 24px 16px 28px"
              transform="translate(0px, 0px) rotate(0deg)"
              transition="0.2s"
              boxShadow="-4px -2px 16px 0px #ffffff, 4px 2px 16px 0px rgb(95 157 231 / 48%)"
              _hover={{
                color: "#516d91",
                backgroundColor: "#E5EDF5",
                boxShadow:
                  "-2px -1px 8px 0px #ffffff, 2px 1px 8px 0px rgb(95 157 231 / 48%)",
              }}
              _active={{
                boxShadow: "none",
              }}
            >
              Add Medicine
            </Button>
          </Flex>
        </Flex>

        {/* Search Bar */}
        <Flex justify="flex-end" mt={4} mr={4}>
          <InputGroup>
            <Input
              type="text"
              placeholder="Search by name, manufacturer, or batch no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              backgroundColor={"white"}
            />
            <InputRightElement>
              <IconButton
                aria-label="Search"
                icon={<SearchIcon />}
                onClick={() => setSearchTerm('')}
                variant="ghost"
              />
            </InputRightElement>
          </InputGroup>
        </Flex>

        <Flex justifyContent={"center"} mt={30}>
          <Card width={"97%"} borderRadius={40}>
            {loading ? (
              <Flex justify="center" align="center" height="10vh">
                <Spinner size="xl" />
              </Flex>
            ) : (
              <TableContainer p={5}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th onClick={() => handleSort('id')} cursor="pointer">
                        ID
                      </Th>
                      <Th onClick={() => handleSort('name')} cursor="pointer">
                        Name
                      </Th>
                      <Th onClick={() => handleSort('batchNo')} cursor="pointer">
                        Batch No
                      </Th>
                      <Th onClick={() => handleSort('manufacturedBy')} cursor="pointer">
                        Manufactured By
                      </Th>
                      <Th onClick={() => handleSort('quantity')} cursor="pointer">
                        Quantity
                      </Th>
                      <Th onClick={() => handleSort('mrp')} cursor="pointer">
                        MRP
                      </Th>
                      <Th onClick={() => handleSort('expiry_date')} cursor="pointer">
                        Expiration Date
                      </Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredMedicines.map((medicine) => (
                      <Tr key={medicine.id}>
                        <Td>{medicine.id}</Td>
                        <Td>{medicine.name}</Td>
                        <Td>{medicine.batch_no}</Td>
                        <Td>{medicine.manufactured_by}</Td>
                        <Td>{medicine.quantity}</Td>
                        <Td>{medicine.mrp}</Td> {/* Display MRP as number */}
                        <Td>
                          {new Date(medicine.expiry_date).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </Td>

                        <Td>
                          <IconButton
                            icon={<MdEdit />}
                            onClick={() => handleEditMedicine(medicine)}
                            aria-label="Edit Medicine"
                            mr={2}
                            colorScheme="teal"
                            size="sm"
                          />
                          <IconButton
                            icon={<MdDelete />}
                            onClick={() => handleDeleteMedicineModal(medicine)}
                            aria-label="Delete Medicine"
                            colorScheme="red"
                            size="sm"
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Flex>
      </Flex>

      {/* AddMedicine modal */}
      <AddMedicine isOpen={addMedicineModal.isOpen} onClose={addMedicineModal.onClose} addNewMedicine={handleAddMedicine} />

      {/* EditMedicine modal */}
      {editMedicineData && (
        <EditMedicine
          isOpen={true}
          onClose={() => setEditMedicineData(null)}
          updateMedicineProp={editMedicineData}
          updateMedicine={handleUpdateMedicine}
        />
      )}

      {/* DeleteMedicine modal */}
      {deleteMedicineData && (
        <DeleteMedicine
          isOpen={true}
          onClose={() => setDeleteMedicineData(null)}
          deleteMedicineProp={deleteMedicineData}
          deleteMedicine={() => handleDeleteMedicine(deleteMedicineData.id)}
        />
      )}
    </Box>
  );
};

export default MedicineManagement;
