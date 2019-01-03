const db = new PouchDB("TwitterCloneDB");

function SaveMessage(message) {
  message._id = new Date().toISOString();

  return db.put(message).then(() => {
    self.registration.sync.register("new-message");

    const newResponse = {
      ok: true,
      offline: true
    };

    return new Response(JSON.stringify(newResponse));
  });
}

function PostMessage() {
  const messageArray = [];

  return db.allDocs({ include_docs: true, descending: true }).then(messages => {
    
    messages.rows.forEach(message => {
      const doc = message.doc;

      const fetchProm = fetch("api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(doc)
      }).then(resp => {
        return db.remove(doc);
      });

      messageArray.push(fetchProm);

    });

    return Promise.all(messageArray);
  });
}
