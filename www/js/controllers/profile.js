'use strict'

angular.module('copay.controllers')

.controller('ProfileCtrl', function($scope, $cordovaSocialSharing, Session, Config) {

  $scope.unit = Config.currency.btc;
  $scope.fiat = Config.currency.fiat;

  $scope.updateUnit = function(scope) {
    console.log('Saving!');
    Config.currency.btc = scope.unit;
    Config.savePreferences();
  };

  $scope.updateFiat = function(scope) {
    Config.currency.fiat = scope.fiat;
    Config.savePreferences();
    console.log('Saving!');
  };

  $scope.backup = function() {

    var identity = Session.identity;
    var file = identity.exportEncryptedWithWalletInfo(identity.password);
    var filename = identity.email + '-profile.json';

    $cordovaSocialSharing.shareViaEmail(
      'Here is your encrypted backup for the profile ' + identity.email,
      'Copay - Profile Backup',
      [identity.email],
      file
    );

  };

});
