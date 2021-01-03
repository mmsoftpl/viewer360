import InitRenderer, { getCameraProps, onApply, setCameraProps, MoveUp, MoveDown, MoveLeft, MoveRight, ZoomIn, ZoomOut } from "./renderer.js";
import { toShareLink, fromShareLink } from "./sharelink.js"

const previewImage = () => {
    let src = document.getElementById('textureUri').value;
    document.getElementById('uriimage').src = document.getElementById('textureUri').value;
}

const isImage = () => {
    const textureImage = document.getElementById('textureimage');
    return textureImage.src && textureImage.width && textureImage.height;
}

const isClipboardImage = () => {
    const textureImage = document.getElementById('textureimage');
    return textureImage.src && textureImage.src.startsWith("data");
}

var pushStateUpdater = null;

const updateControls = () => {

    if (document.getElementById("pills-uri-tab").classList.contains("active")) {
        document.getElementById("uripreview").classList.remove("d-none");
    }
    else {
        document.getElementById("uripreview").classList.add("d-none");
    }

    if (document.getElementById("pills-clipboard-tab").classList.contains("active"))
        document.getElementById("clipboardpreview").classList.remove("d-none");
    else
        document.getElementById("clipboardpreview").classList.add("d-none");

    pushStateUpdater = clearTimeout(pushStateUpdater);

    pushStateUpdater = setTimeout(() => {
        
        var cameraProps = getCameraProps();
        var uri = "";
    
        if (isClipboardImage() || !isImage()) {
            document.getElementById("sharebutton").classList.add("d-none");
        }
        else {
            document.getElementById("sharebutton").classList.remove("d-none");
            uri = document.getElementById('textureimage').src;
            
        }
        const shareLink = toShareLink(uri, cameraProps);
        if (uri)
            window.history.pushState(document.title, document.title, shareLink);
        else
            window.history.pushState(document.title, document.title, getPathFromUrl(window.location.href));
            
    }, 500);
}

const updateShareLink = () => {
    var textureUri = "";

    if (document.getElementById("pills-uri-tab").classList.contains("active")) {
        textureUri = document.getElementById("textureimage").src;
    }

    var link = window.location;
    document.getElementById("shareUri").value = link;

}

const copyShareLink = () => {
    var copyText = document.getElementById("shareUri");

    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
}

const pressApply = (cameraProps) => {
    
    var targetImage = document.getElementById("textureimage");	

	if (document.getElementById("pills-uri-tab").classList.contains("active")) {
		targetImage.src = document.getElementById("uriimage").src;
	}
	else
		if (document.getElementById("pills-clipboard-tab").classList.contains("active")) {
			targetImage.src = document.getElementById("clipboardimage").src;
        }  

    if (!cameraProps)
    {
        cameraProps = { fov: 75, lat: 0, lon: 0};        
    }

    setCameraProps(cameraProps);

    updateControls();
}

const showSpinner = () => {
    document.getElementById("spinner").classList.remove("d-none")
}

const hideSpinner = () => {
    document.getElementById("spinner").classList.add("d-none")
}

const showTab = (tabId) => {
    var someTabTriggerEl = document.querySelector(tabId)
    var tab = new bootstrap.Tab(someTabTriggerEl)
    tab.show()
}

const showModal = (modalId) => {
    var myModal = new bootstrap.Modal(document.getElementById(modalId), {
        keyboard: false
    })
    myModal.show()
}

const onPaste = (pasteEvent) => {
    var item = pasteEvent.clipboardData.items[0];

    if (item.type.indexOf("image") === 0) {

        showTab('#pills-clipboard-tab')

        var blob = item.getAsFile();
        var reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById('clipboardimage').src = event.target.result;

            if (!document.getElementById('settingsModal').classList.contains("show"))
                pressApply();
        };

        reader.readAsDataURL(blob);
    }
    else {
        showTab('#pills-uri-tab')

        // Get pasted data via clipboard API
        const clipboardData = pasteEvent.clipboardData || window.clipboardData;
        const pastedData = clipboardData.getData('Text');

        if (!pastedData) return;

        document.getElementById('textureUri').value = pastedData;
        previewImage();

        if (!document.getElementById('settingsModal').classList.contains("show"))
            pressApply();        
    }
}

var repeatInterval = null;

const repeatClick = (id, method) =>
{   
    clearInterval(repeatInterval);

    document.getElementById(id).addEventListener("mousedown", ()=>
    {
        method();
        repeatInterval = setInterval(() => {
            method();
        }, 100);
    });

    document.getElementById(id).addEventListener("mouseup", ()=>
    {
        clearInterval(repeatInterval);
    });

    document.getElementById(id).addEventListener("mouseleave", ()=>
    {
        clearInterval(repeatInterval);
    });    
}

window.onload = () => {

    var textureImage = document.getElementById("textureimage");	

 	textureImage.onload = () => {
         hideSpinner();
         onApply();
	};
	textureImage.onerror = (err) => {
        
	};
	textureImage.onabort = (msg) => {
		//document.getElementById('textureUri').classList.add("is-invalid");
		//alert(`Aborting loading image: \n ${textureUri}`);
	};
	textureImage.crossOrigin = "anonymous";
	textureImage.src = textureUri;
    
    document.getElementById('button-apply').addEventListener('click', ()=> { pressApply() } );

    document.getElementById("textureUri").addEventListener("change", previewImage);
    document.getElementById("textureUri").addEventListener("keyup", previewImage);

    repeatClick("buttonUp", MoveUp);
    repeatClick("buttonDown", MoveDown);
    repeatClick("buttonRight", MoveRight);
    repeatClick("buttonLeft", MoveLeft);
    repeatClick("buttonZoomOut", ZoomOut);
    repeatClick("buttonZoomIn", ZoomIn);

    document.getElementById('shareModal').addEventListener('shown.bs.modal', updateShareLink);
    document.getElementById('button-copy').addEventListener('click', copyShareLink);

    document.getElementById('examplelink').addEventListener('click',
        () => {
            document.getElementById("textureUri").innerText = "https://tatromaniak.pl/wp-content/uploads/2015/07/szpiglasowy_rafal_ociepka_360.jpg";
            document.getElementById('examplepanorama').remove();
            previewImage();
        });

    var tabEl = document.querySelectorAll('[data-bs-toggle="tab"]')
    tabEl.forEach(element => {
        element.addEventListener('shown.bs.tab', updateControls);
    });

    document.onpaste = onPaste;
    
    InitRenderer("container", updateControls);

    const uriData = fromShareLink(window.location.href);
    if (uriData && uriData.uri) {
        document.getElementById('textureUri').value = uriData.uri;
        document.getElementById('uriimage').src = uriData.uri;
        document.getElementById('examplepanorama').remove();
        pressApply(uriData);
    }
    else {
        showModal('settingsModal');
        hideSpinner();
    }

    updateControls();

}