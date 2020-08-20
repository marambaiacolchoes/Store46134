// Template Fastcommerce [06/2018][1]

var iNextPageButFC=1;
var bBuyWishlist=false;
var iDescontoAvista=0;

//Informe abaixo os juros para parcelamento em 1x, 2x, 3x, etc.
var Juros=new Array();
Juros[0]=0; //1x (à vista)
Juros[1]=0; //2x
Juros[2]=0; //3x
Juros[3]=0; //4x
Juros[4]=0; //5x
Juros[5]=0; //6x
Juros[6]=0; //7x
Juros[7]=0; //8x
Juros[8]=0; //9x
Juros[9]=0; //10x

var sF$=(function(){

  var sCurrentPage=document.location.href.toUpperCase();

  function fnGetID(id){
    return document.getElementById(id);
  }

  //Função que faz pré-load das imagens
  function fnPreloadImages() { //v3.0
    var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=fnPreloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
  }
 
  function fnFormatNumber(num){
    num=num.toString().replace(/\$|\,/g,'');
    if(isNaN(num))num="0";
    sign=(num==(num=Math.abs(num)));
    num=Math.floor(num*100+0.50000000001);
    num=Math.floor(num/100).toString();
    for(var i=0;i<Math.floor((num.length-(1+i))/3);i++)num=num.substring(0,num.length-(4*i+3))+'.'+num.substring(num.length-(4*i+3));
    return ((sign)?'':'-')+num;
  }
  
  function fnLogout(){
    if(FC$.ClientID!=0){
      var oLinkLogin=fnGetID("idLinkLoginFC");
      if(oLinkLogin){
        oLinkLogin.innerHTML="Logout";
        oLinkLogin.href=FCLib$.uk("url-register")+"?logoff=true";
      }
    }
  }

  var iPL=0;
  
  function fnShowProd(Price,OriginalPrice,Cod,iMaxParcels,ProductID){
    //função que mostra o preço do produto, parcelamento, desconto à vista e badge (home e lista)
    iPL++;
    var idPrice=fnGetID("idProdPrice"+ProductID);
    var sPrice="";
    if(Price==0 && OriginalPrice==0){
      if(idPrice)idPrice.innerHTML="<div class=\"prices\"><br><div class=price><div class=currency><a href='"+ FCLib$.uk("url-contact") +"?assunto=Consulta%20sobre%20produto%20(Código%20"+Cod+")' target='_top' >Consulte-nos</a></div></div></div>";
      return void(0);
    }
    var iPrice=Price.toString().split(".");
    if(iPrice.length==2){
      var iPriceInt=iPrice[0];
      var PriceDecimal=iPrice[1];
      if(PriceDecimal.length==1)PriceDecimal+="0";
    }
    else{
      var iPriceInt=iPrice;
      var PriceDecimal="00";
    }    
    //parcelamento
    var sInterest;
    if(typeof Juros!="undefined"){
      if(iMaxParcels==0||iMaxParcels>Juros.length)iMaxParcels=Juros.length;
      if(Juros[iMaxParcels-1]>0)sInterest=""; else sInterest=" sem juros";
    }
    else{
      iMaxParcels=0;
    }
    if(Price!=OriginalPrice){
      sPrice+="<div class=\"prices\">";
      sPrice+="  <div class=\"old-price\">De&nbsp; <span>"+FormatPrice(OriginalPrice,FC$.Currency)+"</span><div class=\"por\">Por</div></div>";
      sPrice+="  <div class=\"price\"><span class=\"currency\"><strong>"+FC$.Currency+" </span><span class=\"int\">"+ fnFormatNumber(iPriceInt) +"</span><span class=\"dec\">,"+ PriceDecimal +"</span></strong></div>";
      if(iMaxParcels>1)sPrice+="  <div class=\"installments\"><strong><span class=\"installment-count\">"+ iMaxParcels +"</span>x</strong> de <strong><span class=\"installment-price\">"+FormatPrice(CalculaParcelaJurosCompostos(Price,iMaxParcels),FC$.Currency)+"</span></strong>"+ sInterest +"</div>";
      sPrice+="</div>";
    }
    else{
      sPrice+="<div class=\"prices\">";
      sPrice+="  <div class=\"old-price\"><span>&nbsp;</span><div class=\"por\">Por</div></div>";
      sPrice+="  <div class=\"price\"><span class=\"currency\"><strong>"+FC$.Currency+" </span><span class=\"int\">"+ fnFormatNumber(iPriceInt) +"</span><span class=\"dec\">,"+ PriceDecimal +"</span></strong></div>";
      if(iMaxParcels>1)sPrice+="  <div class=\"installments\"><strong><span class=\"installment-count\">"+ iMaxParcels +"</span>x</strong> de <strong><span class=\"installment-price\">"+FormatPrice(CalculaParcelaJurosCompostos(Price,iMaxParcels),FC$.Currency)+"</span></strong>"+ sInterest +"</div>";
      sPrice+="</div>";
    }
    if(idPrice)idPrice.innerHTML=sPrice;
    //desconto
    if(Price>0 && iDescontoAvista>0){
      var oProdDesc=document.getElementById("ProdDesc"+ProductID);
      if(oProdDesc)oProdDesc.innerHTML="à vista <b>"+FormatPrice(Price*((100-iDescontoAvista)/100),FC$.Currency)+"</b>";
    }   
    //badge
    var oBadge=document.getElementById("DivProd"+ProductID);
    if(oBadge){
      var sBadges="";
      if(oBadge.hasAttribute("data-sale") && OriginalPrice>Price)sBadges+="<div id='badgeProm"+ProductID+"' class='fc-badge-product-sale' title='Oferta'>-" + fnGetSale() + "%</div>";
      //if(oBadge.hasAttribute("data-release"))sBadges+="<div class='fc-badge-product-release' title='Lançamento'>&#10033;</div>";
      //if(oBadge.hasAttribute("data-highlight"))sBadges+="<div class='fc-badge-product-highlight' title='Destaque'>&#9755;</div>";
      if(sBadges!="")oBadge.innerHTML+="<div class='fc-badge-product-principal'>"+ sBadges+"</div>";
    }
    function fnGetSale(){return parseInt((OriginalPrice-Price)/OriginalPrice*100);}
  }

  function fnShowButtonCart(Estoque, IDProd){
    var idButton=document.querySelector('#idButtonProd'+IDProd+' img');
    var idAviso=document.querySelector('#idAvisoProd'+IDProd+'');
    var avisoDisp='<span class="mntext"><a href="#na" onclick="sF$.fnShowDisp('+IDProd+');" title="Clique aqui para ser avisado da disponibilidade deste produto">Avise-me</a> quando estiver disponível.</span>';
    if (idButton){
      if(Estoque==0){
        idButton.setAttribute('src',''+FC$.PathImg+'botcarrinhoesgotado.svg?cccfc=1');
        idAviso.innerHTML=avisoDisp;
      }else{
        idButton.setAttribute('src',''+FC$.PathImg+'botcarrinho.svg?cccfc=1');
      }
    } 
  }

  function fnShowDisp(IDProd){
    popup=window.open(FCLib$.uk("url-product-availability")+"?"+ (FCLib$.fnUseEHC()?"productid":"idproduto") +"="+ IDProd,"Disp","top=10,left=10,height=480,width=450,scrollbars=yes");
    popup.focus();
    return void(0);
  }

  function fnSearchSubmit(oForm){
    var oSearch=(FCLib$.fnUseEHC()?oForm.text:oForm.texto);
    if(oSearch){
      var sSearch=oSearch.value;
      if(sSearch.length<2){
        alert("Preencha a busca corretamente");
        oSearch.focus();
       }
       else{
        document.TopSearchForm.submit()
       }
    }
  }
  
  function fnSearchToolbarSubmit(oForm){
    var oSearch=(FCLib$.fnUseEHC()?oForm.text:oForm.texto);
    if(oSearch){
      var sSearch=oSearch.value;
      if(sSearch.length<2){
        alert("Preencha a busca corretamente");
        oSearch.focus();
       }
       else{
        document.TopSearchToolbarForm.submit()
       }
    }
  }

  function fnCustomizeIconsSocialNetworks(isProd){
  //se isProd personaliza ícones do detalhe do produto, caso contrário do rodapé
    if(isProd)var oContentHTML=document.getElementById("idShareProd");
    else var oContentHTML=document.getElementById("idShareFooter");
    if(oContentHTML)var aImgsShare=oContentHTML.getElementsByTagName('img');
    if(aImgsShare)
      for(var i=0;i<aImgsShare.length;i++){
        if(aImgsShare[i].className=='EstImgShareFacebook'){
          aImgsShare[i].setAttribute('data-src',FC$.PathImg +'iconprodfacebook.svg?cccfc=1');
          aImgsShare[i].src=FC$.PathImg +'iconprodfacebook.svg?cccfc=1';
        }
        else if(aImgsShare[i].className=='EstImgShareTwitter'){
          aImgsShare[i].setAttribute('data-src',FC$.PathImg +'iconprodtwitter.svg?cccfc=1');
          aImgsShare[i].src=FC$.PathImg+ 'iconprodtwitter.svg?cccfc=1';
        }
        else if(aImgsShare[i].className=='EstImgSharePinterest'){
          aImgsShare[i].setAttribute('data-src',FC$.PathImg +'iconprodpinterest.svg?cccfc=1');
          aImgsShare[i].src=FC$.PathImg+ 'iconprodpinterest.svg?cccfc=1';
        }
        if(isProd){ //produto
          aImgsShare[i].style.width="25px";
          aImgsShare[i].style.height="25px";
        }
        else{ //rodapé
          aImgsShare[i].style.width="20px";
          aImgsShare[i].style.height="20px";
        }
    }
  }
 
  function fnShowCart(bShow,ItensCesta){
   oTabItensCart=document.getElementById('TabItensCart');
   if(bShow){
      oTabItensCart.className="EstTabItensCartOn";
      document.getElementById('DivItensCart').style.display="";
    }
   else{
      oTabItensCart.className="EstTabItensCart";
      document.getElementById('DivItensCart').style.display="none";
    }
  }
  
  function fnGoCart(){
    document.location.href=FCLib$.uk("url-add-product");
  }

  function fnUpdateCart(IsAdd,IsSpy){FCLib$.fnAjaxExecFC(FCLib$.uk("url-xml-cart"),"",false,fnCallbackUpdateCart,IsAdd,IsSpy);}

  function fnCallbackUpdateCart(oHTTP,IsAdd,IsSpy){
    if(oHTTP.responseXML){
      oXML=oHTTP.responseXML;
      var oCarts=oXML.getElementsByTagName("cart");
      try{currencyProdCart=(oCarts[0].getElementsByTagName("currency")[0].childNodes[0].nodeValue);}catch(e){currencyProdCart=FC$.Currency}
      try{TotalQtyProdCart=(oCarts[0].getElementsByTagName("TotalQty")[0].childNodes[0].nodeValue);}catch(e){TotalQtyProdCart="0"}
      try{subtotalProdCart=(oCarts[0].getElementsByTagName("subtotal")[0].childNodes[0].nodeValue);}catch(e){subtotalProdCart="0,00"}
      iItensCesta=TotalQtyProdCart;
      if(IsSpy){
        var oReferrer=window.parent;
        try{oReferrer.document.getElementById("idCartItemsTop").innerHTML=iItensCesta;}catch(e){}
        try{oReferrer.document.getElementById("idCartItemsToolTop").innerHTML=iItensCesta;}catch(e){}
        try{oReferrer.document.getElementById("idCartTotalTop").innerHTML=FCLib$.FormatPreco(currencyProdCart +" "+ subtotalProdCart);}catch(e){}
        try{oReferrer.document.getElementById("idCartTotalToolTop").innerHTML=FCLib$.FormatPreco(currencyProdCart +" "+ subtotalProdCart);}catch(e){}
      }
      else {
        try{document.getElementById("idCartItemsTop").innerHTML=iItensCesta;}catch(e){}
        try{document.getElementById("idCartItemsToolTop").innerHTML=iItensCesta;}catch(e){}
        try{document.getElementById("idCartTotalTop").innerHTML=FCLib$.FormatPreco(currencyProdCart +" "+ subtotalProdCart);}catch(e){}
        try{document.getElementById("idCartTotalToolTop").innerHTML=FCLib$.FormatPreco(currencyProdCart +" "+ subtotalProdCart);}catch(e){}
      }
    }
  }

  //Histórico de navegação
  function fnLoadXMLPageHistory(){FCLib$.fnAjaxExecFC(FCLib$.uk("url-xml-page-history"),"",false,fnCallbackLoadXMLPageHistory);}

  function fnCallbackLoadXMLPageHistory(oHTTP){
    if(oHTTP.responseXML){
      var oXML=oHTTP.responseXML;
      var aItens=oXML.getElementsByTagName("item")
      if(aItens)sF$.fnShowPageHistory(aItens);
    }
  }
  
  function fnShowPageHistory(oHistoryPages){
    var oPageHistory=document.getElementById("idPageHistory");
    if(oPageHistory){
      var sPageHistory="";
      try{var sBar=(oHistoryPages[0].getElementsByTagName("title")[0].childNodes[0].nodeValue);}
      catch(e){var sBar="";}
      if(sBar!=""){sPageHistory+="<div class='FooterSepFC col-xlarge-12'><img data-src='"+ FC$.PathImg +"footersep.png?cccfc=1'></div><div id='idDivPageHistory'><div id='idPageHistoryFC'><div id='idTitPageHistory'>Páginas Visitadas:</div><ul id='idListPageHistoryFC'>";}  
      for (i=0;i<oHistoryPages.length;i++){
        sTitleProd=oHistoryPages[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
        sLinkProd=oHistoryPages[i].getElementsByTagName("link")[0].childNodes[0].nodeValue;
        try{sImageProd=oHistoryPages[i].getElementsByTagName("image")[0].childNodes[0].nodeValue;}
        catch(e){sImageProd=FC$.PathImg+"nd0.gif";}
        try{sPriceProd=(oHistoryPages[i].getElementsByTagName("price")[0].childNodes[0].nodeValue);}
        catch(e){sPriceProd="";}
        sTitleProd=sTitleProd.substring(0,20);
        sPageHistory+="<li>";
        sPageHistory+="<div class='EstImagePageHistory'><a href='"+ sLinkProd +"'><img data-src='"+ sImageProd +"'  title='"+ sTitleProd +"' border=0 class=EstFotoPageHistory onError=MostraImgOnError(this,0)></a></div>";
        sPageHistory+="<div class='EstNamePageHistory'><a href='"+ sLinkProd +"'>"+ sTitleProd +"</a></div>";
        sPageHistory+="<div class=EstPricePageHistory>"+ sPriceProd +"</div>";
        sPageHistory+="</li>";
      }
      oPageHistory.innerHTML=sPageHistory+"</ul></div></div>";
    }
  }

  function fnInsertVideo(ProductID,CodVideo){
    var oVideo=document.getElementById("VideoProd"+ProductID);
    if(oVideo){
      oVideo.innerHTML="<iframe class=\"VideoProd\" src=\"//www.youtube.com/embed/"+ CodVideo +"?controls=1&showinfo=0&rel=0&modestbranding=1&theme=light&modestbranding=1\" frameborder=0 allowfullscreen></iframe>"
    }
  }
  
  function fnAdjustsFilters(){ 
    var bTemPathQts=false;
    var oUlPathCatQt=document.getElementById("idUlPathCatQtFC");
    if(oUlPathCatQt){bTemPathQts=true;}else{document.getElementById('idListaProdCategoriasFC').style.display='none';}
    var oUlAdic1Qt=document.getElementById("idUlAdic1QtFC");
    if(oUlAdic1Qt){bTemPathQts=true;}else{document.getElementById('idListaProdAdicional1FC').style.display='none';}
    var oUlAdic2Qt=document.getElementById("idUlAdic2QtFC");
    if(oUlAdic2Qt){bTemPathQts=true;}else{document.getElementById('idListaProdAdicional2FC').style.display='none';}
    var oUlAdic3Qt=document.getElementById("idUlAdic3QtFC");
    if(oUlAdic3Qt){bTemPathQts=true;}else{document.getElementById('idListaProdAdicional3FC').style.display='none';}
    //Caso não tenha produtos em categorias/adicionais encontrados, remove div
    if(!bTemPathQts)document.getElementById("idDivPath").style.display='none';
    //Caso não tenha filtros de busca, remove div com filtros
    var oUlPathSearch=document.getElementById("idUlPathSearchFC");
    if(oUlPathSearch==null)document.getElementById("idDivSearch").style.display='none';
  }

  function fnLoginUserName(NameUser,PicUser){
    var oImgGlobalSign=document.getElementById("idImgGlobalSignFC");
    if(NameUser==""){
      jQuery('.loginInfo').html("<span class='col-small-6'>Olá, <b>visitante</b></span> <span class='hide-small'>|</span> <span class='col-small-6'>Faça seu <a href='"+ FCLib$.uk("url-register") +"?pp=3&passo=1&sit=1'><b>Login</b></a></span>");
      if(oImgGlobalSign){oImgGlobalSign.style.display="";}
    }
    else{
      NameUser=fnFirstName(NameUser);
      jQuery('.loginInfo').html("<span class='col-small-12 HeaderSocialLoginUserName'>Olá, <b>"+NameUser+"</b>,</span> <span class='col-small-12 HeaderSocialLoginUserName'><a href='#Logout' onclick=FCLib$.fnClientLogout('',sF$.fnCliLogout)><span class='HeaderSocialLoginLogout'>&nbsp;(sair)</span></a></span>");
      if(oImgGlobalSign){oImgGlobalSign.style.display="none";}
    }
    var oFoto=document.getElementById("UserImage");
    if(oFoto){
      if(PicUser==undefined || PicUser==""){oFoto.src=FC$.PathImg+"iconuser.svg";}
      else{oFoto.src=PicUser;}   
    } 
  }
 
  function fnFirstName(NameUser){
    var iPos=NameUser.search(" ");
    if(iPos>0) return NameUser.charAt(0).toUpperCase() + NameUser.substring(0,iPos).slice(1).toLowerCase();
    else return NameUser.charAt(0).toUpperCase() + NameUser.slice(1).toLowerCase();
  }

  function fnCliLogout(obj,sPag){
    sF$.fnLoginUserName("","");
    FC$.ClientID==0;
    fnShowGlobalSignin();
  }
   
  function fnMostraDescontoProdDet(PrecoProd){
    if(PrecoProd==0 || iDescontoAvista==0)return;
    document.getElementById("idPriceAVista").innerHTML="<div id='PriceAVista'><p>Para pagamentos à vista ganhe <b>"+ iDescontoAvista +"% de desconto</b>.</p><p>Valor com desconto <b>"+FormatPrice(PrecoProd*((100-iDescontoAvista)/100),FC$.Currency)+"</b></p></div>";
  }

  function fnCreateEventGA(sCategory,sAction,sLabel){
    if(typeof ga!=='undefined'){
      ga('send','event',sCategory,sAction,sLabel);
    }
  }
  
    //Show and Hide Banner Home
  function fnHideShowBannersHome(){
    var FCHideHomeBanners = document.getElementById('FC-HideHomeBanners');
    var FCShowHomeBanners = document.getElementById('FC-ShowHomeBanners');
    FCShowHomeBanners.innerHTML = FCHideHomeBanners.innerHTML;
  }
  
    //Aviso de disponibilidade
  function fnLinkDisp(Estoque,IDProduto){
    if(Estoque==0){
      document.write("<a href='javascript:MostraDisp("+ FC$.IDLoja +","+ IDProduto +")' title='Clique aqui para ser avisado quando este produto estiver disponível'>Avise-me quando estiver disponível</a>");
    }
  }

  // Video Filter
  function fnShowVideo(IDProduto,oProdFilters,sImagemProdPri,sNomeProd){
    var sVideo="";
    if(oProdFilters.length>0){
      var iFiltroVideo=oProdFilters[0].pFilNames["video"];
      if(iFiltroVideo!=undefined)sVideo=oProdFilters[0].pFil[iFiltroVideo].value;
    }
    fnVideoImage(IDProduto,sVideo,sImagemProdPri,sNomeProd);
  }
  
  // Video and Image Product
  function fnVideoImage(IDProduto,videoProduct,ImagemProdPri,NomeProd){
    var replaceNomeProd = NomeProd.replace(/-/g,' ');  
    if (videoProduct==""){
      document.getElementById("id-video-image"+IDProduto).innerHTML="<div class='ImgCapaListProd DivListproductStyleImagemZoom'><img data-src="+ ImagemProdPri +" alt=\""+ replaceNomeProd +"\" onerror='MostraImgOnError(this,0)'></div>";
    }else{
     document.getElementById("id-video-image"+IDProduto).innerHTML="<video id=prodVideo"+ IDProduto +" class='videoProd' preload=auto loop src='https://my.mixtape.moe/"+ videoProduct +".mp4'></video>";
     function execVideoEvents(){
      var oVideo=document.getElementById("prodVideo"+IDProduto);
      if(FCLib$.isOnScreen(oVideo))oVideo.play();
     }
     execVideoEvents();
     FCLib$.AddEvent(document,"scroll",execVideoEvents);
    }
  }
  
  /* Home Slideshow */
  function fnSlideshowSwiper(){
    var swiper = new Swiper('.swiper-container', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      autoplay: {
       delay: 5000,
      },
    });
  }
  
  //Voice Search
  function fnStartDictation(){
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
      var recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "pt-BR";
      recognition.start();
      recognition.onresult = function(e) {
        document.getElementById('autocomplete').value = e.results[0][0].transcript;
        recognition.stop();
        document.getElementById('autocomplete-form').submit();
      };
      recognition.onerror = function(e) {
        recognition.stop();
      }
    }
  }
  
  // Mouseover change image Home and List
  function fnChangeImages(sImagemProdPri,sImagemProdDet,sDescUrl,sIdProduto,sNomeProd){
    var replaceNomeProd=sNomeProd.replace(/-/g,' ');
    var tagImgPri=sImagemProdPri;
    var sIdCampo="DivImagemProdDouble"+ sIdProduto;
    if (tagImgPri==""){
      document.getElementById(sIdCampo).innerHTML="<img height='200px' src='/images/nd0.gif'>";
    }
    else {
      var tagImgDet=sImagemProdDet;
      var sLenghtImg=tagImgDet;
      var nLenghtImg=sLenghtImg.search(",");
      if(nLenghtImg<0){
        document.getElementById(sIdCampo).innerHTML="<a href=" + sDescUrl + "><img data-src='" + sImagemProdPri + "' alt=\""+ replaceNomeProd +"\" loading=lazy></a>";
      }
      else {
        var valImgDet=null;
        if(tagImgDet!=null){valImgDet = tagImgDet.split(",");}
        var imgDet0=valImgDet[0];
        var imgDet1=valImgDet[1];
        if((imgDet0.indexOf('#')>=0 && imgDet0.indexOf('/')>=0) || (imgDet1.indexOf('#')>=0 && imgDet1.indexOf('/')>=0)){
          imgDet0=valImgDet[0].replace('#', "/lojas/");
          imgDet1=valImgDet[1].replace('#', "/lojas/");
        }
        else if(imgDet0.indexOf('#')>=0 || imgDet1.indexOf('#')>=0){
          imgDet0=valImgDet[0].replace('#', FC$.PathPrdExt);
          imgDet1=valImgDet[1].replace('#', FC$.PathPrdExt);
        }
        else {
          imgDet1=FC$.PathPrd + valImgDet[1];
        }
        if(imgDet0==null){
          document.getElementById(sIdCampo).innerHTML="<a href=" + sDescUrl + "><img height='159' data-src='" + sImagemProdPri + "' alt=\""+ replaceNomeProd +"\" loading=lazy></a>";
        }
        else {
          document.getElementById(sIdCampo).innerHTML="<a href=" + sDescUrl + "><img height='159' data-src='" + imgDet0 + "'' border='0'' onmouseover=\"this.src='" + imgDet1 + "'\" onmouseout=\"this.src='" + imgDet0 + "'\" alt=\""+ replaceNomeProd +"\" loading=lazy></a>";
        }
      }
    }
  }

  return{
    sCurrentPage:sCurrentPage,
    fnGetID:fnGetID,
    fnCustomizeIconsSocialNetworks:fnCustomizeIconsSocialNetworks,
    fnPreloadImages:fnPreloadImages,
    fnLogout:fnLogout,
    fnShowProd:fnShowProd,
    fnShowButtonCart:fnShowButtonCart,
    fnShowDisp:fnShowDisp,
    fnSearchSubmit:fnSearchSubmit,
    fnSearchToolbarSubmit:fnSearchToolbarSubmit,
    fnFormatNumber:fnFormatNumber,
    fnShowCart:fnShowCart,
    fnGoCart:fnGoCart,
    fnUpdateCart:fnUpdateCart,
    fnLoadXMLPageHistory:fnLoadXMLPageHistory,
    fnShowPageHistory:fnShowPageHistory,
    fnInsertVideo:fnInsertVideo,
    fnAdjustsFilters:fnAdjustsFilters,
    fnLoginUserName:fnLoginUserName,
    fnCliLogout:fnCliLogout,
    fnMostraDescontoProdDet:fnMostraDescontoProdDet,
    fnCreateEventGA:fnCreateEventGA,
    fnHideShowBannersHome:fnHideShowBannersHome,
    fnLinkDisp:fnLinkDisp,
    fnShowVideo:fnShowVideo,
    fnSlideshowSwiper:fnSlideshowSwiper,
    fnStartDictation:fnStartDictation,
    fnChangeImages:fnChangeImages
  }

})();

