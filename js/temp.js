
    $scope.removeFilter = function(){
        $scope.filtered = '';
        $scope.showTeaGroup = 0;
        $scope.showLoader = true;
        grPortalService.getTeaModels().then(
            function(res){
                if(res.status!=200){
                    alert($scope.titles[$scope.lang][83]);}
                else{
                    $scope.tempTeaModels = res.data;
                    $timeout(function () { $scope.showLoader=false; }, 300);
                }
            },
            function(){
                alert('error in load tea models data from server!');
            }
        );
        $scope.itemsToShowCount = 10;
    }


    $scope.showThisProduct = function(tea){
        $scope.teaInfo = tea;
        $scope.order = tea.order;
    }


    $scope.confirmPurchase = function(){
        $scope.subTotal = [0,0,$scope.postalPrice,0,0];
        $scope.purchase = [];
        $scope.showLoader = true;
        $scope.tempTeaModels.forEach(element => {
            if(element.order){
                var temp = {"title":element.title, "price":element.price, "order":element.order, "sku":element.sku, "weight":"100gr"};
                $scope.purchase.push(temp);
                $scope.subTotal[0] += element.order*element.price;
            }
        });
        $scope.subTotal[1] = $scope.subTotal[0] * 14.975 / 100;
        $scope.subTotal[3] = $scope.subTotal[0] > 99.99 ? -$scope.postalPrice : 0;
        $scope.subTotal[4] = $scope.subTotal[0] + $scope.subTotal[1] + $scope.subTotal[2] + $scope.subTotal[3];
        $timeout(function () { $scope.showLoader=false; }, 300);
    }




    $scope.weedConfirm = function(){
        if($scope.weedBuyProcessStep<3){
            $scope.weedBuyProcessStep++;
        }
        if($scope.weedBuyProcessStep==3){
            $scope.showLoader = true;
            grPortalService.saveWeedFacteur($scope.weedFacteur).then(
                function(res){
                    if(res.status!=200){
                        alert($scope.titles[$scope.lang][83]);}
                    else{
                        $timeout(function () { $scope.showLoader=false; }, 300);
                        $scope.weedFacteur = {"client":{"id":"", "name":""},"date": "","products":[],"total":[0,$scope.postalPrice,0,0]};
                        $('#basketWeedModal').modal('toggle');
                    }
                },
                function(){alert('error in save the purchase in server!');}
            );
            $scope.weedBuyProcessStep = 0;
        }
    }


    $scope.weedConfirmBack = function(){
        $scope.weedBuyProcessStep--;
    }


    $scope.showThisWeed = function(weed){
        $scope.weedList = weed;
        $scope.weight = "0";
    }


    $scope.weedPlus1 = function(){
        if($scope.weedList.order[parseInt($scope.weight)]<9){
            $scope.weedList.order[parseInt($scope.weight)]+=1;
        }
    }


    $scope.weedMin1 = function(){
        if($scope.weedList.order[parseInt($scope.weight)]>0){
            $scope.weedList.order[parseInt($scope.weight)]-=1;
        }
    }


    $scope.addWeedToBasket = function(){
        var j,q,total=[0,$scope.postalPrice,0,0];
        var d = new Date();
        $scope.weedFacteur = {                
            "client":{"id":$scope.currentUser.id, 
                    "name":$scope.currentUser.lastname+', '+$scope.currentUser.name,
                    "adress":$scope.currentUser.adress,
                    "phone":$scope.phon},
            "date": d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(),
            "products":[],
            "total":[0,$scope.postalPrice,0,0],
            "confirm":{"money_date":"","sent_date":""}
        };
        $scope.showLoader = true;
        $scope.weed.forEach(element => {
            if(element._id.$oid==$scope.weedList._id.$oid){
                element = $scope.weedList;
            }
            for(var i=0;i<3;i++){
                if(element.order[i]){
                    switch(i) {
                        case 0: j=188;break;
                        case 1: j=189;break;
                        case 2: j=49;break;
                        default: j=0;break;
                    }
                    q = String.fromCharCode(j);
                    $scope.weedFacteur.products.push({"title":element.title, "price":element.price[i], "order":element.order[i], "id":element._id.$oid, "weight":q});
                    total[0] += element.price[i]*element.order[i];
                }
            }
        });
        $scope.weedFacteur.total[0] = total[0];
        $scope.weedFacteur.total[1] = $scope.postalPrice;
        $scope.weedFacteur.total[2] = total[0]>99.99 ? -$scope.postalPrice : 0;
        $scope.weedFacteur.total[3] = $scope.weedFacteur.total[0] + $scope.weedFacteur.total[1] + $scope.weedFacteur.total[2];
        $('#weedModal').modal('hide');
        $timeout(function () { $scope.showLoader=false; }, 300);
    }




    $scope.userInfo = [];  // information of all municipa...
    $scope.showInfo = "";   // info. about one munici...
    $scope.see_filter_bar = true; //show Filter-bar=t or no=f
    $scope.showHideFilter = "cacher";
    $scope.show_print_event_area = false;


    $scope.continentFilter = ''; // filtered by...

    // ------------------------------------------------------------------------------
