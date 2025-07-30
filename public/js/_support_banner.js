(function(){
  function detect(){
    var bait = document.createElement('div');
    bait.className = 'adsbox';
    bait.style.position = 'absolute';
    bait.style.left = '-9999px';
    bait.style.height = '1px';
    document.body.appendChild(bait);
    setTimeout(function(){
      var blocked = !bait.offsetParent || bait.offsetHeight === 0;
      if(blocked){
        document.body.classList.add('adblock-detected');
        var event;
        try { event = new CustomEvent('adblockDetected'); }
        catch(e){
          event = document.createEvent('CustomEvent');
          event.initCustomEvent('adblockDetected', false, false, {});
        }
        document.dispatchEvent(event);
      }
      bait.remove();
    }, 100);
  }
  if(document.readyState === 'complete') detect();
  else window.addEventListener('load', detect);
})();
