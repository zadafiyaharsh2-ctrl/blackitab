import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

/**
 * Reusable GitHub-style deletion confirmation modal that requires
 * typing the exact item name to unlock the delete button.
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to call to close the modal
 * @param {function} onConfirm - Function to call when deletion is confirmed
 * @param {string} itemName - The exact string the user must type to confirm
 * @param {string} itemType - What is being deleted (e.g. "Class", "User", "Assignment")
 * @param {string} warningText - Additional warning details to display to the user
 */
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName, 
  itemType = 'Item', 
  warningText = 'This action cannot be undone. All associated data will be permanently deleted.'
}) => {
  const [inputValue, setInputValue] = useState('');

  // Reset input when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatched = inputValue === itemName;

  const handleConfirm = (e) => {
    e.preventDefault();
    if (isMatched) {
      onConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 10 }} 
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-500/20 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-red-50 dark:bg-red-500/5">
              <h3 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <FaExclamationTriangle /> Delete {itemType}
              </h3>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleConfirm} className="p-6">
              {/* Warning Content */}
              <div className="mb-6 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  You are about to permanently delete the {itemType.toLowerCase()}: <br/>
                  <strong className="text-gray-900 dark:text-white block mt-1">{itemName}</strong>
                </p>
                <p className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-500/20 text-xs font-medium">
                  <strong>Warning:</strong> {warningText}
                </p>
              </div>

              {/* Input Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Please type <strong className="font-mono bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-900 dark:text-white select-all">{itemName}</strong> to confirm.
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all font-mono"
                  placeholder={itemName}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              {/* Actions */}
              <button 
                type="submit" 
                disabled={!isMatched}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  isMatched 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20' 
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                I understand the consequences, delete this {itemType.toLowerCase()}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
