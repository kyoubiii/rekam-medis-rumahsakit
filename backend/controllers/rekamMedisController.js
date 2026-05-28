const { getContract } = require('../config/blockchain');

// 1. Tambah Rekam Medis (Write - Submit)
exports.tambahRekamMedis = async (req, res) => {
    const { idPasien, nama, sakit, tindakan, pemilik } = req.body;
    let gateway, client;
    try {
        const connection = await getContract();
        gateway = connection.gateway;
        client = connection.client;

        // Memicu fungsi CreateRekamMedis di smart contract
        await connection.contract.submitTransaction('CreateRekamMedis', idPasien, nama, sakit, tindakan, pemilik);

        res.status(201).json({ status: 'Sukses', pesan: `Rekam medis pasien ${idPasien} berhasil dicatat di Blockchain.` });
    } catch (error) {
        res.status(500).json({ status: 'Gagal nembak blockchain', error: error.message });
    } finally {
        if (gateway) gateway.close();
        if (client) client.close();
    }
};

// 2. Baca Rekam Medis Pasien (Read - Evaluate)
exports.bacaRekamMedis = async (req, res) => {
    const { id } = req.params;
    let gateway, client;
    try {
        const connection = await getContract();
        gateway = connection.gateway;
        client = connection.client;

        // Memicu fungsi ReadRekamMedis
        const resultBytes = await connection.contract.evaluateTransaction('ReadRekamMedis', id);
        const resultString = Buffer.from(resultBytes).toString();
        const data = resultString ? JSON.parse(resultString) : {};

        res.status(200).json({ status: 'Sukses', data });
    } catch (error) {
        res.status(500).json({ status: 'Gagal', error: error.message });
    } finally {
        if (gateway) gateway.close();
        if (client) client.close();
    }
};

// 3. Rujuk Pasien / Pindah Hak Milik (Write - Submit)
exports.rujukPasien = async (req, res) => {
    const { idPasien, rsTujuan } = req.body;
    let gateway, client;
    try {
        const connection = await getContract();
        gateway = connection.gateway;
        client = connection.client;

        // Memicu fungsi RujukPasien
        await connection.contract.submitTransaction('RujukPasien', idPasien, rsTujuan);

        res.status(200).json({ status: 'Sukses', pesan: `Pasien ${idPasien} berhasil dirujuk ke ${rsTujuan}.` });
    } catch (error) {
        res.status(500).json({ status: 'Gagal', error: error.message });
    } finally {
        if (gateway) gateway.close();
        if (client) client.close();
    }
};

// 4. Ambil Riwayat Audit Kronologis Pasien (Read - Evaluate)
exports.riwayatPasien = async (req, res) => {
    const { id } = req.params;
    let gateway, client;
    try {
        const connection = await getContract();
        gateway = connection.gateway;
        client = connection.client;

        // Memicu fungsi GetRiwayatPasien
        const resultBytes = await connection.contract.evaluateTransaction('GetRiwayatPasien', id);
        const resultString = Buffer.from(resultBytes).toString();
        const riwayat = resultString ? JSON.parse(resultString) : [];

        res.status(200).json({ status: 'Sukses', riwayat });
    } catch (error) {
        res.status(500).json({ status: 'Gagal', error: error.message });
    } finally {
        if (gateway) gateway.close();
        if (client) client.close();
    }
};

// 5. Fitur Tambahan Ketua: Create Tagihan Private (PDC - Transient Data)
exports.tambahTagihanPrivate = async (req, res) => {
    const { namaKoleksi, idPasien, totalTagihan } = req.body;
    let gateway, client;
    try {
        const connection = await getContract();
        gateway = connection.gateway;
        client = connection.client;

        // Sesuai instruksi ketua: Data diselundupkan lewat objek transient dengan key "tagihan_data"
        const transientData = { idPasien, totalTagihan };
        const transientBuffer = Buffer.from(JSON.stringify(transientData));

        await connection.contract.newProposal('CreateTagihanPrivate')
            .addArguments(namaKoleksi)
            .setTransient({ tagihan_data: transientBuffer })
            .build()
            .endorse()
            .submit();

        res.status(201).json({ status: 'Sukses', pesan: `Tagihan rahasia pasien ${idPasien} berhasil disimpan di ${namaKoleksi}.` });
    } catch (error) {
        res.status(500).json({ status: 'Gagal', error: error.message });
    } finally {
        if (gateway) gateway.close();
        if (client) client.close();
    }
    // 6. Fungsi Tambahan: Baca Tagihan Private (PDC - Evaluate)
exports.bacaTagihanPrivate = async (req, res) => {
    const { namaKoleksi, idPasien } = req.params;
    let gateway, client;
    try {
        const connection = await getContract();
        gateway = connection.gateway;
        client = connection.client;

        // Memicu fungsi ReadTagihanPrivate sesuai spek ketua
        const resultBytes = await connection.contract.evaluateTransaction('ReadTagihanPrivate', namaKoleksi, idPasien);
        const resultString = Buffer.from(resultBytes).toString();
        const data = resultString ? JSON.parse(resultString) : {};

        res.status(200).json({ status: 'Sukses', data });
    } catch (error) {
        res.status(500).json({ status: 'Gagal', error: error.message });
    } finally {
        if (gateway) gateway.close();
        if (client) client.close();
    }
}
};