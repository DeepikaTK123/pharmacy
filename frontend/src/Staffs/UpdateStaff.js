import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Box,
  Select,
  Avatar,
  Center,
  IconButton,
  Flex,
  Textarea
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { updateStaff } from "networks"; // Adjust the path as necessary

const UpdateStaff = ({ isOpen, onClose, updatestaffprop }) => {
  console.log(updatestaffprop);

  const initialState = {
    id:updatestaffprop.id || '',
    name: updatestaffprop.name || '',
    role: updatestaffprop.role || '',
    department: updatestaffprop.department || '',
    email: updatestaffprop.email || '',
    phone: updatestaffprop.phone || '',
    joiningDate: new Date(updatestaffprop.joining_date).toISOString().split('T')[0] || '',
    address: updatestaffprop.address || '',
    jobTitle: updatestaffprop.job_title || '',
    licenseNumber: updatestaffprop.license_number || '',
    profilePreview: updatestaffprop.profile_preview || '', // for previewing the selected profile picture
  };

  const [newStaff, setNewStaff] = useState(initialState);

  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewStaff({
            ...newStaff,
            profilePreview: reader.result,
          });
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: 'Invalid file type.',
          description: 'Please select an image file.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      setNewStaff({ ...newStaff, [name]: value });
    }
  };

  const handleSubmit = async () => {
    if (newStaff.name && newStaff.role && newStaff.department && newStaff.email && newStaff.phone && newStaff.joiningDate && newStaff.address && newStaff.jobTitle && newStaff.licenseNumber) {
      try {
        await updateStaff(newStaff);
        setNewStaff(initialState);
        onClose();
        toast({
          title: 'Success.',
          description: 'Staff member updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error.',
          description: 'Failed to update staff member.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: 'Error.',
        description: 'Please fill out all fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Hospital Staff</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box textAlign="center" mb={5} position="relative">
            <Center>
              <Avatar
                size="xl"
                src={newStaff.profilePreview}
                name={newStaff.name}
              />
              <Input
                type="file"
                name="profilePreview"
                onChange={handleInputChange}
                display="none"
                id="profileUpload"
                accept="image/*"
              />
              <IconButton
                icon={<EditIcon />}
                position="absolute"
                bottom="0"
                right="40%"
                fontSize={20}
                backgroundColor={"unset"}
                color={"gray"}
                aria-label="Upload Profile Picture"
                onClick={() => document.getElementById('profileUpload').click()}
              />
            </Center>
          </Box>
          <FormControl id="name" mb={3}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={newStaff.name}
              onChange={handleInputChange}
              placeholder="Enter staff member's name"
            />
          </FormControl>
          <Flex flexDirection={{ sm: "column", md: "row" }}>
            <FormControl id="jobTitle" mb={3}>
              <FormLabel>Job Title</FormLabel>
              <Input
                type="text"
                name="jobTitle"
                value={newStaff.jobTitle}
                onChange={handleInputChange}
                placeholder="Enter staff member's job title"
              />
            </FormControl>
            <FormControl id="licenseNumber" mb={3} px={{ sm: 0, md: 3 }}>
              <FormLabel>Professional License Number</FormLabel>
              <Input
                type="text"
                name="licenseNumber"
                value={newStaff.licenseNumber}
                onChange={handleInputChange}
                placeholder="Enter staff member's license number"
              />
            </FormControl>
            <FormControl id="role" mb={3} pr={{ sm: 0, md: 3 }}>
              <FormLabel>Role</FormLabel>
              <Select
                name="role"
                value={newStaff.role}
                onChange={handleInputChange}
                placeholder="Select role"
              >
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                {/* <option value="Pharmacist">Pharmacist</option>
                <option value="Lab Technician">Lab Technician</option>
                <option value="Radiologist">Radiologist</option>
                <option value="Physiotherapist">Physiotherapist</option>
                <option value="Administrative Assistant">Administrative Assistant</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Surgical Technician">Surgical Technician</option>
                <option value="Anesthesiologist">Anesthesiologist</option>
                <option value="Medical Assistant">Medical Assistant</option>
                <option value="Billing Specialist">Billing Specialist</option>
                <option value="Dietitian">Dietitian</option>
                <option value="Occupational Therapist">Occupational Therapist</option>
                <option value="Social Worker">Social Worker</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Surgeon">Surgeon</option> */}
              </Select>
            </FormControl>
            <FormControl id="department" mb={3}>
              <FormLabel>Department</FormLabel>
              <Select
                name="department"
                value={newStaff.department}
                onChange={handleInputChange}
                placeholder="Select department"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Surgery">Surgery</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Oncology">Oncology</option>
                <option value="Radiology">Radiology</option>
                <option value="Emergency">Emergency</option>
                <option value="Nursing">Nursing</option>
              </Select>
            </FormControl>
          </Flex>
          <Flex flexDirection={{ sm: "column", md: "row" }}>
            <FormControl id="email" mb={3}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={newStaff.email}
                onChange={handleInputChange}
                placeholder="Enter staff member's email"
              />
            </FormControl>
            <FormControl id="phone" mb={3} pl={{ sm: 0, md: 3 }}>
              <FormLabel>Phone</FormLabel>
              <Input
                type="tel"
                name="phone"
                value={newStaff.phone}
                onChange={handleInputChange}
                placeholder="Enter staff member's phone"
              />
            </FormControl>
          </Flex>
          <FormControl id="joiningDate" mb={3}>
            <FormLabel>Joining Date</FormLabel>
            <Input
              type="date"
              name="joiningDate"
              value={newStaff.joiningDate}
              onChange={handleInputChange}
              placeholder="Enter staff member's joining date"
            />
          </FormControl>
          <FormControl id="address" mb={3}>
            <FormLabel>Address</FormLabel>
            <Textarea
              type="text"
              name="address"
              value={newStaff.address}
              onChange={handleInputChange}
              placeholder="Enter staff member's address"
            />
          </FormControl>

        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateStaff;
