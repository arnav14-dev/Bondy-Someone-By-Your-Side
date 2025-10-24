import React, { useState, useEffect } from 'react';
import '../styles/PaymentPage.css';
import { BASE_API_URL, RAZORPAY_KEY_ID } from '../config/api.js';
import apiClient from '../utils/apiClient.js';

const PaymentPage = ({ booking, onPaymentComplete, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  // Calculate amount based on duration
  const calculateAmount = () => {
    const durationMap = {
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '6': 6,
      '8': 8,
      'full-day': 8
    };
    const hours = durationMap[booking.duration] || 2;
    return hours * 100; // ₹100 per hour
  };

  const amount = calculateAmount();
  const hours = booking.duration === 'full-day' ? 8 : parseInt(booking.duration) || 2;

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setError('');
  };

  const handleCODPayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const response = await apiClient.post(`/payments/cod/${booking._id}`);
      
      if (response.data.success) {
        onPaymentComplete({
          method: 'cod',
          status: 'pending',
          amount: amount
        });
      } else {
        setError(response.data.message || 'Failed to set COD payment');
      }
    } catch (error) {
      console.error('COD payment error:', error);
      setError('Failed to set COD payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!razorpayLoaded) {
      setError('Payment system is loading. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create Razorpay order
      const orderResponse = await apiClient.post(`/payments/create-order/${booking._id}`);
      
      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create payment order');
      }

      const { orderId, amount: orderAmount, key } = orderResponse.data.data;

      // Configure Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: 'INR',
        name: 'Bondy - Someone By Your Side',
        description: `Companion service for ${hours} hour${hours > 1 ? 's' : ''}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await apiClient.post(`/payments/verify/${booking._id}`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              onPaymentComplete({
                method: 'online',
                status: 'paid',
                amount: amount,
                paymentId: response.razorpay_payment_id
              });
            } else {
              setError('Payment verification failed. Please try again.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: booking.userContact?.name || '',
          email: booking.userContact?.email || '',
          contact: booking.userContact?.mobile || ''
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Online payment error:', error);
      setError(error.message || 'Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (paymentMethod === 'cod') {
      handleCODPayment();
    } else if (paymentMethod === 'online') {
      handleOnlinePayment();
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h2 className="payment-title">Complete Your Payment</h2>
          <p className="payment-subtitle">
            Choose your preferred payment method to confirm your booking
          </p>
        </div>

        {/* Booking Summary */}
        <div className="booking-summary">
          <h3 className="summary-title">Booking Summary</h3>
          <div className="summary-details">
            <div className="summary-row">
              <span className="summary-label">Service:</span>
              <span className="summary-value">
                {booking.serviceType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Duration:</span>
              <span className="summary-value">
                {hours} hour{hours > 1 ? 's' : ''}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Date & Time:</span>
              <span className="summary-value">
                {new Date(booking.date).toLocaleDateString()} at {booking.time}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Location:</span>
              <span className="summary-value">{booking.location}</span>
            </div>
            <div className="summary-row total-row">
              <span className="summary-label">Total Amount:</span>
              <span className="summary-value total-amount">₹{amount}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <h3 className="methods-title">Select Payment Method</h3>
          
          <div className="method-options">
            <label className={`method-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => handlePaymentMethodChange('cod')}
                className="method-radio"
              />
              <div className="method-card">
                <div className="method-icon">💵</div>
                <div className="method-content">
                  <h4 className="method-title">Cash on Delivery</h4>
                  <p className="method-description">
                    Pay when the companion arrives at your location
                  </p>
                </div>
              </div>
            </label>

            <label className={`method-option ${paymentMethod === 'online' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={() => handlePaymentMethodChange('online')}
                className="method-radio"
              />
              <div className="method-card">
                <div className="method-icon">💳</div>
                <div className="method-content">
                  <h4 className="method-title">Online Payment</h4>
                  <p className="method-description">
                    Pay securely with cards, UPI, or net banking
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="payment-actions">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary"
            disabled={isProcessing}
          >
            Back to Booking
          </button>
          <button
            type="button"
            onClick={handlePayment}
            className="btn-primary"
            disabled={!paymentMethod || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="loading-spinner"></span>
                {paymentMethod === 'cod' ? 'Setting up COD...' : 'Processing Payment...'}
              </>
            ) : (
              `Pay ₹${amount} ${paymentMethod === 'cod' ? 'on Delivery' : 'Now'}`
            )}
          </button>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="security-icon">🔒</div>
          <p className="security-text">
            Your payment information is secure and encrypted. We use industry-standard security measures to protect your data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
