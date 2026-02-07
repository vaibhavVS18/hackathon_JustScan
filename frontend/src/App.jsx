import React, { useEffect } from "react"
import AppRoutes from "./routes/AppRoutes"
import { ModalProvider } from "./context/modal.context"
import { UserProvider } from "./context/user.context"

import { ToastProvider } from "./context/toast.context"

function App() {
  // Handle Google OAuth callback - extract token from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Store token in localStorage
      localStorage.setItem('token', token);

      // Clean up URL by removing query parameters
      const redirectPage = urlParams.get('redirectPage') || '/';
      window.history.replaceState({}, document.title, redirectPage);

      // Reload to trigger UserContext to fetch user profile
      window.location.reload();
    }
  }, []);

  return (
    <>
      {/* Fixed Background Layer */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-dots-dark opacity-30"></div>
      </div>

      {/* App Content */}
      <div className="relative z-10">
        <UserProvider>
          <ModalProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </ModalProvider>
        </UserProvider>
      </div>
    </>
  )
}

export default App
