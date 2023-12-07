import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GamePage, HomePage, LoginPage, RegisterPage, ReviewPage, TownPage } from './pages';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/game' element={<GamePage />} />
          <Route path='/town' element={<TownPage />} />
          <Route path='/review' element={<ReviewPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
