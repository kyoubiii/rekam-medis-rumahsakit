// controllers/rekamMedisController.js

const tambahRekamMedis = (req, res) => {
    // Fungsi ini merepresentasikan CreateAsset di panduan
    res.status(201).json({
        pesan: "Data rekam medis baru berhasil ditambahkan!",
        data: req.body // Nampilin data yang dikirim nanti dari frontend
    });
};

const rujukPasien = (req, res) => {
    // Fungsi ini merepresentasikan TransferAsset di panduan
    res.status(200).json({
        pesan: "Akses rekam medis berhasil dipindah/dirujuk ke Rumah Sakit lain!",
        data: req.body
    });
};

const riwayatPasien = (req, res) => {
    // Fungsi ini merepresentasikan GetAssetHistory di panduan
    const idPasien = req.params.id;
    res.status(200).json({
        pesan: `Nampilin seluruh riwayat kronologis untuk pasien ID: ${idPasien}`,
        riwayat: [
            { rs: "RS A", keluhan: "Demam", tindakan: "Diberi Paracetamol" },
            { rs: "RS B", keluhan: "Tifus", tindakan: "Rawat Inap" }
        ]
    });
};

module.exports = { tambahRekamMedis, rujukPasien, riwayatPasien };