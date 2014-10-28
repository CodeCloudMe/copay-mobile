'use strict'

angular.module('copay.controllers')

.controller('SidebarCtrl', function($scope, $state, $window, $cordovaBarcodeScanner, $ionicModal, $ionicPopup, Session, Wallets, Notifications) {
  $scope.profile = Session.profile;
  $scope.wallets = Wallets.all();

  $scope.$on('new-wallet', function(ev) {
    $scope.wallets = Wallets.all();
  });

  $scope.openCamera = function() {

    if (!$window.cordova) {
      var data = $window.prompt("Insert scanned data");
      return data ? onScann(data) : onError(null);
    }

    $cordovaBarcodeScanner.scan().then(onCamera, onError);

    // TODO: Should this belong to a Camera Service ?
    function onCamera(result) {
      if (result.cancelled) {
        // Copyrighted Hack: http://marsbomber.com/2014/05/29/BarcodeScanner-With-Ionic/
        $ionicModal.fromTemplate('').show().then(function() {
          $ionicPopup.alert({
            title: 'QR Scan Cancelled',
            template: 'You cancelled it!'
          });
        });
      } else {
        onScann(result.text);
      }
    }

    function onScann(data) {
      var copay = require('copay');
      if (copay.Wallet.decodeSecret(data)) {
        return $state.go('profile.add', { secret: data });
      }

      // Check if its an Bitcoin Address
      $state.go('profile.wallet.send', {
        walletId: Session.currentWallet.id,
        data: data
      });
    }

    function onError(error) {
      Notifications.toast("Nothing to scann there");
    }

  };
})

.controller('TabsCtrl', function($scope, $state, $stateParams, Session, Wallets, Proposals) {
  $scope.wallet = Session.currentWallet = Wallets.get($stateParams.walletId);

  $scope.pendingProposals = function() {
    if (!$scope.wallet || !$scope.wallet.isShared()) return 0;
    return Proposals.filter($scope.wallet, { status: Proposals.STATUS.pending }).length;
  };

  // Inexistent Wallet, redirect to default one
  if (!$scope.wallet) {
    var defualtWallet = Wallets.all()[0]; // TODO: Use last opened wallet
    return $state.go('profile.wallet.home', {walletId: defualtWallet.id});
  }


});
