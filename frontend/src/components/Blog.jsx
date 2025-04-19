import React from 'react';
import {  blogs } from '../assets/assets';
import BlogPostCard from './BlogPostCard';
import { Link } from 'react-router-dom';

const Blog = () => {
    
  return (
    <div className="max-w-[1500px] mx-auto px-4 my-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-xs text-gray-400">Latest posts</p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#222]">Read Our Blog</h2>
          <p className="text-sm text-gray-600 mt-1">
            Interviews, tips, guides, industry best practices, and news.
          </p>
        </div>
        <Link
          to="/blogs"
          className="bg-purple-500 text-gray-100 px-4 py-2 text-sm rounded hover:bg-purple-200"
        >
          View all posts
        </Link>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {blogs?.slice(0, 3).map((blog, index) => (
          <BlogPostCard key={index} {...blog} />
        ))}
      </div>
    </div>
  );
};

export default Blog;
