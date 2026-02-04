import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
import "./globals.css";
import LenisScroll from "./components/LenisScroll";
import {Toaster} from 'react-hot-toast'

import Generate from "./pages/Generate";
import MyGeneration from "./pages/MyGeneration";
import Login from "./pages/Login";
import ContactSection from "./sections/ContactSection";

export default function App() {
    return (
        <>
            <Toaster/>
            <LenisScroll />
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="generate" element={<Generate />} />
                <Route path="generate/:id" element={<Generate />} />
                <Route path="/mygeneration" element={<MyGeneration />} />
                <Route path="/contact" element={<ContactSection />} />
                {/* <Route path="/preview" element={<Generate />} /> */}
                <Route path="/login" element={<Login />} />
            </Routes>
            {/* <Footer /> */}
        </>
    );
}