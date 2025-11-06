import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkoutProvider } from './context/WorkoutContext';
import { Dashboard } from './pages/Dashboard';
import { LogWorkout } from './pages/LogWorkout';
import { History } from './pages/History';

function App() {
  return (
    <WorkoutProvider>
      <BrowserRouter>
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
