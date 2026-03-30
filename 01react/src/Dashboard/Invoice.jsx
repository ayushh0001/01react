import { useRef } from 'react';

const fmt = v => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Invoice({ order, detail, onClose }) {
  const printRef = useRef();

  const addr = detail?.shipping_address || order?.shipping_address || {};
  const items = detail?.items || [];
  const subtotal = items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
  const shipping = Number(detail?.shipping_amount || 0);
  const tax = Number(detail?.tax_amount || 0);
  const total = Number(detail?.final_amount || order?.total || 0);
  const date = detail?.created_at
    ? new Date(detail.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : order?.dateTime || order?.date || '';

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice - ${order?.number}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; background: #fff; }
        .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f5f5f5; text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 2px solid #111; }
        td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #e5e5e5; }
        .total-row td { font-weight: 700; font-size: 15px; color: #FF9800; border-bottom: none; }
        @media print { body { -webkit-print-color-adjust: exact; } }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900 text-lg">Invoice</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-brand text-black text-sm font-semibold rounded-lg transition hover:opacity-90">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Download
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div ref={printRef} className="invoice p-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-2">
              <img src="/logo2.jpeg" alt="ZPIN" style={{ height: '40px', objectFit: 'contain' }} />
            </div>
            <h1 className="text-4xl font-black tracking-widest text-gray-900">INVOICE</h1>
          </div>

          {/* Bill To + Order Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="font-bold text-sm mb-2">Bill To</p>
              <p className="font-semibold">{order?.customer || addr.name || '—'}</p>
              {addr.address && <p className="text-sm text-gray-600">{addr.address}</p>}
              {addr.city && <p className="text-sm text-gray-600">{[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>}
              {addr.phone && <p className="text-sm text-gray-600">{addr.phone}</p>}
            </div>
            <div>
              <p className="font-bold text-sm mb-2">Order Info</p>
              <p className="text-sm"><span className="font-semibold">Order ID:</span> {order?.number || '—'}</p>
              <p className="text-sm"><span className="font-semibold">Date:</span> {date}</p>
              {detail?.payment_method && (
                <p className="text-sm"><span className="font-semibold">Payment Method:</span> {detail.payment_method}</p>
              )}
              <p className="text-sm capitalize"><span className="font-semibold">Status:</span> {detail?.status || order?.status || '—'}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #111', background: '#f5f5f5' }}>
                <th className="text-left py-3 px-3 text-sm font-bold">Item Description</th>
                <th className="text-center py-3 px-3 text-sm font-bold">Qty</th>
                <th className="text-right py-3 px-3 text-sm font-bold">Unit Price</th>
                <th className="text-right py-3 px-3 text-sm font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td className="py-3 px-3 text-sm">{item.product_name}</td>
                  <td className="py-3 px-3 text-sm text-center">{item.quantity}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmt(item.price)}</td>
                  <td className="py-3 px-3 text-sm text-right font-medium">{fmt(Number(item.price) * Number(item.quantity))}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="py-4 px-3 text-sm text-gray-400 text-center">No items</td></tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{fmt(subtotal)}</span>
              </div>
              {shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Standard Delivery Fee</span>
                  <span className="font-medium">{fmt(shipping)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-medium">{fmt(tax)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t-2 border-gray-900">
                <span className="font-bold text-base" style={{ color: '#FF9800' }}>Total Amount:</span>
                <span className="font-black text-base" style={{ color: '#FF9800' }}>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-5 flex items-end justify-between">
            <div>
              <p className="font-bold text-sm">ZPIN Fashion &amp; Lifestyle</p>
              <p className="text-xs text-gray-500">support@zpinshop.com</p>
              <p className="text-xs text-gray-400 mt-2">Thank you for shopping with ZPIN. We appreciate your business.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
