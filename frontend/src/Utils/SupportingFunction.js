import { useToast } from "@chakra-ui/react";

export const capsLockActive = (e) => {
  const capsLockActive = e.getModifierState("CapsLock");
  return capsLockActive;
};

export const isValidMobileNumber = (mobileNumber) => {
  // Regular expression to match 10-digit numbers
  const mobileNumberPattern = /^\d{10}$/;
  return mobileNumberPattern.test(mobileNumber);
};

export const showToast = (toast, title, description, status, duration = 3000) => {
  toast({
    title,
    description,
    status,
    duration,
    isClosable: true,
  });
};

export const showSuccessToast = (toast, title, description, duration) => {
 
  showToast(toast, title, description, "success", duration);
};

export const showFailureToast = (toast, title, description, duration) => {
  showToast(toast, title, description, "error", duration);
};

export const showErrorToast = (toast, title, description, duration) => {
  showToast(toast, title, description, "warning", duration);
};
