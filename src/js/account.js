window.addEventListener('load', function() {
    const logoutButton = document.querySelector('#logout-button');

    logoutButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
});
