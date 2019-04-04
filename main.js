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
        contractInstance = contract.at(contractAddress);
    }).then(function(){
        getCurrentAddress();
    
        //only owner
        contractInstance.isOwner({'from': account()}, function(err, res){
            if(!err && res === true){
                isActive('#onlyOwner', true);
                getListOfAdmins();
                addAdmin();
            }
        });
    
        //only admin
        contractInstance.isAdmin({'from': account()}, function(err, res){
            if(!err && res === true){
                isActive('#onlyAdmin', true);
            }
        });
    })
}

function isActive(id, show = false) {
    if(show === true) {
        $(id).removeAttr('hidden');
    } else {
        $(id).hide();
    }
}

//owner functions

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

//admin functions



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
