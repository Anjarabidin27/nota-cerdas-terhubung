import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductGrid } from './ProductGrid';
import { ShoppingCart } from './ShoppingCart';
import { Receipt } from './Receipt';
import { AddProductForm } from './AddProductForm';
import { SalesReport } from './SalesReport';
import { PhotocopyDialog } from './PhotocopyDialog';
import { StockManagement } from './StockManagement';
import { usePOS } from '@/hooks/usePOS';
import { Receipt as ReceiptType, Product } from '@/types/pos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Package, 
  Receipt as ReceiptIcon, 
  Plus, 
  Search,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3
} from 'lucide-react';

export const POSInterface = () => {
  const {
    products,
    cart,
    receipts,
    addProduct,
    updateProduct,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    processTransaction,
    formatPrice,
  } = usePOS();

  const [lastReceipt, setLastReceipt] = useState<ReceiptType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [photocopyProduct, setPhotocopyProduct] = useState<Product | null>(null);
  const [showPhotocopyDialog, setShowPhotocopyDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState('pos');

  const handleProcessTransaction = (paymentMethod?: string, discount?: number) => {
    const receipt = processTransaction(paymentMethod, discount);
    if (receipt) {
      setLastReceipt(receipt);
    }
    return receipt;
  };

  const handlePhotocopyClick = (product: Product) => {
    setPhotocopyProduct(product);
    setShowPhotocopyDialog(true);
  };

  const handleDashboardClick = (section: string) => {
    switch (section) {
      case 'revenue':
      case 'profit':
        setCurrentTab('reports');
        break;
      case 'products':
        setCurrentTab('stock-management');
        break;
      case 'stock':
        setCurrentTab('low-stock');
        break;
    }
  };

  const handlePrintThermal = (receipt: ReceiptType) => {
    // Thermal printing implementation
    const printContent = `
===============================
   KASIR FOTOCOPY & ATK
===============================
Invoice: ${receipt.id}
Tanggal: ${new Date(receipt.timestamp).toLocaleDateString('id-ID')}
Waktu: ${new Date(receipt.timestamp).toLocaleTimeString('id-ID')}
-------------------------------

${receipt.items.map(item => `
${item.product.name}
${item.quantity} x ${formatPrice(item.finalPrice || item.product.sellPrice)}
${' '.repeat(31 - (item.quantity + ' x ' + formatPrice(item.finalPrice || item.product.sellPrice)).length)}${formatPrice((item.finalPrice || item.product.sellPrice) * item.quantity)}
`).join('')}

-------------------------------
Subtotal: ${' '.repeat(20)}${formatPrice(receipt.subtotal)}${receipt.discount > 0 ? `
Diskon: ${' '.repeat(22)}${formatPrice(receipt.discount)}` : ''}
TOTAL: ${' '.repeat(23)}${formatPrice(receipt.total)}

Metode: ${receipt.paymentMethod.toUpperCase()}
Profit: ${formatPrice(receipt.profit)}

===============================
    TERIMA KASIH ATAS
    KUNJUNGAN ANDA!
===============================
`;

    // Create a new window for thermal printing
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Receipt</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 10px;
                white-space: pre-line;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const lowStockProducts = products.filter(product => product.stock <= 5 && !product.isPhotocopy).length;
  
  const todayRevenue = receipts
    .filter(receipt => {
      const today = new Date();
      const receiptDate = new Date(receipt.timestamp);
      return receiptDate.toDateString() === today.toDateString();
    })
    .reduce((sum, receipt) => sum + receipt.total, 0);
    
  const todayProfit = receipts
    .filter(receipt => {
      const today = new Date();
      const receiptDate = new Date(receipt.timestamp);
      return receiptDate.toDateString() === today.toDateString();
    })
    .reduce((sum, receipt) => sum + receipt.profit, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Kasir Toko Anjar </h1>
                <p className="text-sm text-muted-foreground">
                  Jalan Gajah - Dempet (Depan Koramil)
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
          <Card className="pos-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleDashboardClick('revenue')}>
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
          
          <Card className="pos-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleDashboardClick('profit')}>
            <CardContent className="flex items-center p-4">
              <TrendingUp className="h-8 w-8 text-primary mr-3" />
              <div>
                <div className="text-2xl font-bold text-primary">
                  {formatPrice(todayProfit)}
                </div>
                <div className="text-sm text-muted-foreground">Keuntungan Hari Ini</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="pos-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleDashboardClick('products')}>
            <CardContent className="flex items-center p-4">
              <Package className="h-8 w-8 text-warning mr-3" />
              <div>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <div className="text-sm text-muted-foreground">Total Produk</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="pos-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleDashboardClick('stock')}>
            <CardContent className="flex items-center p-4">
              <Users className="h-8 w-8 text-error mr-3" />
              <div>
                <div className="text-2xl font-bold">{lowStockProducts}</div>
                <div className="text-sm text-muted-foreground">Stok Menipis</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="pos">Kasir</TabsTrigger>
            <TabsTrigger value="add-product">Tambah Produk</TabsTrigger>
            <TabsTrigger value="stock-management">Manajemen Stok</TabsTrigger>
            <TabsTrigger value="low-stock">Stok Menipis</TabsTrigger>
            <TabsTrigger value="receipt">Nota Terakhir</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
          </TabsList>

          <TabsContent value="pos" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
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
                      onPhotocopyClick={handlePhotocopyClick}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <ShoppingCart
                  cart={cart}
                  updateCartQuantity={updateCartQuantity}
                  removeFromCart={removeFromCart}
                  clearCart={clearCart}
                  processTransaction={handleProcessTransaction}
                  formatPrice={formatPrice}
                  onPrintThermal={handlePrintThermal}
                />

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
                            className="flex items-center justify-between p-2 bg-secondary/50 rounded border"
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
          </TabsContent>

          <TabsContent value="stock-management" className="space-y-4">
            <StockManagement 
              products={products}
              onUpdateProduct={updateProduct}
              formatPrice={formatPrice}
              showLowStockOnly={false}
            />
          </TabsContent>

          <TabsContent value="low-stock" className="space-y-4">
            <StockManagement 
              products={products}
              onUpdateProduct={updateProduct}
              formatPrice={formatPrice}
              showLowStockOnly={true}
            />
          </TabsContent>

          <TabsContent value="add-product" className="space-y-4">
            <AddProductForm onAddProduct={addProduct} onClose={() => {}} />
          </TabsContent>

          <TabsContent value="receipt" className="space-y-4">
            {lastReceipt ? (
              <Receipt receipt={lastReceipt} formatPrice={formatPrice} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Belum ada transaksi hari ini</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <SalesReport receipts={receipts} formatPrice={formatPrice} />
          </TabsContent>
        </Tabs>

        {/* Photocopy Dialog */}
        {photocopyProduct && (
          <PhotocopyDialog
            isOpen={showPhotocopyDialog}
            onClose={() => {
              setShowPhotocopyDialog(false);
              setPhotocopyProduct(null);
            }}
            product={photocopyProduct}
            onAddToCart={addToCart}
          />
        )}
      </div>
    </div>
  );
};