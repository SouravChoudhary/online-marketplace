//#region Initiate contract

window.onload = function() {
    if(typeof web3 === 'undefined') {
        console.log('Error! Web3 object not found!');
    } else {
        $(document).ready(function(){
            console.log('Web3 dapp initialized.');
            initContract();
        }); 
    }
}

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
    //only owner
    onlyOwner();

    //only admin
    onlyAdmin();

    //onlt store owner
    onlyStoreOwner();
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
                    getStoreFront(storeName);
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
                marketplaceInstance.getStoreFront(res[i], {'from': account()}, function(error, result){
                    getStoreFront(res[i], result);
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

        if(productPrice !== '') {
            marketplaceInstance.addProduct(index, productPrice, {'from': account()}, function(err, res){
                if(!err) {
                    clearAlerts();
                    alertMessage('Product added successfully!', 'success');
                    window.location.reload();
                } else {
                    alertMessage(err.message, 'danger');        
                }
                //window.location.reload();
            });
        } else {
            alertMessage('Name and price fields are required!', 'danger');
        }
    });
}

function getProducts(storeIndex) {
    marketplaceInstance.getProductsList(storeIndex, {'from': account()}, function(err, res){
        if(!err && res.length !== 0) {
            for(let i = 0; i < res.length; i++) {
                marketplaceInstance.getProduct(storeIndex, res[i], {'from': account()}, function(error, result){
                    if(result !== null) {
                        let price = Number(result.toString());
                        if(price !== 0) {
                            showProductsList(storeIndex, res[i], price);
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
    let itemId = '[data-id="updatePrice'+storeIndex+''+productIndex+'"]';
    
    $(itemId).removeAttr('disabled');

    $(el).text('Close').removeAttr('onclick');

    $(el).one('click', function(){
        $(itemId).attr('disabled', 'disabled');
        $(el).attr('onclick', 'editProduct(this)').text('Edit');
        $(el).siblings('[data-update="true"]').attr('hidden', 'hidden');
    });

    $(el).siblings('[data-update="true"]').removeAttr('hidden');

    $(el).siblings('[data-update="true"]').on('click', function(){
        let price = Number($(el).parents(0).siblings('[data-product="price"]').children().first().val());

        marketplaceInstance.editProduct(storeIndex, productIndex, price, {'from': account()}, function(err, res){
            if(!err ) {
                alertMessage('Product edited successfully!','success');
                window.location.reload();
            } else {
                alertMessage('Product edition failed!','danger')
            }
        });
    });
}

function showProductsList(storeIndex, productIndex, price) {
    $('#productsList').append('<div class="row mt-4 mb-4 border border-secondary"><div class="col-2 my-auto">Price:</div><div class="col-10" data-product="price"><input class="form-control mb-3 mt-3" data-id="updatePrice'+storeIndex+''+productIndex+'" type="text" placeholder="Enter product price" name="updatePrice" disabled></div><div class="col-12"><button type="button" class="btn btn-secondary mb-3 mt-3 float-left" data-edit="true" data-store-front-index="'+storeIndex+'" data-product-index="'+productIndex+'" onclick="editProduct(this)">Edit</button><button data-update="true" type="button" class="btn btn-primary ml-3 mb-3 mt-3 float-left" hidden>Update</button><button type="button" class="btn btn-danger mb-3 mt-3 float-right" data-store-front-index="'+storeIndex+'" data-product-index="'+productIndex+'" onclick="removeProduct(this)">Delete</button></div></div>');

    $('[data-id="updatePrice'+storeIndex+''+productIndex+'"]').text(price).val(price);
}

//#region

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

function productsHelpers(name) {
    $('#showProductForm').on('click', function(){
        $('#productForm').toggle(0);
    });

    $('#storeFrontName').text(name);
    $('#backBtn').on('click', function(){
        clearAlerts();
        loadStoreFronts();
    });
}

function getStoreFront(index, data) {
    let address = 0;
    let name = '';
    if(typeof data === 'string') {
        name = data;
    } else {
        address = data[0];
        name = data[1];
    }

    $('#listOfStoreFronts').append('<div class="col-2 ml-3 mr-3 card"><div class="card-body"><h5 class="card-title text-center mb-3 mt-3">'+name+'</h5><p class="card-text"></p><div class="text-center"><button type="button" class="btn btn-secondary mb-3 mt-3" data-address="'+address+'" data-index="'+index+'" data-name="'+name+'" onclick="manageStoreFront(this)">Manage</button></div></div></div>');
}

function manageStoreFront(el) {
    let index = $(el).attr('data-index');
    let name = $(el).attr('data-name');

    clearAlerts();
    $('#accountRole').load( "./pages/products.html", function() {
        addProduct(index);
        getProducts(index);
        productsHelpers(name)
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
    $('#welcomeTitle').append('<h2>Welcome, '+role+'!</h2>');
}

function clearAlerts() {
    $('[role="alert"]').remove();
}

//#endregion