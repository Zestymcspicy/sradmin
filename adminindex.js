var db = firebase.firestore()
let posts;
let quill;
function initializeEditor() {
    let journalId;
    quill = new Quill("#editor", {
      theme: "snow",
      modules: {
        toolbar: [
          [{
            // size: ["normal"],
            header: [1, 2, 3],
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
    resetPreviewText();
  }
if(location.href.indexOf("index")!==-1){
(() => {
  initializeEditor()
  let sendButton = document.querySelector("#sendButton")
  sendButton.addEventListener("click", e => addNewBlogEntry())
})()
}

if(document.getElementById('previewText')){
  resetPreviewText();
}

function resetPreviewText() {

  let previewText = document.getElementById('previewText');
  while (previewText.firstChild) {
    previewText.removeChild(previewText.firstChild);
  }
  posts = [];
  db.collection('quillPosts').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        let data = (doc.data());
        console.log(doc.id)
        data.id = doc.id
        let text = data.entry;
        posts.push(data)
        // let entry = JSON.parse(data)
        const entry = JSON.parse(text);
        const quillText = new Quill(document.createElement('div'));
        quillText.setContents(entry);
        previewText.insertAdjacentHTML('afterBegin',`<div class='border m-4'>
        <div>${quillText.root.innerHTML}</div>
        <div class="btn-group" data-docId="${doc.id}">
          <button class="setFrontButton btn btn-primary m-2">Set Front Page</button>
          <button class="editButton btn btn-success m-2">Edit</button>
          <button class="deleteButton btn btn-danger m-2"
          data-toggle="modal" data-target="#exampleModal">Delete</button>
        </div>
        </div>`);
    });
    addButtonListeners()
  });
}

function addButtonListeners() {
  console.log("listeners")
  document.querySelectorAll(".setFrontButton").forEach(button => {
    let docid = getParentId(button)
    button.addEventListener("click", e => {
      e.preventDefault();
      setFrontPageText(docid)
    });
  })
  document.querySelectorAll(".editButton").forEach(button => {
    let docid = getParentId(button)
    button.addEventListener("click", e => {
      e.preventDefault();
      editPost(docid);
    });
  })
  document.querySelectorAll(".deleteButton").forEach(button => {
    let docid = getParentId(button)
    button.addEventListener("click", e => {
      e.preventDefault();
      deletePost(docid);
    });
  })
}

function setFrontPageText(id) {
  let oldFrontPageText= posts.filter(x => x.frontPage===true)
  var newFrontPageText = db.collection("quillPosts").doc(`${id}`);
  console.log(newFrontPageText)
  let batch = db.batch();
  oldFrontPageText.forEach(x => {
    // const name = `${x.key}`
    var thisOldText = db.collection("quillPosts").doc(`${x.id}`)
    console.log(x.id)
    batch.update(thisOldText, {"frontPage": false});
  })
  batch.update(newFrontPageText, {"frontPage": true});
  batch.commit()
  .then(res=>console.log(res))
  .catch(err=>console.log(err))
  resetPreviewText();
}

function editPost(id) {
  console.log(posts.filter(post => post.id===id))
}

function deletePost(id) {
  document.getElementById('confirmDeletion').addEventListener('click', e => {
    let post = posts.filter(post => id===post.id)
    db.collection("archive").doc(`${id}`).set({
      entry: post[0].entry,
      frontPage: false
    }).then(function() {
    console.log("Document successfully written!");
    })
    .catch(function(error) {
      console.error("Error writing document: ", error);
    });
    db.collection("quillPosts").doc(`${id}`).delete().then(function() {
        console.log("Document successfully deleted!");
      }).catch(function(error) {
        console.error("Error removing document: ", error);
      });
    resetPreviewText();
  })
}

function getParentId(button){
  return button.parentElement.dataset.docid;
}
// if(document.location.href.indexOf('smokescorner.html')!==-1){
//   var db = firebase.firestore()
//
//   // let featuredTitle = document.getElementById('featuredTitle');
//   let featuredText = document.getElementById('featuredText');
//   db.collection('quillPosts').get().then((querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//         let data = (doc.data());
//         data = data.entry;
//         // let entry = JSON.parse(data)
//         const entry = JSON.parse(data);
//         console.log(entry);
//         const quillText = new Quill(document.createElement('div'));
//         quillText.setContents(entry);
//         featuredText.insertAdjacentHTML('afterBegin',`${quillText.root.innerHTML}`);
//     });
// });
//   console.log('welcome to smokescorner');
// }
