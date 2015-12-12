var chart = c3.generate({
  bindto: '#chartOne',
  data : {
    columns : [
        ['data1', 30],
        ['data2', 120]
    ],
    type : 'donut',
    onclick : function (d, i) { console.log('onclick', d, i); },
    onmouseover : function (d, i) { console.log('onmouseover', d, i); },
    onmouseout : function (d, i) { console.log('onmouseout', d, i); }
  },
  donut : {
    title : 'Iris Petal Width'
  }
});

setTimeout(function () {
  chart.load({
    columns : [
        ['setosa', 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.4, 0.2, 0.5, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.4, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.2, 0.2, 0.3, 0.3, 0.2, 0.6, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2],
        ['versicolor', 1.4, 1.5, 1.5, 1.3, 1.5, 1.3, 1.6, 1.0, 1.3, 1.4, 1.0, 1.5, 1.0, 1.4, 1.3, 1.4, 1.5, 1.0, 1.5, 1.1, 1.8, 1.3, 1.5, 1.2, 1.3, 1.4, 1.4, 1.7, 1.5, 1.0, 1.1, 1.0, 1.2, 1.6, 1.5, 1.6, 1.5, 1.3, 1.3, 1.3, 1.2, 1.4, 1.2, 1.0, 1.3, 1.2, 1.3, 1.3, 1.1, 1.3],
        ['virginica', 2.5, 1.9, 2.1, 1.8, 2.2, 2.1, 1.7, 1.8, 1.8, 2.5, 2.0, 1.9, 2.1, 2.0, 2.4, 2.3, 1.8, 2.2, 2.3, 1.5, 2.3, 2.0, 2.0, 1.8, 2.1, 1.8, 1.8, 1.8, 2.1, 1.6, 1.9, 2.0, 2.2, 1.5, 1.4, 2.3, 2.4, 1.8, 1.8, 2.1, 2.4, 2.3, 1.9, 2.3, 2.5, 2.3, 1.9, 2.0, 2.3, 1.8]
    ]
  });
}, 1500);

setTimeout(function () {
  chart.unload({
    ids : 'data1'
  });
}, 2500);


//////////////////////


var chartTwo = c3.generate({
  bindto: '#chartTwo',
  data : {
    columns : [
        ['data1', 30],
        ['data2', 120]
    ],
    type : 'donut',
    onclick : function (d, i) { console.log('onclick', d, i); },
    onmouseover : function (d, i) { console.log('onmouseover', d, i); },
    onmouseout : function (d, i) { console.log('onmouseout', d, i); }
  },
  donut : {
    title : 'Iris Petal Width'
  }
});

////////////////


var chartThree = c3.generate({
  bindto: '#chartThree',
    data: {
        columns: [
            ['data', 91.4]
        ],
        type: 'gauge',
        onclick: function (d, i) { console.log("onclick", d, i); },
        onmouseover: function (d, i) { console.log("onmouseover", d, i); },
        onmouseout: function (d, i) { console.log("onmouseout", d, i); }
    },
    gauge: {
//        label: {
//            format: function(value, ratio) {
//                return value;
//            },
//            show: false // to turn off the min/max labels.
//        },
//    min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
//    max: 100, // 100 is default
//    units: ' %',
//    width: 39 // for adjusting arc thickness
    },
    color: {
        pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
        threshold: {
//            unit: 'value', // percentage is default
//            max: 200, // 100 is default
            values: [30, 60, 90, 100]
        }
    },
    size: {
        height: 180
    }
});

setTimeout(function () {
    chartThree.load({
        columns: [['data', 10]]
    });
}, 1000);

setTimeout(function () {
    chartThree.load({
        columns: [['data', 50]]
    });
}, 2000);


setTimeout(function () {
    chartThree.load({
        columns: [['data', 0]]
    });
}, 4000);

setTimeout(function () {
    chartThree.load({
        columns: [['data', 70]]
    });
}, 3000);

//////////

var chartFour = c3.generate({
  bindto: '#chartFour',
    data: {
        columns: [
            ['data5', 30, 200, 100, 400, 150, 250],
            ['data6', 130, 100, 140, 200, 150, 50]
        ],
        type: 'bar'
    },
    bar: {
        width: {
            ratio: 0.5 // this makes bar width 50% of length between ticks
        }
        // or
        //width: 100 // this makes bar width 100px
    }
});
