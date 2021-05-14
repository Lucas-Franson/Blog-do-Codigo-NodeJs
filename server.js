require('dotenv').config();

const app = require('./app');
const port = 3000;
const db = require('./database');
// require("./redis/blacklist");

const routes = require('./rotas');
const { InvalidArgumentError, NaoEncontrado, NaoAutorizado } = require('./src/erros');
const jwt = require('jsonwebtoken');

routes(app);

app.use((erro, req, res, next) => {
    let status = 500;

    const corpo = {
        mensagem: erro.message
    }

    if (erro instanceof InvalidArgumentError) {
        status = 400;
    }

    if (erro instanceof jwt.JsonWebTokenError) {
        status = 401;
    }

    if (erro instanceof jwt.TokenExpiredError) {
        status = 401;
    }

    if (erro instanceof NaoEncontrado) {
        status = 404;
    }

    if (erro instanceof NaoAutorizado) {
        status = 401;
    }

    res.status(status);
    res.json(corpo);
});

app.listen(port, () => console.log(`App listening on port ${port}`));
