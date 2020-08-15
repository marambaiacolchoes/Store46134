{
  "enabledFeature": true,
  "cartRules": [
    {
      "enabledRule": true,
      "ruleName": "Leve 3 Pague 2 free",
      "ruleDescr": "Compre 3 Samsung e pague 2",
      "ruleConditions": {
        "validFrom": "2019-08-29T15:58:00.000Z",
        "validUntil": "2020-09-03T22:40:00.000Z",
        "minValidItems": 2
      },
      "itemConditions": {
        "categoryIds": [
          7345
        ]
      },
      "action": {
        "type": "freeOffer",
        "multipleQuantity": 3
      }
    },
    {
      "enabledRule": true,
      "ruleName": "Desconto no terceiro discount",
      "ruleDescr": "Desconto no terceiro item da categoria 7348",
      "ruleConditions": {
        "validFrom": "2020-02-03T14:11:00.000Z",
        "validUntil": "2020-06-20T14:11:00.000Z",
        "minValidItems": 2
      },
      "itemConditions": {
        "categoryIds": [
          7348
        ],
        "minQuantity": 1
      },
      "action": {
        "type": "discountOffer",
        "categoryIds": [
          7348
        ],
        "priceMultiplier": 0.5,
        "maxItemQuantity": 1,
        "multipleQuantity": 1
      }
    }
  ]
}
