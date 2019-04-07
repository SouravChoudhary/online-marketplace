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
                getAdmins();
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

function getAdmins() {
    const admins = {
        'getItemsList': '#listOfAdmins',
        'getMethod': 'getAdmins'
    };

    getItems(admins);
}

//#endregion

//#region Admin

function onlyAdmin() {
    marketplaceInstance.isAdmin({'from': account()}, function(err, res){
        if(!err && res === true){
            setWelcomeTitle('admin');
            $('#accountRole').load( "./pages/admin.html", function(){
                addStoreOwner();
                getStoreOwners();
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

function getStoreOwners() {
    const storeOwners = {
        'getItemsList': '#listOfStoreOwners',
        'getMethod': 'getStoreOwners'
    };

    getItems(storeOwners);
}

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
                    $('#addStoreFrontInput').val('');
                    alertMessage('Store front added successfully!', 'success');
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
    marketplaceInstance.getStoreFronts({'from': account()}, function(err, res){
        if(!err && res.length !== 0) {
            for(let i = 0; i < res.length; i++) {
                marketplaceInstance.getStoreFrontName(i, {'from': account()}, function(err, res){
                    getStoreFront(res);
                });
            }
        } else {
            alertMessage('You don\'t have any store fronts.', 'primary');
        }
    });
}

function addProduct(index) {
    $('#addProduct').on('click', function(){
        let productName = $('#productName').val();
        let productDescription = $('#productDescription').val();
        let productPrice = $('#productPrice').val();

        if(productName !== '' && productPrice !== '') {
            marketplaceInstance.addProduct(index, productName, productDescription, productPrice, {'from': account()}, function(err, res){
                clearAlerts();
                alertMessage('Product added successfully!', 'success');
            });
        } else {
            alertMessage('Name and price fields are required!', 'danger');
        }
    });
}

function getProducts(index) {
    marketplaceInstance.getProductsLength(index, {'from': account()}, function(err, res){
        if(!err && res.toString() !== '0') {
            for(let i = 0; i < Number(res); i++) {
                marketplaceInstance.getProduct(index, i, {'from': account()}, function(error, result){
                    if(result[0] !== '' && result[3] !== 0) {
                        showProductsList(index, i, result);
                    }

                    if(i === 0 && $('#productsList').children().length === 0) {
                        alertMessage('This store front doesn\'t have any products.', 'primary');
                    }
                });
            }
        } else {
            alertMessage('This store front doesn\'t have any products.', 'primary');
        }
    });
}

function showProductsList(storeFrontIndex, productIndex, item) {
    let title = item[0];
    let description = item[1];
    let price = item[2].toString();

    $('#productsList').append('<div class="row mt-4 mb-4 border border-primary"><div class="col-2">Title:</div><div class="col-10"><h5 class="card-title mb-3 mt-3">'+title+'</h5></div><div class="col-2">Desctiption:</div><div class="col-10"><p class="card-text">'+description+'</p></div><div class="col-2">Price:</div><div class="col-10"><p>'+price+'</p></div><div class="col-12"><button type="button" class="btn btn-secondary mb-3 mt-3 float-left" onclick="editProduct('+storeFrontIndex+', '+productIndex+')">Edit</button><button type="button" class="btn btn-danger mb-3 mt-3 float-right" onclick="removeProduct('+storeFrontIndex+', '+productIndex+')">Delete</button></div></div>');
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

function getItems(item) {
    marketplaceInstance[item.getMethod]({'from': account()}, function(err, res){
        if(!err && res.length > 0){
            $(item.getItemsList).empty();
            for(let i = 0; i < res.length; i++) {
                $(item.getItemsList).append('<li><div class="float-left">'+res[i]+'</div></li>');
            }
        } else {
            alertMessage('The list is empty.', 'primary');
        }
    });
}

function getStoreFront(name) {
    let index = $('#listOfStoreFronts').children().length;

    $('#listOfStoreFronts').append('<div class="col-2 ml-3 mr-3 card"><div class="card-body"><h5 class="card-title text-center mb-3 mt-3">'+name+'</h5><p class="card-text">Random text text  text  text  text  text  text  text  text  text  text  text  text  text </p><div class="text-center"><button type="button" class="btn btn-secondary mb-3 mt-3" onclick="manageStoreFront('+index+', \''+name+'\')">Manage</button></div></div></div>');
}

function manageStoreFront(index, name) {
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

function removeProduct(storeFrontIndex, productIndex){
    marketplaceInstance.removeProduct(storeFrontIndex, productIndex, {'from': account()}, function(err, res){
        if(!err) {
            alertMessage('Product removed successfully', 'success');
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