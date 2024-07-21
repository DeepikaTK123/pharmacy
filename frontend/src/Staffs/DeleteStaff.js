import React from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { deleteStaff } from 'networks'; // Adjust the path as necessary

const DeleteStaff = ({ isOpen, onClose, deletestaffprop }) => {
  const confirmDeleteStaff = async () => {
    try {
      await deleteStaff(deletestaffprop.id);
      toast.success("Staff member deleted successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to delete staff member");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Staff</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Are you sure you want to delete staff member {deletestaffprop.name}?</Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={confirmDeleteStaff}>
            Delete
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteStaff;