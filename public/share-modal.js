// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Function to initialize share buttons
  function initShareButtons() {
    const shareButtons = document.querySelectorAll('.share-button');
    
    if (shareButtons && shareButtons.length > 0) {
      shareButtons.forEach(button => {
        button.addEventListener('click', handleShare);
      });
      console.log('Share buttons initialized');
    } else {
      // If buttons aren't found yet, try again after a delay
      setTimeout(initShareButtons, 1000);
    }
  }
  
  // Handle share functionality
  function handleShare(e) {
    e.preventDefault();
    
    const shareData = {
      title: 'Govindo Tea Stall - Tournament',
      text: 'Check out this tournament!',
      url: window.location.href
    };
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => console.log('Shared successfully'))
        .catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers without Web Share API
      console.log('Web Share API not supported');
      // Could implement a custom share modal here
      alert('Copy this link to share: ' + window.location.href);
    }
  }
  
  // Initialize share buttons
  initShareButtons();
}); 