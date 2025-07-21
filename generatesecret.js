// generateSecret.js
const crypto = require('crypto');

// Generate a secure random string of 64 bytes and convert to hex
const generateSecret = () => {
  const secret = crypto.randomBytes(64).toString('hex');
  console.log('Generated JWT_SECRET:');
  console.log(secret);

  console.log('\nAdd this to your .env file as:');
  console.log(`JWT_SECRET=${secret}`);
  console.log(`NEXTAUTH_SECRET=${secret}`);
};

generateSecret();
