
const db = new PouchDB('TwitterCloneDB');

function SaveMessage( message ){
    message._id = new Date().toISOString();
   
    db.put(message)
    .then(() =>{
        console.log('mensaje guardado con exito!')
    });

}