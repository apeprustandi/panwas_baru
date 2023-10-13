const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const machineId = require('node-machine-id');
const { gasId, cariUser, bacaFile, cekIp, ambilWaktuIndonesia, addAbsen, loadAbsen, cekDuplikat } = require('./utils/absen')
const app = express();
const fs = require('fs');

app.use('/css', express.static(__dirname + '/src/css'));

app.set('view engine', 'ejs');
app.use(expressLayouts);
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', async (req, res) => {
    res.render('home', {
        layout: 'layouts/main-layout',
        title: 'Home',
    });
});

app.get('/register', async (req, res) => {
    const id_mesin = await gasId()
    res.send(id_mesin)
});

app.get('/absen', async (req, res) => {
    try {
        const ipStatus = await cekIp();
        const waktuAbsen = await ambilWaktuIndonesia();
        const id_mesin = await machineId.machineId();
        const dataUser = await cariUser('./src/api/allUsers.json', id_mesin)
        const cekDataAbsen = await cariUser('./src/api/dataAbsen.json', id_mesin)
        alertMessage = ''
        if (waktuAbsen.split(',')[0] === dataUser.hari_piket) {
            if (cekDataAbsen !== undefined) {
                if (id_mesin === cekDataAbsen.id_mesin && waktuAbsen.split('|')[0] === cekDataAbsen.waktu_absen.split('|')[0]) {
                    alertMessage = `${cekDataAbsen.nama_lengkap}` //jika sudah absen
                }
            }
        } else {
            alertMessage = `Bukan jadwal anda`
        }
        res.render('absen', {
            layout: 'layouts/main-layout',
            title: 'Halaman Absen',
            dataUser,
            ipStatus,
            waktuAbsen,
            id_mesin,
            alertMessage
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Anda belum terdaftar dalam sistem kami');
    }
});

app.post('/absen', async (req, res) => {
    try {
        addAbsen(req.body);
        res.redirect('/lihat-absen');
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat memproses permintaan.');
    }
});

app.get('/lihat-absen', async (req, res) => {
    const dataUser = await bacaFile('src/api/allUsers.json')
    const dataAbsens = await loadAbsen()
    res.render('lihat-absen', {
        layout: 'layouts/main-layout',
        title: 'Data Piket',
        dataUser,
        dataAbsens
    });
});

















app.get('/buat-lhp', async (req, res) => {
    res.render('buat-lhp', {
        layout: 'layouts/main-layout',
        title: 'Halaman Buat Lhp'
    });
});

app.get('/profil', async (req, res) => {
    const fileku = fs.readFileSync('src/api/panwascam.json', 'utf-8')
    const dataUser = JSON.parse(fileku);
    const dataKu = dataUser
    res.render('profil', {
        layout: 'layouts/main-layout',
        title: 'Profil',
        dataKu
    });
});





app.get('/lihat-lhp', async (req, res) => {
    try {
        const fileku = fs.readFileSync('src/api/pkdUser.json', 'utf-8')
        const dataPkd = JSON.parse(fileku)
        const response = await fetch('https://sheetdb.io/api/v1/e0uekt04oivny?sheet=rekap lhp');
        const dataLHP = await response.json();
        res.render('lihat-lhp', {
            layout: 'layouts/main-layout',
            title: 'Data LHP',
            dataPkd,
            dataLHP
        });
    } catch {

    }
});

app.get('/jadwal-piket', async (req, res) => {
    const fileku = fs.readFileSync('src/api/jadwalPiket.json', 'utf-8')
    const jadwalPkt = JSON.parse(fileku)
    res.render('jadwal-piket', {
        layout: 'layouts/main-layout',
        title: 'Halaman Jadwal Piket',
        jadwalPkt
    });
});


app.use((req, res) => {
    res.status(404).send('<h1>404</h1>');
});

app.listen(process.env.PORT || 3000, () => {
    console.clear();
    console.log("Aplikasi Dijalankan");
});