//Funções para o carrinho
var oDivShowCartOnPage=null;
var iLastCartOnPage=0;

function ShowCartOnPage(IDLoja,iErr,sMsg,sCartText,sCheckoutText,este){
  if(!IsFramePage){
    Cart$.fnShowCartCheckout(null,iErr,sMsg);
  }
  else {
    var oPos=getPos(este);
    if(oDivShowCartOnPage==null){
      var oNewElement=document.createElement("div");
      oNewElement.setAttribute("id","DivShowCartOnPage"); 
      oDivShowCartOnPage=document.body.appendChild(oNewElement);
    }
    oDivShowCartOnPage.style.backgroundColor="#fcfcfc";
    oDivShowCartOnPage.style.borderColor="#cdcdcd";
    oDivShowCartOnPage.style.color="#555555";
    oDivShowCartOnPage.style.border="1px solid #cdcdcd";
    oDivShowCartOnPage.style.marginTop="-95px";
    oDivShowCartOnPage.style.marginLeft="0px";
    oDivShowCartOnPage.style.position="absolute";
    oDivShowCartOnPage.style.zIndex="1";
    var iW=238;
    var iH=100;
    var oPosPrice=document.getElementById('PosPrice');
    if(oPosPrice){
      iW=oPosPrice.offsetWidth;
      iH=oPosPrice.offsetHeight;
    }
    if(iErr==0){var sBackColor="3187e6";var iLH=45} else {var sBackColor="949494";var iLH=25}
    var sHTML="<table id=idTabShowCartOnPageFC width='"+iW +"' height='"+ iH +"' cellpadding=3 cellspacing=3>";
    sHTML+="<tr onclick=top.location.href='"+ FCLib$.uk("url-add-product") +"'><td id=idTDTitShowCartOnPageFC colspan=2 align=center style='background-color:#"+ sBackColor +";color:#ffffff;border-width:1px;border-color:#3b6e22;font-weight:bold;font-size:12px;cursor:pointer'><div style='padding:5px; line-height:"+ iLH +"px;'>"+ sMsg +"</div></td></tr>";
    if(iErr==0){
      sHTML+="<tr height=45>";
      sHTML+="<td valign=top align=center style=cursor:pointer onclick=top.location.href='"+ FCLib$.uk("url-add-product") +"'><a href='"+ FCLib$.uk("url-add-product") +"' style='color:#444444;text-decoration:none;font-size:14px;font-weight:bold;'>Ir para o carrinho</a></td>";
      sHTML+="<td align=left><img src='"+ FC$.PathImg +"iconclose.svg?cccfc=1' width=20 height=20 hspace=5 style='cursor:pointer;margin-top:10px' onclick=oDivShowCartOnPage.style.visibility='hidden'></td>";
      sHTML+="</tr>";
    }
    else{
      sHTML+="<tr height=25>";
      sHTML+="<td colspan=2 align=center><img src='"+ FC$.PathImg +"iconclose.svg?cccfc=1' width=20 height=20 hspace=5 style='cursor:pointer;margin:10px;' onclick=oDivShowCartOnPage.style.visibility='hidden'></td>";
      sHTML+="</tr>";
    }
    sHTML+="</table>";
    oDivShowCartOnPage.style.top=oPos.y+"px";
    oDivShowCartOnPage.style.left=oPos.x+"px";
    oDivShowCartOnPage.innerHTML=sHTML;
    oDivShowCartOnPage.style.visibility="visible";
    iLastCartOnPage++;
    setTimeout("if(iLastCartOnPage=="+ iLastCartOnPage +")oDivShowCartOnPage.style.visibility='hidden';",4000);
    sF$.fnUpdateCart(true,IsFramePage);
  }
}

