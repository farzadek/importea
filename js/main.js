var app = angular.module('greenPortalApp', ["ngRoute", "ngCookies","ui.bootstrap"]);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "index.html"
    })
    .otherwise({
        templateUrl : "index.html"
    });
});

app.filter('startFrom', function(){
    return function(data, start){
        if(data){
            return data.slice(start);
        } else { return;}
    }
});

app.filter('tel', function () {
    return function (tel) {
        if (!tel) { return ''; }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 10: // +1PPP####### -> C (PPP) ###-####
                country = 1;
                city = value.slice(0, 3);
                number = value.slice(3);
                break;

            case 11: // +CPPP####### -> CCC (PP) ###-####
                country = value[0];
                city = value.slice(1, 4);
                number = value.slice(4);
                break;

            case 12: // +CCCPP####### -> CCC (PP) ###-####
                country = value.slice(0, 3);
                city = value.slice(3, 5);
                number = value.slice(5);
                break;

            default:
                return tel;
        }

        if (country == 1) {
            country = "";
        }

        number = number.slice(0, 3) + '-' + number.slice(3);

        return (country + " (" + city + ") " + number).trim();
    };
});

app.directive('fileInput', function ($parse) {
    return {
        link: function ($scope, element, attrs) {
            element.on('change', function (event) {
                var files = event.target.files;
                $parse(attrs.fileInput).assign($scope, element[0].files);
                $scope.$apply();
            });
        }
    };
});


