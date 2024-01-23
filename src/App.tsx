import React from 'react';
import {Sidebar} from "./components/Sidebar";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Layout} from "./components/Layout";
import {VerletIntegration01} from "./verlet-integration-01/VerletIntegration01";
import {VerletIntegration02} from "./verlet-integration-02/VerletIntegration02";
import {VisualizationXPDB} from "./xpdb/VisualizationXPDB";

function App() {
  return (
      <BrowserRouter>
    <Routes>
      <Route path="/physics-playground/" element={<Layout />}>
        <Route path="/physics-playground/" element={<VerletIntegration01 />} />
        <Route path="/physics-playground/verlet02" element={<VerletIntegration02 />} />
        <Route path="/physics-playground/xpdb" element={<VisualizationXPDB />} />
      </Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App;
