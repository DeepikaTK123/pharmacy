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

  useEffect(() => {
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

    fetchPatientData();
  }, [id]);

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
                      {patientDetails.dob || "No data"}
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
                  <HumanBodySVG markX={115} markY={50} markColor="red" />
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
                    categories={healthData.map((data) => data.visit_day)}
                  />
                  <PatientConditionChart
                    title="Heart Rate"
                    data={healthData.map((data) => data.heart_rate)}
                    category="Heart Rate (bpm)"
                    categories={healthData.map((data) => data.visit_day)}
                  />
                  <PatientConditionChart
                    title="Blood Pressure"
                    data={healthData.map((data) => data.blood_pressure)}
                    category="Blood Pressure (mmHg)"
                    categories={healthData.map((data) => data.visit_day)}
                  />
                  <PatientConditionChart
                    title="SpO2"
                    data={healthData.map((data) => data.spo2)}
                    category="SpO2 (%)"
                    categories={healthData.map((data) => data.visit_day)}
                  />
                  <PatientConditionChart
                    title="Blood Sugar"
                    data={healthData.map((data) => data.blood_sugar)}
                    category="Blood Sugar (mg/dL)"
                    categories={healthData.map((data) => data.visit_day)}
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
                          <Td>{record.visit_day || "No data"}</Td>
                          <Td>{record.doctor || "No data"}</Td>
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
                                {record.service || "No data"}
                              </Text>
                            </Text>
                            {record.medications.length ? (
                              <Box>
                                {record.medications.map((medication, idx) => (
                                  <Text key={idx} color="gray.700" mb={1}>
                                    {" "}
                                    {/* Adjusted margin-bottom */}
                                    <Text as="span" fontWeight="bold">
                                      {medication.name} ({medication.quantity})
                                    </Text>
                                    {" - "}
                                    <Text
                                      as="span"
                                      fontWeight="medium"
                                      color="gray.600"
                                    >
                                      {medication.timings} {medication.food}
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
                          <Td>{new Date(bill.created_at).toLocaleDateString()}</Td>
                          <Td>Rs {bill.total_amount || "No data"}</Td>
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
    </Box>
  );
};

export default PatientDetails;
