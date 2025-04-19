import React from 'react';
import { assets } from '../assets/assets'; // Make sure the image exists and is imported here

const SearchError = ({ query = "" }) => {
  return (
    <div className="text-center py-16 px-6 max-w-2xl mx-auto">
      <img
        src={assets.error_back}
        alt="No results found"
        className="w-48 mx-auto mb-6"
      />
      <h2 className="text-xl md:text-2xl font-semibold mb-2">
        Sorry, we could not find any matching results for: <span className="text-red-600">{query}</span>
      </h2>
      <div className="text-gray-600 text-sm mt-4">
        <h3 className="font-medium mb-2">Search Tips:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Try checking your spelling or try a related feature</li>
          <li>Check the spelling of brand or keyword</li>
          <li>Try alternative words</li>
          <li>Broaden your search by using a more generic keyword</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchError;
