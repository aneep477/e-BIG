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

let allStudents = [];
let filteredStudents = [];
let uniqueClasses = [];
let uniqueSeries = [];

function getUniqueFilters() {
    uniqueClasses = [...new Set(allStudents.map(student => student.kelas).filter(Boolean))].sort();
    uniqueSeries = [...new Set(allStudents.map(student => student.siri_big).filter(Boolean))].sort();
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

function loadStudents(studentsToLoad) {
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
    filteredStudents = allStudents.filter(student => {
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
        const selectedStudent = allStudents.find(student => student.id === selectedStudentId);
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

    const selectedStudent = allStudents.find(student => student.id === selectedStudentId);
    if (!selectedStudent) return;

    const organizingA4 = parseFloat(document.getElementById('organizingA4').value) || 0;
    const positiveBehaviorKMI3 = parseFloat(document.getElementById('positiveBehaviorKMI3').value) || 0;
    const organizingA4Comm = parseFloat(document.getElementById('organizingA4Comm').value) || 0;
    const nonVerbalCommKMK12 = parseFloat(document.getElementById('nonVerbalCommKMK12').value) || 0;
    const mechanismP4 = parseFloat(document.getElementById('mechanismP4').value) || 0;
    const valueAppreciationA5 = parseFloat(document.getElementById('valueAppreciationA5').value) || 0;
    const responsibilityKAT10 = parseFloat(document.getElementById('responsibilityKAT10').value) || 0;
    const examScore = parseFloat(document.getElementById('examScore').value) || 0;

    const scoreHP4 = calculateWeightedScore(organizingA4 + positiveBehaviorKMI3, 30, 30);
    const scoreHP5 = calculateWeightedScore(organizingA4Comm + nonVerbalCommKMK12, 30, 30);
    const scoreHP3 = calculateWeightedScore(mechanismP4, 15, 15);
    const scoreHP8 = calculateWeightedScore(valueAppreciationA5 + responsibilityKAT10, 30, 15);
    const scoreExam = calculateWeightedScore(examScore, 10, 10);
    const totalScore = scoreHP4 + scoreHP5 + scoreHP3 + scoreHP8 + scoreExam;
    const grade = determineGrade(totalScore);

    document.getElementById('resultStudentName').textContent = selectedStudent.name;
    document.getElementById('scoreHP4').textContent = scoreHP4.toFixed(2);
    document.getElementById('scoreHP5').textContent = scoreHP5.toFixed(2);
    document.getElementById('scoreAmali2').textContent = (scoreHP3 + scoreHP8).toFixed(2);
    document.getElementById('scoreExam').textContent = scoreExam.toFixed(2);
    document.getElementById('totalScore').textContent = totalScore.toFixed(2);
    document.getElementById('grade').textContent = grade;
    document.getElementById('result').style.display = 'block';
}

async function saveData() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudentId = parseInt(studentSelect.value);
    if (!selectedStudentId) {
        showToast("Ralat", "Sila pilih seorang pelajar dahulu.", true);
        return;
    }

    const selectedStudent = allStudents.find(student => student.id === selectedStudentId);
    if (!selectedStudent) {
        showToast("Ralat", "Maklumat pelajar tidak dijumpai.", true);
        return;
    }
    
    calculateScore();

    const dataToSave = {
        studentId: selectedStudentId,
        savedAt: new Date().toISOString(),
        name: selectedStudent.name,
        ic: selectedStudent.ic,
        a_giliran: selectedStudent.a_giliran,
        kelas: selectedStudent.kelas,
        siri_big: selectedStudent.siri_big,
        organizingA4: parseFloat(document.getElementById('organizingA4').value) || null,
        positiveBehaviorKMI3: parseFloat(document.getElementById('positiveBehaviorKMI3').value) || null,
        organizingA4Comm: parseFloat(document.getElementById('organizingA4Comm').value) || null,
        nonVerbalCommKMK12: parseFloat(document.getElementById('nonVerbalCommKMK12').value) || null,
        mechanismP4: parseFloat(document.getElementById('mechanismP4').value) || null,
        valueAppreciationA5: parseFloat(document.getElementById('valueAppreciationA5').value) || null,
        responsibilityKAT10: parseFloat(document.getElementById('responsibilityKAT10').value) || null,
        examScore: parseFloat(document.getElementById('examScore').value) || null,
        notesHP4: document.getElementById('notesHP4').value.trim(),
        notesHP5: document.getElementById('notesHP5').value.trim(),
        notesHP3: document.getElementById('notesHP3').value.trim(),
        notesHP8: document.getElementById('notesHP8').value.trim(),
        notesExam: document.getElementById('notesExam').value.trim(),
        scoreHP4: document.getElementById('scoreHP4').textContent,
        scoreHP5: document.getElementById('scoreHP5').textContent,
        scoreAmali2: document.getElementById('scoreAmali2').textContent,
        scoreExamWeighted: document.getElementById('scoreExam').textContent,
        totalScore: document.getElementById('totalScore').textContent,
        grade: document.getElementById('grade').textContent
    };

    const saveButton = document.getElementById('saveDataBtn');
    saveButton.disabled = true;
    saveButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Menyimpan...`;

    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave),
            redirect: 'follow'
        });
        showToast("Berjaya", `Data untuk ${selectedStudent.name} telah disimpan!`);
    } catch (error) {
        console.error('Error saving data:', error);
        showToast("Gagal", "Gagal menyimpan data. Sila semak sambungan internet anda.", true);
    } finally {
        saveButton.disabled = false;
        saveButton.innerHTML = 'Simpan Data';
    }
}

async function loadDataForStudent(studentId) {
    resetForm();
    document.getElementById('result').style.display = 'none';

    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?studentId=${studentId}`);
        const result = await response.json();

        if (result.result === 'success' && result.data) {
            const studentData = result.data;
            document.getElementById('organizingA4').value = studentData.organizingA4 !== null ? studentData.organizingA4 : '';
            document.getElementById('positiveBehaviorKMI3').value = studentData.positiveBehaviorKMI3 !== null ? studentData.positiveBehaviorKMI3 : '';
            document.getElementById('organizingA4Comm').value = studentData.organizingA4Comm !== null ? studentData.organizingA4Comm : '';
            document.getElementById('nonVerbalCommKMK12').value = studentData.nonVerbalCommKMK12 !== null ? studentData.nonVerbalCommKMK12 : '';
            document.getElementById('mechanismP4').value = studentData.mechanismP4 !== null ? studentData.mechanismP4 : '';
            document.getElementById('valueAppreciationA5').value = studentData.valueAppreciationA5 !== null ? studentData.valueAppreciationA5 : '';
            document.getElementById('responsibilityKAT10').value = studentData.responsibilityKAT10 !== null ? studentData.responsibilityKAT10 : '';
            document.getElementById('examScore').value = studentData.examScore !== null ? studentData.examScore : '';
            document.getElementById('notesHP4').value = studentData.notesHP4 || '';
            document.getElementById('notesHP5').value = studentData.notesHP5 || '';
            document.getElementById('notesHP3').value = studentData.notesHP3 || '';
            document.getElementById('notesHP8').value = studentData.notesHP8 || '';
            document.getElementById('notesExam').value = studentData.notesExam || '';
            calculateScore();
        } else {
            console.log("Tiada data sedia ada untuk pelajar ini.");
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

async function fetchStudents() {
    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getStudents`);
        const result = await response.json();
        if (result.result === 'success') {
            return result.data;
        } else {
            console.error('Gagal memuatkan senarai pelajar dari Google Sheet:', result.message);
            return []; // Kembalikan array kosong jika gagal
        }
    } catch (error) {
        console.error('Ralat semasa memuatkan senarai pelajar:', error);
        return []; // Kembalikan array kosong jika ralat
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.getElementById('loginContainer');
    const mainContent = document.getElementById('mainContent');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');

    async function initializeApp() {
        console.log("Memuatkan senarai pelajar...");
        showToast("Memuatkan", "Sila tunggu sebentar, senarai pelajar sedang dimuatkan...");
        
        allStudents = await fetchStudents();
        
        if (allStudents.length > 0) {
            console.log("Aplikasi dimulakan...");
            loadFilterOptions();
            loadStudents(allStudents);
            document.getElementById('studentSelect').addEventListener('change', onStudentSelectChange);
            document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
            
            const saveDataBtn = document.getElementById('saveDataBtn');
            if(saveDataBtn) saveDataBtn.addEventListener('click', saveData);

            const calculateScoreBtn = document.getElementById('calculateScoreBtn');
            if(calculateScoreBtn) calculateScoreBtn.addEventListener('click', calculateScore);
            
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) {
               exportBtn.textContent = "Buka Pangkalan Data (Google Sheet)";
               exportBtn.addEventListener('click', () => {
                    window.open('https://docs.google.com/spreadsheets/d/1JBj4FjkTCWCbqgUh_ZEDfKsCNrmMVTH60MgxutTUfnA/edit?gid=1084341755#gid=1084341755', '_blank');
               });
            }
            showToast("Berjaya", "Senarai pelajar berjaya dimuatkan!");
        } else {
            showToast("Gagal", "Tidak dapat memuatkan senarai pelajar. Sila semak Apps Script atau muat semula halaman.", true);
        }
    }

    function handleLogin() {
        if (passwordInput.value === CORRECT_PASSWORD) {
            loginContainer.classList.add('d-none');
            mainContent.classList.remove('d-none');