// -- USERS ---------------------------------------------------------------------
// ------------------------------------------------------------------------------

// (for later) only if the client needs to filter from..to..
$scope.byRange = function (fieldName, minValue, maxValue) {
    if (minValue === undefined) minValue = Number.MIN_VALUE;
    if (maxValue === undefined) maxValue = Number.MAX_VALUE;
    return function predicateFunc(item) {
        return minValue <= item[fieldName] && item[fieldName] <= maxValue;
    };
};
// ------------------------------------------------------------------------------
$scope.byField = function (fieldName, value) {
    if (value === undefined) value = '';
    return function predicateFunc(item) {
        if(!value=='') return value in item[fieldName];
        else return "";
    };
};

$scope.pageSize_user = "99999";
$scope.itemToFullShow;
$scope.currentPage_user = 1;

$scope.glyphSort_user = [];  // glyphicon for sorting asc/desc
$scope.sortReverse_user  = true; // order by in DESC
$scope.glyphSort_user[0] = 'glyphicon glyphicon-sort-by-attributes';







$scope.sorting_user = function(colSelected){
    switch (colSelected){
        case 0: $scope.sortType_user = 'id'; break;
        case 1: $scope.sortType_user = 'lastname'; break;
        case 2: $scope.sortType_user = 'special'; break;
        case 3: $scope.sortType_user = 'active'; break;
    }
    
    $scope.sortReverse_user = !$scope.sortReverse_user;
    for(var i=0;i<10;i++) $scope.glyphSort_user[i] = '';
    if(!$scope.sortReverse_user)
        $scope.glyphSort_user[colSelected] = 'glyphicon glyphicon-sort-by-attributes';
    else
        $scope.glyphSort_user[colSelected] = 'glyphicon glyphicon-sort-by-attributes-alt';
}

$scope.full_show_user = function(item){
    $scope.itemToFullShow = Object.assign({}, item);
    $scope.showLoader = true;
    grPortalService.getDocsOfUser(item.id).then(
        function(res) { 
            if(res.status!=200){
                alert($scope.titles[$scope.lang][83]);}
            else{
                $timeout(function () { $scope.showLoader=false; }, 300);
                $scope.currentUserDocsTemp = res.data;
            }
        },
        function(){console.log('problem reading documents');}
    );     
}

$scope.saveUser = function(){
    var found = false;
    var i=0;
    while(!found && $scope.userInfo.length>=i){
        if($scope.userInfo[i].id==$scope.itemToFullShow.id){
            found = true;
            $scope.userInfo[i] = $scope.itemToFullShow;
            $.ajax({ url:'https://api.mlab.com/api/1/databases/greenportal/collections/users?apiKey='+$scope.dbApiKey+'&q={"id":'+$scope.itemToFullShow.id+'}',
                data: JSON.stringify({ "$set":{ "lastname":$scope.itemToFullShow.lastname,
                                                "name":$scope.itemToFullShow.name,
                                                "active":$scope.itemToFullShow.active,
                                                "special":$scope.itemToFullShow.special,
                                                "username":$scope.itemToFullShow.username } 
                }),
		        type: "PUT",
		        contentType: "application/json" }).then(
                    function successCallback(response) {
                        $('#show_info_user').modal('hide');
                    },
                    function errorCallback(response, err) {
                        alert(response.statusText);
                    }
                );
            }
        i++;
    }
    
}

