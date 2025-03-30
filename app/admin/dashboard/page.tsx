'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

// Tipi di dati
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  location: string;
  locationDetail: string | null;
  items: OrderItem[];
  total: number;
  status: 'waiting' | 'processing' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Verifica l'autenticazione
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/admin/auth/me');
        const data = await response.json();

        if (data.success && data.admin) {
          setIsAuthenticated(true);
          fetchOrders();
        } else {
          router.push('/admin');
        }
      } catch (error) {
        console.error('Errore durante la verifica dell\'autenticazione:', error);
        router.push('/admin');
      }
    }

    checkAuth();
  }, [router]);

  // Carica gli ordini
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/orders';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      } else {
        toast({
          title: 'Errore',
          description: 'Impossibile caricare gli ordini',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Errore durante il recupero degli ordini:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante il caricamento degli ordini',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna lo stato dell'ordine
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Aggiorna l'ordine nella lista
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus as any } : order
          )
        );

        // Aggiorna l'ordine selezionato se necessario
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as any });
        }

        toast({
          title: 'Stato aggiornato',
          description: `L'ordine #${data.data.orderNumber} è stato aggiornato a ${getStatusTranslation(newStatus)}`,
        });
      } else {
        toast({
          title: 'Errore',
          description: data.message || 'Impossibile aggiornare lo stato dell\'ordine',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dello stato dell\'ordine:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'aggiornamento dello stato',
        variant: 'destructive',
      });
    }
  };

  // Gestisce il logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });

      router.push('/admin');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  // Formatta la data in formato leggibile
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Traduce lo stato dell'ordine in italiano
  const getStatusTranslation = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'In attesa';
      case 'processing':
        return 'In preparazione';
      case 'completed':
        return 'Completato';
      case 'cancelled':
        return 'Annullato';
      default:
        return status;
    }
  };

  // Ottiene il colore del badge in base allo stato
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'secondary';
      case 'processing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Ottiene la posizione in italiano
  const getLocationTranslation = (location: string) => {
    switch (location) {
      case 'camera':
        return 'Camera';
      case 'piscina':
        return 'Piscina';
      case 'giardino':
        return 'Giardino';
      default:
        return location;
    }
  };

  // Apre il dialog con i dettagli dell'ordine
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  if (!isAuthenticated) {
    return null; // Non mostrare nulla finché non si verifica l'autenticazione
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-5xl">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pannello di Amministrazione</h1>
          <Button variant="outline" onClick={handleLogout}>
            Esci
          </Button>
        </header>

        <Tabs defaultValue={statusFilter} onValueChange={setStatusFilter} className="mb-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all" onClick={() => { setStatusFilter('all'); fetchOrders(); }}>
              Tutti
            </TabsTrigger>
            <TabsTrigger value="waiting" onClick={() => { setStatusFilter('waiting'); fetchOrders(); }}>
              In attesa
            </TabsTrigger>
            <TabsTrigger value="processing" onClick={() => { setStatusFilter('processing'); fetchOrders(); }}>
              In preparazione
            </TabsTrigger>
            <TabsTrigger value="completed" onClick={() => { setStatusFilter('completed'); fetchOrders(); }}>
              Completati
            </TabsTrigger>
            <TabsTrigger value="cancelled" onClick={() => { setStatusFilter('cancelled'); fetchOrders(); }}>
              Annullati
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Ordini</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Caricamento ordini in corso...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">Nessun ordine trovato</div>
            ) : (
              <ScrollArea className="h-[calc(100vh-280px)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numero</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Posizione</TableHead>
                      <TableHead>Totale</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id} className="cursor-pointer hover:bg-muted/50" onClick={() => openOrderDetails(order)}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          {getLocationTranslation(order.location)}
                          {order.locationDetail && <span className="block text-xs text-muted-foreground">{order.locationDetail}</span>}
                        </TableCell>
                        <TableCell>{order.total.toFixed(2)}€</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status) as any}>
                            {getStatusTranslation(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              openOrderDetails(order);
                            }}
                          >
                            Dettagli
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Dialog per i dettagli dell'ordine */}
        <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex justify-between items-center">
                    <span>Ordine #{selectedOrder.orderNumber}</span>
                    <Badge variant={getStatusBadgeVariant(selectedOrder.status) as any}>
                      {getStatusTranslation(selectedOrder.status)}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 my-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Cliente</h3>
                    <p className="text-lg">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Posizione</h3>
                    <p className="text-lg">
                      {getLocationTranslation(selectedOrder.location)}
                      {selectedOrder.locationDetail && (
                        <span className="block text-sm">{selectedOrder.locationDetail}</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Data ordine</h3>
                    <p>{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Ultimo aggiornamento</h3>
                    <p>{formatDate(selectedOrder.updatedAt)}</p>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="my-4">
                    <h3 className="font-semibold text-sm text-muted-foreground">Note</h3>
                    <p className="p-2 bg-muted rounded-md">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="my-6">
                  <h3 className="font-semibold mb-2">Articoli ordinati</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Articolo</TableHead>
                        <TableHead className="text-right">Quantità</TableHead>
                        <TableHead className="text-right">Prezzo</TableHead>
                        <TableHead className="text-right">Totale</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.price.toFixed(2)}€</TableCell>
                          <TableCell className="text-right">{(item.price * item.quantity).toFixed(2)}€</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">Totale ordine</TableCell>
                        <TableCell className="text-right font-semibold">{selectedOrder.total.toFixed(2)}€</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-end mt-4">
                  {selectedOrder.status === 'waiting' && (
                    <>
                      <Button
                        variant="default"
                        onClick={() => updateOrderStatus(selectedOrder._id, 'processing')}
                      >
                        Inizia preparazione
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => updateOrderStatus(selectedOrder._id, 'cancelled')}
                      >
                        Annulla ordine
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <Button
                      variant="default"
                      onClick={() => updateOrderStatus(selectedOrder._id, 'completed')}
                    >
                      Segna come completato
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 