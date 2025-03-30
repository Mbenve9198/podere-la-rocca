'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ClockIcon, 
  Loader2Icon, 
  CheckCircleIcon, 
  XCircleIcon, 
  RefreshCwIcon, 
  ChevronDownIcon, 
  LogOutIcon,
  ArrowLeftIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('waiting');
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<{orderId: string, newStatus: string, actionName: string} | null>(null);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Verifica l'autenticazione
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/admin/auth/me');
        const data = await response.json();

        if (data.success && data.admin) {
          setIsAuthenticated(true);
          setAdminName(data.admin.name);
          await fetchOrders();
          setupAutoRefresh();
        } else {
          router.push('/admin');
        }
      } catch (error) {
        console.error('Errore durante la verifica dell\'autenticazione:', error);
        router.push('/admin');
      }
    }

    checkAuth();
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
      }
    };
  }, [router]);

  // Imposta un aggiornamento automatico ogni 20 secondi
  const setupAutoRefresh = () => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
    }
    refreshInterval.current = setInterval(() => {
      fetchOrders(true);
    }, 20000);
  };

  // Carica gli ordini
  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);
    
    try {
      let url = '/api/admin/orders';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
        
        // Se c'è un ordine selezionato, aggiorna i suoi dati
        if (selectedOrder) {
          const updatedOrder = data.data.find((order: Order) => order._id === selectedOrder._id);
          if (updatedOrder) {
            setSelectedOrder(updatedOrder);
          }
        }
      } else {
        if (!silent) {
          toast.error('Impossibile caricare gli ordini');
        }
      }
    } catch (error) {
      console.error('Errore durante il recupero degli ordini:', error);
      if (!silent) {
        toast.error('Errore di connessione');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Gestisce il cambio di filtro di stato
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setLoading(true);
    // Delay necessario per consentire l'aggiornamento dello state di statusFilter
    setTimeout(() => {
      fetchOrders();
    }, 50);
  };

  // Aggiorna lo stato dell'ordine
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setConfirmDialogOpen(false);
      setActionToConfirm(null);
      
      // Mostra toast di operazione in corso
      toast.loading('Aggiornamento in corso...');
      
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Aggiorna gli ordini
        await fetchOrders(true);
        
        // Toasts per tipi di aggiornamento diversi
        if (newStatus === 'completed') {
          toast.success('Ordine completato con successo');
        } else if (newStatus === 'processing') {
          toast.success('Ordine in preparazione');
        } else if (newStatus === 'cancelled') {
          toast.success('Ordine annullato');
        } else {
          toast.success('Stato aggiornato');
        }
      } else {
        toast.error(data.message || 'Impossibile aggiornare lo stato dell\'ordine');
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dello stato dell\'ordine:', error);
      toast.error('Errore di connessione');
    }
  };

  // Gestisce l'apertura del dialog di conferma
  const confirmAction = (orderId: string, newStatus: string, actionName: string) => {
    setActionToConfirm({ orderId, newStatus, actionName });
    setConfirmDialogOpen(true);
  };

  // Gestisce il logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      toast.success('Logout effettuato');
      router.push('/admin');
    } catch (error) {
      console.error('Errore durante il logout:', error);
      toast.error('Errore durante il logout');
    }
  };

  // Ottiene il colore e l'icona del badge in base allo stato
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return { 
          icon: <ClockIcon className="h-3.5 w-3.5" />, 
          variant: 'secondary',
          text: 'In attesa'
        };
      case 'processing':
        return { 
          icon: <Loader2Icon className="h-3.5 w-3.5 animate-spin" />, 
          variant: 'warning',
          text: 'In preparazione' 
        };
      case 'completed':
        return { 
          icon: <CheckCircleIcon className="h-3.5 w-3.5" />, 
          variant: 'success',
          text: 'Completato'
        };
      case 'cancelled':
        return { 
          icon: <XCircleIcon className="h-3.5 w-3.5" />, 
          variant: 'destructive',
          text: 'Annullato'
        };
      default:
        return { 
          icon: null, 
          variant: 'default',
          text: status
        };
    }
  };

  // Formatta la data in formato leggibile
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' ' + formatTime(dateString);
  };

  // Ottiene la posizione in italiano
  const getLocationName = (location: string) => {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-amber-100 py-3 px-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-amber-800">Podere La Rocca</h1>
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="text-amber-700 p-2" 
            onClick={() => fetchOrders()} 
            disabled={refreshing}
          >
            <RefreshCwIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            className="text-amber-700 p-2" 
            onClick={handleLogout}
          >
            <LogOutIcon className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Filtri */}
      <div className="px-4 py-3 bg-white sticky top-14 shadow-sm z-10">
        <Tabs 
          value={statusFilter} 
          onValueChange={handleStatusChange} 
          className="w-full"
        >
          <TabsList className="w-full flex p-1 bg-amber-100/50">
            <TabsTrigger 
              value="waiting" 
              className="flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-white"
            >
              In attesa
            </TabsTrigger>
            <TabsTrigger 
              value="processing" 
              className="flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-white"
            >
              In preparazione
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              className="flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-white"
            >
              Tutti
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 py-3">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2Icon className="h-8 w-8 text-amber-600 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-amber-800 font-medium">
              {statusFilter === 'all' 
                ? 'Non ci sono ordini da visualizzare'
                : statusFilter === 'waiting'
                ? 'Non ci sono ordini in attesa'
                : 'Non ci sono ordini in preparazione'
              }
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              return (
                <li 
                  key={order._id}
                  onClick={() => openOrderDetails(order)}
                  className="bg-white rounded-lg shadow-sm overflow-hidden active:bg-amber-50 cursor-pointer transition-colors"
                >
                  <div className="p-3 flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <div className="font-semibold">{order.customerName}</div>
                        <Badge 
                          variant={statusBadge.variant as any} 
                          className="ml-2 flex items-center gap-1 text-xs"
                        >
                          {statusBadge.icon}
                          {statusBadge.text}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-amber-700 flex items-center">
                        <span>Ordine #{order.orderNumber}</span>
                        <span className="mx-1">•</span>
                        <span>{formatTime(order.createdAt)}</span>
                      </div>
                      
                      <div className="text-xs text-amber-700 mt-1">
                        {getLocationName(order.location)}
                        {order.locationDetail && ` - ${order.locationDetail}`}
                      </div>
                      
                      <div className="mt-2">
                        {order.items.length === 1 ? (
                          <div className="text-sm">
                            {order.items[0].quantity}x {order.items[0].name}
                          </div>
                        ) : (
                          <div className="text-sm">
                            {order.items.length} prodotti • {order.total.toFixed(2)}€
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <ChevronDownIcon className="h-5 w-5 text-amber-400 mt-1" />
                  </div>
                  
                  {/* Azioni rapide per ordini in attesa o in preparazione */}
                  {(order.status === 'waiting' || order.status === 'processing') && (
                    <div className="flex border-t border-amber-100">
                      {order.status === 'waiting' && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmAction(order._id, 'processing', 'Avvia preparazione');
                            }} 
                            className="flex-1 bg-amber-50 py-2 font-medium text-amber-700 text-sm border-r border-amber-100 active:bg-amber-100"
                          >
                            Avvia
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmAction(order._id, 'cancelled', 'Annulla ordine');
                            }} 
                            className="flex-1 bg-amber-50 py-2 font-medium text-red-500 text-sm active:bg-amber-100"
                          >
                            Annulla
                          </button>
                        </>
                      )}
                      
                      {order.status === 'processing' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmAction(order._id, 'completed', 'Completa ordine');
                          }} 
                          className="flex-1 bg-amber-50 py-2 font-medium text-green-600 text-sm active:bg-amber-100"
                        >
                          Completa
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Dialog per i dettagli dell'ordine */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh]">
          {selectedOrder && (
            <ScrollArea className="max-h-[75vh] pr-4 -mr-4">
              <div className="relative">
                <button 
                  className="absolute top-0 right-0 p-1 text-amber-700"
                  onClick={() => setOrderDetailsOpen(false)}
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                
                <div className="mb-6 pt-1">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-amber-800">
                      Ordine #{selectedOrder.orderNumber}
                    </h2>
                    
                    <Badge 
                      variant={getStatusBadge(selectedOrder.status).variant as any}
                      className="flex items-center gap-1 mt-1"
                    >
                      {getStatusBadge(selectedOrder.status).icon}
                      {getStatusBadge(selectedOrder.status).text}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-amber-600 mt-1">
                    {formatDate(selectedOrder.createdAt)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
                  <div>
                    <label className="text-xs font-medium text-amber-600">Cliente</label>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-amber-600">Posizione</label>
                    <p className="font-medium">
                      {getLocationName(selectedOrder.location)}
                      {selectedOrder.locationDetail && (
                        <span className="block text-sm font-normal text-amber-700">
                          {selectedOrder.locationDetail}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                {selectedOrder.notes && (
                  <div className="mb-6">
                    <label className="text-xs font-medium text-amber-600">Note</label>
                    <p className="p-2 bg-amber-50 rounded-md text-sm mt-1">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
                
                <div className="mb-6">
                  <label className="text-xs font-medium text-amber-600 mb-2 block">
                    Prodotti ordinati
                  </label>
                  
                  <ul className="bg-amber-50 rounded-lg overflow-hidden divide-y divide-amber-100">
                    {selectedOrder.items.map((item, index) => (
                      <li key={index} className="flex justify-between items-center p-3">
                        <div className="flex items-start gap-2">
                          <div className="bg-amber-200 text-amber-800 font-medium h-6 w-6 rounded-full flex items-center justify-center text-xs">
                            {item.quantity}
                          </div>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium text-amber-800">
                          {(item.price * item.quantity).toFixed(2)}€
                        </span>
                      </li>
                    ))}
                    
                    <li className="flex justify-between items-center p-3 font-medium bg-amber-100/50">
                      <span>Totale</span>
                      <span className="text-amber-800">{selectedOrder.total.toFixed(2)}€</span>
                    </li>
                  </ul>
                </div>
                
                {/* Azioni ordine */}
                {selectedOrder.status === 'waiting' && (
                  <div className="flex space-x-2 mb-2">
                    <Button 
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                      onClick={() => confirmAction(selectedOrder._id, 'processing', 'Avvia preparazione')}
                    >
                      Avvia preparazione
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => confirmAction(selectedOrder._id, 'cancelled', 'Annulla ordine')}
                    >
                      Annulla ordine
                    </Button>
                  </div>
                )}
                
                {selectedOrder.status === 'processing' && (
                  <div className="mb-2">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => confirmAction(selectedOrder._id, 'completed', 'Completa ordine')}
                    >
                      Segna come completato
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog di conferma */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          {actionToConfirm && (
            <div className="text-center pt-2">
              <h3 className="text-lg font-medium mb-3">Conferma azione</h3>
              <p className="mb-5">
                Sei sicuro di voler {actionToConfirm.actionName.toLowerCase()}?
              </p>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setConfirmDialogOpen(false)}
                >
                  Annulla
                </Button>
                <Button 
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  onClick={() => updateOrderStatus(actionToConfirm.orderId, actionToConfirm.newStatus)}
                >
                  Conferma
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 