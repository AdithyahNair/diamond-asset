import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
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
  const [items, setItems] = useState<CartItem[]>([]);
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
          setItems(parsedCart);
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
    if (user && items.length > 0) {
      localStorage.setItem(
        `${CART_STORAGE_KEY}_${user.email}`,
        JSON.stringify(items)
      );
    } else if (user) {
      // Clear the storage if cart is empty
      localStorage.removeItem(`${CART_STORAGE_KEY}_${user.email}`);
    }
  }, [items, user]);

  // If user logs out, clear the cart
  useEffect(() => {
    if (!isFullyAuthenticated) {
      setItems([]);
    }
  }, [isFullyAuthenticated]);

  const addToCart = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);

      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }

      return [...prevItems, item];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    if (user) {
      localStorage.removeItem(`${CART_STORAGE_KEY}_${user.email}`);
    }
  };

  const hasItemInCart = (itemId: string) => {
    return items.some((item) => item.id === itemId);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
    hasItemInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
