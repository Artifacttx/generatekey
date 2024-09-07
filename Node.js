const express = require('express');
const app = express();
const port = 3000;
const crypto = require('crypto');

let userKeys = {}; // Store user keys by IP address for simplicity
let validIPs = {}; // Store valid IPs after visiting lootdest.org

app.use(express.json());

app.post('/generate-key', (req, res) => {
    const ip = req.ip;

    // Check if user has visited the required site
    if (!validIPs[ip]) {
        return res.status(403).send('Access denied. Please visit lootdest.org.');
    }

    // Check if the user already has a valid key
    if (userKeys[ip] && userKeys[ip].expiry > Date.now()) {
        return res.status(403).send('Key already generated and not expired yet.');
    }

    // Generate a new key
    const prefix = 'YumeHub';
    const randomKey = crypto.randomBytes(8).toString('hex');
    const key = `${prefix}-${randomKey}`;

    // Set key expiry to 24 hours
    userKeys[ip] = {
        key: key,
        expiry: Date.now() + 24 * 60 * 60 * 1000 // 24 hours later
    };

    res.json({ key: key, expiresOn: new Date(userKeys[ip].expiry).toLocaleString() });
});

app.post('/visit-site', (req, res) => {
    const ip = req.ip;
    validIPs[ip] = true; // Mark the IP as valid for key generation
    res.send('IP recorded. You can now generate a key.');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
