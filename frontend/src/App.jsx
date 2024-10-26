import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Auth from './pages/auth'
import Home from './pages/home'
import Settings from './pages/settings'
import About from './pages/about'
import Profile from './pages/profile'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
    const [auth, setAuth] = useState(localStorage.getItem('auth'))
    const [ml, setMl] = useState(64);

    useEffect(() => {
        if (auth) {
            localStorage.setItem('auth', auth)
        } else {
            localStorage.removeItem('auth')
            setAuth(null)
        }

        return () => {
            if (auth) {
                localStorage.setItem('auth', auth)
            }
        }
    }, [localStorage])

    return (
        <Router>
            <div className="flex">
                {auth && <Sidebar ml={ml} setMl={setMl} />}
                <div className={`flex-grow transition-all duration-300 ${auth && `${ml === 14 && "ml-14"} ${ml === 64 && "ml-64"}`}`}>
                    <Routes>
                        <Route path="/auth" element={<Auth />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Home />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/about"
                            element={
                                <ProtectedRoute>
                                    <About />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    )
}

export default App