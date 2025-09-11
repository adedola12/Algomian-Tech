// src/hooks/useMe.js
import { useEffect, useState } from "react";
import api from "../api";

export default function useMe() {
  const [me, setMe] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (!me?._id || !me?.userType) {
      api
        .get("/api/users/profile", { withCredentials: true })
        .then(({ data }) => {
          localStorage.setItem("userInfo", JSON.stringify(data));
          setMe(data);
        })
        .catch(() => {}); // ignore; keep local copy
    }
  }, []); // run once

  return me;
}
