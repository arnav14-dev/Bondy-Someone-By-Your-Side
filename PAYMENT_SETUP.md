# Payment System Setup Guide

This guide explains how to set up the payment system with Razorpay integration for the Bondy companion booking platform.

## Features

- **Cash on Delivery (COD)**: Users can choose to pay when the companion arrives
- **Online Payment**: Secure payment through Razorpay with cards, UPI, and net banking
- **Automatic Amount Calculation**: ₹100 per hour based on selected duration
- **Payment Verification**: Secure payment verification using Razorpay webhooks

## Backend Setup

### 1. Install Dependencies

The Razorpay package is already installed. If you need to reinstall:

```bash
cd backend
npm install razorpay
```

### 2. Environment Variables

Add these variables to your `.env` file:

```env
# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here
```

### 3. Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up/Login to your account
3. Go to Settings > API Keys
4. Generate API Keys for Test Mode
5. Copy the Key ID and Key Secret to your `.env` file

### 4. API Endpoints

The following payment endpoints are available:

- `POST /api/payments/create-order/:bookingId` - Create Razorpay order
- `POST /api/payments/verify/:bookingId` - Verify payment
- `POST /api/payments/cod/:bookingId` - Set COD payment
- `GET /api/payments/status/:bookingId` - Get payment status

## Frontend Setup

### 1. Environment Variables

Add this variable to your frontend `.env` file:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

### 2. Razorpay Script

The Razorpay checkout script is automatically loaded in the PaymentPage component.

## Database Schema

The booking model has been updated with payment fields:

```javascript
payment: {
  method: {
    type: String,
    enum: ['cod', 'online'],
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: function() {
      return this.payment && this.payment.method;
    }
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paidAt: Date
}
```

## Payment Flow

### 1. Booking Creation
- User fills out booking form
- System calculates amount (₹100 × hours)
- Booking is saved to database

### 2. Payment Selection
- User chooses between COD or Online payment
- For COD: Payment status set to 'pending'
- For Online: Razorpay order is created

### 3. Payment Processing
- **COD**: Payment status remains 'pending' until service completion
- **Online**: User completes payment through Razorpay checkout
- Payment is verified using Razorpay signature

### 4. Payment Completion
- User is redirected to success page
- WhatsApp integration for final confirmation

## Testing

### Test Mode
- Use Razorpay test credentials
- Test cards: 4111 1111 1111 1111 (Visa)
- Test UPI: Use any UPI ID in test mode

### Production Mode
- Replace test credentials with live credentials
- Update Razorpay dashboard settings
- Test with real payment methods

## Security Features

- **Payment Verification**: All online payments are verified using Razorpay signatures
- **Amount Validation**: Amount is calculated server-side to prevent tampering
- **Order Tracking**: Each payment is linked to a specific booking
- **Error Handling**: Comprehensive error handling for failed payments

## Troubleshooting

### Common Issues

1. **Razorpay Script Not Loading**
   - Check internet connection
   - Verify Razorpay script URL is accessible

2. **Payment Verification Failed**
   - Check Razorpay key secret in environment variables
   - Verify webhook configuration

3. **Amount Mismatch**
   - Check duration calculation logic
   - Verify amount is in paise (multiply by 100)

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## Support

For Razorpay-specific issues, refer to:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

For application-specific issues, check the console logs and server logs for detailed error messages.
