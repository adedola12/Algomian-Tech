// backend/utils/addPerms.js
import { DEFAULT_PERMS_BY_TYPE } from "./defaultPerms.js";

export const addPerms = (u) => ({
  ...u,
  perms: DEFAULT_PERMS_BY_TYPE[u.userType] ?? [],
});
