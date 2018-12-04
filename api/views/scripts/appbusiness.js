// Implementation of string.format function.
// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
        });
    };
}

$(document).ready(initializeEvents);

// function to initialize all the events on load.
function initializeEvents() {

    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        $('#pageerror').html('The File APIs are not fully supported in this browser. Please change or upgrade the browser.');
        return;
    }

    $('#uploadproduct').click(uploadproduct);

    $('#searchproduct').click(searchproduct);

    $('#clearsearch').click(loadproducts);

    loadproducts();

}

function uploadproduct() {

    var prodname = $('#productname').val();
    if (prodname == '') {
        displayerror('#uploaderror','product name cannot be emply.');
        return;
    }
    
    var filecontrol = $('#images');
    var files = filecontrol[0].files;
    if (files.length == 0) {
        displayerror('#uploaderror','select one or more product images to upload.');
        return;
    }

    var i = 0;
    var images = [];
    generatebase64imagesandupload(i, files, images, prodname);

}

function searchproduct() {
    
    var filecontrol = $('#searchimage');
    var files = filecontrol[0].files;
    if (files.length == 0) {
        displayerror('#searcherror','select one or more product images to upload.');
        return;
    }
    
    generatebase64imagesandsearch(files[0]);

}

function loadproducts() {
    fetch('http://localhost:4000/getallproducts')
    .then(function(response) {
        
        if(response.status != 200) {
            displayerror('#pageerror', 'response status is not 200 ok for get-all-product.');
            return;
        }

        return response.json();
    })
    .then(loadproductshtml)
    .catch(error => displayerror('#pageerror', 'response status is not 200 ok for get-all-product.'));
}

function loadproductshtml(products) {

    $('#productrow').html('');

    if(products.length == 0) {
        displayerror('#pageerror', 'No product received.');
        return;
    }
    
    products.forEach(product => {
        showproduct(product, false);
    });
}

function generatebase64imagesandsearch(sourceFile) {

    var reader = new FileReader();
    reader.readAsDataURL(sourceFile);

    reader.onload = function () {

        var base64imagestring = reader.result.split(",")[1];

        var image = {
            data: base64imagestring
        };

        passimagetosearchapi(image);
    };

    reader.onerror = function (error) {
        displayerror('#searcherror', error.message);
    };

}

async function passimagetosearchapi(image) {
    $.ajax({
        url: 'http://localhost:4000/searchproduct',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(image),
        success: function (searchresults) {
            loadproductshtml(searchresults);
        },
        error: function (err) {
            displayerror('#searcherror', 'response status is not 200 ok from searchproduct api call.');
        }
    });
}

function generatebase64imagesandupload(turnOf, sourceFiles, destImages, productName) {

    var ext = sourceFiles[turnOf].name.split(".").pop();
    var filename = turnOf + "-" + productName + "." + ext;

    var reader = new FileReader();
    reader.readAsDataURL(sourceFiles[turnOf]);

    reader.onload = function () {

        var base64imagestring = reader.result.split(",")[1];
        

        var image = {
            filename: filename,
            type: sourceFiles[turnOf].type,
            data: base64imagestring
        };
        destImages.push(image);

        // next image turn
        turnOf++;
        if(turnOf < sourceFiles.length) {
            generatebase64imagesandupload(turnOf, sourceFiles, destImages, productName);
            return;
        }

        var product = {
            productid: productName,
            productdisplayname: productName,
            images: destImages
        };
        passproducttouploadapi(product);
    };

    reader.onerror = function (error) {
        displayerror('#uploaderror', error.message);
    };
}

function passproducttouploadapi(product) {
    $.ajax({
        url: 'http://localhost:4000/uploadproduct',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(product),
        success: function (res) {
            showproduct(res, true);
        },
        error: function (err) {
            displayerror('#uploaderror', 'response status is not 200 ok from uploadproduct api call.');
        }
    });
}

function showproduct(product, atStart) {
    var producthtml =`
    <div class="block_19rjgc topRowGalleryItem_Z2pxRV8" data-element="nui-block" style="left:0%; width:23.0769%">
    <article class="productModule_1bYUwE" data-element="product-results-product-module-desktop">
        <div class="media_Z26M1zT" data-element="product-module-media">
            <img name="product-module-image" class="image_Z272g5Q" alt={0} src={1} data-element="nui-image product-module-media-image" />
        </div>
        <div class="colorCarousel_Z2scW8v colorCarousel_1VScPB" data-element="product-module-color-carousel" data-pagination="1/1">
            <div class="fixedFrame_2kSnRj" style="width: 180px; left: 0px">
                swatch List
            </div>
        </div>
        <div class="enticement_Z1UyJnV enticement_1szHOw newMarkdown_ZgSHz3 colorful_1QJtV8" data-element="product-module-enticement newMarkdown">
            <span class="highlight_Z1hnfhx">
            New Markdown
            </span>
        </div>
        <h3 class=" title_1qn8Kl title_ZCF4Hm dark_11BwPv brandon_RAXqx medium_dB0hp" data-element=" typography product-module-title">
            <span class="light_Z1MOMXL navigationLink_Z1yc2MG">
            <span>{0}</span>
            </span>
        </h3>
        <div class="salePrice_Z21Awkv price_Z1JgxME comfortable_Z2lRXyF component_24xPpj" data-element="product-module-sale-price product-module-price">
            <div class="priceLine_FlmKX original_2nTEBE" data-element="product-module-price-line product-module-price-line-original">
                <span class="label_Z1Jz5rX" data-element="product-module-price-line-label">
                Was:
                </span>
                <span class="price_Z1JgxME" data-element="product-module-price-line-price">
                $ (origioinal price)
                </span>
            </div>
            <div class="priceLine_FlmKX sale_Z1msUvH" data-element="product-module-price-line product-module-price-line-sale">
                <span class="label_Z1Jz5rX" data-element="product-module-price-line-label">
                Now:
                </span>
                <span class="price_Z1JgxME" data-element="product-module-price-line-price">
                $ (discounted price)
                </span>
                <span class="percent_Z1AyVKd" data-element="product-module-price-line-percent">
                percentage off
                </span>
            </div>
        </div>
        <span class="dark_Z1KXNqb" data-element="star-rating">
        <span class="starContainer_1gKHTY" aria-label="product ratings in stars">
        <span class="stars_14OUnN starsBackground_Z2q6um5" />
        <span class="stars_14OUnN starsForeground_1uqvSg" style="width:94%" />
        </span>
        <span class="reviewCount_Z2fkLiJ" data-element="star-rating-count">
        (review count)
        </span>
        </span>
    </article>
    </div>`

    var mainimage = encodeURI('product-images/' + product.images[0].filename);
    producthtml = producthtml.format(product.productdisplayname, mainimage);
    
    if(atStart) {
        $('#productrow').prepend(producthtml);
    } else {
        $('#productrow').append(producthtml);
    }
}

function displayerror(spanid, message) {
    $(spanid).html(message);
    var errTimer = setInterval(clearerror, 5000);
    function clearerror() {
        $(spanid).html('');
        clearInterval(errTimer);
    }
}