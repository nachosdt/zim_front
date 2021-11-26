
let formAPI = document.getElementById("formAPI");
let formDB = document.getElementById("formDB");
let navbtns = document.getElementsByClassName("navbtn");
[...navbtns].forEach(boton=>{
     boton.addEventListener("click", cambiar);
});
let date = document.getElementById("date");
let key = document.getElementById("key");
let datosAPI = document.getElementById("datosAPI");
let datosDB = document.getElementById("datosDB");
let titulo = document.getElementById("titulo");
let fecha = document.getElementById("fecha");
let imagen = document.getElementById("imagen");
let video = document.getElementById("video");
let copyright = document.getElementById("copy");
let descripcion = document.getElementById("descripcion");
let contenedor = document.getElementById("contenedor");
let add = document.getElementById("add");
let numero = document.getElementById("numero");
let tabla = document.getElementById("tabla");

let inicio = true;

class Foto {
    constructor(titulo, fecha, copyright, descripcion, url, media) {
        this.title = titulo;
        this.date = fecha;
        this.copyright = copyright;
        this.explanation = descripcion;
        this.url = url;
        this.media = media;
    } 
    toJSON() {
        return {
            title: this.title,
            date: this.date,
            copyright: this.copyright,
            explanation: this.explanation,
            url: this.url,
            media: this.media
        };
    }
}

let foto = null;

function cambiar(e) {
    if (!e.target.classList.contains("selected")) {
        [...navbtns].forEach(boton=>{
            boton.classList.toggle("selected")       
        });
    
        formAPI.classList.toggle("activo");
        formAPI.classList.toggle("oculto");
        formDB.classList.toggle("activo");
        formDB.classList.toggle("oculto");
        if (inicio) {            
            datosDB.classList.toggle("activo");
            datosDB.classList.toggle("oculto");            
        } else {
            datosAPI.classList.toggle("activo");
            datosAPI.classList.toggle("oculto");
            datosDB.classList.toggle("activo");
            datosDB.classList.toggle("oculto");
        }           
    }
}

async function dataAPI() {
    if (date.value && key.value) { 
        inicio = false;       
        let data = {date: date.value, key: key.value};
        console.log(data);
        let url = `https://api.nasa.gov/planetary/apod?date=${date.value}&api_key=TEZBCHPW0JSsQz2oJvCuxzrVFZcYldbaijHSB2EJ`;
        param = {
            headers:{"Content-Type": "application/json: charSet=UTF-8"},
            method: "GET"
        }
        let response = await fetch(url,param);
        let result = await response.json();
        foto = new Foto(result.title, result.date, result.copyright, result.explanation, result.url, result.media_type);
        
        actualizarFoto(foto);
    }
    
}

function actualizarFoto(foto) {
    document.getElementsByTagName("body")[0].style.backgroundImage = "none";
    if (foto.media === "image") { 
        imagen.src = foto.url;
        imagen.style.display = "block"; 
        video.style.display = "none";
    } else if (foto.media === "video") { 
        video.src = foto.url; 
        imagen.style.display = "none";
        video.style.display = "block";
    }
    titulo.textContent = foto.title;
    fecha.textContent = foto.date;    
    descripcion.textContent = foto.explanation;
    copyright.textContent = "\u00A9 " + foto.copyright;
    if (datosAPI.classList.contains("oculto")) {
        datosAPI.classList.toggle("activo");
        datosAPI.classList.toggle("oculto");
    }
    if (add.disabled) {
        add.disabled = false;
    }   
}

async function addFoto() {    
    let url = `https://zimback.herokuapp.com/fotos`;    
    let param = {
        headers: {'Content-Type': 'application/json; charset = UTF-8'},     
        method: "POST",
        body: JSON.stringify(foto)
    };
    
    let response = await fetch(url,param);
    let result = await response.json();
    console.log(result);
    if (result.code) {
        add.disabled = true;
    }
}

async function dataDB() {
    let url = `https://zimback.herokuapp.com/fotos`;    
    let param = {
        headers: {'Content-Type': 'application/json; charset = UTF-8'},     
        method: "GET"
    };
    
    let response = await fetch(url,param);
    let result = await response.json();
    console.log(result);
    numero.textContent = `${result.data.length} NASA pictures found in the DB`;
    if (result.data.length>0) {
        cargarFotos(result.data);
    } 
    
}

