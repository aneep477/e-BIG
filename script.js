// GANTIKAN DENGAN KATA LALUAN RAHSIA ANDA
const CORRECT_PASSWORD = "ukobig"; 

// Fungsi untuk memaparkan notifikasi toast
function showToast(title, message, isError = false) {
    const toastElement = document.getElementById('liveToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const toastHeader = toastElement.querySelector('.toast-header');
    toastTitle.textContent = title;
    toastBody.textContent = message;
    if (isError) {
        toastHeader.classList.remove('bg-success', 'text-white');
        toastHeader.classList.add('bg-danger', 'text-white');
    } else {
        toastHeader.classList.remove('bg-danger', 'text-white');
        toastHeader.classList.add('bg-success', 'text-white');
    }
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Jadual Gred
const GRADE_SCALE = [
  { minScore: 90, grade: 'A+' }, { minScore: 80, grade: 'A' },
  { minScore: 75, grade: 'A-' }, { minScore: 70, grade: 'B+' },
  { minScore: 65, grade: 'B' }, { minScore: 60, grade: 'B-' },
  { minScore: 55, grade: 'C+' }, { minScore: 50, grade: 'C' },
  { minScore: 40, grade: 'C-' }, { minScore: 30, grade: 'D+' },
  { minScore: 20, grade: 'D' }, { minScore: 0, grade: 'F' }
];

// URL Apps Script anda
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzo_nfMUAWyBstQdpsPFlL2l1cwhsLrPyUfKvOgFzeICQ7kg7XgcOaHFmDIErkvZNb3/exec';

let filteredStudents = [];
let uniqueClasses = [];
let uniqueSeries = [];

function getUniqueFilters() { /* ... Tiada Perubahan ... */ }
function loadFilterOptions() { /* ... Tiada Perubahan ... */ }
function loadStudents(studentsToLoad = students) { /* ... Tiada Perubahan ... */ }
function applyFilters() { /* ... Tiada Perubahan ... */ }
function onStudentSelectChange() { /* ... Tiada Perubahan ... */ }
function resetForm() { /* ... Tiada Perubahan ... */ }
function calculateWeightedScore(rawScore, maxRawScore, weightPercentage) { /* ... Tiada Perubahan ... */ }
function determineGrade(totalScore) { /* ... Tiada Perubahan ... */ }
function calculateScore() { /* ... Tiada Perubahan ... */ }
async function saveData() { /* ... Tiada Perubahan ... */ }
async function loadDataForStudent(studentId) { /* ... Tiada Perubahan ... */ }


// Listener utama apabila halaman telah dimuatkan sepenuhnya
document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.getElementById('loginContainer');
    const mainContent = document.getElementById('mainContent');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');

    // ** BARU: Fungsi untuk mengaktifkan aplikasi utama **
    function initializeApp() {
        console.log("Aplikasi dimulakan..."); // Mesej untuk pengesahan
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
    }

    function handleLogin() {
        if (passwordInput.value === CORRECT_PASSWORD) {
            loginContainer.classList.add('d-none');
            mainContent.classList.remove('d-none');
            // ** PERUBAHAN UTAMA: Panggil fungsi initializeApp di sini **
            initializeApp(); 
        } else {
            showToast("Gagal", "Kata laluan salah. Sila cuba lagi.", true);
            passwordInput.value = "";
        }
    }

    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            handleLogin();
        }
    });
});
