const Chart = require('chart.js');

function createChart(dateArr, weightArr) {

    Chart.defaults.global.defaultFontColor = '#000';
    Chart.defaults.global.defaultFontFamily = '"Roboto", sans-serif';
    Chart.defaults.global.elements.line.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    Chart.defaults.global.elements.line.borderColor = 'rgba(0, 0, 0, 0.5)';
    Chart.defaults.global.elements.point.radius = 4;
    Chart.defaults.global.elements.point.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    const chartWrapper = document.querySelector('#chart');

    let timeUnit;

    if(dateArr.length < 30) {
        timeUnit = 'day';
    } else {
        timeUnit = 'month';
    }

    const userData = {
        labels: dateArr,
        datasets: [{
            label: 'График изменения веса',
            data: weightArr,
            fill: false
        }]
    };
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: 5
        },
        legend: {
            labels: {
                fontSize: 14
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    max: weightArr[0] + 5,
                    min: weightArr[0] - 5,
                    stepSize: 1
                }
            }],
            xAxes: [{
                type: 'time',
                distribution: 'linear',
                time: {
                    unit: `${timeUnit}`
                }
            }]
        }
    };
    
    const chart = new Chart(chartWrapper, {
        type: 'line',
        data: userData,
        options: chartOptions
    });
}

module.exports = createChart;


