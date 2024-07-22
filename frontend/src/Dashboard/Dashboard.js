import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaPills, FaFileInvoice, FaMoneyBillWave } from 'react-icons/fa';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getDashboardCount, getRevenueChart, getLowStockMedicines, getHighBillingUsers } from 'networks';

const Dashboard = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const [dashboardData, setDashboardData] = useState([]);
  const [billAmounts, setBillAmounts] = useState([]);
  const [billDates, setBillDates] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [highBillingUsers, setHighBillingUsers] = useState([]);
  const [timeRange, setTimeRange] = useState('daily');
  const cardSize = useBreakpointValue({ base: '100%', md: '33%' });

  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchBillAmounts = useCallback(async (range) => {
    try {
      const response = await getRevenueChart(range);
      setBillAmounts(response.data.data.map(item => item.amount));
      setBillDates(response.data.data.map(item => adjustTimeZone(item.interval_date)));
    } catch (error) {
      console.error('Error fetching bill amounts:', error);
    }
  }, []);
  useEffect(() => {
    fetchBillAmounts(timeRange);
  }, [timeRange, fetchBillAmounts]);

  useEffect(() => {
    fetchLowStockMedicines();
  }, []);

  useEffect(() => {
    fetchHighBillingUsers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboardCount();
      setDashboardData(response.data.data);

      const totalRevenueData = response.data.data.find(item => item.table_name === 'billing_total_sum');
      setTotalRevenue(totalRevenueData ? totalRevenueData.row_count : 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  

  const fetchLowStockMedicines = async () => {
    try {
      const response = await getLowStockMedicines();
      setLowStockMedicines(response.data.data);
    } catch (error) {
      console.error('Error fetching low stock medicines:', error);
    }
  };

  const fetchHighBillingUsers = async () => {
    try {
      const response = await getHighBillingUsers();
      setHighBillingUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching high billing users:', error);
    }
  };

  const adjustTimeZone = (date) => {
    return date;
  };

  const getRowCount = (tableName) => {
    const table = dashboardData.find((data) => data.table_name === tableName);
    return table ? table.row_count : 0;
  };

  const getXAxisRange = (range) => {
    const now = new Date();
    const offset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    let min, max;

    switch (range) {
      case 'daily':
        min = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - offset;
        max = now.getTime() + offset;
        break;
      case 'weekly':
        min = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime() - offset;
        max = now.getTime() + offset;
        break;
      case 'monthly':
        min = new Date(now.getFullYear(), now.getMonth(), 1).getTime() - offset;
        max = now.getTime() + offset;
        break;
      case 'yearly':
        min = new Date(now.getFullYear(), 0, 1).getTime() - offset;
        max = now.getTime() + offset;
        break;
      default:
        min = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - offset;
        max = now.getTime() + offset;
        break;
    }

    return { min, max };
  };

  const xAxisRange = getXAxisRange(timeRange);

  const billOptions = {
    chart: { 
      type: 'line',
      zoomType: 'x' // Enable zooming on the x-axis
    },
    title: { text: 'Total Amount from Bills' },
    xAxis: {
      type: 'datetime',
      min: xAxisRange.min,
      max: xAxisRange.max,
      dateTimeLabelFormats: {
        hour: '%H:%M',
        day: '%e %b',
        week: '%e %b',
        month: '%b \'%y',
        year: '%Y',
      },
      title: { text: 'Date' },
    },
    yAxis: { title: { text: 'Total Amount (₹)' } },
    credits: {
      enabled: false // Disable credits
    },
    series: [{ name: 'Total Amount', data: billAmounts.map((value, index) => [billDates[index], value]) }],
  };

  return (
    <Box pt={{ base: '130px', md: '20px', xl: '35px' }} overflowY={{ sm: 'scroll', lg: 'hidden' }}>
      <Flex flexDirection="column">
        <Flex mt="45px" mb="20px" justifyContent="space-between" align={{ base: 'start', md: 'center' }}>
          <Text color={textColor} fontSize="2xl" ms="24px" fontWeight="700">Dashboard</Text>
        </Flex>
        <Flex flexDirection="column">
          <Box flex="1" p={4}>
            <Flex justifyContent="space-between" wrap="wrap">
              <Stat bg="white" p={4} borderRadius="md" boxShadow="md" m={4} flexBasis={cardSize}>
                <StatLabel>Total Medicines in Pharmacy</StatLabel>
                <StatNumber>{getRowCount('medicines')}</StatNumber>
                <FaPills size={32} color="orange" />
              </Stat>
              <Stat bg="white" p={4} borderRadius="md" boxShadow="md" m={4} flexBasis={cardSize}>
                <StatLabel>Total Bills</StatLabel>
                <StatNumber>{getRowCount('billing')}</StatNumber>
                <FaFileInvoice size={32} color="teal" />
              </Stat>
              <Stat bg="white" p={4} borderRadius="md" boxShadow="md" m={4} flexBasis={cardSize}>
                <StatLabel>Total Revenue</StatLabel>
                <StatNumber>₹{totalRevenue.toFixed(2)}</StatNumber>
                <FaMoneyBillWave size={32} color="green" />
              </Stat>
            </Flex>
            <Box mt={8}>
              <Tabs onChange={(index) => {
                const ranges = ['daily', 'weekly', 'monthly', 'yearly'];
                setTimeRange(ranges[index]);
              }}>
                <TabList>
                  <Tab>Daily</Tab>
                  <Tab>Weekly</Tab>
                  <Tab>Monthly</Tab>
                  <Tab>Yearly</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <HighchartsReact highcharts={Highcharts} options={billOptions} />
                  </TabPanel>
                  <TabPanel>
                    <HighchartsReact highcharts={Highcharts} options={billOptions} />
                  </TabPanel>
                  <TabPanel>
                    <HighchartsReact highcharts={Highcharts} options={billOptions} />
                  </TabPanel>
                  <TabPanel>
                    <HighchartsReact highcharts={Highcharts} options={billOptions} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
            <Box mt={8}>
              <Card bg="white" p={4} borderRadius="md" boxShadow="md" overflowY="scroll" height="400px">
                <Text fontSize="xl" mb={4} fontWeight="bold">Medicines with Quantity Less Than 20</Text>
                <CardBody>
                  <Box maxHeight="300px" overflowY="scroll">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Medicine Name</Th>
                          <Th>Quantity</Th>
                          <Th>MRP (₹)</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {lowStockMedicines.map((medicine) => (
                          <Tr key={medicine.id}>
                            <Td>{medicine.name}</Td>
                            <Td>{medicine.quantity}</Td>
                            <Td>{medicine.mrp}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </CardBody>
              </Card>
            </Box>
            <Box mt={8}>
              <Card bg="white" p={4} borderRadius="md" boxShadow="md" overflowY="scroll" height="400px">
                <Text fontSize="xl" mb={4} fontWeight="bold">High Billing Users</Text>
                <CardBody>
                  <Box maxHeight="300px" overflowY="scroll">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>User Name</Th>
                          <Th>Phone Number</Th>
                          <Th>Number of Bills</Th>
                          <Th>Total Bill Amount (₹)</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {highBillingUsers.map((user) => (
                          <Tr key={user.phone_number}>
                            <Td>{user.patient_name}</Td>
                            <Td>{user.phone_number}</Td>
                            <Td>{user.num_bills}</Td>
                            <Td>{user.total_amount.toFixed(2)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </CardBody>
              </Card>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Dashboard;