// ZipCode - CEP
function fnShowCEP(IDProd){
  if(FC$.TypeFrt==3 || FC$.TypeFrt==4){
    var sNumCEP=fnGetCookie('CEP'+FC$.IDLoja);
    if(sNumCEP==null)sNumCEP="";
    sCEP="<div id='idDivCEPFC'>";
    sCEP+="  <div id='idDivTitCEP'><img src='"+ FC$.PathImg +"iconziptruck.svg?cccfc=1' width='25' height='25' alt='Zip box' /><span>Simule o valor do frete</span></div>";
    sCEP+="  <div id='idDivContentCEP'>";
    sCEP+="    <div id='idDivContentFieldsCEP'>";
    sCEP+="      <div id='idDivCEPCalc'>";
    sCEP+="        <div class='FieldCEP FieldCEPQty'><label>Qtd.</label><input type='number' id='idQtdZip"+ IDProd +"' value='1' maxlength='4'></div>";
    sCEP+="        <div class='FieldCEP FieldCEPNum'><input type='text' placeholder='CEP' id='idZip"+ IDProd +"' value='"+ sNumCEP +"' maxlength='9'></div>";
    sCEP+="        <img src='"+ FC$.PathImg +"iconnewsletter.svg?cccfc=1' height='29px' id='idCEPButton' class='FieldCEPBtn' onclick='fnGetShippingValuesProd("+ IDProd +")'>";
    sCEP+="      </div>";
    sCEP+="    </div>";
    sCEP+="    <div id='idDivImgLoadingCEPFC'><img src='"+ FC$.PathImg +"loadingcep.gif?cccfc=1' vspace=3 style='display:none;' id=ImgLoadingCEP></div>";
    sCEP+="    <div id='idShippingValues"+ IDProd +"'></div></div>";
    sCEP+="  </div>";
    if(FC$.TypeFrt==4)sCEP+="<div class='FreightTxtOnlyBR'><img src='"+FC$.PathImg+"icexclamation.svg?cccfc=1'>Simulação apenas para o Brasil</div>";
    sCEP+="</div>";
    var oShowCEP=document.getElementById("ShowCEP"+IDProd);
    if(oShowCEP)oShowCEP.innerHTML=sCEP;
  }
}

function fnGetShippingValuesProd(IDProd){
  sCEP=document.getElementById("idZip"+ IDProd).value;
  fnSetCookie('CEP'+FC$.IDLoja,sCEP);
  if(sCEP==""){document.getElementById("idShippingValues"+IDProd).innerHTML="<span class='freightResult' style=color:#990000;>Informe o CEP</span>";return;}
  document.getElementById("idShippingValues"+IDProd).innerHTML="";
  document.getElementById("ImgLoadingCEP").style.display='';
  var iQty=document.getElementById("idQtdZip"+IDProd).value;
  if(IDProd)var sParamProd="&"+ (FCLib$.fnUseEHC()?"productid":"idproduto") +"="+ IDProd;
  else var sParamProd="";
  AjaxExecFC(FCLib$.uk("url-xml-shipping-cep"),"qty="+ iQty +"&cep="+ sCEP + sParamProd,false,processXMLCEP,IDProd);
}

function processXMLCEP(obj,IDProd){
  var sShipping="";
  var oShippingValues=document.getElementById("idShippingValues"+IDProd);
  var iErr=ReadXMLNode(obj,"err");if(iErr==null)return;
  if(iErr!="0"){
    document.getElementById("ImgLoadingCEP").style.display='none';
    oShippingValues.innerHTML="<span class='freightResult' style=color:#990000;>"+ ReadXMLNode(obj,"msg") +"</span>";
    return;
  }
  oShippingValues.innerHTML="";
  var UseCart=ReadXMLNode(obj,"UseCart");
  if(UseCart=="False"){
    var ProdName=ReadXMLNode(obj,"ProdName");
    var ProdRef=ReadXMLNode(obj,"ProdRef");  
  }
  sShipping+="<div class='ZipOptions'>";
  var iOpt=ReadXMLNode(obj,"OptQt");
  for(var i=1;i<=iOpt;i++){
    var OptName=ReadXMLNode(obj,"Opt"+ i +"Name");
    var OptImage=ReadXMLNode(obj,"Opt"+ i +"Image");
    var OptObs=ReadXMLNode(obj,"Opt"+ i +"Obs");
    if(OptObs==null)OptObs="";
    sValorFrete=ReadXMLNode(obj,"Opt"+ i +"Value");
    if(sValorFrete==FC$.Currency+" 0,00")sValorFrete="FRETE GRÁTIS";
    sShipping+="<div class='ZipOption'>";
    sShipping+="  <div class='ZipNameObs'>";
    sShipping+="    <div class='ZipName'>"+ OptName +"</div>";
    sShipping+="    <div class='ZipObsVal'>"+ OptObs +"</div>";
    sShipping+="  </div>";
    sShipping+="  <div class='ZipValue'>"+ sValorFrete +"</div>";
    sShipping+="</div>";
  }
  oShippingValues.innerHTML=sShipping;
  oShippingValues.style.display="block"; 
  sShipping+="</div>";
  document.getElementById("ImgLoadingCEP").style.display='none';
}

