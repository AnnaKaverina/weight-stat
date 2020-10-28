const createChart = require('./chart.js');

window.addEventListener('load', function() {
    const logoutButton = document.querySelector('#logout-button'),
        userNameValue = document.querySelector('#user-name'),
        userHeightValue = document.querySelector('#user-height'),
        userWeightValue = document.querySelector('#user-weight'),
        bodyMassIndexValue = document.querySelector('#body-mass-index'),
        startForm = document.querySelector('#start-form'),
        updateForm = document.querySelector('#update-form'),
        startWindow = document.querySelector('.stat__start'),
        wrapperWindow = document.querySelector('.stat__window'),
        updateWindow = document.querySelector('.stat__update'),
        chartWrapper = document.querySelector('.chart-wrapper');

    //получение cookie

    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    //удаление cookie

    function deleteCookie(name) {
        document.cookie = `userId=${name}; max-age=0`;
    }

    //функция очистки формы

    function cleanForm(form) {
        const forms = form.querySelectorAll('.form__input');

        Array.prototype.forEach.call(forms, function(elem) {
            elem.value = '';
        });
    }

    //функция получения сегодняшней даты

    function getNewDate() {
        const date = new Date();
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    }

    //функция запроса информации о пользователе по id

    function getUserData() {
        const message = document.createElement('div');
        message.classList.add('stat_center');
        wrapperWindow.appendChild(message);

        if(!id) {
            message.innerHTML = 'Для отображения данных зайдите в личный кабинет, используя ваши логин и пароль';
            return;
        }

        const request = new XMLHttpRequest();
        request.open('POST', '/account');
        request.send(id);
        request.onload = function() {
            const user = JSON.parse(request.response);
            userNameValue.innerHTML = user.login;

            if(!user.height) {
                startWindow.classList.add('stat_show');  
            } else if(user.date != getNewDate()){
                updateWindow.classList.add('stat_show');
            } else {
                
                if(user.weightDifference != 0) {
                    let day;
                    const dateString = (String(user.dateDifference));
                    const lastNumber = dateString[dateString.length-1];

                    switch(lastNumber) {
                        case '1': {
                            day = 'день';
                            break;
                        }
                        case '2'||'3'||'4': {
                            day = 'дня';
                            break;
                        }
                        default: {
                            day = 'дней';
                            break;
                        }
                    }
                    message.innerHTML = `Ваш прогресс: ${user.weightDifference} кг за ${user.dateDifference} ${day}.`;
                } else {
                    message.innerHTML = 'Сегодня вы уже обновляли свой вес.';
                }
            }

            if(user.height) {
                userHeightValue.innerHTML = user.height;
            }

            if(user.weight) {
                userWeightValue.innerHTML = user.weight;
            }

            if(user.height && user.weight) {
                bodyMassIndexValue.innerHTML = Math.round(user.weight/Math.pow((user.height/100), 2));
            }
        };
    }

    //функция запроса данных для графика

    function getChartArrs() {

        const chartMessage = document.createElement('div');
        chartMessage.classList.add('stat_center');
        chartWrapper.appendChild(chartMessage);

        if(!id) {
            chartMessage.innerHTML = 'Здесь будет график изменения вашего веса';
            return;
        }
        
        const request = new XMLHttpRequest();
        request.open('POST', '/chart');
        request.send(id);
        
        request.onload = function() {
            const arr = JSON.parse(request.response);
            if(arr == false) {
                chartMessage.innerHTML = 'Здесь будет график изменения вашего веса';
            } else {
                chartWrapper.removeChild(chartMessage);
                createChart(arr[0], arr[1]);
            }
        };
    }

    const id = getCookie('userId');

    getUserData();
    getChartArrs();

    //кнопка выхода из личного кабинета

    logoutButton.addEventListener('click', function() {
        deleteCookie('userId');
        window.location.href = '/';
    });

    //отправка на сервер данных со стартовой формы

    const startMessage = document.createElement('div');
    startForm.appendChild(startMessage);

    startForm.addEventListener('submit', function(e) {
        e.preventDefault();

        startMessage.innerHTML = '';
        const heightValue = startForm.querySelector('#height-value'),
            weightValue = startForm.querySelector('#weight-value');

        if(typeof(parseFloat(heightValue.value)) != 'number' || heightValue.value < 100 || heightValue.value > 250){
            startMessage.innerHTML = 'Значение роста введено некорректно.';
            return;
        }
        if(typeof(parseFloat(weightValue.value)) != 'number' || weightValue.value < 30 || weightValue.value > 200){
            startMessage.innerHTML = 'Значение веса введено некорректно.';
            return;
        }

        const request = new XMLHttpRequest();
        request.open('POST', '/start');
        request.setRequestHeader('Content-Type', 'text/plain');
        const formData = new FormData(startForm);
        const obj = {};
        formData.forEach(function(value, key) {
            obj[key] = parseFloat(value.replace(',', '.')).toFixed(1);
        });

        obj.id = id;

        const json = JSON.stringify(obj);
        request.send(json);
        cleanForm(startForm);
        startWindow.classList.remove('stat_show');
        
        getUserData();
        getChartArrs();

    });

    //отправка на сервер данных с ежедневной формы

    const updateMessage = document.createElement('div');
    updateForm.appendChild(updateMessage);

    updateForm.addEventListener('submit', function(e) {
        e.preventDefault();

        updateMessage.innerHTML = '';
        const weightValue = updateForm.querySelector('#weight-value-update');

        if(typeof(parseFloat(weightValue.value)) != 'number' || weightValue.value < 30 || weightValue.value > 200){
            message.innerHTML = 'Значение веса введено некорректно.';
            return;
        }

        const request = new XMLHttpRequest();
        request.open('POST', '/update');
        request.setRequestHeader('Content-Type', 'text/plain');
        const formData = new FormData(updateForm);
        const obj = {};
        formData.forEach(function(value, key) {
            obj[key] = parseFloat(value.replace(',', '.')).toFixed(1);
        });

        obj.id = id;

        const json = JSON.stringify(obj);
        request.send(json);
        cleanForm(updateForm);
        updateWindow.classList.remove('stat_show');
        
        getUserData();
        getChartArrs();

    });


});