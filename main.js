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

let contractInstance;
const contractABI = [{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x715018a6"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x8da5cb5b"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x8f32d59b"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xf2fde38b"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event","signature":"0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0"},{"constant":false,"inputs":[{"name":"adminAddr","type":"address"}],"name":"addAdmin","outputs":[],"payable":true,"stateMutability":"payable","type":"function","signature":"0x70480275"},{"constant":false,"inputs":[{"name":"adminAddr","type":"address"}],"name":"removeAdmin","outputs":[],"payable":true,"stateMutability":"payable","type":"function","signature":"0x1785f53c"},{"constant":true,"inputs":[],"name":"getAdmins","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x31ae450b"},{"constant":false,"inputs":[{"name":"storeOwnerAddr","type":"address"}],"name":"addStoreOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x9adeb5f1"},{"constant":true,"inputs":[],"name":"getStoreOwners","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x91f4245a"},{"constant":false,"inputs":[{"name":"storeOwnerAddr","type":"address"}],"name":"addStoreFront","outputs":[],"payable":true,"stateMutability":"payable","type":"function","signature":"0x5a603c03"},{"constant":true,"inputs":[{"name":"storeOwnerAddr","type":"address"}],"name":"getStoreFronts","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xcfd175c4"},{"constant":false,"inputs":[{"name":"storeFrontId","type":"uint256"},{"name":"title","type":"string"},{"name":"description","type":"string"},{"name":"price","type":"uint256"}],"name":"addProduct","outputs":[],"payable":true,"stateMutability":"payable","type":"function","signature":"0x9c083284"},{"constant":true,"inputs":[{"name":"storeFrontId","type":"uint256"},{"name":"productId","type":"uint256"}],"name":"getProduct","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x24f346ab"}];
const contractAddress = '0xBd6fa0ad25062AB1e46f79b4Dbb23d7936D09c78';

function initContract() {
    const contract = web3.eth.contract(contractABI, contractAddress);
    contractInstance = contract.at(contractAddress);

    getCurrentAddress();
    
    //only owner
    onlyOwner();


}

//owner functions

function onlyOwner() {
    contractInstance.isOwner({'from': account()}, function(err, res){
        if(!err){
            getListOfAdmins();
            addAdmin();
        } else {
            alertMessage('Error!', 'danger');
        }
    });
}

function addAdmin() {
    $('#addAdminBtn').on('click', function(){
        let inputVal = $('#addAdminInput').val();
    
        if($('#addAdminInput').val() !== ''){
            contractInstance.addAdmin(inputVal, {'from': account()}, function(err, res){
                if(!err){
                    $('#addAdminInput').val('');
                    $('#listOfAdmins').append('<li>'+inputVal+'</li>');
                    alertMessage('Admin added successfully!', 'success');    
                } else {
                    alertMessage('Error!', 'danger');
                }
            });
        } else {
            alertMessage('Please enter admin address.', 'danger');
        }
    });
}

function removeAdmin(index, address) {
    contractInstance.removeAdmin(address, {'from': account()}, function(err, res){
        if(!err){
            $('#addAdminInput').val('');
            $('#listOfAdmins').find('button[data-index="'+index+'"]').parent().remove();
            alertMessage('Admin removed successfully!', 'success');    
        } else {
            alertMessage('Error!', 'danger');
        }
    });
}

function getListOfAdmins() {
    contractInstance.getAdmins({'from': account()}, function(err, res){
        if(!err && res.length > 0){
            $('#listOfAdmins').empty();
            for(let i = 0; i < res.length; i++) {
                $('#listOfAdmins').append('<li class="pt-3 pb-3"><div class="float-left">'+res[i]+'</div><button type="button" class="btn btn-danger float-right" id="removeAdminBtn" data-index="'+i+'" onclick="removeAdmin('+i+', '+res[i]+')">Del</button></li>');
            }
        } else {
            $('#listOfAdmins').append('<div>Empty!</div>');
        }
    });
}

//helpers

function account() {
    return web3.eth.accounts[0];
}

function getCurrentAddress() {
    $('#accountAddress').html(account());
}

function alertMessage(msg, typeOfMessage) {
    $('<div class="alert alert-'+typeOfMessage+'" role="alert">'+msg+'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>').appendTo('body');
}
