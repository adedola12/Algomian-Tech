import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Collection from './pages/Collection'
import Content from './pages/Content'
import Orders from './pages/Orders'
import PlaceOrder from './pages/PlaceOrder'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Navbar from './components/Navbar'

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'> 
    <Navbar/>
      <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/collection' element={<Collection />} />
          <Route path='/content' element={<Content />} />
          <Route path='orders' element={<Orders />} />
          <Route path='/place-order' element={<PlaceOrder />} />
          <Route path='/product/:productId' element={<Product />} />
          <Route path='/login' element={<Login />} />
          <Route path='/collection/:id' element={<Collection />} />
      </Routes>
    </div>
  )
}

export default App