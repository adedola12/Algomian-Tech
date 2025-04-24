/* ───────────────────────────────────────────────────────────
   InventDetails.jsx · Tailwind 3 – full-detail slide-over
──────────────────────────────────────────────────────────── */
import { XMarkIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function InventDetails({ product, onClose }) {
  if (!product) return null;

  const navigate = useNavigate();

  const badge =
    product.quantity === 0
      ? ["Out of stock", "bg-red-100 text-red-700"]
      : product.quantity <= product.reorderLevel
      ? [
          `Low stock – ${product.quantity} left`,
          "bg-yellow-100 text-yellow-700",
        ]
      : [`Available – ${product.quantity} left`, "bg-green-100 text-green-700"];

  const firstMeta = [
    ["Brand", product.brand ?? "—"],
    ["Base Ram", product.baseRam ?? "—"],
    ["Category", product.productCategory ?? "—"],
    ["Base Storage", product.baseStorage ?? "—"],
    ["Cost Price (NGN)", product.costPrice?.toLocaleString() ?? "—"],
    ["Base CPU", product.baseCPU ?? "—"],
    ["Selling Price", product.sellingPrice?.toLocaleString() ?? "—"],
    ["Status", product.status ?? "—"],
  ];

  const secondMeta = [
    ["Quantity", product.quantity ?? "—"],
    ["Re-order level", product.reorderLevel ?? "—"],
    ["Stock Location", product.stockLocation ?? "—"],
  ];

  /* helper ----------------------------------------------------------- */
  const toEmbedUrl = (url) => {
    if (!url) return url;
    const match = url.match(/(?:file\/d\/|id=)([^/&?]+)/);
    return match
      ? `https://drive.google.com/uc?export=view&id=${match[1]}`
      : url;
  };

  const variants = product.variants?.length ? product.variants : [];
  const serials = product.serialNumbers?.length ? product.serialNumbers : [];
  const features = product.features?.length ? product.features : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm p-4">
      <div className="flex min-h-full items-start justify-center sm:items-center">
        <div
          className="relative w-full max-w-[460px] max-h-[calc(100vh-2rem)]
                     overflow-y-auto rounded-lg bg-white p-6 pr-7 shadow-xl
                     scrollbar-thin scrollbar-thumb-gray-300"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded p-1 hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>

          <button
            onClick={() => navigate(`/inventory/edit-product/${product._id}`)}
            className="absolute right-14 top-[22px] flex items-center gap-1 text-sm text-orange-600 hover:underline"
          >
            <PencilSquareIcon className="h-4 w-4" />
            Edit
          </button>

          <h2 className="text-2xl font-bold">Inventory Details</h2>
          <p className="mt-1 text-sm">
            Product ID:{" "}
            <span className="font-medium text-red-600">
              {product.productId}
            </span>
          </p>

          <span
            className={`mt-3 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${badge[1]}`}
          >
            {badge[0]}
          </span>

          <img
            src={
              product.images?.[0]
                ? toEmbedUrl(product.images[0])
                : `https://ui-avatars.com/api/?size=256&name=${encodeURIComponent(
                    product.productName
                  )}`
            }
            alt={product.productName}
            className="mt-4 mb-6 h-44 w-full rounded object-cover"
          />

          <h3 className="font-semibold">Product Name: {product.productName}</h3>
          <p className="mt-1 mb-6 text-sm text-gray-700">
            {product.description}
          </p>

          {/* meta grids */}
          <div className="grid grid-cols-2 gap-y-6 text-sm">
            {firstMeta.map(([label, val]) => (
              <div key={label}>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {label}
                </p>
                <p className="mt-0.5 break-words">{val}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-y-6 text-sm">
            {secondMeta.map(([label, val]) => (
              <div key={label}>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {label}
                </p>
                <p className="mt-0.5 break-words">{val}</p>
              </div>
            ))}
          </div>

          {/* Variants */}
          {!!variants.length && (
            <>
              <hr className="my-6" />
              <h4 className="mb-3 font-semibold">Product Variants</h4>
              <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                {variants.map((v, i) => (
                  <div key={i} className="contents">
                    <span className="text-gray-500">{v.attribute}</span>
                    <span className="break-words">
                      {v.value}{" "}
                      {v.inputCost
                        ? `(NGN ${v.inputCost.toLocaleString()})`
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Serials */}
          {!!serials.length && (
            <>
              <hr className="my-6" />
              <h4 className="mb-3 font-semibold">Serial Numbers</h4>
              <div className="columns-2 gap-x-6 text-sm sm:columns-3">
                {serials.map((s, i) => (
                  <p key={i} className="break-all">
                    {i + 1}. {s}
                  </p>
                ))}
              </div>
            </>
          )}

          {/* Features */}
          {!!features.length && (
            <>
              <hr className="my-6" />
              <h4 className="mb-3 font-semibold">Product Features</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                      <th className="px-3 py-2">Feature</th>
                      <th className="px-3 py-2">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {features.map((f, i) => (
                      <tr key={i}>
                        <td className="whitespace-nowrap px-3 py-2">{f.key}</td>
                        <td className="px-3 py-2">{f.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