// ------------------------------------------------------------------------------
// -- WEED ----------------------------------------------------------------------
// ------------------------------------------------------------------------------
$scope.pageSize_weed = "99999";
$scope.itemToFullShow_weed;
$scope.currentPage_weed = 1;

$scope.glyphSort_weed = [];  // glyphicon for sorting asc/desc
$scope.sortReverse_weed  = true; // order by in DESC
$scope.glyphSort_weed[0] = 'glyphicon glyphicon-sort-by-attributes';

$scope.sorting_weed = function(colSelected){
    switch (colSelected){
        case 0: $scope.sortType_weed = 'date'; break;
        case 1: $scope.sortType_weed = 'client.name'; break;
        case 2: $scope.sortType_weed = 'total[2]'; break;
        case 3: $scope.sortType_weed = 'confirm.money_date'; break;
        case 4: $scope.sortType_weed = 'confirm.sent_date'; break;
    }
    
    $scope.sortReverse_weed = !$scope.sortReverse_weed;
    for(var i=0;i<10;i++) $scope.glyphSort_weed[i] = '';
    if(!$scope.sortReverse_weed)
        $scope.glyphSort_weed[colSelected] = 'glyphicon glyphicon-sort-by-attributes';
    else
        $scope.glyphSort_weed[colSelected] = 'glyphicon glyphicon-sort-by-attributes-alt';
}

$scope.full_show_weed = function(item){
    $scope.itemToFullShow_weed = Object.assign({}, item);
}

$scope.saveWeed = function(){
    var found = false;
    var i=0;
    while(!found && $scope.weedInfo.length>=i){
        if($scope.weedInfo[i]._id.$oid==$scope.itemToFullShow_weed._id.$oid){
            found = true;
            $scope.weedInfo[i] = $scope.itemToFullShow_weed;
            $.ajax({ url:'https://api.mlab.com/api/1/databases/greenportal/collections/weedBill?q={"_id.$oid":'+$scope.itemToFullShow_weed._id.$oid+'}&apiKey',
                data: JSON.stringify({ "$set":{ "confirm.money_date":$scope.itemToFullShow_weed.confirm.money_date,
                                                "confirm.sent_date":$scope.itemToFullShow_weed.sent_date } 
                }),
		        type: "PUT",
		        contentType: "application/json" }).then(
                    function successCallback(response) {
                        $('#show_info_weed').modal('hide');
                    },
                    function errorCallback(response, err) {
                        alert(response.statusText);
                    }
                );
            }
        i++;
    }
    
}

// ------------------------------------------------------------------------------
$scope.full_show_tea = function(item){
    item.payed = new Date(item.payed);
    item.sent = new Date(item.sent);
    $scope.itemToFullShow_tea = Object.assign({}, item);
}
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------


$scope.saveUserProfile = function(){
    $scope.showLoader=true;
    grPortalService.updateUserInfo($scope.currentUser).then(
        function(res){
            if(res.status!=200){
                alert($scope.titles[$scope.lang][83]);}
            else{
                $timeout(function () { $scope.showLoader=false; }, 300);
                $scope.userProfileForm.$setPristine();
                $('#userProfileModal').modal('hide');
            }
        },
        function(){
            alert('Error save data');
        }
    );
}

$scope.saveUserConditions = function(){
    $scope.showLoader=true;
    grPortalService.updateUserInfo($scope.currentUser).then(
        function(res){
            if(res.status!=200){
                alert($scope.titles[$scope.lang][83]);}
            else{
                $timeout(function () { $scope.showLoader=false; }, 300);
                $scope.userProfileForm.$setPristine();
                $('#userProfileModal').modal('hide');
            }
        },
        function(){
            alert('Error save data');
        }
    );
}

$scope.uploadFile = function(e){
    var form_data = new FormData();
    var ext, no=0;
    $scope.showLoader=true;
    angular.forEach($scope.files, function(file){
        form_data.append('file', file);
        ext = file.name.split(".");
    });
    $timeout(function () { $scope.showLoader=false; }, 300);

    $scope.showLoader=true;
    grPortalService.getDocsOfUser($scope.currentUser.id).then(
        function (res) {
            if(res.status!=200){
                alert($scope.titles[$scope.lang][83]);}
            else{
                $timeout(function () { $scope.showLoader=false; }, 300);
                no = res.data.length;
            }
        }
    );

    var name = $scope.currentUser._id.$oid+'_'+no;
    $scope.showLoader=true;
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
                            }
                        );                                          
                    }, 
                    function () {
                        console.log('An error has occurred');
                    });
            }
        });
    $scope.showLoader=false;
}

