import React from "react";
import Delivery from "../components/Delivery";
import Filters from "../components/Filters";
import SearchResult from "../components/SearchResult";
import RecommendedProduct from "../components/RecommendedProduct";
import Subscribe from "../components/Subscribe";
import Footer from "../components/Footer";

const Search = () => {
  return (
    <div>
      <Delivery />
      {/* Search Page Layout */}
      <div className="max-w-[1500px] mx-auto px-4 my-10">
        <div className="flex flex-col lg:flex-row gap-6 h-full lg:min-h-[100vh]">
          <div className="hidden lg:block w-full lg:w-[20%]">
            <Filters />
          </div>
          <div className="w-full lg:w-[80%]">
            <SearchResult />
          </div>
        </div>
      </div>
      <RecommendedProduct />
      <Subscribe/>
      <Footer/>
    </div>
  );
};

export default Search;
