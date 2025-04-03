import twilio from 'twilio';

// Configurazioni Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const toNumber = process.env.TWILIO_ADMIN_WHATSAPP;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

// Controlla se le configurazioni di Twilio sono disponibili
const isTwilioConfigured = () => {
  return !!(accountSid && authToken && messagingServiceSid && toNumber);
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
    
    // Prepariamo solo l'ID dell'ordine per i link
    const orderId = order._id.toString();
    
    // Preparazione dei parametri per il template WhatsApp
    const templateParams = {
      1: order.location, // Zona dell'ordine
      2: order.customerName, // Nome cliente
      3: order.locationDetail || 'Non specificata', // Posizione dettagliata
      4: itemsList, // Items ordinati
      5: order.total.toFixed(2), // Totale dell'ordine
      6: orderId // Solo l'ID dell'ordine, il template avrà l'URL completo
    };
    
    // Invio messaggio tramite WhatsApp utilizzando il Messaging Service di Twilio
    const message = await client.messages.create({
      body: '', // Il corpo è definito dal template
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${toNumber}`,
      messagingServiceSid: messagingServiceSid,
      contentSid: process.env.TWILIO_CONTENT_SID, // ID del template WhatsApp
      contentVariables: JSON.stringify(templateParams)
    });
    
    console.log(`Notifica WhatsApp inviata: ${message.sid}`);
    
    return { 
      success: true, 
      message: 'Notifica WhatsApp inviata con successo', 
      data: { messageSid: message.sid } 
    };
  } catch (error: any) {
    console.error('Errore durante l\'invio della notifica WhatsApp:', error);
    return { 
      success: false, 
      message: 'Errore durante l\'invio della notifica WhatsApp', 
      error: error.message 
    };
  }
};

export default {
  sendOrderNotification
}; 