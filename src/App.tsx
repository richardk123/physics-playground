import React from 'react';
import {HashRouter, Route, Routes} from "react-router-dom";
import {Layout} from "./components/Layout";
import {VerletIntegration01} from "./verlet-integration-01/VerletIntegration01";
import {VerletIntegration02} from "./verlet-integration-02/VerletIntegration02";
import {VisualizationXPDB} from "./xpdb/VisualizationXPDB";
import {VisualizationXPDB2} from "./xpbd-02/VisualizationXPDB2";
import {VisualizationFluidSim} from "./fluid-sim/VisualizationFluidSim";
import {FluidGpu} from "./fluid-gpu/ui/FluidGpu";
import {NBodyGPU} from "./n-body-gpu/ui/NBodyGPU";

function App() {
  return (
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<VerletIntegration01 />} />
            <Route path="/verlet02" element={<VerletIntegration02 />} />
            <Route path="/xpdb" element={<VisualizationXPDB />} />
            <Route path="/xpdb2" element={<VisualizationXPDB2 />} />
            <Route path="/fluid-gpu" element={<FluidGpu />} />
            <Route path="/fluid-sim" element={<VisualizationFluidSim />} />
            <Route path="/n-body-gpu" element={<NBodyGPU />} />
          </Route>
        </Routes>
      </HashRouter>
  );
}

export default App;
