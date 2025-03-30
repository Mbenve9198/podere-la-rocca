// Script per creare l'utente amministratore

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configurazione MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/podere-la-rocca';

// Schema Admin
const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'super-admin'],
      default: 'admin',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-hook per criptare la password
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Metodo per confrontare le password
AdminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Registra il modello Admin
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seedAdmin() {
  try {
    console.log('Connessione al database MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connessione al database stabilita');

    // Credenziali dell'admin
    const adminData = {
      username: 'admin@podere-la-rocca.com',
      password: 'Poderelaroccaadmin2025!',
      name: 'Amministratore Podere La Rocca',
      role: 'admin',
    };

    // Verifica se l'admin esiste già
    const existingAdmin = await Admin.findOne({ username: adminData.username });

    if (existingAdmin) {
      console.log('L\'utente amministratore esiste già.');
    } else {
      // Crea l'amministratore
      const admin = new Admin(adminData);
      await admin.save();
      console.log('Utente amministratore creato con successo!');
    }

    await mongoose.disconnect();
    console.log('Disconnessione dal database completata');
    process.exit(0);
  } catch (error) {
    console.error('Errore durante la creazione dell\'utente amministratore:', error);
    process.exit(1);
  }
}

// Esegui lo script
seedAdmin(); 