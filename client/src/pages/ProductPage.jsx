import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiMinus,
  FiStar,
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiTruck,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard";
import { fetchProduct, fetchProducts, createReview } from "../services/api";
import { useCartStore, useAuthStore } from "../context/store";

const BADGE_CLASSES = {
  sale: "badge badge-sale",
  new: "badge badge-new",
  best: "badge badge-best",
  organic: "badge badge-organic",
};

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { items, addItem, updateQty } = useCartStore();
  const { user } = useAuthStore();
  const cartItem = product ? items.find((i) => i._id === product._id) : null;

  useEffect(() => {
    setLoading(true);
    fetchProduct(slug)
      .then((data) => {
        setProduct(data.product);
        setLoading(false);
        if (data.product?.category?._id) {
          fetchProducts({ category: data.product.category._id, limit: 4 }).then(
            (d) => {
              setRelated(
                (d.products || [])
                  .filter((p) => p._id !== data.product._id)
                  .slice(0, 4),
              );
            },
          );
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [slug]);

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${product.name} added to cart`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to add a review");
      navigate("/login");
      return;
    }
    setSubmittingReview(true);
    try {
      await createReview(product._id, reviewForm);
      toast.success("Review submitted!");
      const data = await fetchProduct(slug);
      setProduct(data.product);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="h-96 bg-gray-100 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            {[40, 28, 20, 16, 60, 80].map((h, i) => (
              <div
                key={i}
                className={`h-${h >= 60 ? 12 : 6} bg-gray-100 rounded-xl animate-pulse`}
                style={{ height: h }}
              />
            ))}
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="text-center py-24">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="font-bold text-xl mb-4">Product not found</h2>
        <Link to="/shop" className="btn-primary px-6 py-3 inline-flex">
          Back to Shop
        </Link>
      </div>
    );

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-cream border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-forest-600 font-medium">
            Home
          </Link>{" "}
          ›
          <Link to="/shop" className="hover:text-forest-600 font-medium">
            Shop
          </Link>{" "}
          ›
          {product.category && (
            <>
              <Link
                to={`/shop/${product.category.slug}`}
                className="hover:text-forest-600 font-medium"
              >
                {product.category.name}
              </Link>{" "}
              ›{" "}
            </>
          )}
          <span className="text-gray-700">{product.name}</span>
        </div>
      </div>

      {/* PDP */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div>
          <div className="h-96 bg-gradient-to-br from-forest-50 to-lime-50 rounded-3xl flex items-center justify-center text-[140px] border-2 border-forest-100 mb-4 relative overflow-hidden">
            <span className="filter drop-shadow-lg">{product.emoji}</span>
            {product.badge && (
              <span className={`${BADGE_CLASSES[product.badge] || "badge badge-gray"} text-xs`}>
                {product.badge === "sale" && discount
                  ? `${discount}% OFF`
                  : product.badge.toUpperCase()}
              </span>
            )}
          </div>
          {/* Thumb strip */}
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-20 h-20 bg-forest-50 rounded-2xl flex items-center justify-center text-4xl cursor-pointer border-2 transition-colors ${i === 0 ? "border-forest-500" : "border-transparent hover:border-forest-300"}`}
              >
                {product.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div>
          <span className="inline-block bg-forest-100 text-forest-700 text-xs font-bold px-3 py-1 rounded-lg mb-3 tracking-wide">
            {product.category?.emoji} {product.category?.name}
          </span>
          <h1 className="font-display text-4xl font-black text-gray-900 mb-3 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <FiStar
                  key={i}
                  size={16}
                  className={
                    i < Math.round(product.rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200"
                  }
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {product.rating?.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">
              ({product.numReviews} reviews)
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
            >
              {product.stock > 0
                ? `✔ In Stock (${product.stock})`
                : "✕ Out of Stock"}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="font-display text-4xl font-black text-forest-700">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xl text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
            {discount && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                {discount}% OFF
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">
            {product.description}
          </p>

          {/* QTY + Add */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border-2 border-forest-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-11 h-11 flex items-center justify-center text-forest-600 hover:bg-forest-50 transition-colors text-lg font-bold"
              >
                <FiMinus />
              </button>
              <span className="w-12 text-center font-bold text-gray-900">
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-11 h-11 flex items-center justify-center text-forest-600 hover:bg-forest-50 transition-colors text-lg font-bold"
              >
                <FiPlus />
              </button>
            </div>
            {cartItem ? (
              <div className="flex items-center border-2 border-forest-500 rounded-xl overflow-hidden">
                <button
                  onClick={() => updateQty(product._id, cartItem.qty - 1)}
                  className="w-11 h-11 flex items-center justify-center text-forest-600 hover:bg-forest-50"
                >
                  <FiMinus />
                </button>
                <span className="px-4 font-bold">{cartItem.qty} in cart</span>
                <button
                  onClick={() => updateQty(product._id, cartItem.qty + 1)}
                  className="w-11 h-11 flex items-center justify-center text-forest-600 hover:bg-forest-50"
                >
                  <FiPlus />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary py-3 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingCart size={18} /> Add to Cart
              </button>
            )}
            <button className="w-11 h-11 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-200 transition-colors">
              <FiHeart size={18} />
            </button>
          </div>

          {/* Meta */}
          <div className="bg-forest-50 rounded-2xl p-4 mb-5 space-y-2.5">
            {[
              ["Unit", product.unit],
              ["Category", product.category?.name],
              ["Origin", "India"],
              ["Delivery", "Within 60 minutes"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-800">{v}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {product.tags?.map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 bg-white border-2 border-forest-200 rounded-full text-xs font-medium text-forest-700"
              >
                #{t}
              </span>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <FiTruck size={14} className="text-forest-500" /> Free delivery
              ₹500+
            </div>
            <div className="flex items-center gap-1.5">
              <FiRefreshCw size={14} className="text-forest-500" /> Easy returns
            </div>
            <div className="flex items-center gap-1.5">
              <FiShield size={14} className="text-forest-500" /> Secure payment
            </div>
          </div>
        </div>
      </div>

      {/* ── REVIEWS ── */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Existing reviews */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-5">
              Customer Reviews ({product.numReviews})
            </h2>
            {product.reviews?.length === 0 ? (
              <p className="text-gray-400 text-sm bg-gray-50 rounded-2xl p-6 text-center">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div className="space-y-4">
                {product.reviews?.map((r, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center text-xs font-bold text-forest-700">
                        {r.name?.[0]}
                      </div>
                      <span className="font-semibold text-sm">{r.name}</span>
                      <div className="ml-auto text-amber-400 text-sm">
                        {"★".repeat(r.rating)}
                        {"☆".repeat(5 - r.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add review form */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-5">
              Write a Review
            </h2>
            <form
              onSubmit={handleReviewSubmit}
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Your Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setReviewForm((f) => ({ ...f, rating: n }))
                      }
                      className={`text-2xl transition-transform hover:scale-110 ${n <= reviewForm.rating ? "text-amber-400" : "text-gray-200"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Your Review
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, comment: e.target.value }))
                  }
                  placeholder="Share your experience with this product…"
                  className="input-base resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="btn-primary w-full py-3 rounded-xl disabled:opacity-60"
              >
                {submittingReview ? "Submitting…" : "Submit Review"}
              </button>
              {!user && (
                <p className="text-xs text-center text-gray-400">
                  You must be{" "}
                  <Link to="/login" className="text-forest-600 font-semibold">
                    logged in
                  </Link>{" "}
                  to review
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="bg-cream py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="section-title mb-7">
              Related <span className="text-forest-600">Products</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
