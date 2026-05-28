import React, { useMemo, useState } from "react";
import { RS_OPTIONS } from "../constants/instansi";

export default function Login({ onLogin }) {
  const [otherRS, setOtherRS] = useState("");
  const [showOtherOptions, setShowOtherOptions] = useState(false);

  const otherHospitals = useMemo(
    () =>
      RS_OPTIONS.filter(
        (rsName) => rsName !== "RS Welas Asih" && rsName !== "RS Muhammadiyah",
      ),
    [],
  );

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

          <button
            className="btn btn-ghost"
            onClick={() => setShowOtherOptions((current) => !current)}
          >
            RS lainnya
          </button>

          {showOtherOptions && (
            <div className="other-rs-panel">
              <label htmlFor="other-rs-select">Pilih rumah sakit lain</label>
              <div className="other-rs-actions">
                <select
                  id="other-rs-select"
                  value={otherRS}
                  onChange={(e) => setOtherRS(e.target.value)}
                >
                  <option value="">Pilih RS</option>
                  {otherHospitals.map((rsName) => (
                    <option key={rsName} value={rsName}>
                      {rsName}
                    </option>
                  ))}
                </select>
                <button
                  className="btn"
                  disabled={!otherRS}
                  onClick={() => handleSelectInstansi(otherRS)}
                >
                  Masuk
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
