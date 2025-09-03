// GANTIKAN DENGAN KATA LALUAN RAHSIA ANDA
const CORRECT_PASSWORD = "ukobig"; 

// Fungsi untuk memaparkan notifikasi toast
function showToast(title, message, isError = false) {
    // ... (kod fungsi showToast anda kekal di sini, tiada perubahan) ...
}

// Jadual Gred
const GRADE_SCALE = [
    // ... (kod jadual gred anda kekal di sini, tiada perubahan) ...
];

// URL Apps Script anda
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzo_nfMUAWyBstQdpsPFlL2l1cwhsLrPyUfKvOgFzeICQ7kg7XgcOaHFmDIErkvZNb3/exec';

let filteredStudents = [];
let uniqueClasses = [];
let uniqueSeries = [];

// ... (semua fungsi lain dari 'getUniqueFilters' hingga 'loadDataForStudent' kekal sama, tiada perubahan) ...

// Listener utama apabila halaman telah dimuatkan sepenuhnya
document.addEventListener('DOMContentLoaded', function() {
    // --- BAHAGIAN LOG MASUK BARU ---
    const loginContainer = document.getElementById('loginContainer');
    const mainContent = document.getElementById('mainContent');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');

    function handleLogin() {
        if (passwordInput.value === CORRECT_PASSWORD) {
            loginContainer.classList.add('d-none'); // Sembunyikan borang log masuk
            mainContent.classList.remove('d-none'); // Paparkan kandungan utama
        } else {
            showToast("Gagal", "Kata laluan salah. Sila cuba lagi.", true);
            passwordInput.value = ""; // Kosongkan medan kata laluan
        }
    }

    // Log masuk apabila butang ditekan
    loginBtn.addEventListener('click', handleLogin);

    // Log masuk apabila kekunci 'Enter' ditekan
    passwordInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            handleLogin();
        }
    });
    
    // --- AKHIR BAHAGIAN LOG MASUK ---

    // Kod sedia ada anda untuk memuatkan aplikasi
    loadFilterOptions();
    loadStudents();
    document.getElementById('studentSelect').addEventListener('change', onStudentSelectChange);
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
    document.getElementById('saveDataBtn').addEventListener('click', saveData);
    document.getElementById('calculateScoreBtn').addEventListener('click', calculateScore);
    
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
       exportBtn.textContent = "Buka Pangkalan Data (Google Sheet)";
       exportBtn.addEventListener('click', () => {
            window.open('https://docs.google.com/spreadsheets/d/1JBj4FjkTCWCbqgUh_ZEDfKsCNrmMVTH60MgxutTUfnA/edit?gid=1084341755#gid=1084341755', '_blank');
       });
    }
});
