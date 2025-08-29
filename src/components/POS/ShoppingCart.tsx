import { useState } from 'react';
import { CartItem, Receipt as ReceiptType } from '@/types/pos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart as CartIcon, Minus, Plus, Trash2, CreditCard, Percent, Printer } from 'lucide-react';

interface ShoppingCartProps {
  cart: CartItem[];
  updateCartQuantity: (productId: string, quantity: number, finalPrice?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  processTransaction: (paymentMethod?: string, discount?: number) => ReceiptType | null;
  formatPrice: (price: number) => string;
  onPrintThermal: (receipt: ReceiptType) => void;
}

export const ShoppingCart = ({
  cart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  processTransaction,
  formatPrice,
  onPrintThermal
}: ShoppingCartProps) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');

  const subtotal = cart.reduce((sum, item) => {
    const price = item.finalPrice || item.product.sellPrice;
    return sum + (price * item.quantity);
  }, 0);

  const discountAmount = discountType === 'percent' 
    ? Math.round(subtotal * (discount / 100))
    : discount;
    
  const total = Math.max(0, subtotal - discountAmount);

  const handleCheckout = () => {
    const receipt = processTransaction(paymentMethod, discountAmount);
    if (receipt) {
      setPaymentMethod('cash');
      setDiscount(0);
      setDiscountType('amount');
    }
  };

  const handleCheckoutAndPrint = () => {
    const receipt = processTransaction(paymentMethod, discountAmount);
    if (receipt) {
      onPrintThermal(receipt);
      setPaymentMethod('cash');
      setDiscount(0);
      setDiscountType('amount');
    }
  };

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
        <div className="max-h-64 overflow-y-auto space-y-3">
          {cart.map((item, index) => (
            <div key={`${item.product.id}-${item.finalPrice || 'default'}-${index}`} className="pos-cart-item">
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
                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.finalPrice)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value) || 1, item.finalPrice)}
                    className="h-8 w-16 text-center text-sm"
                    min="1"
                  />
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.finalPrice)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 ml-auto text-error hover:bg-error hover:text-error-foreground"
                    onClick={() => removeFromCart(item.product.id)}
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
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Metode Pembayaran</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Tunai</SelectItem>
                <SelectItem value="debit">Kartu Debit</SelectItem>
                <SelectItem value="credit">Kartu Kredit</SelectItem>
                <SelectItem value="qris">QRIS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Diskon
            </Label>
            <div className="flex gap-2">
              <Select value={discountType} onValueChange={(value: 'amount' | 'percent') => setDiscountType(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">Rp</SelectItem>
                  <SelectItem value="percent">%</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0"
                value={discount || ''}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                min="0"
                max={discountType === 'percent' ? 100 : subtotal}
              />
            </div>
          </div>
          
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between text-lg">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-lg text-destructive">
                <span>Diskon:</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <Button 
            className="w-full"
            variant="success"
            onClick={handleCheckout}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Checkout
          </Button>
          
          <Button 
            className="w-full"
            variant="default"
            onClick={handleCheckoutAndPrint}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Nota
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={clearCart}
          >
            Kosongkan Keranjang
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};