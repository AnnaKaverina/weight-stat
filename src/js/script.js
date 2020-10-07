window.addEventListener('load', function() {
    
    const regButton = document.querySelector('#reg-button'),
        enterButton = document.querySelector('#enter-button'),
        overlay = document.querySelector('.overlay'),
        modalReg = document.querySelector('#registration'),
        modalThanks = document.querySelector('#thanks'),
        modalLogin = document.querySelector('#login'),
        close = document.getElementsByClassName('modal__close');
    
    //открытие модальных окон
    
    const modalButtonArr = [[regButton, modalReg], [enterButton, modalLogin]];
    
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
    
    //закрытие модальных окон
    
    Array.prototype.forEach.call(close, function(elem) {
        elem.addEventListener('click', function() {
            elem.closest('.modal').style.visibility = 'hidden';
            overlay.classList.remove('overlay_show');
        });
    });
    
    const regForm = document.querySelector('#reg-form');
        
    //функция очистки формы

    function cleanForm(form) {
        const forms = form.querySelectorAll('.form__input');

        Array.prototype.forEach.call(forms, function(elem) {
            elem.value = '';
        });
    }

    //функция проверки длины вводимых логина и пароля

    function checkLength(inputs, windowMessage) {
        function wrongLogin(elem) {
            return (((elem.name == 'login') && (elem.value.length < 2)) || ((elem.name == 'login') && (elem.value.length > 20)));
        }
        function wrongPassword(elem) {
            return (((elem.name == 'password') && (elem.value.length < 8)) || ((elem.name == 'login') && (elem.value.length > 20)));
        }
        if (Array.prototype.some.call(inputs, wrongLogin)) {
            windowMessage.innerHTML = 'Длина логина должна быть от 2-х до 20-ти символов';
            return false;
        }
        if (Array.prototype.some.call(inputs, wrongPassword)) {
            windowMessage.innerHTML = 'Длина пароля должна быть от 8-ми до 20-ти символов';
            return false;
        }
    }

    //отправка данных из регистрационной формы на сервер

    const regMessage = document.createElement('div');
    regForm.appendChild(regMessage);
    regMessage.innerHTML = '';
            
    regForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const promise = new Promise((resolve, reject) => {

            console.log('Сейчас начнется проверка формы');
            const inputs = regForm.querySelectorAll('.form__input');

            const check = checkLength(inputs, regMessage);
            if(check === false) return;
            
            //отправка логина на сервер для поиска совпадений

            const requestCheckLogin = new XMLHttpRequest();
            requestCheckLogin.open('POST', '/check');
            requestCheckLogin.setRequestHeader('Content-Type', 'text/plain');
            const checkValue = inputs[0].value;
            requestCheckLogin.send(checkValue);
            requestCheckLogin.onload = function() {
                if(requestCheckLogin.response === 'true') {
                    console.log('Такой логин уже существует');
                    regMessage.innerHTML = 'Такой логин уже существует';
                    return;
                }
                resolve('Проверка прошла успешно. Данные о регистрации сейчас будут отправлены на сервер.');
            };
        });

        //отправка данных формы на сервер для сохранения в файле

        promise.then(message => {
            console.log(message);
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
        }).catch(error => {
            console.log(error);
            regMessage.innerHTML = 'Что-то пошло не так...';
        });
    
        
    });

    //переход в личный кабинет

    const loginForm = document.querySelector('#login-form'),
        loginMessage = document.createElement('div');
    loginForm.appendChild(loginMessage);
    loginMessage.innerHTML = '';

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const inputs = loginForm.querySelectorAll('.form__input');
        const check = checkLength(inputs, regMessage);
        if(check === false) return;

        //отправка логина и пароля на сервер для поиска совпадений

        const request = new XMLHttpRequest();
        request.open('POST', '/login');
        request.setRequestHeader('Content-Type', 'text/plain');
        const formData = new FormData(loginForm);
        const obj = {};
        formData.forEach(function(value, key) {
            obj[key] = value;
        });
        const json = JSON.stringify(obj);
        request.send(json);
        request.onload = function() {
            if(request.response === 'false') {
                loginMessage.innerHTML = 'Неверный логин или пароль.';
                return;
            } else {
                const id = request.response;
                document.cookie = `userId=${id}`;
                window.location.href = "/account";
            }
        };
    });

    

});