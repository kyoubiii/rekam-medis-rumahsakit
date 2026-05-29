const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

class FabricService {
    constructor() {
        this.channelName = 'medischannel';
        this.chaincodeName = 'rekam-medis';
        this.mspId = 'RSWelasAsihMSP';
    }

    async initWallet() {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        
        // Cek apakah KTP sudah masuk ke dompet aplikasi
        const identity = await wallet.get('welasAsihAdmin');
        if (identity) {
            return wallet;
        }

        console.log("Membaca KTP Digital dari crypto-config...");
        
        const credPath = path.join(__dirname, 'crypto-config', 'peerOrganizations', 'welasasih.mednet.com', 'users', 'Admin@welasasih.mednet.com', 'msp');
        const certPath = path.join(credPath, 'signcerts', 'Admin@welasasih.mednet.com-cert.pem');
        
        // Karena nama file Private Key selalu acak, kita baca isi foldernya langsung
        const keyDir = path.join(credPath, 'keystore');
        const keyFiles = fs.readdirSync(keyDir);
        const keyPath = path.join(keyDir, keyFiles[0]);

        const certificate = fs.readFileSync(certPath).toString();
        const privateKey = fs.readFileSync(keyPath).toString();

        const x509Identity = {
            credentials: {
                certificate: certificate,
                privateKey: privateKey,
            },
            mspId: this.mspId,
            type: 'X.509',
        };

        await wallet.put('welasAsihAdmin', x509Identity);
        console.log('KTP berhasil dimasukkan ke dompet lokal (Wallet)!');
        return wallet;
    }

    async connectToNetwork() {
        try {
            const wallet = await this.initWallet();
            const ccpPath = path.resolve(__dirname, 'connection-welasasih.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            const gateway = new Gateway();
            
            // Buka gerbang ke Fabric
            await gateway.connect(ccp, {
                wallet,
                identity: 'welasAsihAdmin',
                discovery: { enabled: true, asLocalhost: true } 
            });

            const network = await gateway.getNetwork(this.channelName);
            const contract = network.getContract(this.chaincodeName);
            
            console.log('✅ SUKSES: Backend berhasil terhubung ke Smart Contract Rekam Medis!');
            return { contract, gateway };

        } catch (error) {
            console.error(`❌ GAGAL terhubung ke Fabric: ${error}`);
            process.exit(1);
        }
    }
}

module.exports = new FabricService();