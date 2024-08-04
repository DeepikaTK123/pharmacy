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
import { FaPills, FaFileInvoice, FaMoneyBillWave, FaWarehouse, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getDashboardCount, getRevenueChart, getLowStockMedicines, getHighBillingUsers } from 'networks';

const Dashboard = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const [dashboardData, setDashboardData] = useState([]);
  const [billAmounts, setBillAmounts] = useState([]);
  const [billProfits, setBillProfits] = useState([]);
  const [billDates, setBillDates] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [highBillingUsers, setHighBillingUsers] = useState([]);
  const [timeRange, setTimeRange] = useState('weekly');
  const cardSize = useBreakpointValue({ base: '100%', md: '20%' });
  const [totalAmountSum, setTotalAmountSum] = useState(0);
  const [totalProfitSum, setTotalProfitSum] = useState(0);
  const [dailyEarning, setDailyEarning] = useState({ total_amount: 0, total_profit: 0 });
  const [lessThanCount, setLessThanCount] = useState(0);
  const [finishedCount, setFinishedCount] = useState(0);
  const [expiringInThreeMonthsCount, setExpiringInThreeMonthsCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    fetchLowStockMedicines();
    fetchHighBillingUsers();
  }, []);

  const fetchBillAmounts = useCallback(async (range) => {
    try {
      const response = await getRevenueChart(range);
      const data = response.data.data;
      setBillAmounts(data.map(item => item.total_amount));
      setBillProfits(data.map(item => item.total_profit));
      setBillDates(data.map(item => adjustTimeZone(item.interval_date)));
      calculateSums(data);
    } catch (error) {
      console.error('Error fetching bill amounts:', error);
    }
  }, []);

  useEffect(() => {
    fetchBillAmounts(timeRange);
  }, [timeRange, fetchBillAmounts]);

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
      const data = response.data.data;
      setLowStockMedicines(data.filter(medicine => medicine.quantity > 0 && medicine.quantity < 10));
      setLessThanCount(data.filter(medicine => medicine.quantity > 0 && medicine.quantity < 10).length);
      setFinishedCount(data.filter(medicine => medicine.quantity === 0).length);
      const currentDate = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(currentDate.getMonth() + 3);
      setExpiringInThreeMonthsCount(data.filter(medicine => new Date(medicine.expiry_date) <= threeMonthsLater && new Date(medicine.expiry_date) > currentDate).length);
      setExpiredCount(data.filter(medicine => new Date(medicine.expiry_date) <= currentDate).length);
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

  const adjustTimeZone = (date) => date;

  const getRowCount = (tableName) => {
    const table = dashboardData.find((data) => data.table_name === tableName);
    return table ? table.row_count : 0;
  };

  const getXAxisRange = (range) => {
    const now = new Date();
    const offset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    let min, max;

    switch (range) {
      case 'weekly':
        min = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).getTime() - offset;
        max = now.getTime() + offset;
        break;
      case 'monthly':
        min = new Date(now.getFullYear(), now.getMonth(), 1).getTime() - offset;
        max = now.getTime() + offset;
        break;
      case '3months':
        min = new Date(now.getFullYear(), now.getMonth() - 3, 1).getTime() - offset;
        max = now.getTime() + offset;
        break;
      default:
        min = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).getTime() - offset;
        max = now.getTime() + offset;
        break;
    }

    return { min, max };
  };

  const calculateSums = (data) => {
    const totalAmountSum = data.reduce((sum, item) => sum + item.total_amount, 0);
    const totalProfitSum = data.reduce((sum, item) => sum + item.total_profit, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const todayData = data.find(item => {
      const itemDate = new Date(item.interval_date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === todayTimestamp;
    });

    const dailyEarning = todayData ? todayData : { total_amount: 0, total_profit: 0 };

    setTotalAmountSum(totalAmountSum);
    setTotalProfitSum(totalProfitSum);
    setDailyEarning(dailyEarning);
  };

  const xAxisRange = getXAxisRange(timeRange);

  const billOptions = {
    chart: { type: 'column' },
    title: { text: 'Revenue and Profit' },
    xAxis: {
      type: 'datetime',
      min: xAxisRange.min - 24 * 60 * 60 * 1000,
      max: xAxisRange.max + 24 * 60 * 60 * 1000,
      dateTimeLabelFormats: { day: '%e %b', week: '%e %b', month: '%b \'%y', year: '%Y' },
      title: { text: 'Date' },
    },
    yAxis: {
      title: { text: 'Amount / Profit (₹)' },
      labels: { format: '{value:,.0f}' },
      min: 0,
    },
    credits: { enabled: false },
    series: [
      {
        name: 'Total Amount',
        data: billAmounts.map((value, index) => [billDates[index], value]),
        dataLabels: {
          enabled: true,
          format: '{point.y:,.0f}',
          style: { color: '#000', textOutline: 'none' },
        },
      },
      {
        name: 'Total Profit',
        data: billProfits.map((value, index) => [billDates[index], value]),
        dataLabels: {
          enabled: true,
          format: '{point.y:,.0f}',
          style: { color: '#FF5733', textOutline: 'none' },
        },
      },
    ],
  };

  return (
    <Box pt={{ base: '130px', md: '20px', xl: '35px' }} overflowY={{ sm: 'scroll', lg: 'hidden' }}>
      <Flex flexDirection="column">
        <Flex mt="45px" mb="20px" justifyContent="space-between" align={{ base: 'start', md: 'center' }}>
          <Text color={textColor} fontSize={{ base: 'lg', md: '2xl' }} ms="24px" fontWeight="700">Dashboard</Text>
        </Flex>
        <Flex flexDirection="column">
          <Box flex="1" p={4}>
            <Flex justifyContent="space-between" wrap="wrap" mb={8}>
              <Card width="100%" p={4}>
              <Text color={textColor} fontSize={{ base: 'lg', md: 'xl' }} fontWeight="600">Medicines</Text>
                <Flex justifyContent="space-between" wrap="wrap">
                  {[
                    { label: 'Total Medicines in Pharmacy', count: getRowCount('medicines'), icon: <FaWarehouse size={32} color="#0000ff94" /> },
                    { label: 'Total Medicines Worth', count: `₹${getRowCount('medicines_total')}`, icon: <FaMoneyBillWave size={32} color="green" /> },
                    { label: 'Medicines Quantity less than 10', count: lessThanCount, icon: <FaPills size={32} color="orange" /> },
                    { label: 'Out of Stock Medicines', count: finishedCount, icon: <FaPills size={32} color="red" /> },
                    { label: 'Medicines Expiring in 3 Months', count: expiringInThreeMonthsCount, icon: <FaExclamationTriangle size={28} color="orange" /> },
                    { label: 'Expired Medicines', count: expiredCount, icon: <FaExclamationCircle size={28} color="red" /> },
                  ].map(({ label, count, icon }) => (
                    <Stat bg="white" p={4} borderRadius="md" boxShadow="md" m={4} flexBasis={cardSize} key={label}>
                      <StatLabel>{label}</StatLabel>
                      <StatNumber>{count}</StatNumber>
                      {icon}
                    </Stat>
                  ))}
                </Flex>
              </Card>
            </Flex>
            <Flex justifyContent="space-between" wrap="wrap" mb={8}>
              <Card width="100%" p={4}>
              <Text color={textColor} fontSize={{ base: 'lg', md: 'xl' }} fontWeight="600">Billing</Text>
                <Flex justifyContent="space-between" wrap="wrap">
                  {[
                    { label: 'Total Bills', count: getRowCount('billing'), icon: <FaFileInvoice size={32} color="teal" /> },
                    { label: 'Total Revenue(Entire Bills)', count: `₹${totalRevenue.toFixed(2)}`, icon: <FaMoneyBillWave size={32} color="green" /> },
                    { label: 'Total Amount Sum', count: `₹${totalAmountSum.toFixed(2)}`, icon: <FaMoneyBillWave size={32} color="blue" /> },
                    { label: 'Total Profit Sum', count: `₹${totalProfitSum.toFixed(2)}`, icon: <FaMoneyBillWave size={32} color="purple" /> },
                    { label: 'Daily Earning/Profit', count: `₹${dailyEarning.total_amount} / ${dailyEarning.total_profit !== null ? `₹${dailyEarning.total_profit}` : 0}`, icon: <FaMoneyBillWave size={32} color="red" /> },
                  ].map(({ label, count, icon }) => (
                    <Stat bg="white" p={4} borderRadius="md" boxShadow="md" m={4} flexBasis={cardSize} key={label}>
                      <StatLabel>{label}</StatLabel>
                      <StatNumber>{count}</StatNumber>
                      {icon}
                    </Stat>
                  ))}
                </Flex>
              </Card>
            </Flex>
            <Box mt={8}>
              <Tabs onChange={(index) => {
                const ranges = ['weekly', 'monthly', '3months'];
                setTimeRange(ranges[index]);
              }}>
                <TabList>
                  <Tab>Weekly</Tab>
                  <Tab>Monthly</Tab>
                  <Tab>3 Months</Tab>
                </TabList>
                <TabPanels>
                  {['weekly', 'monthly', '3months'].map(range => (
                    <TabPanel key={range}>
                      <HighchartsReact highcharts={Highcharts} options={billOptions} />
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </Box>
            <Flex mt={8} justifyContent="space-between" wrap="wrap">
              {[
                {
                  title: 'Medicines with Quantity Less Than 10',
                  data: lowStockMedicines,
                  columns: [
                    { Header: 'Medicine Name', accessor: 'name' },
                    { Header: 'Quantity', accessor: 'quantity' },
                    { Header: 'MRP (₹)', accessor: 'mrp' },
                  ],
                },
                {
                  title: 'High Billing Users',
                  data: highBillingUsers,
                  columns: [
                    { Header: 'User Name', accessor: 'patient_name' },
                    { Header: 'Phone Number', accessor: 'phone_number' },
                    { Header: 'Number of Bills', accessor: 'num_bills' },
                    { Header: 'Total Bill Amount (₹)', accessor: 'total_amount', Cell: ({ value }) => value.toFixed(2) },
                  ],
                },
              ].map(({ title, data, columns }) => (
                <Box flex="1" p={4} mr={4} key={title}>
                  <Card bg="white" p={4} borderRadius="md" boxShadow="md" overflowY="scroll" height="400px">
                    <Text fontSize="xl" mb={4} fontWeight="bold">{title}</Text>
                    <CardBody>
                      <Box maxHeight="300px" overflowY="scroll">
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              {columns.map(col => <Th key={col.Header}>{col.Header}</Th>)}
                            </Tr>
                          </Thead>
                          <Tbody>
                            {data.map((item, index) => (
                              <Tr key={index}>
                                {columns.map(col => <Td key={col.accessor}>{col.Cell ? col.Cell({ value: item[col.accessor] }) : item[col.accessor]}</Td>)}
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </CardBody>
                  </Card>
                </Box>
              ))}
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Dashboard;
