import React, { useContext, useState, useEffect } from "react"
import { auth } from "../firebase"


/**
 * Authentication context to handle user authentication for
 * restricted pages (Dashboard, Statistics, Game, etc.)
 */
const AuthContext = React.createContext()

export function useAuth() {
  return useContext(AuthContext)
}

/*
    Authentication Provider
*/
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  const [loading, setLoading] = useState(true)

  /*
    Sign up with Email and Password
  */
  function signup(email, password) {
    return auth.createUserWithEmailAndPassword(email, password)
  }

  /*
    Login with Email and Password
  */
  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
  }

  /*
    Logout with Email and Password
  */
  function logout() {
    return auth.signOut()
  }

  /*
    Reset Password for Email
  */
  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email)
  }

  /*
    Update Email
  */
  function updateEmail(email) {
    return currentUser.updateEmail(email)
  }

  /*
    Update Email
  */
  function updatePassword(password) {
    return currentUser.updatePassword(password)
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}