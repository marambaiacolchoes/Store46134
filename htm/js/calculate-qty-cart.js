var zF$ = (function () {

  //CartUpdate
  function addUnitQtyProdCart(elem, number) {
    /* add or diminish the amount quantyty in cart page */
    var idElem = elem.getAttribute("data-qty-id"), elemQty = document.querySelector("#" + idElem);
    if (elemQty && typeof number === 'number') {
      var qtyNow = (elemQty.value == "") ? 0 : parseInt(elemQty.value);
      var newValue = parseInt(qtyNow) + (number);
      if (newValue > 0 && newValue < 1000) {
        elemQty.value = newValue;
        FCLib$.MirrorCartQty(elemQty);
        var isAlert = document.querySelector('.alert-updade-cart'), iSetTime = 10000; 
        document.getElementById("FCCartRecalculateBut").click();   
      }
    } else {
      console.log("addUnitQtyProdCart: object HTML undefined or parameter 'number' is not type number");
    }
  }

   function addInputQtyProdCart(selector) {
    /* add button for add or decrease quantity in cart page*/
    var aInputQtyProducts = document.querySelectorAll(selector);
    if (aInputQtyProducts && aInputQtyProducts.length > 0) {
      for (var i = 0; i < aInputQtyProducts.length; i++) {
        var oInputQty = aInputQtyProducts[i], idElem = oInputQty.id;
        if (typeof idElem !== 'undefined') {
          //create and add button decrease '-'
          var btnDecrease = document.createElement('span');
          btnDecrease.textContent = '-';
          btnDecrease.setAttribute('class', 'btn-qty-add btn-qty-decrease');
          btnDecrease.setAttribute('data-qty-id', idElem);
          btnDecrease.onclick = function () {
            zF$.addUnitQtyProdCart(this, -1);
          };
          //create and add button plus '+'
          var btnPlus = document.createElement('span');
          btnPlus.textContent = '+';
          btnPlus.setAttribute('class', 'btn-qty-add btn-qty-plus');
          btnPlus.setAttribute('data-qty-id', idElem);
          btnPlus.onclick = function () {
            zF$.addUnitQtyProdCart(this, 1);
          };
          oInputQty.parentNode.insertBefore(btnDecrease, oInputQty);
          oInputQty.parentNode.insertBefore(btnPlus, oInputQty.nextSibling);
        } else {
          console.log('addInputQtyProdCart: attribute id in object HTML undefined');
        }
      }
    } else {
      console.log('addInputQtyProdCart: fields inputs quantity undefined');
    }
  }

  function fnChangeInnerText(elem, text) {
    var elem = document.querySelector(elem);
    if (elem) elem.textContent = text;
  }

  /* exports */
  return {
    addUnitQtyProdCart: addUnitQtyProdCart,
    addInputQtyProdCart: addInputQtyProdCart,
    fnChangeInnerText: fnChangeInnerText,
  }
})();

(function () {
  //define class responsive for #idFCContent
  var getBodyClass = document.body.getAttribute('class');
  if (getBodyClass === "FCProduct ProductList" || getBodyClass === "FCNewsletter" || getBodyClass === "FCAdvancedSearch" || getBodyClass === "FCCategories") {
    var domColumn = document.getElementById('idFCContent');
    if (domColumn) domColumn.setAttribute('class', 'col-sm-8 col-md-9 col-lg-9');
  }
  else if (getBodyClass === "FCProduct ProductDet" || getBodyClass === "FCHelp") {
    var domColumn = document.getElementById('idFCContent');
    if (domColumn) domColumn.setAttribute('class', 'col-xs-12 col-sm-12 col-md-12 col-lg-12');
  }

  if (FC$.Page == "Cart") {
    zF$.addInputQtyProdCart(".FCCartQtyInput");
  }

  if (FC$.Page == "Cart") {
    zF$.fnChangeInnerText("#FCCartFreightSimulationBut", ""+ rk("cart-zip-code") +"");
    zF$.fnChangeInnerText("#FCCartRecalculateBut", ""+ rk("cart-update-text") +"");
    zF$.fnChangeInnerText("#idTxtRecalculateFC b", ""+ rk("cart-update-text") +"");
  }

})();