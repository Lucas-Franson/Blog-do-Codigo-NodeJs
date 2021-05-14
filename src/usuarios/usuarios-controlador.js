const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError, NaoEncontrado } = require('../erros');
const jwt = require('jsonwebtoken');
const { EmailVerificacao, EmailRedefinicaoSenha } = require('./emails');

function geraEndereco(rota, token) {
  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}${rota}${token}`;
}

function criaTokenJWT(usuario) {
  const payload = { 
    id: usuario.id
  };

  const token = jwt.sign(payload, process.env.CHAVE_JWT, { expiresIn: '15min' });
  return token;
}

async function criaTokenOpaco(usuario) {
  const tokenOpaco = crypto.randomBytes(24).toString('hex');
  const dataExpiracao = moment().add(5, 'd').unix();
  //await allowlistRefreshToken.adiciona(tokenOpaco, usuario.id, dataExpiracao);

  return tokenOpaco;
}

module.exports = {
  async adiciona(req, res, proximo) {
    const { nome, email, senha, cargo } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email,
        emailVerificado: false,
        cargo
      });

      await usuario.adicionaSenha(senha);

      await usuario.adiciona();

      const token = tokens.verificacaoEmail.cria(usuario.id);

      const endereco = geraEndereco('/usuario/verifica_email/', token);
      const emailVerificacao = new EmailVerificacao(usuario, endereco);
      emailVerificacao.enviaEmail().catch(console.log);

      res.status(201).json();
    } catch (erro) {
      proximo(erro)
    }
  },

  async login(req, res) {
    const accessToken = criaTokenJWT(req.user);
    const refreshToken = await criaTokenOpaco(req.user);
    res.set('Authorization', accessToken);
    res.status(200).json({ refreshToken });
  },

  async logout (req, res, proximo) {
    try {
      const token = req.token;
  
      //await blacklist.adiciona(token);
      res.status(204).send();
    } catch(err) {
      proximo(err);
    }
  },

  async lista(req, res) {
    const usuarios = await Usuario.lista();
    res.json(usuarios);
  },

  async verificaEmail(req, res) {
    try{ 
      const usuario = req.user;
      await usuario.verificaEmail();
      res.status(200).json(); 
    }catch(err) {
      res.status(500).json({ erro: err.message });
    }
  },

  async deleta(req, res) {
    const usuario = await Usuario.buscaPorId(req.params.id);
    try {
      await usuario.deleta();
      res.status(200).send();
    } catch (erro) {
      res.status(500).json({ erro: erro });
    }
  },

  async esqueciMinhaSenha (req, res, next) {
    const resposta = { mensagem: 'Se encontrarmos um usuario com este email...' };
    try {
      const email = req.body.email;
      const usuario = await Usuario.buscaPorEmail(email);

      const emailVerificacao = new EmailRedefinicaoSenha(usuario);
      await emailVerificacao.enviaEmail();

      res.send(resposta)
    }catch(err) {
      if (err instanceof NaoEncontrado) {
        res.send(resposta);
        return;
      }

      proximo(err);
    }
  }
};
