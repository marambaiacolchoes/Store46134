var LibHotSite$=(function(){

  var aFiltersHotsite=[];
  var oProdFilters=null;
  var oDicCat={};
  var oDicFilters={};
  var oDicFiltersPrevious={};
  var oDicQtdFilters={};
  var oDicQtdNameFil={};
  var oDicFilteringBy={};
  var oFilOut=null;
  var bChangedFilters=false;
  var oFilShow={};
  //configuration parameters
  var iMaxItems=5;  //above this number of filter items, the search box is displayed inside the filters
  var iMaxSearch=20; //maximum character size for searching for a filter

  function fnInit(){
    var iQtdProds=aFiltersHotsite.length;
    if(iQtdProds>0){
      for(var i=0; i<iQtdProds; i++){
        oProdFilters=aFiltersHotsite[i];
        fnInsertFiltersProd(oProdFilters);
      }
      if(!bChangedFilters)fnShowFilters();
      else fnUpdateFilters();
    }
    if(!bChangedFilters){
      fnChangeQtdProds(Object.keys(LibHotSite$.oDicCat).length);
    }
    else {
      fnIntoView(fnGetID("idPagProdTop"));
      if(FC$.Mobile || document.documentElement.clientWidth<400)filterCloseNav();
    }
  }

  function fnDisplayedProd(oObj){
    return oObj.classList.contains("smoothShow");
  }
   
  function fnInsertFiltersProd(oProdFilters){
    var idProd=oProdFilters.idProd;
    var oDivProd=fnGetID("DivProd"+idProd);
    if(oDivProd){
      var bDisplayedProd=fnDisplayedProd(oDivProd);
      if(bDisplayedProd){
        //product category filter, oDicCat structure
        var FilNameCat="Categoria"
        var FilValueCat=oDicCat[idProd].replace(/'/g,"");
        var FilNameAtt="filter_"+FilNameCat.replace(/ /g,"_");
        oDivProd.setAttribute(FilNameAtt,FilValueCat);        
        if(oDicFilters[FilNameCat]==undefined)oDicFilters[FilNameCat]=FilValueCat;
        else oDicFilters[FilNameCat]=oDicFilters[FilNameCat]+","+FilValueCat;           
        //product filters filter, aFiltersHotsite structure
        var opFil=oProdFilters.pFil;
        if(typeof(opFil)=="object"){
          for(var i in opFil){
            var oFiltro=opFil[i];
            var bShowFil=oFiltro.show;
            if(bShowFil){
              var FilName=oFiltro.name;
              var FilValue=oFiltro.value.replace(/'/g,"");
              var FilNameAtt="filter_"+FilName.replace(/ /g,"_"); 
              oDivProd.setAttribute(FilNameAtt,FilValue);        
              if(oDicFilters[FilName]==undefined)oDicFilters[FilName]=FilValue;
              else oDicFilters[FilName]=oDicFilters[FilName]+","+FilValue;           
            }
          }       
        }
      }        
    }
  }

  function fnShowFilters(){
  //Insert the filters on the page
    var sHTML="<div id='DivFiltrarPor' class='DivFiltrarPor'><span class='Label'>"+ rk("products-filter-your-results") +":</span> ";
    var oFiltersNames=Object.keys(oDicFilters);
    var oFiltersValues=Object.values(oDicFilters);
    for(var z in oFiltersNames){
      var sSearch="";
      var FilNameAtt="filter_"+oFiltersNames[z].replace(/ /g,"_");
      var aValues=oFiltersValues[z].split(',');
      fnCountQtdFil(FilNameAtt,aValues);
      var aUniqValues=[...new Set(aValues)];
      aUniqValues.sort();
      var iValues=aUniqValues.length;
      sHTML+="<ul class=FilSearch data-att='"+ FilNameAtt +"'>";
      sHTML+="  <li class='FilName Fil"+ z +"' onclick='LibHotSite$.fnHideFil("+ z +")'><span id='FilName"+ z +"' class='SetaBaixo'>"+ rk("products-filter-by") +" "+ oFiltersNames[z] +"</span></li>";
      sHTML+="  [Search_"+z+"]<li class='FilItems FilInfo"+ z +"'><span style='font-size:12px;' id=TxtSearch"+ z +"></span>";
      sHTML+="    <ul id='FilItemsList"+ z +"' class='FilItemsList'>";
      for(var h=0; h<iValues; h++){
        var sValue=fnRemoveAcento(aUniqValues[h].toLowerCase().replace(/ /g,"_"));
        var sKey=FilNameAtt+"_"+ sValue;
        sHTML+="<li name='FilterLi"+ z +"' class='FilterLi' data-key=\""+ sKey +"\" data-att=\""+ FilNameAtt +"\" data-value=\""+ aUniqValues[h] +"\">";
        sHTML+="  <input type=checkbox id='fil"+ z +"_"+ h +"' data-fil-name=\""+ oFiltersNames[z] +"\" value=\""+ aUniqValues[h] +"\" name='filters' onclick=\"LibHotSite$.fnChangeFilters()\">";
        sHTML+="  <label for='fil"+ z +"_"+ h +"'>"+ aUniqValues[h] +"<span id='Qtd_"+ sKey +"'>"+ fnShowQtd(FilNameAtt,aUniqValues[h]) +"</span></label>";
        sHTML+="</li>";
      }
      sHTML+="    </ul>";
      sHTML+="  </li>";
      sHTML+="</ul>";
      if(h>iMaxItems)sSearch+="<li class='FilInputSearch FilInfoCat'><input id='InputSearch"+ z +"' maxlength="+ iMaxSearch +" class=SearchFil placeholder='"+ rk("products-filter-search") +" "+ oFiltersNames[z] +"' onkeyup='LibHotSite$.fnSearchFil(this.value,"+ z +");' type=text></li>"
      sHTML=sHTML.replace("[Search_"+z+"]",sSearch);
    }
    sHTML+="</div>";
    oFilOut=fnGetID("ProductsFilterFC_Hotsite");
    if(oFilOut){
      oFilOut.innerHTML="<div id=ContentFil>"+ sHTML +"</div>";
    }
  }

  function fnShowQtd(FilNameAtt,Value){
    var FilValueDic=fnRemoveAcento(Value.replace(/ /g,"_"));
    var KeyDic=FilNameAtt+"_"+FilValueDic;
    if(oDicQtdFilters[KeyDic]==undefined)return "";
    else return " ("+ oDicQtdFilters[KeyDic] +")";
  }

  function fnCountQtdFil(FilNameAtt,aValues){
    var iValues=aValues.length;
    for(var h=0; h<iValues; h++){
      var FilValueDic=fnRemoveAcento(aValues[h].replace(/ /g,"_"));
      var KeyDic=FilNameAtt+"_"+FilValueDic;
      if(oDicQtdFilters[KeyDic]==undefined)oDicQtdFilters[KeyDic]=1;
      else oDicQtdFilters[KeyDic]=oDicQtdFilters[KeyDic]+1;
    }
  }

  function fnUpdateFilters(){
    oDicQtdFilters={}; //to reset product qty counters in the filter
    var oFiltersNames=Object.keys(oDicFilters);
    var oFiltersValues=Object.values(oDicFilters);
    oFilShow={};
    oDicQtdNameFil={};
    //loop in oDicFilters, containing the product filter options
    for(var z in oFiltersNames){
      var oTxtSearch=FCLib$.GetID("TxtSearch"+z);
      if(oTxtSearch)oTxtSearch.innerHTML="";
      var oInputSearch=FCLib$.GetID("InputSearch"+z);
      if(oInputSearch)oInputSearch.value="";           
      var FilNameAtt="filter_"+oFiltersNames[z].replace(/ /g,"_");
      var aValues=oFiltersValues[z].split(',');
      fnCountQtdFil(FilNameAtt,aValues);
      var aUniqValues=[...new Set(aValues)];
      aUniqValues.sort();
      var iValues=aUniqValues.length;
      oDicQtdNameFil[FilNameAtt]=false;
      for(var h=0; h<iValues; h++){
        var sValue=fnRemoveAcento(aUniqValues[h].toLowerCase().replace(/ /g,"_"));
        var sKey=FilNameAtt+"_"+ sValue;
        oFilShow[sKey]=true;
        oDicQtdNameFil[FilNameAtt]=true;
      }
    }
    //loop in each item of <li> of the filters
    var oFilterLi=oFilOut.getElementsByClassName("FilterLi");
    var iTamFilterLi=oFilterLi.length;
    for (var z=0;z<iTamFilterLi;z++){
      var oKeyLi=oFilterLi[z].getAttribute("data-key");
      var oFilNameAtt=oFilterLi[z].getAttribute("data-att");
      if(oFilShow[oKeyLi]==undefined)oFilShow[oKeyLi]=false;
      if(!oFilShow[oKeyLi] && (!oDicFilteringBy[oFilNameAtt] || Object.keys(oDicFilteringBy).length>1)){
        oFilterLi[z].style.display="none";
      }
      else {
        oFilterLi[z].style.display="block";
        if(!oDicFilteringBy[oFilNameAtt] || Object.keys(oDicFilteringBy).length>1){
          var oQtd=fnGetID("Qtd_"+oKeyLi);
          var oFilValue=oFilterLi[z].getAttribute("data-value");
          var FilValueDic=fnRemoveAcento(oFilValue.replace(/ /g,"_"));
          if(oQtd)oQtd.innerHTML=fnShowQtd(oFilNameAtt,oFilValue);
        }

      }
    }
    //hides filters that have no option
    var oFilSearch=oFilOut.getElementsByClassName("FilSearch");
    var iTamFilSearch=oFilSearch.length;
    for (var z=0;z<iTamFilSearch;z++){
      var oFilAtt=oFilSearch[z].getAttribute("data-att");
      if(oDicQtdNameFil[oFilAtt])oFilSearch[z].style.display="block";
      else oFilSearch[z].style.display="none";
    }
  }

  function fnSearchFil(sTxt,id){
    var oFiltroItens=document.getElementsByName("FilterLi"+id);
    if(oFiltroItens){
      var iTamFiltroItens=oFiltroItens.length;
      var iQtdFound=0;
      for(var i=0;i<iTamFiltroItens;i++){
        var oFilValue=oFiltroItens[i].getAttribute("data-value");
        if(fnRemoveAcento(oFilValue.toLowerCase()).search(fnRemoveAcento(sTxt))!=-1){var bFound=true;} else {var bFound=false;} //se encontrou o item com a busca de itens do filtro
        var FilNameAtt=oFiltroItens[i].getAttribute("data-att");
        var sValue=fnRemoveAcento(oFilValue.toLowerCase().replace(/ /g,"_"));
        var sKey=FilNameAtt+"_"+ sValue;
        if(oFilShow[sKey]==undefined)oFilShow[sKey]=true;
        if(bFound && oFilShow[sKey]){oFiltroItens[i].style.display="block";iQtdFound++;}
        else {oFiltroItens[i].style.display="none";}       
      }
      console.log(FilNameAtt+" > "+iQtdFound);
      var oTxtSearch=FCLib$.GetID("TxtSearch"+id);
      if(oTxtSearch){
        if(iQtdFound==0){oTxtSearch.innerHTML=FilNameAtt.replace("filter_","") +" "+ rk("products-filter-not-found")}
        else{oTxtSearch.innerHTML=""}
      }
    }
  }

  function fnGetID(id){
    return document.getElementById(id);
  }

  function fnRemoveAcento(str){
    var ComAc='áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ´`^¨~';  
    var SemAc='aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC     ';
    for (var i in str){
      for (var j in ComAc){
        if (str[i]==ComAc[j]){
          str=str.replace(str[i],SemAc[j]);
        }
      }
    }
    return str;
  }

  function fnIntoView(oObj){
    if(oObj){
      if(!IsObjOnScreen(oObj)){
        oObj.scrollIntoView();
      }
    }
  }

  function IsObjOnScreen(oObj){
    var oRect=oObj.getBoundingClientRect();
    return (
     oRect.top>=0 &&
     oRect.left>=0 &&
     oRect.bottom<=(window.innerHeight || document.documentElement.clientHeight) &&
     oRect.right<=(window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function fnHideFil(dif){
    //Função para exibir/esconder filtro
    var oFilClass=oFilOut.getElementsByClassName("FilInfo"+dif);
    var oSpan=FCLib$.GetID("FilName"+dif);
    var bHide=false;
    var iTamFilClass=oFilClass.length;
    for (var z=0;z<iTamFilClass;z++){
      if(oFilClass[z].style.display=="none"){oFilClass[z].style.display="";}
      else {oFilClass[z].style.display="none";bHide=true;}
    }
    if(oSpan){
      if(bHide)oSpan.className="SetaDireita";
      else oSpan.className="SetaBaixo";
    }
  }

  function fnChangeFilters(){
    oDicFilteringBy={};
    var oFiltroItens=document.getElementsByName("filters");
    var sFilteringBy="";
    if(oFiltroItens){
      var oDicFil={};
      var iTamFiltroItens=oFiltroItens.length;
      for(var i=0;i<iTamFiltroItens;i++){
        if(oFiltroItens[i].checked){
          var oFilName=oFiltroItens[i].getAttribute("data-fil-name");
          var oFilValue=oFiltroItens[i].value;
          if(oDicFil[oFilName]==undefined)oDicFil[oFilName]=oFilValue;
          else oDicFil[oFilName]=oDicFil[oFilName]+","+oFilValue;           
          sFilteringBy+="<li>"+ oFilName +": <span class=SearchItem>"+ oFilValue +"</span> <img  src='/images/x.gif' onclick=\"LibHotSite$.fnRemoveFilter('"+oFilName+"','"+ oFilValue +"')\" onmouseover='this.src=\"/images/xon.gif\"' onmouseout='this.src=\"/images/x.gif\"' title='"+ rk("products-filter-remove-this-filter") +"'></li>";
          oDicFilteringBy["filter_"+oFilName]=true;
        }
      }
      var oFiltersNames=Object.keys(oDicFil);
      var oFiltersValues=Object.values(oDicFil);
      var oDivHotSiteProd=document.getElementsByClassName("DivHotSiteProd");
      var iQtdProds=oDivHotSiteProd.length;
      //removes product displays
      for(var j=0;j<iQtdProds;j++)oDivHotSiteProd[j].style.display="";
      var iQtdSearch=0;
      var aFiltersNames=[];
      for(var z in oFiltersNames){aFiltersNames[z]="filter_"+oFiltersNames[z].replace(/ /g,"_").toLowerCase();} //loads the current filters into aFiltersNames
      var iQtdFils=aFiltersNames.length;
      //loop in products
      var oShowProd={};
      for(var j=0;j<iQtdProds;j++){
        var oDivProd=oDivHotSiteProd[j];
        //requested filters loop
        var oFilFound={};
        oShowProd[j]=true;
        for(var z=0;z<iQtdFils;z++){
          FilNameAtt=aFiltersNames[z];
          var oAttProd=oDivProd.getAttribute(FilNameAtt);
          if(oAttProd!=undefined){
            var aValues=oFiltersValues[z].split(',');
            var iValues=aValues.length;
            oAttProd=","+oAttProd+",";
            oFilFound[z]=true;
            for(var h=0;h<iValues;h++){
              oFilFound[z]=(oAttProd.search(","+aValues[h]+",")!=-1);
              if(oFilFound[z])break;
            }
            oShowProd[j]=oFilFound[z];
          }
          else{
            oShowProd[j]=false;
          }
          if(!oShowProd[j])break;
        }
        if(oShowProd[j]){
          oDivProd.classList.remove("smoothHide");
          oDivProd.classList.add("smoothShow");
        }
        else if(oDivProd.classList.contains("smoothShow")){
          oDivProd.classList.remove("smoothShow");
          oDivProd.classList.add("smoothHide");
        }
      }
      for(var j=0; j<iQtdProds;j++)if(fnDisplayedProd(oDivHotSiteProd[j]))iQtdSearch++;
      bChangedFilters=true;
    }
    fnChangeQtdProds(iQtdSearch);
    if(sFilteringBy!=""){
      sFilteringBy="<span class=Label>"+ rk("products-filter-filtering-by") +":</span><ul class=FiltrandoPor>"+sFilteringBy;
      sFilteringBy+="<li><div class='FilRemoveFilters'><a onclick=\"LibHotSite$.fnRemoveFilter('')\" style='cursor:pointer;'>"+ rk("products-filter-remove-all") +"</a></div></li>";
      sFilteringBy+="</ul>";
      var oDivFilteringBy=fnGetID("DivFiltrandoPor");
      if(oDivFilteringBy){
        oDivFilteringBy.innerHTML=sFilteringBy;
      }
      else{
        var oDivFilterBy=fnGetID("DivFiltrarPor");
        if(oDivFilterBy){
          var oDivFilteringBy=document.createElement("div");
          oDivFilteringBy.id="DivFiltrandoPor";
          oDivFilteringBy.classList.add("DivFiltrandoPor");
          oDivFilterBy.parentNode.insertBefore(oDivFilteringBy,oDivFilterBy);
          oDivFilteringBy.innerHTML=sFilteringBy;
        }
      }
    }
    else{
      var oDivFilteringBy=fnGetID("DivFiltrandoPor");
      if(oDivFilteringBy){
        oDivFilteringBy.innerHTML="";
      }
    }
    if(bChangedFilters){
      oDicFiltersPrevious=oDicFilters;
      oDicFilters={};
      fnInit();
    }
  }

  function fnChangeQtdProds(iQtd){
    var oDivQtdProd=fnGetID("HotSiteQtd");
    if(oDivQtdProd){
      if(iQtd==0){oDivQtdProd.innerHTML=rk("product-list-no-products-found")}
      else if(iQtd==1){oDivQtdProd.innerHTML=rk("product-list-found") +" <b>"+ iQtd +"</b> "+ rk("product-list-product")+":"}
      else{oDivQtdProd.innerHTML=rk("product-list-found-plural") +" <b>"+ iQtd +"</b> "+ rk("product-list-product-plural")+":"}
    }
  } 

  function fnRemoveFilter(FilName,FilValue){
    var oFiltroItens=document.getElementsByName("filters");
    if(oFiltroItens){
      var iTamFiltroItens=oFiltroItens.length;
      for(var i=0;i<iTamFiltroItens;i++){
        if(FilName!=""){
          var oFilName=oFiltroItens[i].getAttribute("data-fil-name");
          var oFilValue=oFiltroItens[i].value;
          if(oFilName==FilName && oFilValue==FilValue)oFiltroItens[i].checked=false;
        }
        else{oFiltroItens[i].checked=false;}
      }
      LibHotSite$.fnChangeFilters();
    }
  }

  return{
    aFiltersHotsite:aFiltersHotsite,
    oDicCat:oDicCat,
    fnGetID:fnGetID,
    fnInit:fnInit,
    fnChangeFilters:fnChangeFilters,
    fnRemoveFilter:fnRemoveFilter,
    fnSearchFil:fnSearchFil,
    fnHideFil:fnHideFil
  }

})();