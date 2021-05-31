sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"PurchaseOrdersPurchaseOrders/model/models",
	"sap/ui/core/routing/History"
	
], function(UIComponent, Device, models, History) {
	"use strict";

	return {

		lastFetchedItemIndexInCurrentPO_POItem : "00000" ,
		
		modelGetPOs : undefined ,
		modelGetPOs_Content : undefined,
		
		CurrentMODEL_Header : undefined,
		CurrentMODEL_Items : undefined,
		
		lastSelected_PONumber : "",
		lastSelected_POItem : "" ,
		lastSelected_ItemRowIndex : "" ,
		lastSelected_POAction : undefined ,
		// "PO_ACTION__NEW" , "PO_ACTION__COPY" , "PO_ACTION_EDIT"
		// following row added on 12-Dec-2017 due to approval status change enhacement
		lastSelected_POApprovalStatus : undefined ,

		tablePOs : undefined,
		
		tablePOItems : undefined ,
		tablePOAdress : undefined ,
		tablePOText : undefined,
		tablePOSubItems : undefined ,
		tableItemHistory : undefined ,
		// following one line added due to addition of the plant field in header 4 Dec 2017
		tablePOAddress : undefined ,
		tablePOAttachment : undefined ,
		dialogSubItems : undefined ,
		dialogItemHistory : undefined,
		
		handle_to_HandlePOView : undefined,    
		
		
		__inputPONumber : undefined ,
		__inputDocumentType : undefined,
		__inputCompanyCode : undefined,
		__inputPurchasingOrganization : undefined ,
		__inputSupplier : undefined,
		__inputPurchasingGroup : undefined,
		__inputTotalPOValue : undefined,
		__inputPaymentTerms : undefined,
		__inputCurrency : undefined,
		__inputRequisitioner : undefined ,
		__inputEmail : undefined,
		__inputApprover : undefined,
		/*following line changed due to addition of Header Text field in header 7 feb 2018*/
		__inputHeaderText : undefined,
		
		lastSelected_ForNewItem_UM_PoUnit : "",
		lastSelected_ForNewItem_UM_PoUnitText : "",
		lastSelected_ForNewItem_Plant_Plant : "",
		lastSelected_ForNewItem_Plant_PlantText : "",
		
		
		defaultPlantAddres_Name : undefined ,
		defaultPlantAddres_Street : undefined ,
		defaultPlantAddres_StreetNo : undefined ,
		defaultPlantAddres_PostlCod1 : undefined ,
		defaultPlantAddres_City : undefined ,
		defaultPlantAddres_Region : undefined ,
		defaultPlantAddres_Country : undefined ,
		
		
		selectedDistributionIsQuantity : false ,
		selectedDistributionIsPercentage : false ,
		

		CurrentMODEL_SubItems : undefined ,
		CurrentMODEL_SubItems_Entries_ALL : undefined ,
		CurrentMODEL_SubItems_Entries_InsideDistribution : undefined ,
		CurrentMODEL_SubItems_Entries_OutsideDistribution : undefined ,
					
					
		CurrentMODEL_SubItems_MaxDistrib_Quantity : undefined ,
		CurrentMODEL_SubItems_MaxDistrib_Percentage : 100 ,
				
				
		CurrentMODEL_ItemHistory : undefined ,		
				
		selectedDistribution : undefined ,		
				
		// openTextNav var is added so that back navigation will lead to openText app
		openTextNav : false ,
		
		// to support default text in German we need user language
		sCurrentLocale : undefined  ,
		
		Initialize : function () {

		},

		displayMessage : function(message) {
				jQuery.sap.require("sap.m.MessageBox");
	       		sap.m.MessageBox.show(
					     (message), {
					          icon: sap.m.MessageBox.Icon.INFORMATION,
					          title: "Message",
					          actions: [sap.m.MessageBox.Action.OK],
					          onClose: function(oAction) {
					          }
					      }
					    );
		},
		
		
		displayValidationMessageToast : function ( message ) {
				sap.m.MessageToast.show(message, {
			    duration: 3000,                  // default
			    width: "50em",                   // default
			    my: "center bottom",             // default
			    at: "center bottom",             // default
			    of: window,                      // default
			    offset: "0 0",                   // default
			    collision: "fit fit",            // default
			    onClose: null,                   // default
			    autoClose: true,                 // default
			    animationTimingFunction: "ease", // default
			    animationDuration: 1000,         // default
			    closeOnBrowserNavigation: true   // default
			});
		},
		
		
		formatDateForSAP : function ( inputDate ) {
				var day = inputDate.getDate().toString();
				
				if (day.length < 2) {
					day = "0"+day ;
				}
				
				var month = (inputDate.getMonth() + 1).toString();
				if (month.length < 2) {
					month = "0" + month;
				}
				
				var year = inputDate.getFullYear().toString();
				
				return  year + "-" + month + "-" + day;
		},
		
		/*function to restrict upto 3 digits after decimal for Item vale filed in posting*/
			format_3DigitsDecimalNumber: function(inputValue) {
			if ( (inputValue) && (inputValue !== "") && (inputValue !== undefined ))
			{
				inputValue = inputValue.toString();
				if (inputValue)
					if (inputValue.indexOf('.') != -1) {
						var places = inputValue.length - inputValue.indexOf('.') - 1;
						if (places >= 3) {
							var num = parseFloat(inputValue);
							if ( num % 1 > 0 )
								inputValue = num.toFixed(3);
							else
								inputValue = parseInt(num);
						}
					}
			}	
				return inputValue;
			},
		
		navBack: function () {
				var oHistory = History.getInstance();
				var sPreviousHash = oHistory.getPreviousHash();
	
				if (sPreviousHash !== undefined) {
					if(this.openTextNav){
						window.history.go(-2);
					} else {
					window.history.go(-1);
					}
				} else {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					/*following line changed on 8 Nov 2017
					oRouter.navTo("routeManagePOs", true);*/
					oRouter.navTo("targetManagePOs", true);
				}
		},
		
		validateDataBeforePOST : function () {
				if (
					(this.CurrentMODEL_Header.getProperty("/DocType") === "") ||
					(this.CurrentMODEL_Header.getProperty("/DocTypetxt") === "") ||
					(this.CurrentMODEL_Header.getProperty("/CompCode") === "") ||
					(this.CurrentMODEL_Header.getProperty("/CompCodetxt") === "") ||
					(this.CurrentMODEL_Header.getProperty("/PurchOrg") === "") ||
					(this.CurrentMODEL_Header.getProperty("/PurchOrgtxt") === "") ||
					(this.CurrentMODEL_Header.getProperty("/Vendor") === "") ||
					(this.CurrentMODEL_Header.getProperty("/Vendorname") === "") ||
					(this.CurrentMODEL_Header.getProperty("/PurGroup") === "") ||
					(this.CurrentMODEL_Header.getProperty("/PurGrouptxt") === "") ||
					(this.CurrentMODEL_Header.getProperty("/Currency") === "") ||
					(this.CurrentMODEL_Header.getProperty("/PreqName") === "") ||
					(this.CurrentMODEL_Header.getProperty("/PreqNametxt") === "") ||
					(this.CurrentMODEL_Header.getProperty("/EMail") === "") ||
				
				(	((this.CurrentMODEL_Header.getProperty("/EMail").slice(-8)).toUpperCase() !== "@KAO.COM") &&
						((this.CurrentMODEL_Header.getProperty("/EMail").slice(-14)).toUpperCase() !== "@KPSS-HAIR.COM") &&
							((this.CurrentMODEL_Header.getProperty("/EMail").slice(-17)).toUpperCase() !== "@KPSS-HAIR.COM.HK")
							)
				)
				return 1;
				var allItemFieldsOk = true ;
				
				this.CurrentMODEL_Items.getData().results.forEach(function(item_element){
					if (
						(item_element.Acctasscat === "") ||
						(item_element.ShortText === "") ||
						(item_element.MatlGroup === "") ||
						(item_element.Plant === "") ||
						(item_element.DeliveryDate === "") ||
						(item_element.Quantity === "") ||
						(item_element.NetPrice === "") ||
						(item_element.Currency === "") ||
						(item_element.PriceUnit === "") ||
						(item_element.GlAccount === "") ||
						(item_element.Costcenter === "")
					){
						item_element.valueStateFlag = true;

					allItemFieldsOk = false ;
					}
				});
				this.CurrentMODEL_Items.refresh();
				
				//Issue 48
				var selectedDocType = this.CurrentMODEL_Header.getProperty("/DocType");
				if (selectedDocType === "NB2Z" || selectedDocType === "N2ZD"
					|| selectedDocType === "NB3Z" || selectedDocType === "NB2F"
				){
					this.CurrentMODEL_Items.getData().results.forEach(function(item_element){
						if(item_element.Orderid === "") {
								allItemFieldsOk = false ;
							} else {
							if(item_element.Costcenter === ""){
								if(selectedDocType === "NB2F"){
									allItemFieldsOk = true ;	
								}else{
									allItemFieldsOk = false ;	
								}
								
							}
							}
					});
				}
				
				//Issue 48
						
				if (!allItemFieldsOk)
					return 2 ;

					return 0 ;
		}
	
	};
});