import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './components/Home/Home.jsx'
import About from './components/About/About.jsx'
import Login from './Page/Login.jsx'
import Signup from './Page/Signup.jsx'
import PrivacyPolicy from './Page/PrivacyPolicy.jsx'
import TermsAndConditions from './Page/TermsAndConditions.jsx'
import RoomAvailability from './Page/RoomAvailability.jsx'
const router =createBrowserRouter([
  {
    path:'/',
    element:<Layout/>,
    children:[
      {
        path:"",
        element:<Home/>
      },
      {
        path:"about",
        element:<About />
      },
      {
        path:"login",
        element:<Login />
      },
      {
        path:"signup",
        element:<Signup />
      },
      {
        path:"privacy-policy",
        element:<PrivacyPolicy />
      },
      {
        path:"terms-and-conditions",
        element:<TermsAndConditions />
      },
      {
        path:"room-availability",
        element:<RoomAvailability />
      }
    ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
