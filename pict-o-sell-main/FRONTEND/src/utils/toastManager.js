import toast from 'react-hot-toast';

// Keep track of active toasts to prevent duplicates
const activeToasts = new Set();

/**
 * Show a toast notification only if an identical one isn't already active
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, etc.)
 * @param {Object} options - Additional toast options
 * @returns {string|null} - The toast ID if created, null if suppressed
 */
export const showUniqueToast = (message, type = 'default', options = {}) => {
  // Create a unique key for this toast based on message and type
  const toastKey = `${type}:${message}`;
  
  // If this exact toast is already showing, don't show it again
  if (activeToasts.has(toastKey)) {
    return null;
  }
  
  // Add to active toasts
  activeToasts.add(toastKey);
  
  // Show the appropriate toast type
  let toastId;
  
  const defaultOptions = {
    duration: 3000,
    ...options,
    // When the toast is dismissed, remove it from active toasts
    onClose: () => {
      activeToasts.delete(toastKey);
      if (options.onClose) options.onClose();
    }
  };
  
  switch (type) {
    case 'success':
      toastId = toast.success(message, defaultOptions);
      break;
    case 'error':
      toastId = toast.error(message, defaultOptions);
      break;
    case 'loading':
      toastId = toast.loading(message, defaultOptions);
      break;
    default:
      toastId = toast(message, defaultOptions);
  }
  
  return toastId;
};

/**
 * Update an existing toast
 * @param {string} toastId - The ID of the toast to update
 * @param {string} message - The new message
 * @param {string} type - The new type
 * @param {Object} options - Additional toast options
 */
export const updateToast = (toastId, message, type = 'default', options = {}) => {
  if (!toastId) return;
  
  switch (type) {
    case 'success':
      toast.success(message, { id: toastId, ...options });
      break;
    case 'error':
      toast.error(message, { id: toastId, ...options });
      break;
    default:
      toast(message, { id: toastId, ...options });
  }
};

/**
 * Dismiss a toast
 * @param {string} toastId - The ID of the toast to dismiss
 */
export const dismissToast = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  }
};

/**
 * Dismiss all toasts and clear the active toasts tracking
 */
export const dismissAllToasts = () => {
  toast.dismiss();
  activeToasts.clear();
};
