import React, { useState } from "react";

export default function Dashboard({ pasienList, onViewDetail }) {
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const found = pasienList.find(
      (p) => p.id.toLowerCase() === searchId.toLowerCase(),
    );
    setSearchResult(found || "tidak_ditemukan");
  };

  return (
    <div>
      <div
        className="card"
        style={{ textAlign: "center", padding: "40px 20px" }}
      >
        <h3>Cari Rekam Medis Pasien (blockchain Read Asset)</h3>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Masukkan ID Pasien (Contoh: RM-001 atau RM-002)..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button type="submit" className="btn">
            Cari
          </button>
        </form>

        {searchResult === "tidak_ditemukan" && (
          <div className="alert-box alert-danger">
            ID Pasien tidak ditemukan di Ledger Jaringan ini.
          </div>
        )}

        {searchResult && searchResult !== "tidak_ditemukan" && (
          <div className="alert-box alert-success search-result-row">
            <span>
              Data Ditemukan! Pasien: <strong>{searchResult.nama}</strong>
            </span>
            <button
              className="btn"
              style={{ padding: "6px 12px", fontSize: "13px" }}
              onClick={() => onViewDetail(searchResult)}
            >
              Lihat Detail & Timeline
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Daftar Pasien di Node Terlokalisasi</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID Pasien</th>
                <th>Nama Pasien</th>
                <th>Diagnosa</th>
                <th>Pemilik/Lokasi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pasienList.map((pasien) => (
                <tr key={pasien.id}>
                  <td>
                    <strong>{pasien.id}</strong>
                  </td>
                  <td>{pasien.nama}</td>
                  <td>{pasien.diagnosa}</td>
                  <td>
                    <span className="owner-badge">{pasien.pemilik}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "13px" }}
                      onClick={() => onViewDetail(pasien)}
                    >
                      Detail & Rujuk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
