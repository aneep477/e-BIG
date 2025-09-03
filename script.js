// script.js

// --- KONFIGURASI UNTUK GOOGLE APPS SCRIPT ---
// *** PENTING: GANTIKAN URL DI BAWAH INI DENGAN URL SEBENAR WEB APP ANDA ***
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzeHvKycZZGFmdzyfTLzjPnhjDdG7QlvdzUPo2CNns-NpB8wGNjueqlKIE2uHTbgNTx/exec';
// Jadual Gred Baru
const GRADE_SCALE = [
  { minScore: 90, grade: 'A+' },
  { minScore: 80, grade: 'A' },
  { minScore: 75, grade: 'A-' },
  { minScore: 70, grade: 'B+' },
  { minScore: 65, grade: 'B' },
  { minScore: 60, grade: 'B-' },
  { minScore: 55, grade: 'C+' },
  { minScore: 50, grade: 'C' },
  { minScore: 40, grade: 'C-' },
  { minScore: 30, grade: 'D+' },
  { minScore: 20, grade: 'D' },
  { minScore: 0, grade: 'F' }
];

let filteredStudents = [];
let uniqueClasses = [];
let uniqueSeries = [];

// Fungsi untuk mendapatkan senarai unik kelas dan siri dari data pelajar
function getUniqueFilters() {
    uniqueClasses = [...new Set(students.map(student => student.kelas).filter(Boolean))].sort();
    uniqueSeries = [...new Set(students.map(student => student.siri_big).filter(Boolean))].sort();
}

// Fungsi untuk memuatkan pilihan penapis ke dropdown
function loadFilterOptions() {
    getUniqueFilters();
    const classFilter = document.getElementById('classFilter');
    const seriesFilter = document.getElementById('seriesFilter');

    // Kosongkan pilihan sedia ada
    classFilter.innerHTML = '<option value="">Semua Kelas</option>';
    seriesFilter.innerHTML = '<option value="">Semua Siri</option>';

    // Tambah pilihan unik
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

// Fungsi untuk memuatkan senarai pelajar ke dalam dropdown (berdasarkan penapisan)
function loadStudents(studentsToLoad = students) {
    const studentSelect = document.getElementById('studentSelect');
    // Reset senarai pelajar
    studentSelect.innerHTML = '<option value="" selected disabled>Pilih seorang pelajar</option>';

    // Tambah setiap pelajar ke dropdown
    studentsToLoad.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        // Paparkan Nama (No. Giliran)
        option.textContent = `${student.name} (${student.a_giliran})`;
        studentSelect.appendChild(option);
    });
}

// Fungsi untuk mengaplikasikan penapis
function applyFilters() {
    const classFilter = document.getElementById('classFilter').value;
    const seriesFilter = document.getElementById('seriesFilter').value;

    filteredStudents = students.filter(student => {
        const matchClass = !classFilter || (student.kelas && student.kelas === classFilter);
        const matchSeries = !seriesFilter || (student.siri_big && student.siri_big === seriesFilter);
        return matchClass && matchSeries;
    });

    loadStudents(filteredStudents);
    // Reset pemilihan pelajar dan borang
    document.getElementById('studentSelect').value = "";
    onStudentSelectChange();
}

// Fungsi untuk menangani perubahan pemilihan pelajar
function onStudentSelectChange() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudentId = parseInt(studentSelect.value);
    const studentInfoDiv = document.getElementById('studentInfo');
    const rubricForm = document.getElementById('rubricForm');
    const resultDiv = document.getElementById('result');

    if (selectedStudentId) {
        const selectedStudent = students.find(student => student.id === selectedStudentId);

        if (selectedStudent) {
            // Paparkan maklumat pelajar
            document.getElementById('selectedStudentName').textContent = selectedStudent.name;
            document.getElementById('selectedStudentIC').textContent = selectedStudent.ic;
            document.getElementById('selectedStudentAGiliran').textContent = selectedStudent.a_giliran;
            document.getElementById('selectedStudentClass').textContent = selectedStudent.kelas || 'Tiada Maklumat';
            document.getElementById('selectedStudentSeries').textContent = selectedStudent.siri_big || 'Tiada Maklumat';

            studentInfoDiv.style.display = 'block';
            rubricForm.style.display = 'block';

            // Dapatkan data yang telah disimpan sebelum ini untuk pelajar ini
            loadDataForStudent(selectedStudentId);
        }
    } else {
        studentInfoDiv.style.display = 'none';
        rubricForm.style.display = 'none';
        resultDiv.style.display = 'none';
    }
}

// Fungsi untuk mereset borang rubrik
function resetForm() {
    document.getElementById('rubricForm').reset();
    // Reset nilai paparan keputusan
    document.getElementById('scoreHP4').textContent = '0.00';
    document.getElementById('scoreHP5').textContent = '0.00';
    document.getElementById('scoreAmali2').textContent = '0.00';
    document.getElementById('scoreExam').textContent = '0.00';
    document.getElementById('totalScore').textContent = '0.00';
    document.getElementById('grade').textContent = '-';
}

