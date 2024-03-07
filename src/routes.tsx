import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React from 'react';
import Home from "./pages/home";
import Calibration from "./pages/calibration";

function Paths() {
    return (
        <Router>
            <nav>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/Calibration"> Calibration</Link>
                    </li>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Calibration" element={<Calibration />} />
            </Routes>
        </Router>
    );
}

export default Paths;