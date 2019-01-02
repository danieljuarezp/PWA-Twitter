// Routes.js - Módulo de rutas
var express = require('express');
var router = express.Router();


const messages = [];

// Get mensajes
router.get('/', function (req, res) {
  //res.json('Obteniendo mensajes');
  res.json(messages);
});

// Post mensajes
router.post('/', function (req, res) {
  
  const message = {
    message: req.body.message,
    user: req.body.user
  };

  messages.push(message);

  res.json({
    ok: true,
    message
  });

});

module.exports = router;