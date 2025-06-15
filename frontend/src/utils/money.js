// utils/money.js  (new file)
export const lineTotal = (it) =>
  it.qty *
  (it.price +
    (Array.isArray(it.variantSelections)
      ? it.variantSelections.reduce((s, v) => s + Number(v.cost || 0), 0)
      : Number(it.variantCost || 0)));
