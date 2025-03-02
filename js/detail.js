// Student detail page functionality for ThalTrack Lite

document.addEventListener('DOMContentLoaded', () => {
  // Get page elements
  const loadingIndicator = document.getElementById('loadingIndicator');
  const errorMessage = document.getElementById('errorMessage');
  const studentNotFound = document.getElementById('studentNotFound');
  const studentDetails = document.getElementById('studentDetails');
  const noScreeningData = document.getElementById('noScreeningData');
  const screeningData = document.getElementById('screeningData');
  const updateStatusForm = document.getElementById('updateStatusForm');
  const updateSuccess = document.getElementById('updateSuccess');
  const updateError = document.getElementById('updateError');
  const generateQRBtn = document.getElementById('generateQRBtn');
  const qrCodeModal = new bootstrap.Modal(document.getElementById('qrCodeModal'));
  
  // Get student IC from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const studentIC = urlParams.get('ic');
  
  // If no IC parameter, show error
  if (!studentIC) {
    hideLoading();
    showError('Tiada nombor IC diberikan');
    return;
  }
  
  // Load student data
  loadStudentData(studentIC);
  
  // Handle generate QR code button
  if (generateQRBtn) {
    generateQRBtn.addEventListener('click', async () => {
      try {
        // Get QR code from API
        const response = await ThalTrackApp.callAPI('janaQR', { ic: studentIC });
        
        if (response.status === 'success' && response.qrCodeUrl) {
          // Display QR code in modal
          document.getElementById('qrCodeImage').innerHTML = `
            <img src="${response.qrCodeUrl}" alt="QR Code" class="img-fluid">
          `;
          
          // Set student info in modal
          document.getElementById('qrCodeName').textContent = document.getElementById('studentName').textContent;
          document.getElementById('qrCodeIC').textContent = studentIC;
          
          // Show the modal
          qrCodeModal.show();
          
          // Handle download QR code button
          document.getElementById('downloadQRBtn').onclick = () => {
            const link = document.createElement('a');
            link.href = response.qrCodeUrl;
            link.download = `QRCode-${studentIC}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };
        } else {
          alert('Tidak dapat menjana QR kod. Sila cuba lagi.');
        }
      } catch (error) {
        console.error('Error generating QR code:', error);
        alert('Ralat: Tidak dapat menjana QR kod.');
      }
    });
  }
  
  // Handle update status form submission
  if (updateStatusForm) {
    updateStatusForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Hide previous messages
      updateSuccess.classList.add('d-none');
      updateError.classList.add('d-none');
      
      // Get form data
      const screeningId = document.getElementById('screeningId').value;
      const newStatus = document.getElementById('newStatus').value;
      const newNotes = document.getElementById('newNotes').value;
      
      // Validate data
      if (!screeningId || !newStatus) {
        updateError.textContent = 'Sila lengkapkan semua maklumat yang diperlukan.';
        updateError.classList.remove('d-none');
        return;
      }
      
      try {
        // Get user data for ID
        const userData = ThalTrackApp.getUserData();
        if (!userData || !userData.id) {
          throw new Error('User data not found');
        }
        
        // Call API to update status
        const response = await ThalTrackApp.callAPI('kemaskiniStatus', {
          id: screeningId,
          status: newStatus,
          catatan: newNotes,
          pengemas: userData.id
        });
        
        if (response.status === 'success') {
          // Show success message
          updateSuccess.classList.remove('d-none');
          
          // Update displayed status values
          document.getElementById('actionStatus').textContent = newStatus;
          document.getElementById('actionStatus').className = `badge ${getStatusBadgeClass(newStatus)}`;
          document.getElementById('screeningNotes').textContent = newNotes || '-';
          document.getElementById('updateDate').textContent = ThalTrackApp.formatDate(new Date());
          
          // Reset form selection
          document.getElementById('newStatus').selectedIndex = 0;
          document.getElementById('newNotes').value = '';
          
          // Scroll to success message
          updateSuccess.scrollIntoView({ behavior: 'smooth' });
          
          // Hide success message after 3 seconds
          setTimeout(() => {
            updateSuccess.classList.add('d-none');
          }, 3000);
        } else {
          throw new Error(response.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Error updating status:', error);
        updateError.textContent = `Ralat: ${error.message || 'Tidak dapat mengemaskini status. Sila cuba lagi.'}`;
        updateError.classList.remove('d-none');
      }
    });
  }
  
  // Function to load student data
  async function loadStudentData(ic) {
    try {
      // Call API to get student data
      const response = await ThalTrackApp.callAPI('cariPelajarIC', { ic });
      
      if (response.status === 'success' && response.pelajar) {
        // Add to recent searches
        ThalTrackApp.addRecentSearch({
          id: response.pelajar.id,
          nama: response.pelajar.nama,
          ic: response.pelajar.ic,
          sekolah: response.pelajar.sekolah,
          status: response.pelajar.status
        });
        
        // Populate student personal information
        document.getElementById('studentName').textContent = response.pelajar.nama || '-';
        document.getElementById('studentIC').textContent = response.pelajar.ic || '-';
        document.getElementById('studentDOB').textContent = ThalTrackApp.formatDate(response.pelajar.tarikhLahir) || '-';
        document.getElementById('studentGender').textContent = response.pelajar.jantina || '-';
        document.getElementById('studentSchool').textContent = response.pelajar.sekolah || '-';
        document.getElementById('studentClass').textContent = response.pelajar.kelas || '-';
        
        // Set student status with appropriate badge color
        const studentStatus = document.getElementById('studentStatus');
        studentStatus.textContent = response.pelajar.status || '-';
        studentStatus.className = 'badge ' + (response.pelajar.status === 'Aktif' ? 'bg-success' : 'bg-secondary');
        
        // Check if screening data exists
        if (response.saringan) {
          // Hide no screening data message
          noScreeningData.classList.add('d-none');
          
          // Populate screening information
          document.getElementById('screeningDate').textContent = ThalTrackApp.formatDate(response.saringan.tarikhSaringan) || '-';
          document.getElementById('screeningResult').textContent = response.saringan.keputusan || '-';
          document.getElementById('screeningNotes').textContent = response.saringan.catatan || '-';
          document.getElementById('updateDate').textContent = ThalTrackApp.formatDate(response.saringan.tarikhKemaskini) || '-';
          
          // Set status badge
          const actionStatus = document.getElementById('actionStatus');
          actionStatus.textContent = response.saringan.statusTindakan || '-';
          actionStatus.className = 'badge ' + getStatusBadgeClass(response.saringan.statusTindakan);
          
          // Set screening ID for update form
          document.getElementById('screeningId').value = response.saringan.idSaringan;
          
          // Show screening data section
          screeningData.classList.remove('d-none');
        } else {
          // Hide screening data section and show no data message
          screeningData.classList.add('d-none');
          noScreeningData.classList.remove('d-none');
        }
        
        // Show student details section
        hideLoading();
        studentDetails.classList.remove('d-none');
      } else {
        // Student not found
        hideLoading();
        studentNotFound.classList.remove('d-none');
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      hideLoading();
      showError('Tidak dapat memuat maklumat pelajar');
    }
  }
  
  // Helper function to get badge class based on status
  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Belum Diproses':
        return 'bg-secondary';
      case 'Dalam Proses':
        return 'bg-primary';
      case 'Rujuk Hospital':
        return 'bg-warning text-dark';
      case 'Selesai':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }
  
  // Helper function to hide loading indicator
  function hideLoading() {
    if (loadingIndicator) loadingIndicator.classList.add('d-none');
  }
  
  // Helper function to show error message
  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.classList.remove('d-none');
    }
  }
});
