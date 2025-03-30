// Importazioni in formato CommonJS
const mongoose = require('mongoose');
const dbConnect = require('../lib/mongodb').default;
const Location = require('../models/Location').default;
const Category = require('../models/Category').default;
const Product = require('../models/Product').default;

// Dati delle location
const locationData = [
  // Camera
  {
    type: 'camera',
    name: 'Junior suite 10',
    translations: {
      it: 'Junior suite 10',
      en: 'Junior suite 10',
    },
    available: true,
    order: 1,
  },
  {
    type: 'camera',
    name: 'Poggio Saragio 11',
    translations: {
      it: 'Poggio Saragio 11',
      en: 'Poggio Saragio 11',
    },
    available: true,
    order: 2,
  },
  {
    type: 'camera',
    name: 'Abbazia 14',
    translations: {
      it: 'Abbazia 14',
      en: 'Abbazia 14',
    },
    available: true,
    order: 3,
  },
  {
    type: 'camera',
    name: 'Colmata 12',
    translations: {
      it: 'Colmata 12',
      en: 'Colmata 12',
    },
    available: true,
    order: 4,
  },
  {
    type: 'camera',
    name: 'Loggetta 32',
    translations: {
      it: 'Loggetta 32',
      en: 'Loggetta 32',
    },
    available: true,
    order: 5,
  },
  {
    type: 'camera',
    name: 'Conte 31',
    translations: {
      it: 'Conte 31',
      en: 'Conte 31',
    },
    available: true,
    order: 6,
  },
  {
    type: 'camera',
    name: 'Fonte al Giunco 21',
    translations: {
      it: 'Fonte al Giunco 21',
      en: 'Fonte al Giunco 21',
    },
    available: true,
    order: 7,
  },
  {
    type: 'camera',
    name: 'Querce 22',
    translations: {
      it: 'Querce 22',
      en: 'Querce 22',
    },
    available: true,
    order: 8,
  },
  {
    type: 'camera',
    name: 'Colombaccio 34',
    translations: {
      it: 'Colombaccio 34',
      en: 'Colombaccio 34',
    },
    available: true,
    order: 9,
  },
  {
    type: 'camera',
    name: 'Cortona 35',
    translations: {
      it: 'Cortona 35',
      en: 'Cortona 35',
    },
    available: true,
    order: 10,
  },
  {
    type: 'camera',
    name: 'Arco 33',
    translations: {
      it: 'Arco 33',
      en: 'Arco 33',
    },
    available: true,
    order: 11,
  },
  
  // Piscina
  ...Array.from({ length: 11 }, (_, i) => ({
    type: 'piscina',
    name: `Ombrellone ${i + 1}`,
    translations: {
      it: `Ombrellone ${i + 1}`,
      en: `Umbrella ${i + 1}`,
    },
    available: true,
    order: i + 1,
  })),
  
  // Giardino
  {
    type: 'giardino',
    name: 'Giardino',
    translations: {
      it: 'Giardino',
      en: 'Garden',
    },
    available: true,
    order: 1,
  },
];

// Dati delle categorie
const categoryData = [
  {
    name: 'cocktails',
    translations: {
      it: 'Cocktails',
      en: 'Cocktails',
    },
    order: 1,
  },
  {
    name: 'softDrinks',
    translations: {
      it: 'Bevande & Soft Drinks',
      en: 'Drinks & Soft Drinks',
    },
    order: 2,
  },
  {
    name: 'caffetteria',
    translations: {
      it: 'Caffetteria',
      en: 'Coffee Bar',
    },
    order: 3,
  },
  {
    name: 'lightLunch',
    translations: {
      it: 'Light Lunch',
      en: 'Light Lunch',
    },
    order: 4,
  },
];

// Dati delle sottocategorie per Light Lunch
const subcategoryData = [
  {
    name: 'antipasti',
    translations: {
      it: 'Antipasti',
      en: 'Starters',
    },
    order: 1,
  },
  {
    name: 'primi',
    translations: {
      it: 'Primi piatti',
      en: 'First Courses',
    },
    order: 2,
  },
  {
    name: 'secondi',
    translations: {
      it: 'Secondi piatti',
      en: 'Main Courses',
    },
    order: 3,
  },
  {
    name: 'contorni',
    translations: {
      it: 'Contorni',
      en: 'Side Dishes',
    },
    order: 4,
  },
  {
    name: 'frutta',
    translations: {
      it: 'Frutta',
      en: 'Fruit',
    },
    order: 5,
  },
];

