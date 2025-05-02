import express from 'express';
import PERM    from '../models/permissionEnum.js';
import { getAdminStats  } from "../controllers/adminStatsController.js";
import { protect, authorize, isAdmin } from '../middleware/authMiddleware.js';
import {
  createRole, getRoles, updateRole, deleteRole
} from '../controllers/roleController.js';
import {
  inviteUser, listUsers, updateUserRoles
} from '../controllers/adminUserController.js';

const router = express.Router();

/*──── roles ────*/
// router.route('/roles')
//   .post(protect, authorize(PERM.ROLE_MANAGE), createRole)
//   .get (protect, authorize(PERM.ROLE_MANAGE), getRoles);
  
  router.route('/roles')
  .post(protect, createRole)
  .get (protect, getRoles);

router.route('/roles/:id')
  .patch(protect, authorize(PERM.ROLE_MANAGE), updateRole)
  .delete(protect, authorize(PERM.ROLE_MANAGE), deleteRole);

/*──── users ────*/
router.route('/users')
  .post(protect, authorize(PERM.USER_MANAGE), inviteUser)
  .get (protect, authorize(PERM.USER_MANAGE), listUsers);

router.patch('/users/:id/roles',
  protect, authorize(PERM.USER_MANAGE), updateUserRoles);

  router.get("/stats", protect, isAdmin, getAdminStats );

export default router;
