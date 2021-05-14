//const allowlistRefreshToken = require('../../redis/allowlist-refresh-token');

//const blacklist = require('../../redis/manipula-blacklist');
const crypto = require('crypto');
const moment = require('moment');

async function verificaTokenNaBlacklist(token) {
    // const tokenNaBlacklist = await blacklist.contemToken(token); 
    // if (tokenNaBlacklist) {
    //     throw new jwt.JsonWebTokenError('Token inválido por logout!');
    // }
}

function criaTokenJWT(id, [tempoQuantidade, tempoUnidade]) {
    const payload = { 
      id
    };
  
    const token = jwt.sign(payload, process.env.CHAVE_JWT, { expiresIn: tempoQuantidade+tempoUnidade });
    return token;
  }
  
  async function criaTokenOpaco(id, [tempoQuantidade, tempoUnidade], allowlist) {
    const tokenOpaco = crypto.randomBytes(24).toString('hex');
    const dataExpiracao = moment().add(tempoQuantidade, tempoUnidade).unix();
    //await allowlist.adiciona(tokenOpaco, id, dataExpiracao);
  
    return tokenOpaco;
  }

async function verificaTokenJWT(token) {
    await verificaTokenNaBlacklist(token);
    const payload = jwt.verify(token, process.env.CHAVE_JWT);
}

module.exports = {
    access: {
        expiracao: [15, 'm'],
        cria(id) {
            return criaTokenJWT(id, this.expiracao);
        },
        verifica(token) {
            return verificaTokenJWT(token);
        }
    },
    refresh: {
        //lista: allowlistRefreshToken,
        expiracao: [5, 'd'],
        cria(id) {
            return criaTokenOpaco(id, this.expiracao);
        },
        verifica(token) {
            return verificaTokenOpaco(token);
        }
    },
    verificacaoEmail: {
        nome: 'token de verificação de e-mail',
        expiracao: [1, 'h'],
        cria(id) {
            return criaTokenJWT(id, this.expiracao);
        },
        verifica(token) {
            return verificaTokenJWT(token, this.nome);
        }
    }
}