function cargarFotos(fotos) {
    let cabecera = '<tr class="columna"><th>TITLE</th><th>DATE</th><th>EXPLANATION</th><th>COPYRIGHT</th><th>MEDIA</th><th>URL</th><th>ACTIONS</th></tr>';
    tabla.innerHTML = cabecera;

    fotos.forEach((foto,i) => {
        let tr = document.createElement("tr");
        tr.classList.add(`foto${i+1}`);
        tr.setAttribute("data-foto", JSON.stringify(foto));
        let titulo = document.createElement("td");
        titulo.textContent = foto.title;
        let fecha = document.createElement("td");
        fecha.textContent = foto.date;
        let descripcion = document.createElement("td");
        descripcion.textContent = foto.explanation;
        descripcion.classList.add(`foto${i+1}`);
        let copy = document.createElement("td");
        copy.textContent = foto.copyright;
        let media = document.createElement("td");
        media.textContent = foto.media;
        let url = document.createElement("td");
        let img = document.createElement("img");
        img.src = foto.url;
        url.appendChild(img);
        let acciones = document.createElement("td");
        let edit = document.createElement("a");
        edit.style.textDecoration = "underline";
        edit.style.cursor = "pointer";
        edit.textContent = "Edit";
        edit.classList.add(`foto${i+1}`);
        edit.addEventListener("click",editFoto);
        let br = document.createElement("br");
        let del = document.createElement("a");
        del.style.textDecoration = "underline";
        del.style.cursor = "pointer";
        del.textContent = "Delete";
        del.classList.add(`foto${i+1}`);
        del.addEventListener("click",deleteFoto);
        acciones.appendChild(edit);
        acciones.appendChild(br);
        acciones.appendChild(del);
        tr.appendChild(titulo);
        tr.appendChild(fecha);
        tr.appendChild(descripcion);
        tr.appendChild(copy);
        tr.appendChild(media);
        tr.appendChild(url);
        tr.appendChild(acciones);
        tabla.appendChild(tr);
    });
}

async function deleteFoto(e) {
    let clase = e.target.classList.item(0);
    let fila = document.getElementsByClassName(clase)[0];
    let fotoString = fila.getAttribute("data-foto");
    let foto = JSON.parse(fotoString);

    let url = `https://zimback.herokuapp.com/fotos`;    
    let param = {
        headers: {'Content-Type': 'application/json; charset = UTF-8'},     
        method: "DELETE",
        body: JSON.stringify({"id": foto["_id"]})
    };
    
    let response = await fetch(url,param);
    let result = await response.json();
    console.log(result);
    if (result.code) {
        fila.remove();
        actualizarNumero();
    }
    
}

function actualizarNumero() {
    let n = document.getElementsByTagName("tr").length;
    numero.textContent = `${n-1} NASA pictures found in the DB`;
}

function editFoto(e) {
    let clase = e.target.classList.item(0);
    let explanation = document.getElementsByClassName(clase)[1];    
    let texto = explanation.textContent;
    explanation.innerHTML = "";
    let input = document.createElement("textarea");
    input.id = "editor"; 
    input.cols = "80";
    input.rows = "10";
    input.setAttribute("data-texto",texto);     
    input.value = texto;
    explanation.appendChild(input);
    let acciones = e.target.parentElement
    acciones.innerHTML = "";
    let update = document.createElement("a");
    update.style.textDecoration = "underline";
    update.style.cursor = "pointer";
    update.textContent = "Update";
    update.classList.add(clase);
    update.addEventListener("click",updateFoto);
    let br = document.createElement("br");
    let cancel = document.createElement("a");
    cancel.style.textDecoration = "underline";
    cancel.style.cursor = "pointer";
    cancel.textContent = "Cancel";
    cancel.classList.add(clase);
    cancel.addEventListener("click",cancelar);
    acciones.appendChild(update);
    acciones.appendChild(br);
    acciones.appendChild(cancel);
    
}

function cancelar(e) {
    let clase = e.target.classList.item(0);
    let acciones = e.target.parentElement
    acciones.innerHTML = "";

    let editor = document.getElementById("editor");    
    let texto = editor.getAttribute("data-texto");
    let celda = editor.parentElement;    
    celda.innerHTML = "";
    celda.textContent = texto;       

    let edit = document.createElement("a");
    edit.style.textDecoration = "underline";
    edit.style.cursor = "pointer";
    edit.textContent = "Edit";
    edit.classList.add(clase);
    edit.addEventListener("click",editFoto);
    let br = document.createElement("br");
    let del = document.createElement("a");
    del.style.textDecoration = "underline";
    del.style.cursor = "pointer";
    del.textContent = "Delete";
    del.classList.add(clase);
    del.addEventListener("click",deleteFoto);
    acciones.appendChild(edit);
    acciones.appendChild(br);
    acciones.appendChild(del);
}

async function updateFoto(e) {
    let editor = document.getElementById("editor");
    let texto = editor.value;
    let clase = e.target.classList.item(0);
    let fila = document.getElementsByClassName(clase)[0];
    let fotoString = fila.getAttribute("data-foto");
    let foto = JSON.parse(fotoString);

    let url = `https://zimback.herokuapp.com/fotos`;    
    let param = {
        headers: {'Content-Type': 'application/json; charset = UTF-8'},     
        method: "PUT",
        body: JSON.stringify({"id": foto["_id"],"explanation":texto})
    };

    let response = await fetch(url,param);
    let result = await response.json();
    console.log(result);
    if (result.code) {
        let celda = editor.parentElement;
        celda.innerHTML = "";
        celda.textContent = texto;  
        
        let acciones = e.target.parentElement
        acciones.innerHTML = "";
        let edit = document.createElement("a");
        edit.style.textDecoration = "underline";
        edit.style.cursor = "pointer";
        edit.textContent = "Edit";
        edit.classList.add(clase);
        edit.addEventListener("click",editFoto);
        let br = document.createElement("br");
        let del = document.createElement("a");
        del.style.textDecoration = "underline";
        del.style.cursor = "pointer";
        del.textContent = "Delete";
        del.classList.add(clase);
        del.addEventListener("click",deleteFoto);
        acciones.appendChild(edit);
        acciones.appendChild(br);
        acciones.appendChild(del);
    }
    
}