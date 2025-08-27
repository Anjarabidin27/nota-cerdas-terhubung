import { useState, useCallback } from 'react';
import { Product, CartItem, Receipt, POSState } from '@/types/pos';
import { toast } from '@/hooks/use-toast';

const initialProducts: Product[] = [
  { id: '1', name: 'Kopi Hitam', price: 15000, stock: 50, category: 'Minuman' },
  { id: '2', name: 'Nasi Goreng', price: 25000, stock: 30, category: 'Makanan' },
  { id: '3', name: 'Teh Manis', price: 8000, stock: 100, category: 'Minuman' },
  { id: '4', name: 'Ayam Bakar', price: 35000, stock: 20, category: 'Makanan' },
  { id: '5', name: 'Es Jeruk', price: 12000, stock: 75, category: 'Minuman' },
];

export const usePOS = () => {
  const [posState, setPosState] = useState<POSState>({
    products: initialProducts,
    cart: [],
    receipts: [],
  });

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    
    setPosState(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
    
    toast({
      title: "Produk Ditambahkan",
      description: `${product.name} berhasil ditambahkan ke inventory`,
    });
  }, []);

  const updateProduct = useCallback((productId: string, updates: Partial<Product>) => {
    setPosState(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.id === productId ? { ...p, ...updates } : p
      ),
    }));
    
    toast({
      title: "Produk Diperbarui",
      description: "Produk berhasil diperbarui",
    });
  }, []);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    if (product.stock < quantity) {
      toast({
        title: "Stok Tidak Cukup",
        description: `Stok ${product.name} hanya tersisa ${product.stock}`,
        variant: "destructive",
      });
      return;
    }

    setPosState(prev => {
      const existingItem = prev.cart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          toast({
            title: "Stok Tidak Cukup",
            description: `Total quantity melebihi stok yang tersedia`,
            variant: "destructive",
          });
          return prev;
        }
        
        return {
          ...prev,
          cart: prev.cart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: newQuantity }
              : item
          ),
        };
      } else {
        return {
          ...prev,
          cart: [...prev.cart, { product, quantity }],
        };
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setPosState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.product.id !== productId),
    }));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setPosState(prev => {
      const cartItem = prev.cart.find(item => item.product.id === productId);
      if (!cartItem) return prev;

      if (quantity > cartItem.product.stock) {
        toast({
          title: "Stok Tidak Cukup",
          description: `Stok ${cartItem.product.name} hanya tersisa ${cartItem.product.stock}`,
          variant: "destructive",
        });
        return prev;
      }

      return {
        ...prev,
        cart: prev.cart.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        ),
      };
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setPosState(prev => ({
      ...prev,
      cart: [],
    }));
  }, []);

  const processTransaction = useCallback((paymentMethod: string = 'cash') => {
    const { cart, products } = posState;
    
    if (cart.length === 0) {
      toast({
        title: "Keranjang Kosong",
        description: "Tambahkan produk ke keranjang terlebih dahulu",
        variant: "destructive",
      });
      return null;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    const receipt: Receipt = {
      id: `INV-${Date.now()}`,
      items: [...cart],
      subtotal,
      tax,
      total,
      timestamp: new Date(),
      paymentMethod,
    };

    // Update inventory
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.product.id === product.id);
      if (cartItem) {
        return {
          ...product,
          stock: product.stock - cartItem.quantity,
        };
      }
      return product;
    });

    setPosState(prev => ({
      ...prev,
      products: updatedProducts,
      cart: [],
      receipts: [...prev.receipts, receipt],
    }));

    toast({
      title: "Transaksi Berhasil",
      description: `Invoice ${receipt.id} berhasil dibuat`,
    });

    return receipt;
  }, [posState]);

  return {
    ...posState,
    addProduct,
    updateProduct,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    processTransaction,
  };
};