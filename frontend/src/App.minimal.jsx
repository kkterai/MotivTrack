import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  console.log('=== MINIMAL APP RENDERING ===');
  
  return (
    <BrowserRouter>
      <div style={{ padding: '50px', fontSize: '24px', background: '#f0f0f0' }}>
        <h1>Minimal App Test</h1>
        <p>If you see this, routing is working</p>
        <Routes>
          <Route path="/" element={<div>Home Route</div>} />
          <Route path="/test" element={<div>Test Route</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
