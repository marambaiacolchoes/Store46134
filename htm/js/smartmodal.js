//smartmodal 2019-08-05 FSA
var fcSpy$=(function(){
  var actualPage=(location.pathname+location.search).substr(1);
  var actualTitle=document.title;
  var actualCanonical=window.top.document.querySelector("link[rel='canonical']").href;
  function openSmartModal(URLPROD){
    if(document.querySelector('.sModalContainer')!=null){document.body.removeChild(document.body.lastChild);}
    var smodalDivCont=document.createElement('div');
    smodalDivCont.id="sModalSpy";
    smodalDivCont.className="sModalArea";
    var chkURL=(URLPROD.indexOf(',')>-1),
    fullURLPROD;
    if(!chkURL){
        fullURLPROD=URLPROD + (URLPROD.indexOf("?")>-1?"&":"?") +"sty=5&int=1";
    } else {
        fullURLPROD=URLPROD.replace('prod,','prod,sty,5,int,1,');
    }
    smodalDivCont.innerHTML+="<div class='bgsModal' onclick='fcSpy$.removeLastSmartModal()'></div>"
    +"<div class='sModalContainer'>"
    +"<iframe id='idIframe' width='100%' height='100%' src='"+fullURLPROD+"' frameborder='0'></iframe>"
    +"</div>";
    document.body.appendChild(smodalDivCont);
    setTimeout(function(){ (document.querySelector('.sModalArea')).style='transform:translateX(0);'; }, 10);
    setTimeout(function(){ document.getElementsByTagName("BODY")[0].style.overflow = "hidden"; }, 300);
  }
  function removeLastSmartModal(){
    document.onkeyup=null;
    if(actualPage==''){actualPage='/';}
    (document.querySelector('.sModalArea')).style='transform:translateX(100%);';
    window.history.replaceState("object or string", "Title", actualPage);
    document.title=actualTitle;
    window.top.document.querySelector("link[rel='canonical']").href=actualCanonical;
    document.body.removeAttribute('style');
    var getNodeToRemove = document.getElementById('sModalSpy');
    setTimeout(function(){
      getNodeToRemove.parentNode.removeChild(getNodeToRemove);
    }, 300);
  }
  function swipedetect(el, callback){
    /*credit: http://www.javascriptkit.com/javatutors/touchevents2.shtml*/
    var touchsurface = el,
    swipedir,
    startX,
    distX,
    threshold = 150,
    allowedTime = 300,
    elapsedTime,
    startTime,
    handleswipe = callback || function(swipedir){}  
    touchsurface.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0]
        swipedir = 'none'
        dist = 0
        startX = touchobj.pageX
        startTime = new Date().getTime()
    }, false)  
    touchsurface.addEventListener('touchmove', function(e){
    }, false)  
    touchsurface.addEventListener('touchend', function(e){
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX 
        elapsedTime = new Date().getTime() - startTime
        if (elapsedTime <= allowedTime){
            if (Math.abs(distX) >= threshold){
                swipedir = (distX < 0)? 'left' : 'right'
            }
        }
        handleswipe(swipedir)
    }, false)
  }
  
  return{
    openSmartModal:openSmartModal,
    removeLastSmartModal:removeLastSmartModal,
    swipedetect:swipedetect
  }
})();