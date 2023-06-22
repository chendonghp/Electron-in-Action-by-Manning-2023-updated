const markdownView = document.querySelector("#markdown");
const htmlView = document.querySelector("#html");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
const saveMarkdownButton = document.querySelector("#save-markdown");
const revertButton = document.querySelector("#revert");
const saveHtmlButton = document.querySelector("#save-html");
const showFileButton = document.querySelector("#show-file");
const openInDefaultButton = document.querySelector("#open-in-default");


const renderMarkdownToHtml = async (markdown) => {
    htmlView.innerHTML = await window.api.parseMarkdown(markdown);
};

markdownView.addEventListener("keyup", (event) => {
    const currentContent = event.target.value;
    renderMarkdownToHtml(currentContent);
});

openFileButton.addEventListener("click", async () => {
    let filePath = null;
    let originalContent = '';
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
