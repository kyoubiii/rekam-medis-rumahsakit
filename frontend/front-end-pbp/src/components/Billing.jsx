import React, { useState } from "react";

export default function Billing({ currentRS, billings, onAddBilling }) {
  const [id, setId] = useState("");
  const [tarif, setTarif] = useState("");
  const [obat, setObat] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searchedBill, setSearchedBill] = useState(null);

  const handleCreateBilling = (e) => {
    e.preventDefault();
    if (!id || !tarif) return alert("ID Pasien & Tarif wajib diisi!");

    const newBill = { id, tarif, obat, rsPembuat: currentRS };
    onAddBilling(newBill);
    alert("Tagihan Rahasia Berhasil Disimpan via Transient Data PDC!");
    setId("");
    setTarif("");
    setObat("");
  };

  const handleSearchBilling = (e) => {
    e.preventDefault();
    const found = billings.find(
      (b) => b.id.toLowerCase() === searchId.toLowerCase(),
    );

    if (!found) {
      setSearchedBill("tidak_ada");
    } else {
      setSearchedBill(found);
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
          <button type="submit" className="btn" style={{ width: "100%" }}>
            Simpan ke Private Ledger
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
          <button type="submit" className="btn">
            Cari
          </button>
        </form>

        {searchedBill === "tidak_ada" && (
          <div className="alert-box alert-danger">
            Tagihan tidak ditemukan atau tidak ada transaksi keuangan.
          </div>
        )}

        {searchedBill &&
          searchedBill !== "tidak_ada" &&
          // Skenario Pengujian PDC: Jika RS yang login beda dengan RS pembuat tagihan, akses ditolak secara cantik.
          (searchedBill.rsPembuat !== currentRS ? (
            <div
              className="alert-box alert-danger"
              style={{ padding: "25px", borderRadius: "12px" }}
            >
              <h4>🔒 AKSES DITOLAK (PDC Policy Active)</h4>
              <p>
                Maaf, data finansial pasien ini bersifat rahasia antar-instansi.
                Kebijakan Private Data Collection memblokir akses dari node Anda
                ({currentRS}).
              </p>
            </div>
          ) : (
            <div
              style={{
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
                }}
              />
              <p style={{ fontSize: "18px" }}>
                <strong>
                  Total: Rp {Number(searchedBill.tarif).toLocaleString("id-ID")}
                </strong>
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