app.controller('mainCtrl', function($scope, $cookieStore, $http, $timeout, grPortalService) {

    $scope.titles = Titles;
    $scope.lang = 1; //0=en 1=fr
    $scope.showLoader = false;
    $scope.dbApiKey = "JIZlGld1NOk4SsznMiAvb78pr7zzAjom";
    $scope.maxSize = 5; //how many buttons for pagination
    $scope.currentUser;
    $scope.thisUserTemp;
    $scope.currentUserDocs = [];
    $scope.currentUserDocsTemp = [];
    $scope.showSpecialProducts = false; // switch to special products
    $scope.postalPrice = 16; // post price
    $scope.min_purchase_to_free_send = 100; // min purchase to send free

    $scope.loginMessage = '';
    $scope.subscribeMessage = '';

    $scope.mainGroups = [];
    $scope.products = [];
    $scope.mainSpecialGroups = [];
    $scope.specialProducts = [];

    $scope.productToShow = {};
    $scope.basket = {"items":[],"total":0,"subtotal":0}; // shopping basket
    $scope.order = 0;
    $scope.orderToShow = {};
    $scope.selectedProductWeight = 0;

    $scope.facteur = {"client":{"id":0,"name":"","adress":"","tel":""},
                     "date":"", "payed":"","sent":"","total":0,
                     "products":[]
    };
    $scope.purchaseProcessStep = 0;

    $scope.pendingPurchases = [];
    $scope.purchasesInfo = []; // for admin page

    $scope.pageSize_orders = "99999"; // for admin table
    $scope.currentPage_orders = 1; // for admin table
    $scope.currentPage_user = 1;
    $scope.pageSize_user = "99999";
    $scope.currentPage_message = 1;
    $scope.pageSize_message = "99999";
    
    $scope.glyphSort_user = [];  // glyphicon for sorting asc/desc
    $scope.glyphSort_message = [];  // glyphicon for sorting asc/desc
    $scope.glyphSort_command = [];  // glyphicon for sorting asc/desc
    $scope.sortReverse_user  = true; // order by in DESC
    $scope.sortReverse_command  = true; // order by in DESC
    $scope.sortReverse_message  = true; // order by in DESC
    $scope.glyphSort_user[0] = 'glyphicon glyphicon-sort-by-attributes';
    $scope.glyphSort_message[0] = 'glyphicon glyphicon-sort-by-attributes';
    $scope.glyphSort_command[0] = 'glyphicon glyphicon-sort-by-attributes';

    $scope.purchaseToShowAdmin = []; // temp var, fill when admin click on + on admin page
    $scope.contactUsFormErrMsg = ''; // contact us form, error message

    $scope.showPhotoSuccesMsg = false;

    /* ------------------------------------- */
    $scope.showLoader = true;
    if($cookieStore.get('id')){
        grPortalService.getUsers('{"id":'+$cookieStore.get("id")+'}').then(
            function(res){
                if(res.status!=200){
                    alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                else{
                    $scope.currentUser = res.data[0];
                }
            },
            function(){alert($scope.titles.alerts.informationLoad[$scope.lang])}
        );
    }

    // load main roups *******************************************
    grPortalService.getProductsGroup().then(
        function(res){
            if(res.status!=200){
                alert($scope.titles.alerts.informationLoad[$scope.lang]);}
            else{
                $timeout(function () { $scope.showLoader=false; }, 300);
                $scope.mainGroups = res.data;
            }
        },
        function(){
            alert($scope.titles.alerts.informationLoad[$scope.lang]);
        }
    );
    $scope.showLoader = false;

    // change langauge ***************************************************
    $scope.changeLanguage = function(){
        if($scope.lang){$scope.lang=0;}
        else{$scope.lang=1;}
    }

    // show special products **********************************************
    $scope.changeShowSpecialProducts = function(y){
        $scope.showSpecialProducts = y;
    }

    // load all tea packages *********************************************************
    grPortalService.getProducts('{"special":false}').then(
        function(res){
            if(res.status!=200){
                alert($scope.titles.alerts.informationLoad[$scope.lang]);}
            else{
                $timeout(function () { $scope.showLoader=false; }, 300);
                $scope.products = res.data;
            }
        },
        function(){
            alert($scope.titles.alerts.informationLoad[$scope.lang]);
        }
    );


    // login **************************************************************************
    $scope.checkUserForLogin = function(){
        $scope.showLoader = true;
        grPortalService.getUsers('{"active": true, "username":"'+$scope.username+'", "password": "'+$scope.password+'"}').then(
            function(res){
                if(res.status!=200){
                    alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                else{
                    $scope.currentUser = res.data[0];
                    if($scope.currentUser){
                        $cookieStore.put('id', $scope.currentUser.id); 
                        if($scope.currentUser.special){
                            grPortalService.getProducts('{"special":true}').then(
                                function(res){
                                     $scope.weed = res.data;
                                },
                                function(){
                                    alert($scope.titles.alerts.informationLoad[$scope.lang]);
                                }
                            );
                        }
                        $('#loginModal').modal('toggle');  
                        $scope.loginMessageReset();           
                    } else {
                        $scope.loginMessage = $scope.titles.alerts.userNotFound[$scope.lang];
                    }
                    $timeout(function () { $scope.showLoader=false; }, 300);
                }
            },
            function(){alert($scope.titles.alerts.informationLoad[$scope.lang]);}
        );
    }

    // empty login message **********************************************************************
    $scope.loginMessageReset = function(){
        $scope.loginMessage = '';
        $scope.username = '';
        $scope.password = '';
    }

    // logout **********************************************************************
    $scope.logout = function(){
        $cookieStore.put('id', '');
        $scope.purchase = [];
        $scope.currentUser = '';
        $scope.loginMessage = '';
    }


    // subscribe new user ************************************************************************
    $scope.subscribeUser = function(){
        var error = false;
        $scope.usersCount = 0;
        $scope.subscribeMessage = '';
        if($scope.subscribe_psw1 != $scope.subscribe_psw2){
            $scope.subscribeMessage = $scope.titles.alerts.passwordNotMatch[$scope.lang];
            error = true;
        } else {
            $scope.subscribeMessage = '';
        }
        if(!error){
            $scope.showLoader = true;
            grPortalService.getUsers('{"username":"'+$scope.subscribe_email+'"}')
                .then(
                    function(response){
                        if(response.status!=200){
                            alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                        else{
                            if(response.data.length){
                                $scope.subscribeMessage = $scope.titles.alerts.emailExists[$scope.lang];
                            }
                            else{
                                var d = new Date();
                                grPortalService.getUsers('{"active":true}').then(
                                    function(response){ 
                                        newUser = {
                                            "date": d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(),
                                            "id": response.data.length+1,
                                            "name": $scope.subscribe_name,
                                            "lastname": $scope.subscribe_lastname,
                                            "username": $scope.subscribe_email,
                                            "password": $scope.subscribe_psw1,
                                            "active": true,
                                            "type": 1,
                                            "confirm": false,
                                            "special": false,
                                            "adress": $scope.subscribe_adr,
                                            "cp": $scope.subscribe_cp,
                                            "city": $scope.subscribe_city,
                                            "province": $scope.subscribe_prov,
                                            "phone": $scope.subscribe_phon,
                                            "docs":[]
                                        };
                                        $.ajax({ url: 'https://api.mlab.com/api/1/databases/greenportal/collections/users?apiKey='+$scope.dbApiKey,
                                            data: JSON.stringify( newUser ),
                                            type: "POST",
                                            contentType: "application/json" 
                                        }).then(
                                            function successCallback(response) {
                                                $scope.currentUser = newUser;
                                                $cookieStore.put('id', $scope.currentUser.id); 
                                                $('#subscribeModal').modal('toggle');  
                                                $scope.loginMessageReset();      
                                                grPortalService.sendEmail($scope.subscribe_email,'iuwh')
                                                    .then(
                                                        function(){},
                                                        function(){alert($scope.titles.alerts.errorSendEmail[$scope.lang]);}
                                                    );
                                            },
                                            function errorCallback(response, err) {
                                                alert(response.statusText);
                                            }
                                        );
                                    }
                                );
                            }
                        }
                        $timeout(function () { $scope.showLoader=false; }, 300);
                    },
                    function(res){ 
                        alert($scope.titles.alerts.errorSaveData[$scope.lang]);
                    }
                );
        }
    }

    // select tea group
    $scope.teaGroupSelected = function(gId, gTlt){
        $timeout(function () { $scope.showLoader=false; }, 200);
        if(document.getElementById('grp'+gId)){        
            $('html').animate({scrollTop: $('#grp'+gId).offset().top},1000);
        }
    }

    $scope.showThisProduct = function(products){
        $scope.productToShow = products;
        $scope.selectedProductWeight = 0;
        //$scope.order = products.order;
    }

    $scope.increaseOrder = function(){
        if($scope.order<9){
            $scope.order++;
        }
    }

    $scope.decreaseOrder = function(){
        if($scope.order>0){
            $scope.order--;
        }
    }

/* --------------------------------------------------------------------------- */
    $scope.addToBasket = function(selectedProduct, whichProductModel, howMany){
        var found = false;
        $scope.showLoader = true;
        for(var i=0; i<$scope.basket.items.length; i++){
            if($scope.basket.items[i].id==selectedProduct.id && $scope.basket.items[i].model==whichProductModel){
                found = true;
                $scope.basket.items[i].no = howMany;
                break;
            }
        }
        if(!found){
            $scope.basket.items.push({
                "id": selectedProduct.id,
                "model": whichProductModel,
                "no": howMany,
                "price": selectedProduct.price[whichProductModel].price,
                "weight": selectedProduct.price[whichProductModel].weight,
                "name": selectedProduct.title
            });                
        }
        $scope.basket.total = 0;
        $scope.basket.items.forEach(element => { 
            $scope.basket.total += element.no * element.price;
        });
        $scope.basket.subTotal = $scope.basket.total>$scope.min_purchase_to_free_send?$scope.basket.total:($scope.basket.total+$scope.postalPrice);
        $('#productModal').modal('hide');
        $scope.order = 0;
        $timeout(function () { $scope.showLoader=false; }, 300);
    }

/* --------------------------------------------------------------------------- */
    $scope.productModelChanged = function(id, optionNo){
        var found = false;
        for(var i=0; i<$scope.basket.items.length; i++){
            if($scope.basket.items[i].id==id && $scope.basket.items[i].model==optionNo){
                $scope.order = $scope.basket.items[i].no;
                found = true;
                break;
            }
        }
        if(!found){
            $scope.order = 0;
        }
    }

/* --------------------------------------------------------------------------- */
    $scope.purchaseConfirm = function(){
        if(!$scope.currentUser){
            $('#basketModal').hide();
            $('.modal-backdrop').hide();
            $('#loginModal').modal();
        }
        else{
                $scope.showLoader = true;
                $scope.facteur.client = {
                    "id":$scope.currentUser.id,
                    "name":$scope.currentUser.lastname+', '+$scope.currentUser.name,
                    "adress":$scope.currentUser.adress,
                    "tel":$scope.currentUser.phone
                };
                $scope.basket.items.forEach(e=>{
                    $scope.facteur.products.push({"id":e.id, "model":e.model, "name":e.name, "no":e.no, "price":e.price, "weight":e.weight});
                });
                var d = new Date();
                var m = d.getMonth()+1>9 ? d.getMonth()+1 : '0'+(d.getMonth()+1);
                var dy = d.getDate()>9 ? d.getDate() : '0'+d.getDate();
                $scope.facteur.date = (d.getFullYear()+'-'+m+'-'+dy).toString();
                $scope.facteur.payed = '';
                $scope.facteur.sent = '';
                $scope.facteur.cn = $scope.currentUser.id + '0';
                grPortalService.getFacteursCount().then(
                    function (res) {
                        if (res.status != 200) {
                            alert($scope.titles.alerts.errorSaveData[$scope.lang]);
                        } else {
                            $scope.facteur.cn += res.data.length+1;
                            var t = $scope.basket.total > $scope.min_purchase_to_free_send ? -$scope.postalPrice : 0;
                            $scope.facteur.total = [$scope.basket.total, 0, $scope.postalPrice, t, ($scope.basket.total + $scope.postalPrice + t)];
                            grPortalService.saveFacteur($scope.facteur).then(
                                function (res) {
                                    if (res.status != 200) {
                                        alert($scope.titles.alerts.errorSaveData[$scope.lang]);
                                    } else {
                                        $scope.facteur = {};
                                        $('#basketModal').modal('hide');
                                        $scope.confirmStep = 0;
                                        $scope.purchaseProcessStep = 0;
                                        $scope.basket = {
                                            "items": [],
                                            "total": 0,
                                            "subtotal": 0
                                        };
                                        $("#userProfileModal").modal("show");
                                    }
                                },
                                function () {
                                    alert($scope.titles.alerts.errorSaveData[$scope.lang]);
                                }
                            );
                        }
                    },
                    function () {
                        alert($scope.titles.alerts.errorSaveData[$scope.lang]);
                    }
                );
        }
        $timeout(function () { $scope.showLoader=false; }, 300);
    }

/* --------------------------------------------------------------------------- */
    $scope.facteurNextStep = function(){
        $scope.purchaseProcessStep++;
        if (!$scope.currentUser && $scope.purchaseProcessStep==1) {
            $scope.purchaseProcessStep = 0;
            $('#basketModal').hide();
            $('.modal-backdrop').hide();
            $('#loginModal').modal();
        }

    }

/* --------------------------------------------------------------------------- */
    $scope.facteurPrevStep = function(){
        if($scope.purchaseProcessStep>0){
            $scope.purchaseProcessStep--;
        }
    }

    /* --------------------------------------------------------------------------- */
    $scope.openUserBox = function(){
        if($scope.currentUser){
            $scope.currentUserDocs = [];
            $scope.showLoader=true;
            grPortalService.getDocsOfUser($scope.currentUser.id).then(
                function (res) {
                    if(res.status!=200){
                        alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                    else{
                        res.data.forEach(function(f){
                        if(f.active){
                            $scope.currentUserDocs.push(f);
                        }
                    });    
                }
            });
        
            var q = '{"client.id":'+$scope.currentUser.id+'}';
            grPortalService.getFacteurs(q).then(
                function(res){
                    if(res.status!=200){alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                    else{
                        $scope.pendingPurchases = res.data;
                    }
                },
                function(){alert($scope.titles.alerts.informationLoad[$scope.lang]);}
            );
            $timeout(function () { $scope.showLoader=false; }, 300);
        }
    }

/* --------------------------------------------------------------------------- */
    $scope.showFacteur_ToShow = function(order){
        $scope.orderToShow = order;
    }

/* --------------------------------------------------------------------------- */
    $scope.admin_head_clicked = function(item){
        $scope.admin_head_class = ['','',''];
        $scope.admin_head_class[item] = 'active';
        if(item==0){    // orders
            $scope.showLoader = true;
            grPortalService.getFacteurs('{}').then(
                function successCallback(response) {
                    if(response.status!=200){
                        alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                    else{
                        $scope.showLoader = false;
                        $scope.purchasesInfo = response.data;
                        $scope.purchasesInfo.forEach(elem=>elem.cn = parseInt(elem.cn));
                        $scope.totalItems = $scope.purchasesInfo.length;
                        $timeout(function () { $scope.showLoader=false; }, 300);
                    }
                }, 
                function errorCallback(response) {
                    $scope.purchasesInfo = [];
                    alert('ERROR');
                }
            );          
        }
        if(item==1){
            $scope.showLoader = true;
            grPortalService.getUsers('{}').then(
                function successCallback(response) {
                    if(response.status!=200){
                        alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                    else{
                        $scope.showLoader = false;
                        $scope.userInfo = response.data;
                        $scope.totalItems = $scope.userInfo.length;
                    }
                },
                function errorCallback() {
                    $scope.userInfo = [];
                    alert('ERROR');
                }
            );
            $timeout(function () { $scope.showLoader=false; }, 300);
        }
        if(item==2){
            $scope.showLoader = true;
            grPortalService.getMessages('{}').then(
                function successCallback(response) {
                    if(response.status!=200){
                        alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                    else{
                        $scope.showLoader = false;
                        $scope.messagesInfo = response.data;
                        $scope.totalItems = $scope.messagesInfo.length;
                    }
                },
                function errorCallback() {
                    $scope.messagesInfo = [];
                    alert('ERROR');
                }
            );
            $timeout(function () { $scope.showLoader=false; }, 300);
        }
    }
    
/* --------------------------------------------------------------------------- */
    $scope.showClientFullInfo_admin = function(user){ // get client info for admin page
        $scope.showLoader = true;
        grPortalService.getUsers('{"id":'+user.id+'}').then(
            function successCallback(response) {
                if(response.status!=200){
                    alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                else{
                    $scope.showLoader = false; 
                    $scope.thisUserTemp = response.data[0];
                }
            },
            function errorCallback() {
                $scope.userInfo = [];
                alert('ERROR');
            }
        );
        $timeout(function () { $scope.showLoader=false; }, 300);
    }

/* --------------------------------------------------------------------------- */
    $scope.full_show_purchase = function(item){ // show purchase in admin page
        item.payed = new Date(item.payed);
        item.sent = new Date(item.sent);
        $scope.itemToFullShow_tea = Object.assign({}, item);
        $scope.purchaseToShowAdmin = Object.assign({}, item);
    }
    
/* --------------------------------------------------------------------------- */
    $scope.changeNoAdmin = function(prod){
        $scope.purchaseToShowAdmin.total = [0,0,$scope.postalPrice,0,0];
        $scope.purchaseToShowAdmin.products.forEach(
            function(e){
                $scope.purchaseToShowAdmin.total[0] += e.no*e.price;
                $scope.purchaseToShowAdmin.total[1] += $scope.purchaseToShowAdmin.total[0]*0;
                $scope.purchaseToShowAdmin.total[3] = $scope.purchaseToShowAdmin.total[0]>100?-$scope.purchaseToShowAdmin.total[2]:0;
                $scope.purchaseToShowAdmin.total[4] = $scope.purchaseToShowAdmin.total[0]+$scope.purchaseToShowAdmin.total[1]+$scope.purchaseToShowAdmin.total[2]+$scope.purchaseToShowAdmin.total[3];
            }
        );
    }

/* --------------------------------------------------------------------------- */
    $scope.deletePurchaseByAdm = function(item){
        if (confirm('Are you sure you want to delete?')) {
            grPortalService.deleteFacteur(item).then(
                function(res){
                    if(res.status!=200){ alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                    else{
                        $timeout(function () { $scope.showLoader=false; }, 300);
                        $('#show_info_tea').modal('hide');
                        $scope.dataRefreshPurchase();
                    }
                },
                function(){
                    alert($scope.titles.alerts.informationLoad[$scope.lang]);
                }
            );
        }
    }
/* --------------------------------------------------------------------------- */
    $scope.deletePendingPurchaseByAdm = function(){
        if (confirm($scope.titles.section1Ad.deletePendingConfirmText[$scope.lang])) {
            var today = new Date();
            today = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
            $scope.purchasesInfo.forEach(element => { 
                if(!element.payed){
                    var d1 = new Date(element.date);
                    date2 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
                    if(Math.floor((Math.abs(today-date2)-1)/1000/60/60/24)>2){
                        grPortalService.deleteFacteur(element._id.$oid).then(
                            function(res){
                                if(res.status!=200){ alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                                else{
                                    $timeout(function () { $scope.showLoader=false; }, 300);
                                    $('#show_info_tea').modal('hide');
                                    $scope.dataRefreshPurchase();
                                }
                            },
                            function(){
                                alert($scope.titles.alerts.informationLoad[$scope.lang]);
                            }
                        );
                    }
                }
            });
            $scope.dataRefreshPurchase();
        }
    }
/* --------------------------------------------------------------------------- */
    $scope.savePurchaseByAdm = function(){
        grPortalService.updateFacteur($scope.purchaseToShowAdmin).then(
            function(res){
                if(res.status!=200){ alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                else{
                    $timeout(function () { $scope.showLoader=false; }, 300);
                    $('#show_info_tea').modal('hide');
                }
            },
            function(){
                alert($scope.titles.alerts.informationLoad[$scope.lang]);
            }
        );
    }

/* --------------------------------------------------------------------------- */
    $scope.dataRefreshPurchase = function(){
        $scope.showLoader = true;
        grPortalService.getFacteurs('{}').then(
            function successCallback(response) {
                if(response.status!=200){
                    alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                else{
                    $scope.showLoader = false;
                    $scope.purchasesInfo = response.data;
                    $scope.totalItems = $scope.purchasesInfo.length;
                    $timeout(function () { $scope.showLoader=false; }, 300);
                }
            }, 
            function errorCallback(response) {
                $scope.purchasesInfo = [];
                alert('ERROR');
            }
        );          
    }

/* --------------------------------------------------------------------------- */
    $scope.updateUserAdm = function(user){
        grPortalService.updateUserInfo(user).then(
            function successCallback(response) {
                if(response.status!=200){
                    alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                else{
                    $timeout(function () { $scope.showLoader=false; }, 300);
                    $('#show_info_user').modal('hide');
                }
            }, 
            function errorCallback(response) {
                alert('ERROR');
            }
        )
    }

/* --------------------------------------------------------------------------- */
    $scope.dataRefresh_user = function() {
        $scope.showLoader=true;
        grPortalService.getUsers('{}').then(
            function(res){
                if(res.status!=200){
                    alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                else{
                    $timeout(function () { $scope.showLoader=false; }, 300);
                    $scope.userInfo = res.data;
                    $scope.totalItems = $scope.userInfo.length;
                }
            },
            function errorCallback(response) {
                $scope.userInfo = [];
                alert('ERROR');
            }
        );
    }
    
/* --------------------------------------------------------------------------- */
    $scope.showPurchaseList_admin = function(userId){
        $scope.showLoader=true;
        grPortalService.getFacteurs('{"client.id":'+userId+'}').then(
            function(res){
                if(res.status!=200){
                    alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                else{
                    $timeout(function () { $scope.showLoader=false; }, 300);
                    $scope.userPurchaseList = res.data;
                }
            },
            function errorCallback(response) {
                $scope.userPurchaseList = [];
                alert('ERROR');
            }
        );
    }

/* --------------------------------------------------------------------------- */
    $scope.uploadFile = function(){
        var form_data = new FormData();
        $scope.showPhotoSuccesMsg = false;
        var no=0;
        $scope.showLoader=true;
        angular.forEach($scope.files, function(file){
            form_data.append('file', file);
            ext = file.name.split(".");
        });

        grPortalService.getDocsOfUser($scope.currentUser.id).then(
            function (res) {
                if(res.status!=200){
                    alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                else{
                    no = res.data.length;
                    var name = $scope.currentUser._id.$oid+'_'+no;
                    $http.post('php/upload_image.php?name='+name,form_data,{transformRequest:angular.identity,headers:{'Content-Type': undefined,'Process-Data':false}})
                        .then(function(res){
                            if(res.data!='ERR'){
                                name = name+'.'+res.data;
                                var doc = {"owner":$scope.currentUser.id, "name":name, "active":true} ;
                                grPortalService.updateUserDocsInfo(doc,'new').then(
                                    function (response) {
                                        grPortalService.getDocsOfUser($scope.currentUser.id).then(
                                            function (res) {
                                                $scope.currentUserDocs = res.data;
                                                $scope.showPhotoSuccesMsg = true;
                                            }
                                        );                                          
                                    }, 
                                    function () {
                                        alert('An error has occurred');
                                    });
                            }
                            $scope.files = '';
                            document.getElementById('inputFile').value = '';
                        });                
                }
            }
        );

        $scope.showLoader=false;
    }

/* --------------------------------------------------------------------------- */
    $scope.removeImageFromProfile = function(image){
        $scope.showLoader=true;
        grPortalService.updateUserDocsInfo(image,'delete').then(
            function(res){
                if(res.status!=200){
                    alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                else{
                    grPortalService.getDocsOfUser($scope.currentUser.id).then(
                        function (res) {
                            if(res.status!=200){
                                alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                            else{
                                $timeout(function () { $scope.showLoader=false; }, 300);
                                $scope.currentUserDocs = res.data;
                            }
                        }
                    );     
                }
            }
        );
    }

/* --------------------------------------------------------------------------- */
    $scope.contactUsSendMsg = function(){
        $scope.contactUsFormErrMsg = '';
        $scope.msgClass = 'errMessage';
        if(!contactUsForm.phone.value && !contactUsForm.email.value){
            $scope.contactUsFormErrMsg = $scope.titles.contactUs.phoneRequire[$scope.lang]; 
        }
        if(!contactUsForm.name.value){
            $scope.contactUsFormErrMsg = $scope.titles.contactUs.NameRequire[$scope.lang]; 
        }
        if(!contactUsForm.msgTxt.value){
            $scope.contactUsFormErrMsg = $scope.titles.contactUs.msgTxtRequire[$scope.lang]; 
        }

        if(!$scope.contactUsFormErrMsg){
            var d = new Date();
            var user = $scope.currentUser ? $scope.currentUser.id : '';
            var msg = {"date":d,"userId":user,"name":contactUsForm.name.value,"phone":contactUsForm.phone.value,"email":contactUsForm.email.value,"msg":contactUsForm.msgTxt.value};
            grPortalService.saveMessage(msg).then(
                function(res){
                    contactUsForm.name.value = '';
                    contactUsForm.phone.value = '';
                    contactUsForm.email.value = '';
                    contactUsForm.msgTxt.value = '';
                    if(res.status!=200){
                        alert($scope.titles.alerts.informationLoad[$scope.lang]);}
                    else{
                        $scope.contactUsFormErrMsg = '';
                        showSuccessMsg($scope.titles.contactUs.msgSuccess[$scope.lang]);
                        $timeout(function() { $('#contactus').modal('hide')}, 1000);
                    }
                }
            );
        }
    }

/* --------------------------------------------------------------------------- */
$scope.sorting_command = function(colSelected){
    switch (colSelected){
        case 0: $scope.sortType_command = 'date'; break;
        case 1: $scope.sortType_command = 'cn'; break;
        case 2: $scope.sortType_command = 'payed'; break;
        case 3: $scope.sortType_command = 'sent'; break;
    }
    
    $scope.sortReverse_command = !$scope.sortReverse_command;
    for(var i=0;i<6;i++) $scope.glyphSort_command[i] = '';
    if(!$scope.sortReverse_command)
        $scope.glyphSort_command[colSelected] = 'glyphicon glyphicon-sort-by-attributes';
    else
        $scope.glyphSort_command[colSelected] = 'glyphicon glyphicon-sort-by-attributes-alt';
}

/* --------------------------------------------------------------------------- */
    $scope.sorting_user = function(colSelected){
        switch (colSelected){
            case 0: $scope.sortType_user = 'id'; break;
            case 1: $scope.sortType_user = 'lastname'; break;
            case 2: $scope.sortType_user = 'special'; break;
            case 3: $scope.sortType_user = 'active'; break;
        }
        
        $scope.sortReverse_user = !$scope.sortReverse_user;
        for(var i=0;i<5;i++) $scope.glyphSort_user[i] = '';
        if(!$scope.sortReverse_user)
            $scope.glyphSort_user[colSelected] = 'glyphicon glyphicon-sort-by-attributes';
        else
            $scope.glyphSort_user[colSelected] = 'glyphicon glyphicon-sort-by-attributes-alt';
    }

/* --------------------------------------------------------------------------- */
    $scope.sorting_message = function(colSelected){
        switch (colSelected){
            case 0: $scope.sortType_message = 'date'; break;
            case 1: $scope.sortType_message = 'name'; break;
            case 2: $scope.sortType_message = 'phone'; break;
            case 3: $scope.sortType_message = 'email'; break;
        }
        
        $scope.sortReverse_message = !$scope.sortReverse_message;
        for(var i=0;i<5;i++) $scope.glyphSort_message[i] = '';
        if(!$scope.sortReverse_message)
            $scope.glyphSort_message[colSelected] = 'glyphicon glyphicon-sort-by-attributes';
        else
            $scope.glyphSort_message[colSelected] = 'glyphicon glyphicon-sort-by-attributes-alt';
    }

/* --------------------------------------------------------------------------- */
    $scope.aiderSendEmail = function(txt){
        var url = "php/send_msg_email.php?msg="+txt;
        var request = $http({
            method: "post",
            url: url,
            headers: { "Content-Type": "application/json; charset=utf8" }
        });
        return request.then( function(response){if(response){console.log(response.data)};}, function(response){return response;} );
    }

/* --------------------------------------------------------------------------- */
    $scope.closeModal = function(modal){
        $(modal).modal('hide');
    }

/* --------------------------------------------------------------------------- */
    $scope.sendLinkForLostPassword = function(email){
        grPortalService.getUsers('{"username":"'+email+'"}').then(
            function(res){
                if(res.status!=200 || res.data.length==0){
                    if($scope.lang==0){
                        $scope.lostPasswordErrMessage = 'Email is not registered in our system!';
                    } else {
                        $scope.lostPasswordErrMessage = 'Email n\'est pas enregistré dans notre système!';
                    }
                }
                else{
                    var url = "php/retrive_password.php?e="+email+"&c="+res.data[0]._id.$oid;
                    var request = $http({
                        method: "post",
                        url: url,
                        headers: { "Content-Type": "application/json; charset=utf8" }
                    });
                    return request.then( 
                        function(response){
                            $scope.lostUsername = '';
                            if(response && response.data){
                                if($scope.lang==0){
                                    $scope.lostPasswordSuccMessage = 'An email sent to your mailbox. Please click on link and recover your password!';
                                } else {
                                    $scope.lostPasswordSuccMessage = 'Un email envoyé à votre boite mail. S\'il vous plaît cliquer sur le lien et récupérer votre mot de passe!';
                                }            
                                $timeout(function() { $scope.closeModal('#forgotPassModal')}, 5000);
                            } else {
                                $scope.lostPasswordErrMessage = $scope.titles.alerts.errorSendEmail[$scope.lang];          
                                $timeout(function() { $scope.closeModal('#forgotPassModal')}, 5000);
                            }
                        },
                        function(response){ return response; } 
                    );
                }
            });

    }

});

function scrollToAnchor(aid){
    var aTag = $("a[name='"+ aid +"']");
    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
}

function showSuccessMsg(q){
    $('.alarmMsg').text(q).css({'top':50}).show().delay(2500).hide(500);
}
