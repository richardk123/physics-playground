import React from 'react';
import {Sidebar} from "./components/Sidebar";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Layout} from "./components/Layout";
import {VerletIntegration01} from "./verlet-integration-01/VerletIntegration01";

function App() {
  return (
      <BrowserRouter>
    <Routes>
      <Route path="/physics-playground/" element={<Layout />}>
        <Route path="/physics-playground/" element={<VerletIntegration01 />} />
      </Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App;
