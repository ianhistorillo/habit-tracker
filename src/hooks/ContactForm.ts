import { useState } from 'react';
import { EmailService, EmailData } from '../components/ui/EmailService';
import { toast } from 'sonner';

export interface ContactFormState {
  email: string;
  message: string;
  isSubmitting: boolean;
}

export const useContactForm = () => {
  const [formState, setFormState] = useState<ContactFormState>({
    email: '',
    message: '',
    isSubmitting: false,
  });

  const updateField = (field: keyof Omit<ContactFormState, 'isSubmitting'>, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormState({
      email: '',
      message: '',
      isSubmitting: false,
    });
  };

  const submitForm = async (): Promise<boolean> => {
    // Validation
    if (!formState.email.trim() || !formState.message.trim()) {
      toast.error('Please fill in all fields');
      return false;
    }

    if (!EmailService.validateEmail(formState.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!EmailService.validateMessage(formState.message)) {
      toast.error('Message must be at least 10 characters long');
      return false;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const result = await EmailService.sendEnquiry({
        email: formState.email.trim(),
        message: formState.message.trim(),
      });

      if (result.success) {
        toast.success(result.message);
        resetForm();
        return true;
      } else {
        toast.error(result.error);
        return false;
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      return false;
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    formState,
    updateField,
    resetForm,
    submitForm,
  };
};