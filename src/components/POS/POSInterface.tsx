import { useState, useRef } from 'react';
import { usePOS } from '@/hooks/usePOS';
import { Receipt as ReceiptType } from '@/types/pos';
import { ProductGrid } from './ProductGrid';
import { ShoppingCart } from './ShoppingCart';
import { Receipt } from './Receipt';
import { AddProductForm } from './AddProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  Package, 
  Receipt as ReceiptIcon, 
  Plus, 
  Search,
  TrendingUp,
  Users,
  DollarSign 
} from 'lucide-react';

export const POSInterface = () => {
  const {
    products,
    cart,
    receipts,
    addProduct,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    processTransaction,
  } = usePOS();

  const [currentReceipt, setCurrentReceipt] = useState<ReceiptType | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleProcessTransaction = () => {
    const receipt = processTransaction();
    if (receipt) {
      setCurrentReceipt(receipt);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  const totalProducts = products.length;
  const lowStockProducts = products.filter(product => product.stock <= 5).length;
  const todayRevenue = receipts
    .filter(receipt => {
      const today = new Date();
      const receiptDate = new Date(receipt.timestamp);
      return receiptDate.toDateString() === today.toDateString();
    })
    .reduce((sum, receipt) => sum + receipt.total, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (currentReceipt) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Struk Penjualan</h1>
            <Button variant="outline" onClick={() => setCurrentReceipt(null)}>
              Kembali ke POS
            </Button>
          </div>
          <Receipt 
            receipt={currentReceipt} 
            onPrint={handlePrint}
            ref={receiptRef}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Kasir Toko Serbaguna</h1>
                <p className="text-sm text-muted-foreground">
                  Sistem Point of Sale Professional
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div className="font-semibold">Admin Kasir</div>
                <div className="text-muted-foreground">
                  {new Date().toLocaleDateString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="pos-card">
            <CardContent className="flex items-center p-4">
              <DollarSign className="h-8 w-8 text-success mr-3" />
              <div>
                <div className="text-2xl font-bold text-success">
                  {formatPrice(todayRevenue)}
                </div>
                <div className="text-sm text-muted-foreground">Penjualan Hari Ini</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="pos-card">
            <CardContent className="flex items-center p-4">
              <Package className="h-8 w-8 text-primary mr-3" />
              <div>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <div className="text-sm text-muted-foreground">Total Produk</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="pos-card">
            <CardContent className="flex items-center p-4">
              <TrendingUp className="h-8 w-8 text-warning mr-3" />
              <div>
                <div className="text-2xl font-bold">{formatPrice(totalValue)}</div>
                <div className="text-sm text-muted-foreground">Nilai Inventory</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="pos-card">
            <CardContent className="flex items-center p-4">
              <Users className="h-8 w-8 text-error mr-3" />
              <div>
                <div className="text-2xl font-bold">{lowStockProducts}</div>
                <div className="text-sm text-muted-foreground">Stok Menipis</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Produk
                </TabsTrigger>
                <TabsTrigger value="add-product" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Produk
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="space-y-4">
                <Card className="pos-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Daftar Produk
                      </div>
                      <Badge variant="secondary">{filteredProducts.length} produk</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Cari produk..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <ProductGrid 
                      products={filteredProducts}
                      onAddToCart={addToCart}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="add-product">
                <AddProductForm 
                  onAddProduct={addProduct}
                  onClose={() => setShowAddProduct(false)}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Shopping Cart Section */}
          <div className="space-y-4">
            <ShoppingCart
              cart={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onClearCart={clearCart}
              onProcessTransaction={handleProcessTransaction}
            />

            {/* Recent Transactions */}
            {receipts.length > 0 && (
              <Card className="pos-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <ReceiptIcon className="h-5 w-5" />
                    Transaksi Terakhir
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {receipts.slice(-5).reverse().map((receipt) => (
                      <div 
                        key={receipt.id}
                        className="flex items-center justify-between p-2 bg-secondary/50 rounded border cursor-pointer hover:bg-secondary/70 transition-colors"
                        onClick={() => setCurrentReceipt(receipt)}
                      >
                        <div>
                          <div className="font-medium text-sm">{receipt.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {receipt.items.length} item
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">
                            {formatPrice(receipt.total)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(receipt.timestamp).toLocaleTimeString('id-ID')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};