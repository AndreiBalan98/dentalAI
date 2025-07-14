const express       = require('express');
const voiceRoutes   = require('./routes/voice');
const smsRoutes     = require('./routes/sms');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/voice', voiceRoutes);
app.use('/sms', smsRoutes);

app.get('/', (req, res) => {
    res.send('Server DentalAI - Clinica Dinți de Fier');
});

app.listen(PORT, () => {
    console.log(`🦷 Server pornit pe portul ${PORT}`);
});