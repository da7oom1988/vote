var app = angular.module('vote',['ngRoute','ngCookies']);

app.config(function($routeProvider,$locationProvider){
    $routeProvider
        .when("/",{
            templateUrl: 'pages/home.html',
            controller: 'homeCtrl'
        }).when("/login",{
            templateUrl: 'pages/login.html',
            controller: 'loginCtrl'
        }).when('/signup',{
             templateUrl: 'pages/signup.html',
            controller: 'signupCtrl'
        }).when('/newpoll',{
             templateUrl: 'pages/newpoll.html',
            controller: 'newpollCtrl'
        }).when('/vote/:id',{
             templateUrl: 'pages/vote.html',
             controller: 'voteCtrl'
        }).when('/mypolls',{
             templateUrl: 'pages/mypolls.html',
             controller: 'mypollsCtrl'
        }).when('/showpoll/:id',{
             templateUrl: 'pages/showpoll.html',
             controller: 'showpollCtrl'
        });
});



app.run(function($rootScope, $cookies){
    if($cookies.get('token') && $cookies.get('currUser')){
        $rootScope.token = $cookies.get('token');
        $rootScope.currUser = $cookies.get('currUser');
    }
});

app.controller('mypollsCtrl',["$scope","$http","$location",'$cookies','$rootScope',function($scope,$http,$location,$cookies,$rootScope){

    $http.get('/api/mypolls').then(function(res){
        console.log(res);
        $scope.polls = res.data;
    });

}]);


app.controller('showpollCtrl',["$scope","$http","$location",'$cookies','$rootScope','$routeParams',function($scope,$http,$location,$cookies,$rootScope,$routeParams){
        
    $http.get('/api/getpoll/' + $routeParams.id).then(function(res){
        $scope.poll = res.data;
        $scope.total = 0;
        $scope.prec = [];
        for(var i =0 ; i < $scope.poll.result.length ; i++){
            $scope.total += $scope.poll.result[i];         
        }
        for(var i =0 ; i < $scope.poll.result.length ; i++){
            $scope.prec.push(Math.floor(($scope.poll.result[i] / $scope.total) * 100));       
        }
       
        var ctx = document.getElementById("myChart");
        var myChart = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: $scope.poll.options,
                datasets: [{
                    label: $scope.poll.qustion,
                    data: $scope.prec,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });


    });

}]);


app.controller('voteCtrl',["$scope","$http","$location",'$cookies','$rootScope','$routeParams',function($scope,$http,$location,$cookies,$rootScope,$routeParams){
    $http.get('/api/getpoll/' + $routeParams.id).then(function(res){
        $scope.vote = res.data;
         console.log($scope.vote);
    });

    $scope.voteNow = function(index){
         $http.post('/api/getpoll/' + $routeParams.id , {result: index} ).then(function(res){
            $scope.done = true;
        });

    }

}]);



app.controller('homeCtrl',["$scope","$http","$location",'$cookies','$rootScope',function($scope,$http,$location,$cookies,$rootScope){


    $scope.logout = function(){
            $cookies.remove('token');
            $cookies.remove('currUser');
            $rootScope.token = null;
            $rootScope.currUser = null;
            window.location.reload();
    };

    $http.get('/api/polls').then(function(res){
        console.log(res);
        $scope.polls = res.data;
    });



}]);

app.controller('newpollCtrl',["$scope","$http","$location",'$cookies','$rootScope',function($scope,$http,$location,$cookies,$rootScope){    
    $scope.poll = {};
    $scope.poll.public = 'true';
    $scope.poll.options = [{option:""},{option:""}];

     $scope.addOption = function(){
        $scope.poll.options.push({option:""});
     };

     $scope.createPoll = function(){
         if($scope.poll.qustion &&  $rootScope.token && $scope.poll.options ){
                var arr = [];
                var result = [];
                for(var i = 0 ; i < $scope.poll.options.length ; i++){
                    if($scope.poll.options.length[i] != ""){
                        arr.push($scope.poll.options[i].option);
                    }

                }
                for(var i = 0 ; i < arr.length ; i++){
                    result.push(0);
                }
                var data = {
                    qustion: $scope.poll.qustion,
                    token: $rootScope.token,
                    public: ($scope.poll.public),
                    options: arr,
                    result: result
                }
                
                $http.post('/api/newpoll', data).then(function(res){
                    $scope.pollUrl =  '/vote/' +  res.data;
                });

         }else if(!$rootScope.token) return alert("Please log in or sign up ");
         else return alert("Please check your Input");
       
     };


}]);

app.controller('loginCtrl',["$scope","$http","$location",'$cookies','$rootScope',function($scope,$http,$location,$cookies,$rootScope){
    $scope.user = {};
    $scope.login = function(){
        if($scope.user.email && $scope.user.password ){
            $http.post('/api/login',$scope.user).then(function(res){
                $cookies.put('token',res.data.token);
                $cookies.put('currUser',res.data.currUser);
                $rootScope.token = res.data.token;
                $rootScope.currUser = res.data.currUser;
                $location.path('/');
            },function(err){
                alert("Faild to log in!!!");
            });

        }  
    }

}]);

app.controller('signupCtrl',["$scope","$http","$location",function($scope,$http,$location){
    
    $scope.user = {};
    $scope.signup = function(){
        if($scope.user.name && $scope.user.email && $scope.user.username && $scope.user.password ){
            $http.post('/api/signup',$scope.user).then(function(res){
                $location.path('/');
             });
        }  
    }
   
}]);