// Fungsi untuk mengira markah berdasarkan pemberat
function calculateWeightedScore(rawScore, maxRawScore, weightPercentage) {
    if (isNaN(rawScore) || rawScore < 0) return 0;
    if (rawScore > maxRawScore) rawScore = maxRawScore; // Elak markah melebihi maksimum

    // Formula: (markah_diperolehi / markah_maksimum) * peratusan_berat
    return (rawScore / maxRawScore) * weightPercentage;
}

// Fungsi untuk menentukan gred berdasarkan jumlah markah menggunakan jadual baru
function determineGrade(totalScore) {
     // Pastikan totalScore adalah nombor yang sah
     const score = parseFloat(totalScore);
     if (isNaN(score)) {
         return 'Tidak Sah';
     }

     // Cari gred berdasarkan jadual
     for (const gradeInfo of GRADE_SCALE) {
         if (score >= gradeInfo.minScore) {
             return gradeInfo.grade;
         }
     }
     // Jika markah negatif (walaupun tidak mungkin dengan pengiraan semasa)
     return 'Tidak Sah';
}

// Fungsi utama untuk mengira jumlah markah dan menentukan gred
function calculateScore() {
    // Dapatkan ID pelajar yang dipilih
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudentId = parseInt(studentSelect.value);
    if (!selectedStudentId) {
        alert("Sila pilih seorang pelajar dahulu.");
        return;
    }

    const selectedStudent = students.find(student => student.id === selectedStudentId);
    if (!selectedStudent) {
        alert("Ralat: Maklumat pelajar tidak dijumpai.");
        return;
    }

    // Dapatkan nilai dari setiap input nombor
    const organizingA4 = parseFloat(document.getElementById('organizingA4').value) || 0;
    const positiveBehaviorKMI3 = parseFloat(document.getElementById('positiveBehaviorKMI3').value) || 0;
    const organizingA4Comm = parseFloat(document.getElementById('organizingA4Comm').value) || 0;
    const nonVerbalCommKMK12 = parseFloat(document.getElementById('nonVerbalCommKMK12').value) || 0;
    const mechanismP4 = parseFloat(document.getElementById('mechanismP4').value) || 0;
    const valueAppreciationA5 = parseFloat(document.getElementById('valueAppreciationA5').value) || 0;
    const responsibilityKAT10 = parseFloat(document.getElementById('responsibilityKAT10').value) || 0;
    const examScore = parseFloat(document.getElementById('examScore').value) || 0;

    // Kira markah berdasarkan pemberat (menggunakan 30% untuk Amali 1 dan Amali 2)
    const scoreHP4 = calculateWeightedScore(organizingA4 + positiveBehaviorKMI3, 30, 30); // Max 30 markah, 30% weight
    const scoreHP5 = calculateWeightedScore(organizingA4Comm + nonVerbalCommKMK12, 30, 30); // Max 30 markah, 30% weight
    const scoreHP3 = calculateWeightedScore(mechanismP4, 15, 15); // Max 15 markah, 15% weight
    const scoreHP8 = calculateWeightedScore(valueAppreciationA5 + responsibilityKAT10, 30, 15); // Max 30 markah, 15% weight
    const scoreExam = calculateWeightedScore(examScore, 10, 10); // Max 10 markah, 10% weight

    // Kira jumlah keseluruhan markah
    const totalScore = scoreHP4 + scoreHP5 + scoreHP3 + scoreHP8 + scoreExam;

    // Tentukan gred berdasarkan jadual baru
    const grade = determineGrade(totalScore);

    // Paparkan keputusan dengan 2 tempat perpuluhan
    document.getElementById('resultStudentName').textContent = selectedStudent.name;
    document.getElementById('scoreHP4').textContent = scoreHP4.toFixed(2);
    document.getElementById('scoreHP5').textContent = scoreHP5.toFixed(2);
    document.getElementById('scoreAmali2').textContent = (scoreHP3 + scoreHP8).toFixed(2); // Gabungan HP3 & HP8
    document.getElementById('scoreExam').textContent = scoreExam.toFixed(2);
    document.getElementById('totalScore').textContent = totalScore.toFixed(2);
    document.getElementById('grade').textContent = grade;

    // Tunjukkan bahagian keputusan
    document.getElementById('result').style.display = 'block';
}


// --- FUNGSI UNTUK PENYIMPANAN DAN EKSPORT ---

