import React from "react";

const ProductSpecification = ({ product }) => {
  if (!product) return null; 

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
      {/* Product Details */}
      <div className="border rounded p-6 shadow-sm bg-white">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">
          Product details
        </h3>
        <hr className="mb-4" />
        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
          {product.details}
        </p>
      </div>

      {/* Specifications Table */}
      <div className="border rounded p-6 shadow-sm bg-white">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">
          Specifications
        </h3>
        <hr className="mb-4" />

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="text-left px-4 py-2 border border-gray-300">Features</th>
                <th className="text-left px-4 py-2 border border-gray-300">Details</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              <tr>
                <td className="border px-4 py-2">Processor</td>
                <td className="border px-4 py-2">{product.processor}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">RAM</td>
                <td className="border px-4 py-2">{product.ram}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Storage</td>
                <td className="border px-4 py-2">{product.storage}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Graphics</td>
                <td className="border px-4 py-2">{product.graphics}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Display</td>
                <td className="border px-4 py-2">{product.display}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductSpecification;
