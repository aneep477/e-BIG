// script.js

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

    // Kosongkan dulu pilihan
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

// Fungsi untuk memuatkan senarai pelajar ke dalam dropdown (berdasarkan penapisan)
function loadStudents(studentsToLoad = students) {
    const studentSelect = document.getElementById('studentSelect');
    // Reset senarai pelajar
    studentSelect.innerHTML = '<option value="" selected disabled>Pilih seorang pelajar</option>';

    studentsToLoad.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        // Papar nama, no giliran, kelas, dan siri
        option.textContent = `${student.name} (${student.a_giliran}) - ${student.kelas || 'Tiada Kelas'} - ${student.siri_big || 'Tiada Siri'}`;
        studentSelect.appendChild(option);
    });
}

// Fungsi untuk mengaplikasikan penapis
function applyFilters() {
    const selectedClass = document.getElementById('classFilter').value;
    const selectedSeries = document.getElementById('seriesFilter').value;

    // Jika tiada penapis dipilih, muatkan semua pelajar
    if (!selectedClass && !selectedSeries) {
        filteredStudents = [];
        loadStudents(students);
        document.getElementById('studentSelect').value = "";
        onStudentSelectChange();
        return;
    }

    filteredStudents = students.filter(student => {
        // Jika tiada kelas dipilih, anggap 'true'. Jika dipilih, bandingkan.
        const matchClass = !selectedClass || (student.kelas && student.kelas === selectedClass);
        // Jika tiada siri dipilih, anggap 'true'. Jika dipilih, bandingkan.
        const matchSeries = !selectedSeries || (student.siri_big && student.siri_big === selectedSeries);
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
        // Cari dalam senarai pelajar yang telah ditapis atau senarai penuh
        const studentList = filteredStudents.length > 0 ? filteredStudents : students;
        const selectedStudent = studentList.find(student => student.id === selectedStudentId);
        if (selectedStudent) {
            document.getElementById('selectedStudentName').textContent = selectedStudent.name;
            document.getElementById('selectedStudentIC').textContent = selectedStudent.ic;
            document.getElementById('selectedStudentAGiliran').textContent = selectedStudent.a_giliran;
            document.getElementById('selectedStudentClass').textContent = selectedStudent.kelas || 'Tiada Maklumat';
            document.getElementById('selectedStudentSeries').textContent = selectedStudent.siri_big || 'Tiada Maklumat';
            studentInfoDiv.style.display = 'block';
            rubricForm.style.display = 'block';
            resetForm();
            resultDiv.style.display = 'none';

            // Muatkan data yang telah disimpan sebelum ini untuk pelajar ini
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
    // Reset paparan keputusan
    document.getElementById('scoreHP4').textContent = '0.00';
    document.getElementById('scoreHP5').textContent = '0.00';
    document.getElementById('scoreAmali2').textContent = '0.00';
    document.getElementById('scoreExam').textContent = '0.00';
    document.getElementById('totalScore').textContent = '0.00';
    document.getElementById('grade').textContent = '-';
    document.getElementById('result').style.display = 'none'; // Sembunyikan panel keputusan
}

// Fungsi untuk mengira markah berdasarkan pemberat
function calculateWeightedScore(rawScore, maxRawScore, weightPercentage) {
    if (isNaN(rawScore) || rawScore < 0) return 0;
    const cappedScore = Math.min(rawScore, maxRawScore);
    return (cappedScore / maxRawScore) * weightPercentage;
}

// Fungsi untuk mengira dan memaparkan markah
function calculateScore() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudentId = parseInt(studentSelect.value);
    if (!selectedStudentId) {
        alert("Sila pilih seorang pelajar dahulu.");
        return;
    }

    const studentList = filteredStudents.length > 0 ? filteredStudents : students;
    const selectedStudent = studentList.find(student => student.id === selectedStudentId);
    if (!selectedStudent) {
        alert("Ralat: Maklumat pelajar tidak dijumpai.");
        return;
    }

    // Dapatkan nilai dari setiap input markah
    const organizingA4 = parseFloat(document.getElementById('organizingA4').value) || 0;
    const positiveBehaviorKMI3 = parseFloat(document.getElementById('positiveBehaviorKMI3').value) || 0;
    const organizingA4Comm = parseFloat(document.getElementById('organizingA4Comm').value) || 0;
    const nonVerbalCommKMK12 = parseFloat(document.getElementById('nonVerbalCommKMK12').value) || 0;
    const mechanismP4 = parseFloat(document.getElementById('mechanismP4').value) || 0;
    const valueAppreciationA5 = parseFloat(document.getElementById('valueAppreciationA5').value) || 0;
    const responsibilityKAT10 = parseFloat(document.getElementById('responsibilityKAT10').value) || 0;
    const examScore = parseFloat(document.getElementById('examScore').value) || 0;

    // Kira markah berdasarkan pemberat (menggunakan fungsi baru)
    const scoreHP4 = calculateWeightedScore((organizingA4 + positiveBehaviorKMI3), 30, 30);
    const scoreHP5 = calculateWeightedScore((organizingA4Comm + nonVerbalCommKMK12), 30, 30);
    const scoreAmali2HP3 = calculateWeightedScore(mechanismP4, 15, 15);
    const scoreAmali2HP8 = calculateWeightedScore((valueAppreciationA5 + responsibilityKAT10), 30, 15);
    const scoreAmali2 = scoreAmali2HP3 + scoreAmali2HP8;
    const scoreExam = calculateWeightedScore(examScore, 10, 10);

    const totalScore = scoreHP4 + scoreHP5 + scoreAmali2 + scoreExam;

    let grade = 'Tidak Sah';
    if (totalScore >= 81) {
        grade = 'A (Amat Cemerlang)';
    } else if (totalScore >= 75) {
        grade = 'A- (Cemerlang)';
    } else if (totalScore >= 68) {
        grade = 'B+ (Kepujian)';
    } else if (totalScore >= 61) {
        grade = 'B (Sederhana)';
    } else if (totalScore > 0) {
        grade = 'C (Lemah)';
    } else {
        grade = 'Tidak Hadir / Tiada Markah';
    }

    document.getElementById('resultStudentName').textContent = selectedStudent.name;
    document.getElementById('scoreHP4').textContent = scoreHP4.toFixed(2);
    document.getElementById('scoreHP5').textContent = scoreHP5.toFixed(2);
    document.getElementById('scoreAmali2').textContent = scoreAmali2.toFixed(2);
    document.getElementById('scoreExam').textContent = scoreExam.toFixed(2);
    document.getElementById('totalScore').textContent = totalScore.toFixed(2);
    document.getElementById('grade').textContent = grade;

    document.getElementById('result').style.display = 'block';
}

// --- FUNGSI UNTUK PENYIMPANAN DAN EKSPORT ---

// Fungsi untuk menyimpan data markah dan catatan ke localStorage
function saveData() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudentId = parseInt(studentSelect.value);
    if (!selectedStudentId) {
        alert("Sila pilih seorang pelajar dahulu.");
        return;
    }

    // Kumpulkan data markah
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
        notesExam: document.getElementById('notesExam').value.trim(),
        // Tarikh simpan
        savedAt: new Date().toISOString()
    };

    // Dapatkan data yang sedia ada
    let allSavedData = JSON.parse(localStorage.getItem('rubricData')) || {};
    // Simpan data untuk pelajar ini, menimpa data lama jika ada
    allSavedData[selectedStudentId] = dataToSave;
    // Simpan semula ke localStorage
    localStorage.setItem('rubricData', JSON.stringify(allSavedData));

    alert("Data untuk pelajar ini telah disimpan!");
    // Kira semula untuk memastikan paparan terkini
    calculateScore();
}

