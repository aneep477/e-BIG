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

function getUniqueFilters() {
    uniqueClasses = [...new Set(students.map(student => student.kelas).filter(Boolean))].sort();
    uniqueSeries = [...new Set(students.map(student => student.siri_big).filter(Boolean))].sort();
}

function loadFilterOptions() {
    getUniqueFilters();
    const classFilter = document.getElementById('classFilter');
    const seriesFilter = document.getElementById('seriesFilter');
    classFilter.innerHTML = '<option value="">Semua Kelas</option>';
    seriesFilter.innerHTML = '<option value="">Semua Siri</option>';
    uniqueClasses.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        classFilter.appendChild(option);
    });
    uniqueSeries.forEach(series => {
        const option = document.createElement('option');
        option.value = series;
        option.textContent = series;
        seriesFilter.appendChild(option);
    });
}

function loadStudents(studentsToLoad = students) {
    const studentSelect = document.getElementById('studentSelect');
    studentSelect.innerHTML = '<option value="" selected disabled>Pilih seorang pelajar</option>';
    studentsToLoad.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.a_giliran})`;
        studentSelect.appendChild(option);
    });
}

function applyFilters() {
    const classFilter = document.getElementById('classFilter').value;
    const seriesFilter = document.getElementById('seriesFilter').value;
    filteredStudents = students.filter(student => {
        const matchClass = !classFilter || (student.kelas && student.kelas === classFilter);
        const matchSeries = !seriesFilter || (student.siri_big && student.siri_big === seriesFilter);
        return matchClass && matchSeries;
    });
    loadStudents(filteredStudents);
    document.getElementById('studentSelect').value = "";
    onStudentSelectChange();
}

function onStudentSelectChange() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudentId = parseInt(studentSelect.value);
    const studentInfoDiv = document.getElementById('studentInfo');
    const rubricForm = document.getElementById('rubricForm');
    const resultDiv = document.getElementById('result');

    if (selectedStudentId) {
        const selectedStudent = students.find(student => student.id === selectedStudentId);
        if (selectedStudent) {
            document.getElementById('selectedStudentName').textContent = selectedStudent.name;
            document.getElementById('selectedStudentIC').textContent = selectedStudent.ic;
            document.getElementById('selectedStudentAGiliran').textContent = selectedStudent.a_giliran;
            document.getElementById('selectedStudentClass').textContent = selectedStudent.kelas || 'Tiada Maklumat';
            document.getElementById('selectedStudentSeries').textContent = selectedStudent.siri_big || 'Tiada Maklumat';
            studentInfoDiv.style.display = 'block';
            rubricForm.style.display = 'block';
            loadDataForStudent(selectedStudentId);
        }
    } else {
        studentInfoDiv.style.display = 'none';
        rubricForm.style.display = 'none';
        resultDiv.style.display = 'none';
    }
}

function resetForm() {
    document.getElementById('rubricForm').reset();
    document.getElementById('scoreHP4').textContent = '0.00';
    document.getElementById('scoreHP5').textContent = '0.00';
    document.getElementById('scoreAmali2').textContent = '0.00';
    document.getElementById('scoreExam').textContent = '0.00';
    document.getElementById('totalScore').textContent = '0.00';
    document.getElementById('grade').textContent = '-';
}

function calculateWeightedScore(rawScore, maxRawScore, weightPercentage) {
    if (isNaN(rawScore) || rawScore < 0) return 0;
    if (rawScore > maxRawScore) rawScore = maxRawScore;
    return (rawScore / maxRawScore) * weightPercentage;
}

function determineGrade(totalScore) {
     const score = parseFloat(totalScore);
     if (isNaN(score)) return 'Tidak Sah';
     for (const gradeInfo of GRADE_SCALE) {
         if (score >= gradeInfo.minScore) {
             return gradeInfo.grade;
         }
     }
     return 'Tidak Sah';
}

function calculateScore() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudentId = parseInt(studentSelect.value);
    if (!selectedStudentId) return;

    const selectedStudent = students.find(student => student.id === selectedStudentId);
    if (!selectedStudent) return;

    const organizingA4 = parseFloat(document.getElementById('organizingA4').value) || 0;
    const positiveBehaviorKMI3 = parseFloat(document.getElementById('positiveBehaviorKMI3').value) || 0;
    // ... (bahagian pengiraan lain kekal sama)
}

async function saveData() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudentId = parseInt(studentSelect.value);
    // ... (kandungan fungsi saveData kekal sama)
}

async function loadDataForStudent(studentId) {
    resetForm();
    document.getElementById('result').style.display = 'none';
    // ... (kandungan fungsi loadDataForStudent kekal sama)
}


document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.getElementById('loginContainer');
    const mainContent = document.getElementById('mainContent');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');

    function initializeApp() {
        console.log("Aplikasi dimulakan...");
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
            // **BARIS YANG HILANG SEBELUM INI TELAH DITAMBAH SEMULA**
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
