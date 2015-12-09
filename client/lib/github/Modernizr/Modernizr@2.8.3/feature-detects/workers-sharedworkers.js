/* */ 
"format global";
"deps ../modernizr";
Modernizr.addTest('sharedworkers', function(){
  return !!window.SharedWorker;
});