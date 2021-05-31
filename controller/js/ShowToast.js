sap.ui.getCore().AppContext.ShowToast = function ( messageString ) {
	
	sap.m.MessageToast.show(messageString,{ 
				duration: 3000,
				width : "25%",
			    onClose: null,
			    autoClose: true,
			    animationTimingFunction: "ease", 
			    animationDuration: 1000,
			    closeOnBrowserNavigation: false
	});

	
};