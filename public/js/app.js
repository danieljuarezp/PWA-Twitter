
var url = window.location.href;
var swRegister;

// Registramos SW
if(navigator.serviceWorker) {
    
    window.addEventListener('load', function(){
        navigator.serviceWorker.register('/sw.js').then(function(register){
            swRegister = register;
            swRegister.pushManager.getSubscription().then( VerifySuscription );
        });
    })
}

// Referencias de jQuery

var titulo      = $('#titulo');
var nuevoBtn    = $('#nuevo-btn');
var salirBtn    = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn     = $('#post-btn');
var avatarSel   = $('#seleccion');
var timeline    = $('#timeline');

var modal       = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns  = $('.seleccion-avatar');
var txtMensaje  = $('#txtMensaje');

var btnEnableNotification = $('.btn-noti-enable');
var btnDisableNotification = $('.btn-noti-disable');

// El usuario, contiene el ID del héroe seleccionado
var usuario;




// ===== Codigo de la aplicación

function crearMensajeHTML(mensaje, personaje) {

    var content =`
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${ personaje }.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${ personaje }</h3>
                <br/>
                ${ mensaje }
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();

}



// Globals
function logIn( ingreso ) {

    if ( ingreso ) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');
    
    }

}


// Seleccion de personaje
avatarBtns.on('click', function() {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function() {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function() {

    modal.removeClass('oculto');
    modal.animate({ 
        marginTop: '-=1000px',
        opacity: 1
    }, 200 );

});

// Boton de cancelar mensaje
cancelarBtn.on('click', function() {
    if ( !modal.hasClass('oculto') ) {
        modal.animate({ 
            marginTop: '+=1000px',
            opacity: 0
         }, 200, function() {
             modal.addClass('oculto');
             txtMensaje.val('');
         });
    }
});

// Boton de enviar mensaje
postBtn.on('click', function() {

    var mensaje = txtMensaje.val();
    if ( mensaje.length === 0 ) {
        cancelarBtn.click();
        return;
    }

    var data = {
        message: mensaje,
        user: usuario
    };

    fetch('api',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp => resp.json())
    .then(console.log)
    .catch(console.error)


    crearMensajeHTML( mensaje, usuario );

});

// Obtener mensaje del servidor
function GetMessages(){
    fetch('api')
    .then(resp => resp.json())
    .then( messages => {
        messages.forEach(message => {
            crearMensajeHTML(message.message, message.user);      
        });
    })
}

GetMessages();

// Detectar cambios de conexion
function IsOnline(){

    if(navigator.onLine){
        // Si tiene conexion
        mdtoast('Estas conectado a internet', {
            type: mdtoast.SUCCESS, 
            interaction: true, 
            interactionTimeout: 1000,
            actionText: 'OK!'
          });       
    } else{
        mdtoast('No estas conectado a internet', {
            type: mdtoast.ERROR, 
            interaction: true, 
            actionText: 'OK!'
          });
    }
}

window.addEventListener('online', IsOnline);
window.addEventListener('offline', IsOnline);

IsOnline();

// Notificaciones
function VerifySuscription(enabled){

    if(enabled){
        btnEnableNotification.removeClass('oculto');
        btnDisableNotification.addClass('oculto');
    }else{
        btnEnableNotification.addClass('oculto');
        btnDisableNotification.removeClass('oculto');
    }
}

function SendNotification(){
    const notificationOpt = {
        body: 'Cuerpo de la notificacion',
        icon: 'img/icons/icon-72x72.png'
    };

    const notification = new Notification("Notificacion", notificationOpt);

    notification.onclick = () =>{
        console.log("Click en la notificacion")
    }
}

function NotificationMe(){
    if( !window.Notification ){
        mdtoast('Este navegador no soporta las notificaciones', {
            type: mdtoast.ERROR, 
            interaction: true, 
            actionText: 'OK!'
          });       
          return;
    }

    if( Notification.permission === 'granted' ){
        SendNotification();
    }else if  (Notification.permission !== 'denied' || Notification.permission === 'default' ){
        Notification.requestPermission( function(permission) {
            if(permission === 'granted'){
                SendNotification();
            }
        });

    }
}

// NotificationMe();

// Obtener llave publica de la suscripcion de las notificaciones
function GetPublicKey(){
    return fetch('api/key')
    .then(resp => resp.arrayBuffer())
    .then(key => new Uint8Array(key));
}

btnDisableNotification.on('click', function(){
    if( !swRegister ) return console.log('Error en el service worker');

    GetPublicKey().then(function(key) {
        swRegister.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: key
        })
        .then(res => res.toJSON())
        .then(suscription => {   
            
            fetch('api/subscribe',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(suscription)
            })
            .then(VerifySuscription)
            .catch(CancelSubscriptionNotifications)

        });
    });
});

function CancelSubscriptionNotifications(){
    swRegister.pushManager.getSubscription()
    .then(subs => {
        subs.unsubscribe()
        .then(() => VerifySuscription(false) );
    })
}


btnEnableNotification.on('click', function(){
    CancelSubscriptionNotifications();
});