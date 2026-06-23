const { Sequelize } = require('sequelize');
const path = require('path');

const dialect = process.env.DB_DIALECT || 'sqlite';
let sequelize;

if (dialect === 'mysql') {
  console.log('🔄 Connecting to MySQL Database...');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'commercegrid_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  console.log('🔄 Connecting to local SQLite Database...');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../commercegrid.sqlite'),
    logging: false
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database Connected (${dialect})`);
  } catch (error) {
    console.error(`❌ Database Connection Error (${dialect}):`, error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
