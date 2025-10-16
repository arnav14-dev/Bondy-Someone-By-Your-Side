import './App.css'
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/authPage.jsx';
import UsersPage from './pages/usersPage.jsx';
import HomePage from './pages/homePage.jsx';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<AuthPage />} />
        <Route path='/users' element={<UsersPage />} />
        <Route path='/home' element={<HomePage />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