// Fungsi untuk memuatkan data yang telah disimpan untuk pelajar tertentu
function loadDataForStudent(studentId) {
    const allSavedData = JSON.parse(localStorage.getItem('rubricData')) || {};
    const studentData = allSavedData[studentId];

    if (studentData) {
        // Muatkan markah
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
    }
    // Jika tiada data disimpan, borang kekal kosong/reset
}

// Fungsi untuk mengeksport data ke Excel
function exportToExcel() {
    const allSavedData = JSON.parse(localStorage.getItem('rubricData')) || {};

    if (Object.keys(allSavedData).length === 0) {
        alert("Tiada data untuk dieksport. Sila simpan data terlebih dahulu.");
        return;
    }

    // Format data untuk Excel
    const exportData = [];
    for (const studentIdStr in allSavedData) {
        const studentId = parseInt(studentIdStr);
        const data = allSavedData[studentIdStr];

        // Cari maklumat pelajar
        const student = students.find(s => s.id === studentId);
        if (!student) continue; // Langkau jika maklumat pelajar tidak dijumpai

        // Gunakan fungsi pengiraan yang sama untuk konsistensi
        const weightedScoreHP4 = calculateWeightedScore(
            (data.organizingA4 || 0) + (data.positiveBehaviorKMI3 || 0),
            30, 30
        );
        const weightedScoreHP5 = calculateWeightedScore(
            (data.organizingA4Comm || 0) + (data.nonVerbalCommKMK12 || 0),
            30, 30
        );
        const weightedScoreHP3 = calculateWeightedScore(data.mechanismP4 || 0, 15, 15);
        const weightedScoreHP8 = calculateWeightedScore(
            (data.valueAppreciationA5 || 0) + (data.responsibilityKAT10 || 0),
            30, 15
        );
        const weightedScoreExam = calculateWeightedScore(data.examScore || 0, 10, 10);

        const totalWeightedScore = weightedScoreHP4 + weightedScoreHP5 + weightedScoreHP3 + weightedScoreHP8 + weightedScoreExam;

        exportData.push({
            "ID": student.id,
            "Nama": student.name,
            "No. IC": student.ic,
            "No. Giliran": student.a_giliran,
            "Kelas": student.kelas || '',
            "Siri": student.siri_big || '',
            "HP4_Mengorganisasi_A4": data.organizingA4,
            "HP4_Mengamalkan_Tingkahlaku_Positif_KMI3": data.positiveBehaviorKMI3,
            "HP4_Jumlah_Markah": weightedScoreHP4.toFixed(2),
            "Catatan_HP4": data.notesHP4,
            "HP5_Mengorganisasi_A4": data.organizingA4Comm,
            "HP5_Komunikasi_Bukan_Lisan_KMK12": data.nonVerbalCommKMK12,
            "HP5_Jumlah_Markah": weightedScoreHP5.toFixed(2),
            "Catatan_HP5": data.notesHP5,
            "Amali2_HP3_Mekanisme_P4": data.mechanismP4,
            "HP3_Jumlah_Markah": weightedScoreHP3.toFixed(2),
            "Catatan_HP3": data.notesHP3,
            "Amali2_HP8_Menghayati_Nilai_A5": data.valueAppreciationA5,
            "Amali2_HP8_Bertanggungjawab_KAT10": data.responsibilityKAT10,
            "HP8_Jumlah_Markah": weightedScoreHP8.toFixed(2),
            "Catatan_HP8": data.notesHP8,
            "Amali2_Jumlah_Markah": (weightedScoreHP3 + weightedScoreHP8).toFixed(2),
            "Ujian_Markah": data.examScore,
            "Ujian_Jumlah_Markah": weightedScoreExam.toFixed(2),
            "Catatan_Ujian": data.notesExam,
            "Jumlah_Keseluruhan_Markah": totalWeightedScore.toFixed(2),
            "Tarikh_Simpan": data.savedAt ? new Date(data.savedAt).toLocaleString() : ''
        });
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
}


// Muatkan senarai pelajar dan pilihan penapis apabila halaman dimuatkan
document.addEventListener('DOMContentLoaded', function() {
    loadFilterOptions(); // Muatkan pilihan kelas dan siri
    loadStudents(); // Muatkan semua pelajar pada mulanya
    document.getElementById('studentSelect').addEventListener('change', onStudentSelectChange);
});
