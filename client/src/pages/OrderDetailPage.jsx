import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiCreditCard, FiPackage } from "react-icons/fi";
import { getOrder, createOrder, cancelOrder } from "../services/api";
import toast from "react-hot-toast";

const STEPS = ["confirmed", "packing", "out_for_delivery", "delivered"];

const STEP_LABELS = {
  confirmed: { icon: "✅", label: "Confirmed" },
  packing: { icon: "📦", label: "Packing" },
  out_for_delivery: { icon: "🚚", label: "Out for Delivery" },
  delivered: { icon: "🏠", label: "Delivered" },
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  packing: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then((d) => setOrder(d.order))
      .catch((err) => {
        const msg = err.response?.data?.message;

        if (err.response?.status === 403) {
          toast.error(msg || "Access denied");
        }

        if (err.response?.status === 401) {
          toast.error("Please login again");
          navigate("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Cancel Order
  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?",
    );
    if (!confirmCancel) return;

    try {
      const res = await cancelOrder(order._id);

      setOrder(res.order); // ✅ update UI instantly
      toast.success("Order cancelled successfully ❌");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    }
  };
  // 🔁 Reorder
  const handleReorder = async () => {
    try {
      const payload = {
        items: order.items.map((i) => ({
          product: i.product,
          quantity: i.quantity,
        })),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
      };

      const res = await createOrder(payload);
      toast.success("Reordered successfully!");
      navigate(`/orders/${res.order._id}`);
    } catch {
      toast.error("Reorder failed");
    }
  };

  if (loading) {
    return (
      <div className="p-10">
        <div className="h-80 bg-gray-100 animate-pulse rounded-2xl" />
      </div>
    );
  }
  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Unable to load order</p>
        <Link to="/orders" className="mt-4 inline-block text-green-600">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/orders"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <FiArrowLeft /> Back
        </Link>

        <span
          className={`px-4 py-1.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      {/* Order Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date(order.createdAt).toDateString()}
        </p>
      </div>

      {/* 🔥 Tracking Timeline */}
      {order.status !== "cancelled" && (
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <h2 className="font-semibold mb-6">Order Progress</h2>

          <div className="flex justify-between relative">
            {/* Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />

            <div
              className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all"
              style={{
                width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
              }}
            />

            {STEPS.map((step, i) => {
              const done = i <= currentStep;

              return (
                <div key={step} className="flex flex-col items-center z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                      done
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-400"
                    }`}
                  >
                    {STEP_LABELS[step].icon}
                  </div>

                  <p
                    className={`text-xs mt-2 ${
                      done ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {STEP_LABELS[step].label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid Info */}
      <div className="grid md:grid-cols-3 gap-5 mb-6">
        {/* Customer */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-xs text-gray-400 mb-2">CUSTOMER</p>
          <p className="font-semibold">{order.user?.name}</p>
          <p className="text-sm text-gray-400">{order.user?.email}</p>
        </div>

        {/* Address */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-xs text-gray-400 mb-2">ADDRESS</p>
          <p>{order.shippingAddress?.street}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress?.city}</p>
        </div>

        {/* Payment */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-xs text-gray-400 mb-2">PAYMENT</p>
          <p>{order.paymentMethod}</p>
          <p className={order.isPaid ? "text-green-600" : "text-yellow-500"}>
            {order.isPaid ? "Paid" : "Pending"}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <FiPackage /> Items
        </h2>

        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between py-3 border-b last:border-none"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-gray-400">
                {item.quantity} × ₹{item.price}
              </p>
            </div>
            <p className="font-semibold">₹{item.quantity * item.price}</p>
          </div>
        ))}

        {/* Total */}
        <div className="mt-4 text-right">
          <p className="text-sm text-gray-400">Total Amount</p>
          <p className="text-xl font-bold text-green-600">
            ₹{order.totalPrice}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleReorder}
          className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
        >
          Reorder
        </button>

        <button
          onClick={handleCancelOrder}
          disabled={
            order.status === "cancelled" ||
            order.status === "delivered" ||
            order.status === "out_for_delivery"
          }
          className={`px-6 py-2 rounded-xl ${
            order.status === "cancelled" ||
            order.status === "delivered" ||
            order.status === "out_for_delivery"
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          Cancel Order
        </button>
      </div>
    </div>
  );
}
