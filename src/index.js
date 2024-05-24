import express from 'express';
import { engine } from 'express-handlebars'
import morgan from 'morgan';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import productsRoutes from './routes/products.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import indexRoutes from './routes/index.routes.js';

//Inicialización
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

//Configuración
app.set('port', process.env.PORT || 3000);
app.set('views', join(__dirname, 'views'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: join(app.get('views'), 'layouts'),
    partialsDir: join(app.get('views'), 'partials'),
    extname: '.hbs'
}));

app.set('view engine', '.hbs')

//Middels
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Routes
app.use(indexRoutes);
app.use(notificationsRoutes);
app.use(productsRoutes);

//Public
app.use(express.static(join(__dirname, 'public')));

//Server
app.listen(app.get('port'), () =>
    console.log('Server on port ', app.get('port')));
console.log(app.get('views'))


