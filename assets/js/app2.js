

const cl = console.log

const postContainer = document.getElementById("postContainer")
const loader = document.getElementById("loader")
const blogForm = document.getElementById("blogForm")
const titleCntrl = document.getElementById("title")
const contentCntrl = document.getElementById("content")
const userIdCntrl = document.getElementById("userId")
const addPostBtn = document.getElementById("addPostBtn")
const updatePostBtn = document.getElementById("updatePostBtn")

let BASE_URL = `https://blog-task-43dea-default-rtdb.firebaseio.com`;
let POST_URL = `${BASE_URL}/blogs.json`;

function toggleSpinner(flag){
if(flag){
    loader.classList.remove("d-none")
}else{
    loader.classList.add("d-none")
}
}

function snackBar(title, icon){
 Swal.fire({
    title,
    icon,
    timer :1200
 })
}

function blogObjToArr(obj){
let blogsArr = [];
for (const key in obj) {
   obj[key].id = key
   blogsArr.push(obj[key])   
}
return blogsArr
}

function createCards(arr){
let res = arr.map(p => {
    return `
    <div class="card mb-3 shadow rounded" id="${p.id}">
                    <div class="card-header">
                        <h3 class="m-0">${p.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">
                        ${p.content}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>
                    </div>
                </div> `;
}).join("")

postContainer.innerHTML = res;
}

function makeApiCall(apiUrl ,methodName,msgBody){
 msgBody = msgBody ? JSON.stringify(msgBody) : null
 toggleSpinner(true)
 return fetch(apiUrl, {
    method : methodName,
    body : msgBody,
    headers : {
      Auth : "Token From LS",
      "Content-Type" : "application/json"
    }
  })
  .then(res => {
    return res.json()
    .then(data => {
        cl(data)
        if(!res.ok){
            throw new Error("res.status || Network Error")
        }
        return data
    })
  })
  .finally(()=>{
    toggleSpinner(false)
  })
}

function fetchAllBlogs(){
    makeApiCall(POST_URL, "GET", null)
    .then(data => {
        cl(data)
        let blogsArr = blogObjToArr(data)
        createCards(blogsArr)
    })
    .catch(err =>  snackBar(err, "error"))
}

fetchAllBlogs()


function onBlogAdd(e){
    e.preventDefault()
    let blogObj = {
        title : titleCntrl.value,
        content : contentCntrl.value,
        userId : userIdCntrl.value
    }

    makeApiCall(POST_URL, "POST", blogObj)
    .then(data=> {
        cl(data)

        let card = document.createElement("div");
        card.className = "card mb-3 shadow rounded";
        card.id = data.name;
        card.innerHTML = `
        <div class="card-header">
                        <h3 class="m-0">${blogObj.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">
                        ${blogObj.content}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>
                    </div>
        `;
        postContainer.append(card)
        blogForm.reset()
    })
    .catch(err => {
            snackBar('something went wrong while creating new blog', 'error')
        }) 
    
}

function onRemove(ele){
    Swal.fire({
        title: "Do you want to Remove this blog",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Remove it!"
    }).then((result) => {
        if (result.isConfirmed) {
            let REMOVE_ID = ele.closest('.card').id
            cl(REMOVE_ID)
            const REMOVE_URL = `${BASE_URL}/blogs/${REMOVE_ID}.json`;

            makeApiCall(REMOVE_URL, "DELETE", null)

            .then(data => {
                    cl(data)
                    ele.closest('.card').remove();
                    snackBar(`The blog with id ${REMOVE_ID} is removed successfully!!`, "success");
                })
                .catch(err => {
                    cl(err);
                    snackBar("Something went wrong while removing", "error");
                })
           
        }
    })
}

function onEdit(ele){
    let EDIT_ID = ele.closest(".card").id;
    const EDIT_URL = `${BASE_URL}/blogs/${EDIT_ID}.json`;
    localStorage.setItem("EDIT_ID", EDIT_ID);
    
    blogForm.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    setTimeout(() => {
        titleCntrl.focus();
    }, 400); 
    makeApiCall(EDIT_URL, "GET", null)
    .then(data => {
        titleCntrl.value = data.title
        contentCntrl.value = data.content;
        userIdCntrl.value = data.userId;

         addPostBtn.classList.add("d-none");
        updatePostBtn.classList.remove("d-none");
       
    })
    .catch(err => snackBar(err, 'error'))

}

function onUpdate(){
    let UPDATED_ID = localStorage.getItem("EDIT_ID");
    let UPDATED_URL = `${BASE_URL}/blogs/${UPDATED_ID}.json`;

    const UPDATED_OBJ = {
        title : titleCntrl.value,
        content : contentCntrl.value,
        id : UPDATED_ID,

    }
    makeApiCall(UPDATED_URL, "PATCH", UPDATED_OBJ)
    .then(data => {
        let card = document.getElementById(UPDATED_ID)
        card.querySelector('.card-header h3').innerHTML = data.title;
        card.querySelector('.card-body p').innerHTML = data.content;
        card.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
         card.classList.add("border", "border-success");
         setTimeout(() => {
                card.classList.remove("border", "border-success");
            }, 1200);
            blogForm.reset();

            updatePostBtn.classList.add("d-none");
            addPostBtn.classList.remove("d-none");
            snackBar(`The Blog  updated successfully`, "success")

    })
    .catch(err => {
            snackBar(`Something went wrong while updating blog!!`, "error");
        })
}

blogForm.addEventListener("submit", onBlogAdd);
updatePostBtn.addEventListener("click", onUpdate);

