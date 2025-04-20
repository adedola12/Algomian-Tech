import React, { useState } from "react";
import ProductItem from "./ProductItem";
import { useSearch } from "../context/SearchContext";
import SearchError from "./SearchError";

const SearchResult = () => {
  const { filteredProducts, filters } = useSearch();
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage =
    window.innerWidth >= 1024 ? 20 : window.innerWidth >= 768 ? 9 : 6;

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;

  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="max-w-[1500px] mx-auto px-4 my-10">
      {/* Top info bar */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Showing {indexOfFirstProduct + 1} -{" "}
          {Math.min(indexOfLastProduct, filteredProducts.length)} of{" "}
          {filteredProducts.length} results
        </p>
        <div className="text-sm text-gray-600">
          Sort by: <span className="font-medium">Most popular</span>
        </div>
      </div>

      {/* Conditional Rendering */}
      {filteredProducts.length === 0 ? (
        <SearchError query={filters.query} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {currentProducts.map((item, idx) => (
            <ProductItem key={idx} {...item} id={item._id} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-8 gap-2 text-sm">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 border rounded disabled:opacity-40"
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === index + 1
                ? "bg-orange-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className="px-4 py-2 border rounded disabled:opacity-40"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SearchResult;
