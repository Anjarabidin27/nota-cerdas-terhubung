import { CartItem } from '@/types/pos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart as CartIcon, Minus, Plus, Trash2, CreditCard } from 'lucide-react';

interface ShoppingCartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProcessTransaction: () => void;
}

export const ShoppingCart = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProcessTransaction,
}: ShoppingCartProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = cart.reduce((sum, item) => {
    const price = item.finalPrice || item.product.sellPrice;
    return sum + (price * item.quantity);
  }, 0);
  const total = subtotal; // No tax

  if (cart.length === 0) {
    return (
      <Card className="pos-card h-fit">
        <CardHeader className="text-center py-8">
          <CartIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="text-muted-foreground">Keranjang Kosong</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pilih produk untuk memulai transaksi
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="pos-card h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CartIcon className="h-5 w-5" />
            Keranjang
          </div>
          <Badge variant="secondary">{cart.length} item</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="max-h-96 overflow-y-auto space-y-3">
          {cart.map((item) => (
            <div key={item.product.id} className="pos-cart-item">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{item.product.name}</h4>
                <div className="text-xs text-muted-foreground mb-2">
                  {formatPrice(item.finalPrice || item.product.sellPrice)} × {item.quantity}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                    className="h-8 w-16 text-center text-sm"
                    min="1"
                    max={item.product.stock}
                  />
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 ml-auto text-error hover:bg-error hover:text-error-foreground"
                    onClick={() => onRemoveItem(item.product.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-lg">
                  {formatPrice((item.finalPrice || item.product.sellPrice) * item.quantity)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <Button 
            className="w-full"
            variant="success"
            onClick={onProcessTransaction}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Proses Pembayaran
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onClearCart}
          >
            Kosongkan Keranjang
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};