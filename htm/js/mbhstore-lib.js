// Template Fastcommerce [08/2016]
'use strict'

var iNextPageButFC=1;
var iQtdProds=0;
var iItensCesta=0;
var iDescontoAvista=0;
ImgLoadingFC=FC$.PathImg+"loading.gif?cccfc=1";
ImgOnError=FC$.PathImg+"nd";

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

  //Função para mostrar valor economizado em produtos em promoção
  function fnShowEconomy(ProdPrice,ProdPriceOri){
    if(ProdPrice!=ProdPriceOri)document.write("<span class=FCfnShowEconomy>Economize <b>"+FormatPrice(ProdPriceOri-ProdPrice,FC$.Currency)+"</b> ("+fnFormatNumber(((ProdPriceOri-ProdPrice)/ProdPriceOri)*100)+"%)</span>");
  }
  
  function fnFormatNumber(num){
    num=num.toString().replace(/\$|\,/g,'');
    if(isNaN(num))num="0";
    var sign=(num==(num=Math.abs(num)));
    num=Math.floor(num*100+0.50000000001);
    num=Math.floor(num/100).toString();
    for(var i=0;i<Math.floor((num.length-(1+i))/3);i++)num=num.substring(0,num.length-(4*i+3))+'.'+num.substring(num.length-(4*i+3));
    return ((sign)?'':'-')+num;
  }
  
  function fnLogout(){
    if(FC$.ClientID!=0){
      var oLinkLogin=fnGetID("idLinkLoginFC");
      if(oLinkLogin){
        oLinkLogin.innerHTML="&bull; Logout";
        oLinkLogin.href=FCLib$.uk("url-register")+"?logoff=true";
      }
    }
  }

  var iPL=0;
  
  function fnShowPrice(Price,OriginalPrice,Cod,iMaxParcels,ProductID){
    iPL++;
    //console.log(ProductID+ " iPL="+ iPL +" Price="+Price +" OriginalPrice="+ OriginalPrice +" Cod="+ Cod);
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

  }

  function fnShowParcels(Price,iMaxParcels,ProductID){
    var idParcelsProd=fnGetID("idProdParcels"+ProductID);
    var sPrice="";
    var sInterest;
    if(typeof Juros!="undefined"){
      if(iMaxParcels==0||iMaxParcels>Juros.length)iMaxParcels=Juros.length;
      if(Juros[iMaxParcels-1]>0)sInterest=""; else sInterest=" sem juros";
    }
    else{
      iMaxParcels=0;
    }
    if(iMaxParcels>1 && Price>=1)sPrice+="<div class=\"installments\">ou <strong><span class=\"installment-count\">"+ iMaxParcels +"</span>x</strong> de <strong><span class=\"installment-price\">"+FormatPrice(CalculaParcelaJurosCompostos(Price,iMaxParcels),FC$.Currency)+"</span></strong>"+ sInterest +"</div>";
    if(idParcelsProd)idParcelsProd.innerHTML=sPrice;
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
    else var oContentHTML=document.getElementById("idShareHeader");
    if(oContentHTML)var aImgsShare=oContentHTML.getElementsByTagName('img');
    if(aImgsShare)
      for(var i=0;i<aImgsShare.length;i++){
        if(aImgsShare[i].className=='EstImgShareFacebook'){
          aImgsShare[i].setAttribute('data-src',FC$.PathImg +'iconprodfacebook.svg?cccfc=1');
          aImgsShare[i].src=FC$.PathImg +'iconprodfacebook.svg?cccfc=1';
        }
        else if(aImgsShare[i].className=='EstImgShareTwitter'){
          aImgsShare[i].setAttribute('data-src',FC$.PathImg +'twitter.svg?cccfc=1');
          aImgsShare[i].src=FC$.PathImg+ 'twitter.svg?cccfc=1';
        }
        else if(aImgsShare[i].className=='EstImgShareGooglePlus'){
          aImgsShare[i].setAttribute('data-src',FC$.PathImg +'gplus.svg?cccfc=1');
          aImgsShare[i].src=FC$.PathImg+ 'gplus.svg?cccfc=1';
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
      var oXML=oHTTP.responseXML;
      var oCarts=oXML.getElementsByTagName("cart");
      try{var currencyProdCart=(oCarts[0].getElementsByTagName("currency")[0].childNodes[0].nodeValue);}catch(e){currencyProdCart=FC$.Currency}
      try{var TotalQtyProdCart=(oCarts[0].getElementsByTagName("TotalQty")[0].childNodes[0].nodeValue);}catch(e){TotalQtyProdCart="0"}
      try{var subtotalProdCart=(oCarts[0].getElementsByTagName("subtotal")[0].childNodes[0].nodeValue);}catch(e){subtotalProdCart="0,00"}
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
      if(sBar!=""){sPageHistory+="<div class='row FullDoubleSpaceFC'></div><div class='FooterSepFC col-xlarge-12'></div><div id='idDivPageHistory'><div id='idPageHistoryFC'><div id='idTitPageHistory'><h2 class='GlobalTitleSepBG GlobalTitleSepDoubleLine'><span class='GlobalTitleSizeSep'>PÁGINAS VISITADAS</span></h2></div><ul id='idListPageHistoryFC'>";} 
      for (i=0;i<oHistoryPages.length;i++){
        sTitleProd=oHistoryPages[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
        sLinkProd=oHistoryPages[i].getElementsByTagName("link")[0].childNodes[0].nodeValue;
        try{sImageProd=oHistoryPages[i].getElementsByTagName("image")[0].childNodes[0].nodeValue;}
        catch(e){sImageProd=FC$.PathImg+"nd0.gif";}
        try{sPriceProd=(oHistoryPages[i].getElementsByTagName("price")[0].childNodes[0].nodeValue);}
        catch(e){sPriceProd="";}
        sTitleProd=sTitleProd.substring(0,20);
        sPageHistory+="<li>";
        sPageHistory+="<div class='EstImagePageHistory'><a href='"+ sLinkProd +"'><img src='"+ sImageProd +"'  title='"+ sTitleProd +"' border=0 class=EstFotoPageHistory onError=MostraImgOnError(this,0)></a></div>";
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
  
  function fnLoginUserName(NameUser,PicUser){
    var oImgGlobalSign=document.getElementById("idImgGlobalSignFC");
    if(NameUser==""){
      jQuery('.loginInfo').html("<span class='col-small-12'>Olá, <b>visitante</b></span> <br> <span class='col-small-12 HeaderSolcialLoginDoit'>Faça seu <a href='"+ FCLib$.uk("url-register") +"?pp=3&passo=1&sit=1'><b>Login</b></a></span>");
      if(oImgGlobalSign){oImgGlobalSign.style.display="";}
    }
    else{
      jQuery('.loginInfo').html("<span class='col-small-12'>Olá, <b>"+NameUser+"</b>,</span> <span class='col-small-12'><a href='#Logout' onclick=FCLib$.fnClientLogout('',sF$.fnCliLogout)><span class='HeaderSocialLoginLogout'>(sair)</span></a></span>");
      if(oImgGlobalSign){oImgGlobalSign.style.display="none";}
    }
    var oFoto=document.getElementById("UserImage");
    if(oFoto){
      if(PicUser==undefined || PicUser==""){oFoto.src=FC$.PathImg+"iconusermobile.svg";}
      else{oFoto.src=PicUser;}   
    } 
  }

  function fnCliLogout(obj,sPag){
    sF$.fnLoginUserName("","");
    FC$.ClientID==0;
    fnShowGlobalSignin();
  }
  
  function fnMostraDescontoHome(PrecoProd){
    if(PrecoProd==0 || iDescontoAvista==0)return;
    document.write("<p class=PriceAVistaProdLista>à vista <b>"+FormatPrice(PrecoProd*((100-iDescontoAvista)/100),FC$.Currency)+"</b></p>");
  }  

  function fnMostraDescontoProdLista(PrecoProd){
    if(PrecoProd==0 || iDescontoAvista==0)return;
    document.write("<p class=PriceAVistaProdLista>à vista <b>"+FormatPrice(PrecoProd*((100-iDescontoAvista)/100),FC$.Currency)+"</b></p>");
  }
  
  function fnMostraDescontoProdDet(PrecoProd){
    if(PrecoProd==0 || iDescontoAvista==0)return;
    document.getElementById("idPriceAVista").innerHTML="<div id='PriceAVista'><p>Para pagamentos à vista ganhe <b>"+ iDescontoAvista +"% de desconto</b>.</p><p>Valor com desconto <b>"+FormatPrice(PrecoProd*((100-iDescontoAvista)/100),FC$.Currency)+"</b></p></div>";
  }

  //Mostra estrelas de avaliação do produto
  function reviewProd(IDProd,ReviewQtd,ReviewMedia){
    var innerReview = document.querySelector("#RateProd"+IDProd);
    if(ReviewQtd>0){
      innerReview.innerHTML = "<table><tr><td>"+ReviewMedia+"</td><td></td></tr></table>";}else{innerReview.innerHTML="<table><tbody><tr><td><table cellspacing='0' cellpadding='0'><tbody><tr><td class='NotaOpiniaoVazio'></td><td class='NotaOpiniaoVazio'></td><td class='NotaOpiniaoVazio'></td><td class='NotaOpiniaoVazio'></td><td class='NotaOpiniaoVazio'></td></tr></tbody></table></td><td></td></tr></tbody></table>";
    }
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

  return{
    sCurrentPage:sCurrentPage,
    fnGetID:fnGetID,
    fnCustomizeIconsSocialNetworks:fnCustomizeIconsSocialNetworks,
    fnPreloadImages:fnPreloadImages,
    fnShowEconomy:fnShowEconomy,
    fnLogout:fnLogout,
    fnShowPrice:fnShowPrice,
    fnShowParcels:fnShowParcels,
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
    fnLoginUserName:fnLoginUserName,
    fnCliLogout:fnCliLogout,
    reviewProd:reviewProd,
    fnMostraDescontoHome:fnMostraDescontoHome,
    fnMostraDescontoProdLista:fnMostraDescontoProdLista,
    fnMostraDescontoProdDet:fnMostraDescontoProdDet,
    fnStartDictation:fnStartDictation
  }

})();

//Funções para o carrinho
var oDivShowCartOnPage=null;
var iLastCartOnPage=0;

function ShowCartOnPage(IDLoja,iErr,sMsg,sCartText,sCheckoutText,este){
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
       sHTML+="<td valign=middle align=center style=cursor:pointer onclick=top.location.href='/"+ FCLib$.uk("url-add-product") +"'><a href='"+ FCLib$.uk("url-add-product") +"' style='color:#444444;text-decoration:none;font-size:14px;font-weight:bold;'>Ir para o carrinho</a></td>";
       sHTML+="<td align=left><img src='"+ FC$.PathImg +"ampiconclose.svg?cccfc=1' width=20 height=20 hspace=5 style='cursor:pointer;margin-top:10px' onclick=oDivShowCartOnPage.style.visibility='hidden'></td>";
       sHTML+="</tr>";
       sF$.fnUpdateCart(true,false);
     }
     else{
       sHTML+="<tr height=25>";
       sHTML+="<td colspan=2 align=center><img src='"+ FC$.PathImg +"ampiconclose.svg?cccfc=1' width=20 height=20 hspace=5 style='cursor:pointer;margin:10px;' onclick=oDivShowCartOnPage.style.visibility='hidden'></td>";
       sHTML+="</tr>";
     }
     sHTML+="</table>";
  oDivShowCartOnPage.style.top=oPos.y+"px";
  oDivShowCartOnPage.style.left=oPos.x+"px";
  oDivShowCartOnPage.innerHTML=sHTML;
  oDivShowCartOnPage.style.visibility="visible";
  iLastCartOnPage++;
  setTimeout("if(iLastCartOnPage=="+ iLastCartOnPage +")oDivShowCartOnPage.style.visibility='hidden';",400000);
}

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
    return "<br><span class=EstParc> ou <b>"+MaxParcelas+"x</b>"+ComSem+" de <b class=EstParcPrice>"+FormatPrice(CalculaParcelaJurosCompostos(PrecoProd,MaxParcelas),FC$.Currency)+"</b></span>";
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
    return "<div class='GlobalSavePrice'>Economize <b>"+ FormatPrice(ProdPriceOri-ProdPrice,FC$.Currency) +"</b> ("+ FormatNumber(((ProdPriceOri-ProdPrice)/ProdPriceOri)*100)+"%)</div>";
  }else{return "";}
}

// ZipCode Grid FC - CEP - Begin 
function fnShowCEPGrid(IDProd){
  if(FC$.TypeFrt==3){
    var sNumCEP=fnGetCookie('CEP'+FC$.IDLoja);
    if(sNumCEP==null)sNumCEP="";
    var sCEP="<div id='idDivCEPFC'>";
    sCEP+="  <div id='idDivTitCEP'><img src='"+ FC$.PathImg +"ampiconziptruck.svg?cccfc=1' width='25' height='25' alt='Zip box' /><span>Simule o valor do frete</span></div>";
    sCEP+="  <div id='idDivContentCEP'>";
    sCEP+="    <div id='idDivContentFieldsCEP'>";
    sCEP+="      <div id='idDivCEPCalc'>";
    sCEP+="        <div class='FieldCEP FieldCEPQty'><label>Qtd.</label><input type='number' id='idQtdZip"+ IDProd +"' value='1' maxlength='4'></div>";
    sCEP+="        <div class='FieldCEP FieldCEPNum'><input type='text' placeholder='CEP' id='idZip"+ IDProd +"' value='"+ sNumCEP +"' maxlength='8' onkeyup='this.value=this.value.replace(/[^\\d]+/g,\"\");if(this.value.length >= 8)document.getElementById(\"idCEPButton\").click()'></div>";
    sCEP+="        <img src='"+ FC$.PathImg +"ampiconnewsletter.svg?cccfc=1' height='29px' id='idCEPButton' class='FieldCEPBtn' onclick='fnGetShippingValuesProdGrid("+ IDProd +")'>";
    sCEP+="      </div>";
    sCEP+="    </div>";
    sCEP+="    <div id='idDivImgLoadingCEPFC'><img src='"+ FC$.PathImg +"mbbloadingcep.gif?cccfc=1' vspace=3 style='display:none;' id=ImgLoadingCEP></div>";
    sCEP+="    <div id='idShippingValues"+ IDProd +"'></div></div>";
    sCEP+="  </div>";
    sCEP+="</div>";
    var oShowCEP=document.getElementById("ShowCEP"+IDProd);
    if(oShowCEP)oShowCEP.innerHTML=sCEP;
  }
}

function fnGetShippingValuesProdGrid(IDProd){
  var sCEP=document.getElementById("idZip"+ IDProd).value;
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
    var sValorFrete=ReadXMLNode(obj,"Opt"+ i +"Value");
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
  var argv=arguments;
  var argc=arguments.length;
  var expires=(argc>2)?argv[2]:null;
  var path=(argc>3)?argv[3]:null;
  var domain=(argc>4)?argv[4]:null;
  var secure=(argc>5)?argv[5]:false;
  document.cookie=name+"="+escape(value)+((expires==null)?"":(";expires=" + expires.toGMTString()))+((path==null)?"":(";path="+path))+((domain==null)?"":(";domain="+domain))+((secure==true)?"; secure":"");
}

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
      sImgs+="<img src='"+ FC$.PathImg +"googleloginmobile.svg' class='GoogleSigninClass' data-loginsuccess='fnLoginShowUserName'>";
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

function fnProgressBarLoading(){
  NProgress.start();
  window.addEventListener("load",function(event){
    NProgress.done();
  });
}

function fnInsertLinkWhatsApp(){
  var sURLCanonical="";
  var oLinkWhatsApp=document.getElementById("idLinkWhatsApp"); 
  if(oLinkWhatsApp){
    var oCanonicalURL=document.querySelector("link[rel='canonical']");
    if(oCanonicalURL)sURLCanonical=oCanonicalURL.href
    oLinkWhatsApp.href="whatsapp://send?text=Veja '"+ document.title +"'. Segue o link: "+ sURLCanonical;
  }
}

var plugins  = function(d){
  'use strict';

  /* Sidebar */
  var btnShow = d.querySelector(".amp-sidebar-btn"),
      btnClose = d.querySelector(".amp-sidebar-btn-close"),
      divSidebar = d.querySelector(".sidebar-container"),
      mask = d.querySelector(".sidebar-mask");      


  var events = {
    show: function(){
      if (typeof d.querySelector(".sidebar-close") != undefined)divSidebar.classList.remove("sidebar-close");
      divSidebar.classList.add("sidebar-open");
      mask.style.display="block";
    },
    close: function(){
      divSidebar.classList.remove("sidebar-open");
      divSidebar.classList.add("sidebar-close");
      mask.style.display="none";
    }
  };

    btnShow.addEventListener('click',events.show,false);
    btnClose.addEventListener('click',events.close,false);
    mask.addEventListener('click',events.close,false);  

  /*Accordion*/
  var elemAccordion = d.querySelectorAll("[accordion]");
  for(var i=0;i<elemAccordion.length;i++){
    var contentAccordion = d.querySelector("[accordion-content]");
    var action = {
      show: function(){
        contentAccordion.classList.toggle("expanded");
      }
    }
    elemAccordion[i].addEventListener('click',action.show,false);
  }
};

var carousel = function(){

  var swipers = {
    home: function(){
    var swiper = new Swiper('.swiper-container', {
        paginationClickable: true,
        slidesPerView: 2,
        spaceBetween: 15,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        centeredSlides: true,
        loop:true,
        preventClicks:true,
        preventClicksPropagation:true,
        breakpoints: {
            1024: {
                slidesPerView: 2,
                spaceBetween: 15
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 15
            },
            640: {
                slidesPerView: 2,
                spaceBetween: 15
            },
            320: {
                slidesPerView: 2,
                spaceBetween: 10
            }
        }
    });
    carousel.swipers.removeLazyLoad();
  },

  listagem: function(){
    var swiperlist  = new Swiper('.swiper-container-prodlist', {
        paginationClickable: true,
        slidesPerView: 1,
        spaceBetween: 15,
        nextButton: '.swiper-button-next',
        loop:false,
        preventClicks:true,
        preventClicksPropagation:true,
        breakpoints: {
            1024: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 1
            },
            640: {
                slidesPerView: 1
            },
            320: {
                slidesPerView: 1
            }
        }
    });
    carousel.swipers.removeLazyLoad();
  },
  
  removeLazyLoad: function(){
    var allElemImg = document.querySelectorAll(".amp-prod-home-img a img");
    for(var i=0; i< allElemImg.length; i++){
      var oImg = allElemImg[i].getAttribute("data-src");
      if(oImg != null){ allElemImg[i].src= oImg;}
    }
  }
}

  return {
    "swipers":swipers
  }

}();

