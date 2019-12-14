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

(() => {
  initializeEditor()
  let sendButton = document.querySelector("#sendButton")
  sendButton.addEventListener("click", e => addNewBlogEntry())
})()
