import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import BookListPage from './pages/BookListPage'
import BookDetailPage from './pages/BookDetailPage'
import BookFormPage from './pages/BookFormPage'
import BestsellersPage from './pages/BestSellerPage'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/"               element={<HomePage />} />
        <Route path="/books"          element={<BookListPage />} />
        <Route path="/books/new"      element={<BookFormPage />} />
        <Route path="/books/:id"      element={<BookDetailPage />} />
        <Route path="/books/:id/edit" element={<BookFormPage />} />
        <Route path="/bestsellers"    element={<BestsellersPage />} />
      </Routes>
    </BrowserRouter>
  )
}
