// Authentication handling for ThalTrack Lite

document.addEventListener('DOMContentLoaded', () => {
  // Fix: Check if we're on the login page before proceeding
  const currentPath = window.location.pathname;
  const basePath = currentPath.substring(currentPath.lastIndexOf('/') + 1);
  
  // Only run login page code if we're actually on login page
  if (basePath === 'login.html' || basePath === '') {
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get input values
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Hide previous error message
        const loginError = document.getElementById('loginError');
        if (loginError) {
          loginError.classList.add('d-none');
        }
        
        try {
          // Call the API to validate user
          // Note: In a real app, you'd use proper authentication, not just email validation
          const response = await ThalTrackApp.callAPI('loginUser', { email });
          
          if (response && response.status === 'success' && response.pengguna) {
            // Store user data in local storage
            ThalTrackApp.saveUserData(response.pengguna);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
          } else {
            // Show error message
            if (loginError) {
              loginError.classList.remove('d-none');
            }
          }
        } catch (error) {
          console.error('Login error:', error);
          // Fix: Check if element exists before manipulating
          if (loginError) {
            loginError.classList.remove('d-none');
          }
        }
      });
    }
    
    // For demo/development purposes - implement a simple login bypass
    // IMPORTANT: Remove this in production!
    if (loginForm && (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io'))) {
      // Add a debug button to bypass login (only in development)
      const debugLoginBtn = document.createElement('button');
      debugLoginBtn.textContent = 'Dev Login';
      debugLoginBtn.className = 'btn btn-warning btn-sm mt-3';
      debugLoginBtn.type = 'button'; // Fix: Specify button type to avoid form submission
      debugLoginBtn.addEventListener('click', () => {
        // Set demo user data
        const demoUser = {
          id: 'demo1',
          email: 'demo@jknselangor.gov.my',
          nama: 'Demo User',
          peranan: 'Petugas'
        };
        ThalTrackApp.saveUserData(demoUser);
        window.location.href = 'dashboard.html';
      });
      
      loginForm.appendChild(debugLoginBtn);
    }
    
    // Fix: If user is already logged in and they visit login page, redirect to dashboard
    if (ThalTrackApp.isLoggedIn()) {
      window.location.href = 'dashboard.html';
    }
  }
});
