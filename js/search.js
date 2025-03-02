// Search functionality for ThalTrack Lite

document.addEventListener('DOMContentLoaded', () => {
  // Get form elements
  const icSearchForm = document.getElementById('icSearchForm');
  const nameSearchForm = document.getElementById('nameSearchForm');
  const searchResults = document.getElementById('searchResults');
  const resultsTable = document.getElementById('resultsTable');
  const noResults = document.getElementById('noResults');
  
  // Handle IC search form submission
  if (icSearchForm) {
    icSearchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const icNumber = document.getElementById('icNumber').value.trim();
      if (!icNumber) return;
      
      try {
        // Show loading indicator (could be added to HTML)
        // hideResults();
        
        // Call API to search for student by IC
        const response = await ThalTrackApp.callAPI('cariPelajarIC', { ic: icNumber });
        
        if (response.status === 'success' && response.pelajar) {
          // Display the result
          displaySearchResults([{
            id: response.pelajar.id,
            nama: response.pelajar.nama,
            ic: response.pelajar.ic,
            sekolah: response.pelajar.sekolah,
            status: response.pelajar.status
          }]);
          
          // Add to recent searches
          ThalTrackApp.addRecentSearch({
            id: response.pelajar.id,
            nama: response.pelajar.nama,
            ic: response.pelajar.ic,
            sekolah: response.pelajar.sekolah,
            status: response.pelajar.status
          });
        } else {
          // No results found
          showNoResults();
        }
      } catch (error) {
        console.error('Search error:', error);
        showNoResults();
      }
    });
  }
  
  // Handle name search form submission
  if (nameSearchForm) {
    nameSearchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const studentName = document.getElementById('studentName').value.trim();
      if (!studentName || studentName.length < 3) {
        alert('Sila masukkan sekurang-kurangnya 3 huruf untuk carian nama.');
        return;
      }
      
      try {
        // For name search, we would ideally have a specific API endpoint
        // For this demo, we'll just use the list students API and filter client-side
        // In a real app, you should implement server-side filtering
        
        // Call API to get all students (in real app, would be filtered server-side)
        const response = await ThalTrackApp.callAPI('senaraiPelajar');
        
        if (response.status === 'success' && response.data) {
          // Filter students by name (case-insensitive partial match)
          const nameFilter = studentName.toLowerCase();
          const filteredResults = response.data.filter(student => 
            student.nama && student.nama.toLowerCase().includes(nameFilter)
          );
          
          if (filteredResults.length > 0) {
            displaySearchResults(filteredResults);
          } else {
            showNoResults();
          }
        } else {
          showNoResults();
        }
      } catch (error) {
        console.error('Name search error:', error);
        showNoResults();
      }
    });
  }
  
  // Function to display search results
  function displaySearchResults(students) {
    if (!searchResults || !resultsTable || !noResults) return;
    
    // Hide no results message
    noResults.classList.add('d-none');
    
    // Clear previous results
    resultsTable.innerHTML = '';
    
    // Add each student to the table
    students.forEach(student => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.nama || '-'}</td>
        <td>${student.ic || '-'}</td>
        <td>${student.sekolah || '-'}</td>
        <td><span class="badge ${student.status === 'Aktif' ? 'bg-success' : 'bg-secondary'}">${student.status || '-'}</span></td>
        <td>
          <a href="detail.html?ic=${student.ic}" class="btn btn-sm btn-primary">Lihat</a>
        </td>
      `;
      resultsTable.appendChild(row);
    });
    
    // Show results section
    searchResults.classList.remove('d-none');
  }
  
  // Function to show no results message
  function showNoResults() {
    if (!searchResults || !noResults) return;
    
    // Clear results table
    if (resultsTable) resultsTable.innerHTML = '';
    
    // Show no results message
    noResults.classList.remove('d-none');
    
    // Show results section (which contains the no results message)
    searchResults.classList.remove('d-none');
  }
  
  // Function to hide results section
  function hideResults() {
    if (searchResults) searchResults.classList.add('d-none');
    if (noResults) noResults.classList.add('d-none');
  }
});
