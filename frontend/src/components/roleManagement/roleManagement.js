


import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Text, Icon, Box, Button, Flex, Table, Thead, Tbody, Tr, Th, Checkbox, Td, Modal, Select, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, FormControl, FormLabel } from '@chakra-ui/react';
import { getUserRoles } from 'networks';
import KeycloakContext from "auth/KeycloakContext";
import Card from "components/card/Card.js";
import { DeleteIcon } from '@chakra-ui/icons';
import { MdEdit } from 'react-icons/md';
import { createRole } from 'networks';
import { toast } from 'react-toastify';
import { deleteRole } from 'networks';

const RoleManagement = () => {
  const { userProfile } = useContext(KeycloakContext);
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [roleNameError, setRoleNameError] = useState(false);
  const [isRoleNameInputFocused, setIsRoleNameInputFocused] = useState(false);
  const [roleNameRequiredError, setRoleNameRequiredError] = useState(false);
  const [formData, setFormData] = useState({
    rolename: '',
    description: '',
    attributes: [{ key: '', value: { create: false, edit: false, delete: false, view: false } }]
  });
  const keys = ["User Management", "Role Management", "Solution Management", "Device Management"];
  // const onClose = () => setIsOpen(false);
  const onClose = () => {
    setIsOpen(false);
    // Reset form data state when modal is closed
    resetFormData();
  };
  const resetFormData = () => {
    setFormData({
      rolename: '',
      description: '',
      attributes: [{ key: '', value: { create: false, edit: false, delete: false, view: false } }]
    });
  };
  const onOpen = () => setIsOpen(true);

  const handleInputChange = (index, field, e) => {
    const { name, value, checked } = e.target;
    const newFormData = { ...formData };

    if (field === "rolename") {
      const regex = /[!@#$%^&*(),?":{}|<> 0-9]/;
      if (regex.test(value)) {
        setRoleNameError(true);
      } else {
        setRoleName(value);
        setRoleNameRequiredError(false);
        setRoleNameError(false);
      }
    }

    if (field === "key") {
      const newAttributes = [...formData.attributes];
      newAttributes[index].key = value;
      setFormData({ ...formData, attributes: newAttributes });
    } else if (field === "attributes") {
      const newAttributes = [...formData.attributes];
      const attributeIndex = newAttributes.findIndex(attr => attr.key === name);
      if (attributeIndex === 1) {
        newAttributes.push({ key: name, value: {} });
      }
      newAttributes[index].value = { ...newAttributes[index].value, [name]: checked };
      setFormData({ ...formData, attributes: newAttributes });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleAddAttribute = (e) => {
    e.stopPropagation(); // Stop the event propagation to prevent clicking on the checkbox
    setFormData({ ...formData, attributes: [...formData.attributes, { key: '', value: { create: false, edit: false, delete: false, view: false } }] });
  };

  const handleRemoveAttribute = (index) => {
    const newAttributes = [...formData.attributes];
    newAttributes.splice(index, 1);
    setFormData({ ...formData, attributes: newAttributes });
  };

  
  const handleSubmit = async () => {
    if (!formData.rolename.trim()) {
      setRoleNameRequiredError(true);
      return;
    }
    const payload = {
      tenant_id: userProfile?.attributes?.tenant_id[0],
      name: formData.rolename,
      description: formData.description,
      attributes: Object.fromEntries(formData.attributes.map(attribute => [attribute.key, attribute.value]))
    };

    try {
      const response = await axios.post(createRole(), payload);

      if (response.status === 200) {
        const message = response.data.message || "Role added successfully!";
        onClose();
        toast.success(message, { theme: "colored" });
        setFormData({
          rolename: '',
          description: '',
          attributes: [{ key: '', value: { create: false, edit: false, delete: false, view: false } }]
        });
        setRoleName('');
        getRoles();
      } else {
        toast.error(response.data.message, { theme: "colored" });
      }
    } catch (error) {
      console.error('Error sending form data:', error);
      toast.error("Error adding role. Please try again later.", { theme: "colored" });
    }
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    const attributes = role.attributes || {};
    const attributeKeys = Object.keys(attributes);
    const formDataAttributes = attributeKeys.map(key => ({ key, value: attributes[key] }));

    setFormData({
      rolename: role.roleName,
      description: role.description,
      attributes: formDataAttributes
    });
    onOpen();
    console.log(setFormData);
  };

  const handleDelete = async (role,tenantid) => {
    try {
      const payload = {
        role_id: role.roleName,
        roleId: role.roleId,
        tenant_id:tenantid

      };
      console.log(payload);
    
    const response=  await axios.post( deleteRole(),payload);
    const message = response.data.message || "Role deleted successfully!";
    if (response.status === 200) {
      getRoles();
      toast.success(message, { theme: "colored" });
    }else{
      toast.error(response.data.message, { theme: "colored" });
    }
     
    } catch (error) {
      console.error("Error deleting role:", error);
      // If there's an error during the delete request, you can show an error message to the user
      toast.error("Error deleting role. Please try again later.", { theme: "colored" });
    }
  };

  useEffect(() => {
    getRoles();
  }, []);

  const getRoles = async () => {
    try {
      const response = await axios.get(getUserRoles(userProfile?.attributes?.tenant_id[0]));
      setRoles(response.data.roles);
    } catch (error) {
      console.error("Error fetching roles list:", error);
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Flex justifyContent="flex-end" >
        <Button variant="darkBrand"
          color="white"
          fontSize="sm"
          fontWeight="500"
          borderRadius="7px"
          px="24px"
          py="5px"
          marginRight="10px"
          onClick={onOpen}>Create New Role</Button>
      </Flex>
      <Card direction="row" w="100%" h="100%" px="0px" style={{ overflowX: "auto" }}>
        <Table variant="simple">
          <Thead mt={{ base: "5px", "2xl": "auto" }}>
            <Tr >
              <Th  borderColor="gray.200" color="gray.400">Role Name</Th>
              <Th borderColor="gray.200" color="gray.400">Description</Th>
              <Th borderColor="gray.200" color="gray.400">Attributes</Th>
              <Th borderColor="gray.200" color="gray.400"></Th>
            
            </Tr>
          </Thead>
          <Tbody>
            {roles.map((role) => (
              <Tr key={role.roleId}>
                <Td>{role.roleName}</Td>
                <Td>{role.description}</Td>
                <Td>
                  {role.attributes ? (
                    <ul>
                      {Object.entries(role.attributes).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {value }
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "-"
                  )}
                </Td>
                <Td>
               
                  <Button colorScheme="blue" variant="outline" size="sm" onClick={() => handleEdit(role)} >
                    <Icon as={MdEdit} width="20px" height="20px" color="inherit" />
                  </Button>
                  <Button colorScheme="red" variant="outline" size="sm" onClick={() => handleDelete(role,userProfile?.attributes?.tenant_id[0])} ml={2}>
                    <DeleteIcon />
                  </Button>
                
                </Td>
            
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
      <Modal isOpen={isOpen} onClose={onClose} size={"xl"} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add/Edit Role</ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel>Role Name *</FormLabel>
              <Input
                type="text"
                variant="auth"
                name="rolename"
                placeholder="Role Name"
                value={formData.rolename}
                borderColor={roleNameError && isRoleNameInputFocused ? "red.500" : undefined}
                onFocus={() => setIsRoleNameInputFocused(true)}
                onBlur={() => {
                  setIsRoleNameInputFocused(false);
                  setRoleNameError(false);
                }}
                onChange={(e) => handleInputChange(null, "rolename", e)}
              />
              {roleNameError && (
                <Text color="red.500" mt={2}>
                  Special characters are not allowed.
                </Text>
              )}
              {roleNameRequiredError && (
                <Text color="red.500" mt={2}>
                  Role Name is required.
                </Text>
              )}
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input type="text" variant="auth" name="description" placeholder="Description" value={formData.description} onChange={(e) => handleInputChange(null, "description", e)} />
            </FormControl>
            <FormControl>
              <FormLabel>Attributes</FormLabel>
              {formData.attributes.map((attribute, index) => (
                <Flex key={index} alignItems="center">
                  <Select
                    placeholder="Select Feature"
                    value={attribute.key}
                    onChange={(e) => handleInputChange(index, "key", e)}
                    marginRight="2"
                  >
                    {keys.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </Select>
                  <Checkbox
                    name="create"
                    checked={attribute.value.create}
                    onChange={(e) => handleInputChange(index, "attributes", e)}
                    marginRight="2"
                  >
                    Create
                  </Checkbox>
                  <Checkbox
                    name="edit"
                    checked={attribute.value.edit}
                    onChange={(e) => handleInputChange(index, "attributes", e)}
                    marginRight="2"
                  >
                    Edit
                  </Checkbox>
                  <Checkbox
                    name="delete"
                    checked={attribute.value.delete}
                    onChange={(e) => handleInputChange(index, "attributes", e)}
                    marginRight="2"
                  >
                    Delete
                  </Checkbox>
                  <Checkbox
                    name="view"
                    checked={attribute.value.view}
                    onChange={(e) => handleInputChange(index, "attributes", e)}
                    marginRight="2"
                  >
                    View
                  </Checkbox>
                  <Button onClick={() => handleRemoveAttribute(index)}>-</Button>
                </Flex>
              ))}
              <Button mt={2} onClick={(e) => handleAddAttribute(e)}>+</Button>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button variant="darkBrand" onClick={handleSubmit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RoleManagement;
