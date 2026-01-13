import 'react-datepicker/dist/react-datepicker.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorProvider } from './contexts/ErrorContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
        <ErrorProvider>
            <App />
        </ErrorProvider>
    </ThemeProvider>
);
