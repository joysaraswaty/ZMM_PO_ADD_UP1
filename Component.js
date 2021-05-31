sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"PurchaseOrdersPurchaseOrders/model/models",
	"PurchaseOrdersPurchaseOrders/AppInstance"
], function(UIComponent, Device, models, AppInstance) {
	"use strict";
	
	return UIComponent.extend("PurchaseOrdersPurchaseOrders.Component", {
		"AppInstance" : AppInstance,
		metadata: {
			manifest: "json",
			config : {
				fullWidth : true
			}
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

/*sap.m.InputBase.prototype.onsaptabnext = function(){
    if(sap.m.InputBase.prototype.onsapenter){
		sap.m.InputBase.prototype.onsapenter.apply(this, arguments);
    }
};*/



			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			AppInstance.Initialize();
			
			// Initialize Router
			this.getRouter().initialize();
		},
		
		destroy : function() {
			console.log("Destroy called invoked !");
			sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
			//
			//AppInstance.__inputDocumentType.destroy();
			//AppInstance.__inputDocumentType = undefined ;
		}
	});
});