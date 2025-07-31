(function(){
  function detect(){
    var bait = document.createElement('div');
    bait.className = 'adsbox ad-banner adsbygoogle ad-unit advert ad-wrapper';
    bait.style.position = 'absolute';
    bait.style.left = '-9999px';
    bait.style.width = '1px';
    bait.style.height = '1px';
    document.body.appendChild(bait);
    setTimeout(function(){
      var style = window.getComputedStyle(bait);
      var blocked = !bait.offsetParent ||
                    bait.offsetHeight === 0 ||
                    style.display === 'none' ||
                    style.visibility === 'hidden';
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
    }, 200); // Increased timeout for better reliability
  }
  if(document.readyState === 'complete') detect();
  else window.addEventListener('load', detect);
})();
