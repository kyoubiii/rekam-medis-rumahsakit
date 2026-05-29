package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

// 1. Struct Aset Publik (Bisa dilihat kedua RS)
type RekamMedis struct {
	IDPasien     string `json:"idPasien"`
	NamaPasien   string `json:"namaPasien"`
	RiwayatSakit string `json:"riwayatSakit"`
	Tindakan     string `json:"tindakan"`
	Pemilik      string `json:"pemilik"` // Menandakan RS yang merawat saat ini
}

// 2. Struct untuk Fitur GetAssetHistory
type RiwayatRekamMedis struct {
	TxId      string      `json:"txId"`
	Timestamp time.Time   `json:"timestamp"`
	Record    *RekamMedis `json:"record"`
}

// 3. Struct Aset Privat / PDC (Hanya dilihat RS tertentu)
type TagihanPrivate struct {
	IDPasien     string `json:"idPasien"`
	TotalTagihan int    `json:"totalTagihan"`
	DetailObat   string `json:"detailObat"`
}

// --- FUNGSI STANDAR ---

func (s *SmartContract) CreateRekamMedis(ctx contractapi.TransactionContextInterface, idPasien string, nama string, sakit string, tindakan string, pemilik string) error {
	rm := RekamMedis{
		IDPasien:     idPasien,
		NamaPasien:   nama,
		RiwayatSakit: sakit,
		Tindakan:     tindakan,
		Pemilik:      pemilik,
	}
	rmJSON, err := json.Marshal(rm)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(idPasien, rmJSON)
}

func (s *SmartContract) ReadRekamMedis(ctx contractapi.TransactionContextInterface, idPasien string) (*RekamMedis, error) {
	rmJSON, err := ctx.GetStub().GetState(idPasien)
	if err != nil {
		return nil, fmt.Errorf("gagal membaca data: %v", err)
	}
	if rmJSON == nil {
		return nil, fmt.Errorf("pasien %s tidak ditemukan", idPasien)
	}
	var rm RekamMedis
	err = json.Unmarshal(rmJSON, &rm)
	if err != nil {
		return nil, err
	}
	return &rm, nil
}

// --- FUNGSI GET ALL (RICH QUERY COUCHDB) ---

// GetAllRekamMedis menggunakan Rich Query CouchDB untuk mengambil semua data pasien
func (s *SmartContract) GetAllRekamMedis(ctx contractapi.TransactionContextInterface) ([]*RekamMedis, error) {
	// Kita mencari semua dokumen di state database yang field "idPasien"-nya tidak kosong.
	queryString := `{"selector":{"idPasien":{"$ne":""}}}`

	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var pasienList []*RekamMedis
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var pasien RekamMedis
		err = json.Unmarshal(queryResponse.Value, &pasien)
		if err != nil {
			return nil, err
		}
		pasienList = append(pasienList, &pasien)
	}

	return pasienList, nil
}

// --- FUNGSI TRANSFER ASSET (RUJUK PASIEN) ---

func (s *SmartContract) RujukPasien(ctx contractapi.TransactionContextInterface, idPasien string, rsTujuan string) error {
	rm, err := s.ReadRekamMedis(ctx, idPasien)
	if err != nil {
		return err
	}

	// Pindah penguasaan / lokasi (Transfer Asset)
	rm.Pemilik = rsTujuan
	rmJSON, err := json.Marshal(rm)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(idPasien, rmJSON)
}

// --- FUNGSI GET ASSET HISTORY (AUDIT TRAIL) ---

func (s *SmartContract) GetRiwayatPasien(ctx contractapi.TransactionContextInterface, idPasien string) ([]*RiwayatRekamMedis, error) {
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(idPasien)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var riwayat []RiwayatRekamMedis
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var rm RekamMedis
		if len(response.Value) > 0 {
			err = json.Unmarshal(response.Value, &rm)
			if err != nil {
				return nil, err
			}
		}

		// Konversi Timestamp bawaan Fabric ke format waktu standar
		timestamp := time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos))
		riwayatRecord := RiwayatRekamMedis{
			TxId:      response.TxId,
			Timestamp: timestamp,
			Record:    &rm,
		}
		riwayat = append(riwayat, riwayatRecord)
	}

	var riwayatPtr []*RiwayatRekamMedis
	for i := range riwayat {
		riwayatPtr = append(riwayatPtr, &riwayat[i])
	}
	return riwayatPtr, nil
}

// --- FUNGSI PRIVATE DATA COLLECTION (PDC) ---

// Create tagihan menggunakan Transient Data agar nominal uang tidak terekam di buku besar publik
// Create tagihan menggunakan Transient Data
func (s *SmartContract) CreateTagihanPrivate(ctx contractapi.TransactionContextInterface, namaKoleksi string) error {
	transientMap, err := ctx.GetStub().GetTransient()
	if err != nil {
		return fmt.Errorf("gagal mendapatkan data transient: %v", err)
	}

	tagihanJSON, ok := transientMap["tagihan_data"]
	if !ok {
		return fmt.Errorf("data transient 'tagihan_data' tidak ditemukan")
	}

	var tagihan TagihanPrivate
	err = json.Unmarshal(tagihanJSON, &tagihan)
	if err != nil {
		return fmt.Errorf("gagal unmarshal data tagihan: %v", err)
	}

	// Simpan ke brankas rahasia sesuai parameter namaKoleksi
	return ctx.GetStub().PutPrivateData(namaKoleksi, tagihan.IDPasien, tagihanJSON)
}

// Read tagihan dari brankas rahasia
func (s *SmartContract) ReadTagihanPrivate(ctx contractapi.TransactionContextInterface, namaKoleksi string, idPasien string) (*TagihanPrivate, error) {
	tagihanJSON, err := ctx.GetStub().GetPrivateData(namaKoleksi, idPasien)
	if err != nil {
		return nil, fmt.Errorf("gagal membaca data privat: %v", err)
	}
	if tagihanJSON == nil {
		return nil, fmt.Errorf("tagihan pasien %s tidak ditemukan atau anda tidak memiliki akses ke %s", idPasien, namaKoleksi)
	}

	var tagihan TagihanPrivate
	err = json.Unmarshal(tagihanJSON, &tagihan)
	if err != nil {
		return nil, err
	}
	return &tagihan, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		log.Panicf("Error saat membuat chaincode rekam medis: %v", err)
	}
	if err := chaincode.Start(); err != nil {
		log.Panicf("Error saat menjalankan chaincode: %v", err)
	}
}
