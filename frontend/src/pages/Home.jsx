import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import Band from '../components/Band'
import Brand from '../components/Brand'
import Delivery from '../components/Delivery'
import Offer from '../components/Offer'


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
    </div>
  )
}

export default Home