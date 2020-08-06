import app from './app';
import connection from './Helpers/init_typeorm';
connection
  .then((connection) => {
    if (connection.isConnected) {
      console.log('Typeorm connected to database...');
      app.listen(app.get('port'), () => {
        console.log(`Server running on PORT ${app.get('port')}`);
      });
    }
  })
  .catch((err) => {
    console.error(err);
  });
