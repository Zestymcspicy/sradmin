var db = firebase.firestore()
let posts;
let quill;
let postToEdit;

if (userAgent.isIos()) {
    document.querySelector('html').classList.add('is-ios');
}

function initializeEditor() {
    let journalId;
    quill = new Quill("#editor", {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [ { 'align':[] }]
          // ["image"]
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
if(document.querySelector('#editor')){
    initializeEditor()
    let saveButton = document.querySelector("#saveButton")
    document.querySelector('#noFrontPost').addEventListener('click', setNoFrontPost)
    saveButton.addEventListener("click", addNewBlogEntry, true)
}

if(document.getElementById('featuredPostHook')){
  loadBlogPost();
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
        let isFrontPage = data.frontPage?"Front Page":"";
        let publishedBtnText = data.published?"Un-publish":"Publish";
        let published = data.published?"Published":"Unpublished";
        posts.push(data)
        // let entry = JSON.parse(data)
        const entry = JSON.parse(text);
        const quillText = new Quill(document.createElement('div'));
        quillText.setContents(entry);
        previewText.insertAdjacentHTML('afterBegin',`<div class='border m-4'>
        <span class="border border-success">${published} ${isFrontPage}</span>
        <div>${quillText.root.innerHTML}</div>
        <div class="btn-group" data-docId="${doc.id}">
          <button class="setFrontButton btn btn-primary m-2">Set Front Page</button>
          <button class="editButton btn btn-success m-2">Edit</button>
          <button class="publishButton btn btn-warning m-2">${publishedBtnText}</button>
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
  document.querySelectorAll(".publishButton").forEach(button => {
    let docid = getParentId(button)
    button.addEventListener('click', e => {
      e.preventDefault();
      togglePublish(docid)
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

function togglePublish(id) {
  let published = posts.filter(post => post.id===id)[0].published
  let newState = published ? false : true;
  let updateRef = db.collection("quillPosts").doc(`${id}`)
  return updateRef.update({
    published: newState
  })
  .then(function() {
    console.log("Document successfully updated!");
    resetPreviewText();
  })
  .catch(function(error) {
    // The document probably doesn't exist.
    console.error("Error updating document: ", error);
  });

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

function setNoFrontPost() {
  let oldFrontPageText= posts.filter(x => x.frontPage===true)[0];
  let updateRef = db.collection("quillPosts").doc(`${oldFrontPageText.id}`)
  return updateRef.update({
    frontPage: false
  })
  .then(function() {
    console.log("Document successfully updated!");
    resetPreviewText();
  })
  .catch(function(error) {
    // The document probably doesn't exist.
    console.error("Error updating document: ", error);
  });
}

function editPost(id) {
  window.scrollTo(0,0);
  postToEdit = posts.filter(x=>x.id===id)[0]
  let postContent = JSON.parse(postToEdit.entry)
  console.log(postToEdit);
  quill.setContents(postContent);

  saveButton.removeEventListener("click", addNewBlogEntry, true);
  saveButton.addEventListener("click", updatePost, true);

  // console.log(posts.filter(post => post.id===id))
}

function updatePost() {
  postToEdit.entry=JSON.stringify(quill.getContents())
  console.log(postToEdit)
  let updateRef = db.collection("quillPosts").doc(`${postToEdit.id}`)
  return updateRef.update({
    entry: postToEdit.entry
  })
  .then(function() {
    console.log("Document successfully updated!");
    saveButton.addEventListener("click", addNewBlogEntry, true);
    resetPreviewText();
    quill.setContents('');
  })
  .catch(function(error) {
    // The document probably doesn't exist.
    console.error("Error updating document: ", error);
  });

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

function loadBlogPost(){
  db.collection('quillPosts').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        let data = (doc.data());
        let textData = data.entry;
        let frontPageBlogArea = document.createRange().createContextualFragment(`<div>
          <h2 class="pt-3 text-center">A word from the creator.....</h2>
          <div class="row marketing">
            <div class="col-md-11 px-0 ml-md-5 mr-md-2">
            <p class="px-md-4 pl-md-4" id="featuredText"></p>
            </div>
          </div>
          </div>`)
        if(data.frontPage===true){
          let featuredText = frontPageBlogArea.getElementById('featuredText');
          document.getElementById('featuredPostHook').appendChild(frontPageBlogArea)
        // let entry = JSON.parse(data)
          const entry = JSON.parse(textData);
          console.log(data);
          const quillText = new Quill(document.createElement('div'));
          quillText.setContents(entry);
          featuredText.insertAdjacentHTML('afterBegin',`${quillText.root.innerHTML}`);
      }
    });
  });
}
