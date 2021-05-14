const postsControlador = require('./posts-controlador');
const { middlewareAutenticacao } = require('../usuarios');
const autorizacao = require('../middlewares/autorizacao');
const tentarAutenticar = require('../middlewares/tentarAutenticar');
const tentarAutorizar = require('../middlewares/tentarAutorizar');

module.exports = app => {
  app
    .route('/post')
    .get(
      [tentarAutenticar, tentarAutorizar('post', 'ler')],
      postsControlador.lista)
    .post(
      [ middlewareAutenticacao.bearer, autorizacao('post', 'criar') ], 
      postsControlador.adiciona);

  // app
  //   .route('/post/:id')
  //   .get(
  //     [middlewareAutenticacao.bearer, autorizacao('post', 'ler')],
  //     postsControlador.obterDetalhes
  //   )
  //   .delete(
  //     [
  //       middlewareAutenticacao.bearer, 
  //       middlewareAutenticacao.local,
  //       autorizacao('usuario', 'remover')
  //     ],
  //     postsControlador.remover
  //   )
};
