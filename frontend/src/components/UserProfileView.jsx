import { Link } from "react-router-dom";

export default function UserProfileView({ user, onLogout, onClose }) {
  const avatar = user?.profileImage || "https://api.dicebear.com/7.x/personas/svg";

  return (
    <div className="w-64 overflow-hidden rounded border bg-white text-sm shadow-lg">
      {/* header */}
      <div className="flex items-center gap-3 border-b p-4">
        <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="truncate font-semibold">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* menu */}
      <ul className="divide-y text-gray-700">
        <li><Link onClick={onClose} to="/profile"     className="block px-4 py-2 hover:bg-gray-50">Personal Information</Link></li>
        <li><Link onClick={onClose} to="/orders"      className="block px-4 py-2 hover:bg-gray-50">My Orders</Link></li>
        <li><Link onClick={onClose} to="/wishlist"    className="block px-4 py-2 hover:bg-gray-50">Wishlist</Link></li>
        <li><Link onClick={onClose} to="/cart"        className="block px-4 py-2 hover:bg-gray-50">My Cart</Link></li>
        {user?.userType === "Admin" && (
          <li><Link onClick={onClose} to="/inventory" className="block px-4 py-2 hover:bg-gray-50">Inventory</Link></li>
        )}
        <li>
          <button onClick={onLogout} className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50">
            Log out
          </button>
        </li>
      </ul>
    </div>
  );
}
