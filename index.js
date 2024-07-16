const express = require('express');
const bodyParser = require('body-parser');
const { WebpayPlus } = require('transbank-sdk');
const ngrok = require('ngrok');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const webpay = new WebpayPlus.Transaction();

app.get('/', (req, res) => {
    res.send('Hola, este es mi proyecto con Express, Transbank y Ngrok!');
});

app.post('/pagar', async (req, res) => {
    const { buyOrder, sessionId, amount, returnUrl } = req.body;
    console.log('Request received:', req.body);
    try {
        const response = await webpay.create(buyOrder, sessionId, amount, returnUrl);
        console.log('Transaction response:', response);
        res.json({ url: response.url, token: response.token });
    } catch (error) {
        console.error('Error creando la transacción:', error);
        res.status(500).send('Error creando la transacción');
    }
});

// Ruta de retorno que redirige a la app de Expo
app.get('/return', (req, res) => {
    const { token_ws } = req.query;
    const redirectUrl = `exp://192.168.1.103:8081/--/transaction-complete?token_ws=${token_ws}`;
    res.redirect(redirectUrl);
});

app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
    (async function() {
        try {
            const url = await ngrok.connect(3000);
            console.log(`Servidor accesible públicamente en: ${url}`);
        } catch (error) {
            console.error('Error iniciando Ngrok:', error);
        }
    })();
});
