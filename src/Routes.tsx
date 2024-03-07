// import { BrowserRouter as Router , Switch, Route } from "react-router-dom";
// import { HelloPage } from './pages/hello';
// import { HelloAgain } from './pages/helloagain';
// import { NotFoundPage } from './pages/notfound';

// export const Routes = () => {
//     return (
//         <Router>
//             <Switch>
//                 <Route path = "/">
//                     <HelloPage/>
//                 </Route>
//                 <Route path ="/helloagain">
//                     <HelloAgain/>
//                 </Route>
//                 <Route>
//                     <NotFoundPage/>
//                 </Route>
//             </Switch>
//         </Router>
//     )
// }

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Hello from './pages/hello';
import HelloAgain from './pages/helloagain';
import NotFound from './pages/notfound';
import Calibration from './pages/calibration';

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
                <Route path="/" element={<Hello />} />
                <Route path="/Calibration" element={<Calibration />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default Paths;

