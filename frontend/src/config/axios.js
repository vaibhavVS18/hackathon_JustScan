import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Portal Session ID if available
    const portalSessionId = localStorage.getItem("portal-session-id");
    if (portalSessionId) {
        config.headers['portal-session-id'] = portalSessionId;
    }

    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 403 || error.response.status === 401)) {
            const msg = error.response.data?.message;
            if (msg === "Portal session expired" || msg === "Invalid portal session") {
                localStorage.removeItem("portal-session-id");
                localStorage.removeItem("current-org-id");
                // Optional: Force reload or redirect if needed, but removing items ensures next check fails
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;