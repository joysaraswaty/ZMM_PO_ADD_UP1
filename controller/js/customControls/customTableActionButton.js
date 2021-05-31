sap.ui.getCore().AppContext.CreateCustomTableActionButton = function ( deletion_flag ) {
	
	//var buttonIcon = (deletion_flag === "X") ? 'sap-icon://sys-cancel-2' : 'sap-icon://edit' ;
	return new sap.m.Button({ style: sap.m.ButtonType.Default, icon: 'sap-icon://sys-cancel-2' }) ;

} ;