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
        document.dispatchEvent(new CustomEvent('adblockDetected'));
      }
      bait.remove();
    }, 100);
  }
  if(document.readyState === 'complete') detect();
  else window.addEventListener('load', detect);
})();
