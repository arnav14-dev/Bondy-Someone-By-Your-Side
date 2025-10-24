import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import './SubServiceModal.css';

const SubServiceModal = ({ isOpen, onClose, onConfirm, serviceName, subServices }) => {
  const [selectedSubServices, setSelectedSubServices] = useState([]);

  const handleSubServiceToggle = (subService) => {
    setSelectedSubServices(prev => {
      if (prev.includes(subService)) {
        return prev.filter(item => item !== subService);
      } else {
        return [...prev, subService];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedSubServices.length > 0) {
      onConfirm(selectedSubServices);
      setSelectedSubServices([]);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedSubServices([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="sub-service-modal-overlay">
      <div className="sub-service-modal">
        <div className="sub-service-modal-header">
          <h3>Select {serviceName} Sub-Services</h3>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="sub-service-modal-body">
          <p className="sub-service-description">
            Choose the specific services you need. You must select at least one option.
          </p>
          
          <div className="sub-service-grid">
            {subServices.map((subService, index) => (
              <div
                key={index}
                className={`sub-service-option ${
                  selectedSubServices.includes(subService) ? 'selected' : ''
                }`}
                onClick={() => handleSubServiceToggle(subService)}
              >
                <div className="sub-service-checkbox">
                  {selectedSubServices.includes(subService) && (
                    <Check size={16} />
                  )}
                </div>
                <span className="sub-service-label">{subService}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="sub-service-modal-footer">
          <button className="cancel-btn" onClick={handleClose}>
            Cancel
          </button>
          <button 
            className="confirm-btn" 
            onClick={handleConfirm}
            disabled={selectedSubServices.length === 0}
          >
            {selectedSubServices.length === 0 ? 'Select at least one option' : `Confirm Selection (${selectedSubServices.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubServiceModal;
