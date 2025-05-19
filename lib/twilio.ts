import twilio from 'twilio';

// Configurazioni Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const toNumbers = process.env.TWILIO_ADMIN_WHATSAPP?.split(',') || [];
const fromNumber = process.env.TWILIO_FROM_NUMBER;

// Controlla se le configurazioni di Twilio sono disponibili
const isTwilioConfigured = () => {
  return !!(accountSid && authToken && messagingServiceSid && toNumbers.length > 0);
};

// Crea client Twilio se le configurazioni sono disponibili
const getTwilioClient = () => {
  if (!isTwilioConfigured()) {
    console.error('Configurazione Twilio mancante');
    return null;
  }
  
  return twilio(accountSid, authToken);
};

/**
 * Invia un messaggio WhatsApp agli amministratori quando viene ricevuto un nuovo ordine
 * @param order - L'ordine per cui inviare la notifica
 * @returns Un oggetto con l'esito dell'operazione
 */
export const sendOrderNotification = async (order: any) => {
  try {
    if (!isTwilioConfigured()) {
      console.warn('Notifica ordine saltata: configurazione Twilio mancante');
      return { success: false, message: 'Configurazione Twilio mancante' };
    }
    
    const client = getTwilioClient();
    if (!client) {
      return { success: false, message: 'Impossibile creare client Twilio' };
    }
    
    // Costruiamo la lista degli articoli per il messaggio
    const itemsList = order.items.map((item: any) => 
      `${item.name} x${item.quantity}`
    ).join(', ');
    
    // Aggiungiamo l'informazione sull'orario di ritiro se presente
    let itemsInfo = itemsList;
    
    // Verifichiamo se è un ordine Light Lunch controllando gli item
    const hasLightLunchItems = order.items.some((item: any) => 
      item.productId?.includes('lightLunch') || 
      item.name?.toLowerCase().includes('light lunch')
    );
    
    // Se è un Light Lunch e c'è un orario di ritiro, lo aggiungiamo alle info
    if (hasLightLunchItems && order.pickup_time) {
      itemsInfo += `\n\n⏰ *RITIRO LIGHT LUNCH*: ${order.pickup_time}`;
    }
    
    // Prepariamo l'ID dell'ordine e il percorso di completamento
    const orderId = order._id.toString();
    const completeOrderPath = `${orderId}/complete`;
    
    // Preparazione dei parametri per il template WhatsApp
    const templateParams = {
      1: order.location, // Zona dell'ordine
      2: order.customerName, // Nome cliente
      3: order.locationDetail || 'Non specificata', // Posizione dettagliata
      4: itemsInfo, // Items ordinati + informazioni sull'orario di ritiro
      5: order.total.toFixed(2), // Totale dell'ordine
      6: completeOrderPath // ID dell'ordine + /complete per l'URL di completamento
    };
    
    // Invio messaggi a tutti i numeri specificati
    const messagePromises = toNumbers.map(async (toNumber) => {
      const message = await client.messages.create({
        body: '', // Il corpo è definito dal template
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${toNumber.trim()}`,
        messagingServiceSid: messagingServiceSid,
        contentSid: process.env.TWILIO_CONTENT_SID, // ID del template WhatsApp
        contentVariables: JSON.stringify(templateParams)
      });
      
      console.log(`Notifica WhatsApp inviata a ${toNumber}: ${message.sid}`);
      return message;
    });
    
    const messages = await Promise.all(messagePromises);
    
    return { 
      success: true, 
      message: 'Notifiche WhatsApp inviate con successo', 
      data: { messageSids: messages.map(m => m.sid) } 
    };
  } catch (error: any) {
    console.error('Errore durante l\'invio delle notifiche WhatsApp:', error);
    return { 
      success: false, 
      message: 'Errore durante l\'invio delle notifiche WhatsApp', 
      error: error.message 
    };
  }
};

export default {
  sendOrderNotification
}; 