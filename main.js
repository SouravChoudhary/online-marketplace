//#region Initiate contract

ethers.onready = function() {
    initContract();
}

// window.onload = function() {
//     if(typeof web3 === 'undefined') {
//         console.log('Error! Web3 object not found!');
//     } else {
//         $(document).ready(function(){
//             console.log('Web3 dapp initialized.');
//             initContract();
//         }); 
//     }
// }

let marketplaceInstance;
let contractABI;
let contract;
let contractAddress;

function initContract() {
    $.when(
        $.getJSON( "./build/contracts/Marketplace.json", function( data ) {
            contractABI = data.abi;
            contractAddress = data.networks['5777'].address;
        })
    ).then(function() {
        contract = web3.eth.contract(contractABI, contractAddress);
    }).then(function() {
        marketplaceInstance = contract.at(contractAddress);
    }).then(function(){
        getCurrentAddress();
        
        marketplace();
    })

}

//#endregion

//#region Makretplace

function marketplace() {
    $.when(onlyOwner())
    .then(onlyAdmin())
    .then(onlyStoreOwner())
    .then(shopper());
}

//#endregion

//#region Owner

function onlyOwner() {
    marketplaceInstance.isOwner({'from': account()}, function(err, res) {
        if(!err && res === true){
            setWelcomeTitle('owner');
            $('#accountRole').load( "./pages/owner.html", function() {
                // getAdmins();
                addAdmin();
            });
        }
    });
}

function addAdmin() {
    let admin = {
        'addBtn': '#addAdminBtn',
        'addMethod': 'addAdmin',
        'addItemInput': '#addAdminInput',
        'listOfItems': '#listOfAdmins',
        'itemAddedMsg': 'Admin added successfully!',
        'itemDublicateMsg': 'This address is admin already!',
        'itemRequiredMsg': 'Please enter admin address.'
    };

    addItem(admin);
}

// function getAdmins() {
//     const admins = {
//         'getItemsList': '#listOfAdmins',
//         'getMethod': 'getAdmins'
//     };

//     getItems(admins);
// }

//#endregion

//#region Admin

function onlyAdmin() {
    marketplaceInstance.isAdmin({'from': account()}, function(err, res){
        if(!err && res === true){
            setWelcomeTitle('admin');
            $('#accountRole').load( "./pages/admin.html", function(){
                addStoreOwner();
                // getStoreOwners();
            });
        }
    });
}

function addStoreOwner() {
    let storeOwner = {
        'addBtn': '#addStoreOwnerBtn',
        'addMethod': 'addStoreOwner',
        'addItemInput': '#addStoreOwnerInput',
        'listOfItems': '#listOfStoreOwners',
        'itemAddedMsg': 'Store owner added successfully!',
        'itemDublicateMsg': 'This address is store owner already!',
        'itemRequiredMsg': 'Please enter store owner address.'
    }

    addItem(storeOwner);
}

// function getStoreOwners() {
//     const storeOwners = {
//         'getItemsList': '#listOfStoreOwners',
//         'getMethod': 'getStoreOwners'
//     };

//     getItems(storeOwners);
// }

//#endregion

//#region Store owners

function onlyStoreOwner() {
    marketplaceInstance.isStoreOwner({'from': account()}, function(err, res){
        if(!err && res === true){
            setWelcomeTitle('store owner');
            loadStoreFronts();
        }
    });
}

function addStoreFront() {
    $('#addStoreFrontBtn').on('click', function(){
        let storeName = $('#addStoreFrontInput').val();

        if(storeName !== '') {
            marketplaceInstance.addStoreFront(storeName, {'from': account()}, function(err, res){
                if(!err) {
                    clearAlerts();
                    alertMessage('Store front added successfully!', 'success');
                    window.location.reload();
                } else {
                    alertMessage('Store front was not added!', 'danger');
                }
            });
        } else {
            alertMessage('Store front name field is mandatory!', 'danger');
        }
    });
}

