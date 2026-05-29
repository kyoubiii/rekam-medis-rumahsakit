import React, { useEffect, useState } from "react";
import "./style.css";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import TambahPasien from "./components/TambahPasien";
import DetailPasien from "./components/DetailPasien";
import Billing from "./components/Billing";
import { RS_OPTIONS } from "./constants/instansi";
import { BASE_URL } from "./constants/api"; // 🔥 TAMBAHAN: Import URL Backend

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("medblock-theme") === "dark";
  });
  const [currentRS, setCurrentRS] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPasien, setSelectedPasien] = useState(null);
  
  // 🔥 TAMBAHAN: State untuk ngecek backend nyala atau mati
  const [apiStatus, setApiStatus] = useState("Mengecek..."); 

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    localStorage.setItem("medblock-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // 🔥 TAMBAHAN: Mengecek koneksi ke backend saat web dibuka
  useEffect(() => {
    const cekKoneksiBackend = async () => {
      try {
        const response = await fetch(`${BASE_URL}/status`);
        if (response.ok) {
          setApiStatus("Online 🟢");
        } else {
          setApiStatus("Error 🔴");
        }
      } catch (error) {
        setApiStatus("Offline 🔴");
      }
    };
    cekKoneksiBackend();
  }, []);

 
  // 1. Kosongkan data dummy! Sekarang kita murni pakai data asli dari Blockchain
  const [pasienList, setPasienList] = useState([]);

  // 2. Fungsi sakti untuk narik semua data (Rich Query) dari Backend
  const fetchSemuaPasien = async () => {
    try {
      const response = await fetch(`${BASE_URL}/rekam-medis`);
      const result = await response.json();
      
      if (response.ok && result.data) {
        // Kita sesuaikan nama variabel dari Go (huruf kecil/besar) ke format React
        const mappedData = result.data.map(d => ({
          id: d.idPasien || d.IDPasien,
          nama: d.namaPasien || d.NamaPasien,
          diagnosa: d.riwayatSakit || d.RiwayatSakit,
          tindakan: d.tindakan || d.Tindakan,
          pemilik: d.pemilik || d.Pemilik,
          riwayat: [] // Riwayat detail dikosongkan karena akan ditarik pas tombol Detail diklik
        }));
        
        // Update tabel Dashboard
        setPasienList(mappedData);
      }
    } catch (error) {
      console.error("Gagal menarik data dari blockchain", error);
    }
  };

  // 3. Otomatis jalankan fetchSemuaPasien saat berhasil Login atau saat buka tab Dashboard
  useEffect(() => {
    if (currentRS && activeTab === "dashboard") {
      fetchSemuaPasien();
    }
  }, [currentRS, activeTab]);
  
  const [billings, setBillings] = useState([
    {
      id: "RM-001",
      tarif: "1250000",
      obat: "Amoxicillin, Paracetamol",
      rsPembuat: RS_OPTIONS[0],
    },
  ]);

  // 🔥 INTEGRASI API: Fungsi Rujuk Pasien (Transfer Asset ke Blockchain)
  const handleRujukPasien = async (idPasien, rsTujuan) => {
    try {
      // 1. Tembak API Backend
      const response = await fetch(`${BASE_URL}/rekam-medis/rujuk`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idPasien: idPasien,
          rsTujuan: rsTujuan,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // 2. Kalau sukses di Blockchain, baru kita update UI React-nya
        setPasienList((prev) =>
          prev.map((p) => {
            if (p.id === idPasien) {
              const waktuSekarang = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
              return {
                ...p,
                pemilik: rsTujuan,
                riwayat: [
                  ...p.riwayat,
                  { waktu: waktuSekarang, info: `Pasien dirujuk (Transfer Asset) ke ${rsTujuan} oleh ${currentRS}.` },
                ],
              };
            }
            return p;
          })
        );
        
        setSelectedPasien((prev) => ({
          ...prev,
          pemilik: rsTujuan,
          riwayat: [
            ...prev.riwayat,
            { waktu: "Baru saja", info: `Pasien dirujuk (Transfer Asset) ke ${rsTujuan} oleh ${currentRS}.` },
          ],
        }));

        alert(`✅ Blockchain Berhasil: Pasien sukses dirujuk ke ${rsTujuan}!`);
      } else {
        alert(`❌ Gagal merujuk di Blockchain: ${result.error}`);
      }
    } catch (error) {
      alert(`⚠️ Gagal terhubung ke server backend! Pastikan node app.js nyala.`);
    }
  };

  return (
    <>
      <button
        className="theme-toggle"
        onClick={() => setIsDarkMode((current) => !current)}
        aria-label="Toggle mode malam"
      >
        {isDarkMode ? "Mode siang" : "Mode malam"}
      </button>

      {!currentRS ? (
        <Login onLogin={setCurrentRS} />
      ) : (
        <div className="app-container">
          {/* Navbar Atas */}
          <div className="navbar">
            <div className="brand-block">
              <h2 className="brand-title">
                <span className="brand-wordmark">Med</span>
                <span className="brand-wordmark brand-wordmark-accent">Block</span>
              </h2>
              {/* 🔥 TAMBAHAN: Menampilkan Status API di Navbar */}
              <span className="brand-subtitle">
                Node aktif: {currentRS} | API: {apiStatus}
              </span>
            </div>
            <div className="nav-links">
              <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
                Dashboard
              </button>
              <button className={activeTab === "tambah" ? "active" : ""} onClick={() => setActiveTab("tambah")}>
                Tambah Pasien
              </button>
              <button className={activeTab === "detail" ? "active" : ""} onClick={() => setActiveTab("detail")}>
                Detail & Timeline
              </button>
              <button className={activeTab === "billing" ? "active" : ""} onClick={() => setActiveTab("billing")}>
                Modul Billing (PDC)
              </button>
            </div>
            <div className="navbar-actions">
              <button
                className="btn btn-secondary"
                style={{ padding: "6px 12px" }}
                onClick={() => {
                  setCurrentRS(null);
                  setSelectedPasien(null);
                }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Konten Utama */}
          <main>
            {activeTab === "dashboard" && (
              <Dashboard
                pasienList={pasienList}
                onViewDetail={(pasien) => {
                  setSelectedPasien(pasien);
                  setActiveTab("detail");
                }}
              />
            )}
            {activeTab === "tambah" && (
              <TambahPasien
                currentRS={currentRS}
                onAddPasien={(newPasien) => {
                  setPasienList([newPasien, ...pasienList]);
                  setActiveTab("dashboard");
                }}
              />
            )}
            {activeTab === "detail" && (
              <DetailPasien
                pasien={selectedPasien}
                currentRS={currentRS}
                onRujuk={handleRujukPasien}
              />
            )}
            {activeTab === "billing" && (
              <Billing
                currentRS={currentRS}
                billings={billings}
                onAddBilling={(newBill) => setBillings([newBill, ...billings])}
              />
            )}
          </main>
        </div>
      )}
    </>
  );
}