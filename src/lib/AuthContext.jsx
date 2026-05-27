import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [student, setStudent] = useState(null)

  useEffect(() => {
    const a = localStorage.getItem('cbt_admin_data')
    const s = localStorage.getItem('cbt_student_data')
    if (a) setAdmin(JSON.parse(a))
    if (s) setStudent(JSON.parse(s))
  }, [])

  const loginAdmin = (token, data) => {
    localStorage.setItem('cbt_admin_token', token)
    localStorage.setItem('cbt_admin_data', JSON.stringify(data))
    setAdmin(data)
  }

  const loginStudent = (token, data) => {
    localStorage.setItem('cbt_student_token', token)
    localStorage.setItem('cbt_student_data', JSON.stringify(data))
    setStudent(data)
  }

  const logoutAdmin = () => {
    localStorage.removeItem('cbt_admin_token')
    localStorage.removeItem('cbt_admin_data')
    setAdmin(null)
  }

  const logoutStudent = () => {
    localStorage.removeItem('cbt_student_token')
    localStorage.removeItem('cbt_student_data')
    setStudent(null)
  }

  return (
    <AuthContext.Provider value={{ admin, student, loginAdmin, loginStudent, logoutAdmin, logoutStudent }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
