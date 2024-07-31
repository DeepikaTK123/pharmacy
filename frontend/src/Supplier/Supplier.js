import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Flex,
  Text,
  useColorModeValue,
  useDisclosure,
  IconButton,
  Tooltip,
  Card,
  Link,
  Input,
  useToast,
  Spinner,
  useBreakpointValue,
} from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdFileUpload } from 'react-icons/md';
import AddProduct from './AddProduct';
import EditSupplierProduct from './EditSupplier';
import DeleteSupplierProduct from './DeleteSupplier';
import ViewSupplierProduct from './ViewSupplier';
import UploadInvoice from './UploadInvoice';
import {
  addSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  uploadInvoice,
} from 'networks';  // Adjust the import path as necessary

const Supplier = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const addProductModal = useDisclosure();
  const editSupplierProductModal = useDisclosure();
  const deleteSupplierProductModal = useDisclosure();
  const viewSupplierProductModal = useDisclosure();
  const uploadInvoiceModal = useDisclosure();
  const [editSupplierProductData, setEditSupplierProductData] = useState(null);
  const [deleteSupplierProductData, setDeleteSupplierProductData] = useState(null);
  const [viewSupplierProductData, setViewSupplierProductData] = useState(null);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();
  const isSmallScreen = useBreakpointValue({ base: true, md: false });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSuppliers();
      setProducts(response.data.data);
      setFilteredProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching product records:', error);
      toast({
        title: 'Error',
        description: 'Error fetching product records',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const filtered = products.filter((item) => {
      return (
        item.id.toString().includes(search) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.manufacturedBy.toLowerCase().includes(search.toLowerCase())
      );
    });
    setFilteredProducts(filtered);
  }, [search, products]);

  const handleAddProduct = async (newProduct) => {
    try {
      await addSupplier(newProduct);
      fetchProducts();
      addProductModal.onClose();
      toast({
        title: 'Success',
        description: 'Product added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Error adding product',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateSupplierProduct = async (updatedSupplierProduct) => {
    try {
      await updateSupplier(updatedSupplierProduct);
      fetchProducts();
      editSupplierProductModal.onClose();
      toast({
        title: 'Success',
        description: 'Product updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Error updating product',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteSupplierProduct = async (id) => {
    try {
      await deleteSupplier(id);
      fetchProducts();
      deleteSupplierProductModal.onClose();
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Error deleting product',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditSupplierProduct = (item) => {
    setEditSupplierProductData(item);
    editSupplierProductModal.onOpen();
  };

  const handleDeleteSupplierProductModal = (item) => {
    setDeleteSupplierProductData(item);
    deleteSupplierProductModal.onOpen();
  };

  const handleViewSupplierProduct = (item) => {
    setViewSupplierProductData(item);
    viewSupplierProductModal.onOpen();
  };

  const handleUploadInvoice = async (formData) => {
    try {
      await uploadInvoice(formData);
      fetchProducts();
      uploadInvoiceModal.onClose();
      toast({
        title: 'Success',
        description: 'Invoice uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading invoice:', error);
      toast({
        title: 'Error',
        description: 'Error uploading invoice',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box pt={{ base: '130px', md: '20px', xl: '35px' }} overflowY="auto">
      <Flex flexDirection="column">
        <Flex
          mt={{ base: '20px', md: '45px' }}
          mb="20px"
          flexDirection={{ base: 'column', md: 'row' }}
          justifyContent="space-between"
          align={{ base: 'start', md: 'center' }}
        >
          <Text color={textColor} fontSize={{ base: 'lg', md: '2xl' }} ms="24px" fontWeight="700">
            Supplier Products
          </Text>
          <Flex>
            <Button
              leftIcon={<MdFileUpload />}
              colorScheme="teal"
              onClick={uploadInvoiceModal.onOpen}
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap="10px"
              fontFamily="inherit"
              fontWeight="500"
              fontSize={{ base: 'sm', md: '13px' }}
              textTransform="uppercase"
              letterSpacing="0.4px"
              color="white"
              backgroundColor="#3d94cf"
              border="2px solid rgba(255, 255, 255, 0.333)"
              borderRadius="40px"
              padding={{ base: '12px 20px', md: '16px 24px' }}
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
              Upload Invoice
            </Button>
            <Button
              leftIcon={<MdAdd />}
              colorScheme="teal"
              onClick={addProductModal.onOpen}
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap="10px"
              fontFamily="inherit"
              fontWeight="500"
              fontSize={{ base: 'sm', md: '13px' }}
              textTransform="uppercase"
              letterSpacing="0.4px"
              color="white"
              backgroundColor="#3d94cf"
              border="2px solid rgba(255, 255, 255, 0.333)"
              borderRadius="40px"
              padding={{ base: '12px 20px', md: '16px 24px' }}
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
              ml={4}
            >
              Add Product
            </Button>
          </Flex>
        </Flex>

        <Flex justifyContent="center" mt={{ base: '20px', md: '30px' }}>
          <Card width={{ base: '100%', md: '97%' }} borderRadius="md">
            {loading ? (
              <Flex justify="center" align="center" height="10vh">
                <Spinner size="xl" />
              </Flex>
            ) : (
              <Box p={{ base: 3, md: 5 }}>
                <Input
                  placeholder="Search by Product Name, Manufacturer, or Invoice No"
                  mb={4}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Box overflowX="auto">
                  {isSmallScreen ? (
                    filteredProducts.map((item) => (
                      <Box key={item.id} mb={4} p={4} borderWidth="1px" borderRadius="lg" overflow="hidden">
                        <Text mb={1}><strong>ID:</strong> {item.id}</Text>
                        <Text mb={1}><strong>Name:</strong> {item.name}</Text>
                        <Text mb={1}><strong>Manufacturer:</strong> {item.manufacturedBy}</Text>
                        <Text mb={1}><strong>Batch No:</strong> {item.batchNo}</Text>
                        <Text mb={1}><strong>Expiry Date:</strong> {new Date(item.expiryDate).toLocaleDateString()}</Text>
                        <Text mb={1}><strong>Quantity:</strong> {item.quantity}</Text>
                        <Text mb={1}><strong>Rate:</strong> {item.rate}</Text>
                        <Text mb={1}><strong>CGST:</strong> {item.cgst}</Text>
                        <Text mb={1}><strong>SGST:</strong> {item.sgst}</Text>
                        <Text mb={1}><strong>Total:</strong> {item.total}</Text>
                        <Flex mt={2} justifyContent="space-between">
                          <IconButton
                            icon={<MdVisibility />}
                            onClick={() => handleViewSupplierProduct(item)}
                            aria-label="View Product"
                            colorScheme="blue"
                            size="sm"
                          />
                          <IconButton
                            icon={<MdEdit />}
                            onClick={() => handleEditSupplierProduct(item)}
                            aria-label="Edit Product"
                            colorScheme="teal"
                            size="sm"
                          />
                          <IconButton
                            icon={<MdDelete />}
                            onClick={() => handleDeleteSupplierProductModal(item)}
                            aria-label="Delete Product"
                            colorScheme="red"
                            size="sm"
                          />
                        </Flex>
                      </Box>
                    ))
                  ) : (
                    <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Name</Th>
                          <Th>Invoice No</Th>
                          <Th>Manufacturer</Th>
                          <Th>Batch No</Th>
                          <Th>Expiry Date</Th>
                          <Th>Quantity</Th>
                          <Th>Rate</Th>
                          <Th>CGST</Th>
                          <Th>SGST</Th>
                          <Th>Total</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredProducts.map((item) => (
                          <Tr key={item.id}>
                            <Td>{item.id}</Td>
                            <Td>{item.name}</Td>
                            <Td>{item.manufacturedBy}</Td>
                            <Td>{item.batchNo}</Td>
                            <Td>{new Date(item.expiryDate).toLocaleDateString()}</Td>
                            <Td>{item.quantity}</Td>
                            <Td>{item.rate}</Td>
                            <Td>{item.cgst}</Td>
                            <Td>{item.sgst}</Td>
                            <Td>{item.total}</Td>
                            <Td>
                              <Flex flexDirection={{ base: 'column', md: 'row' }}>
                                <IconButton
                                  icon={<MdVisibility />}
                                  onClick={() => handleViewSupplierProduct(item)}
                                  aria-label="View Product"
                                  mb={{ base: 1, md: 0 }}
                                  mr={{ base: 0, md: 2 }}
                                  colorScheme="blue"
                                  size="sm"
                                />
                                <IconButton
                                  icon={<MdEdit />}
                                  onClick={() => handleEditSupplierProduct(item)}
                                  aria-label="Edit Product"
                                  mb={{ base: 1, md: 0 }}
                                  mr={{ base: 0, md: 2 }}
                                  colorScheme="teal"
                                  size="sm"
                                />
                                <IconButton
                                  icon={<MdDelete />}
                                  onClick={() => handleDeleteSupplierProductModal(item)}
                                  aria-label="Delete Product"
                                  colorScheme="red"
                                  size="sm"
                                />
                              </Flex>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </Box>
              </Box>
            )}
          </Card>
        </Flex>
      </Flex>

      {uploadInvoiceModal.isOpen && (
        <UploadInvoice isOpen={uploadInvoiceModal.isOpen} onClose={uploadInvoiceModal.onClose} uploadInvoice={handleUploadInvoice} />
      )}
      {addProductModal.isOpen && (
        <AddProduct isOpen={addProductModal.isOpen} onClose={addProductModal.onClose} addNewProduct={handleAddProduct} />
      )}
      {editSupplierProductModal.isOpen && editSupplierProductData && (
        <EditSupplierProduct
          isOpen={editSupplierProductModal.isOpen}
          onClose={editSupplierProductModal.onClose}
          updateSupplierProductProp={editSupplierProductData}
          updateSupplierProduct={handleUpdateSupplierProduct}
        />
      )}
      {deleteSupplierProductModal.isOpen && deleteSupplierProductData && (
        <DeleteSupplierProduct
          isOpen={deleteSupplierProductModal.isOpen}
          onClose={deleteSupplierProductModal.onClose}
          deleteSupplierProductProp={deleteSupplierProductData}
          deleteSupplierProduct={() => handleDeleteSupplierProduct(deleteSupplierProductData.id)}
        />
      )}
      {viewSupplierProductModal.isOpen && viewSupplierProductData && (
        <ViewSupplierProduct
          isOpen={viewSupplierProductModal.isOpen}
          onClose={viewSupplierProductModal.onClose}
          supplierProductData={viewSupplierProductData}
        />
      )}
    </Box>
  );
};

export default Supplier;
