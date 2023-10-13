const fs = require('fs');
const { DateTime } = require('luxon');
const https = require('https');
const machineId = require('node-machine-id');

const bacaFile = (lokasiFile) => {
    const fileku = fs.readFileSync(lokasiFile, 'utf-8')
    const hasil = JSON.parse(fileku)
    return hasil
}

const gasId = async () => {
    const id_mesin = await machineId.machineId();
    return id_mesin
}

const cekIp = async () => {
    const allowedIp = 'PT. Telekomunikasi Selular'
    try {
        const response = await fetch('https://ipapi.co/json');
        const data = await response.json();
        const ip = data.org;
        if (ip === allowedIp) {
            return true;
        }
    } catch (error) {
        throw error;
    }
}

const ambilWaktuIndonesia = () => {
    const zonaWaktu = 'Asia/Jakarta';
    const waktuSaatIni = DateTime.now().setZone(zonaWaktu);
    const namaHari = waktuSaatIni.setLocale('id').toLocaleString({ weekday: 'long' });
    const namaBulan = waktuSaatIni.setLocale('id').toLocaleString({ month: 'long' });
    const waktuFormatted = `${namaHari}, ${waktuSaatIni.toFormat('dd')} ${namaBulan} ${waktuSaatIni.toFormat('yyyy|HH:mm')}`;
    return waktuFormatted;
}


//ngelola data
const dirPath = './src/api';
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}

// Membuat file contacts.json jika belum ada
const dataPath = './src/api/dataAbsen.json';
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, '[]', 'utf-8');
}

const loadAbsen = () => {
    const fileBuffer = fs.readFileSync(dataPath, 'utf-8');
    const dataAbsens = JSON.parse(fileBuffer);
    return dataAbsens;
};

// menuliskan / menimpa file contacts.json dengan data yang baru
const saveAbsen = (dataAbsens) => {
    fs.writeFileSync(dataPath, JSON.stringify(dataAbsens));
};

// menambahkan data contact baru
const addAbsen = (hasilAbsen) => {
    const dataAbsens = loadAbsen();
    dataAbsens.unshift(hasilAbsen); //nambah dari atas arayy
    // dataAbsens.push(hasilAbsen); //nambah dari bawah array
    saveAbsen(dataAbsens);
};

const cekDuplikat = (waktu, id_mesin) => {
    const dataAbsens = loadAbsen();
    return dataAbsens.find((absen) => absen.waktu_absen.split('|')[0] === waktu && absen.id_mesin === id_mesin);
};

const cariUser = (lokasiFl, id_mesin) => {
    const fileBuffer = fs.readFileSync(lokasiFl, 'utf-8');
    const dataAbsens = JSON.parse(fileBuffer);
    const absen = dataAbsens.find((absen) => absen.id_mesin === id_mesin);
    return absen;
}

module.exports = { gasId, cariUser, bacaFile, cekIp, ambilWaktuIndonesia, addAbsen, loadAbsen, cekDuplikat };