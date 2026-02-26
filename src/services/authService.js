/**
 * Authentication service for handling secure user sessions using localStorage.
 * This simulates a persistent login session.
 */
export const AuthService = {
    /**
     * Authenticates a user against the local storage 'database'.
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    login: async (email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (!email || !password) {
                    return resolve({ success: false, message: 'Email and password are required' });
                }

                if (password.length < 8) {
                    return resolve({ success: false, message: 'Password must be at least 8 characters long' });
                }

                // Get registered users
                const users = JSON.parse(localStorage.getItem('pte_users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    const mockToken = `token_${Math.random().toString(36).substring(2)}`;
                    const sessionUser = { ...user };
                    delete sessionUser.password; // Don't store password in session

                    localStorage.setItem('pte_auth_token', mockToken);
                    localStorage.setItem('pte_user', JSON.stringify(sessionUser));
                    resolve({ success: true });
                } else {
                    resolve({ success: false, message: 'Invalid email or password. Please create an account first.' });
                }
            }, 600);
        });
    },

    /**
     * Registers a new user and stores them in localStorage.
     * @param {string} name 
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    register: async (name, email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (!name || !email || !password) {
                    return resolve({ success: false, message: 'All fields are required' });
                }

                if (password.length < 8) {
                    return resolve({ success: false, message: 'Password must be at least 8 characters' });
                }

                const users = JSON.parse(localStorage.getItem('pte_users') || '[]');

                // Check if user already exists
                if (users.some(u => u.email === email)) {
                    return resolve({ success: false, message: 'This email is already registered' });
                }

                const newUser = {
                    user_id: 'usr_' + Math.floor(Math.random() * 1000000000),
                    name,
                    email,
                    password, // Storing in plain text for this local-only simulation
                    target_score: 79,
                    overall_average: 0,
                    registeredAt: new Date().toISOString()
                };

                users.push(newUser);
                localStorage.setItem('pte_users', JSON.stringify(users));

                // Auto login after registration
                const mockToken = `token_${Math.random().toString(36).substring(2)}`;
                const sessionUser = { ...newUser };
                delete sessionUser.password;

                localStorage.setItem('pte_auth_token', mockToken);
                localStorage.setItem('pte_user', JSON.stringify(sessionUser));

                resolve({ success: true });
            }, 800);
        });
    },

    /**
     * Logs out the user by clearing the persistent storage.
     */
    logout: () => {
        localStorage.removeItem('pte_auth_token');
        localStorage.removeItem('pte_user');
    },

    /**
     * Checks if the user has an active persistent session.
     * @returns {boolean}
     */
    isAuthenticated: () => {
        const token = localStorage.getItem('pte_auth_token');
        return !!token; // Returns true if token exists
    },

    /**
     * Gets the currently logged in user info.
     * @returns {Object|null}
     */
    getUser: () => {
        const userStr = localStorage.getItem('pte_user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
};
