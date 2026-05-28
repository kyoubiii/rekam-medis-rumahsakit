const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Manggil file routes yang baru kita bikin
const rekamMedisRoutes = require('./routes/rekamMedisRoutes');

// Pasang routes-nya pakai awalan '/api'
app.use('/api', rekamMedisRoutes);

app.listen(port, () => {
    console.log(`Server jalan di http://localhost:${port}`);
});