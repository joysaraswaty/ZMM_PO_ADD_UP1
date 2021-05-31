sap.ui.getCore().AppContext.calculableInput = function ( initialValue, selectionMadeFunction ) {

	var __parentRowIndex = undefined ;

	var calculableInput = new sap.m.Input({
		value : initialValue
	});
	
	calculableInput.attachLiveChange(function(oEvent) {
		__parentRowIndex = oEvent.getSource().getParent().getIndex();
		selectionMadeFunction(__parentRowIndex);
	});
	

	return calculableInput ;
	
};