import React, { useState, useEffect } from "react";
import { RS_OPTIONS } from "../constants/instansi";
import { BASE_URL } from "../constants/api"; // 🔥 TAMBAHAN: Import URL API

export default function DetailPasien({ pasien, currentRS, onRujuk }) {
  if (!pasien) return <p>Pilih pasien terlebih dahulu di dashboard.</p>;

  const rsTujuanList = RS_OPTIONS.filter((rs) => rs !== pasien.pemilik);

  // 🔥 TAMBAHAN: State untuk menyimpan riwayat asli dari Blockchain
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 🔥 TAMBAHAN: Mengambil (Fetch) riwayat saat komponen dibuka
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await fetch(`${BASE_URL}/rekam-medis/history/${pasien.id}`);
        const result = await response.json();
        
        if (response.ok && result.data) {
          // Balik urutan array biar riwayat terbaru ada di paling atas
          setHistoryList(result.data.reverse()); 
        }
      } catch (error) {
        console.error("Gagal menarik riwayat blockchain:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [pasien]); // Akan otomatis memanggil ulang kalau data pasien berubah

  // Fungsi utilitas untuk memformat waktu dari Blockchain
  const formatWaktu = (timestamp) => {
    if (!timestamp) return "Waktu tidak diketahui";
    // Jika formatnya object dari Fabric SDK { seconds: { low } }
    if (timestamp.seconds) {
      const ms = (timestamp.seconds.low || timestamp.seconds) * 1000;
      return new Date(ms).toLocaleString("id-ID");
    }
    // Jika formatnya string biasa
    return new Date(timestamp).toLocaleString("id-ID");
  };

  return (
    <div>
      <div className="card">
        <h3>📋 Detail Rekam Medis Saat Ini</h3>
        <div className="responsive-grid-2" style={{ marginTop: "15px" }}>
          <div>
            <p><strong>ID Pasien:</strong> {pasien.id}</p>
          </div>
          <div>
            <p><strong>Nama Pasien:</strong> {pasien.nama}</p>
          </div>
         <div>
            {/* Pakai "||" biar kalau dari blockchain datanya kosong, otomatis ditulis "Tidak ada catatan" */}
            <p><strong>Riwayat Sakit:</strong> {pasien.diagnosa || pasien.riwayatSakit || "Tidak ada catatan"}</p> 
          </div>
          <div>
            {/* 🔥 DITAMBAHKAN: Tindakan Medis */}
            <p><strong>Tindakan Medis:</strong> {pasien.tindakan}</p> 
          </div>
          <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
            <p>
              <strong>Status Kepemilikan (Asset Owner):</strong>{" "}
              <span style={{ color: "var(--primary)", fontWeight: "bold", padding: "5px 10px", background: "#e0f2fe", borderRadius: "5px" }}>
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
          
          {/* 🔥 PERBAIKAN LOGIKA: Tombol rujuk hanya muncul kalau yang Login adalah Pemilik Sah! */}
          {pasien.pemilik === currentRS ? (
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
          ) : (
            <div className="alert-box alert-danger" style={{ marginTop: "10px" }}>
              ⚠️ Anda login sebagai <strong>{currentRS}</strong>. Anda tidak memiliki izin untuk merujuk pasien ini karena pasien sedang dikelola oleh <strong>{pasien.pemilik}</strong>.
            </div>
          )}
        </div>
      </div>

      {/* Bagian Audit Trail Timeline */}
      <div className="card">
        <h3>⛓️ Jejak Riwayat Blockchain (Audit Trail)</h3>
        <p style={{ color: "var(--text-muted)" }}>
          Pembuktian data immutability. Log di bawah ditarik <strong>langsung dari buku besar jaringan</strong>.
        </p>

        {isLoadingHistory && <p>⏳ Menarik jejak kriptografi dari Ledger...</p>}
        {!isLoadingHistory && historyList.length === 0 && (
          <p>Belum ada riwayat tercatat untuk pasien ini.</p>
        )}

        <div className="timeline">
          {historyList.map((log, index) => {
            // 🔥 DISESUAIKAN DENGAN STRUCT GO CHAINCODE KAMU
            const dataAset = log.record || {}; 
            const txIdPendek = log.txId ? log.txId.substring(0, 8) + "..." : "";
            
            // Go time.Time otomatis jadi string ISO, tinggal kita format ke lokal
            const waktuLokal = log.timestamp ? new Date(log.timestamp).toLocaleString("id-ID") : "Waktu tidak diketahui";

            return (
              <div className="timeline-item" key={index}>
                <strong>🗓️ {waktuLokal}</strong> 
                <span style={{ fontSize: "12px", color: "gray", marginLeft: "10px" }}>
                  (TxID: {txIdPendek})
                </span>
                <p style={{ margin: "5px 0 0 0", color: "var(--text-main)" }}>
                  Data dipegang oleh: <strong>{dataAset.pemilik || "Sistem"}</strong> <br />
                  Tindakan Medis: {dataAset.tindakan || "-"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}