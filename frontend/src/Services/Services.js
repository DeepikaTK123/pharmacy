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
} from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import AddService from './AddService';
import EditService from './EditService';
import DeleteService from './DeleteService';
import { getServices, addService, updateService, deleteService } from 'networks';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editServiceData, setEditServiceData] = useState(null);
  const [deleteServiceData, setDeleteServiceData] = useState(null);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();
  const addServiceModal = useDisclosure();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await getServices();
      setServices(response.data.data);
    } catch (error) {
      console.error('Error fetching services', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewService = async (newService) => {
    try {
      await addService(newService);
      fetchServices();
      toast({
        title: 'Service added.',
        description: 'The service has been added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      addServiceModal.onClose();
    } catch (error) {
      console.error('Error adding service', error);
      toast({
        title: 'Error adding service.',
        description: error.response?.data?.message || 'An error occurred while adding the service.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateService = async (updatedService) => {
    try {
      await updateService(updatedService);
      fetchServices();
      toast({
        title: 'Service updated.',
        description: 'The service has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating service', error);
      toast({
        title: 'Error updating service.',
        description: 'An error occurred while updating the service.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await deleteService(id);
      fetchServices();
      toast({
        title: 'Service deleted.',
        description: 'The service has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting service', error);
      toast({
        title: 'Error deleting service.',
        description: 'An error occurred while deleting the service.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditService = (service) => {
    setEditServiceData(service);
  };

  const handleDeleteServiceModal = (service) => {
    setDeleteServiceData(service);
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
            Service Management
          </Text>
          <Flex justifyContent="flex-end" gap="10px">
            <Button
              leftIcon={<MdAdd />}
              colorScheme="teal"
              onClick={addServiceModal.onOpen}
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
              Add Service
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
                        <Th>Name</Th>
                        <Th>Price</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {services.map((service) => (
                        <Tr key={service.id}>
                          <Td>{service.id}</Td>
                          <Td>{service.name}</Td>
                          <Td>{service.price}</Td>
                          <Td>
                            <IconButton
                              icon={<MdEdit />}
                              onClick={() => handleEditService(service)}
                              aria-label="Edit Service"
                              mr={2}
                              colorScheme="teal"
                              size="sm"
                            />
                            <IconButton
                              icon={<MdDelete />}
                              onClick={() => handleDeleteServiceModal(service)}
                              aria-label="Delete Service"
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

      {/* AddService modal */}
      <AddService
        isOpen={addServiceModal.isOpen}
        onClose={addServiceModal.onClose}
        addNewService={handleAddNewService}
      />

      {/* EditService modal */}
      {editServiceData && (
        <EditService
          isOpen={!!editServiceData}
          onClose={() => setEditServiceData(null)}
          updateServiceProp={editServiceData}
          updateService={handleUpdateService}
        />
      )}

      {/* DeleteService modal */}
      {deleteServiceData && (
        <DeleteService
          isOpen={!!deleteServiceData}
          onClose={() => setDeleteServiceData(null)}
          deleteServiceProp={deleteServiceData}
          deleteService={() => handleDeleteService(deleteServiceData.id)}
        />
      )}
    </Box>
  );
};

export default ServiceManagement;
