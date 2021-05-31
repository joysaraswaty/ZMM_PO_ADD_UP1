sap.ui.getCore().AppContext.assistedInput_MultipleAccounts = function ( selectionMadeFunction ) {

	var __parentRowIndex = undefined ;
	var __selectedHelperValue = undefined ;

	 var assistedInput = new sap.m.Input({
                      type: sap.m.InputType.Text,
                      value : "",
                      showSuggestion: true,
                      suggestionItems: {
                        path: "/results",
                        template: new sap.ui.core.Item({
                          text: "Vrtkz"
                        })
                      },
                      showValueHelp: true,
                      valueHelpRequest: function (oEvent) {
                      	
                      	__parentRowIndex = oEvent.getSource().getParent().getIndex() ;
                      	
                      			sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetmultipleSet",
									{
										filters : [],
										success : function(oData, oResponse) {
											var helperModel =  new sap.ui.model.json.JSONModel();
						        			helperModel.setData(oData);

						        			var selectDialog = sap.ui.getCore().AppContext.valueHelpSelectDialog__AccountAssesment = new sap.m.SelectDialog({
						        					title: "Select Cost Center",
						                            confirm: function(oevent){
															var index = parseInt((oevent.mParameters.selectedContexts[0].sPath).replace("/results/",""));
															__selectedHelperValue = helperModel.getProperty("/results/"+index+"/"+"Vrtkz" );
						                            	selectionMadeFunction(__parentRowIndex,__selectedHelperValue);
						                            },
						                            cancel: function(oevent){}
					                          });
					                          
					                          selectDialog.bindAggregation("items",{
											            path:"/results",
											            template: new sap.m.StandardListItem({
											              	title: "{Vrtkz} ({Distrib})"
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