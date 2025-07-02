// Email service utility for handling contact form submissions
export interface EmailData {
    email: string;
    message: string;
  }
  
  export interface EmailResponse {
    success: boolean;
    message?: string;
    error?: string;
  }
  
  export class EmailService {
    private static readonly SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    private static readonly SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
    static async sendEnquiry(data: EmailData): Promise<EmailResponse> {
      try {
        const response = await fetch(`${this.SUPABASE_URL}/functions/v1/send-enquiry`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(data),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          return {
            success: true,
            message: result.message || "Thank you for your message! We'll get back to you soon."
          };
        } else {
          return {
            success: false,
            error: result.error || "Failed to send message. Please try again."
          };
        }
      } catch (error) {
        console.error('Email service error:', error);
        return {
          success: false,
          error: "Network error. Please check your connection and try again."
        };
      }
    }
  
    static validateEmail(email: string): boolean {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  
    static validateMessage(message: string): boolean {
      return message.trim().length >= 10; // Minimum 10 characters
    }
  }