function fnGetCookie(name){
  var arg=name+"=";
  var alen=arg.length;
  var clen=document.cookie.length;
  var i=0;
  while (i<clen){
    var j=i+alen;
    if(document.cookie.substring(i,j)==arg)return fnGetCookieVal(j);
    i=document.cookie.indexOf(" ",i)+1;
    if(i==0)break;
  }
  return null;
}

function fnGetCookieVal(offset){
  var endstr=document.cookie.indexOf(";",offset);
  if (endstr==-1)endstr=document.cookie.length;
  return unescape(document.cookie.substring(offset,endstr));
}

function fnSetCookie(name,value){
  var argv=fnSetCookie.arguments;
  var argc=fnSetCookie.arguments.length;
  var expires=(argc>2)?argv[2]:null;
  var path=(argc>3)?argv[3]:null;
  var domain=(argc>4)?argv[4]:null;
  var secure=(argc>5)?argv[5]:false;
  document.cookie=name+"="+escape(value)+((expires==null)?"":(";expires=" + expires.toGMTString()))+((path==null)?"":(";path="+path))+((domain==null)?"":(";domain="+domain))+((secure==true)?"; secure":"");
}
// Frete - CEP - End

//Smart Suggestions
function fnCallbackSuggestions(aTerms){
  "use strict";
  var iTerms=aTerms.length;
  if(FC$.Page=="News"){
    var sParamName="textobuscanews"
    var sIDNotFound="idNotFoundNewsFC";
  }
  else{
    var sParamName="texto"
    var sIDNotFound="idTxtCatNotFoundFC";
  }
  var oNotFound=FCLib$.GetID(sIDNotFound);
  if(oNotFound && iTerms>=1){
    if(iTerms>10)iTerms=10;
    var sTerms="<div id=GoogleTerms><ul>";
    var sPlural=(iTerms>1)?"s":"";
    sTerms+="<li><b>Busca"+ sPlural +" sugerida"+ sPlural +" pelo Google:</b></li>";
    for(var i=0;i<iTerms;i++)sTerms+="<li><a href='"+ FCLib$.fnGetSearchURL(aTerms[i],sParamName) +"'>"+aTerms[i]+"</a></li>";
    sTerms+="</ul></div>";
    oNotFound.insertAdjacentHTML('afterend',sTerms);
  }
}

// Funções executadas no rodapé
function fnFooter(){
  sF$.fnUpdateCart(false,false);
  //Convert Nav UL > LI to Select
  jQuery(function () {
    // Menu Produtos
    jQuery('#FooterNav1').tinyNav({
      header: 'Produtos'
    });
    // Menu Minha Conta
    jQuery('#FooterNav2').tinyNav({
      header: 'Minha Conta'
    });
    // Menu Informações
    jQuery('#FooterNav3').tinyNav({
      header: 'Informações'
    });
  });
  FCLib$.onReady(sF$.fnCustomizeIconsSocialNetworks(false));
  if(FC$.query!="")FCLib$.onReady(FCLib$.fnGetSuggestions(decodeURIComponent(FC$.query),true,fnCallbackSuggestions));
  if(FC$.Page=="Products"){
    if(iQtdProds>2){
      var oScript=document.createElement('script');
      oScript.type='text/javascript';
      oScript.async=true;
      oScript.src=FC$.PathHtm+'js/sort-lib.js?cccfc=10';
      var sAddScript=document.getElementsByTagName('script')[0];
      sAddScript.parentNode.insertBefore(oScript,sAddScript);
    }
  }else if(FC$.Page=="Track")FCLib$.onReady(FCLib$.fnOrderTrack());
   else if(FC$.Page=="Cart")fnButCupom();
    else if(FC$.Page=="Home"){
      sF$.fnHideShowBannersHome();
      sF$.fnSlideshowSwiper();
    }
  jQuery(document).ready(function(){sF$.fnLoadXMLPageHistory();});
  sF$.fnLogout();
  fnShowYear();
  FCLib$.ShowBadgeFC();
  var ListVerify=document.querySelector('.ProductList');
  if (FC$.Page=="Products" && ListVerify){
    document.querySelector('#idFCContent').setAttribute('class','col-large-9 col-xlarge-10');
  };
  FCLib$.onReady(FCLib$.execWaveInterchange);
  NProgress.start();
  window.addEventListener("load",function(event){NProgress.done();});
}

function fnFooterPed(){
  fnShowYear();
}

function fnShowYear(){
  //Show year Rodape.htm
  var footerDate = new Date();
  var footerYearDisplay = footerDate.getFullYear();
  var oFooterFullYear=document.getElementById("FooterFullYear");
  if(oFooterFullYear)oFooterFullYear.innerHTML = footerYearDisplay;
}
// Funções executadas no rodapé

/*Executa Toolbar*/
function ToolbarCartExec(){
  //Toolbar
  var TemScroll = false;
  jQuery(window).scroll(function(event) {
    if(jQuery(window).scrollTop() > 150 && !TemScroll){
      jQuery('.FCToolBar').fadeIn(300);
    }else{jQuery('.FCToolBar').fadeOut(150);}
  });

  //hover do menu
  jQuery('.zf-topMainNav ul > li > a').each(function(){
    jQuery(this).hover(function() {
      jQuery(this,'a').css('display', 'block').stop().animate({marginTop: '-3px'}, 100);
    }, function(){
      jQuery(this,'a').stop().animate({marginTop: '3px'}, 100);
    });
  });
}

// mixitUp
function execMixClasses(){
  var catBlock = jQuery('.CatContainerFC');
  jQuery(catBlock).each(function(){
    jQuery(this).addClass('mix');
  });
  jQuery('.CatBlockFC').attr('id', 'Container');
  jQuery(function(){jQuery('#Container').mixItUp();});
  FCLib$.onReady(
    function(){
    var elCat = document.querySelectorAll('.FCBtnMixit');
    elCat[0].setAttribute("class", "FCBtnMixit sort active");
  });  
}

function MobileMenuClick(){
  var isVisible = false;
  jQuery(".SmallMenuButtom").click(function(){
    if(isVisible === false){
      jQuery('.SmallMenuList').slideDown();
      jQuery('.SmallMenuIcon').html('<svg width="18" height="18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><g id="icomoon-ignore"><line stroke-width="1" x1="" y1="" x2="" y2="" stroke="#449FDB" opacity=""></line></g><path d="M27.414 12.586l-10-10c-0.781-0.781-2.047-0.781-2.828 0l-10 10c-0.781 0.781-0.781 2.047 0 2.828s2.047 0.781 2.828 0l6.586-6.586v19.172c0 1.105 0.895 2 2 2s2-0.895 2-2v-19.172l6.586 6.586c0.39 0.39 0.902 0.586 1.414 0.586s1.024-0.195 1.414-0.586c0.781-0.781 0.781-2.047 0-2.828z" fill="#fff"></path></svg>');
    }else{
      jQuery('.SmallMenuList').slideUp();
      jQuery('.SmallMenuIcon').html('<svg width="18" height="18" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" enable-background="new 0 0 32 32" xml:space="preserve"><g id="icomoon-ignore">  <line fill="none" stroke="#449FDB" x1="0" y1="0" x2="0" y2="0"></line></g><path fill="#FFFFFF" d="M25.6,14.4H6.4c-0.883,0-1.6,0.717-1.6,1.6s0.717,1.6,1.6,1.6h19.2c0.885,0,1.601-0.717,1.601-1.6 S26.484,14.4,25.6,14.4z M6.4,11.2h19.2c0.885,0,1.601-0.717,1.601-1.6C27.2,8.717,26.484,8,25.6,8H6.4C5.517,8,4.8,8.717,4.8,9.6 C4.8,10.483,5.517,11.2,6.4,11.2z M25.6,20.8H6.4c-0.883,0-1.6,0.716-1.6,1.601S5.517,24,6.4,24h19.2c0.885,0,1.601-0.715,1.601-1.6 S26.484,20.8,25.6,20.8z"></path></svg>');
    }
    isVisible = !isVisible;
  });
}

var bCascate=false;
function NoCascate(sURL){
  if(!bCascate){
    bCascate=true;
    location.href=sURL;
  }
  else bCascate=false;
}

// Grade
/*Função para mostrar parcelamento*/
function fnMaxInstallmentsGrid(PrecoProd,MaxParcelas){
  var ComSem;
  if(typeof Juros!="undefined"){
    if(PrecoProd==0||MaxParcelas==1||Juros.length==0)return "";
    if(MaxParcelas==0||MaxParcelas>Juros.length)MaxParcelas=Juros.length;
    if(Juros[MaxParcelas-1]>0)ComSem=""; else ComSem="<font color=#990000> sem juros</font>";
    return "<span class=EstParc> ou <b>"+MaxParcelas+"x</b>"+ComSem+" de <b>"+FormatPrice(CalculaParcelaJurosCompostos(PrecoProd,MaxParcelas),FC$.Currency)+"</b></span>";
  }else{
    return "";
  }
}

/*Função para mostrar valor formatado*/
function FormatNumber(num){
  var num=num.toString().replace(/\$|\,/g,'');
  if(isNaN(num))num="0";
  sign=(num==(num=Math.abs(num))); num=Math.floor(num*100+0.50000000001); num=Math.floor(num/100).toString();
  for(var i=0;i<Math.floor((num.length-(1+i))/3);i++)num=num.substring(0,num.length-(4*i+3))+'.'+num.substring(num.length-(4*i+3));
  return ((sign)?'':'-')+num;
}

/*Função para mostrar valor economizado em produtos em promoção*/
function fnShowEconomyGrid(ProdPrice,ProdPriceOri){
  if(ProdPrice!=ProdPriceOri && typeof FormatNumber == 'function' && typeof FormatPrice == 'function' ){
    return "<font style='font-size:16px;display:block;margin:10px 0;' color=#6f9e45>Economize <b>"+ FormatPrice(ProdPriceOri-ProdPrice,FC$.Currency) +"</b> ("+ FormatNumber(((ProdPriceOri-ProdPrice)/ProdPriceOri)*100)+"%)</font>";
  }else{return "";}
}

// ZipCode Grid FC - CEP - Begin 
function fnShowCEPGrid(IDProd){
  if(FC$.TypeFrt==3){
    var sNumCEP=fnGetCookie('CEP'+FC$.IDLoja);
    if(sNumCEP==null)sNumCEP="";
    sCEP="<div id='idDivCEPFC'>";
    sCEP+="  <div id='idDivTitCEP'><img src='"+ FC$.PathImg +"iconziptruck.svg?cccfc=1' width='25' height='25' alt='Zip box' /><span>Simule o valor do frete</span></div>";
    sCEP+="  <div id='idDivContentCEP'>";
    sCEP+="    <div id='idDivContentFieldsCEP'>";
    sCEP+="      <div id='idDivCEPCalc'>";
    sCEP+="        <div class='FieldCEP FieldCEPQty'><label>Qtd.</label><input type='number' id='idQtdZip"+ IDProd +"' value='1' maxlength='4'></div>";
    sCEP+="        <div class='FieldCEP FieldCEPNum'><input type='text' placeholder='CEP' id='idZip"+ IDProd +"' value='"+ sNumCEP +"' maxlength='9'></div>";
    sCEP+="        <img src='"+ FC$.PathImg +"iconnewsletter.svg?cccfc=1' height='29px' id='idCEPButton' class='FieldCEPBtn' onclick='fnGetShippingValuesProdGrid("+ IDProd +")'>";
    sCEP+="      </div>";
    sCEP+="    </div>";
    sCEP+="    <div id='idDivImgLoadingCEPFC'><img src='"+ FC$.PathImg +"loadingcep.gif?cccfc=1' vspace=3 style='display:none;' id=ImgLoadingCEP></div>";
    sCEP+="    <div id='idShippingValues"+ IDProd +"'></div></div>";
    sCEP+="  </div>";
    sCEP+="</div>";
    var oShowCEP=document.getElementById("ShowCEP"+IDProd);
    if(oShowCEP)oShowCEP.innerHTML=sCEP;
  }
}

