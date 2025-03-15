/**
 * Share Modal Handler
 * 
 * This script safely attaches event listeners to share buttons in the DOM,
 * handling both initial load and dynamically injected elements.
 */

(function() {
  // Initialize as soon as possible and periodically retry to catch React hydration
  initOnLoad();
  
  function initOnLoad() {
    // Try now if DOM is already loaded
    if (document.readyState !== 'loading') {
      setupShareButtons();
      observeDOM();
    } else {
      // Wait for DOM content loaded if not ready yet
      document.addEventListener('DOMContentLoaded', function() {
        setupShareButtons();
        observeDOM();
      });
    }
    
    // Also try after a short delay to catch React hydration
    setTimeout(setupShareButtons, 500);
    setTimeout(setupShareButtons, 1000);
    setTimeout(setupShareButtons, 2000);
  }
  
  // Use MutationObserver to watch for new buttons
  function observeDOM() {
    if (!window.MutationObserver) return;
    
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          setupShareButtons();
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Set up share buttons by finding them and attaching event listeners
  function setupShareButtons() {
    const shareButtons = document.querySelectorAll('.share-button');
    
    if (!shareButtons || shareButtons.length === 0) return;
    
    shareButtons.forEach(function(button) {
      // Skip if already initialized
      if (button.getAttribute('data-share-initialized') === 'true') return;
      
      // Store original click handler
      const originalOnClick = button.onclick;
      
      // Override onclick
      button.onclick = function(e) {
        // Prevent the event from propagating further if we handle it
        if (handleShare(e)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        
        // Otherwise, call the original handler if it exists
        if (typeof originalOnClick === 'function') {
          return originalOnClick.call(this, e);
        }
      };
      
      // Mark as initialized to avoid duplicate handlers
      button.setAttribute('data-share-initialized', 'true');
      console.log('Share button initialized');
    });
  }
  
  // Handle share functionality
  function handleShare(e) {
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
      return true;
    } else {
      // Fallback for browsers without Web Share API
      console.log('Web Share API not supported');
      alert('Copy this link to share: ' + window.location.href);
      return true;
    }
    
    // Return false if we couldn't handle it
    return false;
  }
})(); 