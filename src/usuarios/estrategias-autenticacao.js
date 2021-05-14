const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

const usuario = require('./usuarios-modelo');
const { InvalidArgumentError, NaoAutorizado } = require('../erros');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function verificaUsuario(usuario) {
    if (!usuario) {
        throw new InvalidArgumentError('Não existe usuário com esse e-mail');
    }
}

async function verificaSenha(senha, senhaHash) {
    const senhaValida = await bcrypt.compare(senha, senhaHash);    
    if (!senhaValida) {
        throw new NaoAutorizado();
    }
}

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'senha',
        session: false
    }, async (email, senha, done) => {
        try {
            const usuario = await Usuario.buscaPorEmail(email);
            verificaUsuario(usuario);
            await verificaSenha(senha, usuario.senhaHash);

            done(null, usuario);
        } catch(err) {
            done(err);
        }
    })
);

passport.use(
    new BearerStrategy(
        async (token, done) => {
            try {
                
                const usuario = await Usuario.buscaPorId(payload.id);
                done(null, usuario, { token: token });
            } catch(err) {
                done(err);
            }
        }
    )
)