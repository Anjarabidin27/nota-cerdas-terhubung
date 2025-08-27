import { Product } from '@/types/pos';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number, customPrice?: number) => void;
  onPhotocopyClick: (product: Product) => void;
}

export const ProductGrid = ({ products, onAddToCart, onPhotocopyClick }: ProductGridProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="pos-item-grid">
      {products.map((product) => (
        <Card 
          key={product.id} 
          className="pos-card pos-card-hover cursor-pointer group"
          onClick={() => product.isPhotocopy ? onPhotocopyClick(product) : onAddToCart(product)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                {product.category && (
                  <Badge variant="secondary" className="text-xs mb-2">
                    {product.category}
                  </Badge>
                )}
              </div>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.sellPrice)}
                </span>
                {!product.isPhotocopy && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Stok</div>
                    <div className={`font-semibold ${
                      product.stock <= 5 ? 'text-error' : 'text-success'
                    }`}>
                      {product.stock}
                    </div>
                  </div>
                )}
                {product.isPhotocopy && (
                  <div className="text-right text-xs text-muted-foreground">
                    <div>Tiered Pricing:</div>
                    <div>150+ = Rp285</div>
                    <div>400+ = Rp275</div>
                    <div>1000+ = Rp260</div>
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full"
                disabled={product.stock === 0 && !product.isPhotocopy}
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.isPhotocopy) {
                    onPhotocopyClick(product);
                  } else {
                    onAddToCart(product);
                  }
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.stock === 0 && !product.isPhotocopy ? 'Stok Habis' : product.isPhotocopy ? 'Tambah Fotocopy' : 'Tambah ke Keranjang'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};