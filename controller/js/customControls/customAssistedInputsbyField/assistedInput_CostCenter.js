sap.ui.getCore().AppContext.assistedInput_CostCenter = function ( selectionMadeFunction ) {

	var __parentRowIndex = undefined ;
	var __selectedHelperValue = undefined ;

	 var assistedInput = new sap.m.Input({
                      type: sap.m.InputType.Text,
                      value : "",
                      showSuggestion: true,
                      suggestionItems: {
                        path: "/results",
                        template: new sap.ui.core.Item({
                          text: "Costcenter"
                        })
                      },
                      showValueHelp: true,
                      valueHelpRequest: function (oEvent) {
                      	
                      	__parentRowIndex = oEvent.getSource().getParent().getIndex() ;
                      	
                      			sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetcostcenterSet",
									{
										filters : [new sap.ui.model.Filter("Kokrs", sap.ui.model.FilterOperator.EQ, "1000"),
										new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN")],
										success : function(oData, oResponse) {
											var helperModel =  new sap.ui.model.json.JSONModel();
						        			helperModel.setData(oData);

						        			var selectDialog = sap.ui.getCore().AppContext.valueHelpSelectDialog__AccountAssesment = new sap.m.SelectDialog({
						        					title: "Select Cost Center",
						                            confirm: function(oevent){
															var index = parseInt((oevent.mParameters.selectedContexts[0].sPath).replace("/results/",""));
															__selectedHelperValue = helperModel.getProperty("/results/"+index+"/"+"Costcenter" );
						                            	selectionMadeFunction(__parentRowIndex,__selectedHelperValue);
						                            },
						                            cancel: function(oevent){}
					                          });
					                          
					                          selectDialog.bindAggregation("items",{
											            path:"/results",
											            template: new sap.m.StandardListItem({
											              	title: "{Costcenter} ({Costcentertxt})"
											            })
											          });
						        			
						        			selectDialog.setModel(helperModel);
											selectDialog.open();
						        			
						        			
										},
										error : function(error) {
							        		sap.ui.getCore().AppContext.ShowMessage(error);
										}
									});
                      }
	 });

		return assistedInput;
	
};