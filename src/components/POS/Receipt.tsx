import { Receipt as ReceiptType } from '@/types/pos';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer, Download } from 'lucide-react';
import { forwardRef } from 'react';

interface ReceiptProps {
  receipt: ReceiptType;
  onPrint: () => void;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ receipt, onPrint }, ref) => {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(price);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    };

    return (
      <Card className="pos-card max-w-md mx-auto">
        <CardHeader className="text-center pb-4">
          <h2 className="text-xl font-bold">Toko Serbaguna</h2>
          <p className="text-sm text-muted-foreground">
            Jl. Raya No. 123, Kota Jakarta
          </p>
          <p className="text-sm text-muted-foreground">
            Telp: (021) 1234-5678
          </p>
        </CardHeader>

        <CardContent 
          ref={ref}
          className="printable pos-receipt space-y-4"
        >
          <div className="text-center">
            <div className="font-mono text-lg font-bold">STRUK PENJUALAN</div>
            <div className="text-sm text-muted-foreground">
              {receipt.id}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(receipt.timestamp)}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            {receipt.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="flex-1">
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-muted-foreground">
                    {formatPrice(item.finalPrice || item.product.sellPrice)} × {item.quantity}
                  </div>
                </div>
                <div className="font-medium">
                  {formatPrice((item.finalPrice || item.product.sellPrice) * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(receipt.subtotal)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL</span>
              <span>{formatPrice(receipt.total)}</span>
            </div>
          </div>

          <Separator />

          <div className="text-center text-sm text-muted-foreground">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
            <p className="mt-2 font-mono">
              Kasir: Admin | {receipt.paymentMethod?.toUpperCase() || 'CASH'}
            </p>
          </div>
        </CardContent>

        <div className="p-4 space-y-2">
          <Button 
            className="w-full"
            onClick={onPrint}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Struk
          </Button>
          
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => {
              const receiptData = `data:text/plain;charset=utf-8,${encodeURIComponent(
                `TOKO SERBAGUNA\n${receipt.id}\n${formatDate(receipt.timestamp)}\n\n${
                  receipt.items.map(item => {
                    const price = item.finalPrice || item.product.sellPrice;
                    return `${item.product.name}\n${formatPrice(price)} × ${item.quantity} = ${formatPrice(price * item.quantity)}`;
                  }).join('\n\n')
                }\n\nSubtotal: ${formatPrice(receipt.subtotal)}\nTOTAL: ${formatPrice(receipt.total)}`
              )}`;
              const link = document.createElement('a');
              link.href = receiptData;
              link.download = `receipt-${receipt.id}.txt`;
              link.click();
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Struk
          </Button>
        </div>
      </Card>
    );
  }
);

Receipt.displayName = 'Receipt';