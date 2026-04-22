import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders } from '../services/api';
import { setOrders } from '../redux/slices/orderSlice';

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.orders);

  useEffect(() => {
    getOrders()
      .then((res) => dispatch(setOrders(res.data)))
      .catch((err) => console.error(err));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      {/* Window Frame */}
      <div className="bg-gray-100 border border-gray-400 shadow-md rounded">
        
        {/* Title Bar */}
        <div className="bg-gray-300 border-b border-gray-400 px-4 py-2 flex items-center justify-center relative rounded-t">
          
          <span className="text-sm font-medium text-gray-700">Home</span>
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-300 px-3 py-2">
          <button
            onClick={() => navigate('/salesorder')}
            className="bg-gray-200 border border-gray-400 text-gray-800 text-sm px-4 py-1 rounded hover:bg-gray-300"
          >
            Add New
          </button>
        </div>

        {/* Table */}
        <div className="p-3">
          <div className="border border-gray-400 bg-white">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  {['Order ID','Customer Name','Invoice No','Invoice Date',
                    'Total Excl','Total Tax','Total Incl'].map((col) => (
                    <th
                      key={col}
                      className="border border-gray-400 px-3 py-2 text-left text-gray-700 font-medium"
                    >
                      ▼ {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <>
                    {[...Array(7)].map((_, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                        {[...Array(7)].map((_, j) => (
                          <td key={j} className="border border-gray-300 px-3 py-3 text-gray-400 text-xs">"</td>
                        ))}
                      </tr>
                    ))}
                  </>
                ) : (
                  orders.map((order, i) => (
                    <tr
                      key={order.orderId}
                      className={`cursor-pointer hover:bg-blue-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}
                      onDoubleClick={() => navigate(`/salesorder/${order.orderId}`)}
                    >
                      <td className="border border-gray-300 px-3 py-2">{order.orderId}</td>
                      <td className="border border-gray-300 px-3 py-2">{order.client?.customerName}</td>
                      <td className="border border-gray-300 px-3 py-2">{order.invoiceNo}</td>
                      <td className="border border-gray-300 px-3 py-2">
                        {order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : ''}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{Number(order.totalExcl).toFixed(2)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{Number(order.totalTax).toFixed(2)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{Number(order.totalIncl).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-1">Double-click a row to open and edit</p>
        </div>
      </div>
    </div>
  );
}

export default Home;