
(
  function () {
    const vscode = acquireVsCodeApi();
    const coreLibLocationView = document.querySelector( '#core-lib-location' );

    const openCoreLibSettings=  document.querySelector('#open-core-lib-settings');

    window.addEventListener( 'message', event => {
      const { args, command } = event.data;
      switch ( command ) {
        case "UPDATE_CORE_LIB_LOCATION": {
          coreLibLocationView.value = args;
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


    openCoreLibSettings.addEventListener('click', ()=>{
      postMessageToVs('OPEN_CORE_LIB_SETTINGS', null);
    });
  }
)();
