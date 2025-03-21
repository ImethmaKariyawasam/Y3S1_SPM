import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import ContactUs from "./pages/ContactUs";
import Header from "./components/Header";
import FooterComp from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import DashCustomerOrders from "./components/DashCustomerOrders";
import { ToastContainer } from "react-toastify";
export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer/>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path ="/DashCustomerOrders" element={<DashCustomerOrders />} />

        <Route element={<PrivateRoute/>}>
        <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/contact-us" element={<ContactUs />} />
      </Routes>
      <FooterComp/>
    </BrowserRouter>
  );
}
