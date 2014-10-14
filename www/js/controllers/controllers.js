angular.module('copay.controllers', [])

.controller('RegisterCtrl', function($scope, $state, $ionicLoading, Identity, Session) {
  $scope.profile = {};
  $scope.errors = [];

  $scope.submit = function(form) {
    if (!form.$valid) return;

    $ionicLoading.show({
      template: '<i class="icon ion-loading-c"></i> Creating profile...'
    });

    Identity.createProfile($scope.profile, function(err, identity, wallet) {
      $ionicLoading.hide();
      if(err) return $scope.errors = err;

      Session.signin(identity);
      $state.go('profile.wallet.home', {walletId: wallet.id});
    });
  };
})

.controller('LoginCtrl', function($scope, $state, $ionicLoading, Identity, Session) {
  $scope.profile = {};
  $scope.errors = [];

  $scope.submit = function(form) {
    if (!form.$valid) return;

    $ionicLoading.show({
      template: '<i class="icon ion-loading-c"></i> Opening profile...'
    });

    Identity.openProfile($scope.profile, function(err, identity, wallet) {
      $ionicLoading.hide();
      console.log(err);
      if (err) return $scope.error = err.message;

      Session.signin(identity);
      $state.go('profile.wallet.home', {walletId: wallet.id});
    })
  };
})

.controller('SetPinCtrl', function($scope, $state) {
  var PIN = null;
  $scope.digits = [];
  $scope.confirm = false;

  $scope.clear = function() {
    $scope.digits = [];
  };

  $scope.press = function(digit) {
    $scope.digits.push(digit);
    if ($scope.digits.length == 4) {
      return $scope.confirm ? onConfirm() : onPIN();
    }
  };

  function onPIN() {
    setPIN($scope.digits);
  }

  function onConfirm() {
    if (angular.equals(PIN, $scope.digits)) {
      return $state.go('profile.wallet.home', {walletId: 12});
    }

    setPIN(null);
  }

  function setPIN(pin) {
    PIN = pin;
    $scope.clear();
    $scope.confirm = !$scope.confirm;
  }
})

.controller('ProfileCtrl', function($scope, $state, Session, Wallets) {
  $scope.wallets = Wallets.all();
})

.controller('SidebarCtrl', function($scope, $state, Session, Wallets) {
  $scope.profile = Session.profile;
  $scope.wallets = Wallets.all();
})

.controller('WalletCtrl', function($scope, $state, $stateParams, Wallets) {
  $scope.wallet = Wallets.get($stateParams.walletId);
  console.log('Wallet:', $scope.wallet);

  // Inexistent Wallet, redirect to default one
  if (!$scope.wallet) {
    var defualtWallet = Wallets.all()[0];
    return $state.go('profile.wallet.home', {walletId: defualtWallet.id});
  }

})

.controller('AddCtrl', function($scope, $state, $ionicLoading, Wallets) {
  // Current limitations of multisig and transaction size
  var COPAYERS_LIMIT = 12;
  var THRESHOLD_LIMITS = [1, 2, 3, 4, 4, 3, 3, 2, 2, 2, 1, 1];

  $scope.data = {copayers: 1, threshold: 1}; // form defaults
  $scope.threshold = 1;

  $scope.create = function(form) {
    if (!form.$valid) return;

    $ionicLoading.show({
      template: '<i class="icon ion-loading-c"></i> Creating wallet...'
    });

    Wallets.create($scope.data, function onResult(err, wallet){
      $ionicLoading.hide();
      if (err) throw err;
      return $state.go('profile.wallet.home', {walletId: wallet.id});
    });
  };

  $scope.join = function(form) {
    if (!form.$valid) return;

    $ionicLoading.show({
      template: '<i class="icon ion-loading-c"></i> Joining wallet...'
    });

    console.log('SECRET', $scope.data.secret);
    Wallets.join($scope.data.secret, function onResult(err, wallet){
      $ionicLoading.hide();
      if (err) throw err;
      return $state.go('profile.wallet.home', {walletId: wallet.id});
    });
  };

  // Update threshold and selected value
  $scope.$watch('data.copayers', function(copayers) {
    $scope.threshold = THRESHOLD_LIMITS[copayers-1];
    $scope.data.threshold = Math.min(parseInt($scope.data.copayers/2+1), $scope.threshold);
  });
})

.controller('HomeCtrl', function($scope, $state) {
  $scope.copayers = $scope.wallet.getRegisteredPeerIds(); // TODO: Rename method to getCopayers
  $scope.remaining = $scope.wallet.publicKeyRing.remainingCopayers(); // TODO: Expose on Wallet
})

.controller('ReceiveCtrl', function($scope, $state) {
})

.controller('SendCtrl', function($scope, $state) {
})

.controller('HistoryCtrl', function($scope, $state) {
  $scope.transactions = [
    {time: new Date() - 1000 * 60 * 60 * 24 * 3, value: 0.232},
    {time: new Date() - 1000 * 60 * 60 * 24 * 8, value: -0.1},
    {time: new Date() - 1000 * 60 * 60 * 24 * 12, value: 1.5}
  ]
})