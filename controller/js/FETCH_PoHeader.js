sap.ui.getCore().AppContext.FETCH_PoHeader = function () {
	
		

				// if ( sap.ui.getCore().AppContext.lastSelected_POAction === "PO_ACTION__NEW" ) {
				// 	sap.ui.getCore().AppContext.CurrentMODEL_Header = new sap.ui.model.json.JSONModel();
				// 	sap.ui.getCore().AppContext.CurrentMODEL_Header.setData(sap.ui.getCore().AppContext.CreateEmptyJSONStructure_HEADER());
				// 	SetUpFields();
				// 	SetFieldsState();
				// }
				
				// else {
						
				// 		// If thre's no new PO creation ... fetching data for existing PO and populating fields
				// 		sap.ui.getCore().AppContext.modelPOItemsDetails.read("/ZtgetpoheaderSet",
				// 							{
				// 								filters : [ new sap.ui.model.Filter("PoNumber", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().AppContext.lastSelected_PONumber),
				// 										    new sap.ui.model.Filter("PoItem", sap.ui.model.FilterOperator.EQ, "00000")
				// 										  ],
												
				// 								success : function(oData, oResponse) {
				// 									// Check here and destroy old model if existing
				// 									sap.ui.getCore().AppContext.CurrentMODEL_Header = new sap.ui.model.json.JSONModel();
				// 									sap.ui.getCore().AppContext.CurrentMODEL_Header.setData(oData.results[0]);
													
				// 									SetUpFields();
				// 									SetFieldsState();
				// 								},
				// 								error : function(error) {
				// 					        		sap.ui.getCore().AppContext.ShowMessage(error);
				// 								}
				// 							});
				
				// }
				

// 				var modelDocumentType = null;
// 				var modelCompanyCode = null;
// 				var modelPurchasingOrganization = null;
// 				var modelSupplier = null;
// 				var modelCurrency = null;
// 				var modelRequisitioner = null;
// 				var modelPaymentTerms = null ;


// 				function Read_DocumentType ( has_filter , filter_field , filter_value ) {
// 					// Reading Document Type
// 							sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetdoctypeSet" ,
// 								{
// 									filters : !(has_filter===undefined) ? [new sap.ui.model.Filter(filter_field, sap.ui.model.FilterOperator.EQ, filter_value)] : null ,
// 									success : function(oData, oResponse) {
// 										modelDocumentType = new sap.ui.model.json.JSONModel();
// 						        		modelDocumentType.setData(oData);
// 						        		//mainViewHandle.byId("comboDocumentType").setModel(modelDocumentType);
// 									},
// 									error : function(error) {
// 						        		sap.ui.getCore().AppContext.ShowMessage(error);
// 									}
// 								});
// 				}
			
			
// 				function Read_CompanyCode ( has_filter , filter_field , filter_value ) {
// 					// Reading Company Code
// 					sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetcompcodeSet" ,
// 						{
// 							filters : !(has_filter===undefined) ? [new sap.ui.model.Filter(filter_field, sap.ui.model.FilterOperator.EQ, filter_value)] : null ,
// 							success : function(oData, oResponse) {
// 								modelCompanyCode = new sap.ui.model.json.JSONModel();
// 				        		modelCompanyCode.setData(oData);
// 				        		mainViewHandle.byId("comboCompanyCode").setModel(modelCompanyCode);
// 							},
// 							error : function(error) {
// 				        		sap.ui.getCore().AppContext.ShowMessage(error);
// 							}
// 						});
// 				}
				
// 				function Read_PurchasingOrganization ( has_filter , filter_field , filter_value ) {
// 					// Purchasing Organization
// 					sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetpurchorgSet" ,
// 					{
// 						filters : !(has_filter===undefined) ? [new sap.ui.model.Filter(filter_field, sap.ui.model.FilterOperator.EQ, filter_value)] : null ,
// 						success : function(oData, oResponse) {
// 							modelPurchasingOrganization = new sap.ui.model.json.JSONModel();
// 			        		modelPurchasingOrganization.setData(oData);
// 			        		mainViewHandle.byId("comboPurchasingOrganization").setModel(modelPurchasingOrganization);
// 						},
// 						error : function(error) {
// 			        		sap.ui.getCore().AppContext.ShowMessage(error);
// 						}
// 					});
// 				}
			
			
// 				function Read_Supplier ( has_filter , filter_field , filter_value ) {
// 					// Supplier
// 					sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetvendorSet" ,
// 					{
// 						filters : !(has_filter===undefined) ? [new sap.ui.model.Filter(filter_field, sap.ui.model.FilterOperator.EQ, filter_value)] : null ,
// 						success : function(oData, oResponse) {
// 							modelSupplier = new sap.ui.model.json.JSONModel();
							
// 							modelCurrency.setSizeLimit(sap.ui.getCore().AppContext.MaxModelEntities);
							
// 			        		modelSupplier.setData(oData);
			        		
// 			        		//mainViewHandle.byId("comboSupplier").setModel(modelSupplier);
// 			        		//
// 			        	//	mainViewHandle.byId("comboPaymentTerms").setModel(modelSupplier);
// 						},
// 						error : function(error) {
// 			        		sap.ui.getCore().AppContext.ShowMessage(error);
// 						}
// 					});
// 				}
			
// 				function Read_PurchasingGroup ( has_filter , filter_field , filter_value ) {
// 					// Purchasing Group
// 					sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetpurgroupSet" ,
// 					{
// 						filters : !(has_filter===undefined) ? [new sap.ui.model.Filter(filter_field, sap.ui.model.FilterOperator.EQ, filter_value)] : null ,
// 						success : function(oData, oResponse) {
// 							var modelPurchasingGroup = new sap.ui.model.json.JSONModel();
// 			        		modelPurchasingGroup.setData(oData);
// 			        	//	mainViewHandle.byId("comboPurchasingGroup").setModel(modelPurchasingGroup);
// 						},
// 						error : function(error) {
// 			        		sap.ui.getCore().AppContext.ShowMessage(error);
// 						}
// 					});
					
// 				}
				
// 				function Read_Currency ( has_filter , filter_field , filter_value ) {
// 					// Currency
// 					sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetcurrencySet" ,
// 					{
// 						filters : !(has_filter===undefined) ? [new sap.ui.model.Filter(filter_field, sap.ui.model.FilterOperator.EQ, filter_value)] : null ,
// 						success : function(oData, oResponse) {
// 							modelCurrency = new sap.ui.model.json.JSONModel();
							
// 							modelCurrency.setSizeLimit(sap.ui.getCore().AppContext.MaxModelEntities);
							
// 			        		modelCurrency.setData(oData);
// 			        		//mainViewHandle.byId("comboCurrency").setModel(modelCurrency);
// 						},
// 						error : function(error) {
// 			        		sap.ui.getCore().AppContext.ShowMessage(error);
// 						}
// 					});
// 				}
			
// 				function Read_Requisitioner ( has_filter , filter_field , filter_value ) {
// 					// Requisitioner
// 					sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetpreqnameSet" ,
// 					{
// 						filters : !(has_filter===undefined) ? [new sap.ui.model.Filter(filter_field, sap.ui.model.FilterOperator.EQ, filter_value)] : null ,
// 						success : function(oData, oResponse) {
// 							modelRequisitioner = new sap.ui.model.json.JSONModel();
// 			        		modelRequisitioner.setData(oData);
// 			        		mainViewHandle.byId("comboRequisitioner").setModel(modelRequisitioner);
// 						},
// 						error : function(error) {
// 			        		sap.ui.getCore().AppContext.ShowMessage(error);
// 						}
// 					});
					
// 				}
				
// 				function Read_PaymentTerms ( has_filter , filter_field , filter_value ) {
// 					// Payment Terms
// 					sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetpaymentSet" ,
// 					{
// 						filters : !(has_filter===undefined) ? [new sap.ui.model.Filter(filter_field, sap.ui.model.FilterOperator.EQ, filter_value)] : null ,
// 						success : function(oData, oResponse) {
// 							modelPaymentTerms = new sap.ui.model.json.JSONModel();
// 			        		modelPaymentTerms.setData(oData);
// 			        		mainViewHandle.byId("comboPaymentTerms").setModel(modelPaymentTerms);
// 						},
// 						error : function(error) {
// 			        		sap.ui.getCore().AppContext.ShowMessage(error);
// 						}
// 					});
					
// 				}
				
			
// 				Read_DocumentType();
// 				Read_CompanyCode();
// 				Read_PurchasingOrganization();
// 				Read_Supplier();
// 				Read_PurchasingGroup();
// 				Read_PaymentTerms(true,"Spras","EN");
// 				Read_Currency(true,"Spras","EN");
// 				Read_Requisitioner();
				
	
// 				// // Change Handlers
				
// 				// // Company Code Change Handler ---> Change in Purchasing Organization
// 				// mainViewHandle.byId("comboCompanyCode").attachChange(function( oEvent ) {
// 				// 	var selectedKey = oEvent.getSource().getSelectedItem().getKey();
// 				// 	Read_PurchasingOrganization(true,"CompCode",selectedKey);
// 				// 	mainViewHandle.byId("comboPurchasingOrganization").setEnabled(true);
// 				// 	mainViewHandle.byId("comboPurchasingOrganization").setSelectedKey(null);
// 				// });
				
// 				// // Purchasing Organization Change ---> Change in Supplier
// 				// mainViewHandle.byId("comboPurchasingOrganization").attachChange(function( oEvent ) {
// 				// 	var selectedKey = oEvent.getSource().getSelectedItem().getKey();
// 				// 	Read_Supplier(true,"PurchOrg",selectedKey);
// 				// 	mainViewHandle.byId("comboSupplier").setEnabled(true);
// 				// 	mainViewHandle.byId("comboSupplier").setSelectedKey(null);
// 				// 	mainViewHandle.byId("comboCurrency").setSelectedKey(null);
// 				// 	mainViewHandle.byId("comboPaymentTerms").setSelectedKey(null);
// 				// });
				
// 				// Supplier Change Handler
// /*				mainViewHandle.byId("comboSupplier").attachChange(function( oEvent ) {
					
// 						var selectedKey = oEvent.getSource().getSelectedItem().getKey();
// 						var collection = modelSupplier.getData().results;
						
// 						var foundIndex = - 1 ;
// 						for ( var i = 0; i < collection.length; i++ ){
// 							if (collection[i].Vendor === selectedKey) {
// 								foundIndex = i;
// 								break;
// 							}
// 						}
						
// 						var payment_term__1 = modelSupplier.getProperty("/results/"+foundIndex+"/Pmnttrmsname" );
// 						var payment_term__2 = modelSupplier.getProperty("/results/"+foundIndex+"/Pmnttrms" );
						
// 						var currency = modelSupplier.getProperty("/results/"+foundIndex+"/Currency" );
						
// 						//mainViewHandle.byId("inputPaymentTerms").setValue(payment_term__1+" ( "+payment_term__2+" )");
// 						mainViewHandle.byId("comboPaymentTerms").setSelectedKey(payment_term__2);
// 						mainViewHandle.byId("comboCurrency").setSelectedKey(currency); ///// !!!!!!!!
// 						mainViewHandle.byId("comboCurrency").setEnabled(true);
						
						
// 					});*/
					
	return null ;
};