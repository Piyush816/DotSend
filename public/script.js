const dragContainer = document.getElementById("dragContainer");
const fileLinkContainer = document.getElementById("fileLinkContainer");
const fileInfo = document.getElementById("fileInfo");
const toast = document.querySelector("#toast");

let file;

// when drag over container
dragContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  //   adding active class
  dragContainer.classList.add("active");
});

// when drag leave container
dragContainer.addEventListener("dragleave", (e) => {
  e.preventDefault();
  //   removing active class
  dragContainer.classList.remove("active");
});

// when file dropped in container
dragContainer.addEventListener("drop", (e) => {
  e.preventDefault();
  //   removing active class
  dragContainer.classList.remove("active");
  if (checkFileSize(e.dataTransfer.files[0])) {
    file = e.dataTransfer.files[0];
    fileInfo.textContent = file.name;
  }
});

function chooseFile() {
  document.getElementById("fileInput").click();
}

// check the file size
function checkFileSize(selectedFile) {
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  if (selectedFile.size > MAX_FILE_SIZE) {
    showToast("File size cannot be greater than 10MB", "error");
    return false;
  }
  return true;
}

fileInput.addEventListener("change", (e) => {
  e.preventDefault();

  if (checkFileSize(e.target.files[0])) {
    file = e.target.files[0];
    fileInfo.textContent = file.name;
  }
});

function uploadFile() {
  const progress = document.getElementById("progress");
  const filePassword = document.getElementById("filePassword");

  if (!file) return showToast("Please select a file", "error");

  progress.style.display = "block";

  const xhr = new XMLHttpRequest();

  // open request
  xhr.open("POST", "/upload", true);

  // setting formdata
  const formData = new FormData();
  formData.append("file", file);
  if (filePassword.value) {
    formData.append("password", filePassword.value);
  }

  // updating progressbar
  xhr.upload.addEventListener("progress", (event) => {
    if (event.lengthComputable) {
      const percentage = parseInt((event.loaded / event.total) * 100);
      progress.value = percentage;
      progressPercentage.textContent = percentage + "%";
    }
  });

  // call when uploading is done
  xhr.addEventListener("loadend", (e) => {
    progress.style.display = "none";
    fileInfo.innerHTML = `Drag a file or &nbsp;<a onclick="chooseFile()" class="has-text-link"
    >select file</a>`;
    filePassword.value = "";

    file = null;

    if (e.target.status === 201) {
      showToast("Upload Completed");

      const { fileLink } = JSON.parse(e.target.response);

      fileLinkContainer.style.display = "block";

      urlInput.value = fileLink;
    } else {
      showToast("Failed to upload file, Try again", "error");
    }
  });

  // send request
  xhr.send(formData);
}

function copyLink() {
  const urlInput = document.getElementById("urlInput");

  /* Select the text field */
  urlInput.select();
  urlInput.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  navigator.clipboard
    .writeText(urlInput.value)
    .then(() => {
      showToast("Link Copied");
    })
    .catch((err) => {
      showToast(err.message, "error");
    });
}

function showToast(msg, type) {
  if (type === "error") {
    toast.classList.add("is-danger");
  }
  toast.style.top = "10px";
  toast.textContent = msg;
  setTimeout(() => {
    toast.textContent = "";
    toast.style.top = "200px";
    toast.classList.remove("is-danger");
  }, 3000);
}
