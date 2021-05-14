const passport = require('passport');
const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError } = require('../erros');
const tokens = require('./tokens');
// const allowListRefreshToken = require('../../redis');

async function verificaRefreshToken(refreshToken) {
    if (!refreshToken) {
        throw new InvalidArgumentError('Refresh não enviado!');
    }
    // const id = await allowListRefreshToken.buscaValor(refreshToken);
    // if (!id) {
    //     throw new InvalidArgumentError('Refresh token inválido!');
    // }
    // return id;
}

async function invalidaRefreshToken(refreshToken) {
    // await allowlistRefreshToken.deleta(refreshToken);
}

module.exports = {
    local: (req, res, next) => {
        passport.authenticate('local', 
            { session: false }, 
            (err, usuario, info) => {
                if (err && err.name === 'InvalidArgumentError') {
                    return res.status(401).json({ erro: err.message });
                }

                if (err) {
                    return res.status(500).json({ erro: err.message });
                }

                if (!usuario) {
                    return res.status(401).json();
                }

                req.user = usuario;
                req.estaAutenticado = true;
                return next();
            }
        )(req, res, next);
    },

    bearer: (req, res, next) => {
        passport.authenticate(
            'bearer',
            { session: false },
            (erro, usuario, info) => {
                if (erro && erro.name === 'JsonWebTokenError') {
                    return res.status(401).json({ erro: erro.message });
                }

                if (erro && erro.name === 'TokenExpiredError') {
                    return res.status(401).json({ erro: erro.message, expiradoEm: erro.expiredAt });
                }

                if (erro) {
                    return res.status(500).json({ erro: erro.message });
                }

                if (!usuario) {
                    return res.status(401).json();
                }

                req.token = info.token;
                req.user = usuario;
                req.estaAutenticado = true; 
                return next();
            }
        )(req, res, next);
    },

    refresh: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
            const id = await verificaRefreshToken(refreshToken);
            await invalidaRefreshToken(refreshToken);
            req.user = await Usuario.buscaPorId(id);
            return next();
        } catch(err) {
            if (err.name === 'InvalidArgumentError') {
                return res.status(401).json({ erro: err.message });
            }
            return res.status(500).json({ erro: err.message });
        }
    },

    async verificacaoEmail(req, res, next) {
        try {
            const {token} = req.params;
            const id = await tokens.verificacaoEmail.verifica(token);
            const usuario = await Usuario.buscaPorId(id);
            req.user = usuario;
            next();
        } catch(err) {
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ erro: err.message });
            }

            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ erro: err.message, expiradoEm: err.expiredAt });
            }

            return res.status(500).json({ erro: err.message });
        }
    }
}