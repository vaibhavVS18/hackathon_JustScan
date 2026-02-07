import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedPortalRoute = () => {
    const sessionId = localStorage.getItem("portal-session-id");
    const token = localStorage.getItem("token");

    if (!sessionId || !token) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedPortalRoute;
