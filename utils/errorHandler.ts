export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseError';
    }
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof AuthenticationError) {
        return 'Username atau password salah';
    }
    if (error instanceof DatabaseError) {
        return 'Database error. Coba lagi nanti.';
    }
    if (error instanceof Error) {
        if (error.message.includes('fetch')) return 'Koneksi jaringan bermasalah';
        return error.message;
    }
    return 'Terjadi kesalahan yang tidak diketahui';
}
