import bcrypt from 'bcryptjs';

/**
 * Hash password dengan bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Verify password
 * @param password Plain text password
 * @param hash Hashed password
 * @returns true if match
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
        if (!hash || !hash.startsWith('$2')) {
            return false;
        }
        return bcrypt.compare(password, hash);
    } catch (e) {
        console.error('Password verification error:', e);
        return false;
    }
}

/**
 * HANYA untuk development/testing
 * Generate temporary password
 * @returns Temporary password (20 chars)
 */
export function generateTempPassword(): string {
    // DO NOT USE IN PRODUCTION
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}