function getStoreFronts() {
    marketplaceInstance.getStoreFrontsList({'from': account()}, function(err, res){
        if(!err && res.length !== 0) {
            for(let i = 0; i < res.length; i++) {
                marketplaceInstance.getStoreFrontProps(res[i], {'from': account()}, function(error, props){
                    getStoreFrontProps(res[i], props[0], props[1], props[2]);
                });
            }
        } else {
            alertMessage('You don\'t have any store fronts.', 'primary');
        }
    });
}

function addProduct(index) {
    $('#addProduct').on('click', function(){
        let productPrice = $('#productPrice').val();
        let productQuantity = $('#productQuantity').val();

        if(productPrice !== '' && productQuantity != '' && Number(productQuantity) >= 1) {
            
            let priceInWei = ethers.parseEther(productPrice.toString());
            priceInWei = priceInWei.toString();

            marketplaceInstance.addProduct(index, priceInWei, productQuantity, {'from': account()}, function(err, res){
                if(!err) {
                    clearAlerts();
                    alertMessage('Product added successfully!', 'success');
                    window.location.reload();
                }
            });
        } else {
            alertMessage('Price and quantity fields are required and must be positive numbers!', 'danger');
        }
    });
}

function getProducts(storeIndex, role) {
    marketplaceInstance.getProductsList(storeIndex, {'from': account()}, function(err, res){
        if(!err && res.length !== 0) {
            for(let i = 0; i < res.length; i++) {
                marketplaceInstance.getProduct(storeIndex, res[i], {'from': account()}, function(error, result){
                    if(result !== null) {
                        let price = Number(result[0].toString());
                        let quantity = Number(result[1].toString());
                        if(price !== 0 && quantity !== 0 && quantity >= 1) {
                            showProductsList(storeIndex, res[i], price, quantity, role);
                        }
                    }
                });
            }
        }
    });
}

function editProduct(el) {
    let storeIndex = $(el).attr('data-store-front-index');
    let productIndex = $(el).attr('data-product-index');
    let itemPriceId = '[data-id="updatePrice'+storeIndex+''+productIndex+'"]';
    let itemQuantityId = '[data-id="updateQuantity'+storeIndex+''+productIndex+'"]';

    $(itemPriceId).removeAttr('disabled');
    $(itemQuantityId).removeAttr('disabled');

    $(el).text('Close').removeAttr('onclick');

    $(el).one('click', function(){
        $(itemPriceId).attr('disabled', 'disabled');
        $(itemQuantityId).attr('disabled', 'disabled');
        $(el).attr('onclick', 'editProduct(this)').text('Edit');
        $(el).siblings('[data-update="true"]').attr('hidden', 'hidden');
    });

    $(el).siblings('[data-update="true"]').removeAttr('hidden');

    $(el).siblings('[data-update="true"]').on('click', function(){
        let price = Number($(el).parents(0).siblings('[data-product="price"]').children().first().val());

        let priceInWei = ethers.parseEther(price.toString());
        priceInWei = priceInWei.toString();

        let quantity = Number($(el).parents(0).siblings('[data-product="quantity"]').children().first().val());
        
        marketplaceInstance.editProduct(storeIndex, productIndex, priceInWei, quantity, {'from': account()}, function(err, res){
            if(!err ) {
                alertMessage('Product edited successfully!','success');
                window.location.reload();
            } else {
                alertMessage('Product edition failed!','danger')
            }
        });
    });
}

