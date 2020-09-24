const regButton = document.querySelector('#reg-button'),
    enterButton = document.querySelector('#enter-button'),
    //loginButton = document.querySelector('#login-button'),
    overlay = document.querySelector('.overlay'),
    modal = document.querySelectorAll('.modal'),
    modalReg = document.querySelector('#registration'),
    modalThanks = document.querySelector('#thanks'),
    modalLogin = document.querySelector('#login'),
    close = document.getElementsByClassName('modal__close');

let modalButtonArr = [[regButton, modalReg], [enterButton, modalLogin]];

modalButtonArr.forEach((couple) => {
    const button = couple[0];
    const modal = couple[1];
    button.addEventListener('click', function() {
        if(!(overlay.classList.contains == 'overlay_show')&&!(modal.style.visibility == 'visible')) {
            overlay.classList.add('overlay_show');
            modal.style.visibility = 'visible';
        }
    });
})

Array.prototype.forEach.call(close, function(elem) {
    elem.addEventListener('click', function() {
        elem.closest('.modal').style.visibility = 'hidden';
        overlay.classList.remove('overlay_show');
    });
});



