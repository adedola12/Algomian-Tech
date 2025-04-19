import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import Band from '../components/Band'
import Brand from '../components/Brand'
import Delivery from '../components/Delivery'
import Offer from '../components/Offer'
import Testimony from '../components/Testimony'
import Subscribe from '../components/Subscribe'
import Blog from '../components/Blog'
import Footer from '../components/Footer'


const Home = () => {
  return (
    <div>
      <Hero/>
      <Band/>
      <LatestCollection/>
      <Brand/>
      <BestSeller/>
      <Delivery/>
      <Offer/>
      <Testimony/>
      <Subscribe />
      <Blog/>
      <Footer/>
    </div>
  )
}

export default Home