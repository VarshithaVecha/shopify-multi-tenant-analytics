import React from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders'; 
import Customers from './pages/Customers';
import Products from './pages/Products'; 
import NavBar from './components/NavBar'; 
import Profile from "./pages/Profile"; 
import './styles/global.css';

  function RequireAuth({ children }) { 
    const token = localStorage.getItem('token'); 
    return token ? children : <Navigate to="/login" replace />;
  } 
  export default function App() {
    return ( 
    <BrowserRouter> 
      <Routes> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/register" element={<Register />} /> 
        <Route path="/*" element={ <RequireAuth> <Layout /> </RequireAuth> } />
      </Routes>
    </BrowserRouter> 
    ); 
  }

  function Layout() { 
    return ( 
      <>
       <NavBar /> 
       <Routes> 
        <Route path="dashboard/:tenantId" element={<Dashboard />} /> 
        <Route path="customers/:tenantId" element={<Customers />} /> 
        <Route path="orders/:tenantId" element={<Orders />} /> 
        <Route path="products/:tenantId" element={<Products />} /> 
        <Route 
          path="*" 
            element={
              <Navigate 
                to={`dashboard/${localStorage.getItem("tenantId")}`} 
                replace 
              /> 
            } 
        />
        <Route path="profile/:tenantId" element={<Profile />} /> 
         
      </Routes> </>
    ); 
  }