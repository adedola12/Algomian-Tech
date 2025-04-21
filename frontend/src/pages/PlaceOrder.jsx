import React, { useState } from "react";
import DeliveryInfo from "../components/DeliveryInfo";
import DeliveryMethod from "../components/DeliveryMethod";
import PaymentMethod from "../components/PaymentMethod";
import MyOrder from "../components/MyOrder";
import Footer from "../components/Footer";
import EditShippingInfo from "../components/EditShippingInfo";
import ContactInfo from "../components/ContactInfo";

const PlaceOrder = () => {
  const [deliveryList, setDeliveryList] = useState(
    JSON.parse(localStorage.getItem("deliveryInfo")) || []
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editIndex, setEditIndex] = useState(null);

  const handleEditDelivery = (index) => {
    setEditIndex(index);
  };

  const handleSaveEdit = (data) => {
    const updated = [...deliveryList];
    updated[editIndex] = data;
    setDeliveryList(updated);
    setEditIndex(null);
    localStorage.setItem("deliveryInfo", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <div className="w-full max-w-[1440px] mx-auto px-4 py-10 flex-1">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
          {/* LEFT SIDE */}
          <div className="w-full lg:w-2/3 space-y-8">
            {editIndex !== null ? (
              <EditShippingInfo
                initialData={deliveryList[editIndex]}
                onContinue={handleSaveEdit}
              />
            ) : (
              <DeliveryInfo
                deliveries={deliveryList}
                readOnly={true}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
                onEdit={handleEditDelivery}
              />
            )}

            <DeliveryMethod />
            <PaymentMethod />
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full lg:w-1/3">
            <MyOrder mode="place" />
          </div>
        </div>
      </div>

      <div className="bg-white border-t">
        <div className="w-full max-w-[1440px] mx-auto px-4 py-10">
          <ContactInfo />
        </div>
      </div>

      <footer className="mt-auto bg-white">
        <Footer />
      </footer>
    </div>
  );
};

export default PlaceOrder;