function fnGetShippingValuesProdGrid(IDProd){
  sCEP=document.getElementById("idZip"+ IDProd).value;
  fnSetCookie('CEP'+FC$.IDLoja,sCEP);
  if(sCEP==""){document.getElementById("idShippingValues"+IDProd).innerHTML="<span class='freightResult' style=color:#990000;>Informe o CEP</span>";return;}
  document.getElementById("idShippingValues"+IDProd).innerHTML="";
  document.getElementById("ImgLoadingCEP").style.display='';
  var iQty=document.getElementById("idQtdZip"+IDProd).value;
  if(IDProd)var sParamProd="&"+ (FCLib$.fnUseEHC()?"productid":"idproduto") +"="+ IDProd;
  else var sParamProd="";
  AjaxExecFC(FCLib$.uk("url-xml-shipping-cep"),"qty="+ iQty +"&cep="+ sCEP + sParamProd,false,processXMLCEPGrid,IDProd);
}

function processXMLCEPGrid(obj,IDProd){
  var sShipping="";
  var oShippingValues=document.getElementById("idShippingValues"+IDProd);
  var iErr=ReadXMLNode(obj,"err");if(iErr==null)return;
  if(iErr!="0"){
    document.getElementById("ImgLoadingCEP").style.display='none';
    oShippingValues.innerHTML="<span class='freightResult' style=color:#990000;>"+ ReadXMLNode(obj,"msg") +"</span>";
    return;
  }
  oShippingValues.innerHTML="";
  var UseCart=ReadXMLNode(obj,"UseCart");
  if(UseCart=="False"){
    var ProdName=ReadXMLNode(obj,"ProdName");
    var ProdRef=ReadXMLNode(obj,"ProdRef");  
  }
  sShipping+="<div class='ZipOptions'>";
  var iOpt=ReadXMLNode(obj,"OptQt");
  for(var i=1;i<=iOpt;i++){
    var OptName=ReadXMLNode(obj,"Opt"+ i +"Name");
    var OptImage=ReadXMLNode(obj,"Opt"+ i +"Image");
    var OptObs=ReadXMLNode(obj,"Opt"+ i +"Obs");
    if(OptObs==null)OptObs="";
    sValorFrete=ReadXMLNode(obj,"Opt"+ i +"Value");
    if(sValorFrete==FC$.Currency+" 0,00")sValorFrete="FRETE GRÁTIS";
    sShipping+="<div class='ZipOption'>";
    sShipping+="  <div class='ZipNameObs'>";
    sShipping+="    <div class='ZipName'>"+ OptName +"</div>";
    sShipping+="    <div class='ZipObsVal'>"+ OptObs +"</div>";
    sShipping+="  </div>";
    sShipping+="  <div class='ZipValue'>"+ sValorFrete +"</div>";
    sShipping+="</div>";
  }
  oShippingValues.innerHTML=sShipping;
  oShippingValues.style.display="block"; 
  sShipping+="</div>";
  document.getElementById("ImgLoadingCEP").style.display='none';
}
// ZipCode Grid FC - CEP - End

FCLib$.onReady(FCLib$.showPwdViewer);
function FuncChkRegisterBegin(){FCLib$.showPwdViewer();}

// Global Signin
if(FC$.ClientID==0)FCLib$.onReady(fnShowGlobalSignin);

function fnShowGlobalSignin(){
  var oImgGlobalSign=sF$.fnGetID("idImgGlobalSignFC");
  if(oImgGlobalSign){
    var bFacebookLogin=false;
    var bGoogleLogin=false;
    var sImgs="";
    if(typeof FC$.FacebookSigninID!="undefined"){
      sImgs+="<img src='"+ FC$.PathImg +"facebooklogin.svg' class='FacebookSigninClass' data-loginsuccess='fnLoginShowUserName'>";
      bFacebookLogin=true;
    } 
    if(typeof FC$.GoogleSigninID!="undefined"){
      sImgs+="<img src='"+ FC$.PathImg +"googlelogin.svg' class='GoogleSigninClass' data-loginsuccess='fnLoginShowUserName'>";
      bGoogleLogin=true;
    }
    if(bFacebookLogin||bGoogleLogin)oImgGlobalSign.innerHTML=sImgs;
    if(bFacebookLogin)FCLib$.signinFacebook();
    if(bGoogleLogin)FCLib$.signinGoogle();
  }
}

function fnLoginShowUserName(user){
  sF$.fnLoginUserName(user.fullName,user.pictureURL);
}

// Don't Go Popup
FCLib$.onReady(function(){
  if(FCLib$.GetID("overlay")){
    //Dynamic Don't Go Container
    var dynamicDontGoContainer = document.createElement('div');
    dynamicDontGoContainer.id = 'ShowDontGoPopup';
    dynamicDontGoContainer.className = 'DontGoPopup';
    document.getElementsByTagName('body')[0].appendChild(dynamicDontGoContainer);
  
    //Dynamic Don't Go Container Elements
    var dynamicDontGoContainerElements = document.createElement('div');
    dynamicDontGoContainerElements.className = 'DontGoPopupContent';
    dynamicDontGoContainer.appendChild(dynamicDontGoContainerElements);
  
    //Dynamic Don't Go Elements Close Button
    var dynamicDontGoElementsCloseButton = document.createElement('div');
    dynamicDontGoElementsCloseButton.className = 'DontGoPopupCloseButton';
    dynamicDontGoContainerElements.appendChild(dynamicDontGoElementsCloseButton);
    dynamicDontGoElementsCloseButton.innerHTML = "<img id='idBtnDontGoClose' border='0' onclick='sF$.fnCreateEventGA(\"DontGo\",\"Clique\",\"Close\");'>";
  
    //Dynamic Don't Go Elements Banner
    var dynamicDontGoElementsBanner = document.createElement('div');
    dynamicDontGoElementsBanner.className = 'DontGoBanner';
    dynamicDontGoContainerElements.appendChild(dynamicDontGoElementsBanner);
    dynamicDontGoElementsBanner.innerHTML = "<a id='idLinkDontGo' target='_self'><img id='idImgDontGo' src='' border='0' onclick='sF$.fnCreateEventGA(\"DontGo\",\"Clique\",\"Banner\");'></a>"; 
  
    //PreLoading Image Banner
    var preLoadingDontGoBanner = new Image();
    preLoadingDontGoBanner.onload = function () {
      document.getElementById('idImgDontGo').src = preLoadingDontGoBanner.src;
    };
    preLoadingDontGoBanner.src = FC$.PathImg +"bannerpopupdontgo.jpg?cccfc=1";
  
    //Show Don't Go Popup
    FCLib$.fnDontGo(userDontGo,{
    DontGoBtnClose:FC$.PathImg +"botdontgoclose.svg?cccfc=1", //Close button
    DontGoBanner:FC$.PathImg +"bannerpopupdontgo.jpg?cccfc=1", //Banner
    DontGoLink:FCLib$.uk("url-sale"), //Link
    DontGoAltParam:"UM DESCONTO ESPECIAL PARA VOCÊ!"}, //Alt Param
    "DontGoCookie"); //Cookie name
  }
});

function userDontGo(oParam){
  var OpenDontGoPopup=document.getElementById('ShowDontGoPopup');
  if(OpenDontGoPopup){
    document.getElementById("idBtnDontGoClose").src=oParam.DontGoBtnClose; //Close button
    document.getElementById("idImgDontGo").src=oParam.DontGoBanner; //Banner
    document.getElementById("idImgDontGo").alt=oParam.DontGoAltParam; //Alt Param
    document.getElementById("idLinkDontGo").href=oParam.DontGoLink; //Link
    sF$.fnCreateEventGA("DontGo","Open","Window");
    window.onload=OpenDontGoPopup.style.display="block";
    var CloseDontGoPopup=document.getElementsByClassName("DontGoPopupCloseButton")[0];
    CloseDontGoPopup.onclick=function(){OpenDontGoPopup.style.display="none";}
  }
}

function fnDontGoActions() {
  var oDontGo = document.getElementById('ShowDontGoPopup');
  if (oDontGo) {
    window.addEventListener("keydown", (function (e) {
      if (oDontGo && e.keyCode == 27) {
        oDontGo.style.display = "none";
      }
    }), false);
    oDontGo.addEventListener("click", (function (e) {
      e.stopPropagation();
      if (e.target.id != 'DontGoPopupContent' && e.target.id == 'ShowDontGoPopup') {
        oDontGo.style.display = "none";
      }
    }), false);
  }else{
    return;
  }
}

document.addEventListener('DOMContentLoaded', fnDontGoActions, false);

function fnProgressBarLoading(){
  NProgress.start();
  window.addEventListener("load",function(event){
    NProgress.done();
  });
}

/* Disable Speech Recognition IOS */
function fnSpeechRecognitionIOS(){
  if (window.hasOwnProperty('webkitSpeechRecognition')) {
    document.getElementById("voiceSearch").style.display="block";
  }else{
    document.getElementById("voiceSearch").style.display="none";
    document.getElementById("voiceSearchMGlass").style.display="block";
    document.getElementById("voiceSearchMGlass").style.position="relative";
    document.getElementById("voiceSearchMGlass").style.left="15px";
  }
}

/* Enable Speech Recognition News */
function fnNewsVoiceSearch(){
  if(FC$.Page=="News"){
  
    function fnStartDictationNews(){
      if (window.hasOwnProperty('webkitSpeechRecognition')) {
        var recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "pt-BR";
        recognition.start();
        recognition.onresult = function(e) {
          document.getElementById('TextoBuscaNews').value = e.results[0][0].transcript;
          recognition.stop();
          document.getElementById('fc-news-voice-search').submit();
        };
        recognition.onerror = function(e) {
          recognition.stop();
        }
      }
    }
  
    var oForm = document.forms["BuscaNoticia"];
    oForm.setAttribute("id", "fc-news-voice-search"); 
    var newDivSpeech = document.createElement("div");
    newDivSpeech.innerHTML="<div id='fc-icon-voice-news'><img src='"+ FC$.PathImg +"icon-speech.svg?cccfc=1' class='header-speech-icon' id='voiceSearch'  width='30' height='30' alt='Fale'></div>"
    var btnSpeech = newDivSpeech;
    btnSpeech.addEventListener('click', function () {
       fnStartDictationNews();
    });
    var reference = document.getElementById('Procurar');
    reference.parentNode.insertBefore(newDivSpeech, reference);
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
      document.getElementById("voiceSearch").style.display="block";
    }else{
      document.getElementById("voiceSearch").style.display="none";
      document.getElementById("fc-icon-voice-news").style.display="none";
    }
  }
}

