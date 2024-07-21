import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Tbody, Td, Th, Thead, Tr, VStack, Flex, Text, useColorModeValue, 
  useDisclosure, IconButton, Spinner, Card,
  TableContainer, Avatar
} from '@chakra-ui/react';
import { MdDelete, MdEdit, MdPersonAdd } from 'react-icons/md';
import AddStaff from './AddStaff';
import UpdateStaff from './UpdateStaff';
import DeleteStaff from './DeleteStaff';
import Loading from 'Utils/Loading/Loading';
import { getStaffs } from 'networks'; // Adjust the path as necessary

const Staffs = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const staffmodal = useDisclosure();
  const editstaffmodal = useDisclosure();
  const deletestaffmodal = useDisclosure();
  const [editstaffdetaildata, setStaffEditDetailData] = useState([]);
  const [deletestaffdetaildata, setStaffDeleteDetailData] = useState(null);
  const textColor = useColorModeValue("secondaryGray.900", "white");

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const response = await getStaffs();
        setStaff(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch staff data', error);
      }
    };
    fetchStaffs();
  }, []);

  const addNewStaff = (newStaff) => {
    setStaff([...staff, { ...newStaff, id: staff.length + 1 }]);
    staffmodal.onClose();
  };

  const handleStaffEditDetailData = (data) => {
    setStaffEditDetailData(data);
    editstaffmodal.onOpen();
  };

  const handleStaffDeleteDetailData = (data) => {
    setStaffDeleteDetailData(data);
    deletestaffmodal.onOpen();
  };

  return (
    <Box pt={{ base: "130px", md: "20px", xl: "35px" }} overflowY={{ sm: "scroll", lg: "hidden" }}>
      <Flex flexDirection="column">
        <Flex mt="45px" mb="20px" justifyContent="space-between" align={{ base: "start", md: "center" }}>
          <Text color={textColor} fontSize="2xl" ms="24px" fontWeight="700">
            Staffs
          </Text>
          <Button 
            leftIcon={<MdPersonAdd />} 
            colorScheme="teal" 
            onClick={staffmodal.onOpen}
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap="10px"
            fontFamily="inherit"
            fontWeight="500"
            fontSize="13px"
            textTransform="uppercase"
            letterSpacing="0.4px"
            color="white"
            backgroundColor="#3d94cf"
            border="2px solid rgba(255, 255, 255, 0.333)"
            borderRadius="40px"
            padding="16px 24px 16px 28px"
            transform="translate(0px, 0px) rotate(0deg)"
            transition="0.2s"
            boxShadow="-4px -2px 16px 0px #ffffff, 4px 2px 16px 0px rgb(95 157 231 / 48%)"
            _hover={{
              color: "#516d91",
              backgroundColor: "#E5EDF5",
              boxShadow:
                "-2px -1px 8px 0px #ffffff, 2px 1px 8px 0px rgb(95 157 231 / 48%)",
            }}
            _active={{
              boxShadow: "none",
            }}
          >
            Add Staff Member
          </Button>
        </Flex>

        <Flex justifyContent={"center"} mt={30}>
          <Card width={"97%"} borderRadius={40} >
              {loading ? (
                <Flex justify="center" align="center" height="10vh">
                 <Loading />
                </Flex>
              ) : (
                <TableContainer p={5}>
                <Table variant="simple" >
                  <Thead>
                    <Tr>
                      {['Profile Preview', 'Name', 'Role', 'Department', 'Email', 'Phone', 'Joining Date', 'Address', 'Job Title', 'License Number', 'Action'].map(header => (
                        <Th key={header} w="10%">{header}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {staff.map((member) => (
                      <Tr key={member.email}>
                        <Td w="10%" textAlign={"center"}>
                          <Avatar src={member.profile_preview} size="sm" />
                        </Td>
                        <Td w="10%">{member.name}</Td>
                        <Td w="10%">{member.role}</Td>
                        <Td w="10%">{member.department}</Td>
                        <Td w="10%">{member.email}</Td>
                        <Td w="10%">{member.phone}</Td>
                        <Td w="10%">{new Date(member.joining_date).toLocaleString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                  day: "numeric",
                  month: "short",
                  year:"numeric"
                })}</Td>
                        <Td w="10%">{member.address}</Td>
                        <Td w="10%">{member.job_title}</Td>
                        <Td w="10%">{member.license_number}</Td>
                        
                        <Td w="10%">
                          <Flex>
                            <IconButton
                              icon={<MdEdit />}
                              onClick={() => handleStaffEditDetailData(member)}
                              aria-label="Edit Staff Member"
                              mr={2}
                              colorScheme="teal"
                              size="sm"
                            />
                            <IconButton
                              icon={<MdDelete />}
                              onClick={() => handleStaffDeleteDetailData(member)}
                              aria-label="Delete Staff Member"
                              colorScheme="red"
                              size="sm"
                            />
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                </TableContainer>
              )}
          </Card>
        </Flex>
      </Flex>
      {staffmodal.isOpen && (
        <AddStaff isOpen={staffmodal.isOpen} onClose={staffmodal.onClose} addNewStaff={addNewStaff} />
      )}
      {editstaffmodal.isOpen && (
        <UpdateStaff
          isOpen={editstaffmodal.isOpen}
          onClose={editstaffmodal.onClose}
          updatestaffprop={editstaffdetaildata}
        />
      )}
      {deletestaffmodal.isOpen && (
        <DeleteStaff
          isOpen={deletestaffmodal.isOpen}
          onClose={deletestaffmodal.onClose}
          deletestaffprop={deletestaffdetaildata}
        />
      )}
    </Box>
  );
};

export default Staffs;
