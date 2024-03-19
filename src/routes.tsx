import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React from 'react';
import Home from "./pages/home";
import Calibration from "./pages/calibration";
import Testing from "./pages/testing";

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
                    <li>
                        <Link to="/Testing"> Testing</Link>
                    </li>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Calibration" element={<Calibration />} />
                <Route path="/Testing" element={<Testing />} />
            </Routes>
        </Router>
    );
}

export default Paths;