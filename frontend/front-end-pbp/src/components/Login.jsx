import React from "react";
import { RS_OPTIONS } from "../constants/instansi";

export default function Login({ onLogin }) {
  const handleSelectInstansi = (rsName) => onLogin(rsName);

  return (
    <div className="login-screen">
      <div className="card login-card">
        <h2>Sistem Rekam Medis Blockchain</h2>
        <p className="login-subtitle">
          Silakan pilih instansi Anda untuk masuk ke jaringan Node
        </p>

        <div className="login-categories">
          <button
            className="btn"
            onClick={() => handleSelectInstansi("RS Welas Asih")}
          >
            Masuk sebagai RS Welas Asih
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => handleSelectInstansi("RS Muhammadiyah")}
          >
            Masuk sebagai RS Muhammadiyah
          </button>
        </div>
      </div>
    </div>
  );
}