import React from "react";
import { RS_OPTIONS } from "../constants/instansi";

export default function DetailPasien({ pasien, currentRS, onRujuk }) {
  if (!pasien) return <p>Pilih pasien terlebih dahulu di dashboard.</p>;

  const rsTujuanList = RS_OPTIONS.filter((rs) => rs !== pasien.pemilik);

  return (
    <div>
      <div className="card">
        <h3>📋 Detail Rekam Medis Saat Ini</h3>
        <div className="responsive-grid-2" style={{ marginTop: "15px" }}>
          <div>
            <p>
              <strong>ID Pasien:</strong> {pasien.id}
            </p>
          </div>
          <div>
            <p>
              <strong>Nama Pasien:</strong> {pasien.nama}
            </p>
          </div>
          <div>
            <p>
              <strong>Diagnosa Terakhir:</strong> {pasien.diagnosa}
            </p>
          </div>
          <div>
            <p>
              <strong>Status Kepemilikan (Asset Owner):</strong>{" "}
              <span style={{ color: "var(--primary)", fontWeight: "bold" }}>
                {pasien.pemilik}
              </span>
            </p>
          </div>
        </div>

        {/* Form Modal/Section Rujuk Pasien */}
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            background: "#f1f5f9",
            borderRadius: "8px",
          }}
        >
          <h4>🔄 Fitur Rujuk Pasien (Transfer Asset Blockchain)</h4>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Menekan tombol di bawah akan mengubah hak akses dan kepemilikan
            rekam medis secara instan ke rumah sakit tujuan.
          </p>
          <div className="rs-grid rs-grid-referral">
            {rsTujuanList.map((rsTujuan) => (
              <button
                key={rsTujuan}
                className="btn"
                style={{ backgroundColor: "#f59e0b" }}
                onClick={() => onRujuk(pasien.id, rsTujuan)}
              >
                Rujuk ke {rsTujuan}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bagian Audit Trail Timeline */}
      <div className="card">
        <h3>⛓️ Jejak Riwayat Blockchain (Audit Trail - GetRiwayatPasien)</h3>
        <p style={{ color: "var(--text-muted)" }}>
          Pembuktian data immutability. Log di bawah ditarik langsung dari
          histori ledger.
        </p>

        <div className="timeline">
          {pasien.riwayat.map((log, index) => (
            <div className="timeline-item" key={index}>
              <strong>🗓️ {log.waktu}</strong>
              <p style={{ margin: "5px 0 0 0", color: "var(--text-main)" }}>
                {log.info}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
