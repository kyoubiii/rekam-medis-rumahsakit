import React, { useState } from "react";
import { BASE_URL } from "../constants/api"; // 🔥 TAMBAHAN: Import URL API

export default function Billing({ currentRS }) {
  const [id, setId] = useState("");
  const [tarif, setTarif] = useState("");
  const [obat, setObat] = useState("");
  
  const [searchId, setSearchId] = useState("");
  const [searchedBill, setSearchedBill] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 🔥 DIROMBAK: Fungsi Menyimpan Data ke Brankas PDC (Write Private Data)
  const handleCreateBilling = async (e) => {
    e.preventDefault();
    if (!id || !tarif) return alert("ID Pasien & Tarif wajib diisi!");

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/tagihan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idPasien: id,
          totalTagihan: parseInt(tarif),
          detailObat: obat,
          namaRS: currentRS, // Backend akan otomatis milih brankas berdasarkan nama RS ini
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Sukses! Tagihan Rahasia Berhasil Disimpan ke brankas ${currentRS} via Transient Data!`);
        setId("");
        setTarif("");
        setObat("");
      } else {
        alert(`❌ Gagal menyimpan PDC: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submit billing:", error);
      alert("Gagal terhubung ke server Backend!");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 DIROMBAK: Fungsi Membaca Data dari Brankas PDC (Read Private Data)
  const handleSearchBilling = async (e) => {
    e.preventDefault();
    if (!searchId) return;

    setIsSearching(true);
    setSearchedBill(null);

    try {
      // Nembak API get tagihan sambil bawa nama RS sebagai "Kunci Brankas"
      const response = await fetch(`${BASE_URL}/tagihan/${searchId}?rs=${currentRS}`);
      const result = await response.json();

      if (response.ok) {
        // Data berhasil ditarik dari brankas
        setSearchedBill({
          id: result.data.idPasien,
          tarif: result.data.totalTagihan,
          obat: result.data.detailObat,
          rsPembuat: currentRS, 
        });
      } else {
        // Jika response tidak OK (misal 403 Forbidden), berarti akses ditolak atau data tidak ada
        setSearchedBill("ditolak");
      }
    } catch (error) {
      console.error("Error cari billing:", error);
      setSearchedBill("ditolak");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="responsive-grid-2">
      {/* Input Tagihan */}
      <div className="card">
        <h3>💰 Input Tagihan Private (PDC Collection)</h3>
        <form onSubmit={handleCreateBilling}>
          <div className="form-group">
            <label>ID Pasien</label>
            <input
              type="text"
              placeholder="Misal: RM-001"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Total Tagihan (Rp)</label>
            <input
              type="number"
              placeholder="Contoh: 1500000"
              value={tarif}
              onChange={(e) => setTarif(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Rincian Obat</label>
            <input
              type="text"
              placeholder="Misal: Antibiotik, Vitamin"
              value={obat}
              onChange={(e) => setObat(e.target.value)}
            />
          </div>
          <button type="submit" className="btn" style={{ width: "100%" }} disabled={isLoading}>
            {isLoading ? "Mengenkripsi Data..." : "Simpan ke Private Ledger"}
          </button>
        </form>
      </div>

      {/* Lihat / Cek Tagihan */}
      <div className="card">
        <h3>🔍 Cek Validasi Struk Tagihan Private</h3>
        <form onSubmit={handleSearchBilling} className="search-form">
          <input
            type="text"
            placeholder="Masukkan ID Pasien..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button type="submit" className="btn" disabled={isSearching}>
            {isSearching ? "Mencari..." : "Cari"}
          </button>
        </form>

        {/* Jika Brankas Menolak Akses (Data Gaib / Beda RS) */}
        {searchedBill === "ditolak" && (
          <div
            className="alert-box alert-danger"
            style={{ padding: "25px", borderRadius: "12px", marginTop: "20px" }}
          >
            <h4>🔒 AKSES DITOLAK (PDC Policy Active)</h4>
            <p>
              Maaf, tagihan tidak ditemukan di brankas Anda atau data finansial pasien ini bersifat rahasia antar-instansi.
              Kebijakan <strong>Private Data Collection</strong> memblokir akses baca dari node <strong>{currentRS}</strong>.
            </p>
          </div>
        )}

        {/* Jika Data Berhasil Ditemukan di Brankas Sendiri */}
        {searchedBill && searchedBill !== "ditolak" && (
          <div
            style={{
              marginTop: "20px",
              border: "2px dashed var(--border)",
              padding: "20px",
              borderRadius: "8px",
              background: "#fffbeb",
            }}
          >
            <h4 style={{ textAlign: "center", margin: "0 0 15px 0" }}>
              🧾 STRUK TAGIHAN RESMI
            </h4>
            <p>
              <strong>Instansi Penerbit:</strong> {searchedBill.rsPembuat}
            </p>
            <p>
              <strong>ID Pasien:</strong> {searchedBill.id}
            </p>
            <p>
              <strong>Rincian Obat:</strong> {searchedBill.obat || "-"}
            </p>
            <hr
              style={{
                border: "none",
                borderTop: "1px dashed var(--border)",
                margin: "15px 0"
              }}
            />
            <p style={{ fontSize: "18px" }}>
              <strong>
                Total: Rp {Number(searchedBill.tarif).toLocaleString("id-ID")}
              </strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}