/* Disable Speech Recognition IOS  */
function fnSpeechRecognitionIOS(){
  if (window.hasOwnProperty('webkitSpeechRecognition')) {
    document.getElementById("voiceSearch").style.display="block";
    document.getElementById("voiceSearch").style.position="relative";
    document.getElementById("voiceSearch").style.left="20px";
    document.getElementById("voiceSearch").style.top="8px";    
    document.getElementById("amp-search-btn-size").style.width="75px";
  }else{
    document.getElementById("voiceSearch").style.display="none";
    document.getElementById("voiceSearchMGlass").style.display="block";
    document.getElementById("voiceSearchMGlass").style.position="relative";
    document.getElementById("voiceSearchMGlass").style.left="8px";
    document.getElementById("voiceSearchMGlass").style.top="7px";
    document.getElementById("amp-search-btn-size").style.width="41px";
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
    newDivSpeech.innerHTML="<div id='fc-icon-voice-news'><img src='"+ FC$.PathImg +"icon-speech-news.svg?cccfc=1' class='header-speech-icon' id='voiceSearchNews'  width='30' height='30' alt='Fale'></div>"
    var btnSpeech = newDivSpeech;
    btnSpeech.addEventListener('click', function () {
       fnStartDictationNews();
    });
    var reference = document.getElementById('Procurar');
    reference.parentNode.insertBefore(newDivSpeech, reference);
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
      document.getElementById("voiceSearchNews").style.display="block";
    }else{
      document.getElementById("voiceSearchNews").style.display="none";
      document.getElementById("fc-icon-voice-news").style.display="none";
    }
  }
}