$scope.removeImageFromProfile = function(image){
    $scope.showLoader=true;
    grPortalService.updateUserDocsInfo(image,'delete').then(
        function(res){
            if(res.status!=200){
                alert($scope.titles[$scope.lang][83]);}
            else{
                grPortalService.getDocsOfUser($scope.currentUser.id).then(
                    function (res) {
                        if(res.status!=200){
                            alert($scope.titles[$scope.lang][83]);}
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


$scope.showWeedFacteur_ToShow = function(order){
    $scope.orderToShow_weed = order;
}


$scope.saveTeaFacteurByAdm = function(){
    grPortalService.updateTeaFacteur($scope.itemToFullShow_tea).then(
        function(res){
            if(res.status!=200){ alert($scope.titles[$scope.lang][83]);}
            else{
                $timeout(function () { $scope.showLoader=false; }, 300);
                $('#show_info_tea').modal('hide');
            }
        },
        function(){
            alert($scope.titles[$scope.lang][83]);
        }
    );
}

$scope.printTeaFaceur = function(){
    var mywindow = window.open('', 'PRINT', 'height=600,width=1200');
    var prod = '';
    $scope.itemToFullShow_tea.products.forEach(
        function(e){
            prod += '<td style="text-align:right">'+e.title+'</td><td style="text-align:right">'+e.order+'</td><td style="text-align:right">'+e.weight+'</td>';
        }
    );

    mywindow.document.write('<div id="print_facteur_tea" style="font-family:"Noto Serif TC";font-size:16pt;margin:10pt;border:1pt solid #999999">'+
            '<p style="margin-bottom: .5cm">'+$scope.itemToFullShow_tea.date+'<br/>'+$scope.itemToFullShow_tea.client.name+'<br/>'+
            $scope.itemToFullShow_tea.client.adress+'</p>'+
            '<table style="width:12cm"><thead><tr border="1" style="text-align:center">'+
            '<th>'+$scope.titles[40].item[$scope.lang]+'</th><th style="width:2cm">'+$scope.titles[41].item[$scope.lang]+'</th><th style="width:3cm">'+$scope.titles[70].item[$scope.lang]+'</th>'+
            '</tr></thead><tbody><tr>'+prod+'</tr></tbody>'+
            '<thead>'+
            '<tr style="text-align:right"><th></th><th style="padding-top:1cm">'+$scope.titles[43].item[$scope.lang]+'</th><th style="padding-top:1cm">'+$scope.itemToFullShow_tea.total[0].toFixed(2)+' $</th></tr>'+
            '<tr style="text-align:right"><th></th><th>'+$scope.titles[78].item[$scope.lang]+'</th><th>'+$scope.itemToFullShow_tea.total[1].toFixed(2)+' $</th></tr>'+
            '<tr style="text-align:right"><th></th><th>'+$scope.titles[50].item[$scope.lang]+'</th><th>'+$scope.itemToFullShow_tea.total[2].toFixed(2)+' $</th></tr>'+
            '<tr style="text-align:right"><th></th><th>'+$scope.titles[76].item[$scope.lang]+'</th><th>'+$scope.itemToFullShow_tea.total[3].toFixed(2)+' $</th></tr>'+
            '<tr style="text-align:right"><th></th><th>'+$scope.titles[51].item[$scope.lang]+'</th><th>'+$scope.itemToFullShow_tea.total[4].toFixed(2)+' $</th></tr>'+
            '</thead></table></div>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10

    mywindow.print();
    mywindow.close();

    return true;}

    $scope.aiderSendEmail = function(txt){
        var url = "php/send_msg_email.php?msg="+txt+"&rec_email="+$scope.currentUser.username+
                              "&name="+$scope.currentUser.name+' '+$scope.currentUser.lastname;
        var request = $http({
            method: "post",
            url: url,
            headers: { "Content-Type": "application/json; charset=utf8" }
        });
        return request.then( function(response){if(response){console.log(response.data)};}, function(response){return response;} );
    }
    