import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  IconButton,
  Spinner,
  useToast,
  Card,
  useDisclosure,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  TableContainer,
  useColorModeValue,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import AddPrescription from './AddPrescription';
import EditPrescription from './EditPrescription';
import DeletePrescription from './DeletePrescription';
import { getPrescriptions, addPrescription, updatePrescription, deletePrescription } from 'networks';

const PrescriptionManagement = ({ patientId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPrescriptionData, setEditPrescriptionData] = useState(null);
  const [deletePrescriptionData, setDeletePrescriptionData] = useState(null);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();
  const addPrescriptionModal = useDisclosure();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await getPrescriptions(patientId);
      setPrescriptions(response.data.data);
    } catch (error) {
      console.error('Error fetching prescriptions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewPrescription = async (newPrescription) => {
    try {
      await addPrescription(newPrescription );
      fetchPrescriptions();
      toast({
        title: 'Prescription added.',
        description: 'The prescription has been added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      addPrescriptionModal.onClose();
    } catch (error) {
      console.error('Error adding prescription', error);
      toast({
        title: 'Error adding prescription.',
        description: error.response?.data?.message || 'An error occurred while adding the prescription.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdatePrescription = async (updatedPrescription) => {
    try {
      await updatePrescription(updatedPrescription);
      fetchPrescriptions();
      toast({
        title: 'Prescription updated.',
        description: 'The prescription has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating prescription', error);
      toast({
        title: 'Error updating prescription.',
        description: 'An error occurred while updating the prescription.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeletePrescription = async (id) => {
    try {
      await deletePrescription(id);
      fetchPrescriptions();
      toast({
        title: 'Prescription deleted.',
        description: 'The prescription has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting prescription', error);
      toast({
        title: 'Error deleting prescription.',
        description: 'An error occurred while deleting the prescription.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditPrescription = (prescription) => {
    setEditPrescriptionData(prescription);
  };

  const handleDeletePrescriptionModal = (prescription) => {
    setDeletePrescriptionData(prescription);
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
              leftIcon={<MdAdd />}
              colorScheme="teal"
              onClick={addPrescriptionModal.onOpen}
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
              Add Prescription
            </Button>
          </Flex>
        </Flex>

        <Flex justifyContent="center" mt={10}>
          {loading ? (
            <Flex justify="center" align="center" height="10vh">
              <Spinner size="lg" />
            </Flex>
          ) : (
            <Card width="95%" borderRadius={20}>
              <TableContainer>
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Patient Name</Th>
                      <Th>Phone Number</Th>
                      <Th textAlign={'center'}>Diagnosis</Th>
                      <Th textAlign={'center'}>Blood Pressure (mmHg)</Th>
                      <Th textAlign={'center'}>SPO2 (%)</Th>
                      <Th textAlign={'center'}>Heart Beat (bpm)</Th>
                      <Th textAlign={'center'}>Temperature (°C)</Th>
                      
                      <Th textAlign={'center'}>Medication</Th>
                      <Th textAlign={'center'}>Dosage</Th>
                      <Th textAlign={'center'}>Instructions</Th>
                      
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {prescriptions.map((prescription) => (
                      <Tr key={prescription.id}>
                        <Td>{prescription.id}</Td>
                        <Td>{prescription.patient_name}</Td>
                        <Td>{prescription.phone_number}</Td>
                        <Td textAlign="center">{prescription.diagnosis}</Td>
                        <Td textAlign="center">{prescription.blood_pressure}</Td>
                        <Td textAlign="center">{prescription.spo2}</Td>
                        <Td textAlign="center">{prescription.heart_beat}</Td>
                        <Td textAlign="center">{prescription.temperature}</Td>
                        
                        <Td>
                          <UnorderedList listStyleType="none">
                            {prescription.medication.map(med => (
                              <ListItem key={med.value}>{med.label}</ListItem>
                            ))}
                          </UnorderedList>
                        </Td>
                        <Td>
                          <UnorderedList listStyleType="none">
                            {prescription.medication.map(med => (
                              <ListItem key={med.value}>{med.dosage}</ListItem>
                            ))}
                          </UnorderedList>
                        </Td>
                        <Td>
                          <UnorderedList listStyleType="none">
                            {prescription.medication.map(med => (
                              <ListItem key={med.value}>{med.instructions}</ListItem>
                            ))}
                          </UnorderedList>
                        </Td>
                        
                        <Td>
                          <IconButton
                            icon={<MdEdit />}
                            onClick={() => handleEditPrescription(prescription)}
                            aria-label="Edit Prescription"
                            mr={2}
                            colorScheme="teal"
                            size="sm"
                          />
                          <IconButton
                            icon={<MdDelete />}
                            onClick={() => handleDeletePrescriptionModal(prescription)}
                            aria-label="Delete Prescription"
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

      {/* AddPrescription modal */}
      {addPrescriptionModal.isOpen && (
        <AddPrescription
          isOpen={addPrescriptionModal.isOpen}
          onClose={addPrescriptionModal.onClose}
          addNewPrescription={handleAddNewPrescription}
        />
      )}

      {/* EditPrescription modal */}
      {editPrescriptionData && (
        <EditPrescription
          isOpen={!!editPrescriptionData}
          onClose={() => setEditPrescriptionData(null)}
          initialPrescription={editPrescriptionData}
          updatePrescription={handleUpdatePrescription}
        />
      )}

      {/* DeletePrescription modal */}
      {deletePrescriptionData && (
        <DeletePrescription
          isOpen={!!deletePrescriptionData}
          onClose={() => setDeletePrescriptionData(null)}
          deletePrescriptionProp={deletePrescriptionData}
          deletePrescription={() => handleDeletePrescription(deletePrescriptionData.id)}
        />
      )}
    </Box>
  );
};

export default PrescriptionManagement;
