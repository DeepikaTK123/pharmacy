import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Flex, Text, Spinner, Card, CardHeader, CardBody, SimpleGrid, Divider, Badge, VStack, Table, Thead, Tbody, Tr, Th, Td, Button } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Mock function to get patient details
const getMockPatientDetails = (id) => {
  const samplePatients = {
    3: {
      id: 3,
      name: 'John Doe',
      age: 45,
      phone: '123-456-7890',
      condition: 'Hypertension',
      doctor: 'Dr. Smith',
      gender: 'Male',
      contact: 'Jane Doe',
      admission_date: '2024-07-01T10:30:00Z',
      address: '123 Main St, Springfield',
      health_status: 'critical',
      health_data: {
        blood_pressure: [130, 135, 140, 145, 150],
        blood_sugar: [110, 115, 120, 125, 130],
        heart_rate: [70, 72, 75, 78, 80],
        temperature: [36.5, 36.7, 37.0, 37.3, 37.5],
        spo2: [98, 97, 96, 95, 94]
      },
      previous_records: [
        {
          date: '2023-12-15',
          condition: 'Normal',
          doctor: 'Dr. Smith',
          report: 'test-report-1.pdf'
        },
        {
          date: '2023-11-10',
          condition: 'Improving',
          doctor: 'Dr. Smith',
          report: 'test-report-2.pdf'
        }
      ]
    },
    4: {
      id: 4,
      name: 'Jane Roe',
      age: 37,
      phone: '987-654-3210',
      condition: 'Diabetes',
      doctor: 'Dr. Johnson',
      gender: 'Female',
      contact: 'John Roe',
      admission_date: '2024-07-02T11:00:00Z',
      address: '456 Elm St, Springfield',
      health_status: 'stable',
      health_data: {
        blood_pressure: [120, 122, 124, 126, 128],
        blood_sugar: [90, 92, 94, 96, 98],
        heart_rate: [65, 66, 67, 68, 69],
        temperature: [36.6, 36.7, 36.8, 36.9, 37.0],
        spo2: [99, 98, 97, 96, 95]
      },
      previous_records: [
        {
          date: '2023-12-10',
          condition: 'Stable',
          doctor: 'Dr. Johnson',
          report: 'test-report-3.pdf'
        },
        {
          date: '2023-11-20',
          condition: 'Normal',
          doctor: 'Dr. Johnson',
          report: 'test-report-4.pdf'
        }
      ]
    },
    // Add more sample patients as needed
  };

  return samplePatients[id] || null;
};

const PatientConditionChart = ({ title, data, category }) => {
  const options = {
    chart: {
      type: 'line'
    },
    title: {
      text: title
    },
    xAxis: {
      categories: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5']
    },
    yAxis: {
      title: {
        text: category
      }
    },
    series: [
      {
        name: category,
        data: data
      }
    ],
    credits: {
      enabled: false
    }
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        // Simulate an API call with mock data
        const patientData = getMockPatientDetails(id);
        setPatient(patientData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching patient details:', error);
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id]);

  const getHealthStatusBadge = (status) => {
    switch (status) {
      case 'critical':
        return <Badge colorScheme="red" fontSize="1.2em" p={2}>Critical</Badge>;
      case 'stable':
        return <Badge colorScheme="green" fontSize="1.2em" p={2}>Stable</Badge>;
      case 'improving':
        return <Badge colorScheme="yellow" fontSize="1.2em" p={2}>Improving</Badge>;
      default:
        return <Badge colorScheme="gray" fontSize="1.2em" p={2}>Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const lastParameter = (data) => data[data.length - 1];

  return (
    <Box pt={{ base: "100px", md: "20px", xl: "35px" }} px={{ base: "5px", md: "20px", xl: "35px" }}>
      <Card mt={10} mb={5} boxShadow="lg">
        <CardHeader textAlign="center">
          <VStack spacing={4}>
            <Text fontSize="3xl" fontWeight="bold" color="teal.500">
              Patient Details
            </Text>
          
          </VStack>
        </CardHeader>
        <Divider />
        <CardBody>
          {patient ? (
            <>
              <SimpleGrid columns={[1, null, 2]} spacing="40px" mb={5}>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Name: <Text as="span" fontWeight="normal">{patient.name}</Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Age: <Text as="span" fontWeight="normal">{patient.age}</Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Phone: <Text as="span" fontWeight="normal">{patient.phone}</Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Diagnosis: <Text as="span" fontWeight="normal">{patient.condition}</Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Doctor: <Text as="span" fontWeight="normal">{patient.doctor}</Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Gender: <Text as="span" fontWeight="normal">{patient.gender}</Text>
                  </Text>
                </Box>
                <Box>
                 
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Admission Date: <Text as="span" fontWeight="normal">
                      {new Date(patient.admission_date).toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </Text>
                
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Last Blood Pressure: <Text as="span" fontWeight="normal">{lastParameter(patient.health_data.blood_pressure)} mmHg</Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Last Blood Sugar: <Text as="span" fontWeight="normal">{lastParameter(patient.health_data.blood_sugar)} mg/dL</Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Last Heart Rate: <Text as="span" fontWeight="normal">{lastParameter(patient.health_data.heart_rate)} bpm</Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Last Temperature: <Text as="span" fontWeight="normal">{lastParameter(patient.health_data.temperature)} °C</Text>
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.600">
                    Last SpO2: <Text as="span" fontWeight="normal">{lastParameter(patient.health_data.spo2)} %</Text>
                  </Text>
                </Box>
              </SimpleGrid>
              <SimpleGrid columns={[1, null, 3]} spacing="20px">
                <PatientConditionChart title="Blood Pressure" data={patient.health_data.blood_pressure} category="Blood Pressure (mmHg)" />
                <PatientConditionChart title="Blood Sugar" data={patient.health_data.blood_sugar} category="Blood Sugar (mg/dL)" />
                <PatientConditionChart title="Heart Rate" data={patient.health_data.heart_rate} category="Heart Rate (bpm)" />
                <PatientConditionChart title="Temperature" data={patient.health_data.temperature} category="Temperature (°C)" />
                <PatientConditionChart title="SpO2" data={patient.health_data.spo2} category="SpO2 (%)" />
              </SimpleGrid>
              <Box mt={5}>
                <Card>
                  <CardHeader>
                    <Text fontSize="2xl" fontWeight="bold" color="teal.500" textAlign="center">
                      Previous Records
                    </Text>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    {patient.previous_records && patient.previous_records.length > 0 ? (
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Date</Th>
                            <Th>Condition</Th>
                            <Th>Doctor</Th>
                            <Th>Report</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {patient.previous_records.map((record, index) => (
                            <Tr key={index}>
                              <Td>{record.date}</Td>
                              <Td>{record.condition}</Td>
                              <Td>{record.doctor}</Td>
                              <Td>
                                <Button as="a" href={`path/to/reports/${record.report}`} download={record.report} leftIcon={<DownloadIcon />} colorScheme="teal" variant="outline">
                                  Download
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Text>No previous records available</Text>
                    )}
                  </CardBody>
                </Card>
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