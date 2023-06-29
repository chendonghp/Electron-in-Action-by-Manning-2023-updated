const markdownView = document.querySelector("#markdown");
const htmlView = document.querySelector("#html");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
const saveMarkdownButton = document.querySelector("#save-markdown");
const revertButton = document.querySelector("#revert");
const saveHtmlButton = document.querySelector("#save-html");
const showFileButton = document.querySelector("#show-file");
const openInDefaultButton = document.querySelector("#open-in-default");

let filePath = null;
let originalContent = '';

const renderMarkdownToHtml = async (markdown) => {
    htmlView.innerHTML = await window.api.parseMarkdown(markdown);
};

markdownView.addEventListener("keyup", (event) => {
    const currentContent = event.target.value;
    renderMarkdownToHtml(currentContent);
    isEdited = (currentContent !== originalContent)
    window.api.updateUserInterface(filePath, isEdited);
    saveMarkdownButton.disabled = !isEdited;
    revertButton.disabled = !isEdited;
});

const openFile = async() => {
    [file, content] = await window.api.getFileFromUser();
    filePath = file;
    originalContent = content;
    renderFile(file, content)
    window.api.updateUserInterface(filePath, false);
}

openFileButton.addEventListener("click", openFile);

window.api.openFileFromMenu(async (event) => await openFile())

window.api.getFilename((event)=>{
    event.sender.send('filename', filePath)
})

newFileButton.addEventListener("click", () => {
    window.api.createWindow();
});

window.api.handleContent((e, content) => {
    renderFile(filePath, content)
})

saveHtmlButton.addEventListener("click", () => {
    window.api.saveHtml(htmlView.innerHTML)
})

saveMarkdownButton.addEventListener('click', () => {
    window.api.saveMarkdown(filePath, markdownView.value);
});

revertButton.addEventListener('click', () => {
    renderFile(filePath, originalContent)
});


const supportedDropFile = (file) => {
    return file.type ?
        ['text/plain', 'text/markdown'].includes(file.type) :
        /\.(md|markdown|txt)$/i.test(file.path);
};

document.addEventListener('dragenter', event => { event.preventDefault(); event.stopPropagation() });
document.addEventListener('dragover', event => { event.preventDefault(); event.stopPropagation() });
document.addEventListener('dragleave', event => { event.preventDefault(); event.stopPropagation() });
document.addEventListener('drop', event => { event.preventDefault(); event.stopPropagation() });


markdownView.addEventListener('dragover',
    (event) => {
        // https://github.com/electron/electron/issues/9840 can't get file info before file droped
        // const file = event.dataTransfer.files[0];
        // try {
        //     if (supportedDragoverItem(file)) {
        //         markdownView.classList.add('drag-over');
        //     } else {
        //         markdownView.classList.add('drag-error');
        //     }
        // } catch (error) { console.log(error) }
    });

markdownView.addEventListener('dragleave', () => {
    markdownView.classList.remove('drag-over');
    markdownView.classList.remove('drag-error');
});

markdownView.addEventListener('drop', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (supportedDropFile(file)) {
        const content = await window.api.openFile(file.path)
        renderFile(file, content)
    } else {
        alert('That file type is not supported');
    }
    markdownView.classList.remove('drag-over');
    markdownView.classList.remove('drag-error');
});

const isDifferentContent = (content) => content !== markdownView.value;

const renderFile = (file, content) => {
    isEdited = false
    filePath = file;
    originalContent = content;

    markdownView.value = content;
    renderMarkdownToHtml(content);

    saveMarkdownButton.disabled = !isEdited;
    revertButton.disabled = !isEdited;

    showFileButton.disabled = false;
    openInDefaultButton.disabled = false;
    window.api.updateUserInterface(filePath, isEdited);
};

window.api.checkContent((event, content) => {
    event.sender.send("is-content-different", isDifferentContent(content))
})
window.api.changeContent((event, file, content) => {
    renderFile(file, content);
})

window.api.saveHtmlMenu(()=>{
    window.api.saveHtml(htmlView.innerHTML)
})

window.api.saveMarkdownMenu(() => {
    window.api.saveMarkdown(filePath,markdownView.value)
})

markdownView.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    window.api.MarkdownContextMenu(filePath)
})

const showFile = () => {
    if (!filePath) {
        return alert('This file has not been saved to the filesystem.');
    }
    window.api.showItemInFolder(filePath);
};
const openInDefaultApplication = () => {
    if (!filePath) {
        return alert('This file has not been saved to the filesystem.');
    }
    window.api.openPath(filePath);
};

showFileButton.addEventListener('click', showFile);
openInDefaultButton.addEventListener('click', openInDefaultApplication);

window.api.showItemInFolderMenu((event) => {
    showFile()
})

window.api.openPathMenu((event) => {
    openInDefaultApplication()
})