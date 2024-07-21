import React, { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import { FaPills, FaFileInvoice } from 'react-icons/fa';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getDashboardCount, getRevenueChart, getLowStockMedicines } from 'networks';

const Dashboard = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState([]);
  const [billAmounts, setBillAmounts] = useState([]);
  const [billDates, setBillDates] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [timeRange, setTimeRange] = useState('daily');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchBillAmounts(timeRange);
  }, [timeRange]);

  useEffect(() => {
    fetchLowStockMedicines();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await getDashboardCount();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBillAmounts = async (range) => {
    setLoading(true);
    try {
      const response = await getRevenueChart( range );
      setBillAmounts(response.data.data.map(item => item.amount));
      setBillDates(response.data.data.map(item => adjustTimeZone(item.interval_date)));
    } catch (error) {
      console.error('Error fetching bill amounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockMedicines = async () => {
    setLoading(true);
    try {
      const response = await getLowStockMedicines();
      setLowStockMedicines(response.data.data);
    } catch (error) {
      console.error('Error fetching low stock medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const adjustTimeZone = (date) => {
    const offset = 5.5 * 60 * 60 * 1000; // Offset in milliseconds for -5:30 hours
    return date ;
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
            <Flex justifyContent="center">
              <Stat bg="white" p={4} borderRadius="md" boxShadow="md" m={4}>
                <StatLabel>Total Medicines in Pharmacy</StatLabel>
                <StatNumber>{getRowCount('medicines')}</StatNumber>
                <FaPills size={32} color="orange" />
              </Stat>
              <Stat bg="white" p={4} borderRadius="md" boxShadow="md" m={4}>
                <StatLabel>Total Bills</StatLabel>
                <StatNumber>{getRowCount('billing')}</StatNumber>
                <FaFileInvoice size={32} color="teal" />
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
            <Box mt={8} height={400}>
              <Card bg="white" p={4} borderRadius="md" boxShadow="md" overflowY="scroll" height="400px">
                <Text fontSize="xl" mb={4} fontWeight="bold">Medicines with Quantity Less Than 20</Text>
                <CardBody>
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