function showProductsList(storeIndex, productIndex, price, quantity, role) {
    let storeOwnerFunc = '<button type="button" class="btn btn-secondary mb-3 mt-3 float-left" data-edit="true" data-store-front-index="'+storeIndex+'" data-product-index="'+productIndex+'" onclick="editProduct(this)">Edit</button><button data-update="true" type="button" class="btn btn-primary ml-3 mb-3 mt-3 float-left" hidden>Update</button><button type="button" class="btn btn-danger mb-3 mt-3 float-right" data-store-front-index="'+storeIndex+'" data-product-index="'+productIndex+'" onclick="removeProduct(this)">Delete</button>';

    let shopperFunc = '<div class="row"><div class="col-3 offset-9"><input class="form-control mb-3 mt-3 float-left" data-id="buyQuantity'+storeIndex+''+productIndex+'" type="text" placeholder="Enter quantity to buy" name="buyQuantity"><button type="button" class="btn btn-success mb-3 mt-3 float-right" data-store-front-index="'+storeIndex+'" data-product-index="'+productIndex+'" onclick="buyProduct(this)">Buy</button></div>';

    let btn = '';

    if(role === 'store owner') {
        btn = storeOwnerFunc;
    }

    if(role === 'shopper') {
        btn = shopperFunc;
    }

    $('#productsList').append('<div class="row mt-4 mb-4 border border-secondary"><div class="col-2 my-auto">Price: (ETH)</div><div class="col-10" data-product="price"><input class="form-control mb-3 mt-3" data-id="updatePrice'+storeIndex+''+productIndex+'" type="text" placeholder="Enter product price" name="updatePrice" disabled></div><div class="col-2 my-auto">Quantity:</div><div class="col-10" data-product="quantity"><input class="form-control mb-3 mt-3" data-id="updateQuantity'+storeIndex+''+productIndex+'" type="text" placeholder="Enter product quantity" name="updateQuantity" disabled></div><div class="col-12">'+btn+'</div></div>');

    let priceInEther = ethers.formatEther(price.toString());
    priceInEther = priceInEther.toString();

    $('[name="buyQuantity"]').on('change keydown keyup', function() {
        let total = (Number($(this).val())*Number(priceInEther)).toFixed(6);

        let final = ethers.parseEther(total.toString());
        final = final.toString();

        $('[onclick="buyProduct(this)"]').text('Total: '+total+' ETH Buy Now').attr('data-product-price', final);
    })

    $('[data-id="updatePrice'+storeIndex+''+productIndex+'"]').text(priceInEther).val(priceInEther);
    $('[data-id="updateQuantity'+storeIndex+''+productIndex+'"]').text(quantity).val(quantity);
}

//#endregion

//#region Shopper

function shopper() {
    marketplaceInstance.isShopper({'from': account()}, function(err, res) {
        if(!err && res === true){
            $('#accountRole').load( "./pages/shoppers.html", function(){
                getShopperStoreFronts();
            });
        }
    });
}

function getShopperStoreFronts() {
    marketplaceInstance.shopperStoreFronts({'from': account()}, function(err, res){
        if(!err){
            setWelcomeTitle('shopper');
            displayStoreFronts(res);
        }
    });
}

function displayStoreFronts(res) {
    for(let i = 0; i < res.length; i++) {
        marketplaceInstance.getStoreFrontName(res[i], {'from': account()}, function(error, result){
            getShopperStoreFront(res[i], result);
        });
    }
}

function getShopperStoreFront(index, name) {
    $('#listOfStoreFronts').append('<div class="col-2 ml-3 mr-3 card"><div class="card-body"><h5 class="card-title text-center mb-3 mt-3">'+name+'</h5><p class="card-text"></p><div class="text-center"><button type="button" class="btn btn-secondary mb-3 mt-3" data-index="'+index+'" data-name="'+name+'" onclick="checkProducts(this)">Check Products</button></div></div></div>');
}

function checkProducts(el) {
    let index = $(el).attr('data-index');
    let name = $(el).attr('data-name');

    clearAlerts();
    $('#accountRole').load( "./pages/products-shoppers.html", function() {
        getProducts(index, 'shopper');
        setStoreFrontName(name);
        backBtnShopper();
    });
}

function backBtnShopper() {
    $('#backBtn').on('click', function(){
        shopper();
    });
}

function buyProduct(el){
    let storeFrontIndex = $(el).attr('data-store-front-index');
    let productIndex = $(el).attr('data-product-index');
    let price = $(el).attr('data-product-price');
    let quantity = $(el).siblings('input[name="buyQuantity"]').val();

    if(Number(quantity) >= 1 && Number(quantity) % 1 === 0) {
        marketplaceInstance.buyProduct(storeFrontIndex, productIndex, quantity.toString(), {'from': account(), 'value': price }, function(err, res){
            if(!err) {
                clearAlerts();
                alertMessage('Product bought successfully', 'success');
                window.location.reload();
            } else {
                alertMessage('Error! Product was not bought!', 'danger');
            }
        });
    } else {
        alertMessage('Quantity must be a positive number!', 'danger');
    }
}

//#endregion

