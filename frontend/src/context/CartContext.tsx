import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types/index';
import { fetchApi } from '../services/api';

interface AppliedCoupon {
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_val: number;
  calculated_discount: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant | null) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<string>;
  removeCoupon: () => void;
  shippingMethod: 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA' | 'EXPRESS';
  setShippingMethod: (method: 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA' | 'EXPRESS') => void;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  grandTotal: number;
  totalItems: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('globalbazar_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem('globalbazar_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [shippingMethod, setShippingMethod] = useState<'INSIDE_DHAKA' | 'OUTSIDE_DHAKA' | 'EXPRESS'>('INSIDE_DHAKA');

  useEffect(() => {
    localStorage.setItem('globalbazar_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('globalbazar_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('globalbazar_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, quantity = 1, variant: ProductVariant | null = null) => {
    const finalPrice = variant?.price || (product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.price);
    const variantId = variant?.id || null;
    const variantName = variant?.name || null;
    const image = variant?.image_url || product.primary_image || (product.images && product.images[0]?.image_url) || '';

    setItems(prev => {
      const existingIdx = prev.findIndex(item => item.product_id === product.id && item.variant_id === variantId);

      if (existingIdx > -1) {
        const copy = [...prev];
        const newQty = Math.min(product.stock_quantity, copy[existingIdx].quantity + quantity);
        copy[existingIdx] = { ...copy[existingIdx], quantity: newQty };
        return copy;
      }

      return [
        ...prev,
        {
          product_id: product.id,
          name_en: product.name_en,
          name_bn: product.name_bn,
          image,
          price: finalPrice,
          quantity: Math.min(product.stock_quantity, quantity),
          variant_id: variantId,
          variant_name: variantName,
          stock_quantity: product.stock_quantity
        }
      ];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, variantId: string | null | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.product_id === productId && (item.variant_id || null) === (variantId || null)) {
          return { ...item, quantity: Math.min(item.stock_quantity, quantity) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, variantId?: string | null) => {
    setItems(prev =>
      prev.filter(item => !(item.product_id === productId && (item.variant_id || null) === (variantId || null)))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const freeShippingThreshold = 2000;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);

  let shippingCharge = 70; // Inside Dhaka default
  if (shippingMethod === 'OUTSIDE_DHAKA') {
    shippingCharge = 130;
  } else if (shippingMethod === 'EXPRESS') {
    shippingCharge = 160;
  }

  if (subtotal >= freeShippingThreshold) {
    shippingCharge = 0;
  }

  // Discount calculation
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'PERCENTAGE') {
      discount = (subtotal * appliedCoupon.discount_val) / 100;
    } else {
      discount = appliedCoupon.discount_val;
    }
  }

  const grandTotal = Math.max(0, subtotal - discount + shippingCharge);

  const applyCoupon = async (code: string): Promise<string> => {
    const res = await fetchApi<{
      success: boolean;
      message: string;
      coupon: {
        code: string;
        discount_type: 'PERCENTAGE' | 'FIXED';
        discount_val: number;
        calculated_discount: number;
      };
    }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });

    if (res.success && res.coupon) {
      setAppliedCoupon(res.coupon);
      return res.message;
    }
    throw new Error('Invalid coupon');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        shippingMethod,
        setShippingMethod,
        subtotal,
        discount,
        shippingCharge,
        grandTotal,
        totalItems,
        freeShippingThreshold,
        freeShippingRemaining,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
