// script.js

// --- KONFIGURASI UNTUK GOOGLE APPS SCRIPT ---
// Gantikan 'YOUR_WEB_APP_URL_HERE' dengan URL Web App yang anda dapat dari Google Apps Script
// Contoh URL: https://script.google.com/macros/s/AKfycby.../exec
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby7VHSxTHZZCmYPcWmJXl60oc16TtNnAt3gkehmG5k4mOCTIMZ1-6WxusHk0q9Y4dk/exec'; // <-- GANTIKAN INI

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

    // Tentukan gred berdasarkan jumlah markah
    let grade = 'Tidak Hadir / Tiada Markah';
    if (totalScore >= 85) {
        grade = 'A (Cemerlang)';
    } else if (totalScore >= 80) {
        grade = 'A- (Cemerlang)';
    } else if (totalScore >= 75) {
        grade = 'B+ (Kepujian)';
    } else if (totalScore >= 68) {
        grade = 'B (Sederhana)';
    } else if (totalScore > 0) {
        grade = 'C (Lemah)';
    }
    // Jika totalScore adalah 0, gred kekal 'Tidak Hadir / Tiada Markah'

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
            throw new Error(`Ralat HTTP! status: ${response.status}`);
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
            throw new Error(`Ralat HTTP! status: ${response.status}`);
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
    /*
    const allSavedData = JSON.parse(localStorage.getItem('rubricData')) || {};
    const exportData = [];

    // Fungsi pembantu untuk mengira markah berpemberat (digunakan semula)
    function calcWeightedScore(rawScore, maxRawScore, weightPercentage) {
        if (isNaN(rawScore) || rawScore < 0) return 0;
        if (rawScore > maxRawScore) rawScore = maxRawScore;
        return (rawScore / maxRawScore) * weightPercentage;
    }

    // Proses setiap entri data yang disimpan
    for (const studentIdStr in allSavedData) {
        const studentId = parseInt(studentIdStr);
        const data = allSavedData[studentIdStr];
        const student = students.find(s => s.id === studentId);

        if (student) { // Hanya eksport jika maklumat pelajar dijumpai
            // Kira semula markah untuk tujuan eksport
            const scoreHP4 = calcWeightedScore((data.organizingA4 || 0) + (data.positiveBehaviorKMI3 || 0), 30, 30);
            const scoreHP5 = calcWeightedScore((data.organizingA4Comm || 0) + (data.nonVerbalCommKMK12 || 0), 30, 30);
            const scoreHP3 = calcWeightedScore(data.mechanismP4 || 0, 15, 15);
            const scoreHP8 = calcWeightedScore((data.valueAppreciationA5 || 0) + (data.responsibilityKAT10 || 0), 30, 15);
            const scoreExam = calcWeightedScore(data.examScore || 0, 10, 10);
            const totalWeightedScore = scoreHP4 + scoreHP5 + scoreHP3 + scoreHP8 + scoreExam;

            exportData.push({
                "Nama_Pelajar": student.name,
                "No_IC": student.ic,
                "No_Giliran": student.a_giliran,
                "Kelas": student.kelas,
                "Siri": student.siri_big,
                "HP4_Markah_Bahan": data.organizingA4,
                "HP4_Markah_Tingkah_Laku": data.positiveBehaviorKMI3,
                "HP4_Jumlah_Markah": scoreHP4.toFixed(2),
                "Catatan_HP4": data.notesHP4,
                "HP5_Markah_Bahan": data.organizingA4Comm,
                "HP5_Markah_Komunikasi": data.nonVerbalCommKMK12,
                "HP5_Jumlah_Markah": scoreHP5.toFixed(2),
                "Catatan_HP5": data.notesHP5,
                "HP3_Markah_Mekanisma": data.mechanismP4,
                "HP3_Jumlah_Markah": scoreHP3.toFixed(2),
                "Catatan_HP3": data.notesHP3,
                "HP8_Markah_Nilai": data.valueAppreciationA5,
                "HP8_Markah_Tanggungjawab": data.responsibilityKAT10,
                "HP8_Jumlah_Markah": scoreHP8.toFixed(2),
                "Catatan_HP8": data.notesHP8,
                "Ujian_Markah": data.examScore,
                "Ujian_Jumlah_Markah": scoreExam.toFixed(2),
                "Catatan_Ujian": data.notesExam,
                "Jumlah_Keseluruhan_Markah": totalWeightedScore.toFixed(2),
                "Tarikh_Simpan": data.savedAt ? new Date(data.savedAt).toLocaleString() : ''
            });
        }
    }

    if (exportData.length === 0) {
        alert("Tiada data pelajar yang sah untuk dieksport.");
        return;
    }

    // Buat workbook dan worksheet menggunakan SheetJS
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Markah_Rubrik");

    // Jana nama fail
    const filename = `Markah_Rubrik_MPU2082_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
    // Muat turun fail
    XLSX.writeFile(wb, filename);
    alert(`Data telah dieksport ke ${filename}`);
    */
}

// Muatkan senarai pelajar dan pilihan penapis apabila halaman dimuatkan
document.addEventListener('DOMContentLoaded', function() {
    loadFilterOptions(); // Muatkan pilihan kelas dan siri
    loadStudents(); // Muatkan semua pelajar pada mulanya
    document.getElementById('studentSelect').addEventListener('change', onStudentSelectChange);
});
