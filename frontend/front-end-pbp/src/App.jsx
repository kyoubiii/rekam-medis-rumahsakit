import React, { useEffect, useState } from "react";
import "./style.css";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import TambahPasien from "./components/TambahPasien";
import DetailPasien from "./components/DetailPasien";
import Billing from "./components/Billing";
import { RS_OPTIONS } from "./constants/instansi";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("medblock-theme") === "dark";
  });
  const [currentRS, setCurrentRS] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPasien, setSelectedPasien] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    localStorage.setItem("medblock-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Data awal tiruan (Mock Data) untuk simulasi sidang
  const [pasienList, setPasienList] = useState([
    {
      id: "RM-001",
      nama: "Budi Santoso",
      diagnosa: "Infeksi Saluran Pernapasan",
      tindakan: "Rawat Inap & Oksigenasi",
      pemilik: RS_OPTIONS[0],
      riwayat: [
        {
          waktu: "08:00 WIB",
          info: `Pasien RM-001 didaftarkan masuk ${RS_OPTIONS[0]}.`,
        },
        { waktu: "11:00 WIB", info: "Dilakukan pemeriksaan lab awal." },
      ],
    },
    {
      id: "RM-002",
      nama: "Siti Aminah",
      diagnosa: "Hipertensi",
      tindakan: "Pemberian Amlodipin",
      pemilik: RS_OPTIONS[1],
      riwayat: [
        {
          waktu: "09:30 WIB",
          info: `Pasien RM-002 didaftarkan masuk ${RS_OPTIONS[1]}.`,
        },
      ],
    },
  ]);

  // Data Keuangan tiruan untuk simulasi PDC
  const [billings, setBillings] = useState([
    {
      id: "RM-001",
      tarif: "1250000",
      obat: "Amoxicillin, Paracetamol",
      rsPembuat: RS_OPTIONS[0],
    },
  ]);

  // Fungsi Simulasi Rujuk Pasien (Transfer Asset)
  const handleRujukPasien = (idPasien, rsTujuan) => {
    setPasienList((prev) =>
      prev.map((p) => {
        if (p.id === idPasien) {
          const waktuSekarang =
            new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }) + " WIB";
          return {
            ...p,
            pemilik: rsTujuan,
            riwayat: [
              ...p.riwayat,
              {
                waktu: waktuSekarang,
                info: `Pasien dirujuk (Transfer Asset) ke ${rsTujuan} oleh ${currentRS}.`,
              },
            ],
          };
        }
        return p;
      }),
    );
    // update state detail yang sedang dibuka
    setSelectedPasien((prev) => ({
      ...prev,
      pemilik: rsTujuan,
      riwayat: [
        ...prev.riwayat,
        {
          waktu: "Baru saja",
          info: `Pasien dirujuk (Transfer Asset) ke ${rsTujuan} oleh ${currentRS}.`,
        },
      ],
    }));
    alert(`Pasien berhasil dirujuk ke ${rsTujuan}!`);
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
                <span className="brand-wordmark brand-wordmark-accent">
                  Block
                </span>
              </h2>
              <span className="brand-subtitle">Node aktif: {currentRS}</span>
            </div>
            <div className="nav-links">
              <button
                className={activeTab === "dashboard" ? "active" : ""}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard
              </button>
              <button
                className={activeTab === "tambah" ? "active" : ""}
                onClick={() => setActiveTab("tambah")}
              >
                Tambah Pasien
              </button>
              <button
                className={activeTab === "detail" ? "active" : ""}
                onClick={() => setActiveTab("detail")}
              >
                Detail & Timeline
              </button>
              <button
                className={activeTab === "billing" ? "active" : ""}
                onClick={() => setActiveTab("billing")}
              >
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
