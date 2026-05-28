import React, { useState } from "react";

export default function TambahPasien({ currentRS, onAddPasien }) {
  const [id, setId] = useState("RM-00" + Math.floor(Math.random() * 100));
  const [nama, setNama] = useState("");
  const [diagnosa, setDiagnosa] = useState("");
  const [tindakan, setTindakan] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nama || !diagnosa) return alert("Nama dan Diagnosa wajib diisi!");

    const newPasien = {
      id,
      nama,
      diagnosa,
      tindakan,
      pemilik: currentRS,
      riwayat: [
        {
          waktu: "10:00 WIB",
          info: `Pasien ${id} didaftarkan pertama kali di ${currentRS}.`,
        },
      ],
    };

    onAddPasien(newPasien);
    alert("Data Berhasil Ditambahkan ke Ledger Blockchain (Simulasi)!");
  };

  return (
    <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h3>Tambah Rekam Medis Baru (CreateAsset)</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID Pasien</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Nama Pasien</label>
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Penyakit / Diagnosa</label>
          <input
            type="text"
            placeholder="Misal: Gastritis Akut"
            value={diagnosa}
            onChange={(e) => setDiagnosa(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Tindakan</label>
          <input
            type="text"
            placeholder="Misal: Pemberian Antasida"
            value={tindakan}
            onChange={(e) => setTindakan(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Pemilik (Otomatis Sesuai Login)</label>
          <input
            type="text"
            value={currentRS}
            disabled
            style={{ background: "#cbd5e1", fontWeight: "bold" }}
          />
        </div>
        <button type="submit" className="btn" style={{ width: "100%" }}>
          Simpan ke Blockchain
        </button>
      </form>
    </div>
  );
}
