// Simple hash function to encode/decode roll numbers
  // Uses base62 encoding with a salt for obfuscation
  const SALT = 847523; // Salt value for encoding
  const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  export function encodeRoll(roll) {
    // Convert roll to number and add salt
    const num = parseInt(roll) + SALT;
    let encoded = '';
    let n = num;
    
    // Convert to base62
    while (n > 0) {
      encoded = CHARSET[n % 62] + encoded;
      n = Math.floor(n / 62);
    }
    
    // Pad to 6 characters
    return encoded.padStart(6, CHARSET[0]);
  }
  
  export function decodeHash(hash) {
    // Convert base62 back to number
    let num = 0;
    
    for (let i = 0; i < hash.length; i++) {
      const char = hash[i];
      let value = -1;
      
      // Find character in charset (case insensitive)
      if (char >= 'A' && char <= 'Z') {
        value = char.charCodeAt(0) - 'A'.charCodeAt(0);
      } else if (char >= 'a' && char <= 'z') {
        value = char.charCodeAt(0) - 'a'.charCodeAt(0) + 26;
      } else if (char >= '0' && char <= '9') {
        value = char.charCodeAt(0) - '0'.charCodeAt(0) + 52;
      }
      
      if (value === -1) return null;
      num = num * 62 + value;
    }
    
    // Subtract salt and return as string
    const roll = (num - SALT).toString();
    return roll;
  }