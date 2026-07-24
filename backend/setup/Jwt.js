const jwt = require('jsonwebtoken');

// 1. Define user info (payload)
const payload = {
    userId: "12345",
    role: "admin"
};

// 2. Define a secret key (keep this safe in real apps!)
const secretKey = "your_super_secret_key_here";

// 3. Generate the token with options (e.g., expires in 1 hour)
const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

console.log("Your Generated JWT:\n", token);

// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