// Cálculo de frete na cesta
function fnCustomizeCart(){
  //insere campo solicitando o CEP para cálculo do lado esquerdo
  var oFCCartSubtotals=document.getElementById("FCCartSubtotals");
  if(document.getElementById("idColPesoFC"))var sColspan=3; else var sColspan=2;
  if(oFCCartSubtotals){
    var oNewElement=document.createElement("tr");
    oNewElement.setAttribute("id","FCCartFreightCalc"); 
    oNewElement.setAttribute("class","not-on-small"); 
    var oTRFreightCalc=oFCCartSubtotals.parentNode.insertBefore(oNewElement,oFCCartSubtotals);
    oTRFreightCalc.innerHTML="<td>Digite o CEP para calcular o frete: <input type=text id=idZipC1 size=10 maxlength=9 class=InputText>&nbsp;<input type=button value='Calcular frete' class=idBut class=InputButton onclick='fnGetShippingValue(1)'></td><td align=right colspan="+ sColspan +"><span id=idShippingObs1></span></td><td align=right><span id=idShippingValue1></span><img src='/images/loading.gif' vspace=3 style='display:none' id=idImgLoadingCEP1></td>";
  }
  //insere campo solicitando o CEP para cálculo do lado direito
  var oFCCartRight=document.getElementById("FCCartSmallSubtotalPrice");
  if(!oFCCartRight)oFCCartRight=document.getElementById("FCCartSmallSubtotals");
  if(oFCCartRight){
    var oNewElement=document.createElement("div");
    oNewElement.setAttribute("id","FCCartSmallFreightCalc"); 
    var oTRFreightCalc=oFCCartRight.parentNode.insertBefore(oNewElement,oFCCartRight);
    var sCEPCont="<div id='FCCartSmallFreight'>";
       sCEPCont+="  <div class='FCCartFreightInfo'>";
       sCEPCont+="    <span class='FCCartFreightLabel'>Digite o CEP para calcular o frete:</span>";
       sCEPCont+="    <input type=text id=idZipC2 size=10 maxlength=9 class=InputText>";
       sCEPCont+="    <div id='FCCartSmallFreightBut'>";
       sCEPCont+="      <input type=button value='Calcular frete' class=idBut class=InputButton onclick='fnGetShippingValue(2)'>";
       sCEPCont+="    </div>";
       sCEPCont+="    <img src='/images/loading.gif' vspace=3 style='display:none' id=idImgLoadingCEP2>";
       sCEPCont+="  </div>";
       sCEPCont+="</div>";
       sCEPCont+="<div id='FCCartSmallFreightPrice'>";
       sCEPCont+="  <ul>";
       sCEPCont+="    <li class='FCCartFreightPriceLabel' id=idShippingObs2>Frete:</li>";
       sCEPCont+="    <li class='FCCartFreightPriceValue' id=idShippingValue2>Calcule acima</li>";
       sCEPCont+="  </ul>";
       sCEPCont+="</div>";
    oTRFreightCalc.innerHTML=sCEPCont;
    fnGetCEP();
  }
}

function fnGetCEP(){
  //se já tem CEP em cookie já mosta cálculo
  var sNumCEP=FCLib$.GetCookie("CEP"+FC$.IDLoja);
  if(sNumCEP && sNumCEP!=""){
    document.getElementById("idZipC1").value=sNumCEP;
    document.getElementById("idZipC2").value=sNumCEP;
    fnGetShippingValue(0);
  }
}

function fnGetShippingValue(iField){
  if(iField==0){
    var sCEP=document.getElementById("idZipC1").value;
    if(sCEP=="")sCEP=document.getElementById("idZipC2").value;
  }
  else{
    var sCEP=document.getElementById("idZipC"+iField).value;
  }
  document.getElementById("idZipC1").value=sCEP;
  document.getElementById("idZipC2").value=sCEP;   
  FCLib$.SetCookie("CEP"+FC$.IDLoja,sCEP);
  if(sCEP==""){
    document.getElementById("idShippingValue1").innerHTML="<span style=color:#990000;>Informe o CEP</span>";
    document.getElementById("idShippingValue2").innerHTML="<span style=color:#990000;>Informe o CEP</span>";
  }
  else{
    document.getElementById("idShippingValue1").innerHTML="";
    document.getElementById("idShippingValue2").innerHTML="";
    var oImgLoadingCEP1=document.getElementById("idImgLoadingCEP1");
    if(oImgLoadingCEP1){oImgLoadingCEP1.style.display="";}
    var oImgLoadingCEP2=document.getElementById("idImgLoadingCEP2");
    if(oImgLoadingCEP2){oImgLoadingCEP2.style.display="";}
    AjaxExecFC(FCLib$.uk("url-xml-shipping-cep"),"cep="+ sCEP,false,fnprocessXMLCEPC);
  }
}

function fnprocessXMLCEPC(obj){
  var oShippingObs1=document.getElementById("idShippingObs1");
  var oShippingObs2=document.getElementById("idShippingObs2");
  var oShippingValue1=document.getElementById("idShippingValue1");
  var oShippingValue2=document.getElementById("idShippingValue2");
  var iErr=ReadXMLNode(obj,"err");if(iErr==null)return;
  if(iErr!="0"){
    var oImgLoadingCEP1=document.getElementById("idImgLoadingCEP1");
    if(oImgLoadingCEP1){oImgLoadingCEP1.style.display="none";}
    var oImgLoadingCEP2=document.getElementById("idImgLoadingCEP2");
    if(oImgLoadingCEP2){oImgLoadingCEP2.style.display="none";}
    oShippingValue1.innerHTML="<span id=idErrXMLCEPFC style=color:#990000;>"+ ReadXMLNode(obj,"msg") +"</span>";
    oShippingValue2.innerHTML="<span id=idErrXMLCEPFC style=color:#990000;>"+ ReadXMLNode(obj,"msg") +"</span>";
    return;
  }
  oShippingObs1.innerHTML="";oShippingObs2.innerHTML="";oShippingValue1.innerHTML="";oShippingValue2.innerHTML="";
  var OptName=ReadXMLNode(obj,"Opt1Name");
  var OptValue=ReadXMLNode(obj,"Opt1Value");
  var OptObs=ReadXMLNode(obj,"Opt1Obs");

  //oShippingObs1.innerHTML="<b>"+ OptName +"</b><br><span class=ObsFreightCalc>"+ OptObs +"</span>";
  //oShippingObs2.innerHTML="<b>"+ OptName +"</b><br><span class=ObsFreightCalc>"+ OptObs +"</span>";
  oShippingObs1.innerHTML="<b>Frete:</b>";
  oShippingObs2.innerHTML="<b>Frete:</b>";

  oShippingValue1.innerHTML=OptValue;oShippingValue1.style.display="block";
  oShippingValue2.innerHTML=OptValue;oShippingValue2.style.display="block";
  var oImgLoadingCEP1=document.getElementById("idImgLoadingCEP1");
  if(oImgLoadingCEP1){oImgLoadingCEP1.style.display="none";}
  var oImgLoadingCEP2=document.getElementById("idImgLoadingCEP2");
  if(oImgLoadingCEP2){oImgLoadingCEP2.style.display="none";}
  //remove elementos  
  var oFCCartTotalCalc=document.getElementById("FCCartTotalCalc");
  if(oFCCartTotalCalc){oFCCartTotalCalc.parentNode.removeChild(oFCCartTotalCalc);}
  var oFCCartSmallTotalPrice=document.getElementById("FCCartSmallTotalPrice");
  if(oFCCartSmallTotalPrice){oFCCartSmallTotalPrice.parentNode.removeChild(oFCCartSmallTotalPrice);}
  //exibe total com frete
  var iValFrete=OptValue.replace("R$ ","").replace(",",".");
  var iTotalCesta=parseFloat(iValorCesta)+parseFloat(iValFrete);
  //insere totais na tabela principal
  var oLocalInsert=document.getElementById("FCCartWrapTotal"); //se tem embalagem, tenta usar esta posição primeiro
  if(!oLocalInsert)oLocalInsert=document.getElementById("FCCartSubtotalPrice");
  if(!oLocalInsert)oLocalInsert=document.getElementById("FCCartSubtotals");
  if(oLocalInsert){
    var oNewElement=document.createElement("tr");
    oNewElement.setAttribute("id","FCCartTotalCalc");
    oNewElement.setAttribute("class","not-on-small");
    if(document.getElementById("idColPesoFC"))var sColspan=" colspan=2"; else var sColspan="";
    oNewElement.innerHTML="<td colspan=3 align=right><b>Total:</b></td><td align=right"+ sColspan +"><b>"+ FormatPrice(iTotalCesta,FC$.Currency) +"</b></td>";
    fnInsertAfter(oNewElement,oLocalInsert);
  }
  //insere totais na tabela small
  var oLocalInsert=document.getElementById("FCCartSmallWrapTotal");
  if(!oLocalInsert)oLocalInsert=document.getElementById("FCCartSmallSubtotalPrice");
  if(!oLocalInsert)oLocalInsert=document.getElementById("FCCartSmallSubtotals");
  if(oLocalInsert){
    var oNewElement=document.createElement("div");
    oNewElement.setAttribute("id","FCCartSmallTotalPrice");
    oNewElement.innerHTML="<ul><li class='FCCartSubtotalPriceLabel'>Total:</li><li class='FCCartSubtotalPriceValue'><b>"+ FormatPrice(iTotalCesta,FC$.Currency) +"</b></li></ul>";
    fnInsertAfter(oNewElement,oLocalInsert);
  }
}

function fnInsertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// Cálculo de frete na cesta
function fnButCupom(){
  var oCupom=document.getElementById("Cupom");
  if(oCupom){
    var oNewElement=document.createElement("span");
    oNewElement.innerHTML="&nbsp;<button id='FCCartCupomBut' type='submit' onclick=\"document.Lista.Buy.value='';\">Aplicar cupom</button>";
    fnInsertAfter(oNewElement,oCupom);
  }
}

