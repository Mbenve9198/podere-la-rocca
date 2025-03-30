const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// Definisci le stringhe di connessione e il nome del database
const mongoURI = 'mongodb+srv://marco:g3eBGj8oLSGg6yhF@podere-la-rocca.1qhm07p.mongodb.net/?retryWrites=true&w=majority&appName=podere-la-rocca';
const dbName = 'cocktail-app';

async function seedDatabase() {
  try {
    // Connetti al database
    console.log('Connessione al database...');
    await mongoose.connect(mongoURI);
    console.log('Connesso con successo al database');

    const db = mongoose.connection.db;

    // Crea le collezioni se non esistono
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Crea o svuota le collezioni
    if (!collectionNames.includes('categories')) {
      await db.createCollection('categories');
    } else {
      await db.collection('categories').deleteMany({});
    }

    if (!collectionNames.includes('locations')) {
      await db.createCollection('locations');
    } else {
      await db.collection('locations').deleteMany({});
    }

    if (!collectionNames.includes('products')) {
      await db.createCollection('products');
    } else {
      await db.collection('products').deleteMany({});
    }

    // Dati di seed per le categorie principali
    const mainCategories = [
      {
        name: 'cocktails',
        translations: {
          it: 'Cocktails',
          en: 'Cocktails'
        },
        parent: null,
        order: 1
      },
      {
        name: 'softDrinks',
        translations: {
          it: 'Bevande & Soft Drinks',
          en: 'Drinks & Soft Drinks'
        },
        parent: null,
        order: 2
      },
      {
        name: 'caffetteria',
        translations: {
          it: 'Caffetteria',
          en: 'Coffee Bar'
        },
        parent: null,
        order: 3
      },
      {
        name: 'lightLunch',
        translations: {
          it: 'Light Lunch',
          en: 'Light Lunch'
        },
        parent: null,
        order: 4
      }
    ];

    // Inserisci le categorie principali
    const mainCategoriesResult = await db.collection('categories').insertMany(mainCategories);
    console.log(`Inserite ${mainCategoriesResult.insertedCount} categorie principali`);

    // Recupera l'ID della categoria Light Lunch
    const lightLunchCategory = await db.collection('categories').findOne({ name: 'lightLunch' });
    const lightLunchId = lightLunchCategory._id;

    // Dati di seed per le sottocategorie di Light Lunch
    const lightLunchSubcategories = [
      {
        name: 'antipasti',
        translations: {
          it: 'Antipasti',
          en: 'Starters'
        },
        parent: lightLunchId,
        order: 1
      },
      {
        name: 'primi',
        translations: {
          it: 'Primi piatti',
          en: 'First Courses'
        },
        parent: lightLunchId,
        order: 2
      },
      {
        name: 'secondi',
        translations: {
          it: 'Secondi piatti',
          en: 'Main Courses'
        },
        parent: lightLunchId,
        order: 3
      },
      {
        name: 'contorni',
        translations: {
          it: 'Contorni',
          en: 'Side Dishes'
        },
        parent: lightLunchId,
        order: 4
      },
      {
        name: 'frutta',
        translations: {
          it: 'Frutta',
          en: 'Fruit'
        },
        parent: lightLunchId,
        order: 5
      }
    ];

    // Inserisci le sottocategorie
    const subcategoriesResult = await db.collection('categories').insertMany(lightLunchSubcategories);
    console.log(`Inserite ${subcategoriesResult.insertedCount} sottocategorie`);

    // Mappa per memorizzare gli ID delle categorie
    const categoriesMap = new Map();
    
    // Aggiungi le categorie principali alla mappa
    for (const cat of mainCategories) {
      const catDoc = await db.collection('categories').findOne({ name: cat.name });
      categoriesMap.set(cat.name, catDoc._id);
    }
    
    // Aggiungi le sottocategorie alla mappa
    for (const subcat of lightLunchSubcategories) {
      const subcatDoc = await db.collection('categories').findOne({ name: subcat.name });
      categoriesMap.set(subcat.name, subcatDoc._id);
    }

    // Dati di seed per le posizioni
    const locations = [
      // Camere
      {
        type: 'camera',
        name: 'Junior suite 10',
        translations: {
          it: 'Junior suite 10',
          en: 'Junior suite 10'
        },
        available: true,
        order: 1
      },
      {
        type: 'camera',
        name: 'Poggio Saragio 11',
        translations: {
          it: 'Poggio Saragio 11',
          en: 'Poggio Saragio 11'
        },
        available: true,
        order: 2
      },
      {
        type: 'camera',
        name: 'Abbazia 14',
        translations: {
          it: 'Abbazia 14',
          en: 'Abbazia 14'
        },
        available: true,
        order: 3
      },
      {
        type: 'camera',
        name: 'Colmata 12',
        translations: {
          it: 'Colmata 12',
          en: 'Colmata 12'
        },
        available: true,
        order: 4
      },
      {
        type: 'camera',
        name: 'Loggetta 32',
        translations: {
          it: 'Loggetta 32',
          en: 'Loggetta 32'
        },
        available: true,
        order: 5
      },
      {
        type: 'camera',
        name: 'Conte 31',
        translations: {
          it: 'Conte 31',
          en: 'Conte 31'
        },
        available: true,
        order: 6
      },
      {
        type: 'camera',
        name: 'Fonte al Giunco 21',
        translations: {
          it: 'Fonte al Giunco 21',
          en: 'Fonte al Giunco 21'
        },
        available: true,
        order: 7
      },
      {
        type: 'camera',
        name: 'Querce 22',
        translations: {
          it: 'Querce 22',
          en: 'Querce 22'
        },
        available: true,
        order: 8
      },
      {
        type: 'camera',
        name: 'Colombaccio 34',
        translations: {
          it: 'Colombaccio 34',
          en: 'Colombaccio 34'
        },
        available: true,
        order: 9
      },
      {
        type: 'camera',
        name: 'Cortona 35',
        translations: {
          it: 'Cortona 35',
          en: 'Cortona 35'
        },
        available: true,
        order: 10
      },
      {
        type: 'camera',
        name: 'Arco 33',
        translations: {
          it: 'Arco 33',
          en: 'Arco 33'
        },
        available: true,
        order: 11
      },
      // Piscina
      {
        type: 'piscina',
        name: 'Ombrellone 1',
        translations: {
          it: 'Ombrellone 1',
          en: 'Umbrella 1'
        },
        available: true,
        order: 1
      },
      {
        type: 'piscina',
        name: 'Ombrellone 2',
        translations: {
          it: 'Ombrellone 2',
          en: 'Umbrella 2'
        },
        available: true,
        order: 2
      },
      {
        type: 'piscina',
        name: 'Ombrellone 3',
        translations: {
          it: 'Ombrellone 3',
          en: 'Umbrella 3'
        },
        available: true,
        order: 3
      },
      {
        type: 'piscina',
        name: 'Ombrellone 4',
        translations: {
          it: 'Ombrellone 4',
          en: 'Umbrella 4'
        },
        available: true,
        order: 4
      },
      {
        type: 'piscina',
        name: 'Ombrellone 5',
        translations: {
          it: 'Ombrellone 5',
          en: 'Umbrella 5'
        },
        available: true,
        order: 5
      },
      {
        type: 'piscina',
        name: 'Ombrellone 6',
        translations: {
          it: 'Ombrellone 6',
          en: 'Umbrella 6'
        },
        available: true,
        order: 6
      },
      {
        type: 'piscina',
        name: 'Ombrellone 7',
        translations: {
          it: 'Ombrellone 7',
          en: 'Umbrella 7'
        },
        available: true,
        order: 7
      },
      {
        type: 'piscina',
        name: 'Ombrellone 8',
        translations: {
          it: 'Ombrellone 8',
          en: 'Umbrella 8'
        },
        available: true,
        order: 8
      },
      {
        type: 'piscina',
        name: 'Ombrellone 9',
        translations: {
          it: 'Ombrellone 9',
          en: 'Umbrella 9'
        },
        available: true,
        order: 9
      },
      {
        type: 'piscina',
        name: 'Ombrellone 10',
        translations: {
          it: 'Ombrellone 10',
          en: 'Umbrella 10'
        },
        available: true,
        order: 10
      },
      {
        type: 'piscina',
        name: 'Ombrellone 11',
        translations: {
          it: 'Ombrellone 11',
          en: 'Umbrella 11'
        },
        available: true,
        order: 11
      },
      // Giardino
      {
        type: 'giardino',
        name: 'Giardino',
        translations: {
          it: 'Giardino',
          en: 'Garden'
        },
        available: true,
        order: 1
      }
    ];

    // Inserisci le posizioni
    const locationsResult = await db.collection('locations').insertMany(locations);
    console.log(`Inserite ${locationsResult.insertedCount} posizioni`);

    // Dati di seed per i prodotti
    const products = [
      // Cocktails
      {
        name: 'Aperol Spritz',
        translations: {
          it: 'Aperol Spritz',
          en: 'Aperol Spritz'
        },
        price: 7,
        category: categoriesMap.get('cocktails'),
        order: 1
      },
      {
        name: 'Hugo',
        translations: {
          it: 'Hugo',
          en: 'Hugo'
        },
        price: 7,
        category: categoriesMap.get('cocktails'),
        order: 2
      },
      {
        name: 'Gin Tonic',
        translations: {
          it: 'Gin Tonic',
          en: 'Gin Tonic'
        },
        price: 7,
        category: categoriesMap.get('cocktails'),
        order: 3
      },
      {
        name: 'Americano',
        translations: {
          it: 'Americano',
          en: 'Americano'
        },
        price: 7,
        category: categoriesMap.get('cocktails'),
        order: 4
      },
      
      // Soft Drinks
      {
        name: 'Aranciata',
        translations: {
          it: 'Aranciata',
          en: 'Orange Soda'
        },
        price: 3,
        category: categoriesMap.get('softDrinks'),
        order: 1
      },
      {
        name: 'Coca Cola',
        translations: {
          it: 'Coca Cola',
          en: 'Coca Cola'
        },
        price: 3,
        category: categoriesMap.get('softDrinks'),
        order: 2
      },
      {
        name: "Succo d'arancia",
        translations: {
          it: "Succo d'arancia",
          en: 'Orange Juice'
        },
        price: 3,
        category: categoriesMap.get('softDrinks'),
        order: 3
      },
      {
        name: 'Thè freddo al limone',
        translations: {
          it: 'Thè freddo al limone',
          en: 'Lemon Iced Tea'
        },
        price: 3,
        category: categoriesMap.get('softDrinks'),
        order: 4
      },
      {
        name: 'Birra 33cl',
        translations: {
          it: 'Birra 33cl',
          en: 'Beer 33cl'
        },
        price: 6,
        category: categoriesMap.get('softDrinks'),
        order: 5
      },
      {
        name: 'Acqua naturale/frizzante 500ml',
        translations: {
          it: 'Acqua naturale/frizzante 500ml',
          en: 'Still/Sparkling water 500ml'
        },
        price: 1.5,
        category: categoriesMap.get('softDrinks'),
        order: 6
      },
      
      // Caffetteria
      {
        name: 'Caffè',
        translations: {
          it: 'Caffè',
          en: 'Espresso'
        },
        price: 2,
        category: categoriesMap.get('caffetteria'),
        order: 1
      },
      {
        name: 'Americano',
        translations: {
          it: 'Americano',
          en: 'Americano Coffee'
        },
        price: 2,
        category: categoriesMap.get('caffetteria'),
        order: 2
      },
      {
        name: 'Cappuccino',
        translations: {
          it: 'Cappuccino',
          en: 'Cappuccino'
        },
        price: 3,
        category: categoriesMap.get('caffetteria'),
        order: 3
      },
      {
        name: 'Thè',
        translations: {
          it: 'Thè',
          en: 'Tea'
        },
        price: 2,
        category: categoriesMap.get('caffetteria'),
        order: 4
      },
      
      // Antipasti
      {
        name: 'Caprese (mozzarella di bufala, pomodoro e basilico)',
        translations: {
          it: 'Caprese (mozzarella di bufala, pomodoro e basilico)',
          en: 'Caprese (buffalo mozzarella, tomato and basil)'
        },
        price: 8,
        category: categoriesMap.get('antipasti'),
        order: 1
      },
      {
        name: 'Insalatona con tonno, pomodorini, lattuga e olive',
        translations: {
          it: 'Insalatona con tonno, pomodorini, lattuga e olive',
          en: 'Large salad with tuna, cherry tomatoes, lettuce and olives'
        },
        price: 12,
        category: categoriesMap.get('antipasti'),
        order: 2
      },
      {
        name: 'Insalatona con petto di pollo, uova sode, rucola, pecorino, pomodorini e olive',
        translations: {
          it: 'Insalatona con petto di pollo, uova sode, rucola, pecorino, pomodorini e olive',
          en: 'Large salad with chicken breast, hard-boiled eggs, arugula, pecorino cheese, cherry tomatoes and olives'
        },
        price: 12,
        category: categoriesMap.get('antipasti'),
        order: 3
      },
      {
        name: 'Prosciutto e melone (in base alla disponibilità)',
        translations: {
          it: 'Prosciutto e melone (in base alla disponibilità)',
          en: 'Prosciutto and melon (subject to availability)'
        },
        price: 10,
        category: categoriesMap.get('antipasti'),
        order: 4
      },
      
      // Primi
      {
        name: 'Spaghetto al pomodoro',
        translations: {
          it: 'Spaghetto al pomodoro',
          en: 'Spaghetti with tomato sauce'
        },
        price: 10,
        category: categoriesMap.get('primi'),
        order: 1
      },
      {
        name: 'Tagliatelle al ragù rosso di Chianina',
        translations: {
          it: 'Tagliatelle al ragù rosso di Chianina',
          en: 'Tagliatelle with Chianina beef red sauce'
        },
        price: 12,
        category: categoriesMap.get('primi'),
        order: 2
      },
      {
        name: 'Ravioli di ricotta e spinaci con burro e salvia',
        translations: {
          it: 'Ravioli di ricotta e spinaci con burro e salvia',
          en: 'Ravioli with ricotta and spinach, served with butter and sage'
        },
        price: 12,
        category: categoriesMap.get('primi'),
        order: 3
      },
      
      // Secondi
      {
        name: 'Tagliata di vitellone bianco al rosmarino',
        translations: {
          it: 'Tagliata di vitellone bianco al rosmarino',
          en: 'Sliced white beef with rosemary'
        },
        price: 18,
        category: categoriesMap.get('secondi'),
        order: 1
      },
      {
        name: 'Petto di pollo alla griglia',
        translations: {
          it: 'Petto di pollo alla griglia',
          en: 'Grilled chicken breast'
        },
        price: 12,
        category: categoriesMap.get('secondi'),
        order: 2
      },
      {
        name: 'Carpaccio di manzo con rucola, pomodorini e scaglie di pecorino',
        translations: {
          it: 'Carpaccio di manzo con rucola, pomodorini e scaglie di pecorino',
          en: 'Beef carpaccio with arugula, cherry tomatoes and pecorino cheese flakes'
        },
        price: 15,
        category: categoriesMap.get('secondi'),
        order: 3
      },
      {
        name: 'Piadina prosciutto crudo, stracchino e rucola',
        translations: {
          it: 'Piadina prosciutto crudo, stracchino e rucola',
          en: 'Flatbread with prosciutto, stracchino cheese and arugula'
        },
        price: 8,
        category: categoriesMap.get('secondi'),
        order: 4
      },
      {
        name: 'Piadina prosciutto cotto, crema di funghi e lattuga',
        translations: {
          it: 'Piadina prosciutto cotto, crema di funghi e lattuga',
          en: 'Flatbread with cooked ham, mushroom cream and lettuce'
        },
        price: 8,
        category: categoriesMap.get('secondi'),
        order: 5
      },
      
      // Contorni
      {
        name: 'Insalata mista (pomodorini e lattuga)',
        translations: {
          it: 'Insalata mista (pomodorini e lattuga)',
          en: 'Mixed salad (cherry tomatoes and lettuce)'
        },
        price: 4,
        category: categoriesMap.get('contorni'),
        order: 1
      },
      {
        name: 'Patatine fritte',
        translations: {
          it: 'Patatine fritte',
          en: 'French fries'
        },
        price: 4,
        category: categoriesMap.get('contorni'),
        order: 2
      },
      
      // Frutta
      {
        name: 'Frutta fresca di stagione',
        translations: {
          it: 'Frutta fresca di stagione',
          en: 'Fresh seasonal fruit'
        },
        price: 5,
        category: categoriesMap.get('frutta'),
        order: 1
      }
    ];

    // Inserisci i prodotti
    const productsResult = await db.collection('products').insertMany(products);
    console.log(`Inseriti ${productsResult.insertedCount} prodotti`);

    console.log('Database popolato con successo!');
  } catch (error) {
    console.error('Errore durante il seeding del database:', error);
  } finally {
    // Chiudi la connessione
    await mongoose.disconnect();
    console.log('Connessione al database chiusa');
    process.exit(0);
  }
}

// Esegui la funzione di seeding
seedDatabase(); 