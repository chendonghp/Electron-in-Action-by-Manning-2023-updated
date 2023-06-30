window.api.showNotification((event, title, body) => {
    const myNotification = new window.Notification(title, { body }).onclick();
});
