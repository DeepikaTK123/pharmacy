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
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { SearchIcon } from '@chakra-ui/icons';
import AddPatient from './AddPatient';
import EditPatient from './EditPatient';
import DeletePatient from './DeletePatient';
import { getPatients, addPatient, updatePatient, deletePatient } from 'networks';
import { useNavigate } from 'react-router-dom';

const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPatientData, setEditPatientData] = useState(null);
  const [deletePatientData, setDeletePatientData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();
  const addPatientModal = useDisclosure();
  const isSmallScreen = useBreakpointValue({ base: true, md: false });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await getPatients();
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error fetching patients', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (newPatient) => {
    try {
      const response = await addPatient(newPatient);
      fetchPatients();
      toast({
        title: 'Patient added.',
        description: 'The patient has been added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      addPatientModal.onClose();
    } catch (error) {
      console.error('Error adding patient', error);
      toast({
        title: 'Error adding patient.',
        description: error.response?.data?.message || 'An error occurred while adding the patient.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdatePatient = async (updatedPatient) => {
    try {
      await updatePatient(updatedPatient);
      fetchPatients();
      toast({
        title: 'Patient updated.',
        description: 'The patient has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating patient', error);
      toast({
        title: 'Error updating patient.',
        description: 'An error occurred while updating the patient.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeletePatient = async (id) => {
    try {
      await deletePatient(id);
      fetchPatients();
      toast({
        title: 'Patient deleted.',
        description: 'The patient has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting patient', error);
      toast({
        title: 'Error deleting patient.',
        description: 'An error occurred while deleting the patient.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditPatient = (patient) => {
    setEditPatientData(patient);
  };

  const handleDeletePatientModal = (patient) => {
    setDeletePatientData(patient);
  };

  const filteredPatients = patients.filter((patient) =>
    (patient.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewPatientDetails = (patientId) => {
    navigate(`/patientdetails/${patientId}`);
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
            Patient Management
          </Text>
          <Flex justifyContent="flex-end" gap="10px">
            <Button
              leftIcon={<MdAdd />}
              colorScheme="teal"
              onClick={addPatientModal.onOpen}
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
              Add Patient
            </Button>
          </Flex>
        </Flex>

        <Flex justify="flex-end" mt={4} mr={4}>
          <InputGroup>
            <Input
              type="text"
              placeholder="Search by name or phone number..."
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

        <Flex justifyContent="center" mt={10}>
          {loading ? (
            <Flex justify="center" align="center" height="10vh">
              <Spinner size="lg" />
            </Flex>
          ) : isSmallScreen ? (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
              {filteredPatients.map((patient) => (
                <Box key={patient.id} p={3} shadow="md" borderWidth="1px" borderRadius="md">
                  <Text fontWeight="bold">ID: {patient.id}</Text>
                  <Text><strong>Name:</strong> {patient.name}</Text>
                  <Text><strong>Phone Number:</strong> {patient.phone_number}</Text>
                  <Text><strong>DOB:</strong> {new Date(patient.dob).toLocaleDateString()} ({calculateAge(patient.dob)})</Text>
                  <Text><strong>Gender:</strong> {patient.gender}</Text>
                  <Flex mt={2} justifyContent="space-between">
                    <IconButton
                      icon={<MdEdit />}
                      onClick={() => handleEditPatient(patient)}
                      aria-label="Edit Patient"
                      colorScheme="teal"
                      size="sm"
                    />
                    <IconButton
                      icon={<MdDelete />}
                      onClick={() => handleDeletePatientModal(patient)}
                      aria-label="Delete Patient"
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
                      <Th>ID</Th>
                      <Th>Patient Number</Th>
                      <Th>Name</Th>
                      <Th>Phone Number</Th>
                      <Th>DOB (Age)</Th>
                      <Th>Gender</Th>
                      {/* <Th>Revisit</Th> */}
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredPatients.map((patient,index) => (
                      <Tr key={patient.id} onClick={() => viewPatientDetails(patient.id)}>
                        <Td>{index+1}</Td>
                        <Td>{patient.patient_no}</Td>
                        <Td>{patient.name}</Td>
                        <Td>{patient.phone_number}</Td>
                        <Td>{new Date(patient.dob).toLocaleDateString()} ({calculateAge(patient.dob)} years)</Td>
                        <Td>{patient.gender}</Td>
                        {/* <Td>{patient.revisit}</Td> */}
                        <Td>
                          <IconButton
                            icon={<MdEdit />}
                            onClick={() => handleEditPatient(patient)}
                            aria-label="Edit Patient"
                            mr={2}
                            colorScheme="teal"
                            size="sm"
                          />
                          <IconButton
                            icon={<MdDelete />}
                            onClick={() => handleDeletePatientModal(patient)}
                            aria-label="Delete Patient"
                            colorScheme="red"
                            size="sm"
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </Flex>
      </Flex>

      {/* AddPatient modal */}
      <AddPatient
        isOpen={addPatientModal.isOpen}
        onClose={addPatientModal.onClose}
        addNewPatient={handleAddPatient}
      />

      {/* EditPatient modal */}
      {editPatientData && (
        <EditPatient
          isOpen={!!editPatientData}
          onClose={() => setEditPatientData(null)}
          updatePatientProp={editPatientData}
          updatePatient={handleUpdatePatient}
        />
      )}

      {/* DeletePatient modal */}
      {deletePatientData && (
        <DeletePatient
          isOpen={!!deletePatientData}
          onClose={() => setDeletePatientData(null)}
          deletePatientProp={deletePatientData}
          deletePatient={() => handleDeletePatient(deletePatientData.id)}
        />
      )}
    </Box>
  );
};

export default Patients;
