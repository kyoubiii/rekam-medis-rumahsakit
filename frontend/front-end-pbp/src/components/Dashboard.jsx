import React, { useState } from "react";
// 🔥 TAMBAHAN: Import URL API untuk nembak Backend
import { BASE_URL } from "../constants/api";

export default function Dashboard({ pasienList, onViewDetail }) {
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  
  // 🔥 TAMBAHAN: State untuk indikator Loading saat nunggu balasan Blockchain
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 DIROMBAK: Fungsi Cari sekarang nembak langsung ke Blockchain via Backend API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId) return;

    setIsLoading(true);
    setSearchResult(null);

    try {
      // Nembak API ReadRekamMedis dari backend kamu
      const response = await fetch(`${BASE_URL}/rekam-medis/${searchId}`);
      const result = await response.json();

      if (response.ok) {
        // Karena data dari blockchain bentuknya beda sama mockup lama, kita harus mapping ulang
        // biar cocok dibaca sama halaman DetailPasien nanti.
        const dataAsli = result.data;
        const mappedPasien = {
            id: dataAsli.idPasien, // Asumsi key dari chaincode kamu ID
            nama: dataAsli.namaPasien, // Asumsi key dari chaincode kamu Nama
            diagnosa: dataAsli.Sakit, // Asumsi key dari chaincode kamu Sakit
            tindakan: dataAsli.tindakan, // Asumsi key dari chaincode kamu Tindakan
            pemilik: dataAsli.pemilik, // Asumsi key dari chaincode kamu Pemilik
            riwayat: [] // Riwayat akan ditarik terpisah nanti di halaman Detail
        };
        setSearchResult(mappedPasien);
      } else {
        setSearchResult("tidak_ditemukan");
      }
    } catch (error) {
      console.error("Error mencari pasien:", error);
      alert("Gagal terhubung ke Backend Node.js!");
      setSearchResult("tidak_ditemukan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div
        className="card"
        style={{ textAlign: "center", padding: "40px 20px" }}
      >
        <h3>Cari Rekam Medis Pasien (Blockchain Read Asset)</h3>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Masukkan ID Pasien (Contoh: RM-001)..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? "Mencari..." : "Cari"}
          </button>
        </form>

        {searchResult === "tidak_ditemukan" && (
          <div className="alert-box alert-danger">
            ID Pasien <strong>{searchId}</strong> tidak ditemukan di Ledger Jaringan ini.
          </div>
        )}

        {searchResult && searchResult !== "tidak_ditemukan" && (
          <div className="alert-box alert-success search-result-row">
            <span>
              Data Asli Ditemukan! Pasien: <strong>{searchResult.nama}</strong> <br/>
              <small>Dikelola oleh: {searchResult.pemilik}</small>
            </span>
            <button
              className="btn"
              style={{ padding: "6px 12px", fontSize: "13px" }}
              onClick={() => onViewDetail(searchResult)}
            >
              Lihat Detail & Timeline Asli
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3><center>Daftar Pasien</center></h3>
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