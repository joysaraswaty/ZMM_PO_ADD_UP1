sap.ui.getCore().AppContext.FETCH_PoAddress = function () {


								sap.ui.getCore().AppContext.tablePOAdress.addColumn(new sap.ui.table.Column({
					                     label : new sap.ui.commons.Label({ text : "Item" , tooltip : "Item" }),
					                     template : sap.ui.getCore().AppContext.assistedInput_AccountAssignment ( function (rowIndex,selectedValue) {
						                     	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,1).setValue(selectedValue); }),
					                     width : "11%"
					              }));
					              
					              				sap.ui.getCore().AppContext.tablePOAdress.addColumn(new sap.ui.table.Column({
					                     label : new sap.ui.commons.Label({ text : "Name" , tooltip : "Name" }),
					                     template : sap.ui.getCore().AppContext.assistedInput_AccountAssignment ( function (rowIndex,selectedValue) {
						                     	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,1).setValue(selectedValue); }),
					                     width : "11%"
					              }));
					              
					              				sap.ui.getCore().AppContext.tablePOAdress.addColumn(new sap.ui.table.Column({
					                     label : new sap.ui.commons.Label({ text : "Street" , tooltip : "Street" }),
					                     template : sap.ui.getCore().AppContext.assistedInput_AccountAssignment ( function (rowIndex,selectedValue) {
						                     	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,1).setValue(selectedValue); }),
					                     width : "11%"
					              }));
					              
					              				sap.ui.getCore().AppContext.tablePOAdress.addColumn(new sap.ui.table.Column({
					                     label : new sap.ui.commons.Label({ text : "House No" , tooltip : "House No" }),
					                     template : sap.ui.getCore().AppContext.assistedInput_AccountAssignment ( function (rowIndex,selectedValue) {
						                     	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,1).setValue(selectedValue); }),
					                     width : "11%"
					              }));
					              
					              				sap.ui.getCore().AppContext.tablePOAdress.addColumn(new sap.ui.table.Column({
					                     label : new sap.ui.commons.Label({ text : "Postal Code" , tooltip : "Postal Code" }),
					                     template : sap.ui.getCore().AppContext.assistedInput_AccountAssignment ( function (rowIndex,selectedValue) {
						                     	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,1).setValue(selectedValue); }),
					                     width : "11%"
					              }));
					              
					              				sap.ui.getCore().AppContext.tablePOAdress.addColumn(new sap.ui.table.Column({
					                     label : new sap.ui.commons.Label({ text : "City" , tooltip : "City" }),
					                     template : sap.ui.getCore().AppContext.assistedInput_AccountAssignment ( function (rowIndex,selectedValue) {
						                     	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,1).setValue(selectedValue); }),
					                     width : "11%"
					              }));
					              
					              				sap.ui.getCore().AppContext.tablePOAdress.addColumn(new sap.ui.table.Column({
					                     label : new sap.ui.commons.Label({ text : "Region" , tooltip : "Region" }),
					                     template : sap.ui.getCore().AppContext.assistedInput_AccountAssignment ( function (rowIndex,selectedValue) {
						                     	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,1).setValue(selectedValue); }),
					                     width : "11%"
					              }));
					              
					              				sap.ui.getCore().AppContext.tablePOAdress.addColumn(new sap.ui.table.Column({
					                     label : new sap.ui.commons.Label({ text : "Country" , tooltip : "Country" }),
					                     template : sap.ui.getCore().AppContext.assistedInput_AccountAssignment ( function (rowIndex,selectedValue) {
						                     	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,1).setValue(selectedValue); }),
					                     width : "11%"
					              }));
					              
					              				sap.ui.getCore().AppContext.tablePOAdress.addColumn(new sap.ui.table.Column({
					                     label : new sap.ui.commons.Label({ text : "Customer" , tooltip : "Customer" }),
					                     template : sap.ui.getCore().AppContext.assistedInput_AccountAssignment ( function (rowIndex,selectedValue) {
						                     	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,1).setValue(selectedValue); }),
					                     width : "11%"
					              }));
	
};