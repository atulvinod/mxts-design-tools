
(
  function () {
    const vscode = acquireVsCodeApi();
    const coreLibLocationView = document.querySelector( '#core-lib-location' );
    const openCoreLibSettingsButton = document.querySelector( '#open-core-lib-settings' );
    const validCoreLibBanner = document.querySelector( '#lib-location-valid' );
    const invalidCoreLibBanner = document.querySelector( '#lib-location-invalid' );
    const baseREMView = document.querySelector( '#base-rem-value' );
    const updateBaseREMButton = document.querySelector( '#open-base-rem-value' );

    window.addEventListener( 'message', event => {
      const { args, command } = event.data;
      switch ( command ) {
        case "UPDATE_CORE_LIB_LOCATION": {
          coreLibLocationView.value = args;
          break;
        }
        case "UPDATE_CORE_LIB_VALID": {
          if ( args ) {
            validCoreLibBanner.classList.add( 'd-block' );
            validCoreLibBanner.classList.remove( 'd-none' );

            invalidCoreLibBanner.classList.add( 'd-none' );
            invalidCoreLibBanner.classList.remove( 'd-block' );
          } else {
            validCoreLibBanner.classList.add( 'd-none' );
            validCoreLibBanner.classList.remove( 'd-block' );

            invalidCoreLibBanner.classList.add( 'd-block' );
            invalidCoreLibBanner.classList.remove( 'd-none' );
          }
          break;
        }
        case "UPDATE_BASE_REM": {
          baseREMView.value = args;
          break;
        }
      }
    } );


    function postMessageToVs ( command, args ) {
      vscode.postMessage( {
        command,
        args
      } );
    }


    openCoreLibSettingsButton.addEventListener( 'click', () => {
      postMessageToVs( 'OPEN_CORE_LIB_SETTINGS', null );
    } );

    updateBaseREMButton.addEventListener( 'click', () => {
      postMessageToVs( 'OPEN_BASE_REM_SETTINGS', null );
    } );
  }
)();
