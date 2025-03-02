// Main app.js file for ThalTrack Lite

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Constants and configuration
const CONFIG = {
  // Replace with your Google Apps Script URL from Step 1
  API_URL: 'https://script.google.com/macros/s/AKfycbz8YcURyoJksFI3lXYMUsKYytWCbDLsq0Azgz4cdH_hNtsBBV19T5X5rACojZXsu8RQDg/exec',
  APP_VERSION: '1.0.0',
  STORAGE_KEYS: {
    USER_DATA: 'thaltrack_user_data',
    RECENT_SEARCHES: 'thaltrack_recent_searches'
  }
};

// Helper functions for common tasks
const ThalTrackApp = {
  // Check if user is logged in
  isLoggedIn() {
    const userData = this.getUserData();
    return userData !== null;
  },
  
  // Get user data from local storage
  getUserData() {
    const userDataStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
    if (userDataStr) {
      try {
        return JSON.parse(userDataStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  },
  
  // Save user data to local storage
  saveUserData(userData) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  },
  
  // Clear user data from local storage
  clearUserData() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
  },
  
  // Get recent searches from local storage
  getRecentSearches() {
    const searches = localStorage.getItem(CONFIG.STORAGE_KEYS.RECENT_SEARCHES);
    if (searches) {
      try {
        return JSON.parse(searches);
      } catch (e) {
        console.error('Error parsing recent searches:', e);
        return [];
      }
    }
    return [];
  },
  
  // Add a search to recent searches
  addRecentSearch(student) {
    let searches = this.getRecentSearches();
    
    // Check if this student is already in recent searches
    const existingIndex = searches.findIndex(s => s.ic === student.ic);
    if (existingIndex !== -1) {
      // Remove existing entry
      searches.splice(existingIndex, 1);
    }
    
    // Add to the beginning of the array
    searches.unshift(student);
    
    // Keep only the 10 most recent searches
    if (searches.length > 10) {
      searches = searches.slice(0, 10);
    }
    
    // Save to local storage
    localStorage.setItem(CONFIG.STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches));
  },
  
  // Redirect to login if not authenticated
  requireAuth() {
    if (!this.isLoggedIn()) {
      // Fix: Check if we're already on the login page to prevent redirect loop
      if (window.location.pathname !== '/login.html' && 
          !window.location.pathname.endsWith('/login.html')) {
        window.location.href = 'login.html';
      }
      return false;
    }
    return true;
  },
  
  // Format date to local format
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Return original if invalid
    
    return date.toLocaleDateString('ms-MY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },
  
  // Make API call
  async callAPI(action, params = {}) {
    try {
      // Build URL with parameters
      let url = new URL(CONFIG.API_URL);
      url.searchParams.append('action', action);
      
      // Add all other parameters
      for (const key in params) {
        url.searchParams.append(key, params[key]);
      }
      
      // Make the fetch request
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  },
  
  // Update username display in navbar
  updateUserDisplay() {
    const userData = this.getUserData();
    if (userData) {
      const userDisplayElements = document.querySelectorAll('#userNameDisplay, #userGreeting');
      userDisplayElements.forEach(el => {
        if (el) el.textContent = userData.nama || 'Pengguna';
      });
    }
  }
};

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
  // Fix: Use a more robust way to check current page
  const currentPath = window.location.pathname;
  const basePath = currentPath.substring(currentPath.lastIndexOf('/') + 1);
  
  // Check if we're on a page that requires authentication
  if (basePath !== 'index.html' && 
      basePath !== '' && 
      basePath !== 'login.html') {
    
    // Check auth but don't redirect in this function to avoid potential loops
    const isAuthed = ThalTrackApp.isLoggedIn();
    
    if (isAuthed) {
      ThalTrackApp.updateUserDisplay();
      
      // Setup logout button
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          ThalTrackApp.clearUserData();
          window.location.href = 'login.html';
        });
      }
    } else {
      // Explicitly check current page isn't already login before redirecting
      if (basePath !== 'login.html') {
        window.location.href = 'login.html';
      }
    }
  }
  
  // If on dashboard, populate recent searches
  if (basePath === 'dashboard.html') {
    const recentSearchesTable = document.getElementById('recentSearchesTable');
    if (recentSearchesTable) {
      const searches = ThalTrackApp.getRecentSearches();
      
      if (searches.length > 0) {
        recentSearchesTable.innerHTML = '';
        
        searches.forEach(search => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${search.nama || '-'}</td>
            <td>${search.ic || '-'}</td>
            <td>${search.sekolah || '-'}</td>
            <td><span class="badge ${search.status === 'Aktif' ? 'bg-success' : 'bg-secondary'}">${search.status || '-'}</span></td>
            <td>
              <a href="detail.html?ic=${search.ic}" class="btn btn-sm btn-primary">Lihat</a>
            </td>
          `;
          recentSearchesTable.appendChild(row);
        });
      } else {
        recentSearchesTable.innerHTML = `
          <tr>
            <td colspan="5" class="text-center">Tiada carian terkini</td>
          </tr>
        `;
      }
    }
  }
});
