import React from "react";
import {
  FiArrowLeft,
  FiArrowUp,
  FiCreditCard,
  FiTrendingUp,
  FiShoppingBag,
  FiShoppingCart,
} from "react-icons/fi";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

/* pie colours sampled from design */
const PIE_DATA = [
  { name: "Completed", value: 70, colour: "#FCD8C4" },
  { name: "Canceled", value: 30, colour: "#F55F16" },
];

export default function CustomerReportCard({
  /* fallback values for quick mock-ups */
  name = "Olamide Akintan",
  stats = {
    spent: "$ 93,342",
    profit: "$ 342",
    items: "3,132",
    orders: "429",
    delta: "5 %",
  },
  onBack,
}) {
  /* utility to render one metric card */
  const Metric = ({ icon, label, value, showDelta = false }) => (
    <div className="relative bg-white border border-gray-200 rounded-lg p-4 h-full">
      {/* small ghost icon top-right */}
      <span className="absolute top-3 right-3 text-gray-400/60 text-lg">
        {icon}
      </span>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
      {showDelta && (
        <span className="inline-flex items-center text-xs text-green-600 mt-1">
          <FiArrowUp className="mr-1" /> {stats.delta}&nbsp;high&nbsp;today
        </span>
      )}
    </div>
  );

  const navigate = useNavigate()
  const handleBack = onBack || (() => navigate('/customers'))
 

  return (
    <section className="space-y-6">
      {/* back link */}
      <button
        onClick={handleBack}
        className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm"
      >
        <FiArrowLeft className="mr-2" />
        Back&nbsp;to&nbsp;customers
      </button>

      {/* title / breadcrumb */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-800">{name}</h1>
        <nav className="text-sm">
          <span className="text-orange-600 font-medium">Customers</span>
          &nbsp;/&nbsp;
          <span className="text-gray-600">{name}</span>
        </nav>
      </header>

      {/* metrics + chart */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* four tiny cards */}
        <div className="grid sm:grid-cols-2 gap-4 lg:col-span-2">
          <Metric
            icon={<FiCreditCard />}
            label="Amount spent"
            value={stats.spent}
            showDelta
          />
          <Metric
            icon={<FiTrendingUp />}
            label="Profit"
            value={stats.profit}
            showDelta
          />
          <Metric
            icon={<FiShoppingBag />}
            label="Items purchased"
            value={stats.items}
          />
          <Metric
            icon={<FiShoppingCart />}
            label="Total orders"
            value={stats.orders}
            showDelta
          />
        </div>

        {/* doughnut card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 lg:row-span-2 h-full flex flex-col">
          <p className="text-sm text-gray-500 mb-2">Order report</p>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  dataKey="value"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                >
                  {PIE_DATA.map((d) => (
                    <Cell key={d.name} fill={d.colour} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center items-center gap-6 text-xs">
            {PIE_DATA.map((d) => (
              <span key={d.name} className="flex items-center gap-1">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: d.colour }}
                />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
