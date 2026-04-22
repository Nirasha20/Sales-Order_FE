import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getClients, getClientById, getItems,
  getOrderById, saveOrder, updateOrder
} from '../services/api';

const emptyRow = {
  itemId: '',
  note: '',
  quantity: '',
  price: '',
  taxRate: '',
  exclAmount: 0,
  taxAmount: 0,
  inclAmount: 0,
};

function SalesOrder() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [clients, setClients] = useState([]);
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([
    { ...emptyRow },
    { ...emptyRow },
    { ...emptyRow },
    { ...emptyRow },
  ]);

  const [form, setForm] = useState({
    clientId: '',
    address1: '', address2: '', address3: '',
    suburb: '', state: '', postCode: '',
    invoiceNo: '', invoiceDate: '', referenceNo: '', note: '',
  });

  useEffect(() => {
    getClients().then((res) => setClients(res.data));
    getItems().then((res) => setItems(res.data));
  }, []);

  useEffect(() => {
    if (id) {
      getOrderById(id).then((res) => {
        const o = res.data;
        setForm({
          clientId: o.clientId,
          address1: o.client?.address1 || '',
          address2: o.client?.address2 || '',
          address3: o.client?.address3 || '',
          suburb: o.client?.city || '',
          state: o.client?.state || '',
          postCode: o.client?.postCode || '',
          invoiceNo: o.invoiceNo || '',
          invoiceDate: o.invoiceDate?.split('T')[0] || '',
          referenceNo: o.referenceNo || '',
          note: '',
        });
        const loadedRows = o.orderDetails.map((d) => ({
          itemId: d.itemId,
          note: d.note,
          quantity: d.quantity,
          price: d.price,
          taxRate: d.taxRate,
          exclAmount: d.exclAmount,
          taxAmount: d.taxAmount,
          inclAmount: d.inclAmount,
        }));
        // Always keep at least 4 rows
        while (loadedRows.length < 4) loadedRows.push({ ...emptyRow });
        setRows(loadedRows);
      });
    }
  }, [id]);

  const handleClientChange = (clientId) => {
    setForm((prev) => ({ ...prev, clientId }));
    if (clientId) {
      getClientById(clientId).then((res) => {
        const c = res.data;
        setForm((prev) => ({
          ...prev,
          clientId,
          address1: c.address1 || '',
          address2: c.address2 || '',
          address3: c.address3 || '',
          suburb: c.city || '',
          state: c.state || '',
          postCode: c.postCode || '',
        }));
      });
    }
  };

  const handleItemChange = (index, itemId) => {
    const item = items.find((i) => i.itemId === parseInt(itemId));
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      itemId: parseInt(itemId),
      price: item ? item.price : '',
    };
    updated[index] = calculateRow(updated[index]);
    setRows(updated);
  };

  const calculateRow = (row) => {
    const qty = parseFloat(row.quantity) || 0;
    const price = parseFloat(row.price) || 0;
    const tax = parseFloat(row.taxRate) || 0;
    const excl = qty * price;
    const taxAmt = excl * tax / 100;
    const incl = excl + taxAmt;
    return { ...row, exclAmount: excl, taxAmount: taxAmt, inclAmount: incl };
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    updated[index] = calculateRow(updated[index]);
    setRows(updated);
  };

  const addRow = () => setRows([...rows, { ...emptyRow }]);

  const totalExcl = rows.reduce((s, r) => s + (r.exclAmount || 0), 0);
  const totalTax  = rows.reduce((s, r) => s + (r.taxAmount || 0), 0);
  const totalIncl = rows.reduce((s, r) => s + (r.inclAmount || 0), 0);

  const handleSave = async () => {
    if (!form.clientId) { alert('Please select a customer.'); return; }
    const payload = {
      clientId: parseInt(form.clientId),
      invoiceNo: form.invoiceNo,
      invoiceDate: form.invoiceDate,
      referenceNo: form.referenceNo,
      totalExcl, totalTax, totalIncl,
      orderDetails: rows
        .filter((r) => r.itemId)
        .map((r) => ({
          itemId: parseInt(r.itemId),
          note: r.note,
          quantity: parseFloat(r.quantity) || 0,
          price: parseFloat(r.price) || 0,
          taxRate: parseFloat(r.taxRate) || 0,
          exclAmount: r.exclAmount,
          taxAmount: r.taxAmount,
          inclAmount: r.inclAmount,
        })),
    };
    try {
      if (id) {
        await updateOrder(id, payload);
        alert('Order updated!');
      } else {
        await saveOrder(payload);
        alert('Order saved!');
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error saving. Check console.');
    }
  };

  const inputClass = "border border-gray-400 bg-white px-2 py-0.5 text-sm w-full focus:outline-none focus:border-blue-400";
  const labelClass = "text-sm text-gray-700 w-28 shrink-0";

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      {/* Window Frame */}
      <div className="bg-gray-100 border border-gray-400 shadow-md rounded">

        {/* Title Bar */}
        <div className="bg-gray-300 border-b border-gray-400 px-4 py-2 flex items-center justify-center relative rounded-t">
          
          <span className="text-sm font-medium text-gray-700">Sales Order</span>
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-300 px-3 py-2 flex gap-2">
          <button
            onClick={handleSave}
            className="bg-gray-200 border border-gray-400 text-gray-800 text-sm px-3 py-1 rounded hover:bg-gray-300 flex items-center gap-1"
          >
            ✔ Save Order
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gray-200 border border-gray-400 text-gray-800 text-sm px-3 py-1 rounded hover:bg-gray-300"
          >
            🖨 Print
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 border border-gray-400 text-gray-800 text-sm px-3 py-1 rounded hover:bg-gray-300"
          >
            ← Back
          </button>
        </div>

        <div className="p-4 space-y-4">

          {/* Customer + Invoice Info */}
          <div className="flex gap-8">

            {/* LEFT: Customer Details */}
            <div className="space-y-1.5 flex-1">
              {/* Customer Name */}
              <div className="flex items-center gap-2">
                <span className={labelClass}>Customer Name</span>
                <select
                  className={inputClass}
                  value={form.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {clients.map((c) => (
                    <option key={c.clientId} value={c.clientId}>
                      {c.customerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address Fields */}
              {[
                { label: 'Address 1', field: 'address1' },
                { label: 'Address 2', field: 'address2' },
                { label: 'Address 3', field: 'address3' },
                { label: 'Suburb',    field: 'suburb'   },
                { label: 'State',     field: 'state'    },
                { label: 'Post Code', field: 'postCode' },
              ].map(({ label, field }) => (
                <div key={field} className="flex items-center gap-2">
                  <span className={labelClass}>{label}</span>
                  <input
                    className={inputClass}
                    value={form[field]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>

            {/* RIGHT: Invoice Details */}
            <div className="space-y-1.5 flex-1">
              {[
                { label: 'Invoice No.',  field: 'invoiceNo',   type: 'text' },
                { label: 'Invoice Date', field: 'invoiceDate', type: 'date' },
                { label: 'Reference no', field: 'referenceNo', type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field} className="flex items-center gap-2">
                  <span className={labelClass}>{label}</span>
                  <input
                    type={type}
                    className={inputClass}
                    value={form[field]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                  />
                </div>
              ))}

              {/* Note textarea */}
              <div className="flex items-start gap-2">
                <span className={labelClass}>Note</span>
                <textarea
                  rows={4}
                  className="border border-gray-400 bg-white px-2 py-1 text-sm w-full focus:outline-none focus:border-blue-400 resize-none"
                  value={form.note}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-gray-400">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  {['Item Code','Description','Note','Quantity','Price',
                    'Tax','Excl Amount','Tax Amount','Incl Amount'].map((h) => (
                    <th
                      key={h}
                      className="border border-gray-400 px-2 py-1.5 text-left text-gray-700 font-medium text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {/* Item Code */}
                    <td className="border border-gray-300 px-1 py-1">
                      <select
                        className="w-full text-xs border-0 bg-transparent focus:outline-none"
                        value={row.itemId}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                      >
                        <option value="">--</option>
                        {items.map((i) => (
                          <option key={i.itemId} value={i.itemId}>
                            {i.itemCode}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Description */}
                    <td className="border border-gray-300 px-1 py-1">
                      <select
                        className="w-full text-xs border-0 bg-transparent focus:outline-none"
                        value={row.itemId}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                      >
                        <option value="">--</option>
                        {items.map((i) => (
                          <option key={i.itemId} value={i.itemId}>
                            {i.description}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Note */}
                    <td className="border border-gray-300 px-1 py-1">
                      <input
                        className="w-full text-xs border-0 bg-transparent focus:outline-none"
                        value={row.note}
                        onChange={(e) => handleRowChange(index, 'note', e.target.value)}
                      />
                    </td>
                    {/* Quantity */}
                    <td className="border border-gray-300 px-1 py-1">
                      <input
                        type="number"
                        className="w-full text-xs border-0 bg-transparent focus:outline-none"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                      />
                    </td>
                    {/* Price (readonly) */}
                    <td className="border border-gray-300 px-1 py-1">
                      <input
                        className="w-full text-xs border-0 bg-gray-50 focus:outline-none"
                        value={row.price}
                        readOnly
                      />
                    </td>
                    {/* Tax Rate */}
                    <td className="border border-gray-300 px-1 py-1">
                      <input
                        type="number"
                        className="w-full text-xs border-0 bg-transparent focus:outline-none"
                        value={row.taxRate}
                        onChange={(e) => handleRowChange(index, 'taxRate', e.target.value)}
                      />
                    </td>
                    {/* Calculated */}
                    <td className="border border-gray-300 px-2 py-1 text-xs text-right bg-gray-50">
                      {row.exclAmount ? row.exclAmount.toFixed(2) : ''}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-xs text-right bg-gray-50">
                      {row.taxAmount ? row.taxAmount.toFixed(2) : ''}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-xs text-right bg-gray-50">
                      {row.inclAmount ? row.inclAmount.toFixed(2) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add Row Button */}
            <div className="px-3 py-1 bg-white border-t border-gray-300">
              <button
                onClick={addRow}
                className="text-blue-600 text-xs hover:underline"
              >
                + Add Row
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end pr-2">
            <div className="space-y-1">
              {[
                { label: 'Total Excl', value: totalExcl },
                { label: 'Total Tax',  value: totalTax  },
                { label: 'Total Incl', value: totalIncl },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-24 text-right">{label}</span>
                  <input
                    className="border border-gray-400 bg-white px-2 py-0.5 text-sm w-40 text-right focus:outline-none"
                    value={value.toFixed(2)}
                    readOnly
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SalesOrder;