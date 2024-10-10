import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
  Input,
  Select,
  Flex,
  Grid,
  GridItem,
  useColorModeValue,
  Card,
  CardBody,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { getAlerts, createAlert as apiCreateAlert, deleteAlert as apiDeleteAlert } from 'networks'; // Import API functions

const AlertsModal = ({ isOpen, onClose }) => {
  const [quantity, setQuantity] = useState('');
  const [condition, setCondition] = useState('less');
  const [color, setColor] = useState('#ff0000'); // Default color (red)
  const [expiryValue, setExpiryValue] = useState(''); // Number of days/months/years
  const [expiryUnit, setExpiryUnit] = useState('days'); // Unit for expiry (days, months, years)
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state for fetching alerts

  // Color theme handling
  const headerBorderColor = useColorModeValue('gray.200', 'gray.700');
  const headerTextColor = useColorModeValue('gray.700', 'gray.200');
  const quantityTitleColor = useColorModeValue('blue.600', 'blue.300');
  const expiryTitleColor = useColorModeValue('green.600', 'green.300');
  const alertTextColor = useColorModeValue('white', 'gray.900');

  // Fetch alerts when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen]);

  // Fetch existing alerts from the server
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await getAlerts(); // Fetch alerts from API
      setAlerts(response.data.data); // Update the state with fetched alerts
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setLoading(false);
    }
  };

  // Handle creating an alert for quantity and sending it to the API
  const createAlert = async () => {
    if (quantity) {
      const newAlert = {
        type: 'Quantity',
        value: quantity,
        label: condition === 'less' ? 'less than' : 'greater than', // Use 'label' instead of 'message'
        color,
      };
      try {
        await apiCreateAlert(newAlert); // Call the API to create the alert
        fetchAlerts()
        setQuantity(''); // Reset the input
      } catch (error) {
        console.error('Error creating alert:', error);
      }
    }
  };

  // Handle creating an alert for expiry and sending it to the API
  const createExpiryAlert = async () => {
    if (expiryValue && expiryUnit) {
      const newAlert = {
        type: 'Expiry',
        value: expiryValue,
        label: expiryUnit, // Use 'label' for expiry time unit
        color,
      };
      try {
        await apiCreateAlert(newAlert); // Call the API to create the alert
        fetchAlerts()
        setExpiryValue(''); // Reset the input
        setExpiryUnit('days'); // Reset the dropdown
      } catch (error) {
        console.error('Error creating expiry alert:', error);
      }
    }
  };

  // Handle deleting an alert and calling the API
  const deleteAlert = async (index) => {
    const alertToDelete = alerts[index];
    try {
      await apiDeleteAlert(alertToDelete.id); // Call the API to delete the alert
      fetchAlerts()
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxW="900px">
        <ModalHeader borderBottom="1px solid" borderColor={headerBorderColor}>
          Create Alerts
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4} fontSize="lg" fontWeight="bold" color={headerTextColor}>
            Follow the steps below to create custom alerts for Quantity & Expiry:
          </Text>

          {/* Create a grid with two columns */}
          <Grid templateColumns="repeat(2, 1fr)" gap={8}>
            {/* Column 1: Quantity Alerts */}
            <GridItem>
              <Card borderWidth="1px" borderRadius="lg" shadow="md">
                <CardBody>
                  <Text fontSize="lg" fontWeight="bold" color={quantityTitleColor}>
                    Quantity Alerts
                  </Text>
                  <Text fontSize="md" color="gray.500" mb={4}>
                    Set an alert based on the quantity of items in stock. You can choose to be alerted if the quantity is less than or greater than a specific value.
                  </Text>

                  <Flex direction="column" mt={4}>
                    <Text>Quantity:</Text>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      mb={3}
                    />

                    <Text>Condition:</Text>
                    <Select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      mb={3}
                    >
                      <option value="less">Less than</option>
                      <option value="greater">Greater than</option>
                    </Select>

                    <Text>Alert Color:</Text>
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      mb={3}
                      width="100px"
                    />

                    <Button colorScheme="blue" onClick={createAlert} mt={4}>
                      Create Quantity Alert
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>

            {/* Column 2: Expiry Alerts */}
            <GridItem>
              <Card borderWidth="1px" borderRadius="lg" shadow="md">
                <CardBody>
                  <Text fontSize="lg" fontWeight="bold" color={expiryTitleColor}>
                    Expiry Alerts
                  </Text>
                  <Text fontSize="md" color="gray.500" mb={4}>
                    Set an alert for items that will expire after a certain period. You can define the time period in days, months, or years.
                  </Text>

                  <Flex direction="column" mt={4}>
                    <Text>Expiry Duration:</Text>
                    <Flex gap={3}>
                      <Input
                        type="number"
                        placeholder="Enter number"
                        value={expiryValue}
                        onChange={(e) => setExpiryValue(e.target.value)}
                        mb={3}
                        width="50%"
                      />
                      <Select
                        value={expiryUnit}
                        onChange={(e) => setExpiryUnit(e.target.value)}
                        mb={3}
                        width="50%"
                      >
                        <option value="days">Days</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </Select>
                    </Flex>

                    <Text>Alert Color:</Text>
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      mb={3}
                      width="100px"
                    />

                    <Button colorScheme="green" onClick={createExpiryAlert} mt={4}>
                      Create Expiry Alert
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          {/* Display Created Alerts with delete button */}
          {loading ? (
            <Spinner size="xl" />
          ) : (
            <>
              <Text fontWeight="bold" mt={6} mb={4}>
                Created Alerts:
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                {alerts.map((alert, index) => (
                  <GridItem key={index}>
                    <Box p={4} borderWidth="1px" borderRadius="md" bg={alert.color} shadow="sm" position="relative">
                      <Text color={alertTextColor} fontWeight="bold">
                        {alert.type} - {alert.label}: {alert.value}
                      </Text>
                      <IconButton
                        aria-label="Delete alert"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        position="absolute"
                        top="5px"
                        right="5px"
                        onClick={() => deleteAlert(index)}
                      />
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AlertsModal;
