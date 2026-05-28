const grpc = require('@grpc/grpc-js');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const fs = require('fs');
const path = require('path');

// Setup lokasi file sertifikat yang udah lu rename tadi
const mspId = 'WelasAsihMSP'; // Sesuaikan jika kelompok lu pakai nama MSP lain
const certPath = path.resolve(__dirname, 'user.crt');
const keyPath = path.resolve(__dirname, 'user.key');
const tlsCertPath = path.resolve(__dirname, 'ca.crt');

// Endpoint gRPC jaringan blockchain ketua lu (default Fabric biasanya port 7051)
const peerEndpoint = process.env.PEER_ENDPOINT || 'localhost:7051';
const peerHostOverride = process.env.PEER_HOST_OVERRIDE || 'peer0.welasasih.mednet.com';

async function getContract() {
    // 1. Membaca gembok keamanan TLS
    const tlsCredentials = grpc.credentials.createSsl(fs.readFileSync(tlsCertPath));
    const client = new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostOverride,
    });

    // 2. Membaca KTP Digital (Identity)
    const credentials = fs.readFileSync(certPath);
    const identity = { mspId, credentials };

    // 3. Membaca Tanda Tangan Digital (Signer)
    const privateKeyPem = fs.readFileSync(keyPath);
    const signer = signers.newPrivateKeySigner(privateKeyPem);

    // 4. Hubungkan ke Gateway Blockchain
    const gateway = connect({
        client,
        identity,
        signer,
        evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
        submitOptions: () => ({ deadline: Date.now() + 5000 }),
    });

    // 5. Target nama channel dan nama smart contract dari ketua lu
    const network = gateway.getNetwork('mychannel'); 
    const contract = network.getContract('medical_cc'); 

    return { contract, gateway, client };
}

module.exports = { getContract };