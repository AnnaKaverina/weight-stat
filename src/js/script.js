window.addEventListener('load', function() {
    
    const regButton = document.querySelector('#reg-button'),
        enterButton = document.querySelector('#enter-button'),
        overlay = document.querySelector('.overlay'),
        modalReg = document.querySelector('#registration'),
        modalThanks = document.querySelector('#thanks'),
        modalLogin = document.querySelector('#login'),
        close = document.getElementsByClassName('modal__close');
    
    let modalButtonArr = [[regButton, modalReg], [enterButton, modalLogin]];
    
    modalButtonArr.forEach((couple) => {
        const button = couple[0];
        const modal = couple[1];
        button.addEventListener('click', function() {
            if(!((overlay.classList.contains == 'overlay_show')&&(modal.style.visibility == 'visible'))) {
                overlay.classList.add('overlay_show');
                modal.style.visibility = 'visible';
            }
        });
    });
    
    Array.prototype.forEach.call(close, function(elem) {
        elem.addEventListener('click', function() {
            elem.closest('.modal').style.visibility = 'hidden';
            overlay.classList.remove('overlay_show');
        });
    });
    
    
    //отправка данных из формы на сервер

    const regForm = document.querySelector('#reg-form'),
        message = document.createElement('div');
        
    regForm.appendChild(message);

    message.innerHTML = '';

    function cleanForm(form) {
        const forms = form.querySelectorAll('.form__input');

        Array.prototype.forEach.call(forms, function(elem) {
            elem.value = '';
        });
    }
    
    regForm.addEventListener('submit', function(event) {
        
        const promise = new Promise(function(resolve, reject) {
            event.preventDefault();

            console.log('Сейчас начнется проверка формы');

            let inputs = regForm.querySelectorAll('.form__input');

            function wrongLogin(elem) {
                return (((elem.name == 'login') && (elem.value.length < 2)) || ((elem.name == 'login') && (elem.value.length > 20)));
            }

            function wrongPassword(elem) {
                return (((elem.name == 'password') && (elem.value.length < 8)) || ((elem.name == 'login') && (elem.value.length > 20)));
            }

            if (Array.prototype.some.call(inputs, wrongLogin)) {
                message.innerHTML = 'Длина логина должна быть от 2-х до 20-ти символов';
                return;
            }

            if (Array.prototype.some.call(inputs, wrongPassword)) {
                message.innerHTML = 'Длина пароля должна быть от 8-ми до 20-ти символов';
                return;
            }
            
            const requestCheckLogin = new XMLHttpRequest();
            requestCheckLogin.open('POST', '/check');
            requestCheckLogin.setRequestHeader('Content-Type', 'text/plain');
            const checkValue = inputs[0].value;
            requestCheckLogin.send(checkValue);
            requestCheckLogin.onload = function() {
                console.log(`Ответ от сервера по наличию логина получен - ${requestCheckLogin.response}`);
                if(requestCheckLogin.response === 'true') {
                    console.log('Такой логин уже существует');
                    message.innerHTML = 'Такой логин уже существует';
                    return;
                }
                resolve('Проверка прошла успешно. Данные о регистрации сейчас будут отправлены на сервер.');
            };
        });

        promise.then(message => {
            console.log(message);
            sendingForm();
        }).catch(error => {
            console.log(error);
            message.innerHTML = 'Что-то пошло не так...';
        });
    
        function sendingForm() {
            const request = new XMLHttpRequest();
            request.open('POST', '/');
            request.setRequestHeader('Content-Type', 'text/plain');
        
            const formData = new FormData(regForm);

            const obj = {};

            formData.forEach(function(value, key) {
                obj[key] = value;
            });

            const json = JSON.stringify(obj);

            request.send(json);

            cleanForm(regForm);
            modalReg.style.visibility = 'hidden';
            modalThanks.style.visibility = 'visible';
        }
    });

});