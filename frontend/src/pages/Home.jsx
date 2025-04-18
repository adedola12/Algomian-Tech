import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import Band from '../components/Band'
import Brand from '../components/Brand'


const Home = () => {
  return (
    <div>
      <Hero/>
      <Band/>
      <LatestCollection/>
      <Brand/>
      <BestSeller/>
    </div>
  )
}

export default Home