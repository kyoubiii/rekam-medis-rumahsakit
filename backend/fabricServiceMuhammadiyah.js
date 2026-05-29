const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

class FabricServiceMuhammadiyah {
    constructor() {
        this.channelName = 'medischannel';
        this.chaincodeName = 'rekam-medis';
        // 1. Ganti MSP ID
        this.mspId = 'RSMuhammadiyahMSP'; 
    }

    async initWallet() {
        // 2. Bikin folder dompet terpisah biar nggak berantem sama Welas Asih
        const walletPath = path.join(process.cwd(), 'wallet-muhammadiyah');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        
        // 3. Nama KTP di dalam dompet
        const identity = await wallet.get('muhammadiyahAdmin');
        if (identity) {
            return wallet;
        }

        console.log("Membaca KTP Digital Muhammadiyah dari crypto-config...");
        
        // 4. Arahkan ke folder crypto-config milik Muhammadiyah
        const credPath = path.join(__dirname, 'crypto-config', 'peerOrganizations', 'muhammadiyah.mednet.com', 'users', 'Admin@muhammadiyah.mednet.com', 'msp');
        const certPath = path.join(credPath, 'signcerts', 'Admin@muhammadiyah.mednet.com-cert.pem');
        
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

        await wallet.put('muhammadiyahAdmin', x509Identity);
        console.log('KTP Muhammadiyah berhasil dimasukkan ke dompet (wallet-muhammadiyah)!');
        return wallet;
    }

    async connectToNetwork() {
        try {
            const wallet = await this.initWallet();
            
            // 5. MENGGUNAKAN CONNECTION PROFILE MUHAMMADIYAH
            const ccpPath = path.resolve(__dirname, 'connection-muhammadiyah.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            const gateway = new Gateway();
            
            await gateway.connect(ccp, {
                wallet,
                identity: 'muhammadiyahAdmin',
                discovery: { enabled: true, asLocalhost: true } 
            });

            const network = await gateway.getNetwork(this.channelName);
            const contract = network.getContract(this.chaincodeName);
            
            console.log('✅ SUKSES: Backend Muhammadiyah terhubung ke Smart Contract!');
            return { contract, gateway };

        } catch (error) {
            console.error(`❌ GAGAL terhubung ke Fabric Muhammadiyah: ${error}`);
            process.exit(1);
        }
    }
}

// Export langsung instance-nya
module.exports = new FabricServiceMuhammadiyah();