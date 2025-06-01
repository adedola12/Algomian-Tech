import asyncH from "express-async-handler";
import Role from "../models/roleModel.js";

/* POST /api/roles  { name, permissions[] }  */
export const createRole = asyncH(async (req, res) => {
  const { name, permissions, store } = req.body;

  const role = await Role.create({
    store, // from request body
    name,
    permissions,
  });

  res.status(201).json(role);
});

/* GET /api/roles */
export const getRoles = asyncH(async (req, res) => {
  const roles = await Role.find({ store: req.user.roles[0].store });
  res.json(roles);
});

/* PATCH /api/roles/:id */
export const updateRole = asyncH(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    res.status(404);
    throw new Error("Role not found");
  }

  role.name = req.body.name ?? role.name;
  role.permissions = req.body.permissions ?? role.permissions;
  await role.save();
  res.json(role);
});

/* DELETE /api/roles/:id */
export const deleteRole = asyncH(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    res.status(404);
    throw new Error("Role not found");
  }
  await role.deleteOne();
  res.json({ message: "Role removed" });
});
