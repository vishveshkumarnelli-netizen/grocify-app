import { Link } from "react-router-dom";
import { FiPlus, FiMinus, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";
import { useCartStore } from "../context/store";

const BADGE_CLASSES = {
  sale: "badge badge-sale",
  new: "badge badge-new",
  best: "badge badge-best",
  organic: "badge badge-organic",
};

export default function ProductCard({ product }) {
  const { items, addItem, updateQty } = useCartStore();
  const cartItem = items.find((i) => i._id === product._id);

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAdd = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleQty = (e, delta) => {
    e.preventDefault();
    updateQty(product._id, (cartItem?.qty || 0) + delta);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-36 bg-gradient-to-br from-forest-50 to-lime-50 flex items-center justify-center text-6xl border-b border-gray-50">
        <span className="group-hover:scale-110 transition-transform duration-300 inline-block">
          {product.emoji}
        </span>
        {product.badge && (
          <span className={BADGE_CLASSES[product.badge] || "badge badge-gray"}>
            {product.badge === "sale" && discountPct
              ? `${discountPct}% OFF`
              : product.badge === "new"
                ? "NEW"
                : product.badge === "best"
                  ? "BESTSELLER"
                  : product.badge.toUpperCase()}
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
          {product.category?.name}
        </p>
        <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-0.5 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 mb-2">{product.unit}</p>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2.5">
            <FiStar size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium text-gray-600">
              {product.rating?.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({product.numReviews})
            </span>
          </div>
        )}

        {/* Price + Add */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display font-bold text-forest-700 text-lg">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through ml-1.5">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {cartItem ? (
            <div
              className="flex items-center border-2 border-forest-500 rounded-xl overflow-hidden"
              onClick={(e) => e.preventDefault()}
            >
              <button
                onClick={(e) => handleQty(e, -1)}
                className="w-7 h-7 flex items-center justify-center text-forest-600 hover:bg-forest-50"
              >
                <FiMinus size={12} />
              </button>
              <span className="w-7 text-center text-sm font-bold text-gray-900">
                {cartItem.qty}
              </span>
              <button
                onClick={(e) => handleQty(e, 1)}
                className="w-7 h-7 flex items-center justify-center text-forest-600 hover:bg-forest-50"
              >
                <FiPlus size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="w-8 h-8 bg-forest-600 hover:bg-forest-500 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <FiPlus size={16} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
