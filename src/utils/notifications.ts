export const vibrate = (pattern: number | number[] = [100]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

export const notifyTag = () => {
  // Single short vibration
  vibrate();
  
  // Simple notification without revealing who was tagged
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Status Changed', {
      body: 'Your game status has been updated.',
      icon: '/logo.svg',
      silent: true // Don't play system notification sound
    });
  }
};