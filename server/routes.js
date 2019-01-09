// Routes.js - Módulo de rutas
const express = require('express');
const router = express.Router();
const push = require('./push');

const messages = [];

// Get mensajes
router.get('/', function (req, res) {
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

// Almacenar la suscribcion de notificaciones
router.post('/subscribe', (req, res) =>{
 const subscription = req.body;
 push.AddSubscription(subscription);
  res.json('subscribe');
});

// Obtener el key publico
router.get('/key', (req, res) =>{
  const key = push.GetKey();
  res.send(key);
});

// Enviar notificacion push
router.post('/push', (req, res) =>{
  res.json('key publico');
})

module.exports = router;