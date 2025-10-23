import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';

// Gunakan variabel lingkungan yang sudah dikonfigurasi di quasar.config.js
// untuk menjaga kode tetap fleksibel dan aman.
const msalConfig = {
    auth: {
        clientId: process.env.MS_CLIENTID,
        authority: process.env.MS_AUTHORITY,
        knownAuthorities: ["login.microsoftonline.com"]
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: true
    }
};

// Objek msalInstance dibuat hanya sekali
const msalInstance = new PublicClientApplication(msalConfig);

let activeAccount = null;

// Objek authHelper yang akan diekspor
export const authHelper = {
    instance: msalInstance,

    async login(scopes) {
        try {
            // Coba login secara silent terlebih dahulu
            const account = this.getActiveAccount();
            if (account) {
                return await this.acquireTokenSilently(scopes);
            }

            // Jika gagal, lakukan login interaktif
            const response = await msalInstance.loginPopup({
                scopes,
                prompt: 'select_account'
            });

            this.setActiveAccount(response.account);
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async acquireTokenSilently(scopes) {
        const account = this.getActiveAccount();
        if (!account) {
            throw new Error('No active account');
        }

        try {
            return await msalInstance.acquireTokenSilent({
                scopes,
                account
            });
        } catch (silentError) {
            if (silentError instanceof InteractionRequiredAuthError) {
                // Jika interaksi diperlukan, tampilkan pop-up
                return await msalInstance.acquireTokenPopup({ scopes });
            }
            throw silentError;
        }
    },

    getActiveAccount() {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length === 0) return null;
        return activeAccount || accounts[0];
    },

    setActiveAccount(account) {
        activeAccount = account;
        msalInstance.setActiveAccount(account);
    },

    async handleInteractionInProgress() {
        const interactionKey = `msal.${msalConfig.auth.clientId}.interaction.status`;
        const interactionState = sessionStorage.getItem(interactionKey);
        return !!interactionState;
    }
};