// Fungsi untuk menyimpan data markah dan catatan ke Google Sheets melalui Web App
async function saveData() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudentId = parseInt(studentSelect.value);

    if (!selectedStudentId) {
        alert("Sila pilih seorang pelajar dahulu.");
        return;
    }

    // Kumpulkan data dari borang
    const dataToSave = {
        studentId: selectedStudentId,
        // Markah
        organizingA4: parseFloat(document.getElementById('organizingA4').value) || null,
        positiveBehaviorKMI3: parseFloat(document.getElementById('positiveBehaviorKMI3').value) || null,
        organizingA4Comm: parseFloat(document.getElementById('organizingA4Comm').value) || null,
        nonVerbalCommKMK12: parseFloat(document.getElementById('nonVerbalCommKMK12').value) || null,
        mechanismP4: parseFloat(document.getElementById('mechanismP4').value) || null,
        valueAppreciationA5: parseFloat(document.getElementById('valueAppreciationA5').value) || null,
        responsibilityKAT10: parseFloat(document.getElementById('responsibilityKAT10').value) || null,
        examScore: parseFloat(document.getElementById('examScore').value) || null,
        // Catatan
        notesHP4: document.getElementById('notesHP4').value.trim(),
        notesHP5: document.getElementById('notesHP5').value.trim(),
        notesHP3: document.getElementById('notesHP3').value.trim(),
        notesHP8: document.getElementById('notesHP8').value.trim(),
        notesExam: document.getElementById('notesExam').value.trim()
        // Tarikh simpan akan ditambah oleh Web App
    };

    console.log("Data untuk disimpan:", dataToSave); // Untuk debugging

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'cors', // Penting untuk komunikasi antara domain
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSave)
        });

        if (!response.ok) {
            const errorText = await response.text(); // Dapatkan teks ralat dari server
            console.error('Ralat dari server:', errorText);
            throw new Error(`Ralat HTTP! status: ${response.status}, mesej: ${errorText}`);
        }

        const resultText = await response.text();
        alert(resultText); // Papar mesej kejayaan atau ralat dari Web App
        calculateScore(); // Kira semula untuk memastikan paparan terkini

    } catch (error) {
        console.error('Ralat menyimpan ', error);
        alert('Ralat berlaku semasa menyimpan data. Sila cuba lagi. Ralat: ' + error.message);
    }
}

// Fungsi untuk memuatkan data yang telah disimpan untuk pelajar tertentu dari Google Sheets
async function loadDataForStudent(studentId) {
    if (!studentId) return;

    try {
        // Bina URL dengan parameter studentId
        const url = `${WEB_APP_URL}?studentId=${encodeURIComponent(studentId)}`;

        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors' // Penting untuk komunikasi antara domain
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ralat dari server semasa muat data:', errorText);
            throw new Error(`Ralat HTTP semasa muat data! status: ${response.status}, mesej: ${errorText}`);
        }

        const studentData = await response.json();
        console.log("Data dimuatkan:", studentData); // Untuk debugging

        // Isikan borang dengan data yang dimuatkan
        // Pastikan kunci dalam studentData sepadan dengan ID elemen input
        document.getElementById('organizingA4').value = studentData.organizingA4 !== null ? studentData.organizingA4 : '';
        document.getElementById('positiveBehaviorKMI3').value = studentData.positiveBehaviorKMI3 !== null ? studentData.positiveBehaviorKMI3 : '';
        document.getElementById('organizingA4Comm').value = studentData.organizingA4Comm !== null ? studentData.organizingA4Comm : '';
        document.getElementById('nonVerbalCommKMK12').value = studentData.nonVerbalCommKMK12 !== null ? studentData.nonVerbalCommKMK12 : '';
        document.getElementById('mechanismP4').value = studentData.mechanismP4 !== null ? studentData.mechanismP4 : '';
        document.getElementById('valueAppreciationA5').value = studentData.valueAppreciationA5 !== null ? studentData.valueAppreciationA5 : '';
        document.getElementById('responsibilityKAT10').value = studentData.responsibilityKAT10 !== null ? studentData.responsibilityKAT10 : '';
        document.getElementById('examScore').value = studentData.examScore !== null ? studentData.examScore : '';

        // Muatkan catatan
        document.getElementById('notesHP4').value = studentData.notesHP4 || '';
        document.getElementById('notesHP5').value = studentData.notesHP5 || '';
        document.getElementById('notesHP3').value = studentData.notesHP3 || '';
        document.getElementById('notesHP8').value = studentData.notesHP8 || '';
        document.getElementById('notesExam').value = studentData.notesExam || '';

        // Jika borang kelihatan, kira semula markah
        if (document.getElementById('rubricForm').style.display !== 'none') {
             calculateScore();
        }

    } catch (error) {
        console.error('Ralat memuatkan ', error);
         // Tidak perlu alert untuk ralat muat data, mungkin tiada data lagi
         // Kosongkan borang jika ralat (pilihan)
         resetForm();
    }
}


// Fungsi untuk mengeksport data ke Excel
function exportToExcel() {
    alert("Fungsi eksport Excel tidak lagi tersedia dalam versi ini kerana data disimpan di Google Sheets. Sila akses spreadsheet anda secara terus untuk eksport.");
    // Anda boleh mempertimbangkan untuk menambah fungsi eksport dari Google Sheets jika perlu.
}

// Muatkan senarai pelajar dan pilihan penapis apabila halaman dimuatkan
document.addEventListener('DOMContentLoaded', function() {
    loadFilterOptions(); // Muatkan pilihan kelas dan siri
    loadStudents(); // Muatkan semua pelajar pada mulanya
    document.getElementById('studentSelect').addEventListener('change', onStudentSelectChange);
});