// Dati dei prodotti
const productData = [
  // Cocktails
  {
    name: 'Aperol Spritz',
    price: 7,
    category: 'cocktails',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Aperol Spritz',
      en: 'Aperol Spritz',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Hugo',
    price: 7,
    category: 'cocktails',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Hugo',
      en: 'Hugo',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Gin Tonic',
    price: 7,
    category: 'cocktails',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Gin Tonic',
      en: 'Gin Tonic',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Americano',
    price: 7,
    category: 'cocktails',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Americano',
      en: 'Americano',
      description: {
        it: '',
        en: '',
      },
    },
  },
  
  // Bevande & Soft Drinks
  {
    name: 'Aranciata',
    price: 3,
    category: 'softDrinks',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Aranciata',
      en: 'Orange Soda',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Coca Cola',
    price: 3,
    category: 'softDrinks',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Coca Cola',
      en: 'Coca Cola',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: "Succo d'arancia",
    price: 3,
    category: 'softDrinks',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: "Succo d'arancia",
      en: 'Orange Juice',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Thè freddo al limone',
    price: 3,
    category: 'softDrinks',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Thè freddo al limone',
      en: 'Lemon Ice Tea',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Birra 33cl',
    price: 6,
    category: 'softDrinks',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Birra 33cl',
      en: 'Beer 33cl',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Acqua naturale/frizzante 500ml',
    price: 1.5,
    category: 'softDrinks',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Acqua naturale/frizzante 500ml',
      en: 'Still/Sparkling Water 500ml',
      description: {
        it: '',
        en: '',
      },
    },
  },
  
  // Caffetteria
  {
    name: 'Caffè',
    price: 2,
    category: 'caffetteria',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Caffè',
      en: 'Espresso',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Americano',
    price: 2,
    category: 'caffetteria',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Americano',
      en: 'American Coffee',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Cappuccino',
    price: 3,
    category: 'caffetteria',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Cappuccino',
      en: 'Cappuccino',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Thè',
    price: 2,
    category: 'caffetteria',
    subcategory: null,
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Thè',
      en: 'Tea',
      description: {
        it: '',
        en: '',
      },
    },
  },
  
  // Light Lunch - Antipasti
  {
    name: 'Caprese (mozzarella di bufala, pomodoro e basilico)',
    price: 8,
    category: 'lightLunch',
    subcategory: 'antipasti',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Caprese (mozzarella di bufala, pomodoro e basilico)',
      en: 'Caprese (buffalo mozzarella, tomato and basil)',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Insalatona con tonno, pomodorini, lattuga e olive',
    price: 12,
    category: 'lightLunch',
    subcategory: 'antipasti',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Insalatona con tonno, pomodorini, lattuga e olive',
      en: 'Large salad with tuna, cherry tomatoes, lettuce and olives',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Insalatona con petto di pollo, uova sode, rucola, pecorino, pomodorini e olive',
    price: 12,
    category: 'lightLunch',
    subcategory: 'antipasti',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Insalatona con petto di pollo, uova sode, rucola, pecorino, pomodorini e olive',
      en: 'Large salad with chicken breast, boiled eggs, arugula, pecorino cheese, cherry tomatoes and olives',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Prosciutto e melone (in base alla disponibilità)',
    price: 10,
    category: 'lightLunch',
    subcategory: 'antipasti',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Prosciutto e melone (in base alla disponibilità)',
      en: 'Prosciutto and melon (based on availability)',
      description: {
        it: '',
        en: '',
      },
    },
  },
  
  // Light Lunch - Primi piatti
  {
    name: 'Spaghetto al pomodoro',
    price: 10,
    category: 'lightLunch',
    subcategory: 'primi',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Spaghetto al pomodoro',
      en: 'Spaghetti with tomato sauce',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Tagliatelle al ragù rosso di Chianina',
    price: 12,
    category: 'lightLunch',
    subcategory: 'primi',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Tagliatelle al ragù rosso di Chianina',
      en: 'Tagliatelle with Chianina beef red ragù',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Ravioli di ricotta e spinaci con burro e salvia',
    price: 12,
    category: 'lightLunch',
    subcategory: 'primi',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Ravioli di ricotta e spinaci con burro e salvia',
      en: 'Ricotta and spinach ravioli with butter and sage',
      description: {
        it: '',
        en: '',
      },
    },
  },
  
  // Light Lunch - Secondi piatti
  {
    name: 'Tagliata di vitellone bianco al rosmarino',
    price: 18,
    category: 'lightLunch',
    subcategory: 'secondi',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Tagliata di vitellone bianco al rosmarino',
      en: 'Sliced white beef with rosemary',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Petto di pollo alla griglia',
    price: 12,
    category: 'lightLunch',
    subcategory: 'secondi',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Petto di pollo alla griglia',
      en: 'Grilled chicken breast',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Carpaccio di manzo con rucola, pomodorini e scaglie di pecorino',
    price: 15,
    category: 'lightLunch',
    subcategory: 'secondi',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Carpaccio di manzo con rucola, pomodorini e scaglie di pecorino',
      en: 'Beef carpaccio with arugula, cherry tomatoes and pecorino cheese flakes',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Piadina prosciutto crudo, stracchino e rucola',
    price: 8,
    category: 'lightLunch',
    subcategory: 'secondi',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Piadina prosciutto crudo, stracchino e rucola',
      en: 'Flatbread with prosciutto, stracchino cheese and arugula',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Piadina prosciutto cotto, crema di funghi e lattuga',
    price: 8,
    category: 'lightLunch',
    subcategory: 'secondi',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Piadina prosciutto cotto, crema di funghi e lattuga',
      en: 'Flatbread with cooked ham, mushroom cream and lettuce',
      description: {
        it: '',
        en: '',
      },
    },
  },
  
  // Light Lunch - Contorni
  {
    name: 'Insalata mista (pomodorini e lattuga)',
    price: 4,
    category: 'lightLunch',
    subcategory: 'contorni',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Insalata mista (pomodorini e lattuga)',
      en: 'Mixed salad (cherry tomatoes and lettuce)',
      description: {
        it: '',
        en: '',
      },
    },
  },
  {
    name: 'Patatine fritte',
    price: 4,
    category: 'lightLunch',
    subcategory: 'contorni',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Patatine fritte',
      en: 'French fries',
      description: {
        it: '',
        en: '',
      },
    },
  },
  
  // Light Lunch - Frutta
  {
    name: 'Frutta fresca di stagione',
    price: 5,
    category: 'lightLunch',
    subcategory: 'frutta',
    description: '',
    image: null,
    available: true,
    translations: {
      it: 'Frutta fresca di stagione',
      en: 'Fresh seasonal fruit',
      description: {
        it: '',
        en: '',
      },
    },
  },
];

// Funzione per popolare il database
async function seedDatabase() {
  try {
    // Connessione al database
    await dbConnect();
    
    console.log('Connessione al database stabilita, inizio seeding...');
    
    // Eliminazione dei dati esistenti per evitare duplicati
    await Location.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    
    console.log('Database pulito. Inserimento nuovi dati...');
    
    // Inserimento delle locations
    const locations = await Location.insertMany(locationData);
    console.log(`Inserite ${locations.length} locations nel database`);
    
    // Inserimento delle categorie e sottocategorie
    const categories = await Category.insertMany([...categoryData, ...subcategoryData]);
    console.log(`Inserite ${categories.length} categorie nel database`);
    
    // Inserimento dei prodotti
    const products = await Product.insertMany(productData);
    console.log(`Inseriti ${products.length} prodotti nel database`);
    
    console.log('Seeding completato con successo!');
    
    // Chiusura della connessione
    await mongoose.disconnect();
    console.log('Connessione al database chiusa');
    
    process.exit(0);
  } catch (error) {
    console.error('Errore durante il seeding del database:', error);
    process.exit(1);
  }
}

// Esecuzione dello script
seedDatabase(); 