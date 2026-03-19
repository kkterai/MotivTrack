// Simple test to verify App.jsx loads without errors
import App from './App';

console.log('=== DIAGNOSTIC TEST ===');
console.log('1. App component imported:', typeof App);

try {
  console.log('2. Testing imports...');
  
  // Test if stores can be imported
  import('./stores/useAuthStore').then(() => {
    console.log('✓ useAuthStore imported successfully');
  }).catch(err => {
    console.error('✗ useAuthStore import failed:', err);
  });
  
  import('./stores/useTaskStore').then(() => {
    console.log('✓ useTaskStore imported successfully');
  }).catch(err => {
    console.error('✗ useTaskStore import failed:', err);
  });
  
  import('./pages/Login').then(() => {
    console.log('✓ Login page imported successfully');
  }).catch(err => {
    console.error('✗ Login page import failed:', err);
  });
  
  import('./pages/ChildDashboard').then(() => {
    console.log('✓ ChildDashboard imported successfully');
  }).catch(err => {
    console.error('✗ ChildDashboard import failed:', err);
  });
  
  console.log('3. All imports queued for testing');
  
} catch (error) {
  console.error('CRITICAL ERROR during import test:', error);
}

console.log('=== END DIAGNOSTIC TEST ===');
