// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer, shell } = require('electron')
const { dialog } = require('electron').remote
const fs = require('fs')
const path = require('path')
const log = require('electron-log')

const addButton = document.getElementById('add-button'),
  addLabel = document.getElementById('add-label'),
  createButton = document.getElementById('create-button'),
  moduleSection =  document.getElementById('module-section'),
  nameInput =  document.getElementById('name-input'),
  pathInfo =  document.getElementById('path-info'),
  statusInfo =  document.getElementById('status-info'),
  statusLink =  document.getElementById('status-link')


let basePath
let exportedPath

// file picker
addButton.onclick = () => {

  // reset status
  statusInfo.classList.add('invisible');
  statusLink.classList.add('invisible');

  // open dialog
  dialog.showOpenDialog({ properties: ['openDirectory']}).then(result => {

    log.debug("dialog opened")

    if (result.canceled) {
        return
    }
  
    // get basepath
    for (let file of result.filePaths) {
        basePath = file

        addLabel.innerText = basePath
        nameInput.value = path.basename(basePath)
    }

    // show module section
    addLabel.classList.remove('d-none');
    moduleSection.classList.remove('d-none');
    
    statusInfo.classList.add('invisible');
    statusLink.classList.add('invisible');

  }).catch(err => {
      log.error(err);
  });
};

// show file in folder
statusLink.onclick = (event) => {
  event.preventDefault()
  shell.showItemInFolder(exportedPath)
}

// create module
createButton.onclick = (event) => {
  event.preventDefault()

  // module name
  let name = nameInput.value

  // status
  statusInfo.classList.remove('invisible');
  statusInfo.innerHTML = 'Processing'
  statusLink.classList.add('invisible');

  // notify main process
  ipcRenderer.send('createModule', basePath, name)
};

// on success
ipcRenderer.on('success', (event, file) => {
  exportedPath = file
  let basename = path.basename(file)

  statusInfo.classList.remove('invisible');
  statusInfo.innerHTML = 'Success'
  statusLink.innerHTML = basename
  statusLink.classList.remove('invisible');
  
})

// on error
ipcRenderer.on('error', (event, message) => {
  statusInfo.classList.remove('invisible');
  statusInfo.innerHTML = '<span class="text-danger"><strong>Error</strong>: ' + message + '</span>'
  statusLink.classList.add('invisible');
})
