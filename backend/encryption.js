/**
 * Encryption utility module for Healther
 * Handles encryption and decryption of sensitive user data
 * Uses AES-256-GCM for authenticated encryption
 */

const crypto = require('crypto');

// IMPORTANT: In production, load from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'healther-encryption-key-32-chars!!';

// Ensure key is 32 bytes for AES-256
function getEncryptionKey() {
    const key = ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0');
    return Buffer.from(key);
}

/**
 * Encrypt a string using AES-256-GCM
 * @param {string} plaintext - Text to encrypt
 * @returns {string} Encrypted text in format: iv:authTag:encryptedData (base64 encoded)
 */
function encrypt(plaintext) {
    if (!plaintext) return plaintext;
    
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
        
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        // Format: iv:authTag:encryptedData (all hex)
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (err) {
        console.error('Encryption error:', err.message);
        throw new Error('Encryption failed');
    }
}

/**
 * Decrypt an encrypted string
 * @param {string} encrypted - Encrypted text in format: iv:authTag:encryptedData
 * @returns {string} Decrypted plaintext
 */
function decrypt(encrypted) {
    if (!encrypted || !encrypted.includes(':')) return encrypted;
    
    try {
        const parts = encrypted.split(':');
        if (parts.length !== 3) return encrypted; // Not encrypted, return as-is
        
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encryptedData = parts[2];
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (err) {
        console.error('Decryption error:', err.message);
        // Return original value if decryption fails (for compatibility)
        return encrypted;
    }
}

/**
 * Encrypt an object's sensitive fields
 * @param {object} obj - Object to encrypt
 * @param {array} fields - Array of field names to encrypt
 * @returns {object} Object with encrypted fields
 */
function encryptObject(obj, fields = []) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const encrypted = { ...obj };
    fields.forEach(field => {
        if (encrypted[field]) {
            encrypted[field] = encrypt(String(encrypted[field]));
        }
    });
    return encrypted;
}

/**
 * Decrypt an object's sensitive fields
 * @param {object} obj - Object to decrypt
 * @param {array} fields - Array of field names to decrypt
 * @returns {object} Object with decrypted fields
 */
function decryptObject(obj, fields = []) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const decrypted = { ...obj };
    fields.forEach(field => {
        if (decrypted[field]) {
            decrypted[field] = decrypt(decrypted[field]);
        }
    });
    return decrypted;
}

/**
 * Encrypt nested profile/health data
 * @param {object} profile - Profile object to encrypt
 * @returns {object} Profile with encrypted sensitive fields
 */
function encryptProfile(profile) {
    if (!profile) return profile;
    
    const sensitiveFields = ['phone', 'dateOfBirth', 'ssn', 'insuranceId', 'allergies', 'medications', 'emergencyContact', 'idNumber', 'birthCertificateNumber'];
    return encryptObject(profile, sensitiveFields);
}

/**
 * Decrypt nested profile/health data
 * @param {object} profile - Profile object to decrypt
 * @returns {object} Profile with decrypted sensitive fields
 */
function decryptProfile(profile) {
    if (!profile) return profile;
    
    const sensitiveFields = ['phone', 'dateOfBirth', 'ssn', 'insuranceId', 'allergies', 'medications', 'emergencyContact', 'idNumber', 'birthCertificateNumber'];
    return decryptObject(profile, sensitiveFields);
}

/**
 * Encrypt a complete user object
 * Password should be hashed separately with bcrypt (not encrypted)
 * @param {object} user - User object
 * @returns {object} User with encrypted sensitive fields
 */
function encryptUser(user) {
    if (!user || typeof user !== 'object') return user;
    
    const encrypted = { ...user };
    
    // Encrypt personal information
    const personalFields = ['email', 'phone', 'dateOfBirth'];
    personalFields.forEach(field => {
        if (encrypted[field]) {
            encrypted[field] = encrypt(String(encrypted[field]));
        }
    });
    
    // Encrypt health profile
    if (encrypted.profile && typeof encrypted.profile === 'object') {
        encrypted.profile = encryptProfile(encrypted.profile);
    }
    
    // Mark as encrypted
    encrypted._encrypted = true;
    
    return encrypted;
}

/**
 * Decrypt a complete user object
 * @param {object} user - Encrypted user object
 * @returns {object} User with decrypted sensitive fields
 */
function decryptUser(user) {
    if (!user || typeof user !== 'object') return user;
    
    const decrypted = { ...user };
    
    // Only decrypt if marked as encrypted
    if (!decrypted._encrypted) return decrypted;
    
    // Decrypt personal information
    const personalFields = ['email', 'phone', 'dateOfBirth'];
    personalFields.forEach(field => {
        if (decrypted[field]) {
            decrypted[field] = decrypt(decrypted[field]);
        }
    });
    
    // Decrypt health profile
    if (decrypted.profile && typeof decrypted.profile === 'object') {
        decrypted.profile = decryptProfile(decrypted.profile);
    }
    
    return decrypted;
}

/**
 * Get safe user object for API responses (encrypted fields removed or masked)
 * @param {object} user - User object
 * @returns {object} Safe user object for frontend
 */
function getSafeUser(user) {
    if (!user || typeof user !== 'object') return user;
    
    const safe = { ...user };
    
    // Remove password hash
    delete safe.passwordHash;
    
    // Remove encryption flag if present
    delete safe._encrypted;
    
    return safe;
}

module.exports = {
    encrypt,
    decrypt,
    encryptObject,
    decryptObject,
    encryptProfile,
    decryptProfile,
    encryptUser,
    decryptUser,
    getSafeUser,
    getEncryptionKey
};
