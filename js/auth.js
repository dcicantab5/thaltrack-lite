// Authentication handling for ThalTrack Lite

document.addEventListener('DOMContentLoaded', () => {
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
      loginError.classList.add('d-none');
      
      try {
        // Call the API to validate user
        // Note: In a real app, you'd use proper authentication, not just email validation
        const response = await ThalTrackApp.callAPI('loginUser', { email });
        
        if (response.status === 'success' && response.pengguna) {
          // Store user data in local storage
          ThalTrackApp.saveUserData(response.pengguna);
          
          // Redirect to dashboard
          window.location.href = 'dashboard.html';
        } else {
          // Show error message
          loginError.classList.remove('d-none');
        }
      } catch (error) {
        console.error('Login error:', error);
        loginError.classList.remove('d-none');
      }
    });
  }
  
  // For demo/development purposes - implement a simple login bypass
  // IMPORTANT: Remove this in production!
  if (loginForm && window.location.hostname === 'localhost') {
    // Add a debug button to bypass login (only in development)
    const debugLoginBtn = document.createElement('button');
    debugLoginBtn.textContent = 'Dev Login';
    debugLoginBtn.className = 'btn btn-warning btn-sm mt-3';
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
});
