package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract menyediakan fungsi-fungsi untuk mengelola rekam medis
type SmartContract struct {
	contractapi.Contract
}

// RekamMedis mendefinisikan struktur data untuk pasien
// Tag JSON digunakan untuk menentukan format data saat disimpan di CouchDB
type RekamMedis struct {
	IDPasien     string `json:"idPasien"`
	NamaPasien   string `json:"namaPasien"`
	RiwayatSakit string `json:"riwayatSakit"`
	Tindakan     string `json:"tindakan"`
	Pemilik      string `json:"pemilik"` // Menandakan RS mana yang membuat/bertanggung jawab
}

// CreateRekamMedis membuat data rekam medis baru dan menyimpannya di buku besar (ledger)
func (s *SmartContract) CreateRekamMedis(ctx contractapi.TransactionContextInterface, id string, nama string, riwayat string, tindakan string, pemilik string) error {
	// 1. Validasi Input: Pastikan data tidak kosong
	if id == "" || nama == "" {
		return fmt.Errorf("ID dan Nama Pasien tidak boleh kosong")
	}

	// 2. Cek apakah rekam medis dengan ID ini sudah ada
	exists, err := s.RekamMedisExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("rekam medis dengan ID pasien %s sudah terdaftar", id)
	}

	// 3. Bentuk objek rekam medis baru
	rekamMedisBaru := RekamMedis{
		IDPasien:     id,
		NamaPasien:   nama,
		RiwayatSakit: riwayat,
		Tindakan:     tindakan,
		Pemilik:      pemilik,
	}

	// 4. Ubah objek (struct) menjadi format JSON (byte array) agar bisa disimpan
	rekamMedisJSON, err := json.Marshal(rekamMedisBaru)
	if err != nil {
		return err
	}

	// 5. Simpan ke dalam ledger
	return ctx.GetStub().PutState(id, rekamMedisJSON)
}

// ReadRekamMedis mengambil data rekam medis pasien berdasarkan ID
func (s *SmartContract) ReadRekamMedis(ctx contractapi.TransactionContextInterface, id string) (*RekamMedis, error) {
	rekamMedisJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("gagal membaca dari dunia state: %v", err)
	}
	if rekamMedisJSON == nil {
		return nil, fmt.Errorf("rekam medis dengan ID %s tidak ditemukan", id)
	}

	// Kembalikan data JSON menjadi struct Go
	var rekamMedis RekamMedis
	err = json.Unmarshal(rekamMedisJSON, &rekamMedis)
	if err != nil {
		return nil, err
	}

	return &rekamMedis, nil
}

// RekamMedisExists adalah fungsi helper untuk mengecek keberadaan aset
func (s *SmartContract) RekamMedisExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	rekamMedisJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("gagal membaca dari dunia state: %v", err)
	}

	return rekamMedisJSON != nil, nil
}

func main() {
	// Inisialisasi smart contract
	rekamMedisChaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		log.Panicf("Error saat membuat chaincode rekam medis: %v", err)
	}

	// Mulai jalankan chaincode
	if err := rekamMedisChaincode.Start(); err != nil {
		log.Panicf("Error saat menjalankan chaincode rekam medis: %v", err)
	}
}