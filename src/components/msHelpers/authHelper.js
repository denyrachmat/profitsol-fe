import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';

// 🔧 Updated MSAL config with Edge compatibility
// const msalConfig = {
//   auth: {
//     clientId: process.env.MS_CLIENTID,
//     authority: process.env.MS_AUTHORITY,
//     knownAuthorities: ["login.microsoftonline.com"],
//     redirectUri: window.location.origin,
//     navigateToLoginRequestUrl: false, // Critical for Edge popup flows
//   },
//   cache: {
//     cacheLocation: 'localStorage',
//     storeAuthStateInCookie: true, // Already added - good!
//     secureCookies: window.location.protocol === "https:",
//   },
//   system: {
//     allowNativeBroker: false, // Disable native broker for Edge compatibility
//     windowHashTimeout: 60000, // Longer timeout for Edge
//   }
// };

const msalConfig = {
  auth: {
    clientId: process.env.MS_CLIENTID,
    authority: process.env.MS_AUTHORITY,
    redirectUri: `${window.location.origin}/auth-popup`, // atau /auth-popup
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true,
  }
};

const msalInstance = new PublicClientApplication(msalConfig);
let activeAccount = null;

// 🔧 Edge detection utility
const isEdge = () => /Edg/.test(navigator.userAgent);

export const authHelper = {
  instance: msalInstance,

  // 🔧 Hash cleanup method for Edge
  cleanupEdgeHashState() {
    if (isEdge()) {
      // Clear problematic hash fragments
      if (window.location.hash) {
        const cleanUrl = window.location.origin + window.location.pathname + window.location.search;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      // Clear any MSAL-specific storage that might be corrupted
      const clientId = msalConfig.auth.clientId;
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(clientId) && key.includes('interaction')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  },

  // 🔧 Manual cache clearing method
  clearMsalCache() {
    try {
      // Remove all accounts
      const accounts = msalInstance.getAllAccounts();
      for (const account of accounts) {
        msalInstance.removeAccount(account);
      }

      // Clear all MSAL-related localStorage entries
      const clientId = msalConfig.auth.clientId;
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('msal') || key.includes(clientId))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear active account
      activeAccount = null;
      console.log('MSAL cache cleared manually');
    } catch (error) {
      console.error('Error clearing MSAL cache:', error);
    }
  },

  // 🔧 Updated login method with Edge compatibility
  async login(scopes) {
    try {
      // Clean up Edge hash state FIRST
      this.cleanupEdgeHashState();

      // Check for existing account (but handle Edge differently)
      const account = this.getActiveAccount();
      if (account && !isEdge()) {
        // Only try silent auth on non-Edge browsers
        try {
          return await this.acquireTokenSilently(scopes);
        } catch (error) {
          console.log('Silent token acquisition failed, proceeding with popup');
        }
      }

      // 🔧 Edge-specific login configuration
      const loginConfig = {
        scopes,
        prompt: isEdge() ? "login" : "select_account", // Force fresh login on Edge
        loginHint: "",
      };

      // Add Edge-specific parameters
      // if (isEdge()) {
      //   loginConfig.extraQueryParameters = {
      //     prompt: "login",
      //     response_mode: "fragment",
      //   };
      // }

      const response = await msalInstance.loginPopup(loginConfig);
      this.setActiveAccount(response.account);

      // 🔧 Force popup window closure for Edge
      if (isEdge()) {
        // Give MSAL a moment to process the response
        setTimeout(() => {
          // Close any lingering popup windows
          if (window.msalPopupWindow && !window.msalPopupWindow.closed) {
            window.msalPopupWindow.close();
          }
          // Clean up hash state after successful login
          this.cleanupEdgeHashState();
        }, 100);
      }

      return response;

    } catch (error) {
      console.error('Login error:', error);

      // 🔧 Special handling for Edge hash errors
      if (isEdge() && error.message && error.message.includes('hash')) {
        console.log('Retrying login with Edge compatibility mode...');
        return await this.retryEdgeLogin(scopes);
      }

      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await msalInstance.loginPopup({
        scopes,
        prompt: "login",
        extraQueryParameters: {
          response_mode: "query", // Try query instead of fragment for Edge
        }
      });

      this.setActiveAccount(response.account);

      // 🔧 Force popup window closure for Edge retry
      setTimeout(() => {
        if (window.msalPopupWindow && !window.msalPopupWindow.closed) {
          window.msalPopupWindow.close();
        }
        this.cleanupEdgeHashState();
      }, 100);

      return response;
    }
  },

  // 🔧 Updated silent token acquisition with Edge handling
  async acquireTokenSilently(scopes) {
    const account = this.getActiveAccount();
    if (!account) {
      throw new Error('No active account');
    }

    try {
      return await msalInstance.acquireTokenSilent({
        scopes,
        account,
        forceRefresh: isEdge(), // Force refresh on Edge to prevent stale tokens
      });
    } catch (silentError) {
      if (silentError instanceof InteractionRequiredAuthError) {
        return await msalInstance.acquireTokenPopup({
          scopes,
          account,
          prompt: isEdge() ? "consent" : "none", // Edge-specific prompt
        });
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

  // 🔧 Updated interaction check using localStorage for Edge compatibility
  async handleInteractionInProgress() {
    const interactionKey = `msal.${msalConfig.auth.clientId}.interaction.status`;
    // Use localStorage instead of sessionStorage for Edge compatibility
    const interactionState = localStorage.getItem(interactionKey);
    return !!interactionState;
  },

  // 🔧 Initialize Edge compatibility
  initializeEdgeCompatibility() {
    if (isEdge()) {
      // Prevent Edge from caching auth redirects
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Cache-Control';
      meta.content = 'no-cache, no-store, must-revalidate';
      document.head.appendChild(meta);

      // Listen for hash changes and clean them up
      window.addEventListener('hashchange', () => {
        if (window.location.hash.includes('error') || window.location.hash.includes('access_token')) {
          // Let MSAL handle the hash first, then clean up
          setTimeout(() => {
            this.cleanupEdgeHashState();
          }, 100);
        }
      });
    }
  },

  // 🔧 Logout method with Edge cleanup
  async logout() {
    try {
      const account = this.getActiveAccount();
      if (account) {
        await msalInstance.logoutPopup({ account });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear cache on logout
      this.clearMsalCache();
      this.cleanupEdgeHashState();
    }
  }
};

// 🔧 Initialize Edge compatibility when module loads
if (typeof window !== 'undefined') {
  authHelper.initializeEdgeCompatibility();
}