import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import { AuthProvider } from './features/auth/AuthContext'
import { EmployeeProvider } from './features/employees/EmployeeContext'
import { ProductProvider } from './features/products/ProductContext'
import { SettingsProvider } from './features/settings/SettingsContext'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <EmployeeProvider>
        <AuthProvider>
          <SettingsProvider>
            <ProductProvider>
              <App />
            </ProductProvider>
          </SettingsProvider>
        </AuthProvider>
      </EmployeeProvider>
    </BrowserRouter>
  </StrictMode>,
)
