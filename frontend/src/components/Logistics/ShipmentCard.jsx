import React from "react";
import api from "../../api";

/* —————————————————————————————————————————————— */
/* tiny PURE input component – memoised so React   */
/* never re-creates it unless the props differ      */
const Field = React.memo(function Field({
  id,
  label,
  type = "text",
  disabled,
  ...rest
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>

      {/* ▼▼  give the real DOM node its own stable key  ▼▼ */}
      <input
        key={id}
        id={id}
        type={type}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2
                   focus:ring-orange-500 disabled:bg-gray-100"
        {...rest}
      />
    </div>
  );
});
/* —————————————————————————————————————————————— */

export default function ShipmentCard({
  shippingMethod = "Park Pick Up",
  onChangeMethod = () => {},
  fields = {},
  onFieldChange = () => {},
  onMarkShipped = () => {},
  readonly = false,
}) {
  const hideParkFields = shippingMethod === "Self Pick Up";

  /* -------------- driver auto-suggest ------------------ */
  const [suggest, setSuggest] = React.useState([]);
  const search = async (txt) => {
    if (txt.length < 2) return setSuggest([]);
    const { data } = await api.get("/api/users/logistics-drivers", {
      withCredentials: true,
    });
    setSuggest(
      data.filter((u) =>
        (u.firstName + " " + u.lastName)
          .toLowerCase()
          .includes(txt.toLowerCase())
      )
    );
  };

  /* ===================================================== */
  return (
    <div className="bg-white rounded-lg border flex">
      <div className="w-1 bg-blue-500 rounded-l-lg" />

      <div className="flex-1 p-6 space-y-6">
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Shipping Method
            </h2>
            <p className="text-sm text-gray-500">
              Information about the customer's chosen delivery method
            </p>
          </div>

          {!readonly && (
            <button
              onClick={onMarkShipped}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
            >
              Mark as shipped
            </button>
          )}
        </div>

        {/* body */}
        <div className="space-y-4">
          {/* selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Shipping Method
            </label>
            <select
              value={shippingMethod}
              disabled={readonly}
              onChange={(e) => onChangeMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2
                         focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            >
              <option>Logistics</option>
              <option>Park Pick Up</option>
              <option>Self Pick Up</option>
            </select>
          </div>

          {/* grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!hideParkFields && (
              <>
                <Field
                  id="sendingPark"
                  label="Sending Park"
                  placeholder="Central park closest to you"
                  value={fields.sendingPark ?? ""}
                  disabled={readonly}
                  onChange={(e) =>
                    onFieldChange("sendingPark", e.target.value)
                  }
                />

                <Field
                  id="destinationPark"
                  label="Destination Park"
                  placeholder="Customer's nearest park"
                  value={fields.destinationPark ?? ""}
                  disabled={readonly}
                  onChange={(e) =>
                    onFieldChange("destinationPark", e.target.value)
                  }
                />

                <Field
                  id="trackingId"
                  label="Tracking ID"
                  value={fields.trackingId}
                  readOnly
                  disabled={true}
                />

                <Field
                  id="driverContact"
                  label="Driver Contact Details"
                  value={fields.driverContact ?? ""}
                  disabled={readonly}
                  onChange={(e) =>
                    onFieldChange("driverContact", e.target.value)
                  }
                />

                {/* driver name + autosuggest */}
                <div className="col-span-2 relative">
                  <Field
                    id="driverName"
                    label="Driver Name"
                    value={fields.driverName ?? ""}
                    disabled={readonly}
                    onChange={(e) => {
                      onFieldChange("driverName", e.target.value);
                      search(e.target.value);
                    }}
                  />
                  {suggest.length > 0 && (
                    <ul className="absolute z-20 left-0 right-0 bg-white border mt-1 rounded shadow">
                      {suggest.map((u) => (
                        <li
                          key={u._id}
                          className="px-3 py-1 hover:bg-gray-50 cursor-pointer text-sm"
                          onClick={() => {
                            onFieldChange(
                              "driverName",
                              `${u.firstName} ${u.lastName}`
                            );
                            onFieldChange("driverContact", u.whatAppNumber);
                            onFieldChange("assignedTo", u._id);
                            setSuggest([]);
                          }}
                        >
                          {u.firstName} {u.lastName} –{" "}
                          {u.whatAppNumber || u.email}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {/* dates – shown for every method */}
            <Field
              id="dispatchDate"
              label="Dispatch Date"
              type="date"
              value={fields.dispatchDate?.slice(0, 10) || ""}
              disabled={readonly}
              onChange={(e) => onFieldChange("dispatchDate", e.target.value)}
            />
            <Field
              id="expectedDate"
              label="Expected Delivery Date"
              type="date"
              value={fields.expectedDate?.slice(0, 10) || ""}
              disabled={readonly}
              onChange={(e) => onFieldChange("expectedDate", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
