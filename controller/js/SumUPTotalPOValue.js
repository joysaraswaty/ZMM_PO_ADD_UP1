sap.ui.getCore().AppContext.SumUPTotalPOValue = function () {
	
	var totalSUM = 0.0 ;
	
	for ( var i = 0 ; i < sap.ui.getCore().AppContext.tablePOItems.getRows().length ; i ++ ) {
		totalSUM += parseFloat(sap.ui.getCore().AppContext.GetItemsTableElementByIndex(i,13).getValue()) ;
	}
	
			sap.ui.getCore().AppContext.handle_to_HandlePOView.byId("inputTotalPOValue").setValue(totalSUM);
};