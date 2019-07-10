app.service('grPortalService', function($http, $q) {
    const dbApiKey = "JIZlGld1NOk4SsznMiAvb78pr7zzAjom";
    return({
        getTeaTypes: function() {
            var url = 'https://api.mlab.com/api/1/databases/greenportal/collections/teaTypes?apiKey='+dbApiKey;
            var request = $http({
                method: "get",
                url: url
            });
            return request.then( function(response){return response;}, function(){return response;} );
        },
        getTeaModels: function(){
            var url = 'https://api.mlab.com/api/1/databases/greenportal/collections/teaModels?apiKey='+dbApiKey;
            var request = $http({
                method: "get",
                url: url
            });
            return request.then( function(response){return response;}, function(){return response;} );
        },
        getTeaFacteurs: function(filter){
            var url = 'https://api.mlab.com/api/1/databases/greenportal/collections/teaBill?q='+filter+'&apiKey='+dbApiKey;
            var request = $http({
                method: "get",
                url: url
            });
            return request.then( function(response){return response;}, function(){return;} );
        },
        getWeeds: function(){
            var url = 'https://api.mlab.com/api/1/databases/greenportal/collections/weed?apiKey='+dbApiKey;
            var request = $http({
                method: "get",
                url: url
            });
            return request.then( function(response){return response;}, function(){return;} );
        },
        getUsers: function(cond){
            url = 'https://api.mlab.com/api/1/databases/greenportal/collections/users?q='+cond+'&apiKey='+dbApiKey;
            var request = $http({
                method: "get",
                url: url
            });
            return request.then( function(response){return response;}, function(res){return res;} );
        },
        getDocsOfUser: function(id){
            url = 'https://api.mlab.com/api/1/databases/greenportal/collections/docs?q={"owner":'+id+'}&apiKey='+dbApiKey;
            var request = $http({
                method: "get",
                url: url
            });
            return request.then( function(response){return response;}, function(){return 'err';} );
        },
        sendEmail: function(receiver, message){
            url = 'php/send_msg_email.php';
            var request = $http({
                method: "post",
                url: url,
                data: JSON.stringify({"email": receiver,"message": message}),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            return request.then( function(response){return response;}, function(){return;} );
        },
        saveTeaFacteur: function(order){
            url = 'https://api.mlab.com/api/1/databases/greenportal/collections/teaBill?apiKey='+dbApiKey;
            var request = $http({
                method: "post",
                url: url,
                data: JSON.stringify(order),
                headers: { "Content-Type": "application/json; charset=utf8" }
            });
            return request.then( function(response){return response;}, function(response){return response;} );
        },
        updateUserDocsInfo: function(doc,type){
            if(type=='new'){
                url = 'https://api.mlab.com/api/1/databases/greenportal/collections/docs?apiKey='+dbApiKey;
                var request = $http({
                    method: "post",
                    url: url,
                    data: JSON.stringify(doc),
                    headers: { "Content-Type": "application/json; charset=utf8" }
                });
            }
            if(type=='delete'){
                var 
                url = 'https://api.mlab.com/api/1/databases/greenportal/collections/docs/'+doc._id.$oid+'?q={"active":true}&apiKey='+dbApiKey;
                var request = $http({
                    method: "put",
                    url: url,
                    data: JSON.stringify({"active":false, "owner":doc.owner, "name":doc.name}),
                    headers: { "Content-Type": "application/json; charset=utf8" }
                });
            }
            return request.then( function(response){return response;}, function(response){return response;} );
        },
        updateUserInfo: function(user){
            url = 'https://api.mlab.com/api/1/databases/greenportal/collections/users/'+user._id.$oid+'?apiKey='+dbApiKey;
            var request = $http({
                method: "put",
                url: url,
                data: JSON.stringify({
                    "active": user.active,
                    "adress": user.adress,
                    "confirm": user.confirm,
                    "date": user.date,
                    "id": user.id,
                    "lastname": user.lastname,
                    "name": user.name,
                    "password": user.password,
                    "phone": user.phone,
                    "special": user.special,
                    "type": user.type,
                    "username": user.username,
                    "condition": user.condition,
                    "province": user.province,
                    "city": user.city,
                    "province": user.province,
                    "cp": user.cp
                }),
                headers: { "Content-Type": "application/json; charset=utf8" }
            });
            return request.then( function(response){return response;}, function(response){return response;} );
        },

// --------------------------------------------------------------------------------        
        getProductsGroup: function() {
            var url = 'https://api.mlab.com/api/1/databases/greenportal/collections/products_group?&apiKey='+dbApiKey;
            var request = $http({
                method: "get",
                url: url
            });
            return request.then( function(response){return response;}, function(){return response} );
        },
        getProducts: function() {
            var url = 'https://api.mlab.com/api/1/databases/greenportal/collections/products?&apiKey='+dbApiKey;
            var request = $http({
                method: "get",
                url: url
            });
            return request.then( function(response){return response;}, function(){return response} );
        },
        saveFacteur: function(order){
            url = 'https://api.mlab.com/api/1/databases/greenportal/collections/bill?apiKey='+dbApiKey;
            var request = $http({
                method: "post",
                url: url,
                data: JSON.stringify(order),
                headers: { "Content-Type": "application/json; charset=utf8" }
            });
            return request.then( function(response){return response;}, function(response){return response;} );
        },
        getFacteurs: function(filter){
            var url = 'https://api.mlab.com/api/1/databases/greenportal/collections/bill?q='+filter+'&apiKey='+dbApiKey;
            var request = $http({
                method: "get",
                url: url
            });
            return request.then( function(response){return response;}, function(){return;} );
        },
        getFacteursCount: function () {
            var url = 'https://api.mlab.com/api/1/databases/greenportal/collections/bill?&apiKey=' + dbApiKey;
            var request = $http({
                method: "get",
                url: url
            });
            return request.then(function (response) {
                return response;
            }, function () {
                return;
            });
        },
        updateFacteur: function(order){ 
            var p = []; 
            order.products.forEach(
                function(e){
                    if(e.no>0){
                        p.push({"id":e.id,"name":e.name,"price":e.price,"no":e.no,"weight":e.weight});
                    }
                }
            );
            url = 'https://api.mlab.com/api/1/databases/greenportal/collections/bill/'+order._id.$oid+'?apiKey='+dbApiKey;
            var request = $http({
                method: "put",
                url: url,
                data: JSON.stringify({
                    "client": order.client,
                    "products": p,
                    "date": order.date,
                    "payed": order.payed,
                    "sent": order.sent,
                    "total": order.total,
                    "trackno": order.trackno,
                    "cn": order.cn
                }),
                headers: { "Content-Type": "application/json; charset=utf8" }
            });
            return request.then( function(response){return response;}, function(response){return response;} );
        },
        deleteFacteur: function(order){ 
            url = 'https://api.mlab.com/api/1/databases/greenportal/collections/bill/'+order+'?apiKey='+dbApiKey;
            var request = $http({
                method: "delete",
                url: url,
                success: function () {return true},
                error: function (xhr, status, err) {return false} 
            });
            return request.then( function(response){return response;}, function(){return;} );
        },
        saveMessage: function(msg){
            url = 'https://api.mlab.com/api/1/databases/greenportal/collections/messages?apiKey='+dbApiKey;
            var request = $http({
                method: "post",
                url: url,
                data: JSON.stringify(msg),
                headers: { "Content-Type": "application/json; charset=utf8" }
            });
            return request.then( function(response){return response;}, function(response){return response;} );
        },
        getMessages: function(filter){
            var url = 'https://api.mlab.com/api/1/databases/greenportal/collections/messages?q='+filter+'&apiKey='+dbApiKey;
            var request = $http({
                method: "get",
                url: url
            });
            return request.then( function(response){return response;}, function(){return;} );
        },

    });
});
