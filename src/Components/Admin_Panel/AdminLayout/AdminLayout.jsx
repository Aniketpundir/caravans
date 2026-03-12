import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminNavbar from '../Adminnavbar/Adminnavbar'

const AdminLayout = () => {
  return (
    <>
      <AdminNavbar />
      <Outlet />
    </>
  )
}

export default AdminLayout