import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
// Import the AuthProvider if you already created it, as per previous steps:
import { AuthProvider } from './context/AuthContext'; 
//                               ^^^^^^^^^^^^^^^^^^^
// Vite is looking for this exact path

// Make sure 'root' is the correct ID from your index.html
ReactDOM.createRoot(document.getElementById('root')).render(

    <Router> {/* Router is now here */}
        <AuthProvider> 
            <App />
        </AuthProvider>
    </Router>
);