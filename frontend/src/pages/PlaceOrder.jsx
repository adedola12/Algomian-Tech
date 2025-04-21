import React, { useContext, useState } from "react";
import DeliveryInfo from "../components/DeliveryInfo";
import DeliveryMethod from "../components/DeliveryMethod";
import PaymentMethod from "../components/PaymentMethod";
import MyOrder from "../components/MyOrder";
import Footer from "../components/Footer";
import EditShippingInfo from "../components/EditShippingInfo";
import ContactInfo from "../components/ContactInfo";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const PlaceOrder = () => {
  const navigate = useNavigate();

  const [deliveryList, setDeliveryList] = useState(
    JSON.parse(localStorage.getItem("deliveryInfo")) || []
  );

  const {cartItems} = useContext(ShopContext)
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editIndex, setEditIndex] = useState(null);

  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

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

  const generateOrderId = () => {
    const id = `ORDER-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    localStorage.setItem("latestOrderId", id);
    return id;
  };
  
  const generateTrackingId = () => {
    const code = `IZ99AA${Date.now().toString().slice(-10)}`;
    localStorage.setItem("trackingId", code);
    return code;
  };
  
  const handlePlaceOrder = () => {
    const selectedAddress = deliveryList[selectedIndex];
  
    localStorage.setItem("selectedDeliveryMethod", deliveryMethod);
    localStorage.setItem("selectedPaymentMethod", paymentMethod);
    localStorage.setItem("deliveryInfo", JSON.stringify([selectedAddress]));
    localStorage.setItem("orderedItems", JSON.stringify(cartItems)); // 👈 save ordered items
  
    const orderId = generateOrderId();
    const trackingId = generateTrackingId();
    localStorage.setItem("orderSuccessMessage", `Thank you! Your Order ID is ${orderId}`);
  
    navigate("/order-success");
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

            <DeliveryMethod
              selected={deliveryMethod}
              onChange={setDeliveryMethod}
            />
            <PaymentMethod
              selected={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full lg:w-1/3">
            <MyOrder mode="place" onPlaceOrder={handlePlaceOrder} />
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
