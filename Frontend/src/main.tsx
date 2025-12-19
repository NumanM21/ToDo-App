import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom";
// Similar to Program.cs
// React bootstrapper 
createRoot(document.getElementById('root')!).render(
  <StrictMode>
      {/*BrowerserRouter allows routing throughout the app - hence we wrapp <App with it - app router created */}
      <BrowserRouter> 
          <App />
      </BrowserRouter>
  </StrictMode>,
)
