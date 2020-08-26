// Fastcommerce Grid [26.01.2018] v1
var FCGrid$ = function () {
  "use strict";
  var product={}, myOptions={}, aProductList, aProductOnlyOne, aProductListAll=[], aProductOnlyOneAll=[], aDescriptorsPrevious=[], aSettingsAll=[], iGridQtd=0, iGridAtual=0, iGridAnterior=0;

  //optionsigurações internas da funcão
  var settings = {
    descriptorsActive: null, //define os descritores existentes nos produtos [array de produtos, quantidade de descritores]
    descriptorsPrevious: [], //armazena os descritores dos produtos clicados
    pathColorsImg : FC$.PathPrd +"cores/",
    idElementGrid : null
  };

  //Configurações
  var options = {
    autoSelect : true,
    cartOnPage : true,
    shippingUpdate : false,
    incMultGrid : false,
    separadorRGBCor : '|',
    qtyDescriptors : 2,
    htmlFlagChecked : '<i class="FCCheckedGrid"></i>',
    imageProduct : 'cor',
    colorName : false,
    colorImg : false,
    btnAnimation : true,
    colorImgFormat : '.gif',
    stock: false,
    btnSelectImg : 'botselecionegrid.svg?cccfc=1',
    btnBuyImg : 'botcarrinho.svg?cccfc=1',
    btnAddedImg : 'botadded.svg?cccfc=1',
    btnContactUSImg : 'botconsultegrid.svg?cccfc=1',
    btnSoldOut : 'botcarrinhoesgotado.svg?cccfc=1',
    textGrid : 'Selecione as opções abaixo',
    order : ['cor', 'adicional1', 'adicional2', 'adicional3', 'adicionalD1', 'adicionalD2', 'adicionalD3'],
    nameDescriptor : {
      cor : 'Cor',
      adicional1 : 'Descritor 1',
      adicional2 : 'Descritor 2',
      adicional3 : 'Descritor 3',
      adicionalD1 : 'Descritor 4',
      adicionalD2 : 'Descritor 5',
      adicionalD3 : 'Descritor 6'
    },
    textDescriptor : {
      cor : 'Selecione',
      adicional1 : 'Selecione',
      adicional2 : 'Selecione',
      adicional3 : 'Selecione',
      adicionalD1 : 'Selecione',
      adicionalD2 : 'Selecione',
      adicionalD3 : 'Selecione'
    }
  };

  //Fn auxiliares Grid_FC:begin
  var fn = {
    eliminateDuplicates: function(arr){
      var i, len=arr.length, out=[], obj={}; for(i=0;i<len;i++){obj[arr[i]]=0;} for(i in obj){out.push(i);} return out;
    },

    //retorna [] o valor de um determinado descritor, ex. tamanho [ 'P', 'M', 'G' ]
    getDescriptorValueProducts: function(obj, value){
      var results=[];
      for(var i=0; i< obj.length; i++){ var prd = JSON.parse(obj[i]); results.push(prd[value]) ;}
      return results;
    },

    removeClass: function(elementHTML, classNameRemove){
      var rxp = new RegExp( "\\s?\\b"+classNameRemove+"\\b", "g" );
      if(typeof elementHTML.length != 'undefined' &&  typeof elementHTML.item != 'undefined' && typeof elementHTML === 'object'){
        for(var i=0; i< elementHTML.length; i++){
          var objClass=elementHTML[i];
          objClass.className = objClass.className.replace( rxp, '' );
        }
      }else if(elementHTML && typeof elementHTML.length == 'undefined'){
        elementHTML.className = elementHTML.className.replace( rxp, '' );
      }
    },

    addClass: function(elementHTML, classNameAdd){
      elementHTML.className += " " + classNameAdd.replace(/^\s+|\s+$/g,"");
    },

    hasClass: function(elementHTML, classNameHas){
      var has = true, names = String(classNameHas).replace(/^\s+|\s+$/g, '').split(/\s+/);
      for(var i = 0, len = names.length; i < len; i++){
        if(!(elementHTML.className.search(new RegExp('(?:\\s+|^)' + names[i] + '(?:\\s+|$)', 'i')) > -1)) {
          has = false;
          break;
        }
      }
      return has;
    },

    getColor: function(a){
      var name = a.slice(0,a.indexOf( options.separadorRGBCor )), rgb = a.slice(a.indexOf( options.separadorRGBCor )+1, a.length);
      return{
        name:name,
        rgb:rgb
      };
    },

    //verifica se o descritor está disponível
    productAvailableFlag: function(oProd, iNivelAtual){
      var sFlag = {'htmlLabel': '', 'classLabel': ''};
      if(oProd!==null){
        var bNivelAtualDisp = parseInt(iNivelAtual)+1 == (settings.descriptorsActive.length-1) ? true : false; //pega o último nível
        if(oProd.length==1 || bNivelAtualDisp){
          var oProdParse = oProd, fPriceDisp = parseFloat(oProdParse.priceNum), iEstoqueDisp = parseInt(oProdParse.estoque), sContentText="";
          if(iEstoqueDisp===0){ sContentText="x"; }else{ if(iEstoqueDisp>0 && fPriceDisp===0){ sContentText="!";}}
          if(sContentText!==""){
            sFlag.htmlLabel="<b class=\"FCFlagEsgotadoGrid\">"+ sContentText +"</b>";
            sFlag.classLabel="FCSoldOutLabel";
          }
        }
      }
      return sFlag;
    },

    getImageProd: function(aProductList, descriptorImg, iNivelAtual){
      for(var i=0; i< aProductList.length; i++){
        var oProd = JSON.parse(aProductList[i]);
        if(oProd[settings.descriptorsActive[iNivelAtual]] == descriptorImg){
          return {'imgDet': oProd.imgDet , 'imgAmp': oProd.imgAmp};
        }
      }
    },

    //Define descritores existentes
    setActiveDescriptors: function(aPrdListDescr, qtyDescriptors){
      var results = [], idProdutoSemDescritor="";
      for(var i=0; i< qtyDescriptors; i++){
        var iCont=aPrdListDescr.length;
        for(var j=0; j < aPrdListDescr.length;j++){
          var oProd = JSON.parse(aPrdListDescr[j]), sDescritor=oProd[options.order[i]];
          if(sDescritor===undefined || sDescritor===""){ iCont--; idProdutoSemDescritor=oProd.IDProduto;} //tratar erro quando faltar um descritor no produto
        }
        if(iCont==aPrdListDescr.length){results.push(options.order[i]);}
        else if(iCont!==aPrdListDescr.length && iCont>0){
          fn.consoleLogFC({'FC_Log_Grid_v1' : 'produto com descritor ausente', 'descritor' : options.order[i] + ' ('+ options.nameDescriptor[options.order[i]] +')', 'IDProduto' : idProdutoSemDescritor });
          document.getElementById( settings.idElementGrid ).innerHTML="<span>Existe um ou mais produtos com descritores ausentes!</span>";
          return false;
        }
      }
      return results;
    },

    setAttrProduct: function(arr){
      if(typeof arr === "object" && arr !== null){
        product.IDProduto=arr.IDProduto;
        product.IDProdutoPai=arr.IDProdutoPai;
        product.cor=arr.cor;
        product.codProd=arr.codProd;
        product.estoque=arr.estoque;
        product.peso=arr.peso;
        product.priceOri=arr.priceOri;
        product.priceNum=arr.priceNum;
        product.maxInstallmentsNum=arr.maxInstallmentsNum;
        product.adicional1=arr.adicional1;
        product.adicional2=arr.adicional2;
        product.adicional3=arr.adicional3;
        product.adicionalD1=arr.adicionalD1;
        product.adicionalD2=arr.adicionalD2;
        product.adicionalD3=arr.adicionalD3;
        product.imgDet=arr.imgDet;
        product.imgAmp=arr.imgAmp;
      }else{ fn.consoleLogFC({'FC_Log_Grid_v1' : 'json do subproduto inválido'}); }
    },

    magicZoomFC: function(id, novoArray, novoArrayAmp, FC_MaxImages, refreshZoom){

      var imgDetMini="", imgAmpMini="", sHtmlZoom="";
      var sNameProd = fn.getNameProduct();
      for (var i=0;i<=FC_MaxImages;i++)
      {
        if(i===0)
        {
          imgDetMini=novoArray[i];
          imgAmpMini=novoArrayAmp[i];
          sHtmlZoom+="<div class='fc-DivGridImg-Big'><a href="+imgAmpMini+" class=MagicZoomPlus id=zoom2 rel=\"selectors-class:active; zoom-width:350px; zoom-height:350px; selectors-change:mouseover;\"><img src="+ imgDetMini +" alt='"+sNameProd+"'></a></div>"
                    +"<div class='fc-DivGridImg-Small1'><a href=\""+imgAmpMini+"\"  rel=\"zoom-id:zoom2;\" rev=\""+ imgDetMini +"\"><img src=\""+ imgDetMini +"\" alt='"+sNameProd+"' width=65 height=65 class=ZoomIMG2></a></div>";
        }
        else{

          if(novoArray[i].indexOf('#')>=0){
            imgDetMini=novoArray[i].replace('#',FC$.PathPrdExt);
            imgAmpMini=novoArrayAmp[i].replace('#',FC$.PathPrdExt);
          }else{
            imgDetMini=FC$.PathPrd+novoArray[i];
            imgAmpMini=FC$.PathPrd+novoArrayAmp[i];
          }
          sHtmlZoom+="<div class='fc-DivGridImg-Small2'><a href="+imgAmpMini+" rel='zoom-id:zoom2;' rev="+ imgDetMini +"><img src="+ imgDetMini +" alt='"+sNameProd+"' width=65 height=65 class=ZoomIMG2></a></div>";
        }
      }
      document.getElementById(id).innerHTML=sHtmlZoom;

      setTimeout(function(){
        var mgZoomId = document.querySelector('#zoom2');
        mgZoomId.setAttribute('title',sNameProd);
        if(refreshZoom)MagicZoomPlus.refresh();
      },700);
    },

    imgView: function(srcImgDet, srcImgAmp, refreshZoom){
      var imgDetAll = srcImgDet;
      var imgAmpAll = srcImgAmp;
      var novoArray = imgDetAll.split(',');
      var novoArrayAmp = imgAmpAll.split(',');
      var CountImgDet=novoArray.length;
      var CountImgAmp=novoArrayAmp.length;

      if (imgDetAll==="" || imgAmpAll===""){
        //fn.consoleLogFC({'FC_Log_Grid_v1' : 'subproduto sem imagem cadastrada'});

        return "";
      }
      else{
        if(CountImgDet==CountImgAmp){var FC_MaxImages=CountImgDet-1;}else{var FC_MaxImages=0;}
        if(document.getElementById('idDivGridImg'))return this.magicZoomFC('idDivGridImg', novoArray, novoArrayAmp, FC_MaxImages, refreshZoom);
        else{

          if(iGridAtual>0 && novoArray[0]){
            var IDProdutoPai=JSON.parse(aProductListAll[iGridAtual-1][0]).IDProdutoPai;
            var oImgPai=document.querySelector("#id-video-image"+ IDProdutoPai +" img");
            if(oImgPai)oImgPai.src=novoArray[0];
          }
        }
      }
    },

    isSingleDescriptor: function(){
      if(settings.descriptorsActive.length==1){return true;}else{return false;}
    },

    marge: function(obj1,obj2){
      var result={}, name; for(name in obj1) result[name]=obj1[name]; for(name in obj2) result[name]=obj2[name]; return result;
    },

    popupSoldOutProduct: function(params){
      return new MostraDispCaptcha(FC$.IDLoja, product.IDProduto); //Função para popup de aviso de disponibilidade, produto esgotado
    },

    qtyIncFieldDisabled: function(isDisabled, isValueField){
      if(isDisabled){ document.getElementById("idQTIncMultGrid").disabled=true; }else{ document.getElementById("idQTIncMultGrid").disabled=false;}
      if(isValueField){
        if(document.getElementById("idQTIncMultGrid").value===0) document.getElementById("idQTIncMultGrid").value=1;
        var oQtdZip = document.querySelector("[id^='idQtdZip']");
        if(oQtdZip && oQtdZip==0)oQtdZip.value=1;
      }
    },

    consultUsAboutProduct: function(){
      var IDSubProd=product.IDProduto;
      var aNameRGB=product.cor.split(options.separadorRGBCor);
      var sNameColor=aNameRGB[0];
      var sCodeRef=product.codProd;
      if(sCodeRef!=="")sCodeRef="Cod%2E%20refer%EAncia%20"+sCodeRef;

      var sURLConsultUsAbout=FCLib$.uk("url-contact")+'?Assunto=Consulta%20sobre%20o%20produto%20'+ fn.getNameProduct() +'%20(ID%20'+ IDSubProd +')%20'+sCodeRef+'%20%2C';
      if(sNameColor!=='')sURLConsultUsAbout+=' '+ options.nameDescriptor['cor'] +' '+ sNameColor.replace(/\+/g,'%2B') +'%2C';
      if(product.adicional1!=='')sURLConsultUsAbout+=' '+ options.nameDescriptor['adicional1'] +' '+ fn.encodeURI( fn.charCode(product.adicional1) ) +'%2C';
      if(product.adicional2!=='')sURLConsultUsAbout+=' '+ options.nameDescriptor['adicional2'] +' '+ fn.encodeURI( fn.charCode(product.adicional2) ) +'%2C';
      if(product.adicional3!=='')sURLConsultUsAbout+=' '+ options.nameDescriptor['adicional3'] +' '+ fn.encodeURI( fn.charCode(product.adicional3) ) +'%2C';
      if(product.adicionalD1!=='')sURLConsultUsAbout+=' '+ options.nameDescriptor['adicionalD1'] +' '+ fn.encodeURI( fn.charCode(product.adicionalD1) ) +'%2C';
      if(product.adicionalD2!=='')sURLConsultUsAbout+=' '+ options.nameDescriptor['adicionalD2'] +' '+ fn.encodeURI( fn.charCode(product.adicionalD2) ) +'%2C';
      if(product.adicionalD3!=='')sURLConsultUsAbout+=' '+ options.nameDescriptor['adicionalD3'] +' '+ fn.encodeURI( fn.charCode(product.adicionalD3) ) +'%2C';
      top.location.href=sURLConsultUsAbout;
    },

    setPriceProduct: function(product){

      var oPositionPrice=document.getElementById("idPriceGridFC"+ product.IDProdutoPai);
      if(parseFloat(product.priceNum) > 0 && oPositionPrice){
        var oMaxInstallments = fnMaxInstallmentsGrid(product.priceNum, product.maxInstallmentsNum);
        var oEconomyJS = (typeof fnShowEconomyGrid == 'function') ?  fnShowEconomyGrid(product.priceNum, product.priceOri) : "";
        var oPositionTableDiscount = document.getElementById("idPriceAVista"+ product.IDProduto);
        if (iDescontoAvista && oPositionTableDiscount) { // verifica se existe desconto a vista e sua tabela para apresenta-lo
          if (product.priceNum > 0 || iDescontoAvista > 0) {
            oPositionTableDiscount.innerHTML = "<div class='PriceAVistaProdLista'><p>Para pagamentos à vista ganhe <b>" + iDescontoAvista + "% de desconto</b>.</p><p>Valor com desconto <b>" + FormatPrice(product.priceNum * ((100 - iDescontoAvista) / 100), FC$.Currency) + "</b></p></div>";
          }
        }
        sF$.fnMostraDescontoProdDet(product.priceNum);
        if(product.priceNum!=product.priceOri){
           return oPositionPrice.innerHTML="<span class=oldPrice style=\"text-decoration: line-through;\">"+FCLib$.FormatPreco(FormatPrice(product.priceOri,FC$.Currency))+"</span> <b>"+FCLib$.FormatPreco(FormatPrice(product.priceNum,FC$.Currency))+"</b> " + oMaxInstallments + oEconomyJS;
         }
         else{
           return oPositionPrice.innerHTML="<b>"+FCLib$.FormatPreco(FormatPrice(product.priceNum,FC$.Currency))+"</b> "+ oMaxInstallments;
         }
      }else{
        document.getElementById("idPriceAVista").innerHTML="";
        return oPositionPrice.innerHTML="Preço sob consulta";
       }

    },

    setCodeProduct: function(){
      var oPositionCode=document.getElementById("idCodProdGrid");
      if(oPositionCode && product.codProd !== "") oPositionCode.innerHTML=product.codProd;
    },

    availableBuyProduct: function(product, sParamsGrid){
      var oBtnComprar=document.createElement("div");
      oBtnComprar.setAttribute("data-grid",iGridQtd);
      if(!product){
        oBtnComprar.setAttribute("class", "FCBtnGrid FCBtnSelectedOption FCBtnSelecioneGrid FCBtnSelecioneGridPosition");
        oBtnComprar.innerHTML="<img src=\""+ FC$.PathImg + options.btnSelectImg +"\">"
                             +"<div class=\"FCTooltipGrid Off\" id=idTooltipGridFC"+ iGridQtd +" style=\"display:\">Selecione primeiro as opções do produto</div>";
        oBtnComprar.onclick=function(a){
          iGridAtual=this.getAttribute("data-grid");
          if( fn.hasClass(document.getElementById("idTooltipGridFC"+ iGridAtual), "Off")){
            fn.removeClass(document.getElementById("idTooltipGridFC"+ iGridAtual), "Off");
            fn.addClass(document.getElementById("idTooltipGridFC"+ iGridAtual), "On");
          }else{
            fn.removeClass(document.getElementById("idTooltipGridFC"+ iGridAtual), "On");
            fn.addClass(document.getElementById("idTooltipGridFC"+ iGridAtual), "Off");
          }
          var oTooltip=document.getElementById("idTooltipGridFC"+ iGridAtual).style.display;
        };
      }
      else{
        if(parseInt(product.estoque)===0){
          oBtnComprar.setAttribute("class", "FCBtnGrid FCBtnEsgotadoGrid");
          oBtnComprar.innerHTML="<img src=\""+ FC$.PathImg + options.btnSoldOut +"\" />";
          oBtnComprar.onclick=function(){
            fn.popupSoldOutProduct(sParamsGrid);
          };
          if(options.incMultGrid)fn.qtyIncFieldDisabled(true, false);
          fn.getShippingView(false); //simulação de frete
        }
        else if(parseInt(product.estoque)>0 && parseFloat(product.priceNum) === 0){
          oBtnComprar.setAttribute("class", "FCBtnGrid FCBtnConsultenos");
          oBtnComprar.innerHTML="<img src=\""+ FC$.PathImg + options.btnContactUSImg +"\">";
          oBtnComprar.onclick=function(){
            fn.consultUsAboutProduct(sParamsGrid);
          };
          if(options.incMultGrid)fn.qtyIncFieldDisabled(true, false);
          fn.getShippingView(false); //simulação de frete
        }
        else{
          oBtnComprar.setAttribute("class", "FCBtnGrid FCBtnComprarGrid");
          oBtnComprar.setAttribute("id","cartBtnImg_"+ iGridQtd)
          oBtnComprar.innerHTML="<img src=\""+ FC$.PathImg + options.btnBuyImg +"\" alt=\"Clique para adicionar ao carrinho\" class=\"btnPulse\">";
          oBtnComprar.onclick=function(obj){
            fnBuyProduct(this);
          };
          fn.getShippingView(true);
          if(options.incMultGrid)fn.qtyIncFieldDisabled(false, true);
        }
      }
      return oBtnComprar;
    },

    srcProduct: function(nivelAtual, descriptorImg, aProductList){
      var iNivelAtual=parseInt(nivelAtual);
      var aDataImagem=fn.getImageProd(aProductList, descriptorImg, iNivelAtual);
      return " data-img-det=\""+aDataImagem.imgDet+"\" data-img-amp=\""+aDataImagem.imgAmp+"\"";
    },

    viewStock: function(iEstoqueDetail, fPriceDetails){
        var sEstoqueDetailOut="";
        if(iEstoqueDetail === 0){sEstoqueDetailOut= "indisponível";}
        else if(fPriceDetails === 0){sEstoqueDetailOut= "sob consulta"}
        else{sEstoqueDetailOut=iEstoqueDetail}
        return "<span class=\"AdicNome\">Quantidade em Estoque:</span> <span class=\"AdicItem\"><b>"+ sEstoqueDetailOut + "</b></span>";
    },

    getDetailsProduct: function(){
      var sHtmlDetails = "";
      for(var i=0; i< settings.descriptorsActive.length; i++){
        var str = settings.descriptorsActive[i];
        if(str.toUpperCase() == 'COR'){
          var aNameRGB=product[settings.descriptorsActive[i]];
          var sNameColor=aNameRGB.split(options.separadorRGBCor);
          var sNomeAdic=sNameColor[0];
        }
        else{
          var sNomeAdic = product[settings.descriptorsActive[i]];
        }
        sHtmlDetails+= "<div class=\"FCGridAdicContent FCGridAdicProductList\"><span class=\"AdicNome\">"+ options.nameDescriptor[settings.descriptorsActive[i]] +":</span><span class=\"AdicItem\">"+ sNomeAdic +"</span></div>";
      }
      //quantidade em estoque
      if(options.stock){
        var iEstoqueDetail = parseInt(product.estoque), fPriceDetails = parseFloat(product.priceNum);
        sHtmlDetails+= "<div class=\"FCGridAdicContent FCGridAdicProductList\">"+ fn.viewStock(iEstoqueDetail, fPriceDetails) +"</div>";
      }
      return sHtmlDetails;
    },

    classDescriptor: function(obj){
      return "FC"+ obj.charAt(0).toUpperCase() + obj.slice(1)+"Grid"; //formata a classe para cada descritor
    },

    charCode: function(obj){
      return obj.replace(/&amp;/g, '&#38;').replace(/&lt;/g, '&#60;').replace(/&gt;/g, '&#62;').replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(n); }); //& < >
    },

    sendPost: function(url, oParams){
      var oForm=document.createElement("form");
      oForm.action=url;
      oForm.method="Post";
      oForm.name="FormMult";

      for(var i=0; i< oParams.length; i++) {
        var oInput=document.createElement("input");
        oInput.type="hidden";
        oInput.name=oParams[i][0];
        oInput.setAttribute("value", oParams[i][1]);
        oForm.appendChild(oInput);
      }
      document.body.appendChild(oForm);
      oForm.submit();
    },

    getNameProduct: function(){
      var oNameProd=document.getElementById('idNameProductGridFC');
      return oNameProd ? oNameProd.innerHTML : "";
    },

    getShippingView: function(isView){

      if(options.shippingUpdate){
        var oButtonShipping = document.getElementById("idCEPButton");
        var oZipField = document.querySelector("[id^='idZip']");
        var oQtdZipField = document.querySelector("[id^='idQtdZip']");
        var oShippingValues = document.querySelector("[id^='idShippingValues']");

        if(oZipField && oShippingValues){
          if(isView){
            oZipField.disabled = false;
            oQtdZipField.disabled = false;
            var iPesoProdSub = product.peso;
            iPesoProdSub = parseFloat(iPesoProdSub.replace(",","."));
            //se o subproduto tem peso 0 é usado o peso do produto pai para a simulação de frete
            if(product.estoque !== "" && iPesoProdSub > 0 || product.estoque !== undefined && iPesoProdSub > 0){
              oZipField.id = "idZip"+ product.IDProduto;
              oQtdZipField.id = "idQtdZip"+ product.IDProduto;
              oShippingValues.id = "idShippingValues"+ product.IDProduto;
              oButtonShipping.onclick = function() {
                fnGetShippingValuesProdGrid(product.IDProduto);
                fn.consoleLogFC({'FC_Log_Grid_v1' : 'simulação de frete para o produto de ID ' + product.IDProduto});
              };
            }else{
              var oProdPai = JSON.parse(aProductOnlyOne);
              oZipField.id = "idZip"+ oProdPai.IDProduto;
              oQtdZipField.id = "idQtdZip"+ oProdPai.IDProduto;
              oShippingValues.id = "idShippingValues" + oProdPai.IDProduto;
              oButtonShipping.onclick = function() {
                fnGetShippingValuesProdGrid(oProdPai.IDProduto);
                fn.consoleLogFC({'FC_Log_Grid_v1' : 'simulação de frete para o produto de ID ' + oProdPai.IDProduto});
              };
            }
          }else{
            oButtonShipping.onclick = function() {
               alert("Selecione um produto disponível primeiro.");
            };
            oZipField.disabled = true;
            oQtdZipField.disabled = true;
          }
        }
      }
    },

    creatInputIncMultQty: function(){
      var oInputIncMult = document.createElement("INPUT");
          oInputIncMult.setAttribute("type", "text");
          oInputIncMult.setAttribute("value", "1");
          oInputIncMult.setAttribute("size", "1");
          oInputIncMult.setAttribute("maxlength", "3");
          oInputIncMult.setAttribute("class", "QTIncMultGrid");
          oInputIncMult.setAttribute("id", "idQTIncMultGrid");
          oInputIncMult.setAttribute("name", "QTIncMultGrid");
          oInputIncMult.disabled=true;
          oInputIncMult.onkeyup=function(obj){fn.validQuantityIncMult(this);};
      return oInputIncMult;
    },

    validQuantityIncMult: function(objHTML){
      var sNumber = objHTML.value.replace(/[^0-9]/g, ""); //remove tudo que é diferente de 0-9
      sNumber = sNumber.replace(/^(0+)(\d)/g, "$2"); //remove zeros a esquerda
      var oQtdZipFieldIncMult = document.querySelector("[id^='idQtdZip']");
      if(sNumber > 0){
        objHTML.value= sNumber.substring(0,3);
        if(oQtdZipFieldIncMult)oQtdZipFieldIncMult.value=sNumber.substring(0,3);
      }else{
        objHTML.value=0;
        if(oQtdZipFieldIncMult)oQtdZipFieldIncMult.value=0;
      }
    },

    convertCharAT: function(aProductsAT){
      var results=[];
      var aDescriptorsList = ["cor", "adicional1", "adicional2", "adicional3", "adicionalD1", "adicionalD2", "adicionalD3"];
      for(var i=0; i< aProductsAT.length; i++ ){
         var oProdAT = JSON.parse(aProductsAT[i]);
         for(var j=0; j < aDescriptorsList.length; j++){
           var sDescriptorAT = oProdAT[aDescriptorsList[j]];
           if( sDescriptorAT !== "") oProdAT[aDescriptorsList[j]] = fn.charCode(sDescriptorAT);
         }
      results.push(JSON.stringify(oProdAT));
      }
      return results;
    },

    encodeURI: function(obj){
      //#$&+-_'.=?@"
      var objReplace = obj.replace(/\&quot;/g,"\"");
      return escape(objReplace).replace(/\"/g,"%22").replace(/\#/g,"%23").replace(/\$/g,"%24").replace(/\&/g,"%26").replace(/\'/g,"%27").replace(/\+/g,"%2B").replace(/\-/g,"%2D").replace(/\./g,"%2E").replace(/\=/g,"%3D").replace(/\?/g,"%3F").replace(/\@/g,"%40").replace(/\_/g,"%5F");
    },

    consoleLogFC: function(obj){
      if (typeof console !== 'undefined')console.log(obj); /* Loga informações do produto */
    }

  };
  //Fn auxiliares Grid_FC:end

  // Realiza animação de pulsar do botão
  function btnAnimation(posBtnComprar) {
    if(options.btnAnimation) {
      posBtnComprar.classList.add('btnFadeOut');
      posBtnComprar.innerHTML = "<img src=\""+ FC$.PathImg + options.btnAddedImg +"\" alt=\"Pronto, produto adicionado!\">";
    }
  };

  function fnSelectsProducts(aProductList, sDescritorAtual, iNivelAtual){
    var results=[];
    var getProd = function (prd){
      if(settings.descriptorsPrevious[-2] !== undefined){
        for(var k=0; k < settings.descriptorsPrevious.length; k++){
          for(var l=0; l< options.order.length ;l++){
            if( prd[options.order[l]] === settings.descriptorsPrevious[k-1]){
              return true;
            }
          }
        }
        return false;
      }else{
        return true;
      }
    };

    for(var i=0; i< aProductList.length; i++){
      var prd = JSON.parse(aProductList[i]);

      if(settings.descriptorsPrevious[iNivelAtual-1] !== undefined){
        var iCont=0;
        var sDescriptorsActiveCharAT=fn.charCode( prd[settings.descriptorsActive[iNivelAtual]] );

        if( sDescriptorsActiveCharAT == sDescritorAtual){
          for(var j=0; j< settings.descriptorsPrevious.length;j++){
            var sDescriptorsActivePreviousCharAT = prd[settings.descriptorsActive[parseInt(iNivelAtual)-(1+j)]];
            if( sDescriptorsActivePreviousCharAT == settings.descriptorsPrevious[iNivelAtual-(1+j)] ){
              if(getProd(prd))iCont++;
            }else{
              iCont=0; break;
            }
          }
          if(iCont>0) results.push(JSON.stringify(prd));
        }
      }else{
        if(prd[settings.descriptorsActive[iNivelAtual]] == sDescritorAtual)results.push(JSON.stringify(prd));
      }
    }
    return results;
  }

  function fnBuyProduct(posBtnComprar){
    var iQtyIncMult=1;
    var iGridClicado=posBtnComprar.parentNode.getAttribute("data-grid");  //obtem iGrid do pai do botão de compra clicado, em produto sem sub
    if(iGridClicado>0)fn.setAttrProduct(JSON.parse(aProductOnlyOneAll[iGridClicado-1]));
    //incMult
    if(options.incMultGrid){
      var iQtyEstoque=product.estoque;
      iQtyIncMult=document.getElementById("idQTIncMultGrid").value;
      if(iQtyIncMult>iQtyEstoque){
        alert("Estoque solicitado maior que o disponível. \n"+ "Estoque disponível no momento ("+ iQtyEstoque +").");
        return document.getElementById("idQTIncMultGrid").focus();
      }
      if(iQtyIncMult==0){
        alert("A quantidade solicitada deve ser igual ou maior que 1.");
        return document.getElementById("idQTIncMultGrid").focus();
      }
    }

    //todos os parâmetros do produto
    var aNameRGB=product.cor.split(options.separadorRGBCor), sNameColor=aNameRGB[0];
    if(options.cartOnPage){
      var IDSubProd=product.IDProduto, sParamsProd='&QTIncMult_'+IDSubProd+'='+iQtyIncMult;
      if(sNameColor!=='')sParamsProd+='&'+(FCLib$.fnUseEHC()?"color":"cor")+'_'+ IDSubProd +'='+ EncodeParamFC(fn.charCode(sNameColor)).replace(/\+/g,'%2B');
      if(product.adicional1!=='')sParamsProd+='&'+ (FCLib$.fnUseEHC()?"a":"adicional") +'1_'+ IDSubProd +'='+ EncodeParamFC(fn.charCode(product.adicional1));
      if(product.adicional2!=='')sParamsProd+='&'+ (FCLib$.fnUseEHC()?"a":"adicional") +'2_'+ IDSubProd +'='+ EncodeParamFC(fn.charCode(product.adicional2));
      if(product.adicional3!=='')sParamsProd+='&'+ (FCLib$.fnUseEHC()?"a":"adicional") +'3_'+ IDSubProd +'='+ EncodeParamFC(fn.charCode(product.adicional3));
      if(product.adicionalD1!=='')sParamsProd+='&'+ (FCLib$.fnUseEHC()?"a":"adicional") +'d1_'+ IDSubProd +'='+ EncodeParamFC(fn.charCode(product.adicionalD1));
      if(product.adicionalD2!=='')sParamsProd+='&'+ (FCLib$.fnUseEHC()?"a":"adicional") +'d2_'+ IDSubProd +'='+ EncodeParamFC(fn.charCode(product.adicionalD2));
      if(product.adicionalD3!=='')sParamsProd+='&'+ (FCLib$.fnUseEHC()?"a":"adicional") +'d3_'+ IDSubProd +'='+ EncodeParamFC(fn.charCode(product.adicionalD3));
      btnAnimation(posBtnComprar);
      AjaxExecFC(FCLib$.uk("url-add-multiple-products"),"xml=1"+sParamsProd,true,processXMLAddMult,FC$.IDLoja,posBtnComprar,sParamsProd);
    }else{

      if(options.incMultGrid){
        var IDSubProd=product.IDProduto, oParams=[];
        oParams.push(['IDProduto', IDSubProd]);
        oParams.push(['QTIncMult_'+IDSubProd, iQtyIncMult]);
        oParams.push(['IDLoja', FC$.IDLoja]);
        oParams.push(['PostMult', true]);

        if(sNameColor!=='')oParams.push([(FCLib$.fnUseEHC()?"color":"cor")+'_'+ IDSubProd, sNameColor]);
        if(product.adicional1!=='')oParams.push([(FCLib$.fnUseEHC()?"a":"adicional")+'1_'+ IDSubProd,fn.charCode(product.adicional1)]);
        if(product.adicional2!=='')oParams.push([(FCLib$.fnUseEHC()?"a":"adicional")+'2_'+ IDSubProd,fn.charCode(product.adicional2)]);
        if(product.adicional3!=='')oParams.push([(FCLib$.fnUseEHC()?"a":"adicional")+'3_'+ IDSubProd,fn.charCode(product.adicional3)]);
        if(product.adicionalD1!=='')oParams.push([(FCLib$.fnUseEHC()?"a":"adicional")+'d1_'+ IDSubProd,fn.charCode(product.adicionalD1)]);
        if(product.adicionalD2!=='')oParams.push([(FCLib$.fnUseEHC()?"a":"adicional")+'d2_'+ IDSubProd,fn.charCode(product.adicionalD2)]);
        if(product.adicionalD3!=='')oParams.push([(FCLib$.fnUseEHC()?"a":"adicional")+'d3_'+ IDSubProd,fn.charCode(product.adicionalD3)]);

        fn.sendPost(FCLib$.uk("url-add-multiple-products"), oParams);

      }else{
        var sURLBuy=FCLib$.uk("url-add-product") +'?'+ (FCLib$.fnUseEHC()?"productid":"idproduto") +'='+ product.IDProduto;
        if(sNameColor!=='')sURLBuy+='&'+ (FCLib$.fnUseEHC()?"color":"cor") +'='+ sNameColor.replace(/\+/g,'%2B');
        if(product.adicional1!=='')sURLBuy+='&'+(FCLib$.fnUseEHC()?"a":"adicional")+'1='+ fn.encodeURI(fn.charCode(product.adicional1));
        if(product.adicional2!=='')sURLBuy+='&'+(FCLib$.fnUseEHC()?"a":"adicional")+'2='+ fn.encodeURI(fn.charCode(product.adicional2));
        if(product.adicional3!=='')sURLBuy+='&'+(FCLib$.fnUseEHC()?"a":"adicional")+'3='+ fn.encodeURI(fn.charCode(product.adicional3));
        if(product.adicionalD1!=='')sURLBuy+='&'+(FCLib$.fnUseEHC()?"a":"adicional")+'d1='+ fn.encodeURI(fn.charCode(product.adicionalD1));
        if(product.adicionalD2!=='')sURLBuy+='&'+(FCLib$.fnUseEHC()?"a":"adicional")+'d2='+ fn.encodeURI(fn.charCode(product.adicionalD2));
        if(product.adicionalD3!=='')sURLBuy+='&'+(FCLib$.fnUseEHC()?"a":"adicional")+'d3='+ fn.encodeURI(fn.charCode(product.adicionalD3));
        top.location.href=sURLBuy;
      }
    }
  }

  function fnSelectForWishlist(oPos){
    if(oPos && FC$.Wishlist==1){
      var oBtnWL=document.createElement("div");
      oBtnWL.setAttribute("class","ProdWLSel");
      oBtnWL.innerHTML="Selecione as opções acima para inserir na lista de desejos.";
      oPos.appendChild(oBtnWL);
    }
  }

  function fnAddToWishlist(oPos,idp){
    if(FC$.Wishlist==1){
      var oBtnWL=document.createElement("div");
      oBtnWL.setAttribute("id","ProdWL"+ idp);
      oBtnWL.setAttribute("class","ProdWL");
      oPos.appendChild(oBtnWL);
      WL$.fnButtonAddToWishlist(idp);
      var el=document.querySelectorAll('.ProdWLSel');
      if(el.length>0){
        for(var i=0; i< el.length;i++){el[i].parentNode.removeChild(el[i]);} //remove texto informando para selecionar opções
      }
    }
  }

  function fnResetWishlist(){
    if(FC$.Wishlist==1){
      var el=document.querySelectorAll('.ProdWL');
      if(el.length>0){
        for(var i=0; i< el.length;i++){el[i].parentNode.removeChild(el[i]);} //remove os botões já existem no html de wishlist
      }
    }
  }

  function fnExistsProduct(IDProduto, descritores, descrAnterior, aProductList){
    var sParms="";
    for(var i=0; i< aProductList.length; i++){
      var prd = JSON.parse(aProductList[i]);
      if(parseInt(prd.IDProduto) === parseInt(IDProduto)){
        sParms= "IDProduto="+ prd.IDProduto;
        for(var j=0; j< descritores.length; j++){
          if(descrAnterior[j] == prd[descritores[j]]){
            if((descritores[j]).toUpperCase() == "COR"){ sParms+= "&"+ descritores[j] +"="+ fn.getColor(descrAnterior[j]).name; }else{ sParms+= "&"+ descritores[j] +"="+ descrAnterior[j]; }
          }
        }
        fn.setAttrProduct(prd); //Seleciona o subproduto e Set na var product
      }
    }

    var oButton=fn.availableBuyProduct(product,sParms); //verificar disponibilidade e cria o botão [comprar/ esgotado/ consulte-nos]
    fn.setPriceProduct(product); //atualiza o valor do produto de acordo com o valor do subproduto
    fn.setCodeProduct(product); //atualza o código de referencia do produto

    var el=document.querySelectorAll('#idButtonBuyFC_'+ iGridAtual +' .FCBtnGrid');
    if(el.length>0)for(var i=0; i< el.length;i++){el[i].parentNode.removeChild(el[i]);} //remove os botões já existem no html

    var oPositionBtn = document.getElementById('idButtonBuyFC_'+ iGridAtual);
    oPositionBtn.appendChild(oButton);
    fnAddToWishlist(oPositionBtn,product.IDProduto);

    //exibe o resumo do produto, descritores e atributos
    var oPositionDetail = document.getElementById('idDetailProduct_'+ iGridAtual);
    var oPositionButtonBuy = document.getElementById('idButtonBuyFC_'+ iGridAtual);

    if(!oPositionDetail){
      var oPositionHtml = document.getElementById(settings.idElementGrid);
      var oNewElement = document.createElement("Div");
          oNewElement.className='FCBoxGrid FCResumeProduct';
          oNewElement.id="idDetailProduct_"+ iGridAtual;
          oNewElement.innerHTML = fn.getDetailsProduct();
      if(oPositionButtonBuy)oPositionButtonBuy.parentNode.insertBefore(oNewElement, oPositionButtonBuy);
    }else{
      oPositionDetail.innerHTML=fn.getDetailsProduct();
    }
    //fn.consoleLogFC({'FC_Log_Grid_v1' : 'descritores do produto selecionado', 'dscr' : sParms.replace(/\&/g,', ').replace(/\=/g,' : ')}); /*Loga os parâmetros do produto selecionado*/
  }

  //fnResetOptions:begin
  function fnResetOptions(objElementParent){
    iGridAtual=objElementParent.getAttribute("data-grid");
    if(iGridAnterior==0)iGridAnterior=iGridAtual;
    var bMudouActiveGrid=(iGridAtual!=iGridAnterior);  //verifica se mudou de grid clicado
    if(bMudouActiveGrid){
      fnInitProductList(aProductList,iGridAnterior); // recria as opções da grade anterior
      iGridAnterior=iGridAtual;
    }
    aProductList=aProductListAll[iGridAtual-1];
    settings=JSON.parse(aSettingsAll[iGridAtual-1]);
    if(options.incMultGrid)fn.qtyIncFieldDisabled(true, false);
    fn.getShippingView(false); //simulação de frete
    var el=document.querySelectorAll('#idButtonBuyFC_'+ iGridAtual +' .FCBtnGrid');
    var elSelect=document.querySelectorAll('#idButtonBuyFC_'+ iGridAtual +' .FCBtnSelectedOption');
    if(el.length>0 && elSelect.length===0){
      for(var i=0; i< el.length;i++){el[i].parentNode.removeChild(el[i]);} //remove os botões já existem no html
      if(elSelect.length===0){
        var oButton=fn.availableBuyProduct(null);
        var oPositionBtn = document.getElementById('idButtonBuyFC_'+ iGridAtual);
        if(oPositionBtn){oPositionBtn.appendChild(oButton);fnResetWishlist();}
      }
    }
    var obj=objElementParent.getElementsByTagName("span")[0];
    var iNivelAtual=objElementParent.getAttribute("data-nivel");
    var sDescritorAtual=obj.getAttribute("data-attr");
    var srcImgDet=obj.getAttribute("data-img-det");
    var srcImgAmp=obj.getAttribute("data-img-amp");

    if(srcImgDet!= null && srcImgAmp!= null)fn.imgView(srcImgDet, srcImgAmp, true);
    fn.removeClass(document.querySelectorAll('[id*=idNivelGridFC_'+ iNivelAtual+'] .FCDescritorContent li'), 'FCSelectedGrid'); // remove classe das LIs quando uma opção é clicada
    fn.addClass(objElementParent,"FCSelectedGrid"); // adiciona classe ao elemento quando o mesmo é clicada

    if(parseInt(iNivelAtual)==0)aDescriptorsPrevious=[];
    aDescriptorsPrevious[parseInt(iNivelAtual)]=sDescritorAtual;
    settings.descriptorsPrevious=aDescriptorsPrevious; // definir o descritor que foi clicado e adiciona a variável

    var aDestinosDescritores = settings.descriptorsActive; //define os descritores existentes nos produtos
    var oPositionHtml = document.getElementById(settings.idElementGrid);
    var iNextNivel = parseInt(iNivelAtual)+1;
    // incluir os valor dos descritores selecionados em cada nível ex. (Cinza+Vermelho)
    if(aDestinosDescritores[iNivelAtual].toUpperCase() == 'COR'){
      document.getElementById('idNivelGridFC_'+ iNivelAtual +'_select_'+ iGridAtual).innerHTML= "("+ fn.getColor(sDescritorAtual).name +")";
    }else{
      document.getElementById('idNivelGridFC_'+ iNivelAtual +'_select_'+ iGridAtual).innerHTML= "("+ sDescritorAtual +")";
    }

    for(var i=iNextNivel; i< aDestinosDescritores.length; i++){
      var sHtmlUL="<ul class=\"FCDescritorContent\">";
      if(i==iNextNivel){var sDisabled="FCDescritorGridActivated", oClickEvent="onClick=FCGrid$.fnResetOptions(this)";}else{var sDisabled = "FCDescritorGridDisabled", oClickEvent="";}
      if(aDestinosDescritores.length > 0){
        var sClassDescritor = fn.classDescriptor(aDestinosDescritores[i]); //define uma classe especifica para cada nível de descritores
        var oSelectProductsList = fnSelectsProducts(aProductList, sDescritorAtual, iNivelAtual); //seleciona os produtos de acordo com o nível selecionado
        if(aDestinosDescritores.length>1){
          var aItens = fn.eliminateDuplicates(fn.getDescriptorValueProducts(oSelectProductsList, aDestinosDescritores[i])); //remove valores duplicados [array de produtos, descritor ex. COR]
        }else{
          var aItens = fn.getDescriptorValueProducts(aProductList, aDestinosDescritores[i]);
        }
        for(var j=0; j < aItens.length;j++){
          var sDescriptorValueReset = aItens[j]; // ex. Cinza+AzulClaro|0066FF
          var oFlagEsgotado = fn.productAvailableFlag(null); // retorns 'htmlLabel': "", 'classLabel' : ""
          if(iNivelAtual==(aDestinosDescritores.length-2)){
            var oProductSelect = fnSelectsProducts(aProductList, sDescriptorValueReset, parseInt(iNivelAtual)+1);
            oFlagEsgotado = fn.productAvailableFlag(oProductSelect, iNivelAtual);
          }
          // imagem do produto
          var sDataImagesProd="";
          if((options.imageProduct).toUpperCase() == (aDestinosDescritores[i]).toUpperCase()){
            var descriptorImg = sDescriptorValueReset;
            sDataImagesProd = fn.srcProduct(i, descriptorImg, aProductList);
          }
          // cria element LI > SPAN / verifica se o subproduto esta disponivel [x] [!]
          sHtmlUL+="<li data-grid="+ iGridAtual +" class=\""+ sDisabled +" "+ oFlagEsgotado.classLabel +"\" data-nivel=\""+ i +"\" "+ oClickEvent +">"
                 +  options.htmlFlagChecked
                 +  "<span class=\"FCDescritorGrid "+ sClassDescritor +"\" data-attr=\""+ sDescriptorValueReset +"\" "+ sDataImagesProd+">"
                 +     sDescriptorValueReset + oFlagEsgotado.htmlLabel
                 +  "</span>"
                 +"</li>";
        }
        sHtmlUL+="</ul>";

        if(options.textDescriptor[ aDestinosDescritores[i] ] == "" || options.textDescriptor[ aDestinosDescritores[i] ]===undefined){
          var sTitDescr="Selecione";
        }else{
          var sTitDescr=options.textDescriptor[ aDestinosDescritores[i] ]
        }

        var oElementExists = document.getElementById('idNivelGridFC_'+ i +'_'+ iGridAtual);
        if(!oElementExists){
          var oNewElement = document.createElement("Div");
          oNewElement.className='FCBoxGrid';
          oNewElement.id="idNivelGridFC_"+ i +'_'+ iGridAtual;
          oNewElement.innerHTML = "<div class=\"FCStepGrid\"><span class=\"FCStepGridNumber\">"+ parseInt(i+1) +"</span>"
                                +   "<span class=\"FCStepGridTitle\">"+ sTitDescr + "</span>"
                                + "</div>"+ sHtmlUL ;
          oPositionHtml.appendChild(oNewElement);
        }else{
          oElementExists.innerHTML= "<div class=\"FCStepGrid\">"
                                  +   "<span class=\"FCStepGridNumber\">"+ parseInt(i+1) +"</span>"
                                  +   "<span class=\"FCStepGridTitle\">"+ sTitDescr + "</span>"
                                  +   "<strong class=\"FCOptionSelected\" id='idNivelGridFC_"+ parseInt(i) +"_select_"+ iGridAtual +"'></strong>"
                                  + "</div>"+ sHtmlUL;
        }
      }
    }
    //vefica se é o último nível de descritor
    if(iNivelAtual==(aDestinosDescritores.length-1)){
      var oSelectProductsList = fnSelectsProducts(aProductList, sDescritorAtual, iNivelAtual);
      var IDProdutoData=obj.getAttribute("data-id");
      if(IDProdutoData!= null){
        IDProdutoData=IDProdutoData;
      }else{
        var IDProduto = fn.getDescriptorValueProducts(oSelectProductsList, 'IDProduto');
        IDProdutoData=IDProduto[0];
      }
      fnExistsProduct(IDProdutoData, settings.descriptorsActive, settings.descriptorsPrevious, aProductList);
    }
    else{
      //limpa o resumo do produto, descritores e atributos
      var oPositionDetail=document.getElementById('idDetailProduct_'+ iGridAtual);
      if(oPositionDetail)oPositionDetail.innerHTML="";
    }
  }
  //fnResetOptions:end

  //fnInitProductList:begin
  function fnInitProductList(aProductList,iGridProd){

    var sDataImagesProd="";
    settings.descriptorsActive=fn.setActiveDescriptors(aProductList, options.qtyDescriptors); //define os descritores existentes [array de produtos, quantidade de descritores]
    aSettingsAll.push(JSON.stringify(settings));
    var aDestinosDescritores=settings.descriptorsActive;

    if(!settings.descriptorsActive || settings.descriptorsActive.length == 0)return false; //se exite subprodutos com erro no cadastro (ausência de descritores)

    var oPositionHtml = document.getElementById( settings.idElementGrid );
    oPositionHtml.innerHTML="";

    if(options.textGrid!=="" && oPositionHtml){
      var oNewElement=document.createElement("div");
      oNewElement.setAttribute("id","idTxtGridFC_"+ iGridProd);
      oNewElement.setAttribute("class","FCTxtGrid");
      oNewElement.innerHTML=options.textGrid;
      oPositionHtml.appendChild(oNewElement);
    }
    for(var i=0; i< aDestinosDescritores.length; i++){
      var sBgColor="", sHtmlUL="<ul class=\"FCDescritorContent\">";
      if(i==0){var sDisabled="FCDescritorGridActivated", oClickEvent="onClick=FCGrid$.fnResetOptions(this)"}else{var sDisabled = "FCDescritorGridDisabled", oClickEvent=""}

      if(aDestinosDescritores.length>0)
      {
        var sClassDescritor=fn.classDescriptor(aDestinosDescritores[i]); //define um classe para cada descritor

        if(fn.isSingleDescriptor()){ //Tem apenas um descritor? Apenas um nível de opção

          var uniqueDescriptorsAll = []  /*armazena descritor de todos o subprotudo para depois vericar a exitencia de duplicidade*/
          for(var j=0; j< aProductList.length;j++){
            var prd = JSON.parse(aProductList[j]);

            if((options.imageProduct).toUpperCase() == (aDestinosDescritores[i]).toUpperCase()){
              sDataImagesProd=" data-img-det="+ prd['imgDet'] +" data-img-amp="+ prd['imgAmp']; //Obtém a imagem do produto detalhe/ ampliada
            }

            var results=[];
            results.push(JSON.stringify(prd));
            var oFlagEsgotado=fn.productAvailableFlag(results); // verifica se o subproduto esta disponivel [x] [!]

            //se for do descritor cor
            if((aDestinosDescritores[i]).toUpperCase() == 'COR'){
              if(options.colorImg){
                var sBgColor = "url("+ settings.pathColorsImg + fn.getColor(prd['cor']).name.replace("+","_") + options.colorImgFormat +") no-repeat #"+ fn.getColor(prd['cor']).rgb +";";
              }else{
                var sBgColor = "#" + fn.getColor(prd['cor']).rgb;
              }
              var sNameCor= options.colorName == false ? "&nbsp;" : fn.getColor(prd['cor']).name; //Exibe ou não o nome da cor
              sHtmlUL+="<li data-grid="+ iGridProd +" class=\""+ sDisabled +" "+ oFlagEsgotado.classLabel +"\" data-nivel=\""+i+"\" "+ oClickEvent +"\>"
                    +  options.htmlFlagChecked
                    +  "<span style=\"background:"+ sBgColor +"\" class=\"FCDescritorGrid "+ sClassDescritor +"\" data-attr=\""+ prd[aDestinosDescritores[i]] +"\""+ sDataImagesProd +"\ data-id=\""+ prd['IDProduto']+"\">"
                    +     sNameCor + oFlagEsgotado.htmlLabel
                    +  "</span>"
                    +"</li>";
            }
            /* não é descritor cor */
            else{
              sHtmlUL+="<li data-grid="+ iGridProd +" class=\""+ sDisabled +" "+ oFlagEsgotado.classLabel +"\" data-nivel=\""+ i +"\" "+ oClickEvent +">"
                    +  options.htmlFlagChecked
                    +  "<span style=\""+ sBgColor +"\" class=\"FCDescritorGrid "+ sClassDescritor +"\" data-attr=\""+ prd[aDestinosDescritores[i]] +"\""+ sDataImagesProd +" data-id=\""+ prd['IDProduto'] +"\">"
                    +    prd[aDestinosDescritores[i]] + oFlagEsgotado.htmlLabel
                    +  "</span>"
                    +"</li>";
            }

            uniqueDescriptorsAll.push(prd[aDestinosDescritores[i]]); /*adiciona o valor do descritor ao array*/
          }
          /*verifica se tem descritores duplicados*/
          var uniqueDescriptorsResume = fn.eliminateDuplicates(uniqueDescriptorsAll);
          if(uniqueDescriptorsAll.length !== uniqueDescriptorsResume.length)fn.consoleLogFC({'FC_Log_Grid_v1' : 'Subprodutos com descritores duplicados', 'dscr' : uniqueDescriptorsAll});
        }
        else /* Mais de um descritor ex. cor/ tamanho */
        {
          var aItens = fn.eliminateDuplicates(fn.getDescriptorValueProducts(aProductList, aDestinosDescritores[i])); //remove valores duplicados [array de produtos, descritor ex. COR]
          for(var j=0; j < aItens.length;j++){
            var sDescriptorValueInit = aItens[j]; // ex. Cinza+AzulClaro|0066FF
            if((options.imageProduct).toUpperCase() == (aDestinosDescritores[i]).toUpperCase()){
              sDataImagesProd=fn.srcProduct(i, sDescriptorValueInit, aProductList); //imagem do produto para o atributo data-img
            }

            if((aDestinosDescritores[i]).toUpperCase() == 'COR'){ /* se for atributo cor */
              if(options.colorImg){
                var sBgColor = "url("+ settings.pathColorsImg + fn.getColor( sDescriptorValueInit ).name.replace("+","_") + options.colorImgFormat +") no-repeat #"+ fn.getColor( sDescriptorValueInit ).rgb +";";
              }else{
                var sBgColor = "#"+ fn.getColor( sDescriptorValueInit ).rgb;
              }
              var sNameCor = options.colorName == false ? "&nbsp;" : fn.getColor(sDescriptorValueInit).name; //Exibe ou não o nome da cor
              sHtmlUL+="<li data-grid="+ iGridProd +" class=\""+ sDisabled +"\" data-nivel=\""+i+"\" "+ oClickEvent +">"
                    +  options.htmlFlagChecked
                    +  "<span style=\"background:"+ sBgColor +"\" class=\"FCDescritorGrid "+ sClassDescritor +"\" data-attr=\""+ sDescriptorValueInit +"\" "+ sDataImagesProd +">"
                    +    sNameCor
                    +  "</span>"
                    +"</li>";
            }else{
              sHtmlUL+="<li data-grid="+ iGridProd +" class=\""+ sDisabled +"\" data-nivel=\""+i+"\" "+ oClickEvent +">"
                    +  options.htmlFlagChecked
                    +  "<span style=\""+ sBgColor +"\" class=\"FCDescritorGrid "+ sClassDescritor +"\" data-attr=\""+ sDescriptorValueInit +"\" "+ sDataImagesProd +">"
                    +    sDescriptorValueInit
                    +  "</span>"
                    +'</li>';
            }
          }
        }
        sHtmlUL+="</ul>"; //fechamento elemento UL

        var oNewDiv = document.createElement("Div");
        oNewDiv.className='FCBoxGrid FCNivelGrid_'+i;
        oNewDiv.id="idNivelGridFC_"+ i +'_'+ iGridProd;

        if(options.textDescriptor[ aDestinosDescritores[i] ] == "" || options.textDescriptor[ aDestinosDescritores[i] ]==undefined){
          var sTitDescr="Selecione";
        }else{
          var sTitDescr=options.textDescriptor[ aDestinosDescritores[i] ]
        }
        oNewDiv.innerHTML = "<div class=\"FCStepGrid\">"
                          +   "<span class=\"FCStepGridNumber\">"+ parseInt(i+1) +"</span>"
                          +   "<span class=\"FCStepGridTitle\">"+ sTitDescr + "</span>"
                          +   "<strong class=\"FCOptionSelected\" id='idNivelGridFC_"+ i +"_select_"+ iGridProd +"'></strong>"
                          + "</div>"+ sHtmlUL ;
        oPositionHtml.appendChild(oNewDiv);
      }
    }

    // criar incMult
    if(options.incMultGrid){
      var oNewDiv=document.createElement("Div");
          oNewDiv.setAttribute('class', 'FCBoxGrid FCFCBoxGridIncMult');
      var oLabelIncMult=document.createElement("span");
          oLabelIncMult.setAttribute('class', 'FCStepGridTitle FCTitQtyInc');
          oLabelIncMult.innerHTML="Quantidade&nbsp;";
      var oInputIncMult=fn.creatInputIncMultQty();

      var oPassoBuy = document.createElement("span");
          oPassoBuy.setAttribute('class', 'FCStepGridNumber');
          oPassoBuy.innerHTML= settings.descriptorsActive.length+1;
          oNewDiv.appendChild(oPassoBuy);
          oNewDiv.appendChild(oLabelIncMult);
          oNewDiv.appendChild(oInputIncMult);
          oPositionHtml.appendChild(oNewDiv);
    }

    //botao comprar
    var oPositionBtn = document.getElementById('idButtonBuyFC_'+ iGridProd);
    if(!oPositionBtn){
      var oDivButtonBuy = document.createElement("div");
          oDivButtonBuy.setAttribute('id', 'idButtonBuyFC_'+ iGridProd);
          oDivButtonBuy.setAttribute('class', 'FCBoxGrid FCBoxGridBuy');

      var iStepBuy = options.incMultGrid == true ? 2 : 1;
      var oPassoBuy = document.createElement("span");
          oPassoBuy.setAttribute('class', 'FCStepGridNumber');
          oPassoBuy.innerHTML= settings.descriptorsActive.length + iStepBuy;
      oDivButtonBuy.appendChild(oPassoBuy);
      oPositionHtml.appendChild(oDivButtonBuy);
    }

    // selecione o primeiro subproduto automaticamente
    if(options.autoSelect && aSettingsAll.length==1){
      for(var i=0; i < aDestinosDescritores.length; i++){
        var oProd=document.querySelectorAll('li[data-nivel="'+i+'"]');
        if(oProd[0] !== null)fnResetOptions(oProd[0]);
      }
      if(fn.isSingleDescriptor())fn.getShippingView(true) //simulação de frete
    }else{
      var oButton=fn.availableBuyProduct(null);
      var oPositionBtn = document.getElementById('idButtonBuyFC_'+ iGridProd);
      if(oPositionBtn)oPositionBtn.appendChild(oButton);
      fnSelectForWishlist(oPositionBtn);
      fn.getShippingView(false) // simulação de frete
    }
  }
  //fnInitProductList:end

  //fnInitProductOnlyOne:begin
  function fnInitProductOnlyOne(aProductOnlyOne,iGridProd){
    var oPositionHtml = document.getElementById( settings.idElementGrid );
    var oProd = JSON.parse(aProductOnlyOne);
    var sParms= "IDProduto="+oProd.IDProduto;

    var fnBuildHtmlAdic=function(oProd){
      var sHtmlAdic="";
      for(var i=0; i < options.order.length;i++ ){
        if(oProd[options.order[i]]!==""){
          if(options.order[i].toUpperCase() == "COR"){
            var sNomeAdic=fn.getColor(oProd.cor).name + "<span class=\"AdicItemCor\" style=\"background:#"+ fn.getColor(oProd.cor).rgb +"\">&nbsp;</span>";
          }else{
            var sNomeAdic=oProd[options.order[i]];
          }
          sHtmlAdic+="<div class=\"FCGridAdicContent\"><span class=\"AdicNome\">"+ options.nameDescriptor[options.order[i]] +"</span><span class=\"AdicItem\">"+ sNomeAdic +"</span></div>";
        }
      }

      /*quantidade em estoque*/
      if(options.stock){
        var iEstoqueDetail = parseInt(oProd.estoque), fPriceDetails = parseFloat(oProd.priceNum);
        sHtmlAdic+= "<div class=\"FCGridAdicContent zf-qty-estoque\">"+ fn.viewStock(iEstoqueDetail, fPriceDetails) +"</div>";
      }
      return sHtmlAdic;
    }

    var oNewDiv = document.createElement("Div");
          oNewDiv.className='FCBoxGrid FCResumeProduct';
          oNewDiv.id="idDetailProduct_"+ iGridProd;
          oNewDiv.innerHTML= fnBuildHtmlAdic(oProd);
          oPositionHtml.appendChild(oNewDiv);

    if(options.incMultGrid){
      var oNewDiv=document.createElement("Div");
          oNewDiv.setAttribute('class', 'FCBoxGrid FCFCBoxGridIncMult');
      var oLabelIncMult=document.createElement("span");
          oLabelIncMult.setAttribute('class', 'FCTitQtyInc');
          oLabelIncMult.innerHTML="Quantidade&nbsp;";
      var oInputIncMult=fn.creatInputIncMultQty();
          oNewDiv.appendChild(oLabelIncMult);
          oNewDiv.appendChild(oInputIncMult);
          oPositionHtml.appendChild(oNewDiv);
    }

    fn.setAttrProduct(oProd); //define o produto selecionado e inclui na variável product
    var oButton = fn.availableBuyProduct(oProd, sParms); //verificar disponibilidade e cria o botão [comprar/ esgotado/ consulte-nos]
    var el=document.querySelectorAll('#idButtonBuyFC_'+ iGridProd +' .FCBtnGrid');
    if(el.length>0)for(var i=0; i< el.length;i++){el[i].parentNode.removeChild(el[i]);} //remove os botões já existem no html

    var oPositionBtn = document.getElementById('idButtonBuyFC_'+ iGridProd);
    if(!oPositionBtn){
      var oDivButtonBuy = document.createElement("div");
          oDivButtonBuy.setAttribute('id', 'idButtonBuyFC_'+ iGridProd);
          oDivButtonBuy.setAttribute('data-idproduto',oProd.IDProduto);
          oDivButtonBuy.setAttribute('data-grid',iGridQtd);
          oDivButtonBuy.setAttribute('class', 'FCBoxGrid FCBoxGridBuy FCBoxGridOnly');
      oPositionHtml.appendChild(oDivButtonBuy);
    }
    oPositionBtn = document.getElementById('idButtonBuyFC_'+ iGridProd);
    oPositionBtn.appendChild(oButton);
    fnAddToWishlist(oPositionBtn,oProd.IDProduto);
  }
  //fnInitProductOnlyOne:end

  function fnMultipleZoom(imgDet,imgAmp,refresh){
    if(imgDet!=="" && imgAmp!== "") return fn.imgView(imgDet,imgAmp,refresh);
  }

  //inicia a função
  function init(id, aProductListGrid, aProductOnlyOneGrid){
    iGridQtd++;

    settings.idElementGrid = id; //set ID in DIV
    if(myOptions)options = fn.marge(options, myOptions); //altera as configurações

    aProductOnlyOne = fn.convertCharAT(aProductOnlyOneGrid);
    aProductOnlyOneAll.push(aProductOnlyOne);
    aProductList = fn.convertCharAT(aProductListGrid);
    aProductListAll.push(aProductList);

    if(typeof aProductListGrid[aProductListGrid.length-1] !== 'undefined'){
      fnInitProductList(aProductList,iGridQtd); // se for subproduto
    }else{
      aSettingsAll.push(JSON.stringify(settings));
      fnInitProductOnlyOne(aProductOnlyOneGrid,iGridQtd);

    }
  }

  function fnExecTabDescriptors(){
    if(typeof aProductList[aProductList.length-1] == 'undefined'){ aProductList=aProductOnlyOne; }
    var aDados = ["IDProduto","codProd","cor","estoque","peso","priceOri","priceNum","adicional1","adicional2","adicional3","adicionalD1","adicionalD2","adicionalD3","imgDet","imgAmp"];
    var oTable = document.createElement("table"); oTable.border="1";

    var TRnode = document.createElement("tr");
    for(var i=0; i< aDados.length; i++ ){ var THnode = document.createElement("th"); THnode.style.border="1px solid #ccc"; THnode.style.padding="3px 8px"; THnode.innerHTML = [aDados[i]]; TRnode.appendChild(THnode)}
    oTable.appendChild(TRnode);

    for(var i=0; i < aProductList.length;i++){
      var TRnode = document.createElement("tr");
      var prd = JSON.parse(aProductList[i]);
      for(var j=0; j< aDados.length; j++ ){ var TDnode = document.createElement("td"); TDnode.style.border="1px solid #ccc"; TDnode.style.padding="3px 8px"; TDnode.innerHTML = prd[aDados[j]]; TRnode.appendChild(TDnode);}
      oTable.appendChild(TRnode);
    }
    var oNewElement=document.createElement("div"); oNewElement.setAttribute("id","idTabDescritoresGridFC"); oNewElement.setAttribute("class","FCTabDescritoresGrid"); oNewElement.appendChild(oTable);
    document.body.appendChild(oNewElement);
  }

  function fnGridAll(oProdTags,aSubProdTags){
    fnMultipleZoom(oProdTags.ImagemProdDet,oProdTags.ImagemProdAmp, false);
    var aProductOnlyOneGrid=[], aProductListGrid=[];

    /* Begin: produto principal */
    var sCor= (oProdTags.CorVal !="") ? oProdTags.CorVal +"|"+ oProdTags.CorRGB:"";
    aProductOnlyOneGrid.push(JSON.stringify({IDProduto: oProdTags.IDProduto,codProd: oProdTags.CodProd, cor: sCor, estoque: oProdTags.Estoque, peso: oProdTags.PesoNum, priceOri: oProdTags.PrecoOri, priceNum: oProdTags.PrecoNum, maxInstallmentsNum: oProdTags.MaxParcelasProdNum, adicional1: oProdTags.Adicional1Val, adicional2: oProdTags.Adicional2Val, adicional3: oProdTags.Adicional3Val, adicionalD1: oProdTags.AdicionalD1Val, adicionalD2:oProdTags.AdicionalD2Val, adicionalD3:oProdTags.AdicionalD3Val, imgDet:oProdTags.ImagemProdDet, imgAmp:oProdTags.ImagemProdAmp, IDProdutoPai:oProdTags.IDProduto}));
    /* End: produto principal */

    /* Begin: lista subprodutos */
    var iSubProdTags=aSubProdTags.length;
    for(var i=0;i<iSubProdTags;i++){
      var sCor= (aSubProdTags[i].CorVal !="") ? aSubProdTags[i].CorVal +"|"+ aSubProdTags[i].CorRGB:"";
      aProductListGrid.push(JSON.stringify({IDProduto: aSubProdTags[i].IDProduto, codProd: aSubProdTags[i].CodProd, cor: sCor, estoque: aSubProdTags[i].Estoque, peso: aSubProdTags[i].PesoNum, priceOri: aSubProdTags[i].PrecoOri, priceNum: aSubProdTags[i].PrecoNum, maxInstallmentsNum: aSubProdTags[i].MaxParcelasProdNum, adicional1: aSubProdTags[i].Adicional1Val, adicional2: aSubProdTags[i].Adicional2Val, adicional3: aSubProdTags[i].Adicional3Val, adicionalD1: aSubProdTags[i].AdicionalD1Val, adicionalD2:aSubProdTags[i].AdicionalD2Val, adicionalD3:aSubProdTags[i].AdicionalD3Val, imgDet:aSubProdTags[i].ImagemProdDet, imgAmp:aSubProdTags[i].ImagemProdAmp, IDProdutoPai:oProdTags.IDProduto}));
    }
    /* Begin: lista subprodutos */

    /* código opcional para alterar as configurações da grade:begin */
    myOptions = {
      autoSelect : true,
      cartOnPage : true,
      shippingUpdate : false,
      incMultGrid : false,
      separadorRGBCor : '|',
      qtyDescriptors : 7,
      htmlFlagChecked : '<i class="FCCheckedGrid"></i>',
      imageProduct : 'cor',
      colorName : false,
      colorImg : false,
      colorImgFormat : '.gif',
      stock: false,
      btnSelectImg : 'botselecionegrid.svg?cccfc=1',
      btnBuyImg : 'botcarrinho.svg?cccfc=1',
      btnContactUSImg : 'botconsultegrid.svg?cccfc=1',
      btnSoldOut : 'botcarrinhoesgotado.svg?cccfc=1',
      textGrid : 'Selecione as opções abaixo',
      order : ['cor', 'adicional1', 'adicional2', 'adicional3', 'adicionalD1', 'adicionalD2', 'adicionalD3'],
      nameDescriptor : {
        cor : 'Cor',
        adicional1 : oProdTags.NomeAdicional1,
        adicional2 : oProdTags.NomeAdicional2,
        adicional3 : oProdTags.NomeAdicional3,
        adicionalD1 : oProdTags.NomeAdicionalD1,
        adicionalD2 : oProdTags.NomeAdicionalD2,
        adicionalD3 : oProdTags.NomeAdicionalD3
      },
      textDescriptor : {
        cor : 'Selecione',
        adicional1 : 'Selecione',
        adicional2 : 'Selecione',
        adicional3 : 'Selecione',
        adicionalD1 : 'Selecione',
        adicionalD2 : 'Selecione',
        adicionalD3 : 'Selecione'
      }
    };
    /* código opcional para alterar as configurações da grade:end */

    init("idMainGridFC_"+ oProdTags.IDProduto, aProductListGrid, aProductOnlyOneGrid); /* Inicia a grade */
  }

  return{
    init:init,
    myOptions:myOptions,
    fnResetOptions:fnResetOptions,
    fnMultipleZoom:fnMultipleZoom,
    fnExecTabDescriptors:fnExecTabDescriptors,
    fnGridAll:fnGridAll,
    iGridQtd:iGridQtd
  }
}();
// Fastcommerce Grid [26.01.2018] v1