//#region Helpers

function account() {
    return web3.eth.accounts[0];
}

function getCurrentAddress() {
    $('#accountAddress').html(account());
}

function alertMessage(msg, typeOfMessage) {
    $('<div class="mt-2 alert alert-'+typeOfMessage+'" role="alert">'+msg+'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>').prependTo('body');
}

function addItem(item) {
    $(item.addBtn).on('click', function(){
        let inputVal = $(item.addItemInput).val();
    
        if($(item.addItemInput).val() !== ''){
            marketplaceInstance[item.addMethod](inputVal, {'from': account()}, function(err, res){
                if(!err){
                    clearAlerts();
                    if($(item.listOfItems).children().not('div').length === 0) {
                        $(item.listOfItems).empty();
                    }
                    $(item.addItemInput).val('');
                    $(item.listOfItems).append('<li>'+inputVal+'</li>');
                    alertMessage(item.itemAddedMsg, 'success');    
                } else {
                    alertMessage(item.itemDublicateMsg, 'danger');
                }
            });
        } else {
            alertMessage(item.itemRequiredMsg, 'danger');
        }
    });
}

function newProductsToggle() {
    $('#showProductForm').on('click', function(){
        $('#productForm').toggle(0);
    });
}

function setStoreFrontName(name) {
    $('#storeFrontName').text(name);
}

function backBtnStoreOwner() {
    $('#backBtn').on('click', function(){
        clearAlerts();
        loadStoreFronts();
    });
}

function getStoreFrontProps(index, name, address, balance) {
    let wei = ethers.formatEther(balance.toString());
    let eth = wei.toString();

    $('#listOfStoreFronts').append('<div class="col-2 ml-3 mr-3 card"><div class="card-body"><h5 class="card-title text-center mb-3 mt-3">'+name+'</h5><p class="card-text"></p><div class="text-center"><div>Address:</div><div>'+address+'</div><div>Balance:</div><div>'+eth+' ETH</div><button type="button" class="btn btn-secondary mb-3 mt-3 float-left" data-address="'+address+'" data-index="'+index+'" data-name="'+name+'" onclick="manageStoreFront(this)">Manage</button><button type="button" class="btn btn-warning mb-3 mt-3 float-right" data-index="'+index+'" onclick="withdrawStoreFrontBalance(this)">Withdraw</button></div></div></div>');
}

function withdrawStoreFrontBalance(el) {
    let index = $(el).attr('data-index');

    marketplaceInstance.withdrawStoreFrontBalance(index, {'from': account()}, function(err, res){
        if(!err) {
            alertMessage('Funds transferred successfully', 'success');
            window.location.reload();
        } else {
            alertMessage('Error! Transfer failed!', 'danger');
        }
    });
}

function manageStoreFront(el) {
    let index = $(el).attr('data-index');
    let name = $(el).attr('data-name');

    clearAlerts();
    $('#accountRole').load( "./pages/products-store-owners.html", function() {
        addProduct(index);
        getProducts(index, 'store owner');
        newProductsToggle();
        setStoreFrontName(name);
        backBtnStoreOwner();
    });
}

function loadStoreFronts() {
    $('#accountRole').load( "./pages/store-fronts.html", function(){
        addStoreFront();
        getStoreFronts();
    });
}

function removeProduct(el){
    let storeFrontIndex = $(el).attr('data-store-front-index');
    let productIndex = $(el).attr('data-product-index');

    marketplaceInstance.removeProduct(storeFrontIndex, productIndex, {'from': account()}, function(err, res){
        if(!err) {
            alertMessage('Product removed successfully', 'success');
            window.location.reload();
        } else {
            alertMessage('Error! Product was not removed!', 'danger');
        }
    });
}

function setWelcomeTitle(role) {
    web3.eth.getBalance(account(), function(err, data) {
        if(!err) {
            let wei = ethers.formatEther(data.toString());
            let eth = wei.toString();
            $('#welcomeTitle').html('<h2>Welcome, '+role+'!</h2><h3>Your balance is:</h3><h3>'+eth+' ETH</h3>');
        }
    });
}

function clearAlerts() {
    $('[role="alert"]').remove();
}

//#endregion