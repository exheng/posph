import React from 'react'
import{Outlet}from"react-router-dom";
function MainLayoutAuth() {
  return (
    <div>
        <Outlet/>
    </div>
  )
}

export default MainLayoutAuth;