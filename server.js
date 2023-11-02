const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handling Uncaught Exceptions-------------------------
// process.on('uncaughtException', (err) => {
//   console.log('UNCAUGHT EXCEPTION 💥 Shutting down..........');
//   // console.log(err.name, err.message);
//   process.exit(1);
// });

dotenv.config({ path: './config.env' });
const app = require('./app');

//CONNECTING MONGOOSE
// REPLACING PASSWORD IN CONNECTION STRING
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

//CONNECTING DATABASE
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

// console.log(process.env);
console.log(app.get('env'));

//START SERVER
const port = process.env.PORT || 3000;

//LISTENING ON PORT
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//HANDLING UNHANDLED PROMISE REJECTIONS-------------------"SAFETY NET"
// process.on('unhandledRejection', (err) => {
//   console.log('UNHANDLED REJECTION 💥 Shutting down..........');
//   // console.log(err);
//   server.close(() => {
//     process.exit(1);
//   });
// });

// HANDLING SIGTERM
// process.on('SIGTERM', () => {
//   console.log('SIGTERM RECEIVED. Shutting down...');
//   server.close(() => {
//     console.log('Process Terminated!!!');
//   });
// });