// Cart Design Right bar
var Cart$=(function(){

  function fnShowCartCheckout(oRet,iErr,sMsg){
    if(FC$.Page=="Cart")
      var oObj=document.getElementById("idTitTextoFC");
      if(oObj)oObj.scrollIntoView();
    else{
      FCLib$.fnAjaxExecFC(FCLib$.uk("url-cart-list"),"format=1&n=20&d=1",false,fnProcessShowCart,iErr,sMsg);
    }
  }

  function fnProcessShowCart(oHTTP,iErr,sMsg){
    var sHTTP=oHTTP.responseText;
    if(sHTTP!=""){
      var oJSON=null;
      try{oJSON=JSON.parse(sHTTP);}
      catch(e){console.log("invalid JSON from /cartlist");}
      if(oJSON)fnShowCartDesign(oJSON,iErr,sMsg);
    }
    else{console.log("blank response from /cartlist");}
  }

  function fnShowCartDesign(oJSON,iErr,sMsg){
    var sProdutosNaCesta=""
    var sFinalCart="";
    iItensCesta=0;
    if(oJSON.msg!=undefined){
      if(oJSON.msg!=""){console.log("msg "+oJSON.msg)}
    }
    else{  
      var currencyProdCart=oJSON.currency;
      var TotalQtyProdCart=oJSON.TotalQty;
      var subtotalProdCart=oJSON.subtotal;
      var totalProds=oJSON.totalProds;
      var totalWrapValue=oJSON.totalWrapValue;
      iItensCesta=TotalQtyProdCart;
      var oItems=oJSON.items;
      var iQtdProdsXML=oItems.length;
      for(i=0;i<iQtdProdsXML;i++){
        var sProdAtual="";
        var ImgProdCart=oItems[i].image;
        var NomeProdCart=oItems[i].prod;
        var qtyProdCart=oItems[i].qty;
        var priceProdCart=oItems[i].price;
        var idProdCart=oItems[i].id;
        var idProdPed=oItems[i].iditem;
        var cor=oItems[i].cor; if(cor==undefined)cor="";
        var fil=oItems[i].fil; if(fil==undefined)fil="";
        var d1=oItems[i].d1; if(d1==undefined)d1="";
        var d2=oItems[i].d2; if(d2==undefined)d2="";
        var d3=oItems[i].d3; if(d3==undefined)d3="";
        var s1=oItems[i].s1; if(s1==undefined)s1="";
        var s2=oItems[i].s2; if(s2==undefined)s2="";
        var s3=oItems[i].s3; if(s3==undefined)s3="";
        var wrap=oItems[i].wrap; if(wrap==undefined)wrap=false;
        var wrapValue=oItems[i].wrapValue; if(wrapValue==undefined)wrapValue=0;
        //Informações do produto       
        sProdAtual+="<div id='DivItem"+ idProdPed +"' class='CartDesign-product-container'>";
        sProdAtual+="  <div class='CartDesign-product-img'>";
        sProdAtual+="    <div class='ImgProdCart'><a href='"+ FCLib$.uk("url-prod") +"?"+ (FCLib$.fnUseEHC()?"productid":"idproduto") +"="+ idProdCart +"'><img src='"+ ImgProdCart +"' border='0'></a></div>";
        sProdAtual+="  </div>";
        sProdAtual+="  <div class='CartDesign-product-info-container'>";
        sProdAtual+="    <div class='CartDesign-product-info-name-delete'>";
        sProdAtual+="      <div class='CartDesign-product-info-name'>";
        sProdAtual+="        <a href='"+ FCLib$.uk("url-prod") +"?"+ (FCLib$.fnUseEHC()?"productid":"idproduto") +"="+ idProdCart +"'>"+ NomeProdCart +"</a>";
        sProdAtual+="      </div>";
        sProdAtual+="      <div class='CartDesign-product-info-delete'>";
        sProdAtual+="        <img title='Remover item da cesta' src='"+ FC$.PathImg +"delete_off.svg?cccfc=1' onmouseover='this.src=FC$.PathImg+\"delete.svg\"' onmouseout='this.src=FC$.PathImg+\"delete_off.svg\"' width=16 onclick='Cart$.fnRemoveProd("+ idProdPed +");'>";
        sProdAtual+="      </div>";
        sProdAtual+="    </div>";        
        sProdAtual+="    <div class='CartDesign-product-info-desc'>";
        sProdAtual+="     "+ cor +" "+ fil +" "+ d1 +" "+ d2 +" "+ d3 +" "+ s1 +" "+ s2 +" "+ s3 +"";
        sProdAtual+="    </div>";
        sProdAtual+="    <div class='CartDesign-product-info-qty-price'>";
        sProdAtual+="      <div class='CartDesign-product-info-qty QtdProdCart'>";
        sProdAtual+="        <div class=QtdMenos onclick='Cart$.fnChangeQtdProd("+ idProdCart +","+ idProdPed +",false);'>-</div>";
        sProdAtual+="        <div class=QtdVal id=QtdVal"+ idProdPed +">"+ qtyProdCart +"</div>";
        sProdAtual+="        <div class=QtdMais onclick='Cart$.fnChangeQtdProd("+ idProdCart +","+ idProdPed +",true);'>+</div>";
        sProdAtual+="      </div>";
        sProdAtual+="      <div class='CartDesign-product-info-price'>";
        sProdAtual+="        "+ currencyProdCart +" "+ priceProdCart +"";   
        sProdAtual+="      </div>"; 
        sProdAtual+="    </div>";      
        sProdAtual+="  </div>";
        sProdAtual+="</div>";
        sProdutosNaCesta=sProdAtual+sProdutosNaCesta;        
      }
      if(iQtdProdsXML>=20)sProdutosNaCesta="<div class='CartDesign-20-products'>Listando os&nbsp;<b>20 primeiros</b>&nbsp;produtos da&nbsp;<a href='"+ FCLib$.uk("url-add-product") +"'>cesta</a>:</div>"+sProdutosNaCesta;
      if(sProdutosNaCesta!=""){
        ValCesta=subtotalProdCart.replace(".","").replace(",",".");
        sFinalCart=""; 
        if(totalWrapValue>0)ValCesta=ValCesta-totalWrapValue; //se tem valor de presente, retira do valor da cesta       
        //Se valor do total dos produtos é diferente do subtotal calculado exibe descontos
        if(totalProds!=subtotalProdCart){
          var ValProds=totalProds.replace(".","").replace(",",".");
          var ValorDesconto=(ValProds-ValCesta);
          var PercDesconto=(100*(1-(ValCesta/ValProds)))+0.001;
          PercDesconto=fnArredonda(PercDesconto,2);
          //Exibe total sem descontos
          sFinalCart+="<div class='CartDesign-totalitens-container'>";
          sFinalCart+="<div class=TotItProdCart>Total dos itens:</div>";
          sFinalCart+="<div class=TotItProdCartValor>&nbsp;&nbsp;"+ FormatPrice(ValProds,currencyProdCart) +"</div>";
          sFinalCart+="</div>";
          //Exibe descontos
          if(ValorDesconto>0){
            sFinalCart+="<div class='CartDesign-descontos-container'>";
            sFinalCart+="<div class=DescProdCart>Descontos ("+ PercDesconto +"%):</div>";
            sFinalCart+="<div class=DescProdCartValor>&nbsp;-&nbsp;"+ FormatPrice(ValorDesconto,currencyProdCart) +"</div>";
            sFinalCart+="</div>";
          }           
        }       
        //Exibe embalagem  
        if(totalWrapValue>0){ //Se tem valor de embalagem mostra
          sFinalCart+="<tr>";
          sFinalCart+="<td colspan=3 align=right class=TotItProdCart>Embalagem para presente:</td>";
          sFinalCart+="<td colspan=2 align=right class=TotItProdCartValor>&nbsp;&nbsp;"+ FormatPrice(totalWrapValue,currencyProdCart) +"</td>";
          sFinalCart+="</tr>";
        }
        //Exibe Subtotal  
        sFinalCart+="<div class='CartDesign-product-subtotal-container-separator'><div class='CartDesign-product-subtotal-container'>";
        sFinalCart+="  <div class='CupomProdCart'>";
        sFinalCart+="    <input type=button value='INSERIR CUPOM' id=idButCup class=InputButton onclick='Cart$.fnGoCupom();'>";
        sFinalCart+="  </div>";
        sFinalCart+="  <div class='CartDesign-product-subtotal-price'>";
        sFinalCart+="    Subtotal:";
        sFinalCart+="    &nbsp;"+ FCLib$.FormatPreco(currencyProdCart +" "+ subtotalProdCart) +"";
        sFinalCart+="  </div>";
        sFinalCart+="</div></div>";        
        //Insere cálculo de frete se loja tem configurado por CEP
        if(FC$.TypeFrt==3 || FC$.TypeFrt==4){           
          sFinalCart+="<div id='FCCartTotalFreight' class='CartDesign-product-zipcode-container'>";
          sFinalCart+="  <div class='CartDesign-product-zipcode-field'>";
          sFinalCart+="    <span>CEP</span> <input type=text id=idZipC size=10 maxlength=9 class=InputText><input type=button value='Calcular' id=idButC class=InputButton onclick='Cart$.fnGetShippingValueCart(\""+subtotalProdCart+"\")'>";
          sFinalCart+="    <span id=idShippingObs></span>";
          sFinalCart+="  </div>";
          sFinalCart+="  <div class='CartDesign-product-zipcode-price'>";
          sFinalCart+="    <span id=idShippingValue>a calcular</span><img src='/images/loading.gif' vspace=3 style='display:none' id=idImgLoadingCEP>";
          sFinalCart+="  </div>";
          sFinalCart+="</div>";             
        }
        //Parcelamento
        sFinalCart+="<div id='FCCartTotalParcCalc' class='ParcProdCart'>"+ fnMontaMaxParcelaCart(ValCesta) +"</div>";
        //Botão ir para carrinho
        //sFinalCart+="<div class=ProdCartGo><a href='"+ FCLib$.uk("url-add-product") +"'>IR PARA O CARRINHO</a></div>";
        //Botão ir para pagto
        sFinalCart+="<div class='ProdCartPagto'><a href='"+ FCLib$.uk("url-checkout") +"'>IR PARA O PAGAMENTO</a></div>";
      }
    }
    var oCartDesign=document.getElementById("CartDesign");
    //Insere elemento (carrinho) se ele não existir
    if(!oCartDesign){
      var oInsert=document.getElementById("idFCLeftContentRight");
      if(oInsert){
        var oNewElement=document.createElement("div");
        oNewElement.setAttribute("id","CartDesign");
        oNewElement.setAttribute("class","cart-design");
        oCartDesign=oInsert.parentNode.insertBefore(oNewElement,oInsert);
      }
    }

    var oBlocker=document.getElementById("Blocker");
    //Insere elemento (tela bloqueada) se ele não existir
    if(oBlocker){
      oBlocker.style.display="block";
    }
    else{
      var oNewElement=document.createElement("div");
      oNewElement.setAttribute("id","Blocker"); 
      oBlocker=document.body.appendChild(oNewElement);
      oBlocker.style.position="fixed";
      oBlocker.style.top="0";
      oBlocker.style.left="0";
      oBlocker.style.width="100%";
      oBlocker.style.height="100%";
      oBlocker.style.zIndex ="1109";  //#CartDesign tem zIndex de 1110 //alert do Vex tem 1111
      oBlocker.style.cursor="pointer";
      oBlocker.style.backgroundColor="rgba(51, 51, 51, 0.50)";
      oBlocker.onclick=fnCloseBloker;
    }

    document.onkeyup=function(e){
      e=e||window.event;
      if(e.keyCode==27){
        Cart$.fnCloseCartDesign();
      }
    };

    var bTemProds=true;
    if(sProdutosNaCesta==""){bTemProds=false;sProdutosNaCesta+="<div class='CartDesign-empty'>Seu carrinho está vazio.</div>";}
    
    //Se ocorreu erro ao incluir exibe mensagem de erro. Se não ocorrer erro não mostra a mensagem
    if(iErr>0 && sMsg!=""){sProdutosNaCesta="<div id=DivMsgCart><div style='color:"+(iErr>0?"#ffffff":"#ffffff") +";background:"+(iErr>0?"#b61f24":"#1a75d7") +";'>"+ sMsg +"</div></div>"+sProdutosNaCesta;}

    var sTopo="<div class='CartDesign-header'>";
          sTopo+="<div class='CartDesign-header-title'>";
            sTopo+="<a style='color:#fff;' href='"+ FCLib$.uk("url-add-product") +"'>CARRINHO";
            if(iItensCesta>0)sTopo+="&nbsp; [ <span>"+ iItensCesta +" "+ ((iItensCesta>1)?"itens":"item") +"</span> ]";
            sTopo+="</a>";
          sTopo+="</div>";
          sTopo+="<div class='CartDesign-header-close'>";
            sTopo+="<img src='"+ FC$.PathImg +"icon-bot-close-cart.svg?cccfc=1' alt='close cart' onclick='Cart$.fnCloseCartDesign();' style='cursor:pointer;'>";   
          sTopo+="</div>";
        sTopo+="</div>";    
    
    //Carrinho
    var sContCart=sTopo;
    sContCart+="<div id=idContentItensCart class=ContentItensCart>"+ sProdutosNaCesta +"</div>";
    if(sFinalCart!="")sContCart+="<div id='TabFinalCart' class='EstTabFinalCart'>"+ sFinalCart +"</div>";
    
    //Insere o elemento do carrinho
    oCartDesign.innerHTML=sContCart;

    //Mostra carrinho (opção com aninação)
    //oCartDesign.style.display="";
    //jQuery(oCartDesign).show(300);
    if(oCartDesign.style.right=="" || oCartDesign.style.right=="-350px")jQuery(oCartDesign).animate({ "right": "+=350px" }, 200 );

    //Muda tamanho e posição dependendo da largura
    /*var iClientWidth=document.documentElement.clientWidth;
    if(iClientWidth<350){oCartDesign.style.width="320px";}
    if(iClientWidth<440){oCartDesign.style.top="0px";}
    var iClientHeight=document.documentElement.clientHeight;
    if(iClientHeight<590){
      var oContentItensCart=document.getElementById("idContentItensCart");
      if(oContentItensCart)oContentItensCart.style.maxHeight="215px";
    }*/

    //Se não está vazio, carrega função do cálculo de frete
    if((FC$.TypeFrt==3 || FC$.TypeFrt==4) && bTemProds)fnGetCEP(subtotalProdCart); 

    //Atualiza carrinho do topo
    fnUpdateCartTop(iItensCesta,currencyProdCart,subtotalProdCart);

    //Remove mensagem de produto adicionado ao carrinho ou produto não adicionado
    setTimeout(function(){if(document.getElementById('DivMsgCart'))jQuery(document.getElementById('DivMsgCart')).hide(500);},2000);

  }

  function fnUpdateCartTop(iItensCesta,currencyProdCart,subtotalProdCart){
    if(currencyProdCart==undefined)currencyProdCart=FC$.Currency;
    if(subtotalProdCart==undefined)subtotalProdCart="0,00";
    var oCartItemsTop=document.getElementById("idCartItemsTop");if(oCartItemsTop)oCartItemsTop.innerHTML=iItensCesta;
    var oCartItemsToolTop=document.getElementById("idCartItemsToolTop");if(oCartItemsToolTop)oCartItemsToolTop.innerHTML=iItensCesta;
    var oCartTotalTop=document.getElementById("idCartTotalTop");if(oCartTotalTop)oCartTotalTop.innerHTML=FCLib$.FormatPreco(currencyProdCart +" "+ subtotalProdCart);
    var oCartTotalToolTop=document.getElementById("idCartTotalToolTop");if(oCartTotalToolTop)oCartTotalToolTop.innerHTML=FCLib$.FormatPreco(currencyProdCart +" "+ subtotalProdCart);   
  }

  function fnCloseBloker(){
    var oBlocker=document.getElementById("Blocker");
    if(oBlocker)oBlocker.style.display="none";
    fnCloseCartDesign();
  }
  
  function fnCloseCartDesign(){
    var oCartDesign=document.getElementById("CartDesign");   
    if(oCartDesign){
      //Esconde carrinho (opção com aninação)
      //oCartDesign.style.display="none";
      //jQuery(oCartDesign).hide(300);
      if(oCartDesign.style.right=="0px")jQuery(oCartDesign).animate({ "right": "-=350px" }, 200 );
    }
    var oBlocker=document.getElementById("Blocker");
    if(oBlocker)oBlocker.style.display="none";
    document.onkeyup=null;
  }

  function fnArredonda(Val,iCasas) {
    iCasas=typeof iCasas!=='undefined'?iCasas:2;
    return +(Math.floor(Val+('e+'+iCasas))+('e-'+iCasas));
  };

  function fnGoCupom(){
    if(confirm("Deseja inserir o código de um cupom de desconto?\n\nCaso tenha um cupom de desconto você será redirecionado para a página onde pode inserir este cupom para obter o desconto.")){top.location.href=FCLib$.uk("url-add-product")+"?#acupom";}
  }

  function fnChangeQtdProd(idProdCart,idProdPed,bMais){
    var oQtdValOri=document.getElementById("QtdVal"+idProdPed);
    if(oQtdValOri){
      var iQtdOri=parseInt(oQtdValOri.innerHTML);
      if(bMais)var iQtd=iQtdOri+1; else var iQtd=iQtdOri-1;
      //Se controla estoque checa quantos tem no produto, caso contrário altera a quantidade direto
      if(FC$.StockControl)FCLib$.fnAjaxExecFC(FCLib$.uk("url-product-info"),"idprod="+ idProdCart +"&format=1",false,fnChangeQtdProdStock,idProdPed,iQtd,iQtdOri);
      else fnChangeQtdProdExec(idProdPed,iQtd);
    }
  }

  function fnChangeQtdProdStock(oHTTP,idProdPed,iQtdSolic,iQtdOri){
    var sMsgErr="";
    var iQtdProd=null;
    var sHTTP=oHTTP.responseText;
    var bLeuEstoque=false;
    if(sHTTP!=""){
      var oJSON=null;
      try{oJSON=JSON.parse(sHTTP);}
      catch(e){console.log("invalid JSON from /infoprod");}
      if(oJSON){iQtdProd=oJSON.qtd;bLeuEstoque=(iQtdProd!=undefined);}
    }
    else{console.log("blank response from /infoprod");}
    //console.log("bLeuEstoque:"+bLeuEstoque);
    if(bLeuEstoque){
      if(iQtdProd<iQtdOri){
        iQtdSolic=iQtdProd; //se a qtd original é maior que a qtd em estoque, a quantidade solicitada é a qtd do produto
        if(iQtdSolic==0){sMsgErr="O produto foi removido do carrinho pois não temos mais em estoque";}
        else {sMsgErr="A quantidade foi alterada para a quantidade máxima em estoque disponível nesse momento: "+ iQtdProd;}
      }
    }
    else{
      iQtdProd=iQtdSolic; //se não consegue ler estoque do produto, usa o estoque solicitado
    }
    if(iQtdSolic<=iQtdProd)fnChangeQtdProdExec(idProdPed,iQtdSolic); else sMsgErr="Infelizmente não temos "+ iQtdSolic +" unidades em estoque";
    if(sMsgErr!="")alert(sMsgErr);
  }

  function fnChangeQtdProdExec(idProdPed,iQtdSolic){
    fnInsertLoading(idProdPed);
    if(iQtdSolic==0)var sMsg="Produto removido"; else var sMsg="Quantidade alterada";
    AjaxExecFC(FCLib$.uk("url-recalculate"),"q"+ idProdPed +"="+iQtdSolic,false,fnShowCartCheckout,0,sMsg); 
  }

  function fnRemoveProd(idProdPed){
    fnInsertLoading(idProdPed);
    AjaxExecFC(FCLib$.uk("url-recalculate"),"q"+ idProdPed +"=0",false,Cart$.fnShowCartCheckout,0,"Produto removido");
  }

  function fnInsertLoading(idProdPed){
    var oObj=document.getElementById("DivItem"+idProdPed);
    var sH="112";//altura padrão
    var sM="28";//margin top padrão
    var iHeight=oObj.offsetHeight;
    if(iHeight && iHeight>0){sH=iHeight-1;sM=((iHeight-50)/2);}
    if(oObj)oObj.innerHTML="<div style='width:100%;height:"+ sH +"px;text-align:center;'><img style='margin-top:"+ sM +"px;' src=/images/loading_ajax.gif></div>"
  }

  function fnGetCEP(iValorCesta){
    //Se já tem CEP em cookie já mostra cálculo
    var sNumCEP=FCLib$.GetCookie("CEP"+FC$.IDLoja);
    if(sNumCEP && sNumCEP!=""){
      document.getElementById("idZipC").value=sNumCEP;
      fnGetShippingValueCart(iValorCesta);
    }
  }
   
  function fnGetShippingValueCart(iValorCesta){
    var sCEP=document.getElementById("idZipC").value;
    FCLib$.SetCookie("CEP"+FC$.IDLoja,sCEP);
    if(sCEP==""){document.getElementById("idShippingValue").innerHTML="<span style=color:#990000;>CEP inválido</span>";}
    else{
      document.getElementById("idShippingValue").innerHTML="";
      var oImgLoadingCEP=document.getElementById("idImgLoadingCEP");
      if(oImgLoadingCEP){oImgLoadingCEP.style.display="";}
      AjaxExecFC(FCLib$.uk("url-xml-shipping-cep"),"cep="+ sCEP,false,fnProcessXMLCEPCart,iValorCesta);
    }
  }
  
  function fnProcessXMLCEPCart(obj,iValorCesta){
    var oShippingObs=document.getElementById("idShippingObs");
    var oShippingValue=document.getElementById("idShippingValue");
    var iErr=ReadXMLNode(obj,"err");if(iErr==null)return;
    if(iErr!="0"){
      var oImgLoadingCEP=document.getElementById("idImgLoadingCEP");
      if(oImgLoadingCEP){oImgLoadingCEP.style.display="none";}
      oShippingValue.innerHTML="<span id=idErrXMLCEPFC style=color:#990000;>"+ ReadXMLNode(obj,"msg") +"</span>";
      return;
    }
    oShippingObs.innerHTML="";
    oShippingValue.innerHTML="";
    var OptName=ReadXMLNode(obj,"Opt1Name");
    var OptValue=ReadXMLNode(obj,"Opt1Value");
    var OptObs=ReadXMLNode(obj,"Opt1Obs");
    //oShippingObs.innerHTML="<b>"+ OptName +"</b><br><span class=ObsFreightCalc>"+ OptObs +"</span>"; //Insere observações
    oShippingValue.innerHTML=OptValue;
    oShippingValue.style.display="block";
    var oImgLoadingCEP=document.getElementById("idImgLoadingCEP");
    if(oImgLoadingCEP){oImgLoadingCEP.style.display="none";}
    //Remove elementos    
    var oFCCartTotalCalc=document.getElementById("FCCartTotalCalc");
    if(oFCCartTotalCalc){oFCCartTotalCalc.parentNode.removeChild(oFCCartTotalCalc);}
    var oFCCartTotalParcCalc=document.getElementById("FCCartTotalParcCalc");
    if(oFCCartTotalParcCalc){oFCCartTotalParcCalc.parentNode.removeChild(oFCCartTotalParcCalc);}
    //Exibe total com frete
    var iValFrete=OptValue.replace("R$ ","").replace(",",".");
    iValorCesta=iValorCesta.replace(".","").replace(",",".");
    var iTotalCesta=parseFloat(iValorCesta)+parseFloat(iValFrete);
    //Insere totais na tabela principal
    var oLocalInsert=document.getElementById("FCCartTotalFreight");
    if(oLocalInsert){
      var oNewElement=document.createElement("div");
      oNewElement.setAttribute("id","FCCartTotalCalc");
      oNewElement.innerHTML="<div class='CartDesign-totalcart-container'><div class='TotalFProdCart'>Total a pagar:</div><div class='TotalFProdCartValor'>&nbsp;&nbsp;"+ FormatPrice(iTotalCesta,FC$.Currency) +"</div></div>";
      fnInsertAfter(oNewElement,oLocalInsert);
    }
    //insere parcelamento na tabela principal
    var oLocalInsert=document.getElementById("FCCartTotalCalc");
    if(oLocalInsert){
      var oNewElement=document.createElement("tr");
      oNewElement.setAttribute("id","FCCartTotalParcCalc");
      if(document.getElementById("idColPesoFC"))var sColspan="5"; else var sColspan="4";
      oNewElement.innerHTML="<td colspan=5 align=right class=ParcProdCart>"+ fnMontaMaxParcelaCart(iTotalCesta) +"</td>";
      fnInsertAfter(oNewElement,oLocalInsert);
    }
  }

  function fnMontaMaxParcelaCart(Valor){
    return("Em até 10x de "+ FormatPrecoReais(CalculaParcelaJurosCompostos(Valor,10)));
  }

  return{
    fnShowCartCheckout:fnShowCartCheckout,
    fnRemoveProd:fnRemoveProd,
    fnGetShippingValueCart:fnGetShippingValueCart,
    fnCloseCartDesign:fnCloseCartDesign,
    fnChangeQtdProd:fnChangeQtdProd,
    fnGoCupom:fnGoCupom
  }

})();