import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import Card from "components/card/Card.js";
import KeycloakContext from "auth/KeycloakContext";
import { MdEdit } from 'react-icons/md';
import { addUser } from "networks";
import axios from "axios";
import { editUser } from "networks";
import { getTeanantUserList } from "networks";
import { getUserRoles } from "networks";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { capsLockActive } from "Utils/SupportingFunction";
import { disableTenantForUserManagement } from "networks";
import { DeleteIcon } from '@chakra-ui/icons';
const UserManangement = () => {
  const textColorSecondary = "gray.400";
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const [userList, setUserList] = useState("");
  const { userProfile } = useContext(KeycloakContext);


  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobileNumber] = useState("");
  const [alternate_mobile, setAlternateMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState([]);
  const [roles, setRoles] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();


  const [firstNameError, setFirstNameError] = useState(false);
  const [isFirstNameInputFocused, setIsFirstNameInputFocused] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [isLastNameInputFocused, setIsLastNameInputFocused] = useState(false);

  const [mobileError, setMobileError] = useState(false);
  const [isMobileInputFocused, setIsMobileInputFocused] = useState(false);
  const [alternateMobileError, setAlternateMobileError] = useState(false);
  const [isAlternateMobileInputFocused, setIsAlternateMobileInputFocused] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [isEmailInputFocused, setIsEmailInputFocused] = useState(false);
  const [capsLockActiveStatus, setCapsLockActive] = useState(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState(false);

 
  const [userToDelete, setUserToDelete] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const handleSelectChange = (event) => {
    const selectedRole = [...roles].filter(
      (role) => role.roleId === event.target.value
    );
    setSelectedRole(selectedRole);
  };

  useEffect(() => {
    fetchUserList();
    getRoles();
  }, [userProfile]);
 
  const fetchUserList = async () => {
   
    try {
      const response = await axios.get(
        getTeanantUserList(userProfile?.attributes?.tenant_id[0],userProfile?.username)

      );
      setUserList(response.data.users);
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  };

  const getRoles = async () => {
    try {
      const response = await axios.get(
        getUserRoles(userProfile?.attributes?.tenant_id[0])
      );
      setRoles(response.data.roles);
    } catch (error) {
      console.error("Error fetching roles list:", error);
    }
  };

  const handleAddUser = async () => {
    try {
      if (
        firstname.trim() !== "" &&
        lastname.trim() !== "" &&
        password.trim() !== "" &&
        mobile.trim() !== "" &&
        email.trim() !== "" &&
        selectedRole


      ) {
        const userInfoData = {
          tenant_id: userProfile?.attributes?.tenant_id[0],
          firstname,
          lastname,
          password,
          mobile,
          alternate_mobile,
          email,
          roleid: selectedRole[0].roleId,
          rolename: selectedRole[0].roleName,
        };
        // Make a POST request to the backend API using Axios
        axios
          .post(addUser(), userInfoData)
          .then((response) => {
            // Handle success
            fetchUserList();
            onClose();
            toast.success("User added successfully!");

            setFirstName("");
            setLastName("");
            setPassword("");
            setMobileNumber("");
            setAlternateMobileNumber("");
            setEmail("");
            setSelectedRole([]);
          })
          .catch((error) => {
            // Handle error
            console.error("Error user Adding user:", error);
            if (error.response && error.response.data && error.response.data.message) {
              // If backend returns a specific message, display it
              toast.error(error.response.data.message, { theme: "colored" });
            } else {
              // Otherwise, display a generic error message

              toast.error("Failed to sign in. Please try again ", { theme: "colored" })
            }
          });
      } else {
        setError("All fields are required.");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Error adding user. Please try again.");
    }
  };

  const handleKeyPress = (e) => {
    const capsLockActiveStatus = capsLockActive(e);
    setCapsLockActive(capsLockActiveStatus);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(
      (prevShowConfirmPassword) => !prevShowConfirmPassword
    );
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    // Check if passwords match and update error state
    setPasswordMismatchError(value !== password);
  };


  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleClick = async (user) => {
    // Perform action based on isEnabled state\

    if (user.enabled == true) {
      try {
        const body = { "tenant_id": user.attributes.tenant_id[0], "username": user.username, "action": 'disable' }
        const response = await axios.post(disableTenantForUserManagement(), body)
        fetchUserList()
        if (response.status === 200) {

          const message = response.data.message || "Tenant status updated successfully!";
          toast.success(message, { theme: "colored" });
        }
        else {
          toast.error(error.response.data.message, { theme: "colored" })
        }
      } catch (error) {
        console.error("Error fetching tenant list:", error);
        toast.error(error.response.data.message, { theme: "colored" })
      }
    }
    //user is disabled
    else {
      try {
        const body = { "tenant_id": user.attributes.tenant_id[0], "username": user.username, "action": 'enable' }

        const response = await axios.post(disableTenantForUserManagement(), body)
        fetchUserList()
        if (response.status === 200) {

          const message = response.data.message || "Tenant status updated successfully!";
          toast.success(message, { theme: "colored" });
        } else {
          toast.error(error.response.data.message, { theme: "colored" })
        }

      } catch (error) {
        console.error("Error fetching tenant list:", error);
        toast.error(error.response.data.message, { theme: "colored" })
      }
    }
  };

  const handleDelete = async (user) => {

    try {
      const body = { "tenant_id": user.attributes.tenant_id[0], "username": user.username, "action": 'delete' }
      const response = await axios.post(disableTenantForUserManagement(), body)
      fetchUserList()
      closeDeleteModal();
      if (response.status === 200) {
        const message = response.data.message || "User deleted successfully!";
        toast.success(message, { theme: "colored" });
      } else {
        toast.error(response.data.message, { theme: "colored" })
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response.data.message, { theme: "colored" })
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsOpenDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setIsOpenDeleteModal(false);
  };
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }} >
      <Flex
        align="right"
        justify="flex-end"
        me="20px"
        ms={{ base: "24px", md: "0px" }}
        mt={{ base: "20px", md: "0px" }}
        mb="20px"
      >
        <Button
          variant="darkBrand"
          color="white"
          fontSize="sm"
          fontWeight="500"
          borderRadius="7px"
          px="24px"
          py="5px"
          onClick={onOpen}
        >
          Add New User
        </Button>
      </Flex>
      <SimpleGrid mb="20px" spacing={{ base: "20px", xl: "20px" }}>
        <Modal isOpen={isOpen} onClose={onClose} size={"xl"} closeOnOverlayClick={false} >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add User</ModalHeader>
            {capsLockActiveStatus && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Caps Lock is ON!</AlertTitle>
              </Alert>
            )}
            <ModalCloseButton />
            <ModalBody>
              <form>
                <Flex gap={{ base: "20px", xl: "14px" }}>
                  <FormControl id="firstname" mt={4} isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      type="text"
                      variant="auth"
                      placeholder="Enter First Name"
                      value={firstname}
                      borderColor={firstNameError && isFirstNameInputFocused ? "red.500" : undefined}
                      onFocus={() => setIsFirstNameInputFocused(true)}
                      onBlur={() => {
                        setIsFirstNameInputFocused(false);
                        setFirstNameError(false); // Reset error state when the input loses focus
                      }}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Regular expression to check for special characters
                        const regex = /[!@#$%^&*(),?":{}|<>_]/;

                        // Check if the input matches the regex pattern
                        if (regex.test(inputValue)) {
                          // If it contains special characters, set a state variable to indicate error
                          setFirstNameError(true);
                        } else {
                          // If it doesn't contain special characters, update the state
                          setFirstName(inputValue);
                          // Clear the error state
                          setFirstNameError(false);
                        }
                      }}
                    />
                    {/* Display alert below the input field when firstNameError is true */}
                    {firstNameError && (
                      <Text color="red.500" mt={2}>
                        Special characters are not allowed.
                      </Text>
                    )}

                  </FormControl>
                  <FormControl id="lastname" mt={4} isRequired>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      type="text"
                      variant="auth"
                      placeholder="Enter Last Name"
                      value={lastname}
                      borderColor={lastNameError && isLastNameInputFocused ? "red.500" : undefined}
                      onFocus={() => setIsLastNameInputFocused(true)}
                      onBlur={() => {
                        setIsLastNameInputFocused(false);
                        setLastNameError(false); // Reset error state when the input loses focus
                      }}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Regular expression to check for special characters
                        const regex = /[!@#$%^&*(),?":{}|<>_1]/;

                        // Check if the input matches the regex pattern
                        if (regex.test(inputValue)) {
                          // If it contains special characters, set a state variable to indicate error
                          setLastNameError(true);
                        } else {
                          // If it doesn't contain special characters, update the state
                          setLastName(inputValue);
                          // Clear the error state
                          setLastNameError(false);
                        }
                      }}
                    />
                    {/* Display alert below the input field when lastNameError is true */}
                    {lastNameError && (
                      <Text color="red.500" mt={2}>
                        Special characters are not allowed.
                      </Text>
                    )}
                  </FormControl>
                </Flex>
                <Flex gap={{ base: "20px", xl: "14px" }}>
                  {/* <FormControl id="username" mt={4} isRequired>
                    <FormLabel>Username</FormLabel>
                    <Input
                      type="text"
                      variant="auth"
                      placeholder="Enter Username"
                      value={username}
                      borderColor={usernameError && isUsernameInputFocused ? "red.500" : undefined}
                      onFocus={() => setIsUsernameInputFocused(true)}
                      onBlur={() => {
                        setIsUsernameInputFocused(false);
                        setUsernameError(false); // Reset error state when the input loses focus
                      }}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                     
                        setUsername(inputValue); 
                      }}
                    />
                
                    {usernameError && (
                      <Text color="red.500" mt={2}>
                        Your error message for the username validation goes here.
                      </Text>
                    )}
                  </FormControl> */}
                  <FormControl id="email" mt={4} isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      variant="auth"
                      placeholder="Enter email"
                      value={email}
                      borderColor={emailError && isEmailInputFocused ? "red.500" : undefined}
                      onFocus={() => setIsEmailInputFocused(true)}
                      onBlur={() => {
                        if (email.trim().length > 0 && !isValidEmail(email)) {

                          setEmailError(true);
                        }
                        setIsEmailInputFocused(false);

                      }}
                      onChange={(e) => {
                        const inputValue = e.target.value;

                        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{4,}$/;

                        if (!regex.test(inputValue)) {

                          setEmail(inputValue);

                          setEmailError(false);
                        } else {

                          setEmailError(true);

                        }
                      }}
                    />

                    {emailError && (
                      <Text fontSize="sm" color="red.500">Please enter a valid email address.</Text>
                    )}
                  </FormControl>
                  <FormControl id="role"
                    mt={4}
                    style={{ width: "100%" }}
                    isRequired>
                    <FormLabel>Role</FormLabel>
                    <Select
                      placeholder="Select Role"
                      value={selectedRole.length > 0 && selectedRole[0].roleId}
                      onChange={handleSelectChange}
                      variant="auth"
                    >
                      {roles.map((role) => (
                        <option value={role.roleId} key={role}>
                          {role.roleName}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </Flex>
                <Flex gap={{ base: "20px", xl: "14px" }}>
                  <FormControl id="mobile" mt={4} isRequired>
                    <FormLabel>Mobile Number</FormLabel>
                    <Input
                      type="tel"
                      variant="auth"
                      placeholder="Enter mobile number"
                      value={mobile}
                      borderColor={mobileError && isMobileInputFocused ? "red.500" : undefined}
                      onFocus={() => setIsMobileInputFocused(true)}
                      onBlur={() => {
                        if (mobile.trim().length > 0 && mobile.length !== 10) {
                          setMobileError(true); // Set mobileError to true if the length is not exactly 10
                        } else {
                          setMobileError(false); // Otherwise, reset mobileError
                          setIsMobileInputFocused(false); // Reset focus state
                        }

                      }}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Regular expression to check for numbers only
                        const regex = /^\d*$/;

                        // Check if the input matches the regex pattern and is not longer than 10 characters
                        if (regex.test(inputValue) && inputValue.length <= 10) {
                          // If it's a valid phone number format, update the state
                          setMobileNumber(inputValue);
                          // Reset the error state
                          setMobileError(false);
                        } else {
                          // If it's not a valid phone number format, set mobileError to true
                          setMobileError(true);
                        }
                      }}

                    />
                    {/* Display error message if mobileError is true */}
                    {mobileError && (
                      <Text fontSize="sm" color="red.500">
                        Please enter a valid 10-digit mobile number.
                      </Text>
                    )}
                  </FormControl>
                  <FormControl id="alternate_mobile" mt={4}>
                    <FormLabel>Alternate Mobile Number</FormLabel>
                    <Input
                      type="tel"
                      variant="auth"
                      placeholder="Enter alternate mobile number"
                      value={alternate_mobile}
                      borderColor={alternateMobileError && isAlternateMobileInputFocused ? "red.500" : undefined}
                      onFocus={() => setIsAlternateMobileInputFocused(true)}
                      onBlur={() => {
                        if (alternate_mobile.trim().length > 0 && alternate_mobile.length !== 10) {
                          // If it's not exactly 10 characters, set alternateMobileError to true
                          setAlternateMobileError(true);
                        } else {
                          // If it's exactly 10 characters, reset the error state
                          setAlternateMobileError(false);
                          setIsAlternateMobileInputFocused(false); // Reset focus state
                        }

                      }}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Regular expression to check for numbers only
                        const regex = /^\d*$/;

                        // Check if the input matches the regex pattern and is not longer than 10 characters
                        if (regex.test(inputValue) && inputValue.length <= 10) {
                          // If it's a valid phone number format, update the state
                          setAlternateMobileNumber(inputValue);
                          // Reset the error state
                          setAlternateMobileError(false);
                        } else {
                          // If it's not a valid phone number format, set alternateMobileError to true
                          setAlternateMobileError(true);
                        }
                      }}
                    />
                    {/* Display alert below the input field when alternateMobileError is true */}
                    {alternateMobileError && (
                      <Text fontSize="sm" color="red.500">Please enter a valid 10-digit phone number.</Text>
                    )}
                  </FormControl>
                </Flex>
                <Flex gap={{ base: "20px", xl: "14px" }}>
                  <FormControl id="password" mt={4} isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? "text" : "password"}
                        variant="auth"
                        placeholder="Enter password"
                        value={password}
                        onKeyDown={handleKeyPress}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <InputRightElement width="3rem">
                        <IconButton
                          h="1.75rem"
                          size="sm"
                          onClick={handleTogglePasswordVisibility}
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  <FormControl mt={4} isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        variant="auth"
                        placeholder="Enter Confirm password"
                        onChange={(e) =>
                          handleConfirmPasswordChange(e.target.value)
                        }
                        onKeyDown={handleKeyPress}
                      />
                      <InputRightElement width="3rem">
                        <IconButton
                          h="1.75rem"
                          size="sm"
                          onClick={handleToggleConfirmPasswordVisibility}
                          icon={
                            showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />
                          }
                        />
                      </InputRightElement>
                    </InputGroup>
                    {passwordMismatchError && (
                      <Text color="red.500" mt={2}>
                        Passwords do not match.
                      </Text>
                    )}
                  </FormControl>
                </Flex>



                {error && <p>{error}</p>}
              </form>
            </ModalBody>

            <ModalFooter>
              <Button   variant="darkBrand"
          color="white"
          fontSize="sm"
          fontWeight="500"
          borderRadius="7px"
          px="24px"
          py="5px" onClick={handleAddUser} >
                Add
              </Button>

              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {(userList?.length ?? 0) > 0 && (
          <Card direction="row" w="100%" h="100%" px="0px" style={{ overflowX: "auto" }}>
            <Table variant="simple">
              <Thead
                mt={{ base: "5px", "2xl": "auto" }}
                color={textColorSecondary}
              >
                <Tr>
                  <Th borderColor="gray.200" color="gray.400" style={{ padding: "5px 10px" }} whiteSpace="nowrap">
                    Username
                  </Th>
                  <Th borderColor="gray.200" color="gray.400" style={{ padding: "5px 10px" }} whiteSpace="nowrap">
                    Name
                  </Th>
                  <Th borderColor="gray.200" color="gray.400" style={{ padding: "5px 10px" }} whiteSpace="nowrap">
                    Roles
                  </Th>
                  <Th borderColor="gray.200" color="gray.400" style={{ padding: "5px 10px" }} whiteSpace="nowrap">
                    Email
                  </Th>
                  <Th borderColor="gray.200" color="gray.400" style={{ padding: "5px 10px" }} whiteSpace="nowrap">
                    Mobile
                  </Th>
                  <Th borderColor="gray.200" color="gray.400" style={{ padding: "5px 10px" }} whiteSpace="nowrap">
                    Alt Mobile
                  </Th>
                  <Th borderColor="gray.200" color="gray.400" style={{ padding: "5px 10px" }} whiteSpace="nowrap">
                    Created Timestamp
                  </Th>
                  <Th borderColor="gray.200" color="gray.400" style={{ padding: "5px 10px" }} whiteSpace="nowrap">
                    last logged in
                  </Th>
                  <Th borderColor="gray.200" color="gray.400" style={{ padding: "5px 10px" }} whiteSpace="nowrap">
                    Email Verified
                  </Th>
                  <Th borderColor="gray.200" color="gray.400" style={{ padding: "5px 10px" }} whiteSpace="nowrap">
                    Enabled
                  </Th>
                  <Th borderColor="gray.200" color="gray.400" style={{ padding: "5px 10px" }} whiteSpace="nowrap">
                   Assign Role
                  </Th>
                  <Th borderColor="gray.200" color="gray.400" style={{ padding: "5px 10px" }} whiteSpace="nowrap">
                    action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {userList.map((user, index) => (
                  <Tr key={user.username} bg={user.enabled ? (!user.emailVerified ? "rgb(124, 219, 102, 0.5)" : "inherit") : "red.200"} >
                    <Td
                      style={{ padding: "5px 10px" }}
                      fontWeight="700"
                      color={textColor}
                      minW={{ sm: "150px", md: "200px", lg: "auto" }}
                      whiteSpace="nowrap"
                    >
                      {user.username}
                    </Td>
                    <Td
                      style={{ padding: "5px 10px" }}
                      fontWeight="700"
                      color={textColor}
                      minW={{ sm: "150px", md: "200px", lg: "auto" }}
                      whiteSpace="nowrap"
                    >
                      {`${user.firstName} ${user.lastName}`}

                    </Td>
                    <Td
                      style={{ padding: "5px 10px" }}
                      fontWeight="700"
                      color={textColor}
                      minW={{ sm: "150px", md: "200px", lg: "auto" }}
                      whiteSpace="nowrap"
                    >
                      {user.roles[0]}
                    </Td>
                    <Td
                      style={{ padding: "5px 10px" }}
                      fontWeight="700"
                      color={textColor}
                      minW={{ sm: "150px", md: "200px", lg: "auto" }}
                      whiteSpace="nowrap"
                    >
                      {user.email}
                    </Td>
                    <Td
                      style={{ padding: "5px 10px" }}
                      fontWeight="700"
                      color={textColor}
                      minW={{ sm: "150px", md: "200px", lg: "auto" }}
                      whiteSpace="nowrap"
                    >
                      {user.attributes.mobile && user.attributes.mobile[0]}

                    </Td>
                    <Td
                      style={{ padding: "5px 10px" }}
                      fontWeight="700"
                      color={textColor}
                      minW={{ sm: "150px", md: "200px", lg: "auto" }}
                      whiteSpace="nowrap"
                    >
                      {user.attributes.altmobile &&
                        user.attributes.altmobile[0]}
                    </Td>


                    <Td
                      style={{ padding: "5px 10px" }}
                      fontWeight="700"
                      color={textColor}
                      minW={{ sm: "150px", md: "200px", lg: "auto" }}
                      whiteSpace="nowrap"
                    >
                      {/* {user.createdTimestamp} */}
                      {(new Date(user.createdTimestamp)).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} {(new Date(user.createdTimestamp)).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </Td>

                    {
                      user.last_logged_in !== "-" ?
                        <Td
                          style={{ padding: "5px 10px" }}
                          fontWeight="700"
                          color={textColor}
                          minW={{ sm: "150px", md: "200px", lg: "auto" }}
                          whiteSpace="nowrap"
                        >

                          {(new Date(user.last_logged_in)).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} {(new Date(user.last_logged_in)).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}

                        </Td> : <Td
                          style={{ padding: "5px 10px" }}
                          fontWeight="700"
                          color={textColor}
                          minW={{ sm: "150px", md: "200px", lg: "auto" }}
                        >
                          -
                        </Td>
                    }
                    <Td
                      style={{ padding: "5px 10px" }}
                      fontWeight="700"
                      color={textColor}
                      minW={{ sm: "150px", md: "200px", lg: "auto" }}
                    >
                      {user.emailVerified ? "Yes" : "No"}
                    </Td>
                    
                    <Td
                      style={{ padding: "5px 10px" }}
                      fontWeight="700"
                      color={textColor}
                      minW={{ sm: "150px", md: "200px", lg: "auto" }}
                    >
                      {user.enabled ? "Yes" : "No"}
                    </Td>
                    <Td
                      style={{ padding: "5px 10px" }}
                      fontWeight="700"
                      color={textColor}
                      minW={{ sm: "150px", md: "200px", lg: "auto" }}
                    >
                      <Button> <Icon as={MdEdit} width="20px" height="20px" color="inherit" /></Button>
                    </Td>
                    <Td
                      style={{ padding: "5px 10px" }}
                      fontWeight="700"
                      color={textColor}
                      minW={{ sm: "150px", md: "200px", lg: "auto" }}>
                
                      {user.enabled === true ? (
                        <Button onClick={() => handleClick(user)} variant='darkBrand'  size="sm">Disable</Button>
                      ) : (
                        user.last_logged_in === "-" || (Date.now() - new Date(user.last_logged_in).getTime()) > 24 * 60 * 60 * 1000 ? (
                          <Flex justifyContent="space-between" style={{ gap: "1rem" }} >
                            
                            <Button onClick={() => handleClick(user)} variant="solid" colorScheme="green"  size="sm">Enable</Button>
                            <Button onClick={() => { openDeleteModal(); setUserToDelete(user); }} variant="solid" colorScheme="red"  size="sm" ><DeleteIcon /></Button>
                          </Flex>
                        ) : (
                          <Button onClick={() => handleClick(user)} variant="solid" colorScheme="red"  size="sm">Enable</Button>
                        )
                      )}
                      <Modal isOpen={isOpenDeleteModal} onClose={closeDeleteModal} closeOnOverlayClick={false}>
                        <ModalOverlay />
                        {userToDelete && (
                          <ModalContent>
                            <ModalHeader>Delete {`${userToDelete.firstName} ${userToDelete.lastName}`}</ModalHeader>
                            <ModalBody>
                              Are you sure you want to delete <span style={{ fontWeight: 'bold' }}> {`${userToDelete.firstName} ${userToDelete.lastName}`}?</span>
                            </ModalBody>
                            <ModalFooter>
                              <Button colorScheme="red" mr={3} onClick={() => { handleDelete(userToDelete); onClose(); }}>
                                Delete
                              </Button>
                              <Button onClick={closeDeleteModal}>Cancel</Button>
                            </ModalFooter>
                          </ModalContent>
                        )}
                      </Modal>

                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Card>
        )}
      </SimpleGrid>
    </Box>
  );
};

export default UserManangement;
