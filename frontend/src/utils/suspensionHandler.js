import { clearSession } from './auth';
import { toast } from 'sonner';

let countdownToastId = null;
let countdownInterval = null;

/**
 * Show account suspension countdown toast
 * @param {string} reason - Suspension reason (ACCOUNT_DISABLED, ACCOUNT_DELETED, etc.)
 */
export const showSuspensionCountdown = (reason = 'ACCOUNT_DISABLED') => {
  // Prevent multiple countdowns
  if (countdownInterval) {
    return;
  }

  const messages = {
    ACCOUNT_DISABLED: 'Votre compte a été désactivé par un administrateur',
    ACCOUNT_DELETED: 'Votre compte a été supprimé',
    ACCOUNT_LOCKED: 'Votre compte a été verrouillé',
    ACCOUNT_NOT_APPROVED: 'Votre compte est en attente d\'approbation',
    ACCOUNT_NOT_FOUND: 'Compte introuvable'
  };

  const message = messages[reason] || 'Accès au compte refusé';
  let countdown = 10;

  // Initial toast
  countdownToastId = toast.error(
    `${message}. Redirection dans ${countdown}s...`,
    { duration: Infinity }
  );

  // Countdown interval
  countdownInterval = setInterval(() => {
    countdown--;
    
    if (countdown > 0) {
      // Update toast
      toast.error(
        `${message}. Redirection dans ${countdown}s...`,
        { id: countdownToastId, duration: Infinity }
      );
    } else {
      // Countdown finished
      clearInterval(countdownInterval);
      countdownInterval = null;
      
      // Dismiss toast
      toast.dismiss(countdownToastId);
      
      // Clear session and redirect
      clearSession();
      window.location.href = '/login';
    }
  }, 1000);
};

/**
 * Cancel ongoing countdown (if user logs out manually, etc.)
 */
export const cancelSuspensionCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  if (countdownToastId) {
    toast.dismiss(countdownToastId);
    countdownToastId = null;
  }
};