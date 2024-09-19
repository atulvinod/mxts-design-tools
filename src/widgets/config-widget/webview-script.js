
(
  function () {
    const vscode = acquireVsCodeApi();

    const coreLibLocationView = $( '#core-lib-location' );
    const openCoreLibSettingsButton = $( '#open-core-lib-settings' );
    const reloadDataButton = $( '#reload-data' );
    const validCoreLibBanner = $( '#lib-location-valid' );
    const invalidCoreLibBanner = $( '#lib-location-invalid' );

    const baseREMView = $( '#base-rem-value' );
    const updateBaseREMButton = $( '#open-base-rem-value' );

    const updateTokenToRemCalc = $( '#open-rem-calc-non-exact' );
    const tokenToRemCalcView = $( '#rem-calc-non-exact' );

    validCoreLibBanner.hide();
    invalidCoreLibBanner.hide();
    reloadDataButton.hide();

    window.addEventListener( 'message', event => {
      const { args, command } = event.data;
      switch ( command ) {
        case "UPDATE_CORE_LIB_LOCATION": {
          coreLibLocationView.val( args );
          break;
        }
        case "UPDATE_CORE_LIB_VALID": {
          if ( args ) {
            validCoreLibBanner.show();
            invalidCoreLibBanner.hide();
            reloadDataButton.show();
          } else {
            validCoreLibBanner.hide();
            invalidCoreLibBanner.show();
            reloadDataButton.hide();
          }
          break;
        }
        case "UPDATE_BASE_REM": {
          baseREMView.val( args );
          break;
        }
        case "UPDATE_NON_EXACT_TOKEN_TO_REM_CALC": {
          tokenToRemCalcView.val( args );
        }
      }
    } );


    function postMessageToVs ( command, args ) {
      vscode.postMessage( {
        command,
        args
      } );
    }


    openCoreLibSettingsButton.on( 'click', () => {
      postMessageToVs( 'OPEN_CORE_LIB_SETTINGS', null );
    } );

    updateBaseREMButton.on( 'click', () => {
      postMessageToVs( 'OPEN_BASE_REM_SETTINGS', null );
    } );

    reloadDataButton.on( 'click', () => {
      postMessageToVs( 'RELOAD_CONFIG', null );
    } );

    updateTokenToRemCalc.on( 'click', () => {
      postMessageToVs( 'OPEN_NON_EXACT_TO_REM_CALC', null );
    } );
  }
)();
