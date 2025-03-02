// QR code scanner functionality for ThalTrack Lite

document.addEventListener('DOMContentLoaded', () => {
  // Get elements
  const startScanBtn = document.getElementById('startScanBtn');
  const stopScanBtn = document.getElementById('stopScanBtn');
  const qrScannerContainer = document.getElementById('qrScannerContainer');
  const cameraPermissionError = document.getElementById('cameraPermissionError');
  const scanResult = document.getElementById('scanResult');
  const scanResultText = document.getElementById('scanResultText');
  const scanError = document.getElementById('scanError');
  const manualCodeForm = document.getElementById('manualCodeForm');
  
  let html5QrCode;
  let isScanning = false;
  
  // Initialize QR scanner
  function initScanner() {
    html5QrCode = new Html5Qrcode("qrScanner");
  }
  
  // Start scanning
  function startScanning() {
    if (!html5QrCode) {
      initScanner();
    }
    
    const qrCodeSuccessCallback = (decodedText) => {
      // Stop scanning
      stopScanning();
      
      // Parse the QR code
      parseQRCode(decodedText);
    };
    
    const config = { fps: 10 };
    
    // Start scanning with rear camera
    html5QrCode.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback,
      (errorMessage) => {
        // Error callback
        console.log(errorMessage);
      }
    ).then(() => {
      isScanning = true;
      startScanBtn.classList.add('d-none');
      stopScanBtn.classList.remove('d-none');
    }).catch((err) => {
      console.error(`QR Scanner error: ${err}`);
      cameraPermissionError.classList.remove('d-none');
    });
  }
  
  // Stop scanning
  function stopScanning() {
    if (html5QrCode && isScanning) {
      html5QrCode.stop().then(() => {
        isScanning = false;
        startScanBtn.classList.remove('d-none');
        stopScanBtn.classList.add('d-none');
      }).catch((err) => {
        console.error(`Error stopping scanner: ${err}`);
      });
    }
  }
  
  // Parse QR code
  function parseQRCode(decodedText) {
    try {
      // Hide previous results/errors
      scanResult.classList.add('d-none');
      scanError.classList.add('d-none');
      
      // For our format, QR codes start with "THALTRACK:"
      if (decodedText.startsWith('THALTRACK:')) {
        // Extract IC number
        const icNumber = decodedText.substring(10);
        
        // Display result
        scanResultText.textContent = icNumber;
        scanResult.classList.remove('d-none');
        
        // Wait a moment, then redirect to student details
        setTimeout(() => {
          window.location.href = `detail.html?ic=${encodeURIComponent(icNumber)}`;
        }, 1500);
      } else {
        // Invalid QR code format
        scanError.classList.remove('d-none');
      }
    } catch (error) {
      console.error('Error parsing QR code:', error);
      scanError.classList.remove('d-none');
    }
  }
  
  // Handle start scan button
  if (startScanBtn) {
    startScanBtn.addEventListener('click', () => {
      startScanning();
    });
  }
  
  // Handle stop scan button
  if (stopScanBtn) {
    stopScanBtn.addEventListener('click', () => {
      stopScanning();
    });
  }
  
  // Handle manual code entry form
  if (manualCodeForm) {
    manualCodeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const manualIC = document.getElementById('manualIC').value.trim();
      if (manualIC) {
        window.location.href = `detail.html?ic=${encodeURIComponent(manualIC)}`;
      }
    });
  }
  
  // Initialize scanner if container exists
  if (qrScannerContainer) {
    initScanner();
    
    // Start scanning automatically if possible
    if (window.location.search.includes('autostart=true')) {
      startScanning();
    }
  }
  
  // Cleanup when leaving page
  window.addEventListener('beforeunload', () => {
    stopScanning();
  });
});
