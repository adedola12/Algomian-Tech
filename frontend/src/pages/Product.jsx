import React from 'react'
import ProductDetails from '../components/ProductDetails'
import ProductSpecification from '../components/ProductSpecification'
import { useParams } from 'react-router-dom'


const Product = () => {
  const {productId} = useParams()
  const product = products.find((p) => p._id === productId)

  if (!product){
    return <div className="text-center mt-10 text-red-500">Product not found!</div>
  }

  return (
   <div className="max-w-[1500px] mx-auto px-4 py-10">
      <ProductDetails product={product} />
      <ProductSpecification product={product} />
    </div>
  )
}

export default Product