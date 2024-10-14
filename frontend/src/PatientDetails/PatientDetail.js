import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Divider,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HumanBodySVG from "assets/img/humanbody";
import {
  getPatientDetails,
  getHealthData,
  getPrescriptions,
  getBills,
} from "networks"; // Adjust the import path accordingly
import CreateRecordModal from "./AddRecord";
import { MdAdd } from "react-icons/md";

const PatientConditionChart = ({ title, data, category, categories }) => {
  const options = {
    chart: { type: "line" },
    title: { text: title },
    xAxis: { categories: categories },
    yAxis: { title: { text: category } },
    series: [{ name: category, data: data }],
    credits: { enabled: false },
  };
  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

const PatientDetails = () => {
  const { id } = useParams();
  const [patientDetails, setPatientDetails] = useState({});
  const [healthData, setHealthData] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure(); 
  // const [marksList, setMarksList] = useState([]);
  useEffect(() => {
    
    fetchPatientData();
  }, [id]);
  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data concurrently
      const [
        detailsResponse,
        healthDataResponse,
        prescriptionsResponse,
        billsResponse,
      ] = await Promise.all([
        getPatientDetails(id),
        getHealthData(id),
        getPrescriptions(id),
        getBills(id),
      ]);

      setPatientDetails(detailsResponse.data.data || {});
      setHealthData(healthDataResponse.data.data || []);
      setPrescriptions(prescriptionsResponse.data.data || []);
      setBills(billsResponse.data.data || []);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching patient data:", err);
      setError("Failed to load patient data.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Text color="red.500">{error}</Text>
      </Flex>
    );
  }

  const recordhandleonclose=()=>{
onClose()
fetchPatientData()
  }
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };
  return (
    <Box
      pt={{ base: "100px", md: "20px", xl: "35px" }}
      px={{ base: "5px", md: "20px", xl: "35px" }}
    >
      <Card mt={10} mb={5} boxShadow="lg">
        <CardHeader textAlign="center">
          <VStack spacing={4}>
            <Text fontSize="3xl" fontWeight="bold" color="teal.500">
              Patient Details
            </Text>
            <Box mb={8} textAlign="right">
            <Button  onClick={onOpen}
            leftIcon={<MdAdd />}
            colorScheme="teal"
            // display="flex"
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
              Create Record
            </Button>
          </Box>
            {Object.keys(patientDetails).length ? (
              <Text fontSize="lg" fontWeight="bold" color="gray.600">
                Diagnosis:{" "}
                <Text as="span" fontWeight="bold">
                  {healthData.length
                    ? healthData[healthData.length - 1].diagnosis
                    : "No data"}
                </Text>
              </Text>
            ) : (
              <Text>No patient details available</Text>
            )}
          </VStack>
        </CardHeader>
        <Divider />
        <CardBody>
      
          {Object.keys(patientDetails).length ? (
            <>
              <SimpleGrid columns={[1, null, 3]} spacing="40px" mb={5}>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Name:{" "}
                    <Text as="span" fontWeight="normal">
                      {patientDetails.name || "No data"}
                    </Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Age:{" "}
                    <Text as="span" fontWeight="normal">
                      {new Date(patientDetails.dob).toLocaleDateString() || "No data"}({calculateAge(patientDetails.dob)} years)
                    </Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Phone:{" "}
                    <Text as="span" fontWeight="normal">
                      {patientDetails.phone_number || "No data"}
                    </Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Gender:{" "}
                    <Text as="span" fontWeight="normal">
                      {patientDetails.gender || "No data"}
                    </Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Doctor:{" "}
                    <Text as="span" fontWeight="normal">
                      {patientDetails.doctor_name || "No data"}
                    </Text>
                  </Text>
                </Box>
                <Box>
                  {/* Health metrics */}
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Blood Pressure:{" "}
                    <Text as="span" fontWeight="normal">
                      {healthData.length
                        ? healthData[healthData.length - 1].blood_pressure
                        : "No data"}{" "}
                      mmHg
                    </Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Blood Sugar:{" "}
                    <Text as="span" fontWeight="normal">
                      {healthData.length
                        ? healthData[healthData.length - 1].blood_sugar
                        : "No data"}{" "}
                      mg/dL
                    </Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Heart Rate:{" "}
                    <Text as="span" fontWeight="normal">
                      {healthData.length
                        ? healthData[healthData.length - 1].heart_rate
                        : "No data"}{" "}
                      bpm
                    </Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Temperature:{" "}
                    <Text as="span" fontWeight="normal">
                      {healthData.length
                        ? healthData[healthData.length - 1].temperature
                        : "No data"}{" "}
                      °F
                    </Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    SpO2:{" "}
                    <Text as="span" fontWeight="normal">
                      {healthData.length
                        ? healthData[healthData.length - 1].spo2
                        : "No data"}{" "}
                      %
                    </Text>
                  </Text>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="center">
                {healthData.length
                        ?<HumanBodySVG marks={healthData[healthData.length - 1].marks} />
                        : "No data"}{" "}
                
                </Box>
              </SimpleGrid>
              <Divider borderWidth="1px" />
              {/* Patient condition charts */}
              {healthData.length ? (
                <SimpleGrid columns={[1, null, 3]} spacing="20px">
                  <PatientConditionChart
                    title="Temperature"
                    data={healthData.map((data) => data.temperature)}
                    category="Temperature (°F)"
                    categories={healthData.map((data) => data.created_at)}
                  />
                  <PatientConditionChart
                    title="Heart Rate"
                    data={healthData.map((data) => data.heart_rate)}
                    category="Heart Rate (bpm)"
                    categories={healthData.map((data) => data.created_at)}
                  />
                  <PatientConditionChart
                    title="Blood Pressure"
                    data={healthData.map((data) => data.blood_pressure)}
                    category="Blood Pressure (mmHg)"
                    categories={healthData.map((data) => data.created_at)}
                  />
                  <PatientConditionChart
                    title="SpO2"
                    data={healthData.map((data) => data.spo2)}
                    category="SpO2 (%)"
                    categories={healthData.map((data) => data.created_at)}
                  />
                 
                </SimpleGrid>
              ) : (
                <Text>No charts available</Text>
              )}
              {/* Visits list */}
              <Box mt={8}>
                <Text fontSize="2xl" fontWeight="bold" mb={4}>
                  List of Visits
                </Text>
                {healthData.length ? (
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Visit Day</Th>
                        <Th>Doctor</Th>
                        <Th>Diagnosis</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {healthData.map((record, index) => (
                        <Tr key={index}>
                          <Td>{record.created_at || "No data"}</Td>
                          <Td>{record.doctor_name || "No data"}</Td>
                          <Td>{record.diagnosis || "No data"}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text>No visit data available</Text>
                )}
              </Box>

              <Box mt={8} >
                <Text fontSize="2xl" fontWeight="bold" mb={4}>
                  Prescription List
                </Text>
                {prescriptions.length ? (
                  <SimpleGrid columns={[1, null, 4]} spacing="20px">
                    {prescriptions.map((record, index) => (
                      <Card key={index} boxShadow="lg" borderRadius="md">
                     
                        <CardBody>
                          <VStack align="start" spacing={1}>
                          <Text
                            fontSize="md"
                            fontWeight="medium"
                            color="gray.500"
                          >
                            Date:{" "}
                            {new Date(record.created_at).toLocaleDateString()}
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="gray.700"
                          >
                            Doctor: {record.doctor_name || "No data"}
                          </Text>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="gray.600"
                            >
                              Diagnosis:{" "}
                              <Text as="span" fontWeight="medium">
                                {record.diagnosis || "No data"}
                              </Text>
                            </Text>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="gray.600"
                            >
                              Service:{" "}
                              <Text as="span" fontWeight="medium" >
                                {record.services[record.services.length-1].service_name || "No data"}
                              </Text>
                            </Text>
                            {record.medications.length ? (
                              <Box>
                                {record.medications.map((medication, idx) => (
                                  <Text key={idx} color="gray.700" mb={1}>
                                    {" "}
                                    <Text as="span" fontWeight="bold">
                                      {medication.name} ({medication.quantity})
                                    </Text>
                                    {" : "}
                                    <Text
                                      as="span"
                                      fontWeight="medium"
                                      color="gray.600"
                                    >
                                      {medication.timings} {medication.food} food
                                    </Text>
                                  </Text>
                                ))}
                              </Box>
                            ) : (
                              <Text>No medications prescribed</Text>
                            )}
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="gray.600"
                              mt={3}
                            >
                              Instructions:{" "}
                              <Text as="span" fontWeight="medium" >
                                {record.instruction || "No data"}
                              </Text>
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Text>No prescriptions available</Text>
                )}
              </Box>

              <Box mt={8}>
                <Text fontSize="2xl" fontWeight="bold" mb={4}>
                  Bills
                </Text>
                {bills.length ? (
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>Amount</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {bills.map((bill, index) => (
                        <Tr key={index}>
                          <Td>{new Date(bill.date).toLocaleDateString()}</Td>
                          <Td>Rs {bill.total || "No data"}</Td>
                          <Td>{"Paid" || "No data"}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text>No bills available</Text>
                )}
              </Box>
            </>
          ) : (
            <Text>No patient data available</Text>
          )}
        </CardBody>
      </Card>
      <CreateRecordModal isOpen={isOpen} onClose={recordhandleonclose} patientId={id} />
    </Box>
  );
};

export default PatientDetails;
