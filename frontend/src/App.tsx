import { Navigate, Route, Routes } from "react-router-dom";
import RetroDesktopShell from "./components/retro/RetroDesktopShell";
import { ProcessMiningProvider } from "./state/ProcessMiningContext";
import AnalysisWindow from "./screens/AnalysisWindow";
import DesktopScreen from "./screens/DesktopScreen";
import ExecutiveReportWindow from "./screens/ExecutiveReportWindow";
import OverviewWindow from "./screens/OverviewWindow";

function App() {
  return (
    <ProcessMiningProvider>
      <RetroDesktopShell>
        <Routes>
          <Route path="/" element={<Navigate to="/desktop" replace />} />
          <Route path="/desktop" element={<DesktopScreen />} />
          <Route path="/overview" element={<OverviewWindow />} />
          <Route path="/analysis/:module" element={<AnalysisWindow />} />
          <Route path="/report" element={<ExecutiveReportWindow />} />
          <Route path="*" element={<Navigate to="/desktop" replace />} />
        </Routes>
      </RetroDesktopShell>
    </ProcessMiningProvider>
  );
}

export default App;
