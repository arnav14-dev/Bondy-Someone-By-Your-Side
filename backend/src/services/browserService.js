import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class BrowserService {
  constructor() {
    this.platform = process.platform;
  }

  /**
   * Open WhatsApp URL in the default browser
   */
  async openWhatsAppURL(url) {
    try {
      console.log('Opening WhatsApp URL in browser:', url);
      
      let command;
      
      switch (this.platform) {
        case 'darwin': // macOS
          command = `open "${url}"`;
          break;
        case 'win32': // Windows
          command = `start "${url}"`;
          break;
        case 'linux': // Linux
          command = `xdg-open "${url}"`;
          break;
        default:
          throw new Error(`Unsupported platform: ${this.platform}`);
      }
      
      await execAsync(command);
      console.log('WhatsApp URL opened successfully in browser');
      return { success: true };
      
    } catch (error) {
      console.error('Error opening WhatsApp URL:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send WhatsApp message by opening URL in browser
   */
  async sendWhatsAppMessage(phoneNumber, message) {
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    return await this.openWhatsAppURL(whatsappURL);
  }
}

export default new BrowserService();
