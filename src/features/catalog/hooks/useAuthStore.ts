import { defineStore } from 'pinia';

export type UserRole = 'admin' | 'user' | null;

interface AuthState {
    isLoggedIn: boolean;
    userRole: UserRole;
    error: string | null;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
        userRole: localStorage.getItem('userRole') as UserRole || null,
        error: null
    }),

    actions: {
        login(password: string): boolean {
            this.error = null;
            
            if (password === '999999') {
                this.isLoggedIn = true;
                this.userRole = 'admin';
                this.saveSession();
                return true;
            } else if (password === '666777') {
                this.isLoggedIn = true;
                this.userRole = 'user';
                this.saveSession();
                return true;
            } else {
                this.error = 'INVALID ACCESS CODE';
                return false;
            }
        },

        logout() {
            this.isLoggedIn = false;
            this.userRole = null;
            this.error = null;
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userRole');
        },

        saveSession() {
            localStorage.setItem('isLoggedIn', 'true');
            if (this.userRole) {
                localStorage.setItem('userRole', this.userRole);
            }
        },

        clearError() {
            this.error = null;
        }
    }
});
