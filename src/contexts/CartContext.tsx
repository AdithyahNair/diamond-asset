import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  hasItemInCart: (itemId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Storage key for cart items
const CART_STORAGE_KEY = "turtle_timepiece_cart";

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isFullyAuthenticated, user } = useAuth();

  // Load cart from localStorage when component mounts or user changes
  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(
        `${CART_STORAGE_KEY}_${user.email}`
      );
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);

          // Ensure all items have quantity of 1
          const fixedCart = parsedCart.map((item: CartItem) => ({
            ...item,
            quantity: 1,
          }));

          // Only keep one item if multiple items exist
          if (fixedCart.length > 1) {
            setCartItems([fixedCart[0]]);
          } else {
            setCartItems(fixedCart);
          }
        } catch (e) {
          console.error("Failed to parse cart data:", e);
          // Clear invalid cart data
          localStorage.removeItem(`${CART_STORAGE_KEY}_${user.email}`);
        }
      }
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user && cartItems.length > 0) {
      localStorage.setItem(
        `${CART_STORAGE_KEY}_${user.email}`,
        JSON.stringify(cartItems)
      );
    } else if (user) {
      // Clear the storage if cart is empty
      localStorage.removeItem(`${CART_STORAGE_KEY}_${user.email}`);
    }
  }, [cartItems, user]);

  // If user logs out, clear the cart
  useEffect(() => {
    if (!isFullyAuthenticated) {
      setCartItems([]);
    }
  }, [isFullyAuthenticated]);

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      // Check if item already exists
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        // Update quantity if item exists
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      // Add new item if it doesn't exist
      return [...prevItems, item];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    if (user) {
      localStorage.removeItem(`${CART_STORAGE_KEY}_${user.email}`);
    }
  };

  const hasItemInCart = (itemId: string) => {
    return cartItems.some((item) => item.id === itemId);
  };

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    clearCart,
    hasItemInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
