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
                modal.classList.add('modal_show');
            }
        });
    });
    
    //закрытие модальных окон
    
    Array.prototype.forEach.call(close, function(elem) {
        elem.addEventListener('click', function() {
            cleanForm(elem.closest('.modal'));
            overlay.classList.remove('overlay_show');
            (elem.closest('.modal')).classList.remove('modal_show');
        });
    });
    
    

    //функция очистки формы

    function cleanForm(form) {
        const forms = form.querySelectorAll('.form__input');

        Array.prototype.forEach.call(forms, function(elem) {
            elem.value = '';
        });
    }

    //функция проверки длины вводимых логина и пароля

    function checkInputs(inputs, windowMessage) {
        const regexp = /[\W_]/;
        function checkLengthLogin(elem) {
            return (((elem.name == 'login') && (elem.value.length < 2)) || ((elem.name == 'login') && (elem.value.length > 20)));
        }
        function checkLengthPassword(elem) {
            return (((elem.name == 'password') && (elem.value.length < 8)) || ((elem.name == 'login') && (elem.value.length > 20)));
        }
        function checkContent(elem) {
            return ((elem.name == 'login') || (elem.name == 'password')) && regexp.test(elem.value);
        }
        if (Array.prototype.some.call(inputs, checkLengthLogin)) {
            windowMessage.innerHTML = 'Длина логина должна быть от 2-х до 20-ти символов';
            return false;
        }
        if (Array.prototype.some.call(inputs, checkLengthPassword)) {
            windowMessage.innerHTML = 'Длина пароля должна быть от 8-ми до 20-ти символов';
            return false;
        }
        if (Array.prototype.some.call(inputs, checkContent)) {
            windowMessage.innerHTML = 'Логин и пароль должны содержать только буквы латинского алфавита и цифры';
            return false;
        }
    }

    //отправка данных из регистрационной формы на сервер

    const regForm = document.querySelector('#reg-form'),
        regMessage = document.createElement('div'),
        regClose = document.querySelector('#reg-close');
    
    regForm.appendChild(regMessage);
    regMessage.innerHTML = '';
    regMessage.style.marginTop = '10px';

    regClose.addEventListener('click', function() {
        regMessage.innerHTML = '';
    });
            
    regForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const promise = new Promise((resolve) => {

            const inputs = regForm.querySelectorAll('.form__input');

            const check = checkInputs(inputs, regMessage);
            if(check === false) return;
            
            //отправка логина на сервер для поиска совпадений

            const requestCheckLogin = new XMLHttpRequest();
            requestCheckLogin.open('POST', '/check');
            requestCheckLogin.setRequestHeader('Content-Type', 'text/plain');
            const checkValue = inputs[0].value;
            requestCheckLogin.send(checkValue);
            requestCheckLogin.onload = function() {
                console.log(requestCheckLogin.response);
                if(requestCheckLogin.response === 'true') {
                    regMessage.innerHTML = 'Такой логин уже существует';
                    return;
                }
                resolve();
            };
        });

        //отправка данных формы на сервер для сохранения в файле

        promise.then(() => {
            const request = new XMLHttpRequest();
            request.open('POST', '/reg');
            request.setRequestHeader('Content-Type', 'text/plain');
            const formData = new FormData(regForm);
            const obj = {};
            formData.forEach(function(value, key) {
                obj[key] = value;
            });
            console.log(obj);
            const json = JSON.stringify(obj);
            console.log(json);
            request.send(json);
            cleanForm(regForm);
            modalReg.classList.remove('modal_show');
            modalThanks.classList.add('modal_show');
        }).catch(error => {
            console.log(error);
            regMessage.innerHTML = 'Что-то пошло не так...';
        });
    });

    //переход в личный кабинет

    const loginForm = document.querySelector('#login-form'),
        loginMessage = document.createElement('div'),
        loginClose = document.querySelector('#login-close');
    loginForm.appendChild(loginMessage);
    loginMessage.innerHTML = '';
    loginMessage.style.marginTop = '10px';

    loginClose.addEventListener('click', function() {
        loginMessage.innerHTML = '';
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

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
                console.log(request.response);
                loginMessage.innerHTML = 'Неверный логин или пароль';
            } else if (request.response === 'error') {
                loginMessage.innerHTML = 'Что-то пошло не так...';
            } else {
                const id = request.response;
                console.log(id);
                document.cookie = `userId=${id}`;
                window.location.href = "/account";
            }
        };
    });

    

});