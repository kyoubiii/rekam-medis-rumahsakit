import React, { useState } from 'react';
import { BASE_URL } from '../constants/api';

export default function TambahPasien({ currentRS, onAddPasien }) {
  const [formData, setFormData] = useState({ idPasien: '', namaPasien: '', riwayatSakit: '', tindakan: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/rekam-medis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPasien: formData.idPasien,
          namaPasien: formData.namaPasien,
          riwayatSakit: formData.riwayatSakit,
          tindakan: formData.tindakan,
          pemilik: currentRS
        })
      });
      const result = await response.json();
      if (response.ok) {
        alert('✅ Berhasil disimpan ke Blockchain!');
        // Update local state untuk tabel Dashboard
        onAddPasien({ 
            id: formData.idPasien, 
            nama: formData.namaPasien, 
            diagnosa: formData.riwayatSakit, // Disamakan dengan key di tabel dashboard
            tindakan: formData.tindakan,
            pemilik: currentRS, 
            riwayat: [{ waktu: 'Baru saja', info: `Didaftarkan oleh ${currentRS}` }] 
        });
        setFormData({ idPasien: '', namaPasien: '', riwayatSakit: '', tindakan: '' });
      } else {
        alert('❌ Gagal: ' + result.error);
      }
    } catch (error) {
      alert('Error koneksi ke Backend');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Tambah Rekam Medis Baru (CreateAsset)</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <div>
            <label style={{ fontWeight: 'bold' }}>ID Pasien</label>
            <input type="text" placeholder="Misal: RM-006" value={formData.idPasien} onChange={e => setFormData({...formData, idPasien: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
        </div>
        <div>
            <label style={{ fontWeight: 'bold' }}>Nama Lengkap</label>
            <input type="text" placeholder="Nama Pasien" value={formData.namaPasien} onChange={e => setFormData({...formData, namaPasien: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
        </div>
        <div>
            <label style={{ fontWeight: 'bold' }}>Riwayat Sakit</label>
            <input type="text" placeholder="Misal: Tipes" value={formData.riwayatSakit} onChange={e => setFormData({...formData, riwayatSakit: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
        </div>
        <div>
            <label style={{ fontWeight: 'bold' }}>Tindakan Medis</label>
            <input type="text" placeholder="Misal: Pemberian Antibiotik" value={formData.tindakan} onChange={e => setFormData({...formData, tindakan: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
        </div>
        <div>
            <label style={{ fontWeight: 'bold' }}>Pemilik (Otomatis Sesuai Login)</label>
            <input type="text" value={currentRS} disabled style={{ width: '100%', padding: '10px', marginTop: '5px', backgroundColor: '#e2e8f0' }} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? "Menyimpan ke Ledger..." : "Simpan ke Blockchain"}
        </button>
      </form>
    </div>
  );
}