import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Search,
  AlertTriangle,
  Plus,
  Minus
} from 'lucide-react';
import { Product } from '@/types/pos';

interface StockManagementProps {
  products: Product[];
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  formatPrice: (price: number) => string;
  showLowStockOnly?: boolean;
}

export const StockManagement = ({ 
  products, 
  onUpdateProduct, 
  formatPrice,
  showLowStockOnly = false 
}: StockManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (showLowStockOnly) {
      return matchesSearch && product.stock <= 5 && !product.isPhotocopy;
    }
    
    return matchesSearch;
  });

  const handleStockUpdate = (productId: string, change: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newStock = Math.max(0, product.stock + change);
      onUpdateProduct(productId, { stock: newStock });
    }
  };

  return (
    <Card className="pos-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showLowStockOnly ? (
              <>
                <AlertTriangle className="h-5 w-5 text-error" />
                Stok Menipis
              </>
            ) : (
              <>
                <Package className="h-5 w-5" />
                Manajemen Stok
              </>
            )}
          </div>
          <Badge variant={showLowStockOnly ? "destructive" : "secondary"}>
            {filteredProducts.length} produk
          </Badge>
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

        {showLowStockOnly && filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Tidak ada produk dengan stok menipis</p>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className={`border rounded-lg p-4 ${
                product.stock <= 5 && !product.isPhotocopy 
                  ? 'border-error bg-error/5' 
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{product.name}</h3>
                  {product.category && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {product.category}
                    </Badge>
                  )}
                </div>
                
                {product.stock <= 5 && !product.isPhotocopy && (
                  <AlertTriangle className="h-4 w-4 text-error ml-2" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-3">
                <div>
                  <span className="block">Harga Kulakan:</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(product.costPrice)}
                  </span>
                </div>
                <div>
                  <span className="block">Harga Jual:</span>
                  <span className="font-medium text-foreground">
                    {product.isPhotocopy ? 'Per lembar' : formatPrice(product.sellPrice)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Stok:</span>
                  <Badge 
                    variant={
                      product.stock <= 5 && !product.isPhotocopy ? "destructive" : "secondary"
                    }
                    className="font-mono"
                  >
                    {product.stock} {product.isPhotocopy ? 'layanan' : 'unit'}
                  </Badge>
                </div>

                {!product.isPhotocopy && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockUpdate(product.id, -1)}
                      disabled={product.stock <= 0}
                      className="h-7 w-7 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockUpdate(product.id, 1)}
                      className="h-7 w-7 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {product.stock <= 5 && !product.isPhotocopy && (
                <div className="mt-2 p-2 bg-warning/10 rounded border border-warning/20">
                  <p className="text-xs text-warning font-medium">
                    ⚠️ Stok menipis - perlu ditambah stok
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};