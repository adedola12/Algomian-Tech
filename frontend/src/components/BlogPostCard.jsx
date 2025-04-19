import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const BlogPostCard = ({ id, title, author, date, description, tags, image }) => {
  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden hover:shadow-md transition">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{author} • {date}</p>
        <Link to={`/blogs/${id}`} className="flex justify-between items-center">
          <h3 className="font-semibold text-base text-gray-800">{title}</h3>
          <FaArrowRight className="text-gray-400 text-xs" />
        </Link>
        <p className="text-sm text-gray-600 mt-1">{description}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-gray-100 text-xs text-gray-700 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;
