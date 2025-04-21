import React, { useState } from "react";
import ShippingInfo from "../components/ShippingInfo";
import EditShippingInfo from "../components/EditShippingInfo";
import MyOrder from "../components/MyOrder";
import DeliveryInfo from "../components/DeliveryInfo";
import Footer from "../components/Footer";

const Shipping = () => {
  const [deliveryList, setDeliveryList] = useState([]);
  const [showShippingForm, setShowShippingForm] = useState(true);
  const [editIndex, setEditIndex] = useState(null);

  const handleAddShipping = (data) => {
    if (editIndex !== null) {
      const updated = [...deliveryList];
      updated[editIndex] = data;
      setDeliveryList(updated);
      setEditIndex(null);
    } else {
      setDeliveryList((prev) => [...prev, data]);
    }
    setShowShippingForm(false);
  };

  const handleAddNew = () => {
    setEditIndex(null);
    setShowShippingForm(true);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setShowShippingForm(true);
  };

  const handleDelete = (index) => {
    const filtered = deliveryList.filter((_, i) => i !== index);
    setDeliveryList(filtered);
  };

  const handleNext = () => {
    // Navigate to next step (e.g., /payment or summary review)
    window.location.href = "/payment"; // update with actual route
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <div className="w-full max-w-[1440px] mx-auto px-4 py-10 flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left */}
          <div className="flex-1 w-full">
            {showShippingForm ? (
              editIndex !== null ? (
                <EditShippingInfo
                  initialData={deliveryList[editIndex]}
                  onContinue={handleAddShipping}
                />
              ) : (
                <ShippingInfo onContinue={handleAddShipping} />
              )
            ) : (
              <DeliveryInfo
                deliveries={deliveryList}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onNext={handleNext}
              />
            )}
          </div>

          {/* Right */}
          <div className="w-full lg:w-[360px]">
            <MyOrder />
          </div>
        </div>
      </div>

      <footer className="mt-auto bg-white">
        <Footer />
      </footer>
    </div>
  );
};

export default Shipping;
