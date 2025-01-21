import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Sender from './components/Sender'
import Receiver from './components/Receiver'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/sender' element={<Sender />} />
        <Route path='/receiver' element={<Receiver />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
