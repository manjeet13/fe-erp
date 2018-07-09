 var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var db        = {};
var CONFIG = require(path.join(process.env.L1Root,'../../../config/config.js'));
//const CLASSMETHODS = 'classMethods';
//const ASSOCIATE = 'associate';

const sequelize = new Sequelize(CONFIG.db_name, CONFIG.db_user, CONFIG.db_password, {
  host: CONFIG.db_host,
  dialect: CONFIG.db_dialect,
  port: CONFIG.db_port,
  operatorsAliases: false,
  sync:{force:false},
  define:{
    timestamps: false
  }
});

// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
//   })
//   .forEach(file => {
//     var model = sequelize['import'](path.join(__dirname, file));
// //    console.log(model);
//     db[model.name] = model;
//   });


// Object.keys(db).forEach(modelName => {
//     // console.log("CALLING ASSOCIATIONS",modelName);
//     // console.log(db[modelName].associate);
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });


// db.sequelize = sequelize;
// db.Sequelize = Sequelize;
// module.exports = db;
// const fs = require("fs"); // file system for grabbing files
// const path = require("path"); // better than '\/..\/' for portability
// const Sequelize = require("sequelize"); // Sequelize is a constructor
// const env = process.env.NODE_ENV || "development"; // use process environment
// const config = require(path.join(__dirname, '..', 'config.js'))[env] // Use the .config.json file in the parent folder
// const sequelize = new Sequelize(config.database, config.username, config.password, {
//   dialect: config.dialect,
// });

// Load each model file
const models = Object.assign({}, ...fs.readdirSync(__dirname)
  .filter(file =>
    (file.indexOf(".") !== 0) && (file !== "index.js")
  )
  .map(function (file) {
    const model = require(path.join(__dirname, file));
    // console.log(model.init(sequelize).tableName)
    return {
      [model.name]: model.init(sequelize),
    };
  })
);

// Load model associations
for (const model of Object.keys(models)) {
  typeof models[model].associate === 'function' && models[model].associate(models);
}

//console.log(models);

module.exports = models;