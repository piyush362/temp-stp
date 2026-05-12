// validate.ts

export const validatePhoneNumber = (phone: string): boolean => {
  // Validates any 10-digit number
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.trim());
};

export const validateEmail = (email: string): boolean => {
  // Basic email pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};
