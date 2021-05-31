sap.ui.getCore().AppContext.GetItemsTableElementByIndex = function( rowIndex , colIndex ) {
 	return sap.ui.getCore().AppContext.tablePOItems.getRows()[rowIndex].getCells()[colIndex] ;
 } ;