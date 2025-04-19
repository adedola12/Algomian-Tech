import React from "react";

const Subscribe = () => {
  return (
    <div className="px-4 py-10">
      <div className="max-w-[1500px] mx-auto bg-[#4338CA] text-white rounded-lg px-6 py-8 md:px-10 md:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Text Section */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
              Join 2,000+ subscribers
            </h3>
            <p className="text-sm text-gray-200">
              Stay in the loop with everything you need to know.
            </p>
          </div>

          {/* Right Input Section */}
          <div className="flex-1 w-full">
            <form className="flex flex-col sm:flex-row items-center gap-4 sm:gap-2 w-full justify-end">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white text-black rounded px-4 py-2 text-sm outline-none w-full sm:max-w-[300px]"
              />
              <button
                type="submit"
                className="bg-orange-500 text-white text-sm font-semibold px-5 py-2 rounded hover:bg-orange-600 transition"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-300 mt-2 text-center sm:text-right">
              We care about your data in our{" "}
              <a href="#" className="underline">
                privacy policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
