// src/components/SalesPrintPreview.jsx
import React, { useRef } from "react"
import { FiX, FiPrinter } from "react-icons/fi"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function SalesPrintPreview({
  onClose,
  onPrintPDF,
  company,
  billedTo,
  date,
  items,
  tax,
}) {
  const ref = useRef()

  const handlePrintPDF = async () => {
    console.group("📄 Print to PDF")
    try {
      // 1) Clone
      const original = ref.current
      console.log("1) original element:", original)
      const clone = original.cloneNode(true)
      clone.style.position = "absolute"
      clone.style.top = "-9999px"
      clone.style.left = "-9999px"
      document.body.appendChild(clone)
      console.log("   ↳ clone appended offscreen")

      // 2) Inline *only* supported computed styles
      console.log("2) inlining safe computed styles")
      const els = [...clone.querySelectorAll("*"), clone]
      els.forEach((el, i) => {
        const cs = window.getComputedStyle(el)
        // only copy the properties html2canvas can handle:
        el.style.color = cs.color
        el.style.backgroundColor = cs.backgroundColor
        el.style.borderColor = cs.borderColor
        el.style.borderRadius = cs.borderRadius
        el.style.boxShadow = cs.boxShadow
        el.style.font = cs.font
        el.style.textShadow = cs.textShadow
        if (i < 5) {
          console.log(
            `   • ${el.tagName}:`,
            {
              color: cs.color,
              backgroundColor: cs.backgroundColor,
              borderColor: cs.borderColor,
            }
          )
        }
      })
      console.log("   ↳ inlining complete")

      // 3) Render to canvas
      console.log("3) calling html2canvas()…")
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
      })
      console.log("   ↳ html2canvas finished")

      // 4) Clean up
      document.body.removeChild(clone)
      console.log("4) removed offscreen clone")

      // 5) Build & save PDF
      console.log("5) generating PDF")
      const imgData   = canvas.toDataURL("image/png")
      const pdf       = new jsPDF("p", "pt", "a4")
      const pdfWidth  = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save("receipt.pdf")
      console.log("   ↳ PDF saved")

      onPrintPDF()
      console.log("✅ Done")
    } catch (err) {
      console.error("❌ Print to PDF failed:", err)
    } finally {
      console.groupEnd()
    }
  }

  const subTotal = items.reduce((sum, i) => sum + i.qty * i.price, 0)
  const total    = subTotal + tax

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: "rgba(255,255,255,0.2)",
        WebkitBackdropFilter: "blur(8px)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        ref={ref}
        className="rounded-2xl shadow-lg w-full max-w-2xl overflow-hidden"
        style={{ backgroundColor: "white" }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-800">Receipt Preview</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        {/* Company Header */}
        <div className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{company.name}</h2>
            <p className="text-sm opacity-90">{company.email}</p>
          </div>
          <span className="font-semibold">Receipt</span>
        </div>

        {/* Invoice Details */}
        <div className="px-6 py-4 border-b grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <span className="font-medium text-gray-700">Billed to </span>
            <span className="text-gray-800">{billedTo}</span>
          </div>
          <div className="sm:text-right">
            <span className="font-medium text-gray-700">Date: </span>
            <span className="text-gray-800">{date}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto px-6 py-4">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {["S/N", "Item", "Quantity", "Price", "Total Price"].map((h) => (
                  <th key={h} className="py-2 px-3 text-gray-600 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.sn} className="border-b last:border-none">
                  <td className="py-2 px-3 text-gray-800">{it.sn}</td>
                  <td className="py-2 px-3 text-gray-800">{it.name}</td>
                  <td className="py-2 px-3 text-gray-800">{it.qty}</td>
                  <td className="py-2 px-3 text-gray-800">
                    NGN {it.price.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-gray-800">
                    NGN {(it.qty * it.price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2">
          <div />
          <div className="space-y-1 text-right">
            <div className="flex justify-between text-gray-600">
              <span>Sub Total:</span>
              <span>NGN {subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax:</span>
              <span>NGN {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800">
              <span>Total:</span>
              <span>NGN {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Print to PDF button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={handlePrintPDF}
          className="inline-flex items-center bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <FiPrinter className="mr-2" /> Print to PDF
        </button>
      </div>
    </div>
  )
}
