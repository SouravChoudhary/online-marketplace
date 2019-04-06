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
    isActive('#onlyOwner', false);
    onlyOwner();

    //only admin
    isActive('#onlyAdmin', false);
    onlyAdmin();

    //onlt store owner
    isActive('#onlyStoreOwner', false);
    onlyStoreOwner();
}

//#endregion

//#region Owner

function onlyOwner() {
    marketplaceInstance.isOwner({'from': account()}, function(err, res) {
        if(!err && res === true){
            $('#welcomeTitle').append('<h2>Welcome, owner!</h2>');
            isActive('#onlyOwner', true);
            getAdmins();
            addAdmin();
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

// function removeAdmin(index, address) {
//     marketplaceInstance.removeAdmin(address, {'from': account()}, function(err, res){
//         if(!err){
//             $('#addAdminInput').val('');
//             $('#listOfAdmins').find('button[data-index="'+index+'"]').parent().remove();
//             alertMessage('Admin removed successfully!', 'success');    
//         } else {
//             alertMessage('Error!', 'danger');
//         }
//     });
// }

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
            $('#welcomeTitle').append('<h2>Welcome, admin!</h2>');
            isActive('#onlyAdmin', true);
            addStoreOwner();
            getStoreOwners();
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
            $('#welcomeTitle').append('<h2>Welcome, store owner!</h2>');
            isActive('#onlyStoreOwner', true);
            addStoreFront();
            getStoreFronts();
            addProduct();
        }
    });
}

function addStoreFront() {
    $('#addStoreFrontBtn').on('click', function(){
        let storeName = $('#addStoreFrontInput').val();

        if(storeName !== '') {
            marketplaceInstance.addStoreFront(storeName, {'from': account()}, function(err, res){
                if(!err) {
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
        if(!err) {
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

function addProduct() {

}

function getProduct() {

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
    $('<div class="alert alert-'+typeOfMessage+'" role="alert">'+msg+'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>').appendTo('body');
}

function isActive(id, show) {
    if(show === true) {
        $(id).removeAttr('hidden');
    } else {
        $(id).attr('hidden', 'hidden');
    }
}

function addItem(item) {
    $(item.addBtn).on('click', function(){
        let inputVal = $(item.addItemInput).val();
    
        if($(item.addItemInput).val() !== ''){
            marketplaceInstance[item.addMethod](inputVal, {'from': account()}, function(err, res){
                if(!err){
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
    $('#listOfStoreFronts').append('<div class="col-2 ml-3 mr-3 card"><img src="./src/images/item.png" class="card-img-top" alt="..."><div class="card-body"><h5 class="card-title text-center mb-3 mt-3">'+name+'</h5><p class="card-text">Random text text  text  text  text  text  text  text  text  text  text  text  text  text </p><div class="text-center"><a href="#" class="btn btn-primary mb-3 mt-3">Products</a></div></div></div>');
}

//#endregion