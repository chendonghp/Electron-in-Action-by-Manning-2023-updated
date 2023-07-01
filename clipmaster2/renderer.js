const clippingsList = document.getElementById("clippings-list");
const copyFromClipboardButton = document.getElementById("copy-from-clipboard");

const createClippingElement = (clippingText) => {
    const clippingElement = document.createElement("article");
    clippingElement.classList.add("clippings-list-item");
    clippingElement.innerHTML = `
    <div class="clipping-text" disabled="true"></div>
    <div class="clipping-controls">
        <button class="copy-clipping">&rarr; Clipboard</button>
        <button class="publish-clipping">Publish</button>
        <button class="remove-clipping">Remove</button>
    </div>
    `;
    clippingElement.querySelector(".clipping-text").innerText = clippingText;
    return clippingElement;
};

const addClippingToList = async () => {
    const clippingText = await window.api.readFromClipboard();
    const clippingElement = createClippingElement(clippingText);
    clippingsList.prepend(clippingElement);
    return clippingText
};

copyFromClipboardButton.addEventListener("click", addClippingToList);

clippingsList.addEventListener("click", (event) => {
    const hasClass = (className) => event.target.classList.contains(className);
    const clippingListItem = getButtonParent(event);
    if (hasClass("remove-clipping")) removeClipping(clippingListItem);
    if (hasClass("copy-clipping"))
        writeToClipboard(getClippingText(clippingListItem));
    if (hasClass("publish-clipping"))
        publishClipping(getClippingText(clippingListItem));
});

const removeClipping = (target) => {
    target.remove();
};

const getButtonParent = ({ target }) => {
    return target.parentNode.parentNode;
};
const getClippingText = (clippingListItem) => {
    return clippingListItem.querySelector(".clipping-text").innerText;
};

const writeToClipboard = (clippingText) => {
    window.api.writeToClipboard(clippingText);
};

const publishClipping = async (clipping) => {
    const url = await window.api.publishClip(clipping);
    window.api.writeToClipboard(url);
};

window.api.shortcutCreateClip(async (event) => {
    const clipping = await addClippingToList();
    new Notification("Clipping Added", {
        body: `${clipboard.readText()}`,
    });
});

window.api.shortcutPublishClip(async (event) => {
    const clipping = clippingsList.firstChild;
    publishClipping(getClippingText(clipping));
});

window.api.shortcutWriteClip(async (event) => {
    const clipping = clippingsList.firstChild;
    writeToClipboard(getClippingText(clipping));
});
