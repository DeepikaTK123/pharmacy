import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { login } from "networks";

function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorBrand = useColorModeValue("brand.500", "white");
  const googleBg = useColorModeValue("secondaryGray.300", "whiteAlpha.200");
  const googleText = useColorModeValue("navy.700", "white");
  const googleHover = useColorModeValue(
    { bg: "gray.200" },
    { bg: "whiteAlpha.300" }
  );
  const googleActive = useColorModeValue(
    { bg: "secondaryGray.300" },
    { bg: "whiteAlpha.200" }
  );
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSignIn = async () => {
    try {
      const response = await login(formData);
      if (response.status === 200) {
        sessionStorage.setItem("login", true);
        sessionStorage.setItem("token", response.data.message);
        sessionStorage.setItem("data", JSON.stringify(response.data.data));
        sessionStorage.setItem("features", JSON.stringify(response.data.features));
        navigate("/dashboard");
        window.location.reload();
      } else {
        toast({
          title: "Login failed.",
          description: "Please check your credentials.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error occurred:", error);
      toast({
        title: "Error.",
        description: "An error occurred during login.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSignIn();
    }
  };

  return (
    <Flex
      height="100vh"
      alignItems="center"
      justifyContent="center"
      p={{ base: 4, md: 8 }}
      mt={4}
      mb={4}
    >
      <Flex
        width={{ base: "100%", md: "80%", lg: "60%" }}
        mx="auto"
        my="auto"
        bg="white"
        borderRadius="15px"
        boxShadow="lg"
        overflow="hidden"
        flexDirection={{ base: "column", md: "row" }}
      >
        <Flex
          flexDirection="column"
          width={{ base: "100%", md: "50%" }}
          display={{ base: "none", md: "flex" }}
          alignItems="center"
          justifyContent="center"
          bgGradient="linear(to-r, #ee7724, #d8363a, #dd3675, #b44593)"
          color="white"
          p={8}
          borderTopRightRadius="15px"
          borderBottomRightRadius="15px"
        >
          <Box textAlign="left" px={8}>
            <Flex flexDirection={"column"} alignItems="end">
              <Heading mb={4}></Heading>
            </Flex>
          </Box>
        </Flex>
        <Flex
          flexDirection="column"
          width={{ base: "100%", md: "50%" }}
          p={8}
          alignItems="center"
        >
          <Box textAlign="center">
            <Heading color={textColor} fontSize="36px" mb="10px">
              Sign In
            </Heading>
            <Text
              mb="36px"
              ms="4px"
              color={textColorSecondary}
              fontWeight="400"
              fontSize="md"
            >
              Enter your username and password to sign in!
            </Text>
          </Box>

          <FormControl onKeyPress={handleKeyPress} mt={50} mb={100}>
            <FormLabel
              display="flex"
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
              Email<Text color={textColorBrand}>*</Text>
            </FormLabel>
            <Input
              isRequired={true}
              variant="auth"
              fontSize="sm"
              ms={{ base: "0px", md: "0px" }}
              type="text"
              placeholder="Enter your email"
              mb="24px"
              fontWeight="500"
              size="lg"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <FormLabel
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              display="flex"
            >
              Password<Text color={textColorBrand}>*</Text>
            </FormLabel>
            <InputGroup size="md">
              <Input
                isRequired={true}
                fontSize="sm"
                placeholder="Min. 8 characters"
                mb="24px"
                size="lg"
                type={show ? "text" : "password"}
                variant="auth"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <InputRightElement display="flex" alignItems="center" mt="4px">
                <Icon
                  color={textColorSecondary}
                  _hover={{ cursor: "pointer" }}
                  as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  onClick={handleClick}
                />
              </InputRightElement>
            </InputGroup>

            <Button
              fontSize="sm"
              backgroundColor="#3d94cf"
              color="white"
              fontWeight="500"
              w="100%"
              h="50"
              mb="24px"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
          </FormControl>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default Login;
