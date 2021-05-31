sap.ui.getCore().AppContext.CreateCustomAssistedInput = function ( initialValue, placeHolder, serviceName , filtersInput , datasetBinding , fieldBindingKey , fieldBindingText, dialogTitle , selectionMadeFunction ) {

	var __parentRowIndex = undefined ;
	var __selectedHelperValue = undefined ;

	 var assistedInput = new sap.m.Input({
                      type: sap.m.InputType.Text,
                      placeholder: placeHolder,
                      value : "",
                      showSuggestion: true,
                      suggestionItems: {
                        path: "/results",
                        template: new sap.ui.core.Item({
                          text: fieldBindingKey
                        })
                      },
                      showValueHelp: true,
                      valueHelpRequest: function (oEvent) {
                      	
                      	__parentRowIndex = oEvent.getSource().getParent().getIndex() ;
                      	
                      			sap.ui.getCore().AppContext.modelTransfer.read(datasetBinding,
									{
										filters : filtersInput,
										success : function(oData, oResponse) {
											var helperModel =  new sap.ui.model.json.JSONModel();
						        			helperModel.setData(oData);

						        			var selectDialog = sap.ui.getCore().AppContext.valueHelpSelectDialog__AccountAssesment = new sap.m.SelectDialog({
						        					title: dialogTitle,
						                            confirm: function(oevent){
															var index = parseInt((oevent.mParameters.selectedContexts[0].sPath).replace("/results/",""));
															__selectedHelperValue = helperModel.getProperty("/results/"+index+"/"+fieldBindingKey );
														//assistedInput.setValueState(_val);
						                            	selectionMadeFunction(__parentRowIndex,__selectedHelperValue);
						                            },
						                            cancel: function(oevent){}
					                          });
					                          
					                          selectDialog.bindAggregation("items",{
											            path:"/results",
											            template: new sap.m.StandardListItem({
											              	title: "{"+fieldBindingKey+"}"
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