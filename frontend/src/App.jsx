import React, { useEffect } from "react"
import AppRoutes from "./routes/AppRoutes"
import { ModalProvider } from "./context/modal.context"
import { UserProvider } from "./context/user.context"
import { ToastProvider } from "./context/toast.context"

function App() {

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      const redirectPage = urlParams.get('redirectPage') || '/';
      window.history.replaceState({}, document.title, redirectPage);
      window.location.reload();
    }
  }, []);

  return (
    <>
      {/* EXACT DESIGN BACKGROUND */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">

        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%]
                        bg-blue-600/10 dark:bg-blue-600/20
                        rounded-full blur-[120px]" />

        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%]
                        bg-blue-600/10 dark:bg-blue-600/20
                        rounded-full blur-[120px]" />

        <div className="absolute inset-0 bg-dots-light dark:bg-dots-dark opacity-30" />
      </div>

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
