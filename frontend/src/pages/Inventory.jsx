import React from 'react'
import InventTop from '../components/InventTop'
import InventTable from '../components/InventTable'

const Inventory = () => {
  return (
    <div>
        <InventTop />
        <div className="mt-10">


        <InventTable />
        </div>
    </div>
  )
}

export default Inventory