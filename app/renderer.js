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

openFileButton.addEventListener("click", async () => {
    [file, content] = await window.api.getFileFromUser();
    filePath = file;
    originalContent = content;
    markdownView.value = content;
    renderMarkdownToHtml(content);
    window.api.updateUserInterface(filePath);
});

newFileButton.addEventListener("click", () => {
    window.api.createWindow();
});

window.api.handleContent((e, content) =>{
    markdownView.value = content;
    renderMarkdownToHtml(content);
})

saveHtmlButton.addEventListener("click", ()=>{
    window.api.saveHtml(htmlView.innerHTML)
})
