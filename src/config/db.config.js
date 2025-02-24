
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.PG_DATABASE, process.env.PG_USER, process.env.PG_PASSWORD, {
    host: process.env.PG_HOST,
    dialect: process.env.PG_DIALECT
});


const initDb = async () => {

    try {
        await sequelize.authenticate();
        console.log('✅ Connected to PostgreSQL database.');
    } catch (error) {
        console.error('❌ Error connecting to PostgreSQL database:', error);
    }

};

initDb();

