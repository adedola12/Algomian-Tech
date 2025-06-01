/*  backend/utils/defaultPerms.js */
import { ALL_PERMISSIONS } from "../constants/permissions.js";

export const DEFAULT_PERMS_BY_TYPE = {
  /* full access ----------------------------------------------------------- */
  Admin: ALL_PERMISSIONS.map((p) => p.id),

  /* managers run the business                                              */
  Manager: [
    "order.view",
    "order.edit",
    "sale.approve",
    "product.view",
    "product.edit",
    "product.add",
    "product.approve",
    "product.section.general",
    "product.section.variants",
    "product.section.availability",
    "product.section.description",
    "product.section.save",
    "inventory.approve",
    "shipment.view",
    "customer.view",
    "stats.view",
  ],

  /* sales reps keep it simple                                              */
  SalesRep: [
    "order.view",
    "order.create",
    "product.view",
    "product.section.general",
    "product.section.description",
    "product.section.save",
    "customer.view",
    "stats.view",
  ],

  /* warehouse / fulfilment                                                 */
  Logistics: [
    "shipment.view",
    "shipment.create",
    "shipment.update",
    "order.view",
  ],

  /* procurement desk                                                       */
  Procurement: ["proc.request", "proc.approve", "product.view", "product.add"],

  /* inventory officers                                                     */
  Inventory: [
    "product.view",
    "product.add",
    "product.edit",
    "product.delete",
    "product.section.general",
    "product.section.variants",
    "product.section.availability",
    "product.section.description",
    "product.section.save",
    "inventory.approve",
    "product.approve",
  ],

  /* self-service customers                                                 */
  Customer: [],
};
