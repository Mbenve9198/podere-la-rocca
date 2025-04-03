'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export default function CompleteOrderPage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Aggiornamento stato ordine...');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const updateOrderStatus = async () => {
      try {
        // Controlla se siamo nella pagina completamento automatico o visualizzazione
        const autoComplete = window.location.pathname.includes('/complete');
        
        if (autoComplete) {
          // Aggiorna lo stato dell'ordine a "completato"
          const response = await fetch(`/api/admin/orders/${params.id}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'completed' }),
          });

          if (!response.ok) {
            throw new Error('Errore durante l\'aggiornamento dello stato dell\'ordine');
          }

          const data = await response.json();
          
          if (data.success) {
            setStatus('success');
            setMessage('Ordine contrassegnato come completato con successo!');
            
            // Recupera i dettagli dell'ordine per mostrarli
            await fetchOrderDetails();
          } else {
            throw new Error(data.message || 'Errore durante l\'aggiornamento');
          }
        } else {
          // Solo visualizzazione dei dettagli ordine
          await fetchOrderDetails();
        }
      } catch (error: any) {
        console.error('Errore:', error);
        setStatus('error');
        setMessage(`Errore: ${error.message || 'Si è verificato un errore sconosciuto'}`);
      }
    };

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Impossibile recuperare i dettagli dell\'ordine');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setOrderDetails(data.data);
          if (status === 'loading' && !window.location.pathname.includes('/complete')) {
            setStatus('success');
            setMessage('Dettagli ordine');
          }
        } else {
          throw new Error(data.message || 'Errore nel recupero dei dettagli');
        }
      } catch (error: any) {
        console.error('Errore nel recupero dei dettagli dell\'ordine:', error);
        if (status === 'loading') {
          setStatus('error');
          setMessage(`Errore: ${error.message || 'Impossibile recuperare i dettagli dell\'ordine'}`);
        }
      }
    };

    updateOrderStatus();
  }, [params.id]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'In attesa';
      case 'processing': return 'In elaborazione';
      case 'completed': return 'Completato';
      case 'cancelled': return 'Annullato';
      default: return 'Sconosciuto';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-500';
      case 'processing': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleBackToAdmin = () => {
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-amber-50 p-4 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-lg">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            {window.location.pathname.includes('/complete') && (
              <div className="text-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-2" />
                <h2 className="text-2xl font-semibold text-green-700 mb-2">{message}</h2>
              </div>
            )}

            {orderDetails && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-4">Dettagli Ordine #{orderDetails.orderNumber}</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Cliente:</span>
                    <span>{orderDetails.customerName}</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Posizione:</span>
                    <span>{orderDetails.location} {orderDetails.locationDetail ? `(${orderDetails.locationDetail})` : ''}</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Data:</span>
                    <span>{formatDate(orderDetails.createdAt)}</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Stato:</span>
                    <span className={getStatusColor(orderDetails.status)}>{getStatusText(orderDetails.status)}</span>
                  </div>
                  
                  <div className="border-b pb-2">
                    <div className="font-medium mb-2">Articoli:</div>
                    <ul className="pl-4">
                      {orderDetails.items.map((item: any, index: number) => (
                        <li key={index} className="flex justify-between mb-1">
                          <span>{item.name} x{item.quantity}</span>
                          <span>€{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Totale:</span>
                    <span>€{orderDetails.total.toFixed(2)}</span>
                  </div>
                  
                  {orderDetails.notes && (
                    <div className="border-t pt-2 mt-2">
                      <span className="font-medium">Note:</span>
                      <p className="mt-1 italic">{orderDetails.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-2" />
            <p className="text-lg text-red-600 mb-4">{message}</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Button
            onClick={handleBackToAdmin}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Torna alla Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
} 