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
  useBreakpointValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { MdAddShoppingCart, MdEdit, MdDelete } from 'react-icons/md';
import { SearchIcon } from '@chakra-ui/icons';
import AddMedicine from './AddMedicine';
import EditMedicine from './EditMedicine';
import DeleteMedicine from './DeleteMedicine';
import { getMedicines, addMedicine, updateMedicine, deleteMedicine } from 'networks';

const MedicineManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMedicineData, setEditMedicineData] = useState(null);
  const [deleteMedicineData, setDeleteMedicineData] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();
  const addMedicineModal = useDisclosure();
  const isSmallScreen = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await getMedicines();
      setMedicines(response.data.data);
    } catch (error) {
      console.error('Error fetching medicines', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (newMedicine) => {
    try {
      const response = await addMedicine(newMedicine);
      fetchMedicines();
      toast({
        title: 'Medicine added.',
        description: 'The medicine has been added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      addMedicineModal.onClose();
    } catch (error) {
      console.error('Error adding medicine', error);
      toast({
        title: 'Error adding medicine.',
        description: error.response.data.message,
        status: 'error',
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
        title: 'Medicine updated.',
        description: 'The medicine has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating medicine', error);
      toast({
        title: 'Error updating medicine.',
        description: 'An error occurred while updating the medicine.',
        status: 'error',
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
        title: 'Medicine deleted.',
        description: 'The medicine has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting medicine', error);
      toast({
        title: 'Error deleting medicine.',
        description: 'An error occurred while deleting the medicine.',
        status: 'error',
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
    const direction = sortConfig.key === key && sortConfig.direction === 'ascending'
      ? 'descending'
      : 'ascending';
    setSortConfig({ key, direction });
  };

  const sortedMedicines = React.useMemo(() => {
    return [...medicines].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [medicines, sortConfig]);

  const filteredMedicines = sortedMedicines.filter((medicine) =>
    (medicine.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medicine.manufactured_by || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medicine.batch_no || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentDate = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(currentDate.getMonth() + 3);

  // Define color indicators for quantity and expiry
  const getQuantityBgColor = (quantity) => {
    if (quantity === 0) return 'red.200';
    if (quantity < 10) return 'orange.200';
    return 'transparent';
  };

  const getExpiryColor = (expiryDate) => {
    const date = new Date(expiryDate);
    if (date <= currentDate) return 'red.200';
    if (date <= threeMonthsLater) return 'orange.200';
    return 'transparent';
  };

  return (
    <Box pt={{ base: '130px', md: '20px', xl: '35px' }} overflowY="auto">
      <Flex flexDirection="column">
        <Flex
          mt={{ base: '20px', md: '45px' }}
          mb="20px"
          flexDirection={{ base: 'column', md: 'row' }}
          justifyContent="space-between"
          align={{ base: 'start', md: 'center' }}
        >
          <Text color={textColor} fontSize={{ base: 'lg', md: '2xl' }} ms="24px" fontWeight="700">
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
              fontSize={{ base: 'xs', md: 'sm' }}
              textTransform="uppercase"
              letterSpacing="0.4px"
              color="white"
              backgroundColor="#3d94cf"
              border="2px solid rgba(255, 255, 255, 0.333)"
              borderRadius="20px"
              padding={{ base: '8px 12px', md: '10px 14px' }}
              transform="translate(0px, 0px) rotate(0deg)"
              transition="0.2s"
              boxShadow="-4px -2px 16px 0px #ffffff, 4px 2px 16px 0px rgb(95 157 231 / 48%)"
              _hover={{
                color: '#516d91',
                backgroundColor: '#E5EDF5',
                boxShadow: '-2px -1px 8px 0px #ffffff, 2px 1px 8px 0px rgb(95 157 231 / 48%)',
              }}
              _active={{
                boxShadow: 'none',
              }}
            >
              Add Medicine
            </Button>
          </Flex>
        </Flex>

        {/* Legend */}
        <Card p={4} mb={4}>
          
        </Card>

        <Card p={2}>
          {/* Search Bar */}
          <Flex justify="flex-end" mt={4} mr={4}>
            <InputGroup>
              <Input
                type="text"
                placeholder="Search by name, manufacturer, or batch no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                backgroundColor="white"
                size="md"
              />
              <InputRightElement>
                <IconButton
                  aria-label="Search"
                  icon={<SearchIcon />}
                  onClick={() => setSearchTerm('')}
                  variant="ghost"
                  size="md"
                />
              </InputRightElement>
            </InputGroup>
          </Flex>
          <Flex mt={5} flexDirection="column" alignItems={'center'}>
            <Flex>
              <Box bg="red.200" w="20px" h="20px" mr={2}></Box>
              <Text mr={4}>Medicine quantity is zero or expired</Text>
              <Box bg="orange.200" w="20px" h="20px" mr={2}></Box>
              <Text>Medicine Quantity is less than 10 or expiring soon</Text>
            </Flex>
          </Flex>
          <Flex justifyContent="center" mt={10}>
            {loading ? (
              <Flex justify="center" align="center" height="10vh">
                <Spinner size="lg" />
              </Flex>
            ) : isSmallScreen ? (
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
                {filteredMedicines.map((medicine) => (
                  <Box key={medicine.id} p={3} shadow="md" borderWidth="1px" borderRadius="md">
                    <Text fontWeight="bold">ID: {medicine.id}</Text>
                    <Text><strong>Name:</strong> {medicine.name}</Text>
                    <Text><strong>Batch No:</strong> {medicine.batch_no}</Text>
                    <Text><strong>Manufactured By:</strong> {medicine.manufactured_by}</Text>
                    <Text bg={getQuantityBgColor(medicine.quantity)}><strong>Quantity:</strong> {medicine.quantity}</Text>
                    <Text><strong>MRP:</strong> {medicine.mrp}</Text>
                    <Text><strong>Rate:</strong> {medicine.rate}</Text>
                    <Text bg={getExpiryColor(medicine.expiry_date)}><strong>Expiry Date:</strong> {new Date(medicine.expiry_date).toLocaleDateString()}</Text>
                    <Flex mt={2} justifyContent="space-between">
                      <IconButton
                        icon={<MdEdit />}
                        onClick={() => handleEditMedicine(medicine)}
                        aria-label="Edit Medicine"
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
                    </Flex>
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Card width="95%" borderRadius={20}>
                <TableContainer>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr>
                        <Th onClick={() => handleSort('id')} cursor="pointer">
                          ID
                        </Th>
                        <Th onClick={() => handleSort('name')} cursor="pointer">
                          Name
                        </Th>
                        <Th onClick={() => handleSort('batch_no')} cursor="pointer">
                          Batch No
                        </Th>
                        <Th onClick={() => handleSort('manufactured_by')} cursor="pointer">
                          Manufactured By
                        </Th>
                        <Th onClick={() => handleSort('quantity')} cursor="pointer">
                          Quantity
                        </Th>
                        <Th onClick={() => handleSort('rate')} cursor="pointer">
                          Rate
                        </Th>
                        <Th onClick={() => handleSort('mrp')} cursor="pointer">
                          MRP
                        </Th>
                        <Th onClick={() => handleSort('cgst')} cursor="pointer">
                          CGST
                        </Th>
                        <Th onClick={() => handleSort('sgst')} cursor="pointer">
                          SGST
                        </Th>
                        <Th onClick={() => handleSort('total')} cursor="pointer">
                          Total
                        </Th>
                        <Th onClick={() => handleSort('expiry_date')} cursor="pointer">
                          Expiration Date
                        </Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredMedicines.map((medicine) => {
                        const expiryDate = new Date(medicine.expiry_date);

                        return (
                          <Tr key={medicine.id}>
                            <Td>{medicine.id}</Td>
                            <Td>{medicine.name}</Td>
                            <Td>{medicine.batch_no}</Td>
                            <Td>{medicine.manufactured_by}</Td>
                            <Td bg={getQuantityBgColor(medicine.quantity)}>{medicine.quantity}</Td>
                            <Td>{medicine.rate}</Td>
                            <Td>{medicine.mrp}</Td>
                            <Td>{medicine.cgst}</Td>
                            <Td>{medicine.sgst}</Td>
                            <Td>{medicine.total}</Td>
                            <Td bg={getExpiryColor(medicine.expiry_date)}>
                              {expiryDate.toLocaleDateString()}
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
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Card>
            )}
          </Flex>
        </Card>
      </Flex>

      {/* AddMedicine modal */}
      <AddMedicine
        isOpen={addMedicineModal.isOpen}
        onClose={addMedicineModal.onClose}
        addNewMedicine={handleAddMedicine}
      />

      {/* EditMedicine modal */}
      {editMedicineData && (
        <EditMedicine
          isOpen={!!editMedicineData}
          onClose={() => setEditMedicineData(null)}
          updateMedicineProp={editMedicineData}
          updateMedicine={handleUpdateMedicine}
        />
      )}

      {/* DeleteMedicine modal */}
      {deleteMedicineData && (
        <DeleteMedicine
          isOpen={!!deleteMedicineData}
          onClose={() => setDeleteMedicineData(null)}
          deleteMedicineProp={deleteMedicineData}
          deleteMedicine={() => handleDeleteMedicine(deleteMedicineData.id)}
        />
      )}
    </Box>
  );
};

export default MedicineManagement;
