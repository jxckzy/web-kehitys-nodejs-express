import express from 'express';
import router from './api/index.js';
import cors from 'cors';
const hostname = '127.0.0.1';
const port = 3000;
const app = express();

import requestTime from './api/middlewares/request-time.js';

app.use(cors());

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
// app.use('/images', express.static('public'));

// middlewaret, myös express on sellainen
// suoritetaan ennen reittejä
app.use(requestTime);

// needed for reading request body in JSON format
app.use(express.json());

// Parses URL-encoded form data (like HTML forms)
app.use(express.urlencoded({extended: true}));

// Ohjataan kaikki /api/v1/-alkuiset pyynnöt apin router middlewarelle (api/index.js)
app.use('/api/v1', router);

// käynnistään HTTP-palvelimen kuuntelemaan porttia
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
