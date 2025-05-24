import React, { useEffect, useRef, useState } from "react";
import { FaBell, FaBars, FaArrowLeft } from "react-icons/fa";
import { FiUser }                      from "react-icons/fi";
import { useMatch, useNavigate }       from "react-router-dom";
import api                             from "../api";

/* your API base (Vite / CRA).  Fallback: same origin */
const API = import.meta?.env?.VITE_API_BASE || "";

export default function InventNav({
  toggleSidebar,
  currentUser,
  lastSeenSaleISO,
  onSalesPing,
}) {
  const navigate  = useNavigate();
  const isAdd     = useMatch({ path: "/inventory/add-product", end: true });
  const isEdit    = useMatch({ path: "/inventory/edit-product/:productId", end: true });
  const goBack    = () => navigate(-1);
  const [unread, setUnread] = useState(0);

  /* ─────────────────── real-time SSE feed ─────────────────── */
  useEffect(() => {
    const es = new EventSource(`${API}/api/orders/stream`, { withCredentials: true });

       es.addEventListener("unsupported", () => {
           // DB cannot stream – rely on poll only
           es.close();
         });

    es.onmessage = (e) => {
      try {
        const sale = JSON.parse(e.data);
        const last = lastSeenSaleISO ? new Date(lastSeenSaleISO) : new Date(0);
        if (new Date(sale.createdAt) > last) {
          setUnread((n) => n + 1);
        }
      } catch {/* ignore badly-formed packets */}
    };

    es.onerror = () => {
      es.close();              // Connection lost – stop attempting.
      // (The 30 s poll will still cover us.)
    };

    return () => es.close();
  }, [lastSeenSaleISO]);

  /* ─────────────────── 30 s fallback poll ─────────────────── */
  useEffect(() => {
    const poll = async () => {
      try {
        const since = lastSeenSaleISO || new Date(0).toISOString();
        const { data } = await api.get("/api/orders/new-count", {
          params: { since },
          withCredentials: true,
        });
        setUnread(data.count || 0);
      } catch {/* ignore */}
    };
    poll();                                         // first run now
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, [lastSeenSaleISO]);

  /* mark as read */
  const acknowledge = () => {
    setUnread(0);
    onSalesPing?.(new Date().toISOString());
  };

  /* ───────────────────────── UI ───────────────────────── */
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center
                       justify-between border-b border-gray-200 bg-white
                       px-4 md:px-8 shadow-sm">
      {/* left controls */}
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar}
                className="text-xl text-gray-600 md:hidden">
          <FaBars />
        </button>

        {(isAdd || isEdit) && (
          <>
            <button onClick={goBack}
                    className="rounded p-1.5 text-lg text-purple-600 hover:bg-purple-50">
              <FaArrowLeft />
            </button>
            <span onClick={goBack}
                  className="cursor-pointer text-base font-medium">
              {isAdd ? "Add Product" : "Edit Product"}
            </span>
          </>
        )}
      </div>

      {/* right controls */}
      <div className="flex items-center gap-4">
        <button onClick={acknowledge} className="relative">
          <FaBell className="text-lg text-gray-600" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center
                             rounded-full bg-orange-500 text-[10px] font-semibold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {currentUser?.profileImage ? (
          <img
            src={currentUser.profileImage}
            alt="profile"
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-8 w-8 place-items-center rounded-full bg-orange-100">
            <FiUser className="text-lg text-orange-500" />
          </div>
        )}
      </div>
    </header>
  );
}
