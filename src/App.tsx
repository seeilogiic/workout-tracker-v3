import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkoutProvider } from './context/WorkoutContext';
import { Dashboard } from './pages/Dashboard';
import { LogWorkout } from './pages/LogWorkout';
import { History } from './pages/History';

// Get base path from Vite config (matches vite.config.ts)
const basePath = import.meta.env.BASE_URL || '/';

function App() {
  return (
    <WorkoutProvider>
      <BrowserRouter basename={basePath}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<LogWorkout />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </BrowserRouter>
    </WorkoutProvider>
  );
}

export default App;
