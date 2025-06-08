export const ALL_PERMISSIONS = [
  /* ─── Orders ───────────────────────────── */
  { id: "order.view", label: "Can view orders" },
  { id: "order.manage", label: "Can manage orders (legacy)" },
  { id: "order.create", label: "Can create orders" },
  { id: "order.edit", label: "Can edit orders" },
  { id: "order.ship", label: "Can mark as shipped / delivered" },

  /* ─── Sales ────────────────────────────── */
  { id: "sale.approve", label: "Can approve sales" },

  /* ─── Products / Inventory ─────────────── */
  { id: "product.view", label: "Can view products" },
  { id: "product.add", label: "Can add products (menu item)" },
  { id: "product.edit", label: "Can edit products (legacy)" },
  { id: "product.delete", label: "Can delete products" },
  { id: "product.approve", label: "Can approve new products" },

  /* granular sections inside Add-Product */
  { id: "product.section.general", label: "Edit ‘General’ section" },
  { id: "product.section.variants", label: "Edit ‘Variants’ section" },
  { id: "product.section.availability", label: "Edit ‘Availability’ section" },
  { id: "product.section.description", label: "Edit ‘Description & images’" },
  { id: "product.section.save", label: "Can save / submit product" },

  { id: "inventory.approve", label: "Can approve inventory ops" },

  /* ─── Logistics ───────────────────────── */
  { id: "shipment.view", label: "Can view shipments" },
  { id: "shipment.create", label: "Can create shipments" },
  { id: "shipment.update", label: "Can update shipment status" },

  /* ─── Customers ───────────────────────── */
  { id: "customer.view", label: "Can view customer details" },
  { id: "customer.edit", label: "Can edit customer details" },
  { id: "customer.delete", label: "Can delete customers" },

  /* ─── Procurement ─────────────────────── */
  { id: "proc.request", label: "Can create purchase request" },
  { id: "proc.approve", label: "Can approve purchase request" },

  /* ─── Stats / Dashboard ───────────────── */
  { id: "stats.view", label: "Can view dashboard stats" },

  { id: "store.view", label: "Can view store management" },
  { id: "store.edit", label: "Can edit store items" },
  { id: "store.manage", label: "Can manage store inventory" },
];
