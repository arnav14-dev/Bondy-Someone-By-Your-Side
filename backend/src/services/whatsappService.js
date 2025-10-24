import axios from 'axios';
import BrowserService from './browserService.js';

class WhatsAppService {
  constructor() {
    // You can configure these in your .env file
    this.whatsappApiUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/send';
    this.webhookUrl = process.env.WEBHOOK_URL || null;
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || null;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || null;
    this.twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || null;
  }

  /**
   * Method 1: Send via WhatsApp Business API (Meta)
   */
  async sendViaMetaAPI(phoneNumber, message) {
    try {
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      
      if (!accessToken || !phoneNumberId) {
        throw new Error('WhatsApp Business API credentials not configured');
      }

      const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
      
      const data = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: {
          body: message
        }
      };

      const response = await axios.post(apiUrl, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('WhatsApp message sent via Meta API:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending WhatsApp message via Meta API:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Method 2: Send via Twilio API
   */
  async sendViaTwilio(phoneNumber, message) {
    try {
      if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioWhatsAppNumber) {
        throw new Error('Twilio credentials not configured');
      }

      const twilio = await import('twilio');
      const client = twilio.default(this.twilioAccountSid, this.twilioAuthToken);

      const result = await client.messages.create({
        from: `whatsapp:${this.twilioWhatsAppNumber}`,
        to: `whatsapp:${phoneNumber}`,
        body: message
      });

      console.log('WhatsApp message sent via Twilio:', result.sid);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error sending WhatsApp message via Twilio:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Method 3: Send via Webhook (for custom integrations)
   */
  async sendViaWebhook(phoneNumber, message) {
    try {
      if (!this.webhookUrl) {
        throw new Error('Webhook URL not configured');
      }

      const data = {
        phoneNumber,
        message,
        timestamp: new Date().toISOString(),
        source: 'bondy-admin'
      };

      const response = await axios.post(this.webhookUrl, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('WhatsApp message sent via webhook:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending WhatsApp message via webhook:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Method 4: Generate WhatsApp URL for manual sending (fallback)
   */
  generateWhatsAppURL(phoneNumber, message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }

  /**
   * Main method to send WhatsApp message
   * Tries different methods in order of preference
   */
  async sendMessage(phoneNumber, message) {
    console.log(`Attempting to send WhatsApp message to ${phoneNumber}`);
    console.log('Message:', message);

    // Try Meta API first
    if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      console.log('Trying Meta WhatsApp Business API...');
      const metaResult = await this.sendViaMetaAPI(phoneNumber, message);
      if (metaResult.success) {
        return metaResult;
      }
    }

    // Try Twilio second
    if (this.twilioAccountSid && this.twilioAuthToken && this.twilioWhatsAppNumber) {
      console.log('Trying Twilio API...');
      const twilioResult = await this.sendViaTwilio(phoneNumber, message);
      if (twilioResult.success) {
        return twilioResult;
      }
    }

    // Try Webhook third
    if (this.webhookUrl) {
      console.log('Trying webhook...');
      const webhookResult = await this.sendViaWebhook(phoneNumber, message);
      if (webhookResult.success) {
        return webhookResult;
      }
    }

    // Fallback to browser opening
    console.log('All automated methods failed, opening WhatsApp in browser...');
    const whatsappURL = this.generateWhatsAppURL(phoneNumber, message);
    console.log('WhatsApp URL:', whatsappURL);
    
    // Try to open in browser
    const browserResult = await BrowserService.openWhatsAppURL(whatsappURL);
    
    return {
      success: true,
      method: 'browser',
      url: whatsappURL,
      message: 'WhatsApp opened in browser for manual sending',
      browserResult
    };
  }

  /**
   * Send booking assignment notification
   */
  async sendBookingAssignment(companionMobile, booking, userContact) {
    const message = `🎉 *You are assigned as a companion!*

*Booking Details:*
📅 *Date:* ${new Date(booking.date).toLocaleDateString()}
⏰ *Time:* ${booking.time}
🕐 *Duration:* ${booking.duration} hours
📍 *Location:* ${booking.location}
📋 *Service:* ${booking.serviceType.replace('-', ' ').toUpperCase()}
📝 *Task:* ${booking.taskDescription}

*User Details:*
👤 *Name:* ${userContact.name}
📞 *Mobile:* ${userContact.mobile}
${userContact.email ? `📧 *Email:* ${userContact.email}` : ''}

Please contact the user to confirm your availability and coordinate the service.

Thank you for being part of Bondy! 💙`;

    return await this.sendMessage(companionMobile, message);
  }
}

export default new WhatsAppService();
