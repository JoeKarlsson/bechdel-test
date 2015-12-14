var passedBechdelDonut = c3.generate({
  bindto : '#passedBechdelDonut',
  data : {
    columns : [
        ['Passed', 5],
        ['Failed', 8]
    ],
    type : 'donut',
    onclick : function (d, i) { console.log('onclick', d, i); },
    onmouseover : function (d, i) { console.log('onmouseover', d, i); },
    onmouseout : function (d, i) { console.log('onmouseout', d, i); }
  },
  color : {
    pattern : ['#43AC6A', '#F14A52']
  }
});

//////////////////////

var charWithDialogueDonut = c3.generate({
  bindto : '#charWithDialogueDonut',
  data : {
    columns : [
        ['Female', 8.08],
        ['Male', 18.23]
    ],
    type : 'donut',
    onclick : function (d, i) { console.log('onclick', d, i); },
    onmouseover : function (d, i) { console.log('onmouseover', d, i); },
    onmouseout : function (d, i) { console.log('onmouseout', d, i); }
  },
  color : {
    pattern : ['#F4C2C2', '#0099CC']
  }
});

////////////////

var totalLinesDialogueDonut = c3.generate({
  bindto : '#totalLinesDialogueDonut',
  data : {
    columns : [
        ['Female', 226.08],
        ['Male', 466.77]
    ],
    type : 'donut',
    onclick : function (d, i) { console.log('onclick', d, i); },
    onmouseover : function (d, i) { console.log('onmouseover', d, i); },
    onmouseout : function (d, i) { console.log('onmouseout', d, i); }
  },
  color : {
    pattern : ['#F4C2C2', '#0099CC']
  }
});

//////////

var bechdelScoreBar = c3.generate({
  bindto : '#bechdelScoreBar',
  data : {
    columns : [
      ['Beschel Score', 2, 1, 3, 1, 3, 1, 3, 3, 1, 1, 1, 1, 3]
    ],
    type : 'bar'
  },
  bar : {
    width : {
      ratio : 0.5 // this makes bar width 50% of length between ticks
    }
  },
  grid : {
    y : {
      lines : [{ value : 2 }, { value : 2, class : 'Pass', text : 'Passed the Beschel Test' }]
    }
  },
  axis : {
    x :  {
      type : 'category',
      categories : ['American Sniper', 'Birdman', 'Boyhood', 'Foxcatcher', 'Gone Girl', 'Grand Budapest Hotel', 'Imitation Game', 'Into The Woods', 'Still Alice', 'Theory of Everything', 'The Judge', 'Whiplash', 'Wild']
    },
    y : {
      type : 'category',
      categories : ['1', '2', '3'],
      tick : {
        values: ['1', '2', '3'],
        count : 3
      },
      label: {
        text: 'Bechdel Score',
        position: 'outer-center'
      }
    }
  },
  color : {
    pattern : ['#4AC3BE']
  }
});