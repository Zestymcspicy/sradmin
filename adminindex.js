var db = firebase.firestore()

let quill;
function initializeEditor() {
    let journalId;
    quill = new Quill("#editor", {
      theme: "snow",
      modules: {
        toolbar: [
          [{
            // size: ["small", "normal", "huge"],
            header: [1, 2, 3, 4, 5, 6],
          }],
          ["bold", "italic", "underline"],
          ["image"]
        ]
      }
    });
  }

  function addNewBlogEntry() {
    let contents = quill.getContents();
    // const journalId=Date.now();
    // let entry = {
    //   _id: journalId,
    //   contents: contents
    // };
    entry = JSON.stringify(contents);
    updateBlog(entry);
  }

  function updateBlog(entry){
    db.collection("quillPosts").add({entry: entry})
    .then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
  }
if(location.href.indexOf("index")!==-1){
(() => {
  initializeEditor()
  let sendButton = document.querySelector("#sendButton")
  sendButton.addEventListener("click", e => addNewBlogEntry())
})()
}

if(document.location.href.indexOf('smokescorner.html')!==-1){
  var db = firebase.firestore()

  // let featuredTitle = document.getElementById('featuredTitle');
  let feateuredText = document.getElementById('featuredText');
  db.collection('quillPosts').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        let data = (doc.data());
        data = data.entry;
        // let entry = JSON.parse(data)
        const entry = JSON.parse(data);
        console.log(entry);
        const quillText = new Quill(document.createElement('div'));
        quillText.setContents(entry);
        featuredText.insertAdjacentHTML('afterBegin',`${quillText.root.innerHTML}`);
    });
});
  console.log('welcome to smokescorner');
}
