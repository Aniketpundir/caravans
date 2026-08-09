// Yahan pe duration change kar sakte ho (time change karne ka yahi jagah hai)
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour (60 min * 60 sec * 1000 ms)

export const setToken = (token) => {
    const expiryTime = Date.now() + TOKEN_EXPIRY_MS;
    localStorage.setItem("token", token);
    localStorage.setItem("tokenExpiry", expiryTime.toString());
};

export const getToken = () => {
    const token = localStorage.getItem("token");
    const expiry = localStorage.getItem("tokenExpiry");

    if (!token || !expiry) return null;

    if (Date.now() > Number(expiry)) {
        // Time khatam ho gaya, isliye remove kar do
        removeToken();
        return null;
    }

    return token;
};

export const removeToken = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
};